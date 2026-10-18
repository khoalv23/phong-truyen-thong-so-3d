import fs from "node:fs";
import * as THREE from "../../../../../../assets/module/three.module.js";
import { IDEA_TREE_FRAMES } from "../../../../scripts/idea-tree/idea-tree.data.js";

const file = "scene/scene-4/assets/models/idea-tree/idea-tree-production.glb";
const bytes = fs.readFileSync(file);
const jsonLength = bytes.readUInt32LE(12);
const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trim());
const binStart = 20 + jsonLength + 8;
const bin = bytes.subarray(binStart);

const FRAME_TYPES = {
  FRAME_TRUNK: { w: 1.22, h: 0.88 },
  FRAME_BRANCH: { w: 1.04, h: 0.74 },
  FRAME_HANGING: { w: 0.88, h: 0.64 }
};

function typeSize(type) {
  return { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[type];
}

function accessorArray(index) {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor.bufferView];
  const byteOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const count = accessor.count * typeSize(accessor.type);
  const start = bin.byteOffset + byteOffset;
  if (accessor.componentType === 5126) return new Float32Array(bin.buffer, start, count);
  if (accessor.componentType === 5123) return new Uint16Array(bin.buffer, start, count);
  if (accessor.componentType === 5125) return new Uint32Array(bin.buffer, start, count);
  throw new Error(`Unsupported component type ${accessor.componentType}`);
}

function imageBytes(image) {
  const view = json.bufferViews[image.bufferView];
  return bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
}

function pngSize(data) {
  if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4e || data[3] !== 0x47) return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const objects = json.nodes.map((node, index) => {
  const obj = new THREE.Object3D();
  obj.name = node.name || `Node_${index}`;
  obj.userData.nodeIndex = index;
  if (node.translation) obj.position.fromArray(node.translation);
  if (node.rotation) obj.quaternion.fromArray(node.rotation);
  if (node.scale) obj.scale.fromArray(node.scale);
  if (node.matrix) new THREE.Matrix4().fromArray(node.matrix).decompose(obj.position, obj.quaternion, obj.scale);
  return obj;
});
json.nodes.forEach((node, index) => (node.children || []).forEach(child => objects[index].add(objects[child])));
const root = new THREE.Group();
(json.scenes[json.scene || 0].nodes || []).forEach(index => root.add(objects[index]));
root.updateWorldMatrix(true, true);

function meshBox(meshIndex) {
  const box = new THREE.Box3();
  for (const primitive of json.meshes[meshIndex].primitives || []) {
    const pos = accessorArray(primitive.attributes.POSITION);
    for (let i = 0; i < pos.length; i += 3) box.expandByPoint(new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]));
  }
  return box;
}

const meshBoxes = json.meshes.map((_, index) => meshBox(index));
const rootBox = new THREE.Box3();
const treeMassBoxes = [];
root.traverse(obj => {
  const node = json.nodes[obj.userData.nodeIndex];
  if (!node || node.mesh === undefined) return;
  const box = meshBoxes[node.mesh].clone().applyMatrix4(obj.matrixWorld);
  rootBox.union(box);
  if (/Trunk|Branch|Root/i.test(obj.name)) treeMassBoxes.push({ name: obj.name, box });
});
const size = new THREE.Vector3();
rootBox.getSize(size);

function fmtVector(v) {
  return v.toArray().map(value => Number(value.toFixed(3)));
}

function fmtBox(box) {
  const s = new THREE.Vector3();
  box.getSize(s);
  return { min: fmtVector(box.min), max: fmtVector(box.max), size: fmtVector(s) };
}

const p = new THREE.Vector3();
const q = new THREE.Quaternion();
const scale = new THREE.Vector3();
const zAxis = new THREE.Vector3(0, 0, 1);
const frameSummaries = IDEA_TREE_FRAMES.map(item => {
  const anchor = root.getObjectByName(item.anchor);
  if (!anchor) return { id: item.id, anchor: item.anchor, found: false };
  anchor.updateWorldMatrix(true, false);
  anchor.getWorldPosition(p);
  if (item.positionOffset) p.add(new THREE.Vector3(item.positionOffset[0] || 0, item.positionOffset[1] || 0, item.positionOffset[2] || 0));
  anchor.getWorldQuaternion(q);
  anchor.getWorldScale(scale);
  const facing = zAxis.clone().applyQuaternion(q).normalize();
  const spec = FRAME_TYPES[item.frameType] || FRAME_TYPES.FRAME_BRANCH;
  const frameScale = item.scale || 1;
  const halfW = (spec.w * frameScale) / 2;
  const halfH = (spec.h * frameScale) / 2;
  const frameBox = new THREE.Box3(
    new THREE.Vector3(p.x - halfW, p.y - halfH, p.z - 0.06),
    new THREE.Vector3(p.x + halfW, p.y + halfH, p.z + 0.06)
  );
  const intersectingMass = treeMassBoxes.filter(entry => entry.box.intersectsBox(frameBox)).map(entry => entry.name);
  return {
    id: item.id,
    type: item.frameType,
    anchor: item.anchor,
    found: true,
    position: fmtVector(p),
    quaternion: fmtVector(q),
    scale: fmtVector(scale),
    determinant: Number(anchor.matrixWorld.determinant().toFixed(3)),
    facing: fmtVector(facing),
    facingVisitor: facing.z > 0.65,
    broadPhaseMeshIntersections: intersectingMass
  };
});

const frameOverlaps = [];
for (let i = 0; i < frameSummaries.length; i++) {
  for (let j = i + 1; j < frameSummaries.length; j++) {
    const a = frameSummaries[i];
    const b = frameSummaries[j];
    if (!a.found || !b.found) continue;
    const dx = Math.abs(a.position[0] - b.position[0]);
    const dy = Math.abs(a.position[1] - b.position[1]);
    if (dx < 1.15 && dy < 0.9) frameOverlaps.push([a.id, b.id]);
  }
}

const materialAudit = (json.materials || []).map((material, index) => ({
  index,
  name: material.name,
  baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
  normalTexture: material.normalTexture?.index ?? null,
  roughnessTexture: material.pbrMetallicRoughness?.metallicRoughnessTexture?.index ?? null,
  metallicFactor: material.pbrMetallicRoughness?.metallicFactor ?? 1,
  roughnessFactor: material.pbrMetallicRoughness?.roughnessFactor ?? null,
  alphaMode: material.alphaMode || "OPAQUE",
  doubleSided: Boolean(material.doubleSided)
}));

const textureAudit = (json.images || []).map((image, index) => {
  const data = imageBytes(image);
  return {
    index,
    name: image.name,
    mimeType: image.mimeType,
    bytes: data.length,
    ...pngSize(data)
  };
});

const meshNames = (json.meshes || []).map(mesh => mesh.name || "");
const treeMassCast = meshNames.filter(name => /Trunk|Branch|Root/i.test(name));

function drawCallCategory(name) {
  if (/Trunk|Root/i.test(name)) return "trunk/root";
  if (/Branch/i.test(name)) return "main/secondary branches";
  if (/Leaf|Foliage|Sphere/i.test(name)) return "foliage";
  if (/Rope|Cord|Wire/i.test(name)) return "ropes";
  if (/Frame|Cube/i.test(name)) return "frames";
  if (/Image|Photo|Plane/i.test(name)) return "image planes";
  return "other";
}

const drawCallsByNode = (json.meshes || []).map((mesh, index) => ({
  index,
  name: mesh.name || `Mesh_${index}`,
  category: drawCallCategory(mesh.name || ""),
  primitives: mesh.primitives.length,
  triangles: mesh.primitives.reduce((sum, primitive) => sum + json.accessors[primitive.indices].count / 3, 0),
  materials: mesh.primitives.map(primitive => json.materials?.[primitive.material]?.name || `Material_${primitive.material}`)
}));

const drawCallsByCategory = drawCallsByNode.reduce((groups, entry) => {
  if (!groups[entry.category]) groups[entry.category] = { drawCalls: 0, meshes: 0, triangles: 0, nodes: [] };
  groups[entry.category].drawCalls += entry.primitives;
  groups[entry.category].meshes += 1;
  groups[entry.category].triangles += entry.triangles;
  groups[entry.category].nodes.push(entry.name);
  return groups;
}, {});

const missingRopeTopAnchors = IDEA_TREE_FRAMES
  .filter(item => item.frameType === "FRAME_HANGING" && item.ropeTopAnchor && !root.getObjectByName(item.ropeTopAnchor))
  .map(item => item.ropeTopAnchor);

const ropeTopTransforms = IDEA_TREE_FRAMES
  .filter(item => item.frameType === "FRAME_HANGING")
  .map(item => {
    const ropeTop = item.ropeTopAnchor ? root.getObjectByName(item.ropeTopAnchor) : null;
    const frameAnchor = root.getObjectByName(item.anchor);
    if (!ropeTop || !frameAnchor) return { id: item.id, ropeTop: item.ropeTopAnchor, found: false };
    const rp = new THREE.Vector3();
    const fp = new THREE.Vector3();
    const rq = new THREE.Quaternion();
    const rs = new THREE.Vector3();
    ropeTop.updateWorldMatrix(true, false);
    frameAnchor.updateWorldMatrix(true, false);
    ropeTop.getWorldPosition(rp);
    frameAnchor.getWorldPosition(fp);
    ropeTop.getWorldQuaternion(rq);
    ropeTop.getWorldScale(rs);
    return {
      id: item.id,
      ropeTop: item.ropeTopAnchor,
      frameAnchor: item.anchor,
      found: true,
      position: fmtVector(rp),
      quaternion: fmtVector(rq),
      scale: fmtVector(rs),
      determinant: Number(ropeTop.matrixWorld.determinant().toFixed(3)),
      distanceToFrameAnchor: Number(rp.distanceTo(fp).toFixed(3)),
      heightDelta: Number((rp.y - fp.y).toFixed(3))
    };
  });

console.log(JSON.stringify({
  stats: {
    nodes: json.nodes.length,
    meshes: json.meshes.length,
    triangles: json.meshes.reduce((sum, mesh) => sum + mesh.primitives.reduce((inner, primitive) => inner + json.accessors[primitive.indices].count / 3, 0), 0),
    materials: json.materials?.length || 0,
    textures: json.textures?.length || 0,
    estimatedDrawCalls: json.meshes.reduce((sum, mesh) => sum + mesh.primitives.length, 0)
  },
  drawCallsByCategory,
  drawCallsByNode,
  bounds: fmtBox(rootBox),
  textureAudit,
  materialAudit,
  shadowModes: {
    none: { castShadowMeshes: 0 },
    treeMass: { castShadowMeshes: treeMassCast.length, meshes: treeMassCast },
    all: { castShadowMeshes: json.meshes.length }
  },
  frames: frameSummaries,
  frameOverlaps,
  missingRopeTopAnchors,
  ropeTopTransforms,
  ropeAudit: frameSummaries
    .filter(frame => frame.type === "FRAME_HANGING")
    .map(frame => ({
      id: frame.id,
      anchor: frame.anchor,
      status: missingRopeTopAnchors.length
        ? "runtime rope is independent in frame layer; missing RopeTop uses preview fixed offset"
        : "runtime rope is independent in frame layer; RopeTop GLB anchor available"
    }))
}, null, 2));

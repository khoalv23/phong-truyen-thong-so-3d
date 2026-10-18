import fs from "node:fs";
import * as THREE from "../../../../../../assets/module/three.module.js";

const file = process.argv[2] || "scene/scene-4/assets/models/idea-tree/idea-tree-validation.glb";
const bytes = fs.readFileSync(file);
const jsonLength = bytes.readUInt32LE(12);
const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trim());
const binStart = 20 + jsonLength + 8;
const bin = bytes.subarray(binStart);

function componentSize(type) {
  return { 5126: 4, 5123: 2, 5125: 4 }[type];
}

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

function buildScene() {
  const objects = json.nodes.map((node, index) => {
    const obj = new THREE.Object3D();
    obj.name = node.name || `Node_${index}`;
    if (node.translation) obj.position.fromArray(node.translation);
    if (node.rotation) obj.quaternion.fromArray(node.rotation);
    if (node.scale) obj.scale.fromArray(node.scale);
    if (node.matrix) new THREE.Matrix4().fromArray(node.matrix).decompose(obj.position, obj.quaternion, obj.scale);
    return obj;
  });
  json.nodes.forEach((node, index) => (node.children || []).forEach(child => objects[index].add(objects[child])));
  const root = new THREE.Group();
  json.scenes[json.scene || 0].nodes.forEach(index => root.add(objects[index]));
  return root;
}

let triangles = 0;
const box = new THREE.Box3();
const geometryAudit = [];
json.meshes.forEach(mesh => {
  mesh.primitives.forEach(primitive => {
    triangles += json.accessors[primitive.indices].count / 3;
    const pos = accessorArray(primitive.attributes.POSITION);
    const normals = primitive.attributes.NORMAL !== undefined ? accessorArray(primitive.attributes.NORMAL) : null;
    const idx = accessorArray(primitive.indices);
    for (let i = 0; i < pos.length; i += 3) box.expandByPoint(new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]));
    let frontFaceOk = null;
    if (normals && idx.length >= 3) {
      const a = idx[0] * 3, b = idx[1] * 3, c = idx[2] * 3;
      const pa = new THREE.Vector3(pos[a], pos[a + 1], pos[a + 2]);
      const pb = new THREE.Vector3(pos[b], pos[b + 1], pos[b + 2]);
      const pc = new THREE.Vector3(pos[c], pos[c + 1], pos[c + 2]);
      const face = new THREE.Vector3().crossVectors(pb.sub(pa), pc.sub(pa)).normalize();
      const normal = new THREE.Vector3(normals[a], normals[a + 1], normals[a + 2]).normalize();
      frontFaceOk = face.dot(normal) > 0.35;
    }
    geometryAudit.push({
      mesh: mesh.name,
      hasNormal: Boolean(normals),
      frontFaceOk
    });
  });
});
const size = new THREE.Vector3();
box.getSize(size);

const root = buildScene();
const placement = new THREE.Group();
placement.position.set(1.2, 0.4, 77.545);
placement.rotation.y = Math.PI + 0.35;
placement.scale.setScalar(1.35);
placement.add(root);
placement.updateWorldMatrix(true, true);

const anchors = [
  "Anchor_Trunk_01", "Anchor_Trunk_02", "Anchor_Branch_L_01", "Anchor_Branch_L_02",
  "Anchor_Branch_R_01", "Anchor_Branch_R_02", "Anchor_Hanging_01", "Anchor_Hanging_02",
  "Anchor_Hanging_03", "Anchor_Hanging_04"
];
const p = new THREE.Vector3();
const q = new THREE.Quaternion();
const s = new THREE.Vector3();
const anchorTransforms = anchors.map(name => {
  const obj = root.getObjectByName(name);
  obj.getWorldPosition(p);
  obj.getWorldQuaternion(q);
  obj.getWorldScale(s);
  return {
    name,
    position: p.toArray().map(v => Number(v.toFixed(3))),
    quaternion: q.toArray().map(v => Number(v.toFixed(3))),
    scale: s.toArray().map(v => Number(v.toFixed(3))),
    determinant: Number(obj.matrixWorld.determinant().toFixed(3))
  };
});

console.log(JSON.stringify({
  nodes: json.nodes.length,
  meshes: json.meshes.length,
  triangles,
  materials: json.materials?.length || 0,
  textures: json.textures?.length || 0,
  images: json.images?.length || 0,
  drawCallsEstimate: json.meshes.reduce((sum, mesh) => sum + mesh.primitives.length, 0),
  bounds: {
    min: box.min.toArray().map(v => Number(v.toFixed(3))),
    max: box.max.toArray().map(v => Number(v.toFixed(3))),
    size: size.toArray().map(v => Number(v.toFixed(3)))
  },
  materials: (json.materials || []).map(material => ({
    name: material.name,
    baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
    normalTexture: material.normalTexture?.index ?? null,
    roughnessTexture: material.pbrMetallicRoughness?.metallicRoughnessTexture?.index ?? null,
    alphaMode: material.alphaMode ?? "OPAQUE",
    doubleSided: Boolean(material.doubleSided)
  })),
  geometryAudit,
  anchors: anchorTransforms
}, null, 2));

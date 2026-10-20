import * as THREE from "three";
import { GLTFLoader } from "../../../../assets/module/loaders/GLTFLoader.js";
import { IDEA_TREE_CONFIG, IDEA_TREE_NICHE, IDEA_TREE_PLACEMENT, IDEA_TREE_QUALITY } from "./idea-tree.config.js";
import { IDEA_TREE_FRAMES } from "./idea-tree.data.js";

const FRAME_TYPES = {
  FRAME_TRUNK: { w: 1.22, h: 0.88 },
  FRAME_BRANCH: { w: 1.04, h: 0.74 },
  FRAME_HANGING: { w: 0.88, h: 0.64 }
};

const FALLBACK_ANCHORS = [
  ["Anchor_Trunk_01", [-1.05, 6.1, -0.18], [0, 0.18, -0.06]],
  ["Anchor_Trunk_02", [0.92, 5.05, -0.2], [0, -0.16, 0.04]],
  ["Anchor_Branch_L_01", [-3.85, 8.1, -0.24], [0, 0.26, -0.08]],
  ["Anchor_Branch_L_02", [-2.65, 10.0, -0.26], [0, 0.18, 0.06]],
  ["Anchor_Branch_R_01", [3.6, 8.35, -0.24], [0, -0.24, 0.08]],
  ["Anchor_Branch_R_02", [2.35, 10.15, -0.26], [0, -0.16, -0.06]],
  ["Anchor_Hanging_01", [-4.75, 6.15, -0.32], [0, 0.18, 0]],
  ["Anchor_Hanging_02", [-1.85, 8.55, -0.34], [0, 0.08, 0]],
  ["Anchor_Hanging_03", [1.85, 8.55, -0.34], [0, -0.08, 0]],
  ["Anchor_Hanging_04", [4.75, 6.15, -0.32], [0, -0.18, 0]]
];

const _anchorWorldPosition = new THREE.Vector3();
const _anchorWorldQuaternion = new THREE.Quaternion();
const _anchorWorldScale = new THREE.Vector3();
const _parentWorldQuaternion = new THREE.Quaternion();
const _parentWorldScale = new THREE.Vector3();
const _assetBox = new THREE.Box3();
const _assetSize = new THREE.Vector3();
const _edgeA = new THREE.Vector3();
const _edgeB = new THREE.Vector3();
const _faceNormal = new THREE.Vector3();
const _vertexNormal = new THREE.Vector3();
const _nicheBox = new THREE.Box3();
const _nicheSize = new THREE.Vector3();
const _frameWorldPosition = new THREE.Vector3();
const _ropeTopWorldPosition = new THREE.Vector3();
const _ropeBottomWorldPosition = new THREE.Vector3();
const _ropeLocalPoint = new THREE.Vector3();
const _screenPoint = new THREE.Vector3();
const _frameBox = new THREE.Box3();
const _treeMassBox = new THREE.Box3();

function resolveAssetUrl(config) {
  if (config.assetMode === "validation") return config.validationAssetUrl;
  if (config.assetMode === "art-blockout") return config.artBlockoutAssetUrl;
  if (config.assetMode === "production" || config.assetMode === "production-preview") return config.productionAssetUrl;
  return config.assetUrl;
}

function getQueryParam(name) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function resolveRuntimeConfig(config) {
  const runtimeConfig = {
    ...config,
    debug: { ...config.debug },
    validation: { ...config.validation }
  };
  const mode = getQueryParam("ideaTreeAsset") || getQueryParam("ideaTreeMode");
  if (mode && ["placeholder", "validation", "art-blockout", "production", "production-preview"].includes(mode)) {
    runtimeConfig.assetMode = mode;
  }
  if (getQueryParam("ideaTreeProductionPreview") === "1") {
    runtimeConfig.assetMode = "production-preview";
  }
  if (getQueryParam("ideaTreeDebug") === "1") {
    runtimeConfig.debug.enabled = true;
    runtimeConfig.debug.showAnchorAxes = true;
    runtimeConfig.debug.showAnchorLabels = true;
    runtimeConfig.debug.showBoundingBox = true;
    runtimeConfig.debug.showFrameHotspots = true;
    runtimeConfig.debug.logStats = true;
  }
  const shadowMode = getQueryParam("ideaTreeShadow");
  if (shadowMode && ["none", "tree-mass", "all"].includes(shadowMode)) {
    runtimeConfig.shadowMode = shadowMode;
  }
  return runtimeConfig;
}

function createTechnicalValidationLabel() {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(127, 29, 29, 0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 48px Roboto, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TECHNICAL VALIDATION ASSET - NOT FINAL DESIGN", canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.6, 0.9),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  mesh.name = "TechnicalValidationAssetLabel";
  mesh.position.set(0, 12.1, -0.42);
  return mesh;
}

function createErrorLabel(message) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 220;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(127, 29, 29, 0.96)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px Roboto, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PRODUCTION PREVIEW LOAD ERROR", canvas.width / 2, 82);
  ctx.font = "700 28px Roboto, Arial, sans-serif";
  ctx.fillText(String(message).slice(0, 92), canvas.width / 2, 148);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.6, 1.22),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  mesh.name = "ProductionPreviewErrorLabel";
  mesh.position.set(0, 6.2, -0.42);
  return mesh;
}

function createIdeaTreeNiche(constants, config = IDEA_TREE_NICHE) {
  const niche = new THREE.Group();
  niche.name = "IdeaTreeWallAnchor";
  const wallInnerZ = constants.R_BACK - constants.WALL_T / 2;
  niche.position.set(0, 0, wallInnerZ - 0.035);
  niche.userData.ideaTreeNiche = {
    width: config.width,
    height: config.height,
    depth: 0,
    baseHeight: config.baseHeight,
    frameThickness: 0,
    cornerRadius: 0,
    backOffset: 0
  };
  return niche;
}
async function loadIdeaTreeGltf(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  gltf.scene.name = gltf.scene.name || "IdeaTreeRoot";
  return { root: gltf.scene, gltf, source: url, mode: "gltf-loader" };
}

async function loadConfiguredIdeaTree(config) {
  const requestedUrl = resolveAssetUrl(config);
  try {
    const asset = await loadIdeaTreeGltf(requestedUrl);
    return { ...asset, requestedUrl, usingValidationFallback: false };
  } catch (error) {
    if (config.assetMode === "production") {
      console.warn("IdeaTree production GLB unavailable; loading validation asset for technical fallback only.", error);
      const fallback = await loadIdeaTreeGltf(config.validationAssetUrl);
      return {
        ...fallback,
        requestedUrl,
        source: config.validationAssetUrl,
        mode: "validation-fallback",
        usingValidationFallback: true,
        error
      };
    }
    if (config.assetMode === "production-preview") {
      error.message = `IdeaTree production preview failed: ${error.message}`;
    }
    throw error;
  }
}

function createFallbackAsset() {
  const root = new THREE.Group();
  root.name = "IdeaTreeRoot_FallbackAnchors";
  FALLBACK_ANCHORS.forEach(([name, position, rotation]) => {
    const anchor = new THREE.Group();
    anchor.name = name;
    anchor.position.fromArray(position);
    anchor.rotation.set(rotation[0], rotation[1], rotation[2]);
    root.add(anchor);
  });
  return { root, source: "runtime-fallback", mode: "fallback-anchors" };
}

function configureAssetShadows(root, roomGroup, config) {
  if (!config.validation?.enableShadowAudit) return;
  root.traverse(obj => {
    if (!obj.isMesh) return;
    const isTreeMass = /Trunk|Branch|Root/i.test(obj.name) || /bark/i.test(obj.material?.name || "");
    obj.castShadow = config.shadowMode === "all" || (config.shadowMode !== "none" && isTreeMass);
    obj.receiveShadow = true;
  });
  roomGroup.traverse(obj => {
    if (obj.isMesh && !obj.userData?.kind) obj.receiveShadow = true;
  });
}

function createFrameBorderGeometry(width, height, border) {
  const outer = new THREE.Shape();
  outer.moveTo(-width / 2, -height / 2);
  outer.lineTo(width / 2, -height / 2);
  outer.lineTo(width / 2, height / 2);
  outer.lineTo(-width / 2, height / 2);
  outer.lineTo(-width / 2, -height / 2);

  const inner = new THREE.Path();
  inner.moveTo(-width / 2 + border, -height / 2 + border);
  inner.lineTo(-width / 2 + border, height / 2 - border);
  inner.lineTo(width / 2 - border, height / 2 - border);
  inner.lineTo(width / 2 - border, -height / 2 + border);
  inner.lineTo(-width / 2 + border, -height / 2 + border);
  outer.holes.push(inner);
  return new THREE.ShapeGeometry(outer);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  let line = "";
  const lines = [];
  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight));
}

function makeFrameTexture(item) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#dbeafe";
  ctx.fillRect(28, 28, canvas.width - 56, 218);
  ctx.fillStyle = "#1f2937";
  ctx.font = "700 36px Roboto, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item.title, canvas.width / 2, 302);
  ctx.fillStyle = "#475569";
  ctx.font = "600 22px Roboto, Arial, sans-serif";
  wrapCanvasText(ctx, item.summary, canvas.width / 2, 346, canvas.width - 82, 30);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFrameModel(type, item, services) {
  const spec = FRAME_TYPES[type] || FRAME_TYPES.FRAME_BRANCH;
  const group = new THREE.Group();
  group.name = `Frame_${item.id}`;

  const back = new THREE.Mesh(services.geometries.frameBack, services.materials.frameBack);
  back.scale.set(spec.w + 0.16, spec.h + 0.16, 0.055);
  back.position.z = -0.018;
  group.add(back);

  const photo = new THREE.Mesh(
    services.geometries.framePhoto,
    new THREE.MeshStandardMaterial({ map: makeFrameTexture(item), roughness: 0.62, side: THREE.DoubleSide })
  );
  photo.scale.set(spec.w, spec.h, 1);
  photo.position.z = 0.014;
  group.add(photo);

  const trim = new THREE.Mesh(services.geometries.frameBorders[type], services.materials.trim);
  trim.position.z = 0.02;
  group.add(trim);

  const artId = services.registerArtifact({
    title: item.title,
    description: item.summary,
    group: "Vuon uom y tuong",
    image: photo.material.map.image?.toDataURL?.("image/png") || ""
  });
  photo.userData = { kind: "artifact", id: artId, ideaId: item.id };
  services.interactive.push(photo);
  services.ownedInteractive.add(photo);
  return group;
}

function resolveRopeTopWorldPosition(assetRoot, frame, item, anchor, services) {
  const ropeTop = item.ropeTopAnchor ? findAnchor(assetRoot, item.ropeTopAnchor) : null;
  if (ropeTop) {
    ropeTop.updateWorldMatrix(true, false);
    return ropeTop.getWorldPosition(new THREE.Vector3());
  }
  if (item.ropeTopAnchor) {
    console.warn(`IdeaTree missing RopeTop anchor: ${item.ropeTopAnchor}; using preview offset from ${item.anchor}.`);
  }
  anchor.updateWorldMatrix(true, false);
  anchor.getWorldPosition(_ropeTopWorldPosition);
  const offset = item.ropeTopOffset || [0, 0.62, -0.04];
  return _ropeTopWorldPosition.clone().add(new THREE.Vector3(offset[0], offset[1], offset[2]));
}

function createRope(assetRoot, frame, frameParent, item, anchor, services) {
  const topWorld = resolveRopeTopWorldPosition(assetRoot, frame, item, anchor, services);
  const geometry = new THREE.BufferGeometry();
  const rope = new THREE.Line(geometry, services.materials.rope);
  rope.name = `Rope_${frame.name}`;
  rope.userData.ideaTreeRope = {
    topAnchor: item.ropeTopAnchor || null,
    frameAnchor: item.anchor,
    topWorld: topWorld.toArray()
  };
  frameParent.add(rope);

  const update = () => {
    frame.updateWorldMatrix(true, true);
    frame.getWorldPosition(_frameWorldPosition);
    const leftTop = new THREE.Vector3(-0.28, 0.38, 0.02).applyMatrix4(frame.matrixWorld);
    const rightTop = new THREE.Vector3(0.28, 0.38, 0.02).applyMatrix4(frame.matrixWorld);
    _ropeBottomWorldPosition.copy(_frameWorldPosition).lerpVectors(leftTop, rightTop, 0.5);
    const sag = Math.max(0.12, topWorld.y - _ropeBottomWorldPosition.y) * 0.12;
    const points = [
      topWorld.clone(),
      topWorld.clone().lerp(leftTop, 0.52).add(new THREE.Vector3(0, -sag, 0)),
      leftTop.clone(),
      rightTop.clone(),
      topWorld.clone().lerp(rightTop, 0.52).add(new THREE.Vector3(0, -sag, 0)),
      topWorld.clone()
    ].map(point => frameParent.worldToLocal(_ropeLocalPoint.copy(point)).clone());
    geometry.setFromPoints(points);
    geometry.computeBoundingSphere();
  };
  update();
  services.ropeUpdaters.add(update);
  frame.userData.updateRope = update;
  const previousOnBeforeRender = frame.onBeforeRender;
  frame.onBeforeRender = (...args) => {
    previousOnBeforeRender?.(...args);
    update();
  };
  return rope;
}

function findAnchor(root, anchorName) {
  return root.getObjectByName(anchorName);
}

function applyAnchorWorldTransform(anchor, frame, frameParent, item) {
  anchor.updateWorldMatrix(true, false);
  frameParent.updateWorldMatrix(true, false);
  anchor.getWorldPosition(_anchorWorldPosition);
  anchor.getWorldQuaternion(_anchorWorldQuaternion);
  anchor.getWorldScale(_anchorWorldScale);
  frameParent.getWorldQuaternion(_parentWorldQuaternion);
  frameParent.getWorldScale(_parentWorldScale);

  frame.position.copy(_anchorWorldPosition);
  frameParent.worldToLocal(frame.position);
  frame.quaternion.copy(_parentWorldQuaternion).invert().multiply(_anchorWorldQuaternion);
  frame.rotation.x += item.rotationOffset?.[0] || 0;
  frame.rotation.y += item.rotationOffset?.[1] || 0;
  frame.rotation.z += item.rotationOffset?.[2] || 0;
  frame.scale.set(
    (_anchorWorldScale.x / _parentWorldScale.x) * (item.scale || 1),
    (_anchorWorldScale.y / _parentWorldScale.y) * (item.scale || 1),
    (_anchorWorldScale.z / _parentWorldScale.z) * (item.scale || 1)
  );
  if (item.positionOffset) {
    frame.position.add(new THREE.Vector3(item.positionOffset[0] || 0, item.positionOffset[1] || 0, item.positionOffset[2] || 0));
  }
}

function attachFrames(asset, frameParent, services, config) {
  const maxFrames = IDEA_TREE_QUALITY[config.quality]?.frameCount || IDEA_TREE_FRAMES.length;
  const missingAnchors = [];
  IDEA_TREE_FRAMES.slice(0, maxFrames).forEach(item => {
    const anchor = findAnchor(asset.root, item.anchor);
    if (!anchor) {
      missingAnchors.push(item.anchor);
      return;
    }
    if (config.validation?.enableTransformAudit) auditAnchorTransform(anchor, item.anchor);
    const frame = createFrameModel(item.frameType, item, services);
    applyAnchorWorldTransform(anchor, frame, frameParent, item);
    frameParent.add(frame);
    services.frames.push({ frame, item });
    if (item.frameType === "FRAME_HANGING") createRope(asset.root, frame, frameParent, item, anchor, services);
    if (config.debug?.enabled && config.debug?.showFrameHotspots) addFrameHotspotDebug(frame, services);
  });
  if (missingAnchors.length && config.debug?.logMissingAnchors !== false) {
    console.warn("IdeaTree missing anchors:", missingAnchors);
  }
  return missingAnchors;
}

function auditAnchorTransform(anchor, anchorName) {
  anchor.updateWorldMatrix(true, false);
  anchor.getWorldScale(_anchorWorldScale);
  if (_anchorWorldScale.x <= 0 || _anchorWorldScale.y <= 0 || _anchorWorldScale.z <= 0) {
    console.warn(`IdeaTree anchor has non-positive world scale: ${anchorName}`, _anchorWorldScale.toArray());
  }
  const determinant = anchor.matrixWorld.determinant();
  if (determinant < 0) {
    console.warn(`IdeaTree anchor has negative matrix determinant: ${anchorName}`, determinant);
  }
  if (![...anchor.matrixWorld.elements].every(Number.isFinite)) {
    console.warn(`IdeaTree anchor has non-finite matrix values: ${anchorName}`);
  }
}

function disposeTree(group) {
  group.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.filter(Boolean).forEach(material => {
      Object.keys(material).forEach(key => {
        const value = material[key];
        if (value?.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
}

function removeOwnedInteractive(services) {
  services.ownedInteractive.forEach(object => {
    const index = services.interactive.indexOf(object);
    if (index !== -1) services.interactive.splice(index, 1);
  });
  services.ownedInteractive.clear();
}

function collectStats(root) {
  const stats = {
    nodes: 0,
    meshes: 0,
    triangles: 0,
    drawCallsEstimate: 0,
    materials: new Set(),
    textures: new Set()
  };
  root.traverse(obj => {
    stats.nodes++;
    if (!obj.isMesh) return;
    stats.meshes++;
    stats.drawCallsEstimate += Array.isArray(obj.material) ? obj.material.length : 1;
    if (obj.geometry?.index) stats.triangles += obj.geometry.index.count / 3;
    else if (obj.geometry?.attributes?.position) stats.triangles += obj.geometry.attributes.position.count / 3;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.filter(Boolean).forEach(material => {
      stats.materials.add(material);
      Object.keys(material).forEach(key => {
        const value = material[key];
        if (value?.isTexture) stats.textures.add(value);
      });
    });
  });
  return {
    nodes: stats.nodes,
    meshes: stats.meshes,
    triangles: Math.round(stats.triangles),
    drawCallsEstimate: stats.drawCallsEstimate,
    materials: stats.materials.size,
    textures: stats.textures.size
  };
}

function collectBounds(root) {
  _assetBox.setFromObject(root);
  _assetBox.getSize(_assetSize);
  return {
    min: _assetBox.min.toArray().map(v => Number(v.toFixed(3))),
    max: _assetBox.max.toArray().map(v => Number(v.toFixed(3))),
    size: _assetSize.toArray().map(v => Number(v.toFixed(3)))
  };
}

function collectMaterialAudit(root) {
  const materials = new Map();
  root.traverse(obj => {
    if (!obj.isMesh) return;
    const meshMaterials = Array.isArray(obj.material) ? obj.material : [obj.material];
    meshMaterials.filter(Boolean).forEach(material => {
      if (!materials.has(material.uuid)) {
        materials.set(material.uuid, {
          name: material.name || "(unnamed)",
          baseColor: material.map ? material.map.colorSpace : null,
          normal: material.normalMap ? material.normalMap.colorSpace : null,
          roughness: material.roughnessMap ? material.roughnessMap.colorSpace : null,
          ao: material.aoMap ? material.aoMap.colorSpace : null,
          baseColorOk: !material.map || material.map.colorSpace === THREE.SRGBColorSpace,
          normalOk: !material.normalMap || material.normalMap.colorSpace !== THREE.SRGBColorSpace,
          roughnessOk: !material.roughnessMap || material.roughnessMap.colorSpace !== THREE.SRGBColorSpace,
          aoOk: !material.aoMap || material.aoMap.colorSpace !== THREE.SRGBColorSpace
        });
      }
    });
  });
  return [...materials.values()];
}

function collectGeometryAudit(root) {
  const result = [];
  root.traverse(obj => {
    if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
    const geometry = obj.geometry;
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    let frontFaceOk = null;
    if (normal && position.count >= 3) {
      const ai = geometry.index ? geometry.index.getX(0) : 0;
      const bi = geometry.index ? geometry.index.getX(1) : 1;
      const ci = geometry.index ? geometry.index.getX(2) : 2;
      _edgeA.fromBufferAttribute(position, bi).sub(_edgeB.fromBufferAttribute(position, ai));
      _edgeB.fromBufferAttribute(position, ci).sub(_edgeB.fromBufferAttribute(position, ai));
      _faceNormal.crossVectors(_edgeA, _edgeB).normalize();
      _vertexNormal.fromBufferAttribute(normal, ai).normalize();
      frontFaceOk = _faceNormal.dot(_vertexNormal) > 0.35;
    }
    result.push({
      name: obj.name || "(unnamed)",
      hasPosition: true,
      hasNormal: Boolean(normal),
      frontFaceOk
    });
  });
  return result;
}

function collectShadowAudit(root, roomGroup) {
  let treeCastShadow = 0;
  let receiveShadow = 0;
  let wallReceiveShadow = 0;
  root.traverse(obj => {
    if (!obj.isMesh) return;
    if (/Trunk|Branch|Root/i.test(obj.name) && obj.castShadow) treeCastShadow++;
    if (obj.receiveShadow) receiveShadow++;
  });
  roomGroup.traverse(obj => {
    if (obj.isMesh && obj.receiveShadow) wallReceiveShadow++;
  });
  return { treeCastShadow, receiveShadow, wallReceiveShadow };
}

function collectAnchorTransforms(root) {
  return IDEA_TREE_FRAMES.map(item => {
    const anchor = findAnchor(root, item.anchor);
    if (!anchor) return { anchor: item.anchor, found: false };
    anchor.updateWorldMatrix(true, false);
    anchor.getWorldPosition(_anchorWorldPosition);
    anchor.getWorldQuaternion(_anchorWorldQuaternion);
    anchor.getWorldScale(_anchorWorldScale);
    return {
      anchor: item.anchor,
      found: true,
      position: _anchorWorldPosition.toArray().map(v => Number(v.toFixed(3))),
      quaternion: _anchorWorldQuaternion.toArray().map(v => Number(v.toFixed(3))),
      scale: _anchorWorldScale.toArray().map(v => Number(v.toFixed(3)))
    };
  });
}

function makeLabelSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(15,23,42,.82)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 32px Roboto, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.55, 0.3, 1);
  sprite.position.y = 0.36;
  return sprite;
}

function addFrameHotspotDebug(frame, services) {
  const box = new THREE.BoxHelper(frame, 0xffef9a);
  box.name = `HotspotDebug_${frame.name}`;
  frame.add(box);
  services.debugObjects.add(box);
}

function addDebugHelpers(placement, assetRoot, config, services) {
  if (!config.debug?.enabled && !(config.assetMode === "art-blockout" && config.debug?.enableInArtBlockout)) return;
  if (config.debug.showBoundingBox) {
    const box = new THREE.BoxHelper(assetRoot, 0x22c55e);
    box.name = "IdeaTreeDebugBoundingBox";
    placement.add(box);
    services.debugObjects.add(box);
  }
  IDEA_TREE_FRAMES.forEach(item => {
    const anchor = findAnchor(assetRoot, item.anchor);
    if (!anchor) return;
    if (config.debug.showAnchorAxes) {
      const axes = new THREE.AxesHelper(0.45);
      axes.name = `Axes_${item.anchor}`;
      anchor.add(axes);
      services.debugObjects.add(axes);
    }
    if (config.debug.showAnchorLabels) {
      const label = makeLabelSprite(item.anchor);
      label.name = `Label_${item.anchor}`;
      anchor.add(label);
      services.debugObjects.add(label);
    }
  });
}

function addNicheDebugHelpers(niche, config, services) {
  if (!config.debug?.enabled || !IDEA_TREE_NICHE.debug?.showBounds) return;
  const box = new THREE.BoxHelper(niche, 0x38bdf8);
  box.name = "IdeaTreeNicheDebugBounds";
  niche.add(box);
  services.debugObjects.add(box);
}

function collectNicheBounds(niche) {
  _nicheBox.setFromObject(niche);
  _nicheBox.getSize(_nicheSize);
  return {
    min: _nicheBox.min.toArray().map(v => Number(v.toFixed(3))),
    max: _nicheBox.max.toArray().map(v => Number(v.toFixed(3))),
    size: _nicheSize.toArray().map(v => Number(v.toFixed(3)))
  };
}

function collectTreeNicheRatios(treeBounds, nicheConfig = IDEA_TREE_NICHE) {
  return {
    width: Number((treeBounds.size[0] / nicheConfig.width).toFixed(3)),
    height: Number((treeBounds.size[1] / nicheConfig.height).toFixed(3)),
    depth: Number((treeBounds.size[2] / nicheConfig.depth).toFixed(3))
  };
}

function boxDistance(a, b) {
  const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
  const dy = Math.max(0, Math.max(a.min.y - b.max.y, b.min.y - a.max.y));
  const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function screenRectForObject(object, camera, renderer) {
  _frameBox.setFromObject(object);
  const size = renderer.getSize(new THREE.Vector2());
  const corners = [
    [_frameBox.min.x, _frameBox.min.y, _frameBox.min.z],
    [_frameBox.min.x, _frameBox.min.y, _frameBox.max.z],
    [_frameBox.min.x, _frameBox.max.y, _frameBox.min.z],
    [_frameBox.min.x, _frameBox.max.y, _frameBox.max.z],
    [_frameBox.max.x, _frameBox.min.y, _frameBox.min.z],
    [_frameBox.max.x, _frameBox.min.y, _frameBox.max.z],
    [_frameBox.max.x, _frameBox.max.y, _frameBox.min.z],
    [_frameBox.max.x, _frameBox.max.y, _frameBox.max.z]
  ];
  const rect = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  corners.forEach(corner => {
    _screenPoint.set(corner[0], corner[1], corner[2]).project(camera);
    const x = (_screenPoint.x * 0.5 + 0.5) * size.x;
    const y = (-_screenPoint.y * 0.5 + 0.5) * size.y;
    rect.left = Math.min(rect.left, x);
    rect.top = Math.min(rect.top, y);
    rect.right = Math.max(rect.right, x);
    rect.bottom = Math.max(rect.bottom, y);
  });
  return {
    left: Number(rect.left.toFixed(1)),
    top: Number(rect.top.toFixed(1)),
    right: Number(rect.right.toFixed(1)),
    bottom: Number(rect.bottom.toFixed(1)),
    width: Number((rect.right - rect.left).toFixed(1)),
    height: Number((rect.bottom - rect.top).toFixed(1))
  };
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function collectTreeMassBoxes(assetRoot) {
  const boxes = [];
  assetRoot.traverse(obj => {
    if (!obj.isMesh || !/Trunk|Branch|Root/i.test(obj.name)) return;
    const box = new THREE.Box3().setFromObject(obj);
    boxes.push({ name: obj.name, box });
  });
  return boxes;
}

function runRuntimeReview(placement, assetRoot, services) {
  if (!services.camera || !services.renderer) {
    console.warn("IdeaTree runtime review requires camera and renderer in services.");
    return null;
  }
  placement.updateWorldMatrix(true, true);
  services.ropeUpdaters.forEach(update => update());
  services.camera.updateMatrixWorld(true);
  const massBoxes = collectTreeMassBoxes(assetRoot);
  const frames = services.frames.map(({ frame, item }) => {
    const rect = screenRectForObject(frame, services.camera, services.renderer);
    const worldBox = new THREE.Box3().setFromObject(frame);
    const distances = massBoxes.map(entry => ({ name: entry.name, distance: boxDistance(worldBox, entry.box) }));
    distances.sort((a, b) => a.distance - b.distance);
    return {
      id: item.id,
      anchor: item.anchor,
      type: item.frameType,
      screenRect: rect,
      nearestTreeMass: distances[0] ? {
        name: distances[0].name,
        distance: Number(distances[0].distance.toFixed(3))
      } : null
    };
  });
  const overlaps = [];
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) {
      if (rectsOverlap(frames[i].screenRect, frames[j].screenRect)) {
        overlaps.push([frames[i].id, frames[j].id]);
      }
    }
  }
  if (overlaps.length) console.warn("IdeaTree screen-space frame overlaps:", overlaps);
  console.table(frames.map(frame => ({
    id: frame.id,
    anchor: frame.anchor,
    left: frame.screenRect.left,
    top: frame.screenRect.top,
    right: frame.screenRect.right,
    bottom: frame.screenRect.bottom,
    nearestMass: frame.nearestTreeMass?.name || "",
    distance: frame.nearestTreeMass?.distance ?? null
  })));
  return { frames, overlaps };
}

function measureFPS(durationMs = 10000) {
  return new Promise(resolve => {
    const started = performance.now();
    let last = started;
    let frames = 0;
    let min = Infinity;
    let max = 0;
    const tick = now => {
      const delta = now - last;
      last = now;
      if (delta > 0) {
        const fps = 1000 / delta;
        min = Math.min(min, fps);
        max = Math.max(max, fps);
      }
      frames++;
      if (now - started >= durationMs) {
        const average = frames / ((now - started) / 1000);
        const result = {
          durationMs: Math.round(now - started),
          frames,
          averageFPS: Number(average.toFixed(1)),
          minInstantFPS: Number(min.toFixed(1)),
          maxInstantFPS: Number(max.toFixed(1))
        };
        console.info("IdeaTree FPS measurement:", result);
        resolve(result);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function createServices(baseServices) {
  return {
    ...baseServices,
    ownedInteractive: new Set(),
    debugObjects: new Set(),
    frames: [],
    ropeUpdaters: new Set(),
    geometries: {
      frameBack: new THREE.BoxGeometry(1, 1, 1),
      framePhoto: new THREE.PlaneGeometry(1, 1),
      frameBorders: Object.fromEntries(Object.entries(FRAME_TYPES).map(([type, spec]) => [
        type,
        createFrameBorderGeometry(spec.w + 0.2, spec.h + 0.2, 0.065)
      ]))
    },
    materials: {
      frameBack: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.68 }),
      trim: new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: 0.32, metalness: 0.48 }),
      rope: new THREE.LineBasicMaterial({ color: 0x6f4b25 })
    }
  };
}

export function createIdeaTreeInstallation(roomGroup, constants, baseServices, config = IDEA_TREE_CONFIG) {
  config = resolveRuntimeConfig(config);
  const services = createServices(baseServices);
  const assetUrl = resolveAssetUrl(config);
  const niche = createIdeaTreeNiche(constants, IDEA_TREE_NICHE);
  const placement = new THREE.Group();
  placement.name = "IdeaTreePlacementAnchor";
  placement.position.set(0, IDEA_TREE_NICHE.baseHeight, -IDEA_TREE_PLACEMENT.wallOffset);
  placement.rotation.y = Math.PI;
  placement.scale.setScalar(config.scale);

  placement.userData.ideaTree = {
    status: "loading",
    mode: null,
    source: assetUrl,
    requestedSource: assetUrl,
    usingValidationFallback: false,
    stats: null,
    bounds: null,
    materialAudit: [],
    geometryAudit: [],
    shadowAudit: null,
    anchorTransforms: [],
    missingAnchors: [],
    niche: IDEA_TREE_NICHE,
    nicheBounds: null,
    nicheRatios: null,
    error: null,
    runLifecycleValidation: (cycles = 3) => runIdeaTreeLifecycleValidation(roomGroup, constants, baseServices, config, cycles),
    dispose: () => {
      removeOwnedInteractive(services);
      disposeTree(niche);
      niche.removeFromParent();
    }
  };

  const frameLayer = new THREE.Group();
  frameLayer.name = "IdeaFrameRuntimeLayer";
  placement.add(frameLayer);
  niche.add(placement);
  roomGroup.add(niche);
  addNicheDebugHelpers(niche, config, services);

  if (typeof window !== "undefined") {
    window.__ideaTreeLifecycleValidation = (cycles = 3) => runIdeaTreeLifecycleValidation(roomGroup, constants, baseServices, config, cycles);
  }

  loadConfiguredIdeaTree(config)
    .catch(error => {
      if (config.assetMode === "production-preview") {
        console.error(error.message, error);
        placement.userData.ideaTree.status = "error";
        placement.userData.ideaTree.error = error;
        placement.add(createErrorLabel(error.message));
        return { root: new THREE.Group(), source: "production-preview-error", mode: "error" };
      }
      console.warn("IdeaTree GLB failed; using runtime fallback anchors.", error);
      placement.userData.ideaTree.status = "error";
      placement.userData.ideaTree.error = error;
      return createFallbackAsset();
    })
    .then(asset => {
      placement.add(asset.root);
      if (asset.usingValidationFallback && config.assetMode === "production" && config.validation?.showNotFinalLabelOnProductionFallback !== false) {
        asset.root.add(createTechnicalValidationLabel());
      }
      placement.updateWorldMatrix(true, true);
      configureAssetShadows(asset.root, roomGroup, config);
      const missingAnchors = attachFrames(asset, frameLayer, services, config);
      addDebugHelpers(placement, asset.root, config, services);
      const stats = collectStats(asset.root);
      const bounds = collectBounds(asset.root);
      const nicheBounds = collectNicheBounds(niche);
      const nicheRatios = collectTreeNicheRatios(bounds, IDEA_TREE_NICHE);
      const materialAudit = collectMaterialAudit(asset.root);
      const geometryAudit = collectGeometryAudit(asset.root);
      const shadowAudit = collectShadowAudit(asset.root, roomGroup);
      const anchorTransforms = collectAnchorTransforms(asset.root);
      Object.assign(placement.userData.ideaTree, {
        status: asset.mode === "fallback-anchors" ? "error-fallback" : asset.mode === "error" ? "error" : "ready",
        mode: asset.mode,
        source: asset.source,
        requestedSource: asset.requestedUrl || asset.source,
        usingValidationFallback: Boolean(asset.usingValidationFallback),
        stats,
        bounds,
        nicheBounds,
        nicheRatios,
        materialAudit,
        geometryAudit,
        shadowAudit,
        anchorTransforms,
        missingAnchors
      });
      if ((config.debug?.enabled && config.debug?.logStats) || config.assetMode === "art-blockout") {
        console.table(anchorTransforms);
        console.info("IdeaTree GLB stats:", stats);
        console.info("IdeaTree bounds:", bounds);
        console.info("IdeaTree niche bounds:", nicheBounds);
        console.info("IdeaTree tree/niche ratios:", nicheRatios);
        console.table(materialAudit);
        console.table(geometryAudit);
        console.info("IdeaTree shadow audit:", shadowAudit);
      }
      if (typeof window !== "undefined") {
        window.__ideaTreeRuntimeReview = () => runRuntimeReview(placement, asset.root, services);
        window.__ideaTreeMeasureFPS = (durationMs = 10000) => measureFPS(durationMs);
      }
      services.requestRender();
    });

  return placement;
}

function cloneRendererInfo(renderer) {
  if (!renderer?.info) return null;
  return {
    memory: { ...renderer.info.memory },
    render: { ...renderer.info.render },
    programs: renderer.info.programs?.length ?? 0
  };
}

function waitForIdeaTreeState(placement, timeoutMs = 8000) {
  return new Promise(resolve => {
    const started = performance.now();
    const tick = () => {
      const status = placement.userData.ideaTree?.status;
      if (status && status !== "loading") {
        resolve({ status, timedOut: false });
        return;
      }
      if (performance.now() - started > timeoutMs) {
        resolve({ status: status || "unknown", timedOut: true });
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export async function runIdeaTreeLifecycleValidation(roomGroup, constants, baseServices, config = IDEA_TREE_CONFIG, cycles = 3) {
  const before = cloneRendererInfo(baseServices.renderer);
  const interactiveBefore = baseServices.interactive?.length ?? null;
  const normalizedCycles = Math.max(1, Math.floor(Number(cycles) || 3));
  const cycleResults = [];

  for (let index = 0; index < normalizedCycles; index++) {
    const placement = createIdeaTreeInstallation(roomGroup, constants, baseServices, config);
    const state = await waitForIdeaTreeState(placement);
    const afterLoad = cloneRendererInfo(baseServices.renderer);
    const interactiveAfterLoad = baseServices.interactive?.length ?? null;
    placement.userData.ideaTree.dispose();
    baseServices.renderer?.renderLists?.dispose?.();
    cycleResults.push({
      cycle: index + 1,
      state,
      afterLoad,
      interactiveAfterLoad,
      afterDispose: cloneRendererInfo(baseServices.renderer),
      interactiveAfterDispose: baseServices.interactive?.length ?? null
    });
  }

  const result = {
    before,
    interactiveBefore,
    cycles: cycleResults
  };
  console.info("IdeaTree lifecycle validation:", result);
  return result;
}

const fs = require("fs");

// Legacy technical shape proxy generator only.
// Do not use this script as the official art blockout or production tree source.
const outPath = "scene/scene-4/assets/models/idea-tree/idea-tree-art-blockout.glb";

function align4(n) { return (n + 3) & ~3; }
function pad4(buffer, fill = 0) {
  const pad = (4 - (buffer.length % 4)) % 4;
  return pad ? Buffer.concat([buffer, Buffer.alloc(pad, fill)]) : buffer;
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function adler32(buf) {
  let a = 1, b = 0;
  for (const value of buf) {
    a = (a + value) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}
function zlibStore(data) {
  const blocks = [];
  for (let offset = 0; offset < data.length; offset += 65535) {
    const chunk = data.subarray(offset, offset + 65535);
    const final = offset + chunk.length >= data.length ? 1 : 0;
    const head = Buffer.alloc(5);
    head[0] = final;
    head.writeUInt16LE(chunk.length, 1);
    head.writeUInt16LE((~chunk.length) & 0xffff, 3);
    blocks.push(head, chunk);
  }
  const zhead = Buffer.from([0x78, 0x01]);
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(adler32(data));
  return Buffer.concat([zhead, ...blocks, adler]);
}
function png(width, height, pixelFn) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    for (let x = 0; x < width; x++) {
      const p = pixelFn(x, y);
      row[1 + x * 4] = p[0];
      row[2 + x * 4] = p[1];
      row[3 + x * 4] = p[2];
      row[4 + x * 4] = p[3] ?? 255;
    }
    rows.push(row);
  }
  function chunk(type, data) {
    const name = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
    return Buffer.concat([len, name, data, crc]);
  }
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlibStore(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))]);
}

const chunks = [];
const bufferViews = [], accessors = [], images = [], textures = [], materials = [], meshes = [], nodes = [];
function addBuffer(data, target) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset || 0, data.byteLength);
  const offset = chunks.reduce((sum, c) => sum + align4(c.data.length), 0);
  chunks.push({ data: bytes, target });
  return { byteOffset: offset, byteLength: bytes.length, target };
}
function addBufferView(data, target) {
  const view = addBuffer(data, target);
  bufferViews.push({ buffer: 0, byteOffset: view.byteOffset, byteLength: view.byteLength, target });
  return bufferViews.length - 1;
}
function addImage(buffer, name) {
  const view = addBuffer(buffer);
  bufferViews.push({ buffer: 0, byteOffset: view.byteOffset, byteLength: view.byteLength });
  images.push({ name, bufferView: bufferViews.length - 1, mimeType: "image/png" });
  textures.push({ source: images.length - 1 });
  return textures.length - 1;
}
function addAccessor(bufferView, componentType, count, type, min, max) {
  const item = { bufferView, componentType, count, type };
  if (min) item.min = min;
  if (max) item.max = max;
  accessors.push(item);
  return accessors.length - 1;
}
function bounds(positions) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], positions[i + a]);
      max[a] = Math.max(max[a], positions[i + a]);
    }
  }
  return { min, max };
}
function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function addMesh(name, positions, normals, uvs, indices, material) {
  const pView = addBufferView(new Float32Array(positions), 34962);
  const nView = addBufferView(new Float32Array(normals), 34962);
  const uvView = addBufferView(new Float32Array(uvs), 34962);
  const iView = addBufferView(new Uint16Array(indices), 34963);
  const b = bounds(positions);
  const pAcc = addAccessor(pView, 5126, positions.length / 3, "VEC3", b.min, b.max);
  const nAcc = addAccessor(nView, 5126, normals.length / 3, "VEC3");
  const uvAcc = addAccessor(uvView, 5126, uvs.length / 2, "VEC2");
  const iAcc = addAccessor(iView, 5123, indices.length, "SCALAR");
  meshes.push({ name, primitives: [{ attributes: { POSITION: pAcc, NORMAL: nAcc, TEXCOORD_0: uvAcc }, indices: iAcc, material }] });
  return meshes.length - 1;
}
function node(name, props = {}) {
  nodes.push({ name, ...props });
  return nodes.length - 1;
}
function branchMesh(name, points, radii, material, sides = 10) {
  const positions = [], normals = [], uvs = [], indices = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[Math.min(points.length - 1, i + 1)];
    const prev = points[Math.max(0, i - 1)];
    const tangent = normalize([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);
    const ref = Math.abs(tangent[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const right = normalize(cross(tangent, ref));
    const up = normalize(cross(right, tangent));
    for (let s = 0; s < sides; s++) {
      const t = s / sides * Math.PI * 2;
      const oval = 0.72 + 0.22 * Math.sin(i * 1.7 + s);
      const nx = Math.cos(t), ny = Math.sin(t);
      const r = radii[i] * oval;
      positions.push(p[0] + right[0] * nx * r + up[0] * ny * r, p[1] + right[1] * nx * r + up[1] * ny * r, p[2] + right[2] * nx * r + up[2] * ny * r);
      normals.push(...normalize([right[0] * nx + up[0] * ny, right[1] * nx + up[1] * ny, right[2] * nx + up[2] * ny]));
      uvs.push(s / sides, i / (points.length - 1));
    }
  }
  for (let i = 0; i < points.length - 1; i++) {
    for (let s = 0; s < sides; s++) {
      const a = i * sides + s, b = i * sides + (s + 1) % sides, c = (i + 1) * sides + (s + 1) % sides, d = (i + 1) * sides + s;
      indices.push(a, c, b, a, d, c);
    }
  }
  return addMesh(name, positions, normals, uvs, indices, material);
}
function leafClusterMesh(name, center, width, height, material, count = 7) {
  const positions = [], normals = [], uvs = [], indices = [];
  for (let i = 0; i < count; i++) {
    const angle = -0.7 + i * 0.23;
    const cx = center[0] + (i - (count - 1) / 2) * width * 0.13;
    const cy = center[1] + Math.sin(i * 1.7) * height * 0.12;
    const cz = center[2] - 0.04 * i;
    const w = width * (0.16 + (i % 3) * 0.025);
    const h = height * (0.32 + (i % 2) * 0.04);
    const verts = [[-w,-h,0],[w,-h,0],[w,h,0],[-w,h,0]].map(([x,y,z]) => [cx + x*Math.cos(angle), cy + y, cz + x*Math.sin(angle) + z]);
    const o = positions.length / 3;
    verts.forEach(v => { positions.push(...v); normals.push(0,0,1); });
    uvs.push(0,0, 1,0, 1,1, 0,1);
    indices.push(o,o+1,o+2,o,o+2,o+3);
  }
  return addMesh(name, positions, normals, uvs, indices, material);
}
function frameMesh(name, w, h, material) {
  const x=w/2,y=h/2,z=0.035;
  const p=[-x,-y,z,x,-y,z,x,y,z,-x,y,z, -x,-y,-z,x,-y,-z,x,y,-z,-x,y,-z];
  const n=[0,0,1,0,0,1,0,0,1,0,0,1, 0,0,-1,0,0,-1,0,0,-1,0,0,-1];
  const uv=[0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1];
  const idx=[0,1,2,0,2,3, 4,6,5,4,7,6];
  return addMesh(name,p,n,uv,idx,material);
}

const barkTex = addImage(png(32,32,(x,y)=>[78 + ((x*11+y*5)%46), 49 + ((x*7+y*13)%30), 29 + ((x*3+y*17)%26), 255]), "blockout_bark_basecolor.png");
const leafTex = addImage(png(16,16,(x,y)=>[42 + (x%3)*8, 100 + ((x*5+y*9)%64), 55, x<2||y<2||x>13||y>13 ? 190 : 255]), "blockout_leaf_basecolor.png");
const frameTex = addImage(png(16,16,(x,y)=>[205 + (x%4)*4, 184 + (y%5)*5, 134, 255]), "blockout_frame_basecolor.png");
materials.push({ name:"MAT_tree_bark_blockout", pbrMetallicRoughness:{ baseColorTexture:{index:barkTex}, metallicFactor:0, roughnessFactor:0.82 }, doubleSided:false });
materials.push({ name:"MAT_leaf_proxy_blockout", pbrMetallicRoughness:{ baseColorTexture:{index:leafTex}, metallicFactor:0, roughnessFactor:0.76 }, alphaMode:"BLEND", doubleSided:true });
materials.push({ name:"MAT_frame_proxy_blockout", pbrMetallicRoughness:{ baseColorTexture:{index:frameTex}, metallicFactor:0, roughnessFactor:0.58 }, doubleSided:true });
materials.push({ name:"MAT_rope_blockout", pbrMetallicRoughness:{ baseColorFactor:[0.32,0.20,0.10,1], metallicFactor:0, roughnessFactor:0.9 }, doubleSided:false });

const trunk = branchMesh("Trunk_mesh", [[-0.18,0.15,0.04],[-0.35,1.35,0.02],[-0.05,2.55,-0.04],[0.25,3.65,-0.09],[0.0,4.65,-0.13]], [0.92,0.84,0.72,0.58,0.46], 0, 14);
const roots = [
  branchMesh("ButtressRoot_L_mesh", [[-0.15,0.4,0.1],[-1.15,0.28,0.04],[-2.1,0.14,-0.04],[-2.85,0.08,-0.12]], [0.36,0.28,0.18,0.08], 0, 8),
  branchMesh("ButtressRoot_R_mesh", [[0.1,0.42,0.08],[0.95,0.25,0.0],[1.82,0.12,-0.08],[2.35,0.08,-0.16]], [0.34,0.25,0.16,0.07], 0, 8),
  branchMesh("ButtressRoot_F_mesh", [[0,0.35,0.18],[-0.2,0.16,0.65],[-0.55,0.08,0.95]], [0.32,0.19,0.08], 0, 8)
];
const branches = [
  branchMesh("MainBranch_ViewerLeft_Low_mesh", [[-0.08,3.2,-0.08],[-1.05,4.25,-0.12],[-2.45,5.2,-0.18],[-4.35,5.85,-0.28]], [0.42,0.34,0.22,0.09], 0, 10),
  branchMesh("MainBranch_ViewerRight_Low_mesh", [[0.2,3.0,-0.08],[1.1,3.85,-0.13],[2.55,4.85,-0.21],[4.65,5.5,-0.31]], [0.46,0.35,0.22,0.09], 0, 10),
  branchMesh("MainBranch_ViewerLeft_High_mesh", [[0.02,4.15,-0.12],[-0.9,5.55,-0.18],[-1.9,7.0,-0.25],[-3.25,8.15,-0.36]], [0.36,0.28,0.18,0.08], 0, 10),
  branchMesh("MainBranch_Center_mesh", [[0.12,4.55,-0.13],[0.45,5.95,-0.20],[0.2,7.55,-0.28],[-0.35,9.1,-0.38]], [0.34,0.26,0.16,0.07], 0, 10),
  branchMesh("MainBranch_ViewerRight_High_mesh", [[0.18,4.2,-0.12],[1.0,5.55,-0.2],[1.95,6.9,-0.31],[3.3,8.2,-0.42]], [0.36,0.27,0.17,0.075], 0, 10),
  branchMesh("SecondaryBranch_Left_mesh", [[-1.8,5.35,-0.2],[-2.45,6.5,-0.27],[-2.95,7.45,-0.33]], [0.16,0.1,0.045], 0, 7),
  branchMesh("SecondaryBranch_Right_mesh", [[2.15,4.8,-0.23],[2.95,5.95,-0.31],[3.55,6.85,-0.38]], [0.16,0.1,0.045], 0, 7)
];
const leaves = [
  leafClusterMesh("LeafCluster_ViewerLeft_proxy", [-3.25,7.7,-0.58], 2.2, 1.4, 1, 6),
  leafClusterMesh("LeafCluster_Center_proxy", [0.1,9.2,-0.62], 2.4, 1.45, 1, 6),
  leafClusterMesh("LeafCluster_ViewerRight_proxy", [3.2,7.6,-0.62], 2.1, 1.35, 1, 6)
];
const rope = branchMesh("Rope_Hanging_proxy_mesh", [[-4.45,6.45,-0.46],[-4.45,5.65,-0.46]], [0.025,0.025], 3, 5);
const frameTrunk = frameMesh("FrameProxy_Trunk_mesh", 1.05, 0.72, 2);
const frameBranch = frameMesh("FrameProxy_Branch_mesh", 0.88, 0.62, 2);
const frameHanging = frameMesh("FrameProxy_Hanging_mesh", 0.72, 0.52, 2);

const anchorDefs = [
  ["Anchor_Trunk_01", [-0.62,2.65,0.66], [0,0,0,1]],
  ["Anchor_Trunk_02", [0.46,3.45,0.62], [0,0.1,0,0.995]],
  ["Anchor_Branch_L_01", [-2.55,5.45,0.34], [0,0.18,-0.08,0.98]],
  ["Anchor_Branch_L_02", [-1.6,6.95,0.28], [0,0.16,0.08,0.984]],
  ["Anchor_Branch_R_01", [2.45,5.0,0.34], [0,-0.18,0.08,0.98]],
  ["Anchor_Branch_R_02", [1.75,6.85,0.26], [0,-0.16,-0.08,0.984]],
  ["Anchor_Hanging_01", [-4.45,5.6,0.18], [0,0.08,0,0.997]],
  ["Anchor_Hanging_02", [-0.85,7.55,0.18], [0,0.04,0,0.999]],
  ["Anchor_Hanging_03", [0.95,7.45,0.18], [0,-0.04,0,0.999]],
  ["Anchor_Hanging_04", [4.25,5.35,0.18], [0,-0.08,0,0.997]]
];
const anchorNodes = anchorDefs.map(([name, translation, rotation]) => node(name, { translation, rotation }));
const treeStatic = node("TreeStatic", { children:[
  node("Trunk", { mesh: trunk }),
  node("ButtressRoots", { children: roots.map((mesh, i) => node(`ButtressRoot_${i+1}`, { mesh })) }),
  node("MainBranches", { children: branches.slice(0,5).map((mesh, i) => node(`MainBranch_${i+1}`, { mesh })) }),
  node("SecondaryBranches", { children: branches.slice(5).map((mesh, i) => node(`SecondaryBranch_${i+1}`, { mesh })) })
]});
const foliage = node("Foliage", { children: leaves.map((mesh, i) => node(`LeafCluster_${String(i+1).padStart(2,"0")}`, { mesh })) });
const frameAnchors = node("FrameAnchors", { children: anchorNodes });
const hangingSystem = node("HangingSystem", { children:[node("Rope_01", { mesh: rope })] });
const ideaFrames = node("IdeaFrames", { children:[
  node("FrameProxy_Trunk", { mesh: frameTrunk, translation:[-0.62,2.65,0.72] }),
  node("FrameProxy_Branch", { mesh: frameBranch, translation:[2.45,5.0,0.42] }),
  node("FrameProxy_Hanging", { mesh: frameHanging, translation:[-4.45,5.08,0.22] })
]});
const lighting = node("LightingHelpers", { children:[node("AccentTarget_01"), node("AccentTarget_02")] });
const hotspots = node("InteractionHotspots", { children:[node("Hotspot_01"), node("Hotspot_02")] });
const root = node("IdeaTreeRoot", { children:[treeStatic, foliage, frameAnchors, hangingSystem, ideaFrames, lighting, hotspots] });

let bin = Buffer.alloc(chunks.reduce((sum, c) => sum + align4(c.data.length), 0));
let cursor = 0;
chunks.forEach(c => {
  c.data.copy(bin, cursor);
  cursor += align4(c.data.length);
});
const gltf = {
  asset: { version: "2.0", generator: "Codex art blockout GLB builder" },
  scene: 0,
  scenes: [{ name: "IdeaTreeArtBlockoutScene", nodes: [root] }],
  nodes,
  meshes,
  materials,
  textures,
  images,
  accessors,
  bufferViews,
  buffers: [{ byteLength: bin.length }]
};
const json = pad4(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
bin = pad4(bin);
const total = 12 + 8 + json.length + 8 + bin.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(json.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(bin.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);
fs.writeFileSync(outPath, Buffer.concat([header, jsonHeader, json, binHeader, bin]));
console.log(outPath);

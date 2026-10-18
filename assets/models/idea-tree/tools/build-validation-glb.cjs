const fs = require('fs');
const zlib = require('zlib');
const outPath = 'scene/scene-4/assets/models/idea-tree/idea-tree-validation.glb';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function png(width, height, pixelFn) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const p = pixelFn(x, y);
      row[1 + x * 4] = p[0]; row[2 + x * 4] = p[1]; row[3 + x * 4] = p[2]; row[4 + x * 4] = p[3] ?? 255;
    }
    rows.push(row);
  }
  function chunk(type, data) {
    const name = Buffer.from(type);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
    return Buffer.concat([len, name, data, crc]);
  }
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
function align4(n) { return (n + 3) & ~3; }
const chunks = [];
function addBuffer(data, target) {
  const offset = chunks.reduce((s, c) => s + align4(c.data.length), 0);
  const bytes = Buffer.isBuffer(data)
    ? data
    : Buffer.from(data.buffer, data.byteOffset || 0, data.byteLength);
  chunks.push({ data: bytes, target });
  return { byteOffset: offset, byteLength: data.byteLength ?? data.length, target };
}
function addImage(buf, name) {
  const view = addBuffer(buf);
  images.push({ name, bufferView: bufferViews.length, mimeType: 'image/png' });
  bufferViews.push({ buffer: 0, byteOffset: view.byteOffset, byteLength: view.byteLength });
  return images.length - 1;
}
const bufferViews = [], accessors = [], images = [], textures = [], materials = [], meshes = [], nodes = [];
function pushArray(typed, target) {
  const view = addBuffer(typed, target);
  bufferViews.push({ buffer: 0, byteOffset: view.byteOffset, byteLength: view.byteLength, target });
  return bufferViews.length - 1;
}
function accessor(bufferView, componentType, count, type, min, max) {
  accessors.push({ bufferView, componentType, count, type, min, max });
  return accessors.length - 1;
}
function bounds(pos) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], pos[i+a]); max[a] = Math.max(max[a], pos[i+a]); }
  return { min, max };
}
function mesh(name, positions, normals, uvs, indices, material) {
  const pb = pushArray(new Float32Array(positions), 34962);
  const nb = pushArray(new Float32Array(normals), 34962);
  const tb = pushArray(new Float32Array(uvs), 34962);
  const ib = pushArray(new Uint16Array(indices), 34963);
  const b = bounds(positions);
  const pa = accessor(pb, 5126, positions.length / 3, 'VEC3', b.min, b.max);
  const na = accessor(nb, 5126, normals.length / 3, 'VEC3');
  const ta = accessor(tb, 5126, uvs.length / 2, 'VEC2');
  const ia = accessor(ib, 5123, indices.length, 'SCALAR');
  meshes.push({ name, primitives: [{ attributes: { POSITION: pa, NORMAL: na, TEXCOORD_0: ta }, indices: ia, material }] });
  return meshes.length - 1;
}
function node(name, props = {}) { nodes.push({ name, ...props }); return nodes.length - 1; }
function box(name, sx, sy, sz, material) {
  const x=sx/2,y=sy/2,z=sz/2;
  const p=[-x,-y,z,x,-y,z,x,y,z,-x,y,z, x,-y,-z,-x,-y,-z,-x,y,-z,x,y,-z, -x,y,z,x,y,z,x,y,-z,-x,y,-z, -x,-y,-z,x,-y,-z,x,-y,z,-x,-y,z, x,-y,z,x,-y,-z,x,y,-z,x,y,z, -x,-y,-z,-x,-y,z,-x,y,z,-x,y,-z];
  const n=[0,0,1,0,0,1,0,0,1,0,0,1, 0,0,-1,0,0,-1,0,0,-1,0,0,-1, 0,1,0,0,1,0,0,1,0,0,1,0, 0,-1,0,0,-1,0,0,-1,0,0,-1,0, 1,0,0,1,0,0,1,0,0,1,0,0, -1,0,0,-1,0,0,-1,0,0,-1,0,0];
  const uv=[0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1];
  const idx=[]; for(let f=0;f<6;f++){ const o=f*4; idx.push(o,o+1,o+2,o,o+2,o+3); }
  return mesh(name,p,n,uv,idx,material);
}
function plane(name, sx, sy, material) {
  const x=sx/2,y=sy/2;
  return mesh(name,[-x,-y,0,x,-y,0,x,y,0,-x,y,0],[0,0,1,0,0,1,0,0,1,0,0,1],[0,0,1,0,1,1,0,1],[0,1,2,0,2,3],material);
}
const barkBase = addImage(png(16,16,(x,y)=>[90 + ((x*13+y*7)%45), 58 + ((x*5+y*3)%28), 33 + ((x*9+y*11)%24), 255]), 'tree_bark_basecolor.png');
const barkNormal = addImage(png(16,16,(x,y)=>[128 + ((x+y)%3-1)*12,128,255,255]), 'tree_bark_normal.png');
const barkRough = addImage(png(16,16,(x,y)=>[0,178 + ((x*17+y*19)%42),0,255]), 'tree_bark_roughness.png');
const leafBase = addImage(png(8,8,(x,y)=>[44,115 + ((x+y)%4)*12,60, x===0||y===0||x===7||y===7 ? 180 : 255]), 'tree_leaf_basecolor.png');
const frameBase = addImage(png(8,8,(x,y)=>[225,210,170,255]), 'idea_frame_sample_basecolor.png');
[barkBase,barkNormal,barkRough,leafBase,frameBase].forEach((source, i)=>textures.push({ source }));
materials.push({ name:'MAT_tree_bark_validation', pbrMetallicRoughness:{ baseColorTexture:{index:0}, metallicFactor:0, roughnessFactor:0.82, metallicRoughnessTexture:{index:2}}, normalTexture:{index:1, scale:0.65}, doubleSided:false });
materials.push({ name:'MAT_leaf_atlas_validation', pbrMetallicRoughness:{ baseColorTexture:{index:3}, metallicFactor:0, roughnessFactor:0.74}, alphaMode:'BLEND', doubleSided:true });
materials.push({ name:'MAT_rope_validation', pbrMetallicRoughness:{ baseColorFactor:[0.34,0.22,0.1,1], metallicFactor:0, roughnessFactor:0.9}, doubleSided:false });
materials.push({ name:'MAT_frame_sample_validation', pbrMetallicRoughness:{ baseColorTexture:{index:4}, metallicFactor:0, roughnessFactor:0.52}, doubleSided:true });
const trunkMesh = box('Trunk_mesh', 1.1, 6.4, 0.72, 0);
const branchMesh = box('MainBranches_mesh', 6.8, 0.42, 0.38, 0);
const leafMesh = plane('LeafCluster_01_mesh', 4.4, 1.4, 1);
const ropeMesh = box('Rope_01_mesh', 0.08, 1.6, 0.08, 2);
const frameMesh = box('Frame_Validation_mesh', 1.25, 0.85, 0.08, 3);
const anchorNodes = [
  ['Anchor_Trunk_01', [-1.05, 6.1, -0.18], [0, 0.18, -0.06, 'euler']],
  ['Anchor_Trunk_02', [0.92, 5.05, -0.2], [0, -0.16, 0.04, 'euler']],
  ['Anchor_Branch_L_01', [-3.85, 8.1, -0.24], [0, 0.26, -0.08, 'euler']],
  ['Anchor_Branch_L_02', [-2.65, 10.0, -0.26], [0, 0.18, 0.06, 'euler']],
  ['Anchor_Branch_R_01', [3.6, 8.35, -0.24], [0, -0.24, 0.08, 'euler']],
  ['Anchor_Branch_R_02', [2.35, 10.15, -0.26], [0, -0.16, -0.06, 'euler']],
  ['Anchor_Hanging_01', [-4.75, 6.15, -0.32], [0, 0.18, 0, 'euler']],
  ['Anchor_Hanging_02', [-1.85, 8.55, -0.34], [0, 0.08, 0, 'euler']],
  ['Anchor_Hanging_03', [1.85, 8.55, -0.34], [0, -0.08, 0, 'euler']],
  ['Anchor_Hanging_04', [4.75, 6.15, -0.32], [0, -0.18, 0, 'euler']]
].map(([name,t])=>node(name,{translation:t}));
const treeStatic = node('TreeStatic', { children:[
  node('Trunk', { mesh: trunkMesh, translation:[0,3.2,0] }),
  node('MainBranches', { mesh: branchMesh, translation:[0,7.7,-0.05], rotation:[0,0,0.08,0.9968] }),
  node('ButtressRoots', { mesh: box('ButtressRoots_mesh', 2.2, 0.6, 1.0, 0), translation:[0,0.35,0.08] }),
  node('SecondaryBranches', { mesh: box('SecondaryBranches_mesh', 4.4, 0.22, 0.25, 0), translation:[0,9.4,-0.08], rotation:[0,0,-0.14,0.9902] })
]});
const foliage = node('Foliage', { children:[node('LeafCluster_01', { mesh: leafMesh, translation:[0,9.2,-0.28] })] });
const frameAnchors = node('FrameAnchors', { children: anchorNodes });
const hanging = node('HangingSystem', { children:[node('Rope_01', { mesh: ropeMesh, translation:[-4.75,6.85,-0.34] })] });
const ideaFrames = node('IdeaFrames', { children:[node('Frame_Validation', { mesh: frameMesh, translation:[0,5.9,-0.45] })] });
const lighting = node('LightingHelpers', { children:[node('AccentTarget_01'), node('AccentTarget_02')] });
const hotspots = node('InteractionHotspots', { children:[node('Hotspot_01'), node('Hotspot_02')] });
const root = node('IdeaTreeRoot', { children:[treeStatic, foliage, frameAnchors, hanging, ideaFrames, lighting, hotspots] });
let bin = Buffer.alloc(chunks.reduce((s,c)=>s+align4(c.data.length),0));
let cursor=0; chunks.forEach(c=>{ c.data.copy(bin,cursor); cursor += align4(c.data.length); });
const gltf = { asset:{version:'2.0',generator:'Codex validation GLB'}, scene:0, scenes:[{name:'IdeaTreeValidationScene',nodes:[root]}], nodes, meshes, materials, textures, images, accessors, bufferViews, buffers:[{byteLength:bin.length}] };
let json = Buffer.from(JSON.stringify(gltf),'utf8');
json = Buffer.concat([json, Buffer.alloc((4-json.length%4)%4,0x20)]);
bin = Buffer.concat([bin, Buffer.alloc((4-bin.length%4)%4)]);
const total = 12 + 8 + json.length + 8 + bin.length;
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67,0); header.writeUInt32LE(2,4); header.writeUInt32LE(total,8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length,0); jh.writeUInt32LE(0x4e4f534a,4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length,0); bh.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(outPath, Buffer.concat([header,jh,json,bh,bin]));
console.log(outPath);

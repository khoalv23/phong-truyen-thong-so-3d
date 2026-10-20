import * as THREE from "three";
import { GOC1_CONTENT, GOC1_TEXT } from "../data/goc1-digital-transformation.js";
import { GOC1_SELECTED_MEDIA } from "../data/goc1-selected-media.js";
import { EXHIBIT_LIFT_Y } from "../config/scene-config.js";

import { createInternationalTopicSign } from '../core/international-topic-sign.js';

const FRAME_MAT = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .32, metalness: .62 });
const BOARD_MAT = new THREE.MeshBasicMaterial({ color: 0xffffff });

function sourceUrl(source) { return encodeURI(source); }

function createImageTexture(source, renderer) {
  if (!source) return null;
  const texture = new THREE.TextureLoader().load(sourceUrl(source));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  return texture;
}

function createPlaceholderTexture(title = "CHO BO SUNG ANH") {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 760;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f5f2e9"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d6a84b"; ctx.lineWidth = 18; ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
  ctx.fillStyle = "#234d6f"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 58px Roboto, Arial, sans-serif"; ctx.fillText(title, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addHorizontalNameSign(addTextPanel, parent, text, position, size, rotationY, opts = {}) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  const [width, height] = size;
  const panel = addTextPanel(text, [0, .025, .038], size, 0, {
    size: Math.max(opts.size ?? 54, 40), minFontSize: Math.max(opts.minFontSize ?? 34, 30),
    color: "#FFFFFF", background: "#234D6F", weight: opts.weight ?? 900, wrap: opts.wrap ?? false,
    width: opts.width ?? 1800, height: opts.height ?? 360, maxWidth: opts.maxWidth,
    border: true, accent: "#D6A84B", borderWidth: opts.borderWidth ?? 12,
    fitSingleLine: opts.fitSingleLine ?? false, lineHeight: opts.lineHeight, unlit: true
  }, group);
  return panel;
}

function addLabel(addTextPanel, parent, text, position, size, rotationY, opts = {}) {
  return addHorizontalNameSign(addTextPanel, parent, text, position, size, rotationY, {
    ...opts, size: Math.max(opts.size ?? 48, 46), minFontSize: Math.max(opts.minFontSize ?? 36, 36),
    width: opts.width ?? 1600, height: opts.height ?? 360, borderWidth: 12
  });
}

export function FramedImage({ parent, source, title, description, position, size, renderer, registerArtifact, registerInteractive, groupLabel = "G\u00f3c 1 \u2013 Chuy\u1ec3n \u0111\u1ed5i s\u1ed1", frameType = "photo", fitFrameToImage = frameType === "photo" }) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);
  const [width, height] = size;
  const isDevice = frameType === "phone" || frameType === "desktop";
  const outer = new THREE.Mesh(new THREE.BoxGeometry(width + .28, height + .28, .075), new THREE.MeshStandardMaterial({ color: isDevice ? 0x172032 : 0xd6a84b, roughness: .34, metalness: .42 }));
  outer.position.z = .035;
  const gold = new THREE.Mesh(new THREE.BoxGeometry(width + .12, height + .12, .032), new THREE.MeshStandardMaterial({ color: 0xd6a84b, roughness: .34, metalness: .42 }));
  gold.position.z = .082;
  const matte = new THREE.Mesh(new THREE.BoxGeometry(width, height, .018), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  matte.position.z = .108;
  group.add(outer, gold, matte);

  const texture = createImageTexture(source, renderer) || createPlaceholderTexture(title);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
  const fitImage = () => {
    const aspect = texture.image?.width && texture.image?.height ? texture.image.width / texture.image.height : width / height;
    const drawWidth = Math.min(width - .12, (height - .12) * aspect);
    const drawHeight = drawWidth / aspect;
    photo.scale.set(drawWidth, drawHeight, 1);
    if (fitFrameToImage) {
      outer.scale.set((drawWidth + .40) / (width + .28), (drawHeight + .40) / (height + .28), 1);
      gold.scale.set((drawWidth + .24) / (width + .12), (drawHeight + .24) / (height + .12), 1);
      matte.scale.set((drawWidth + .12) / width, (drawHeight + .12) / height, 1);
    }
  };
  texture.onUpdate = fitImage;
  fitImage();
  photo.position.z = .125;
  photo.renderOrder = 4;
  if (source) {
    const id = registerArtifact({ title, description, group: groupLabel, image: sourceUrl(source) });
    photo.userData = { kind: "artifact", id };
    registerInteractive(photo);
  }
  group.add(photo);
  if (frameType === "phone") {
    const deviceMat = new THREE.MeshStandardMaterial({ color: 0x172032, roughness: .30, metalness: .58 });
    const speaker = new THREE.Mesh(new THREE.BoxGeometry(width * .28, .035, .035), deviceMat);
    speaker.position.set(0, height / 2 - .10, .15);
    const homeIndicator = new THREE.Mesh(new THREE.BoxGeometry(width * .34, .035, .035), deviceMat);
    homeIndicator.position.set(0, -height / 2 + .10, .15);
    const sideButton = new THREE.Mesh(new THREE.BoxGeometry(.045, height * .18, .035), deviceMat);
    sideButton.position.set(width / 2 + .16, height * .16, .08);
    group.add(speaker, homeIndicator, sideButton);
  } else if (frameType === "desktop") {
    const deviceMat = new THREE.MeshStandardMaterial({ color: 0x172032, roughness: .30, metalness: .58 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(width * .12, .38, .10), deviceMat);
    stand.position.set(0, -height / 2 - .26, .05);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(width * .42, .10, .12), deviceMat);
    foot.position.set(0, -height / 2 - .50, .05);
    group.add(stand, foot);
  }
  return group;
}

function addPhoto({ parent, source, title, description, position, size, rotationY, renderer, registerArtifact, registerInteractive, accent = 0x3f8fb7 }) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  const [w, h] = size;
  const railMat = FRAME_MAT;
  const backing = new THREE.Mesh(new THREE.BoxGeometry(w + .22, h + .22, .07), BOARD_MAT);
  backing.position.z = .02;
  group.add(backing);
  [[w + .34, .11, 0, h / 2 + .12], [w + .34, .11, 0, -h / 2 - .12], [.11, h + .34, -w / 2 - .12, 0], [.11, h + .34, w / 2 + .12, 0]].forEach(([rw, rh, x, y]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, .12), railMat);
    rail.position.set(x, y, .09);
    group.add(rail);
  });
  const texture = createImageTexture(source, renderer);
  const photoMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), photoMaterial);
  const fitImage = () => {
    const aspect = texture.image?.width && texture.image?.height ? texture.image.width / texture.image.height : w / h;
    const drawW = Math.min(w, h * aspect);
    photo.scale.set(drawW, drawW / aspect, 1);
  };
  texture.onUpdate = fitImage;
  fitImage();
  photo.position.z = .16;
  photo.renderOrder = 3;
  const id = registerArtifact({ title, description, group: "Góc 1 – Chuyển đổi số", image: sourceUrl(source) });
  photo.userData = { kind: "artifact", id };
  registerInteractive(photo);
  group.add(photo);
  return group;
}

function addPhotoGrid({ parent, assets, title, description, origin, cols, rows, cell, gap, rotationY, renderer, registerArtifact, registerInteractive, accent }) {
  const [x, y, z] = origin;
  assets.forEach((source, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    if (row >= rows) return;
    const localX = (col - (cols - 1) / 2) * (cell[0] + gap[0]);
    const localY = ((rows - 1) / 2 - row) * (cell[1] + gap[1]);
    const alongX = Math.abs(Math.cos(rotationY)) > .5 ? localX : 0;
    const alongZ = Math.abs(Math.sin(rotationY)) > .5 ? localX : 0;
    addPhoto({ parent, source, title: `${title} · Ảnh ${index + 1}`, description, position: [x + alongX, y + localY, z + alongZ], size: cell, rotationY, renderer, registerArtifact, registerInteractive, accent });
  });
}


function addSpot(parent, position, target, intensity = 3.1) {
  const light = new THREE.SpotLight(0xffe4b2, intensity, 18, Math.PI / 6, .45, 1.2);
  light.position.set(...position);
  light.target.position.set(...target);
  light.userData.keepRealLight = true;
  light.castShadow = false;
  parent.add(light, light.target);
}

function addVideoScreen({ parent, renderer, addTextPanel, registerInteractive, requestRender, setVideoActive, position = [-17.58, 10.2, 58.5], rotationY = Math.PI / 2, size = [5.8, 3.3] }) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  const [w, h] = size;
  const placeholder = createImageTexture(GOC1_CONTENT.community.vtvStills[0], renderer);
  const screenMat = new THREE.MeshBasicMaterial({ map: placeholder, side: THREE.DoubleSide });
  group.position.z = .055;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + .26, h + .26, .035), FRAME_MAT);
  frame.position.z = .018;
  group.add(frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat);
  screen.position.z = .041;
  group.add(screen);
  const video = document.createElement("video");
  video.src = sourceUrl(GOC1_CONTENT.community.video);
  video.preload = "auto";
  video.autoplay = true;
  video.playsInline = true;
  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  let texture = null;
  let resetTimer = null;

  const ensureTexture = () => {
    if (texture) return;
    texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    screenMat.map = texture;
    screenMat.needsUpdate = true;
  };
  const startPlayback = () => { ensureTexture(); video.play().then(() => setVideoActive(true)).catch(() => setVideoActive(false)); };
  video.addEventListener("canplay", startPlayback, { once: true });
  const playPause = () => {
    clearTimeout(resetTimer);
    if (video.paused) {
      ensureTexture();
      video.play().then(() => setVideoActive(true)).catch(() => setVideoActive(false));
    } else {
      video.pause();
      setVideoActive(false);
    }
  };
  const mute = () => { video.muted = !video.muted; requestRender(); };
  const muteControl = new THREE.Mesh(new THREE.CircleGeometry(.24, 24), new THREE.MeshBasicMaterial({ color: 0x0b5e9c, transparent: true, opacity: .58 }));
  muteControl.position.set(-w / 2 + .34, -h / 2 + .34, .055);
  muteControl.userData = { kind: "goc1Action", action: mute };
  registerInteractive(muteControl);
  group.add(muteControl);
  addTextPanel("🔇", [-w / 2 + .34, -h / 2 + .34, .058], [.25, .25], 0, { size: 38, color: "#FFFFFF", background: "transparent", border: false, weight: 900, wrap: false, width: 256, height: 256, unlit: true }, group);
  screen.userData = { kind: "goc1Action", action: playPause };
  registerInteractive(screen);
  return {
    sync() {},
    dispose() { clearTimeout(resetTimer); video.pause(); video.removeAttribute("src"); video.load(); texture?.dispose(); placeholder.dispose(); }
  };
}

function addGallery({ parent, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, description, position = [-17.58, 9.6, 48], rotationY = Math.PI / 2 }) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  group.position.z = .055;
  const galleryFrame = new THREE.Mesh(new THREE.BoxGeometry(6.7, 5.15, .035), panelMaterial(DOAN_BLUE)); galleryFrame.position.z=.018;
  const galleryGold = new THREE.Mesh(new THREE.BoxGeometry(6.45, 4.90, .014), panelMaterial(GOLD,.08)); galleryGold.position.z=.042;
  const galleryFace = new THREE.Mesh(new THREE.BoxGeometry(6.25, 4.70, .010), panelMaterial(WHITE,.06)); galleryFace.position.z=.054;
  group.add(galleryFrame,galleryGold,galleryFace);
  addTextPanel('GALLERY SỐ · CHỌN TÁC PHẨM', [0, 2.22, .072], [5.90, .55], 0, { size: 38, minFontSize: 34, color: '#FFFFFF', background: '#0B5E9C', border: true, accent: '#D6B86F', borderWidth: 10, weight: 900, wrap: false, width: 1600, height: 300, unlit: true }, group);
  const galleryAccent = new THREE.Mesh(new THREE.BoxGeometry(5.50, .06, .04), panelMaterial(RED, .04));
  galleryAccent.position.set(0, 1.89, .076);
  group.add(galleryAccent);
  const pages = GOC1_CONTENT.oceanWorks.map((image, index) => ({ image: sourceUrl(image), title: `Tác phẩm dự thi ${String(index + 1).padStart(2, "0")}`, description: description || "ECHOES OF THE OCEAN – Âm vang biển xanh", kicker: "Gallery số" }));
  const cellW = 1.14, cellH = 1.42;
  GOC1_CONTENT.oceanWorks.forEach((source, index) => {
    const col = index % 5, row = Math.floor(index / 5);
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set((col - 2) * 1.31, .75 - row * 1.85, .072);
    const thumbOuter = new THREE.Mesh(new THREE.PlaneGeometry(cellW + .16, cellH + .16), new THREE.MeshBasicMaterial({ color: DOAN_BLUE, side: THREE.DoubleSide }));
    const thumbGold = new THREE.Mesh(new THREE.PlaneGeometry(cellW + .08, cellH + .08), new THREE.MeshBasicMaterial({ color: GOLD, side: THREE.DoubleSide }));
    thumbGold.position.z = .01;
    const thumbBacking = new THREE.Mesh(new THREE.PlaneGeometry(cellW, cellH), new THREE.MeshBasicMaterial({ color: WHITE, side: THREE.DoubleSide }));
    thumbBacking.position.z = .02;
    thumbGroup.add(thumbOuter, thumbGold, thumbBacking);
    const thumbTexture = createImageTexture(source, renderer);
    const thumb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: thumbTexture, side: THREE.DoubleSide }));
    const fitThumb = () => { const aspect = thumbTexture.image?.width && thumbTexture.image?.height ? thumbTexture.image.width / thumbTexture.image.height : cellW / cellH; const drawW = Math.min(cellW, cellH * aspect); thumb.scale.set(drawW, drawW / aspect, 1); };
    thumbTexture.onUpdate = fitThumb; fitThumb(); thumb.position.z = .03;
    thumbGroup.add(thumb);
    const id = registerArtifact({ title: pages[index].title, description: pages[index].description, group: "ECHOES OF THE OCEAN", image: pages[index].image, pages, initialPage: index, idleMs: 45000 });
    thumb.userData = { kind: "artifact", id };
    registerInteractive(thumb);
    group.add(thumbGroup);
  });
  return group;
}

const DOAN_BLUE = 0x0b5e9c;
const GOLD = 0xd6b86f;
const RED = 0xa9252b;
const WHITE = 0xffffff;

function panelMaterial(color, depth = .12) {
  return new THREE.MeshStandardMaterial({ color, roughness: .48, metalness: depth > .1 ? .16 : .04 });
}

export function SectionPanel(parent, { position, size, mountZ }) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], mountZ ?? (position[2] > .21 ? .045 : .0));
  parent.add(group);
  const [w, h] = size;
  const outer = new THREE.Mesh(new THREE.BoxGeometry(w, h, .025), panelMaterial(DOAN_BLUE));
  outer.position.z = .013;
  const gold = new THREE.Mesh(new THREE.BoxGeometry(w - .28, h - .28, .012), panelMaterial(GOLD, .08));
  gold.position.z = .032;
  const face = new THREE.Mesh(new THREE.BoxGeometry(w - .48, h - .48, .008), new THREE.MeshBasicMaterial({ color: WHITE }));
  face.position.z = .042;
  group.add(outer, gold, face);
  return group;
}

export function SectionHeader(addTextPanel, parent, text, y, width) {
  return addHorizontalNameSign(addTextPanel, parent, text, [0, y, .060], [width, 1.05], 0, {
    size: 54, minFontSize: 40, width: 1800, height: 320, wrap: true
  });
}

export function SectionHeaderAt(addTextPanel, parent, text, x, y, width, mountZ = .060) {
  return addHorizontalNameSign(addTextPanel, parent, text, [x, y, mountZ], [width, 1.34], 0, {
    size: 54, minFontSize: 54, width: 1800, height: 420, wrap: false
  });
}

export function YearBadge(addTextPanel, parent, text, x, y, mountZ = .065) {
  return addTextPanel(text, [x, y, mountZ], [2.55, .68], 0, {
    size: 46, minFontSize: 40, color: '#FFFFFF', background: '#A9252B',
    border: true, accent: '#D6B86F', borderWidth: 10, weight: 900, wrap: false,
    width: 760, height: 220
  }, parent);
}

function CaptionBar(addTextPanel, parent, text, y, width, x = 0) {
  return addHorizontalNameSign(addTextPanel, parent, text, [x, y, .065], [width, 1.30], 0, {
    size: 58, minFontSize: 52, width: 1700, height: 520, lineHeight: 76, wrap: false
  });
}

function buildCommunityWallLegacy({ root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const wall = new THREE.Group();
  wall.position.set(-17.34, 0, 60.5);
  wall.rotation.y = Math.PI / 2;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallC, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallCSub, [0, 17.55, .30], [31, 1.50]);

  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const summerDesc = 'Đội Bình dân học vụ số triển khai các hoạt động dạy học, hỗ trợ học sinh tiếp cận công nghệ số và AI trong Chiến dịch Mùa hè xanh 2026; đồng thời lan tỏa văn hóa đọc và tinh thần tình nguyện trong cộng đồng.';
  const vtvDesc = 'Phóng sự “Buổi sáng thức giấc” trên VTV1 giới thiệu Đội Bình dân học vụ số Trường Đại học Sư phạm Hà Nội như một mô hình thanh niên tiêu biểu trong thực hiện chuyển đổi số quốc gia.';

  FramedImage({ parent: board, source: GOC1_CONTENT.community.summer[0], title: 'Mùa hè xanh 2026 – Đưa tri thức số vào thực tiễn', description: summerDesc, position: [-11.4, 1.25, .26], size: [7.15, 4.70], renderer, registerArtifact, registerInteractive });
  [[-14.05, -2.65], [-11.35, -2.65], [-8.65, -2.65]].forEach(([x, y], index) => FramedImage({ parent: board, source: GOC1_CONTENT.community.summer[index + 1], title: 'Hành động cộng đồng', description: summerDesc, position: [x, y, .26], size: [2.40, 1.65], renderer, registerArtifact, registerInteractive }));

  const videoController = addVideoScreen({ parent: board, renderer, addTextPanel, registerInteractive, requestRender, setVideoActive, position: [0, 1.15, .28], rotationY: 0, size: [9.2, 5.15] });
  GOC1_CONTENT.community.vtvStills.forEach((source, index) => FramedImage({ parent: board, source, title: 'Phóng sự VTV1 – Buổi sáng thức giấc', description: vtvDesc, position: [-2.35 + index * 4.70, -3.15, .26], size: [4.25, 1.80], renderer, registerArtifact, registerInteractive }));

  FramedImage({ parent: board, source: GOC1_CONTENT.community.summer[4], title: 'Lan tỏa kỹ năng số trong cộng đồng', description: summerDesc, position: [11.4, 1.25, .26], size: [7.15, 4.70], renderer, registerArtifact, registerInteractive });
  [[10.0, -2.65], [12.8, -2.65]].forEach(([x, y], index) => FramedImage({ parent: board, source: GOC1_CONTENT.community.summer[index + 5], title: 'Hành động cộng đồng', description: summerDesc, position: [x, y, .26], size: [2.50, 1.65], renderer, registerArtifact, registerInteractive }));
  return videoController;
}

function buildTeamTimelineWallLegacy({ root, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const wall = new THREE.Group();
  wall.position.set(0, 0, 77.22);
  wall.rotation.y = Math.PI;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallB, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallBSub, [0, 17.55, .30], [31, 1.50]);

  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const start = SectionPanel(board, { position: [-11.25, -.15, .22], size: [9.0, 10.9], mountZ: 0 });
  const core = SectionPanel(board, { position: [0, -.15, .22], size: [12.5, 10.9], mountZ: 0 });
  const spread = SectionPanel(board, { position: [11.25, -.15, .22], size: [9.0, 10.9], mountZ: 0 });
  SectionHeader(addTextPanel, start, 'KHỞI XƯỚNG PHONG TRÀO', 4.75, 8.4);
  SectionHeader(addTextPanel, core, 'LỰC LƯỢNG NÒNG CỐT', 4.75, 11.9);
  SectionHeader(addTextPanel, spread, 'LAN TỎA KỸ NĂNG SỐ', 4.75, 8.4);

  const trainingDesc = 'Ngày 28/10/2025, Đoàn Trường Đại học Sư phạm Hà Nội tổ chức Lễ phát động phong trào “Bình dân học vụ số” kết hợp tập huấn kỹ năng cán bộ Đoàn chủ chốt, góp phần nâng cao năng lực số và thúc đẩy chuyển đổi số trong hoạt động Đoàn – Hội – Sinh viên.';
  const launchDesc = 'Lễ ra mắt Đội Bình dân học vụ số đánh dấu sự hình thành lực lượng nòng cốt triển khai hoạt động lan tỏa tri thức, hỗ trợ học tập và thúc đẩy tiếp cận công nghệ số.';
  const outreachDesc = 'Từ lực lượng nòng cốt, phong trào mở rộng thành các hành trình lan tỏa tri thức và nâng cao kỹ năng số cho đoàn viên, thanh niên và cộng đồng.';

  FramedImage({ parent: start, source: GOC1_CONTENT.movement.training[0], title: 'Phát động phong trào Bình dân học vụ số', description: trainingDesc, position: [0, 1.25, .26], size: [7.2, 4.55], renderer, registerArtifact, registerInteractive });
  FramedImage({ parent: start, source: GOC1_CONTENT.movement.training[1], title: 'Tập huấn kỹ năng cán bộ Đoàn', description: trainingDesc, position: [0, -2.65, .26], size: [5.8, 2.25], renderer, registerArtifact, registerInteractive });

  FramedImage({ parent: core, source: GOC1_CONTENT.movement.launch[0], title: 'Lực lượng nòng cốt của phong trào', description: launchDesc, position: [0, 1.15, .26], size: [10.25, 5.05], renderer, registerArtifact, registerInteractive });
  FramedImage({ parent: core, source: GOC1_CONTENT.movement.launch[1], title: 'Ra mắt Đội Bình dân học vụ số', description: launchDesc, position: [0, -2.80, .26], size: [7.8, 2.15], renderer, registerArtifact, registerInteractive });

  FramedImage({ parent: spread, source: GOC1_CONTENT.movement.outreach[0], title: 'Hành trình lan tỏa tri thức số', description: outreachDesc, position: [0, 1.25, .26], size: [7.2, 4.55], renderer, registerArtifact, registerInteractive });
  FramedImage({ parent: spread, source: GOC1_CONTENT.movement.outreach[1], title: 'Nâng cao kỹ năng số cho cộng đồng', description: outreachDesc, position: [0, -2.65, .26], size: [5.8, 2.25], renderer, registerArtifact, registerInteractive });
}

function buildTeamTimelineWallArchive({ root, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const wall = new THREE.Group(); wall.position.set(0, 0, 77.22); wall.rotation.y = Math.PI; root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallB, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallBSub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const items = [
    { x: -10.5, title: "T\u1eacP HU\u1ea4N V\u00c0 TH\u00cdCH \u1ee8NG", source: GOC1_CONTENT.movement.training[0], caption: "T\u1eadp hu\u1ea5n k\u1ef9 n\u0103ng c\u00e1n b\u1ed9 \u0110o\u00e0n" },
    { x: 0, title: "KH\u1edeI X\u01af\u1edaNG V\u00c0 L\u1ef0C L\u01af\u1ee2NG", source: GOC1_CONTENT.movement.launch[0], caption: "L\u1ef1c l\u01b0\u1ee3ng n\u00f2ng c\u1ed1t c\u1ee7a phong tr\u00e0o" },
    { x: 10.5, title: "LAN T\u1eceA K\u1ef8 N\u0102NG S\u1ed0", source: GOC1_CONTENT.movement.outreach[0], caption: "Lan t\u1ecfa tri th\u1ee9c v\u00e0 k\u1ef9 n\u0103ng s\u1ed1" }
  ];
  items.forEach(item => {
    const panel = SectionPanel(board, { position: [item.x, -.15, .22], size: [9.65, 10.9], mountZ: 0 });
    SectionHeader(addTextPanel, panel, item.title, 4.75, 9.05);
    FramedImage({ parent: panel, source: item.source, title: item.caption, description: item.caption, position: [0, .55, .26], size: [8.1, 5.45], renderer, registerArtifact, registerInteractive });
    CaptionBar(addTextPanel, panel, item.caption, -3.65, 8.8);
  });
}

function buildCommunityWallArchive({ root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const wall = new THREE.Group(); wall.position.set(-17.34, 0, 60.5); wall.rotation.y = Math.PI / 2; root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallC, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallCSub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const slots = [
    { x: -11.7, source: GOC1_CONTENT.community.summer[0], caption: "H\u1ed7 tr\u1ee3 c\u1ed9ng \u0111\u1ed3ng ti\u1ebfp c\u1eadn c\u00f4ng ngh\u1ec7 s\u1ed1" },
    { x: -4.0, source: GOC1_CONTENT.community.summer[4], caption: "Ho\u1ea1t \u0111\u1ed9ng t\u00ecnh nguy\u1ec7n chuy\u1ec3n \u0111\u1ed5i s\u1ed1" },
    { x: 4.0, source: "", caption: "H\u1ed7 tr\u1ee3 t\u1ea1i ph\u01b0\u1eddng C\u1ea7u Gi\u1ea5y" },
    { x: 11.7, source: "", caption: "Ph\u1ed1i h\u1ee3p h\u1ed7 tr\u1ee3 c\u00f9ng l\u1ef1c l\u01b0\u1ee3ng c\u00f4ng an" }
  ];
  slots.forEach(slot => {
    FramedImage({ parent: board, source: slot.source, title: slot.caption, description: slot.caption, position: [slot.x, .65, .26], size: [6.75, 5.45], renderer, registerArtifact, registerInteractive });
    CaptionBar(addTextPanel, board, slot.caption, -3.5, 7.0, slot.x);
  });
  return null;
}

function buildDigitalResilienceWallDetailedArchive({ root, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const wall = new THREE.Group();
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);

  const title = createInternationalTopicSign({addTextPanel,parent:wall,text:'CÁC HOẠT ĐỘNG TRÊN NỀN TẢNG SỐ',position:[0,19.54,.06]});
  RaisedCaptionText(addTextPanel, wall, 'L\u00fd t\u01b0\u1edfng v\u1eefng v\u00e0ng  \u00b7  \u1ee8ng x\u1eed v\u0103n minh  \u00b7  Th\u00edch \u1ee9ng ch\u1ee7 \u0111\u1ed9ng', [0, 17.55, .30], [31, 1.50]);

  const left = SectionPanel(wall, { position: [-9.55, 10.67, .20], size: [11.9, 12.0] });
  const sangMaiDesc = 'Cuộc thi “Sáng mãi tư tưởng Hồ Chí Minh” năm 2025–2026 được tổ chức nhằm nâng cao nhận thức chính trị, bồi dưỡng lý tưởng cách mạng; tăng cường giáo dục tư tưởng, đạo đức, phong cách Hồ Chí Minh và truyền thống cách mạng Việt Nam cho đoàn viên, thanh niên Trường Đại học Sư phạm Hà Nội.';
  SectionHeader(addTextPanel, left, 'S\u00c1NG M\u00c3I T\u01af T\u01af\u1edeNG H\u1ed2 CH\u00cd MINH', 5.0, 10.95);
  YearBadge(addTextPanel, left, '2025', -3.75, 3.95);
  YearBadge(addTextPanel, left, '2026', 3.75, 3.95);
  const leftTop = [[-3.65, 1.75], [0, 1.75], [3.65, 1.75]];
  GOC1_CONTENT.sangMai2025.forEach((source, index) => FramedImage({ parent: left, source, title: 'S\u00e1ng m\u00e3i t\u01b0 t\u01b0\u1edfng H\u1ed3 Ch\u00ed Minh 2025', description: sangMaiDesc, position: [...leftTop[index], .26], size: [3.25, 2.75], renderer, registerArtifact, registerInteractive }));
  const leftBottom = [[-4.05, -1.85], [-1.35, -1.85], [1.35, -1.85], [4.05, -1.85]];
  GOC1_CONTENT.sangMai2026.forEach((source, index) => FramedImage({ parent: left, source, title: 'S\u00e1ng m\u00e3i t\u01b0 t\u01b0\u1edfng H\u1ed3 Ch\u00ed Minh 2026', description: sangMaiDesc, position: [...leftBottom[index], .26], size: [2.35, 2.15], renderer, registerArtifact, registerInteractive }));

  const right = SectionPanel(wall, { position: [6.9, 10.67, .20], size: [18.4, 12.0] });
  SectionHeader(addTextPanel, right, 'KỸ NĂNG THÍCH ỨNG CỦA ĐOÀN VIÊN TRÊN MÔI TRƯỜNG SỐ', 5.0, 17.45);
  const talkTitle = 'Kỹ năng thích ứng của đoàn viên trên môi trường số';
  const talkDesc = 'Ngày 02/10/2026 tại Hội trường 11.10, tọa đàm trang bị kiến thức về văn hóa ứng xử trong môi trường đại học và không gian số; giúp sinh viên nhận thức rõ vai trò của văn hóa ứng xử đối với hình ảnh, uy tín và sự phát triển của bản thân trong bối cảnh chuyển đổi số.';
  FramedImage({ parent: right, source: GOC1_CONTENT.talks[0], title: talkTitle, description: talkDesc, position: [-4.6, 1.15, .26], size: [7.0, 4.85], renderer, registerArtifact, registerInteractive });
  [[1, 2.35], [5.05, 2.35], [1, -.15], [5.05, -.15]].forEach(([x, y], index) => FramedImage({ parent: right, source: GOC1_CONTENT.talks[index + 1], title: talkTitle, description: talkDesc, position: [x, y, .26], size: [3.55, 2.05], renderer, registerArtifact, registerInteractive }));
  [[-4.55, -3.0], [0, -3.0], [4.55, -3.0]].forEach(([x, y], index) => FramedImage({ parent: right, source: GOC1_CONTENT.talks[index + 5], title: talkTitle, description: talkDesc, position: [x, y, .26], size: [4.10, 2.35], renderer, registerArtifact, registerInteractive }));
}

function buildDigitalResilienceWallLegacy({ root, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const wall = new THREE.Group();
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallA, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallASub, [0, 17.55, .30], [31, 1.50]);

  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const platform = SectionPanel(board, { position: [-7.65, -.15, .22], size: [16.7, 10.9], mountZ: 0 });
  const skills = SectionPanel(board, { position: [8.75, -.15, .22], size: [14.9, 10.9], mountZ: 0 });
  SectionHeader(addTextPanel, platform, 'CÁC HOẠT ĐỘNG TRÊN NỀN TẢNG SỐ', 4.75, 16.1);
  SectionHeader(addTextPanel, skills, GOC1_TEXT.skills, 4.75, 14.3);

  const platformDesc = 'Chuyển đổi số mở rộng không gian hoạt động Đoàn thông qua ứng dụng quản lý, học tập nghị quyết, các cuộc thi trực tuyến và những hình thức sáng tạo, tương tác trên nền tảng số.';
  const sangMaiDesc = 'Cuộc thi “Sáng mãi tư tưởng Hồ Chí Minh” góp phần nâng cao nhận thức chính trị, bồi dưỡng lý tưởng cách mạng và giáo dục tư tưởng, đạo đức, phong cách Hồ Chí Minh cho đoàn viên, thanh niên.';
  const oceanDesc = 'Cuộc thi “Echoes of the Ocean – Âm vang biển xanh” sử dụng hình thức thiết kế poster và bình chọn trực tuyến để lan tỏa thông điệp về môi trường, biển và hải đảo Việt Nam.';
  FramedImage({ parent: platform, source: GOC1_CONTENT.platform.hnueYouth, title: 'Ứng dụng HNUE Youth', description: platformDesc, position: [-4.7, 2.05, .26], size: [5.7, 3.35], renderer, registerArtifact, registerInteractive });
  const platformCards = [
    [GOC1_CONTENT.platform.sangMai[0], 'Sáng mãi tư tưởng Hồ Chí Minh 2025', sangMaiDesc],
    [GOC1_CONTENT.platform.sangMai[1], 'Sáng mãi tư tưởng Hồ Chí Minh 2026', sangMaiDesc],
    [GOC1_CONTENT.platform.resolutionStudy, 'Học tập và quán triệt Nghị quyết trực tuyến', platformDesc],
    [GOC1_CONTENT.platform.congressQuiz, 'Tìm hiểu Nghị quyết Đại hội XIII', platformDesc],
    [GOC1_CONTENT.platform.electionQuiz, 'Cuộc thi trực tuyến tìm hiểu bầu cử', platformDesc]
  ];
  [[-6.1, -.75], [-3.25, -.75], [-.4, -.75], [-4.7, -3.15], [-1.85, -3.15]].forEach(([x, y], index) => {
    const [source, title, description] = platformCards[index];
    FramedImage({ parent: platform, source, title, description, position: [x, y, .26], size: [2.55, 1.65], renderer, registerArtifact, registerInteractive });
  });
  FramedImage({ parent: platform, source: GOC1_CONTENT.oceanPoster, title: 'Echoes of the Ocean – Âm vang biển xanh', description: oceanDesc, position: [4.45, 3.10, .26], size: [3.8, 1.75], renderer, registerArtifact, registerInteractive });
  addGallery({ parent: platform, renderer, addTextPanel, registerArtifact, registerInteractive, description: oceanDesc, position: [4.45, -.70, .28], rotationY: 0 });

  const talkDesc = 'Ngày 02/10/2026 tại Hội trường 11.10, tọa đàm trang bị kiến thức về văn hóa ứng xử trong môi trường đại học và không gian số, góp phần hình thành hình ảnh, uy tín và khả năng thích ứng của sinh viên.';
  const technologyDesc = 'Các chương trình tập huấn, hội thảo và tọa đàm giúp đoàn viên tiếp cận AI, blockchain và những công nghệ mới trong học tập, nghiên cứu khoa học và giáo dục.';
  FramedImage({ parent: skills, source: GOC1_CONTENT.skills.cultureTalk[0], title: GOC1_TEXT.skills, description: talkDesc, position: [-3.45, 1.20, .26], size: [6.15, 4.20], renderer, registerArtifact, registerInteractive });
  const skillCards = [
    [GOC1_CONTENT.skills.cultureTalk[1], GOC1_TEXT.skills, talkDesc],
    [GOC1_CONTENT.skills.aiTraining, 'Ứng dụng AI trong học tập và nghiên cứu khoa học', technologyDesc],
    [GOC1_CONTENT.skills.ilite, 'Hội thảo quốc tế ILITE 2025 – Dấu ấn AI', technologyDesc]
  ];
  [[3.35, 2.65], [3.35, .45], [3.35, -1.75]].forEach(([x, y], index) => {
    const [source, title, description] = skillCards[index];
    FramedImage({ parent: skills, source, title, description, position: [x, y, .26], size: [4.0, 1.75], renderer, registerArtifact, registerInteractive });
  });
  const lowerSkills = [GOC1_CONTENT.skills.cultureTalk[2], GOC1_CONTENT.skills.cultureTalk[3], ...GOC1_CONTENT.skills.blockchain];
  [-4.75, -1.60, 1.55, 4.70].forEach((x, index) => FramedImage({ parent: skills, source: lowerSkills[index], title: index < 2 ? GOC1_TEXT.skills : 'Blockchain và AI trong giáo dục', description: index < 2 ? talkDesc : technologyDesc, position: [x, -3.55, .26], size: [2.65, 1.45], renderer, registerArtifact, registerInteractive }));
}

function buildDigitalResilienceWallArchive({ root, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const wall = new THREE.Group();
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallA, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallASub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const sections = [
    { title: "QU\u1ea2N L\u00dd S\u1ed0", source: GOC1_CONTENT.platform.hnueYouth, caption: "H\u1ec7 th\u1ed1ng qu\u1ea3n l\u00fd \u0111o\u00e0n vi\u00ean", type: "desktop" },
    { title: "H\u1eccC T\u1eacP S\u1ed0", source: GOC1_CONTENT.platform.resolutionStudy, caption: "H\u1ecdc t\u1eadp ngh\u1ecb quy\u1ebft tr\u00ean n\u1ec1n t\u1ea3ng s\u1ed1", type: "phone" },
    { title: "S\u00c1NG T\u1ea0O S\u1ed0", source: GOC1_CONTENT.platform.electionQuiz, caption: "Ho\u1ea1t \u0111\u1ed9ng s\u00e1ng t\u1ea1o tr\u00ean \u1ee9ng d\u1ee5ng s\u1ed1", type: "phone" }
  ];
  sections.forEach((section, index) => {
    const x = (index - 1) * 10.35;
    const panel = SectionPanel(board, { position: [x, -.15, .22], size: [9.35, 10.9], mountZ: 0 });
    SectionHeader(addTextPanel, panel, section.title, 4.75, 8.75);
    const imageSize = section.type === "phone" ? [4.2, 5.9] : [7.7, 4.8];
    FramedImage({ parent: panel, source: section.source, title: section.caption, description: section.caption, position: [0, .65, .26], size: imageSize, frameType: section.type, renderer, registerArtifact, registerInteractive });
    CaptionBar(addTextPanel, panel, section.caption, -3.75, 8.4);
  });
}

function selectedMedia(zone) {
  return GOC1_SELECTED_MEDIA.filter(item => item.zone === zone);
}

function addSelectedVideoFrame({ parent, item, position, size, renderer, addTextPanel, registerInteractive, requestRender, setVideoActive }) {
  const group = new THREE.Group();
  group.position.set(...position);
  parent.add(group);
  const [width, height] = size;
  const outer = new THREE.Mesh(new THREE.BoxGeometry(width + .28, height + .28, .075), FRAME_MAT);
  outer.position.z = .035;
  const gold = new THREE.Mesh(new THREE.BoxGeometry(width + .12, height + .12, .032), FRAME_MAT);
  gold.position.z = .082;
  const matte = new THREE.Mesh(new THREE.BoxGeometry(width, height, .018), BOARD_MAT);
  matte.position.z = .108;
  const poster = createImageTexture(item.posterPath, renderer);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: poster, color: poster ? 0xffffff : 0x101820, side: THREE.DoubleSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), screenMaterial);
  const fitScreen = aspect => {
    const maxWidth = width - .12;
    const maxHeight = height - .12;
    const drawWidth = Math.min(maxWidth, maxHeight * aspect);
    screen.scale.set(drawWidth, drawWidth / aspect, 1);
  };
  const fitPoster = () => fitScreen(poster?.image?.width && poster?.image?.height ? poster.image.width / poster.image.height : width / height);
  if (poster) poster.onUpdate = fitPoster;
  fitPoster();
  screen.position.z = .125;
  group.add(outer, gold, matte, screen);

  const video = document.createElement("video");
  video.src = sourceUrl(item.displayPath);
  video.preload = "auto";
  video.autoplay = true;
  video.playsInline = true;
  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight) fitScreen(video.videoWidth / video.videoHeight);
  });
  let texture = null;
  let disposed = false;
  let playPending = false;
  let retryPlaybackAt = 0;
  const ensureTexture = () => {
    if (texture) return;
    texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    screenMaterial.map = texture;
    screenMaterial.needsUpdate = true;
  };
  const startPlayback = () => {
    if (disposed || !video.paused || playPending || Date.now() < retryPlaybackAt) return;
    ensureTexture();
    playPending = true;
    video.play()
      .then(() => setVideoActive?.(true))
      .catch(() => {
        retryPlaybackAt = Date.now() + 2000;
        setVideoActive?.(false);
      })
      .finally(() => { playPending = false; });
    requestRender?.();
  };
  video.addEventListener("canplay", startPlayback, { once: true });
  screen.userData = { kind: "goc1Action", action: startPlayback };
  registerInteractive(screen);
  const playLabel = addTextPanel("▶  VIDEO", [0, 0, .145], [2.7, .72], 0, {
    size: 42, minFontSize: 34, color: "#FFFFFF", background: "#0B5E9C",
    border: true, accent: "#D6B86F", borderWidth: 9, weight: 900,
    wrap: false, width: 720, height: 220, unlit: true
  }, group);
  playLabel.userData = { kind: "goc1Action", action: startPlayback };
  registerInteractive(playLabel);
  startPlayback();
  return {
    sync() { startPlayback(); },
    dispose() {
      disposed = true;
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture?.dispose();
      poster?.dispose();
    }
  };
}

function addSelectedMediaGrid({
  board, items, cols, cardSize, stepX, stepY, renderer, addTextPanel,
  registerArtifact, registerInteractive, requestRender, setVideoActive
}) {
  const controllers = [];
  const rows = Math.ceil(items.length / cols);
  items.forEach((item, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const rowCount = Math.min(cols, items.length - row * cols);
    const x = (col - (rowCount - 1) / 2) * stepX;
    const y = ((rows - 1) / 2 - row) * stepY;
    if (item.mediaType === "video") {
      controllers.push(addSelectedVideoFrame({
        parent: board, item, position: [x, y, .26], size: cardSize, renderer,
        addTextPanel, registerInteractive, requestRender, setVideoActive
      }));
    } else {
      const presentation = item.number === 7
        ? { size: [1.55, 3.45], frameType: "phone" }
        : item.number === 8
          ? { size: [4.9, 3.05], frameType: "desktop" }
          : { size: cardSize, frameType: "photo" };
      FramedImage({
        parent: board, source: item.displayPath, title: item.title, description: item.caption,
        position: [x, y, .26], size: presentation.size, frameType: presentation.frameType,
        renderer, registerArtifact, registerInteractive
      });
    }
  });
  return {
    sync() { controllers.forEach(controller => controller.sync?.()); },
    dispose() { controllers.forEach(controller => controller.dispose?.()); }
  };
}

function buildDigitalResilienceWall({ root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const wall = new THREE.Group();
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallA, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallASub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const platformItems = selectedMedia("platform");
  const onlineItems = platformItems.filter(item => [5, 7, 8, 9].includes(item.number));
  const seminarItems = platformItems.filter(item => [1, 2, 3, 4].includes(item.number));
  const onlinePanel = SectionPanel(board, { position: [-8.05, -.15, .22], size: [15.45, 10.9], mountZ: 0 });
  const seminarPanel = SectionPanel(board, { position: [8.05, -.15, .22], size: [15.45, 10.9], mountZ: 0 });
  SectionHeader(addTextPanel, onlinePanel, "HOẠT ĐỘNG ONLINE", 4.75, 14.75);
  SectionHeader(addTextPanel, seminarPanel, "TỌA ĐÀM – TẬP HUẤN", 4.75, 14.75);
  const shared = {
    cols: 2, cardSize: [6.15, 3.25], stepX: 7.05, stepY: 4.15,
    renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive
  };
  const controllers = [
    addSelectedMediaGrid({ board: onlinePanel, items: onlineItems, ...shared }),
    addSelectedMediaGrid({ board: seminarPanel, items: seminarItems, ...shared })
  ];
  return {
    sync() { controllers.forEach(controller => controller?.sync?.()); },
    dispose() { controllers.forEach(controller => controller?.dispose?.()); }
  };
}

function buildTeamTimelineWall({ root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const wall = new THREE.Group();
  wall.position.set(0, 0, 77.22);
  wall.rotation.y = Math.PI;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallB, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallBSub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  return addSelectedMediaGrid({
    board, items: selectedMedia("movement"), cols: 3, cardSize: [8.4, 4.35],
    stepX: 10.1, stepY: 5.0, renderer, addTextPanel, registerArtifact,
    registerInteractive, requestRender, setVideoActive
  });
}

function buildCommunityWall({ root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const wall = new THREE.Group();
  wall.position.set(-17.34, 0, 60.5);
  wall.rotation.y = Math.PI / 2;
  root.add(wall);
  createInternationalTopicSign({ addTextPanel, parent: wall, text: GOC1_TEXT.wallC, position: [0, 19.54, .06] });
  RaisedCaptionText(addTextPanel, wall, GOC1_TEXT.wallCSub, [0, 17.55, .30], [31, 1.50]);
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  return addSelectedMediaGrid({
    board, items: selectedMedia("community"), cols: 3, cardSize: [8.35, 2.8],
    stepX: 10.25, stepY: 3.45, renderer, addTextPanel, registerArtifact,
    registerInteractive, requestRender, setVideoActive
  });
}

function RaisedCaptionText(addTextPanel, parent, text, position, size) {
  const caption = addTextPanel(text, [position[0], position[1], .08], size, 0, {
    size: 120, minFontSize: 100, color: '#0B5E9C', background: 'transparent',
    border: false, weight: 900, wrap: false, width: 4800, height: 232,
    maxWidth: 4480, lineHeight: 132, strokeColor: '#FFFFFF', strokeWidth: 3, unlit: true
  }, parent);
  caption.renderOrder = 50;
  return caption;
}
/** Builds the complete exhibit system inside the local coordinates of goc5. */
export function buildGoc1DigitalRoom({ parent, renderer, addTextPanel, createRoomTopHoanhPhi, registerArtifact, registerInteractive, requestRender, setVideoActive }) {
  const root = new THREE.Group();
  root.name = "goc1-digital-exhibit-root";
  root.position.y = EXHIBIT_LIFT_Y;
  parent.add(root);
  const mediaControllers = [];
  mediaControllers.push(buildDigitalResilienceWall({
    root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive
  }));

  mediaControllers.push(buildTeamTimelineWall({
    root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive
  }));

  mediaControllers.push(buildCommunityWall({
    root, renderer, addTextPanel, registerArtifact, registerInteractive, requestRender, setVideoActive
  }));
  root.userData.videoController = {
    sync() { mediaControllers.forEach(controller => controller?.sync?.()); },
    dispose() { mediaControllers.forEach(controller => controller?.dispose?.()); }
  };
  [[-14.7, 18.5, 47], [-14.7, 18.5, 55.5], [-14.7, 18.5, 63.5], [-14.7, 18.5, 71.5]].forEach((p, i) => addSpot(root, p, [-17.4, 9.5, [47, 55.5, 63.5, 71.5][i]]));
  [[-14, 18.5, 74.78], [-7, 18.5, 74.78], [0, 18.5, 74.78], [7, 18.5, 74.78], [14, 18.5, 74.78]].forEach((p, i) => addSpot(root, p, [[-12, -2, 0, 7, 11.5][i], 9.5, 77.4], i === 2 ? 3.55 : 3.1));
  [[14.7, 18.5, 47.5], [14.7, 18.5, 56.5], [14.7, 18.5, 64.5], [14.7, 18.5, 72.5]].forEach((p, i) => addSpot(root, p, [17.35, 9.5, [47.5, 56.5, 64.5, 72.5][i]]));
  return { root, videoController: root.userData.videoController };
}

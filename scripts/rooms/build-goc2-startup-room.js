import * as THREE from 'three';
import { GOC2_IMAGES, GOC2_DESCRIPTIONS } from '../data/goc2-startup-innovation.js';
import { EXHIBIT_LIFT_Y } from '../config/scene-config.js';
import { SectionPanel, YearBadge, FramedImage } from './build-goc1-digital-room.js';

import { createInternationalTopicSign } from '../core/international-topic-sign.js';

const BLUE = 0x0b5e9c;
const GOLD = 0xd6b86f;
const RED = 0xa9252b;
const GROUP = 'Góc 2 · Đổi mới sáng tạo HNUE';

function material(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: .45, metalness: .12 });
}

function addWallTitle(addTextPanel, wall, title, subtitle, width = 25.5) {
  createInternationalTopicSign({ addTextPanel, parent: wall, text: title, position: [0, 19.54, .06] });
  addTextPanel(subtitle, [0, 17.55, .08], [31, 1.35], 0, {
    size: 94, minFontSize: 72, color: '#234D6F', background: 'transparent',
    border: false, weight: 900, wrap: false, width: 4700, height: 250,
    maxWidth: 4450, unlit: true
  }, wall);
}

function addInfoTag(addTextPanel, parent, text, x, y, width, options = {}) {
  return addTextPanel(text, [x, y, .070], [width, options.height ?? .72], 0, {
    size: options.size ?? 34, minFontSize: options.minFontSize ?? 25,
    color: options.red ? '#FFFFFF' : '#0B5E9C',
    background: options.red ? '#A9252B' : (options.white ? '#FFFFFF' : '#D6B86F'),
    border: true, accent: options.white ? '#0B5E9C' : '#D6B86F', borderWidth: 9,
    weight: 900, wrap: options.wrap ?? false,
    width: options.canvasWidth ?? 1200, height: options.canvasHeight ?? 260,
    lineHeight: options.lineHeight ?? 42, unlit: true
  }, parent);
}

function addPhoto(context, parent, source, title, description, position, size) {
  return FramedImage({
    parent, source, title, description, position: [...position, .26], size,
    renderer: context.renderer,
    registerArtifact: context.registerArtifact,
    registerInteractive: context.registerInteractive,
    groupLabel: GROUP
  });
}

function addPhotoSet(context, parent, assets, config) {
  addPhoto(context, parent, assets[0], config.title, config.description, config.main.position, config.main.size);
  const supportSlots = config.support ?? [];
  assets.slice(1, supportSlots.length + 1).forEach((source, index) => {
    const slot = supportSlots[index];
    addPhoto(
      context,
      parent,
      source,
      `${config.title} \u00b7 \u1ea2nh ${index + 2}`,
      config.description,
      slot.position,
      slot.size
    );
  });
}

function ContentGroup(parent, position) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], .055);
  parent.add(group);
  return group;
}

function addJourneyLine(addTextPanel, wall, year, x = 0, slope = 0) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(32.5, .10, .02), material(GOLD));
  line.position.set(0, 3.05, .02);
  line.rotation.z = slope;
  wall.add(line);
  YearBadge(addTextPanel, wall, year, x, 3.05 + x * Math.tan(slope));
}

function addSpot(parent, position, target, intensity = 3.1) {
  const light = new THREE.SpotLight(0xffe4b2, intensity, 18, Math.PI / 6, .45, 1.2);
  light.position.set(...position);
  light.target.position.set(...target);
  light.userData.keepRealLight = true;
  light.castShadow = false;
  parent.add(light, light.target);
}

function buildSeedWall(context) {
  const { root, addTextPanel } = context;
  const wall = new THREE.Group();
  wall.name = 'goc2-seed-wall-left';
  wall.position.set(-17.34, 0, 60.5);
  wall.rotation.y = Math.PI / 2;
  root.add(wall);

  addWallTitle(addTextPanel, wall, 'NGHIÊN CỨU KHOA HỌC', 'Từ đề tài nghiên cứu đến sản phẩm đổi mới sáng tạo có giá trị thực tiễn', 23.5);
  const board = SectionPanel(wall, { position: [0, 10.2, .20], size: [32.5, 12.2] });
  const a1 = ContentGroup(board, [-8.05, -.15, .22]);
  const a2 = ContentGroup(board, [8.05, -.15, .22]);
  addPhotoSet(context, a1, GOC2_IMAGES.awards2023, {
    title: 'Hội nghị tổng kết và trao giải năm 2023', description: GOC2_DESCRIPTIONS.awards2023,
    main: { position: [-3.25, .55], size: [7.15, 5.35] },
    support: [2.35, .25, -1.85].map(y => ({ position: [3.55, y], size: [4.15, 1.72] }))
  });
  addInfoTag(addTextPanel, a1, '65 ĐỀ TÀI', -4.85, -4.35, 4.2, { height: .95, size: 46, minFontSize: 40, canvasWidth: 1050, canvasHeight: 240, lineHeight: 60 });
  addInfoTag(addTextPanel, a1, '12 GIẢI QUỐC GIA', 0, -4.35, 4.45, { height: .95, size: 46, minFontSize: 40, canvasWidth: 1120, canvasHeight: 240, lineHeight: 60 });
  addInfoTag(addTextPanel, a1, '23 ĐƠN VỊ', 4.85, -4.35, 4.2, { height: .95, size: 46, minFontSize: 40, canvasWidth: 1050, canvasHeight: 240, lineHeight: 60 });
  addPhotoSet(context, a2, [...GOC2_IMAGES.projects.heritage, GOC2_IMAGES.projects.bioto], {
    title: 'Nghiên cứu thành sản phẩm', description: `${GOC2_DESCRIPTIONS.heritage} ${GOC2_DESCRIPTIONS.bioto}`,
    main: { position: [-3.25, .55], size: [7.15, 5.35] },
    support: [2.35, .25, -1.85].map(y => ({ position: [3.55, y], size: [4.15, 1.72] }))
  });
  addInfoTag(addTextPanel, a2, 'DI SẢN SỐ', -4.85, -4.35, 4.2, { white: true, height: .90, size: 46, minFontSize: 40, canvasWidth: 1100, canvasHeight: 235, lineHeight: 60 });
  addInfoTag(addTextPanel, a2, 'CÔNG NGHỆ XR', 0, -4.35, 4.2, { white: true, height: .90, size: 46, minFontSize: 40, canvasWidth: 1100, canvasHeight: 235, lineHeight: 60 });
  addInfoTag(addTextPanel, a2, 'KINH TẾ TUẦN HOÀN', 4.85, -4.35, 4.2, { white: true, height: .90, size: 40, minFontSize: 34, canvasWidth: 1100, canvasHeight: 235, lineHeight: 60 });
  addJourneyLine(addTextPanel, wall, '2023', -9.5);
}

function buildBreakthroughWall(context) {
  const { root, addTextPanel } = context;
  const wall = new THREE.Group();
  wall.name = 'goc2-breakthrough-wall';
  wall.position.set(0, 0, 77.22);
  wall.rotation.y = Math.PI;
  root.add(wall);

  addWallTitle(addTextPanel, wall, 'KHỞI NGHIỆP SÁNG TẠO', 'Từ ý tưởng đến sản phẩm · Dấu ấn khởi nghiệp HNUE qua các năm', 24.5);
  const board = SectionPanel(wall, { position: [0, 10.2, .20], size: [32.5, 12.2] });
  const b1 = ContentGroup(board, [-8.0, -.15, .22]);
  const b2 = ContentGroup(board, [8.0, -.15, .22]);
  const b1Slots = [2.35, .15, -2.05].map(y => ({ position: [3.65, y], size: [4.05, 1.82] }));
  addPhotoSet(context, b1, GOC2_IMAGES.teamJourney, {
    title: 'Hành trình đội thi HNUE tại các sân chơi khởi nghiệp', description: GOC2_DESCRIPTIONS.teamJourney,
    main: { position: [-3.15, .45], size: [7.25, 5.45] }, support: b1Slots
  });
  YearBadge(addTextPanel, b1, '2023–2024', -3.80, 3.70);
  addInfoTag(addTextPanel, b1, 'THỬ SỨC  ·  GIAO LƯU  ·  HOÀN THIỆN SẢN PHẨM', 0, -4.35, 13.9, { white: true, height: .90, size: 46, minFontSize: 40, canvasWidth: 3400, canvasHeight: 220, lineHeight: 60 });
  const b2Slots = [2.35, .15, -2.05].map(y => ({ position: [3.65, y], size: [4.05, 1.82] }));
  addPhotoSet(context, b2, GOC2_IMAGES.startup2025, {
    title: 'Chung kết HNUE_STARTUP 2025', description: GOC2_DESCRIPTIONS.startup2025,
    main: { position: [-3.15, .45], size: [7.25, 5.45] }, support: b2Slots
  });
  addInfoTag(addTextPanel, b2, '50+ DỰ ÁN', -4.85, -4.40, 4.10, { height: .90, size: 44 });
  addInfoTag(addTextPanel, b2, '15 DỰ ÁN CHUNG KẾT', 0, -4.40, 4.90, { white: true, height: .90, size: 40 });
  addInfoTag(addTextPanel, b2, '4 NHÓM LĨNH VỰC', 4.85, -4.40, 4.10, { height: .90, size: 40 });
  YearBadge(addTextPanel, b2, '09/12/2025', -3.15, 3.65);
  addJourneyLine(addTextPanel, wall, '2023 — 2026', 0);
}

function buildNationalWall(context) {
  const { root, addTextPanel } = context;
  const wall = new THREE.Group();
  wall.name = 'goc2-national-wall-right';
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);

  addWallTitle(addTextPanel, wall, 'RÈN LUYỆN NGHIỆP VỤ', 'Trình bày · Phản biện · Làm việc nhóm · Hoàn thiện sản phẩm', 24.5);
  const board = SectionPanel(wall, { position: [0, 10.2, .20], size: [32.5, 12.2] });
  const c1 = ContentGroup(board, [-10.0, -.15, .22]);
  const c2 = ContentGroup(board, [1.15, -.15, .22]);
  const c3 = ContentGroup(board, [11.0, -.15, .22]);
  addPhoto(context, c1, GOC2_IMAGES.pitch2023[0], 'Không gian pitch HNUE_STARTUP 2023', GOC2_DESCRIPTIONS.pitch2023, [0, 1.45], [8.45, 4.30]);
  GOC2_IMAGES.pitch2023.slice(1).forEach((source, index) =>
    addPhoto(context, c1, source, `Rèn luyện thuyết trình và phản biện · Ảnh ${index + 2}`, GOC2_DESCRIPTIONS.pitch2023, [-3.0 + index * 3.0, -2.25], [2.72, 1.65]));
  addInfoTag(addTextPanel, c1, 'THUYẾT TRÌNH · PHẢN BIỆN', -3.0, -4.25, 5.45, { height: .95, size: 40, minFontSize: 34, canvasWidth: 1500, canvasHeight: 260, lineHeight: 60 });
  addInfoTag(addTextPanel, c1, 'GIAO LƯU · TRẢI NGHIỆM', 3.0, -4.25, 5.45, { height: .95, size: 40, minFontSize: 34, canvasWidth: 1500, canvasHeight: 260, lineHeight: 60 });
  addInfoTag(addTextPanel, c2, 'KHOA CÔNG TÁC XÃ HỘI', 0, 3.58, 7.35, { white: true, height: 1.05, size: 46, minFontSize: 40, canvasWidth: 1800, canvasHeight: 260, lineHeight: 62 });
  addPhoto(context, c2, GOC2_IMAGES.national2026.unlock, 'Unlock Your Body', GOC2_DESCRIPTIONS.unlock, [0, .55], [7.55, 4.05]);
  addPhoto(context, c2, GOC2_IMAGES.national2026.finals[0], 'Hành trình Chung kết quốc gia · Ảnh 1', GOC2_DESCRIPTIONS.national2026, [0, -2.35], [5.65, 1.45]);
  addInfoTag(addTextPanel, c2, 'GIẢI BA', 0, -4.15, 4.60, { red: true, height: .90, size: 46 });
  addInfoTag(addTextPanel, c3, 'KHOA VẬT LÍ', 0, 3.58, 7.35, { white: true, height: 1.05, size: 46, minFontSize: 40, canvasWidth: 1800, canvasHeight: 260, lineHeight: 62 });
  addPhoto(context, c3, GOC2_IMAGES.national2026.escape, 'Escaperoom Khoa học', GOC2_DESCRIPTIONS.escape, [0, .55], [7.55, 4.05]);
  GOC2_IMAGES.national2026.finals.slice(1).forEach((source, index) =>
    addPhoto(context, c3, source, `Hành trình Chung kết quốc gia · Ảnh ${index + 2}`, GOC2_DESCRIPTIONS.national2026, [-1.85 + index * 3.70, -2.35], [3.35, 1.45]));
  addInfoTag(addTextPanel, c3, 'GIẢI KHUYẾN KHÍCH', 0, -4.15, 7.15, { red: true, height: .90, size: 46 });

  addJourneyLine(addTextPanel, wall, '2023 — 2026', 0, .018);
  addTextPanel('★', [15.35, 3.34, .10], [1.1, 1.1], 0, {
    size: 120, color: '#A9252B', background: 'transparent', border: false,
    weight: 900, wrap: false, width: 300, height: 300, unlit: true
  }, wall);
}

function buildNationalWallCompactArchive(context) {
  const { root, addTextPanel } = context;
  const wall = new THREE.Group();
  wall.name = "goc2-national-wall-right";
  wall.position.set(17.34, 0, 60.5);
  wall.rotation.y = -Math.PI / 2;
  root.add(wall);
  addWallTitle(addTextPanel, wall, "KH\u1edeI NGHI\u1ec6P S\u00c1NG T\u1ea0O", "Tr\u00ecnh b\u00e0y  ·  Ph\u1ea3n bi\u1ec7n  ·  Ho\u00e0n thi\u1ec7n s\u1ea3n ph\u1ea9m");
  const board = SectionPanel(wall, { position: [0, 10.2, .20], size: [32.5, 12.2] });
  const practice = ContentGroup(board, [-8.2, -.15, .22]);
  const contest = ContentGroup(board, [8.2, -.15, .22]);
  addInfoTag(addTextPanel, practice, "R\u00c8N LUY\u1ec6N NGHI\u1ec6P V\u1ee4", 0, 3.65, 13.5, { white: true, height: 1.05, size: 46 });
  addPhoto(context, practice, GOC2_IMAGES.pitch2023[0], "R\u00e8n luy\u1ec7n thuy\u1ebft tr\u00ecnh v\u00e0 ph\u1ea3n bi\u1ec7n", GOC2_DESCRIPTIONS.pitch2023, [0, .25], [12.5, 6.4]);
  addInfoTag(addTextPanel, contest, "CU\u1ed8C THI KH\u1edeI NGHI\u1ec6P", 0, 3.65, 13.5, { white: true, height: 1.05, size: 46 });
  addPhoto(context, contest, GOC2_IMAGES.national2026.escape, "Cu\u1ed9c thi kh\u1edfi nghi\u1ec7p", GOC2_DESCRIPTIONS.national2026, [0, .25], [12.5, 6.4]);
  addJourneyLine(addTextPanel, wall, "2023 — 2026", 0, .018);
}

export function buildGoc2StartupRoom({ parent, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const root = new THREE.Group();
  root.name = 'goc2-startup-innovation-root';
  root.position.y = EXHIBIT_LIFT_Y;
  parent.add(root);
  const context = { root, renderer, addTextPanel, registerArtifact, registerInteractive };
  buildSeedWall(context);
  buildBreakthroughWall(context);
  buildNationalWall(context);

  [[-14.7, 18.5, 46], [-14.7, 18.5, 55], [-14.7, 18.5, 64], [-14.7, 18.5, 72]].forEach((p, i) =>
    addSpot(root, p, [-17.4, 9.7, [46, 55, 64, 72][i]], 3.1));
  [[-14, 18.5, 74.78], [-7, 18.5, 74.78], [0, 18.5, 74.78], [7, 18.5, 74.78], [14, 18.5, 74.78]].forEach((p, i) =>
    addSpot(root, p, [[-12, -6, 0, 6, 12][i], 9.7, 77.4], i === 2 ? 3.45 : 3.1));
  [[14.7, 18.5, 46], [14.7, 18.5, 55], [14.7, 18.5, 64], [14.7, 18.5, 72]].forEach((p, i) =>
    addSpot(root, p, [17.4, 9.7, [46, 55, 64, 72][i]], 3.2));

  return { root };
}

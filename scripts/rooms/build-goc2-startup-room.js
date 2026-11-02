import * as THREE from "three";
import { GOC2_MEDIA } from "../data/goc2-startup-innovation.js";
import { EXHIBIT_LIFT_Y } from "../config/scene-config.js";
import { SectionPanel, FramedImage } from "./build-goc1-digital-room.js";
import { createInternationalTopicSign } from "../core/international-topic-sign.js";

const GROUP = "Góc 2 · Đổi mới sáng tạo – Khởi nghiệp";
const WALLS = [
  { section: "research", title: "NGHIÊN CỨU KHOA HỌC", position: [-17.34, 0, 60.5], rotation: Math.PI / 2, cols: 5, size: [5.45, 4.15], step: [6.25, 5.3] },
  { section: "startup", title: "KHỞI NGHIỆP SÁNG TẠO", position: [0, 0, 77.22], rotation: Math.PI, editorial: true },
  { section: "training", title: "RÈN LUYỆN NGHIỆP VỤ", position: [17.34, 0, 60.5], rotation: -Math.PI / 2, cols: 3, size: [8.55, 4.15], step: [10.25, 5.3] }
];

function addEditorialStartupGrid(context, board, media) {
  const slots = [[-8, 2.65], [8, 2.65], [-8, -2.65], [8, -2.65]];
  media.forEach((entry, index) => {
    const [x, y] = slots[index];
    const card = SectionPanel(board, { position: [x, y, .16], size: [15.25, 4.75], mountZ: 0 });
    FramedImage({
      parent: card, source: entry.path, title: entry.title, description: entry.description,
      position: [-3.75, 0, .26], size: [7.05, 4.05], renderer: context.renderer,
      registerArtifact: context.registerArtifact, registerInteractive: context.registerInteractive,
      groupLabel: GROUP
    });
    context.addTextPanel(entry.title.toUpperCase(), [3.7, 1.20, .28], [7.15, 1.40], 0, {
      size: 48, minFontSize: 36, color: "#173F5F", background: "#D6A84B",
      border: true, accent: "#173F5F", borderWidth: 10, weight: 900, wrap: true,
      width: 1500, height: 300, maxWidth: 1360, lineHeight: 52, unlit: true
    }, card);
    context.addTextPanel(entry.description, [3.7, -.78, .28], [7.15, 2.38], 0, {
      size: 40, minFontSize: 30, color: "#FFFFFF", background: "#173F5F",
      border: true, accent: "#D6A84B", borderWidth: 10, weight: 700, wrap: true,
      width: 1500, height: 520, maxWidth: 1360, lineHeight: 48, unlit: true
    }, card);
  });
}

function addRegularGrid(context, board, config, media) {
  const rows = Math.ceil(media.length / config.cols);
  media.forEach((entry, index) => {
    const row = Math.floor(index / config.cols);
    const col = index % config.cols;
    const count = Math.min(config.cols, media.length - row * config.cols);
    FramedImage({
      parent: board, source: entry.path, title: entry.title, description: entry.description,
      position: [(col - (count - 1) / 2) * config.step[0], ((rows - 1) / 2 - row) * config.step[1], .26],
      size: config.size, renderer: context.renderer,
      registerArtifact: context.registerArtifact, registerInteractive: context.registerInteractive,
      groupLabel: GROUP
    });
  });
}

function addWall(context, config) {
  const wall = new THREE.Group();
  wall.name = `goc2-${config.section}-wall`;
  wall.position.set(...config.position);
  wall.rotation.y = config.rotation;
  context.root.add(wall);
  createInternationalTopicSign({ addTextPanel: context.addTextPanel, parent: wall, text: config.title, position: [0, 19.54, .06] });
  const board = SectionPanel(wall, { position: [0, 10.2, .2], size: [32.5, 12.2] });
  const media = GOC2_MEDIA.filter(entry => entry.section === config.section);
  if (config.editorial) addEditorialStartupGrid(context, board, media);
  else addRegularGrid(context, board, config, media);
}

function addSpot(parent, position, target, intensity = 3.1) {
  const light = new THREE.SpotLight(0xffe4b2, intensity, 18, Math.PI / 6, .45, 1.2);
  light.position.set(...position); light.target.position.set(...target);
  light.userData.keepRealLight = true; light.castShadow = false;
  parent.add(light, light.target);
}

export function buildGoc2StartupRoom({ parent, renderer, addTextPanel, registerArtifact, registerInteractive }) {
  const root = new THREE.Group();
  root.name = "goc2-startup-innovation-root";
  root.position.y = EXHIBIT_LIFT_Y;
  parent.add(root);
  const context = { root, renderer, addTextPanel, registerArtifact, registerInteractive };
  WALLS.forEach(config => addWall(context, config));
  [[-14.7,18.5,46],[-14.7,18.5,55],[-14.7,18.5,64],[-14.7,18.5,72]].forEach((p,i)=>addSpot(root,p,[-17.4,9.7,[46,55,64,72][i]]));
  [[-14,18.5,74.78],[-7,18.5,74.78],[0,18.5,74.78],[7,18.5,74.78],[14,18.5,74.78]].forEach((p,i)=>addSpot(root,p,[[-12,-6,0,6,12][i],9.7,77.4],i===2?3.45:3.1));
  [[14.7,18.5,46],[14.7,18.5,55],[14.7,18.5,64],[14.7,18.5,72]].forEach((p,i)=>addSpot(root,p,[17.4,9.7,[46,55,64,72][i]],3.2));
  return { root };
}

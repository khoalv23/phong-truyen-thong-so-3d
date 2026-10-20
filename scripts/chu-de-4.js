import * as THREE from "three";
import { loadModelScene } from "./core/asset-loader.js";
import { collectSceneAudit } from "./core/scene-audit.js";
import { createSceneContext } from "./core/scene-context.js";
import { createSceneMaterials } from "./core/materials.js";
import { buildCentralHallExperience, buildHubCore } from "./builders/build-central-hall.js";
import { buildMergedEastRoom } from "./builders/build-merged-east-room.js";
import { buildInternationalIntegrationRoom } from "./rooms/build-international-integration-room.js?v=20261015-no-kiosk";
import { buildRoomShell } from "./builders/build-room-shell.js";
import { buildRoom } from "./rooms/build-room.js";
import { createPolygonPatch, createStraightWallParts } from "./objects/architecture/primitives.js";
import { createPottedPlant } from "./objects/decor/potted-plant.js";
import {
  registerInteractive as registerInteractiveInContext,
  registerRoomOnlyVisibility as registerRoomOnlyVisibilityInContext
} from "./runtime/scene-registries.js";
import { createNavigationSystem } from "./runtime/navigation.js";
import { createRenderLoop } from "./runtime/render-loop.js";
import { createSceneUpdateSystem } from "./runtime/scene-updates.js";
import {
  CEIL_H,
  CEILING_BEIGE,
  CEILING_JOIN_OVERLAP,
  CONNECTORS,
  DOAN_LOGO_SRC,
  EAST_W,
  ENTRY_WALL_T,
  G1_SX,
  G1_SZ,
  G3_SX,
  G3_SY,
  G3_SZ,
  GATE_HALF,
  GATE_Z,
  GOC1_FRAME_CENTER_Y,
  HNUE_LOGO_SRC,
  HUB_R,
  LOW_TITLE_STRIP_Y,
  MERGED_REGION_CONNECTOR,
  MERGED_REGION_KEYS,
  NORTH_RECESSED,
  R_BACK,
  R_OUT,
  RING_OUT,
  ROOM_D,
  ROOM_DEFS,
  ROOM_KEYS,
  ROOM_W,
  SOUTH,
  VIEW_EYE_Y,
  WALL_BEIGE,
  WALL_EMISSIVE,
  WALL_T,
  dist
} from "./config/scene-config.js";
import { CONTENT } from "./data/content.js";
import { KIOSK_QUIZ_DATA } from "./data/kiosk-quiz-data.js";
import {
  closeArtifactModal,
  initArtifactModal,
  isArtifactModalOpen,
  openArtifact,
  registerArtifact,
  showNextArtifactPage,
  showPreviousArtifactPage,
  toggleArtifactImageZoom
} from "./ui/artifact-modal.js";
import { artifactModalElements, canvas3d, hintToast } from "./ui/dom-elements.js";
import { buildMinimap, updatePlayerMapIndicator } from "./ui/minimap.js";

const roomLoadingScreen = document.getElementById("room-loading-screen");
const roomLoadingStatus = document.getElementById("room-loading-status");
const enterRoomButton = document.getElementById("enter-room-button");
let roomSceneBuilt = false;
let trackedAssetsStarted = false;
let trackedAssetsLoaded = false;
let roomLoadingReady = false;
let roomLoadingDismissed = false;

function dismissRoomLoadingWhenReady() {
  if (roomLoadingReady || !roomSceneBuilt || (trackedAssetsStarted && !trackedAssetsLoaded)) return;
  roomLoadingReady = true;
  if (roomLoadingStatus) roomLoadingStatus.textContent = "Không gian đã sẵn sàng";
  Promise.resolve(document.fonts?.ready).then(() => {
    if (!enterRoomButton) return;
    enterRoomButton.disabled = false;
    roomLoadingScreen?.setAttribute("aria-busy", "false");
  });
}

function enterExhibitionRoom() {
  if (!roomLoadingReady || roomLoadingDismissed || !roomLoadingScreen) return;
  roomLoadingDismissed = true;
  roomLoadingScreen.classList.add("is-ready");
  canvas3d.focus({ preventScroll: true });
  setTimeout(() => { roomLoadingScreen.hidden = true; }, 750);
}

enterRoomButton?.addEventListener("click", enterExhibitionRoom);

THREE.DefaultLoadingManager.onStart = () => {
  trackedAssetsStarted = true;
  trackedAssetsLoaded = false;
};
THREE.DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  if (roomLoadingStatus) roomLoadingStatus.textContent = `Đang tải tài nguyên · ${loaded}/${total}`;
};
THREE.DefaultLoadingManager.onLoad = () => {
  trackedAssetsLoaded = true;
  dismissRoomLoadingWhenReady();
};
THREE.DefaultLoadingManager.onError = url => {
  console.warn("Unable to load exhibition resource:", url);
};

/* ==========================================================================================
   2. TIỆN ÍCH DOM / DỮ LIỆU CHUNG
   ========================================================================================== */
let scene, camera, renderer, sceneContext;
let navigationSystem, sceneUpdateSystem, renderLoop;
let raycaster, pointer;
let yaw = 0, pitch = -0.03;
let isLooking = false, pointerDown = null, suppressClick = false, hovered = null;
let clock = new THREE.Clock();
let needsRender = true;
let lastPointerRaycastTime = 0;
let hasActiveVideoTexture = false;
let hasInitialized = false;
let renderLoopRunning = false;
let renderFrameId = null;
let renderFailureReported = false;
let goc1VideoAudioController = null;
let goc1VideoAudioUnlocked = false;
const goc1MediaControllers = [];
const _goc1MediaLocalCamera = new THREE.Vector3();

const MAX_DEVICE_PIXEL_RATIO = 1.25;
const MAX_REAL_POINT_OR_SPOT_LIGHTS = 26;
const _moveForward = new THREE.Vector3();
const _moveRight = new THREE.Vector3();
const _moveVector = new THREE.Vector3();
const _roomLocalCamera = new THREE.Vector3();
const _instanceBaseColor = new THREE.Color(0xffffff);
const _instanceHoverColor = new THREE.Color(0xffef9a);
const interactive = [];
const keys = new Set();
const roomOnlyVisibilityGroups = [];
const LIGHT_AMBER = 0xfff0c2;
const LIGHT_AMBER_SOFT = 0xfff6d8;
const LIGHT_AMBER_PALE = 0xffffea;
const LIGHT_AMBER_GLOW = 0xffe7a8;
const LIGHT_AMBER_RING = 0xffd98a;
const LIGHT_AMBER_COVE = 0xfff1c8;
const AMBIENT_AMBER = 0xfff7e4;
const HEMI_SKY_AMBER = 0xfffff2;
const HEMI_GROUND_WARM = 0xd2c0a4;
const SCENE_WARM_BACKGROUND = 0xfffbf2;
function requestRender() {
  needsRender = true;
}

function registerInteractiveObject(object) {
  if (sceneContext) return registerInteractiveInContext(sceneContext, object);
  interactive.push(object);
  return object;
}

function registerGoc1MediaController(controller, roomGroup) {
  goc1MediaControllers.push({ controller, roomGroup });
}

function syncGoc1Media() {
  goc1MediaControllers.forEach(({ controller, roomGroup }) => {
    _goc1MediaLocalCamera.copy(camera.position);
    roomGroup.worldToLocal(_goc1MediaLocalCamera);
    controller.sync(_goc1MediaLocalCamera);
  });
}
function registerRoomOnlyVisibility(entry) {
  if (sceneContext) return registerRoomOnlyVisibilityInContext(sceneContext, entry);
  roomOnlyVisibilityGroups.push(entry);
  return entry;
}

/* ==========================================================================================
   3. HÀM DÙNG CHUNG — tái sử dụng nguyên bản (đồng bộ tuyệt đối với Chu_De_1.html)
   ========================================================================================== */
function createSoftWalkwayTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) {
    const alpha = Math.random() * 0.065 + 0.018;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${alpha})`
      : `rgba(31,41,55,${alpha})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  if (renderer) texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const LABEL_FONT_FAMILY = '"Roboto", Arial, sans-serif';

function makeTextTexture(text, options = {}) {
  const c = document.createElement("canvas");
  c.width = options.width || 1400;
  c.height = options.height || 640;
  const ctx = c.getContext("2d");

  if (options.background && options.background !== "transparent") {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  if (options.border) {
    ctx.strokeStyle = options.accent || "#d6b86f";
    ctx.lineWidth = options.borderWidth || 8;
    ctx.strokeRect(12, 12, c.width - 24, c.height - 24);
  }

  const fontSize = options.size || 54;
  ctx.fillStyle = options.color || "#172032";
  ctx.textAlign = options.align || "center";
  ctx.textBaseline = "middle";
  ctx.font = `${options.weight || 900} ${fontSize}px ${LABEL_FONT_FAMILY}`;
  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = options.shadowBlur || 0;
    ctx.shadowOffsetX = options.shadowOffsetX || 0;
    ctx.shadowOffsetY = options.shadowOffsetY || 0;
  }

  const rawLines = String(text).split("\n");
  const maxWidth = options.maxWidth || c.width * 0.88;
  let effectiveFontSize = fontSize;
  if (!options.wrap && options.fitSingleLine !== false) {
    const widestLine = rawLines.reduce((widest, line) => Math.max(widest, ctx.measureText(line).width), 0);
    if (widestLine > maxWidth) {
      effectiveFontSize = Math.max(options.minFontSize || 42, Math.floor(fontSize * maxWidth / widestLine));
      ctx.font = `${options.weight || 900} ${effectiveFontSize}px ${LABEL_FONT_FAMILY}`;
    }
  }
  const lines = [];
  rawLines.forEach(rawLine => {
    if (!options.wrap || rawLine.trim() === "") {
      lines.push(rawLine);
      return;
    }
    const words = rawLine.split(/\s+/);
    let line = "";
    words.forEach(word => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });

  const lineHeight = options.lineHeight || effectiveFontSize + 12;
  const x = options.align === "left" ? c.width * 0.07 : c.width / 2;
  lines.forEach((line, index) => {
    const y = c.height / 2 + (index - (lines.length - 1) / 2) * lineHeight;
    if (options.strokeColor && options.strokeWidth) {
      ctx.lineJoin = "round";
      ctx.lineWidth = options.strokeWidth;
      ctx.strokeStyle = options.strokeColor;
      ctx.strokeText(line, x, y);
    }
    ctx.fillText(line, x, y);
  });

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (renderer) texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

function addTextPanel(text, position, size, rotationY = 0, options = {}, parent = scene) {
  const TextMaterial = options.unlit ? THREE.MeshBasicMaterial : THREE.MeshStandardMaterial;
  const material = new TextMaterial({
    map: makeTextTexture(text, options),
    transparent: true,
    roughness: 0.8,
    side: options.side ?? THREE.DoubleSide,
    depthWrite: options.depthWrite ?? true,
    depthTest: options.depthTest ?? true
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
  panel.position.set(...position);
  panel.rotation.y = rotationY;
  parent.add(panel);
  return panel;
}

function createContentPanel(text, position, size, rotationY = 0, options = {}, parent = scene) {
  return addTextPanel(text, position, size, rotationY, {
    size: options.size || 25,
    color: options.color || "#172032",
    background: options.background || "#f8fafc",
    border: options.border ?? true,
    accent: options.accent || "#d6b86f",
    wrap: true,
    align: options.align || "left",
    width: options.width || 1400,
    height: options.height || 760,
    maxWidth: options.maxWidth || 1210,
    lineHeight: options.lineHeight || (options.size || 25) + 12,
    weight: options.weight || 900,
    shadowColor: options.shadowColor,
    shadowBlur: options.shadowBlur,
    shadowOffsetY: options.shadowOffsetY,
    strokeColor: options.strokeColor,
    strokeWidth: options.strokeWidth
  }, parent);
}

function createLogoBadge(label, color, textColor, position, radius = 1, parent = scene, imageSrc = "") {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(256, 256, 218, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#d6b86f";
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 84px Roboto, Arial, sans-serif";
  ctx.fillText(label, 256, 256);

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const badge = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: .55 })
  );
  badge.position.set(...position);
  parent.add(badge);
  const logoSrc = imageSrc || (label === "HNUE" ? HNUE_LOGO_SRC : (label === "ĐOÀN" ? DOAN_LOGO_SRC : ""));
  if (logoSrc) {
    new THREE.TextureLoader().load(logoSrc, loadedTexture => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      badge.material.map = loadedTexture;
      badge.material.needsUpdate = true;
      requestRender();
    }, undefined, () => {});
  }
  return badge;
}

function createLayeredLogoMark(imageSrc, position, radius = 1, rotationY = 0, parent = scene) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);



  new THREE.TextureLoader().load(imageSrc, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const layerCount = 9;
    const layerStep = .032;
    const logoGeometry = new THREE.CircleGeometry(radius, 96);

    for (let index = 0; index < layerCount; index++) {
      const depthRatio = index / (layerCount - 1);
      const layer = new THREE.Mesh(
        logoGeometry,
        new THREE.MeshStandardMaterial({
          map: texture,
          color: new THREE.Color().setHSL(.58, .12, .42 + depthRatio * .48),
          transparent: true,
          alphaTest: .025,
          roughness: .48 - depthRatio * .12,
          metalness: .04
        })
      );
      layer.position.z = .06 + index * layerStep;
      layer.castShadow = true;
      layer.receiveShadow = false;
      group.add(layer);
    }

    if (/hnue/i.test(imageSrc)) {
      const whiteBackground = new THREE.Mesh(
        new THREE.CircleGeometry(radius * .68, 96),
        new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
      );
      whiteBackground.name = "hnue-logo-white-background";
      whiteBackground.position.z = .06 + (layerCount - 1) * layerStep - .004;
      group.add(whiteBackground);
    }

    const frontFace = group.children[layerCount - 1];
    frontFace.material.color.setHex(0xffffff);
    frontFace.material.roughness = .34;
    group.userData.logoDepth = (layerCount - 1) * layerStep;
    requestRender();
  }, undefined, () => {});

  return group;
}

function createInternationalStyleRaisedTitle(text, position, size, rotationY = 0, parent = scene) {
  const [w, h] = size;
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  const navy = new THREE.MeshStandardMaterial({ color: 0x234d6f, roughness: .46, metalness: .18 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd6a84b, roughness: .34, metalness: .42 });
  const red = new THREE.MeshStandardMaterial({ color: 0x982f35, roughness: .48, metalness: .10 });
  const backing = new THREE.Mesh(new THREE.BoxGeometry(w + .32, h + .26, .15), new THREE.MeshStandardMaterial({ color: 0x142c40, roughness: .56, metalness: .14 }));
  backing.position.z = .04;
  const face = new THREE.Mesh(new THREE.BoxGeometry(w, h, .09), navy);
  face.position.z = .12;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(w - .18, h - .18, .04), gold);
  trim.position.z = .19;
  group.add(backing, face, trim);
  const textPanel = addTextPanel(text, [0, .05, .225], [w * .91, h * .63], 0, {
    size: 220, color: "#FFFFFF", background: "transparent", border: false, weight: 900,
    wrap: false, width: 4200, height: 900, strokeColor: "#d6a84b", strokeWidth: 7,
    depthWrite: false, depthTest: true
  }, group);
  textPanel.renderOrder = 45;
  const redAccent = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * .18, 3.6), .11, .04), red);
  redAccent.position.set(-w / 2 + Math.min(w * .18, 3.6) / 2 + .24, -h / 2 + .27, .24);
  const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w * .68, 4), .11, .04), gold);
  goldAccent.position.set(w * .10, -h / 2 + .27, .24);
  group.add(redAccent, goldAccent);
  return group;
}

function createRaisedTitleSign(text, position, size, rotationY = 0, parent = scene) {
  if (text !== "HỘI NHẬP - SÁNG TẠO\nTIÊN PHONG") return createInternationalStyleRaisedTitle(text, position, size, rotationY, parent);

  const [w, h] = size;
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, .16),
    new THREE.MeshStandardMaterial({ color: 0x7b1720, roughness: .48, metalness: .08, emissive: 0x2b070a, emissiveIntensity: .18 })
  );
  board.position.z = .08;
  group.add(board);

  // Gold frame retained around the lacquer-red sign face.
  const outerFrameMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .26, metalness: .72 });
  const innerFrameMat = new THREE.MeshStandardMaterial({ color: 0xb89262, roughness: .24, metalness: .64 });
  [
    [w + .42, .22, 0, h / 2 + .11, .11],
    [w + .42, .22, 0, -h / 2 - .11, .11],
    [.22, h + .42, -w / 2 - .11, 0, .11],
    [.22, h + .42, w / 2 + .11, 0, .11]
  ].forEach(v => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], .22), outerFrameMat);
    rail.position.set(v[2], v[3], v[4]);
    group.add(rail);
  });
  [
    [w - .34, .08, 0, h / 2 - .24, .16],
    [w - .34, .08, 0, -h / 2 + .24, .16],
    [.08, h - .34, -w / 2 + .24, 0, .16],
    [.08, h - .34, w / 2 - .24, 0, .16]
  ].forEach(v => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], .12), innerFrameMat);
    rail.position.set(v[2], v[3], v[4]);
    group.add(rail);
  });

  for (let i = 0; i < 10; i++) {
    const depth = i * .035;
    const bodyText = addTextPanel(text, [0, 0, .2 + depth], [w * .95, h * .82], 0, {
      size: 360, color: "#f4f7f9", background: "transparent", border: false,
      weight: 900, wrap: false, width: 6000, height: 2100, maxWidth: 5600, lineHeight: 640,
      strokeColor: "#5a0f17", strokeWidth: 20, depthWrite: false, depthTest: true
    }, group);
    bodyText.material.toneMapped = false;
    bodyText.renderOrder = 30 + i;
  }
  const faceText = addTextPanel(text, [0, 0, .58], [w * .93, h * .78], 0, {
    size: 360, color: "#ffffff", background: "transparent", border: false,
    weight: 900, wrap: false, width: 6000, height: 2100, maxWidth: 5600, lineHeight: 640,
    strokeColor: "#5a0f17", strokeWidth: 8, depthWrite: false, depthTest: true
  }, group);
  faceText.material.toneMapped = false;
  faceText.renderOrder = 45;

  return group;
}

function createGalleryBench(x, z, rotY, parent = scene, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  parent.add(group);
const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.5 * scale, 1.2, 1.6 * scale),
    new THREE.MeshStandardMaterial({ color: 0xb89262, roughness: .76 })
  );
  base.position.y = .6;
  group.add(base);

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(4.7 * scale, .2, 1.8 * scale),
    new THREE.MeshStandardMaterial({ color: 0xb8c7d4, roughness: .84 })
  );
  pad.position.y = 1.3;
  group.add(pad);
  return group;
}

function createWindowSeat(x, z, rot, parent = scene) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rot;
  parent.add(group);
const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd7edf7, emissive: 0x8ecae6, emissiveIntensity: 0.08,
    roughness: 0.45, transparent: true, opacity: 0.72
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), glassMat);
  glass.position.set(0, 3.4, .1);
  group.add(glass);

  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(6, .6, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xb89262, roughness: .72 })
  );
  bench.position.set(0, 1.1, 1.1);
  group.add(bench);

  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, .22, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xb8c7d4, roughness: .9 })
  );
  cushion.position.set(0, 1.41, 1.1);
  group.add(cushion);

  return group;
}

function createDropCeiling(w, d, localY, localZ, parent = scene, localX = 0, opts = {}) {
  const group = new THREE.Group();
  group.position.set(localX, localY, localZ);
  parent.add(group);
  const rimMat = opts.surfaceMat || new THREE.MeshStandardMaterial({ color: CEILING_BEIGE, roughness: 0.9, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .08 });
  const coreMat = opts.surfaceMat || new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .1 });
  const rimW = Math.min(2.35, w / 4, d / 4);

  if (w > rimW * 2 && d > rimW * 2) {
    const innerW = w - rimW * 2;
    const innerD = d - rimW * 2;
    [
      [w, .4, rimW, 0, 0, -d / 2 + rimW / 2],
      [w, .4, rimW, 0, 0, d / 2 - rimW / 2],
      [rimW, .4, innerD, -w / 2 + rimW / 2, 0, 0],
      [rimW, .4, innerD, w / 2 - rimW / 2, 0, 0]
    ].forEach(v => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], v[2]), rimMat);
      m.position.set(v[3], v[4], v[5]);
      group.add(m);
    });
    const core = new THREE.Mesh(new THREE.BoxGeometry(innerW, .12, innerD), coreMat);
    core.position.y = .4;
    group.add(core);

    const coveCoreMat = new THREE.MeshBasicMaterial({
      color: opts.coveColor ?? LIGHT_AMBER_COVE, transparent: true, opacity: .74, side: THREE.DoubleSide,
      depthWrite: false, toneMapped: false
    });
    const coveGlowMat = new THREE.MeshBasicMaterial({
      color: opts.coveColor ?? LIGHT_AMBER_COVE, transparent: true, opacity: .2, side: THREE.DoubleSide,
      depthWrite: false, toneMapped: false
    });
    const addCoveLight = (length, x, z, alongZ = false, inward = 1) => {
      const glowW = .34, coreW = .045, y = .327;
      const glowGeo = alongZ ? new THREE.PlaneGeometry(glowW, length) : new THREE.PlaneGeometry(length, glowW);
      const coreGeo = alongZ ? new THREE.PlaneGeometry(coreW, length) : new THREE.PlaneGeometry(length, coreW);
      const glow = new THREE.Mesh(glowGeo, coveGlowMat);
      const coreLine = new THREE.Mesh(coreGeo, coveCoreMat);
      [glow, coreLine].forEach(strip => {
        strip.rotation.x = Math.PI / 2;
        strip.position.set(
          x + (alongZ ? inward * glowW * .42 : 0),
          y,
          z + (alongZ ? 0 : inward * glowW * .42)
        );
        strip.renderOrder = 18;
        group.add(strip);
      });
    };
    addCoveLight(innerW, 0, -innerD / 2, false, 1);
    addCoveLight(innerW, 0, innerD / 2, false, -1);
    addCoveLight(innerD, -innerW / 2, 0, true, 1);
    addCoveLight(innerD, innerW / 2, 0, true, -1);
  }

  // 5 central hall lamps share the same paired-ring style as the room/hall ceiling lamps.
  const ringMat = new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_RING, toneMapped: false });
  const r1 = Math.min(1.18, w / 6, d / 6);
  const r2 = r1 * .75;
  const createCeilingLampPair = (xOffset = 0) => {
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(r1, .065, 16, 72), ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(xOffset - r1 * .45, -.7, 0);
    group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r2, .065, 16, 72), ringMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set(xOffset + r1 * .42, -.88, 0);
    group.add(ring2);

    const pairLightSpot = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(.22, r2 * .22), 32),
      new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_SOFT, transparent: true, opacity: .92, side: THREE.DoubleSide, toneMapped: false })
    );
    pairLightSpot.rotation.x = Math.PI / 2;
    pairLightSpot.position.set(xOffset, -.72, 0);
    group.add(pairLightSpot);

    const pairGlow = new THREE.PointLight(LIGHT_AMBER, 68, Math.max(w, d) * 1.28, 1.45);
    pairGlow.position.set(xOffset, -1.15, 0);
    pairGlow.userData.keepRealLight = true;
    group.add(pairGlow);
  };
  createCeilingLampPair();
  (opts.extraLampOffsets || []).forEach(createCeilingLampPair);
  return group;
}

// Trần cho khu trung tâm (vành khuyên tròn quanh Hạt nhân số) — mảng trần thứ 5 theo hồ sơ
// thiết kế gốc ("5 mảng trần: 4 phòng + trung tâm"), dạng vành khuyên thay vì hình chữ nhật.
// Drop ceiling for the four corner rooms. The back edge follows the same center-based arc
// as the curved outside wall segments, so the hall ceiling reads as one continuous curve.
function createCurvedOuterDropCeiling(w, zFront, zBack, localY, parent = scene, opts = {}) {
  const group = new THREE.Group();
  group.position.set(0, localY, 0);
  parent.add(group);
  const rimMat = new THREE.MeshStandardMaterial({ color: CEILING_BEIGE, roughness: 0.9, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .08, side: THREE.DoubleSide });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .1, side: THREE.DoubleSide });
  const rimW = Math.min(2.35, w / 4, (zBack - zFront) / 4);
  const outerR = opts.outerRadius ?? Math.hypot(w / 2, zBack);

  const makeCeilingShape = (halfW, frontZ, radius) => {
    const backZ = Math.sqrt(Math.max(0, radius * radius - halfW * halfW));
    const aRight = Math.atan2(backZ, halfW);
    const aLeft = Math.atan2(backZ, -halfW);
    const shape = new THREE.Shape();
    shape.moveTo(-halfW, frontZ);
    shape.lineTo(halfW, frontZ);
    shape.lineTo(halfW, backZ);
    shape.absarc(0, 0, radius, aRight, aLeft, false);
    shape.lineTo(-halfW, frontZ);
    shape.closePath();
    return shape;
  };

  const fullShape = makeCeilingShape(w / 2, zFront, outerR);
  const innerHalfW = Math.max(.1, w / 2 - rimW);
  const innerFrontZ = zFront + rimW;
  const innerR = Math.max(innerFrontZ + .1, outerR - rimW);
  const innerShape = makeCeilingShape(innerHalfW, innerFrontZ, innerR);
  fullShape.holes.push(innerShape);

  const rim = new THREE.Mesh(new THREE.ShapeGeometry(fullShape, 64), rimMat);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const core = new THREE.Mesh(new THREE.ShapeGeometry(innerShape, 64), coreMat);
  core.rotation.x = Math.PI / 2;
  core.position.y = .4;
  group.add(core);

  const ringMat = new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_RING, toneMapped: false });
  const r1 = Math.min(1.18, w / 6, (zBack - zFront) / 6);
  const r2 = r1 * .75;
  const lampZ = (zFront + zBack) / 2;
  const createCeilingLampPair = (xOffset = 0) => {
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(r1, .065, 16, 72), ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(xOffset - r1 * .45, -.7, lampZ);
    group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r2, .065, 16, 72), ringMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set(xOffset + r1 * .42, -.88, lampZ);
    group.add(ring2);

    const pairLightSpot = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(.22, r2 * .22), 32),
      new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_SOFT, transparent: true, opacity: .92, side: THREE.DoubleSide, toneMapped: false })
    );
    pairLightSpot.rotation.x = Math.PI / 2;
    pairLightSpot.position.set(xOffset, -.72, lampZ);
    group.add(pairLightSpot);

    const pairGlow = new THREE.PointLight(LIGHT_AMBER, 68, Math.max(w, zBack - zFront) * 1.28, 1.45);
    pairGlow.position.set(xOffset, -1.15, lampZ);
    pairGlow.userData.keepRealLight = true;
    group.add(pairGlow);
  };
  createCeilingLampPair();
  (opts.extraLampOffsets || []).forEach(createCeilingLampPair);
  return group;
}

// Trần cho khu trung tâm (vành khuyên tròn quanh Hạt nhân số) — mảng trần thứ 5 theo hồ sơ
// thiết kế gốc ("5 mảng trần: 4 phòng + trung tâm"), dạng vành khuyên thay vì hình chữ nhật.
function createCentralCeiling() {
  const group = new THREE.Group();
  group.position.set(0, CEIL_H + .5, 0);
  scene.add(group);
  const centralCeilingOuterR = radiusToLineFromOrigin(NORTH_RECESSED.doorA, NORTH_RECESSED.doorB) - WALL_T / 2;

  // Trần trung tâm dùng mép ngoài tròn 360° để đồng bộ với các mảng tường cong nối giữa
  // các góc phòng; không còn các đoạn thẳng trước cửa từng góc làm gãy đường tròn.
  const centralRimMat = new THREE.MeshStandardMaterial({ color: CEILING_BEIGE, roughness: .9, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .08, side: THREE.DoubleSide });
  const fasciaMat = new THREE.MeshStandardMaterial({ color: CEILING_BEIGE, roughness: .86, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .08, side: THREE.DoubleSide });
  const rimW = Math.min(2.35, (centralCeilingOuterR - HUB_R) / 5);
  const tierLift = CENTRAL_CEILING_TIER_LIFT;
  const coreInnerR = HUB_R + rimW;
  const coreOuterR = centralCeilingOuterR - rimW;
  const makeAnnulusShape = (innerR, outerR) => {
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);
    return ringShape;
  };

  const outerRim = new THREE.Mesh(new THREE.ShapeGeometry(makeAnnulusShape(coreOuterR, centralCeilingOuterR), 96), centralRimMat);
  outerRim.rotation.x = Math.PI / 2;
  group.add(outerRim);

  const innerTierRim = new THREE.Mesh(new THREE.ShapeGeometry(makeAnnulusShape(HUB_R, coreInnerR), 96), centralRimMat);
  innerTierRim.rotation.x = Math.PI / 2;
  group.add(innerTierRim);

  [coreInnerR, coreOuterR].forEach(radius => {
    const fascia = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, tierLift, 128, 1, true), fasciaMat);
    fascia.position.y = tierLift / 2;
    group.add(fascia);
  });

  const skylightDepth = .58;
  const skylightReveal = new THREE.Mesh(new THREE.CylinderGeometry(HUB_R, HUB_R, skylightDepth, 128, 1, true), fasciaMat);
  skylightReveal.position.y = -skylightDepth / 2;
  group.add(skylightReveal);

  const skylightSun = new THREE.DirectionalLight(LIGHT_AMBER_SOFT, 1.05);
  skylightSun.position.set(-6, 18, 4);
  skylightSun.target.position.set(0, 0, 0);
  group.add(skylightSun);
  group.add(skylightSun.target);

  const skylightGlow = new THREE.PointLight(LIGHT_AMBER, 34, HUB_R * 3.1, 1.35);
  skylightGlow.position.set(0, -1.4, 0);
  skylightGlow.userData.keepRealLight = true;
  group.add(skylightGlow);

  const core = new THREE.Mesh(new THREE.ShapeGeometry(makeAnnulusShape(coreInnerR, coreOuterR), 96), centralCeilingMat);
  core.rotation.x = Math.PI / 2;
  core.position.y = tierLift;
  group.add(core);

  // Viền trắng mỏng sát mép Hạt nhân số (đồng bộ mô-típ viền trong của trần thả 4 phòng).
  const centralCeilingWorldY = CEIL_H + .5 + tierLift;
  ROOM_KEYS.filter(key => !MERGED_REGION_KEYS.includes(key)).forEach(key =>
    createRoomCeilingBridgePatch(ROOM_DEFS[key], centralCeilingWorldY, centralCeilingOuterR, centralCeilingMat)
  );
  // The East side is one merged room, but its two original door spans still
  // need the same overlap bridge to close the seam against the round ceiling.
  MERGED_REGION_KEYS.forEach(key =>
    createRoomCeilingBridgePatch(ROOM_DEFS[key], centralCeilingWorldY, centralCeilingOuterR, centralCeilingMat)
  );
  [NORTH_RECESSED, ...EAST_W].filter(connector => connector !== MERGED_REGION_CONNECTOR).forEach(connector => {
    createConnectorNeckPatch(connector, centralCeilingWorldY, centralCeilingMat, centralCeilingOuterR);
    createConnectorSurfacePatch(connector, centralCeilingWorldY, centralCeilingMat);
  });
  if (MERGED_REGION_CONNECTOR) {
    createConnectorNeckPatch(MERGED_REGION_CONNECTOR, centralCeilingWorldY, centralCeilingMat, centralCeilingOuterR);
  }

  // 4 vòng nhẫn sáng vàng trên trần sảnh chính, rải theo hướng 4 phòng.
  const ringMat = new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_RING, toneMapped: false });
  const r1 = 1.18;
  const r2 = r1 * .75;
  const addCentralCeilingLamp = (cx, cz, lampY = -.7) => {
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(r1, .065, 16, 72), ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(cx - r1 * .45, lampY, cz);
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r2, .065, 16, 72), ringMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set(cx + r1 * .42, lampY - .18, cz);
    group.add(ring2);

    const lightSpot = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(.22, r2 * .22), 32),
      new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_SOFT, transparent: true, opacity: .92, side: THREE.DoubleSide, toneMapped: false })
    );
    lightSpot.rotation.x = Math.PI / 2;
    lightSpot.position.set(cx, lampY - .02, cz);
    group.add(lightSpot);

    const lampGlow = new THREE.PointLight(LIGHT_AMBER, 68, Math.max(ROOM_W, ROOM_D) * 1.28, 1.45);
    lampGlow.position.set(cx, -1.15, cz);
    lampGlow.userData.keepRealLight = true;
    group.add(lampGlow);
  };

  addCentralCeilingLamp(0, 0, -.7);
  ROOM_KEYS.forEach((key, i) => {
    const room = ROOM_DEFS[key];
    addCentralCeilingLamp(
      room.F[0] * (HUB_R + RING_OUT) / 2,
      room.F[1] * (HUB_R + RING_OUT) / 2,
      -.7 - (i % 2) * .18
    );
  });
}

// Trần phẳng đơn giản cho các đoạn hành lang lối vào (cổng thắt, quạt loe, bức tường con loe
// rộng) — không cần hoạ tiết trần thả cầu kỳ như phòng/sảnh, nhưng vẫn phải che kín phía trên
// để không gian nào cũng có trần, tránh nhìn thấy nền trời/sương mù khi ngước lên.
function addRectToShape(shape, F, R, halfW, frontR, backR) {
  const p = (depth, side) => [
    F[0] * depth + R[0] * side,
    F[1] * depth + R[1] * side
  ];
  const points = [
    p(frontR, -halfW),
    p(frontR, halfW),
    p(backR, halfW),
    p(backR, -halfW)
  ];
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
}

function createCeilingBackfill() {
  const addBackfillMesh = (shape, segments = 64) => {
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, segments), centralCeilingMat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = CEIL_H + .94;
    mesh.renderOrder = -1;
    scene.add(mesh);
    return mesh;
  };

  // A high, continuous safety backfill prevents sky leaks in every junction.
  // The visible dropped ceilings sit below it, so this only appears in gaps.
  const centerShape = new THREE.Shape();
  centerShape.absarc(0, 0, R_OUT + WALL_T * 2, 0, Math.PI * 2, false);
  const skylightHole = new THREE.Path();
  skylightHole.absarc(0, 0, HUB_R, 0, Math.PI * 2, true);
  centerShape.holes.push(skylightHole);
  addBackfillMesh(centerShape, 96);

  ROOM_KEYS.filter(key => !MERGED_REGION_KEYS.includes(key)).forEach(key => {
    const room = ROOM_DEFS[key];
    const roomShape = new THREE.Shape();
    addRectToShape(roomShape, room.F, room.R, ROOM_W / 2 + WALL_T * 2, RING_OUT - WALL_T * 2, R_BACK + WALL_T);
    addBackfillMesh(roomShape, 32);
  });

  [NORTH_RECESSED, ...EAST_W].filter(connector => connector !== MERGED_REGION_CONNECTOR).forEach(connector => {
    const connectorShape = new THREE.Shape();
    connectorShape.moveTo(connector.doorA[0], connector.doorA[1]);
    connectorShape.lineTo(connector.doorB[0], connector.doorB[1]);
    connectorShape.lineTo(connector.backB[0], connector.backB[1]);
    connectorShape.lineTo(connector.backA[0], connector.backA[1]);
    connectorShape.closePath();
    addBackfillMesh(connectorShape, 32);
  });


}

function createFlatCeilingPatch(points, y, color = CEILING_BEIGE) {
  const material = color?.isMaterial
    ? color
    : new THREE.MeshStandardMaterial({ color, roughness: .9, emissive: LIGHT_AMBER_PALE, emissiveIntensity: .08, side: THREE.DoubleSide });
  const mesh = createPolygonPatch({ points, y, material });
  scene.add(mesh);
  return mesh;
}

function createFlatFloorPatch(points, y = -0.09, material = floorPatchMat) {
  const mesh = createPolygonPatch({ points, y, material });
  scene.add(mesh);
  return mesh;
}

function addShortArcToShape(shape, fromPoint, toPoint, radius, segments = 28) {
  const from = angleOf(fromPoint);
  const to = angleOf(toPoint);
  let delta = (to - from + Math.PI * 2) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  for (let i = 1; i <= segments; i++) {
    const a = from + delta * (i / segments);
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
}

function radiusToLineFromOrigin(pA, pB) {
  const dx = pB[0] - pA[0];
  const dz = pB[1] - pA[1];
  const len = Math.hypot(dx, dz) || 1;
  return Math.abs(pA[0] * dz - pA[1] * dx) / len;
}

function offsetSegmentToward(pA, pB, target, amount) {
  const dx = pB[0] - pA[0];
  const dz = pB[1] - pA[1];
  const len = Math.hypot(dx, dz) || 1;
  let nx = -dz / len;
  let nz = dx / len;
  const midX = (pA[0] + pB[0]) / 2;
  const midZ = (pA[1] + pB[1]) / 2;
  if ((target[0] - midX) * nx + (target[1] - midZ) * nz < 0) {
    nx *= -1;
    nz *= -1;
  }
  return [
    [pA[0] + nx * amount, pA[1] + nz * amount],
    [pB[0] + nx * amount, pB[1] + nz * amount]
  ];
}

function createInsetConnectorCeilingPatch(connector, y, material, wallThickness) {
  const targetA = [
    (connector.doorB[0] + connector.backB[0]) / 2,
    (connector.doorB[1] + connector.backB[1]) / 2
  ];
  const targetB = [
    (connector.doorA[0] + connector.backA[0]) / 2,
    (connector.doorA[1] + connector.backA[1]) / 2
  ];
  const [doorA, backA] = offsetSegmentToward(connector.doorA, connector.backA, targetA, wallThickness / 2);
  const [doorB, backB] = offsetSegmentToward(connector.doorB, connector.backB, targetB, wallThickness / 2);
  return createFlatCeilingPatch([doorA, doorB, backB, backA], y, material);
}

function createInsetConnectorNeckCeilingPatch(connector, y, material, innerRadius, wallThickness) {
  const targetA = [
    (connector.doorB[0] + connector.backB[0]) / 2,
    (connector.doorB[1] + connector.backB[1]) / 2
  ];
  const targetB = [
    (connector.doorA[0] + connector.backA[0]) / 2,
    (connector.doorA[1] + connector.backA[1]) / 2
  ];
  const [doorA] = offsetSegmentToward(connector.doorA, connector.backA, targetA, wallThickness / 2);
  const [doorB] = offsetSegmentToward(connector.doorB, connector.backB, targetB, wallThickness / 2);
  const innerA = projectPointToRadius(doorA, innerRadius);
  const innerB = projectPointToRadius(doorB, innerRadius);
  const shape = new THREE.Shape();
  shape.moveTo(doorA[0], doorA[1]);
  shape.lineTo(doorB[0], doorB[1]);
  shape.lineTo(innerB[0], innerB[1]);
  addShortArcToShape(shape, innerB, innerA, innerRadius, 32);
  shape.lineTo(doorA[0], doorA[1]);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 40), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  scene.add(mesh);
  return mesh;
}

function createConnectorSurfacePatch(connector, y, material, radius = R_OUT) {
  const shape = new THREE.Shape();
  shape.moveTo(connector.doorA[0], connector.doorA[1]);
  shape.lineTo(connector.doorB[0], connector.doorB[1]);
  shape.lineTo(connector.backB[0], connector.backB[1]);
  addShortArcToShape(shape, connector.backB, connector.backA, radius);
  shape.lineTo(connector.doorA[0], connector.doorA[1]);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  scene.add(mesh);
  return mesh;
}

function createConnectorNeckPatch(connector, y, material, innerRadius) {
  const innerA = [
    connector.doorA[0] / Math.hypot(connector.doorA[0], connector.doorA[1]) * innerRadius,
    connector.doorA[1] / Math.hypot(connector.doorA[0], connector.doorA[1]) * innerRadius
  ];
  const innerB = [
    connector.doorB[0] / Math.hypot(connector.doorB[0], connector.doorB[1]) * innerRadius,
    connector.doorB[1] / Math.hypot(connector.doorB[0], connector.doorB[1]) * innerRadius
  ];
  const shape = new THREE.Shape();
  shape.moveTo(connector.doorA[0], connector.doorA[1]);
  shape.lineTo(connector.doorB[0], connector.doorB[1]);
  shape.lineTo(innerB[0], innerB[1]);
  addShortArcToShape(shape, innerB, innerA, innerRadius);
  shape.lineTo(connector.doorA[0], connector.doorA[1]);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 32), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  scene.add(mesh);
  return mesh;
}

/* ==========================================================================================
   4. HỆ THỐNG NỘI DUNG "ĐẶT CHỖ" (placeholder) — khung tranh vàng đồng 3 lớp giống Chủ đề 1,
   dùng canvas vẽ biểu tượng minh hoạ (ảnh/video/mô hình 3D/bản đồ/thư) khi chưa có tư liệu gốc.
   ========================================================================================== */
function drawPlaceholderIcon(ctx, kind, cx, cy, s, accent) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = accent; ctx.fillStyle = accent;
  ctx.lineWidth = s * 0.045;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (kind === "video") {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.52, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, -s * 0.24); ctx.lineTo(-s * 0.16, s * 0.24); ctx.lineTo(s * 0.28, 0);
    ctx.closePath(); ctx.fill();
  } else if (kind === "model3d") {
    const r = s * 0.42;
    const top = [0, -r], l = [-r * 0.87, r * 0.5], right = [r * 0.87, r * 0.5];
    ctx.beginPath(); ctx.moveTo(...top); ctx.lineTo(...right); ctx.lineTo(...l); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...top); ctx.moveTo(0, 0); ctx.lineTo(...right); ctx.moveTo(0, 0); ctx.lineTo(...l); ctx.stroke();
  } else if (kind === "map") {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, s * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.lineTo(s * 0.5, 0); ctx.stroke();
  } else if (kind === "letter") {
    ctx.strokeRect(-s * 0.5, -s * 0.36, s, s * 0.72);
    ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.36); ctx.lineTo(0, s * 0.06); ctx.lineTo(s * 0.5, -s * 0.36); ctx.stroke();
  } else if (kind === "doc") {
    ctx.strokeRect(-s * 0.36, -s * 0.48, s * 0.72, s * 0.96);
    [-0.16, 0.02, 0.2].forEach(t => {
      ctx.beginPath(); ctx.moveTo(-s * 0.22, s * t); ctx.lineTo(s * 0.22, s * t); ctx.stroke();
    });
  } else {
    ctx.strokeRect(-s * 0.5, -s * 0.38, s, s * 0.76);
    ctx.beginPath(); ctx.arc(-s * 0.22, -s * 0.1, s * 0.09, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.3); ctx.lineTo(-s * 0.1, -s * 0.06); ctx.lineTo(s * 0.14, s * 0.14); ctx.lineTo(s * 0.5, -s * 0.14); ctx.lineTo(s * 0.5, s * 0.38); ctx.lineTo(-s * 0.5, s * 0.38); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function makePlaceholderCanvas(item, accent) {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 640;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#f8fafc");
  grad.addColorStop(1, "#e7ecf1");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, c.width - 36, c.height - 36);
  drawPlaceholderIcon(ctx, item.kind, c.width / 2, c.height / 2 - 46, 190, accent);
  ctx.fillStyle = "#172032";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 34px Roboto, Arial, sans-serif";
  wrapFillText(ctx, item.title, c.width / 2, c.height - 118, c.width - 140, 42);
  ctx.font = "700 22px Roboto, Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Tư liệu minh hoạ — cập nhật khi có nội dung chính thức", c.width / 2, c.height - 46);
  return c;
}

function wrapFillText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "", lines = [];
  words.forEach(w => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  });
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * lineHeight));
}

const placeholderTextureCache = new Map();
const EVENT_FRAME_PHOTO_PATHS = [
  "./image/hoat_dong/HA-01-21.jpg",
  "./image/hoat_dong/IMG_2144.JPG",
  "./image/hoat_dong/_MG_8295.JPG"
];
const LEADERSHIP_FRAME_PHOTO_PATHS = [
  "./image/lanh_dao/GS_LeVanThiem.avif",
  "./image/lanh_dao/GS_DangThaiMai.avif",
  "./image/lanh_dao/GS_VS_PhamHuyThong.avif",
  "./image/lanh_dao/GS_NguyenLuongNgoc.avif",
  "./image/lanh_dao/GS_NguyenCanhToan.avif"
];
const eventFramePhotoCache = new Map();
let nextEventFramePhotoIndex = 0;
function getFramePhoto(paths, index, collection) {
  const photoIndex = ((index % paths.length) + paths.length) % paths.length;
  const cacheKey = `${collection}-${photoIndex}`;
  if (eventFramePhotoCache.has(cacheKey)) return eventFramePhotoCache.get(cacheKey);
  const source = paths[photoIndex];
  const texture = new THREE.TextureLoader().load(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  const bundle = { texture, dataUrl: source };
  eventFramePhotoCache.set(cacheKey, bundle);
  return bundle;
}
function getEventFramePhoto(index) {
  return getFramePhoto(EVENT_FRAME_PHOTO_PATHS, index, "activity");
}
function getLeadershipFramePhoto(index) {
  return getFramePhoto(LEADERSHIP_FRAME_PHOTO_PATHS, index, "leadership");
}
function getPlaceholderTexture(item, accent) {
  const key = item.kind + "|" + item.title + "|" + accent;
  if (placeholderTextureCache.has(key)) return placeholderTextureCache.get(key);
  const canvas = makePlaceholderCanvas(item, accent);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const dataUrl = canvas.toDataURL("image/png");
  const bundle = { texture, dataUrl };
  placeholderTextureCache.set(key, bundle);
  return bundle;
}

/* ==========================================================================================
   4.a CỤM THẺ CHÂN DUNG CHUYÊN GIA (Góc 1 · STT3) — đúng "Hồ sơ thiết kế chi tiết Phòng Góc 1":
   khung ảnh kim loại mảnh bo góc lớn kiểu thẻ hồ sơ số, bảng tên tách rời, icon loa 2 trạng
   thái (mặc định / đang phát) + hiệu ứng sáng dần khi camera tới gần, chỉ 1 thẻ phát cùng lúc.
   ========================================================================================== */
let currentPlayingExpertAudio = null; // đảm bảo toàn phòng chỉ 1 thẻ phát cùng lúc
let currentPlayingFrameAudio = null;
const expertProximityIcons = [];       // {icon, glow} — cập nhật độ sáng theo khoảng cách mỗi khung hình

// Ảnh chân dung "đặt chỗ": nền bo góc lớn (kiểu thẻ hồ sơ hiện đại) + hình bóng người đơn giản.
// Hình chữ nhật bo góc, màu đặc — dùng làm khung kim loại 3D (kích thước m, radius tính bằng m
// nhưng vẽ theo tỉ lệ canvas 100px/m để nét bo góc luôn mượt bất kể kích thước thật).
function makeRoundedRectTexture(colorHex, wMeters, hMeters, radiusMeters) {
  const scale = 100; // px/m
  const c = document.createElement("canvas");
  c.width = Math.max(8, Math.round(wMeters * scale));
  c.height = Math.max(8, Math.round(hMeters * scale));
  const ctx = c.getContext("2d");
  const r = Math.min(radiusMeters * scale, c.width / 2, c.height / 2);
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(c.width - r, 0); ctx.quadraticCurveTo(c.width, 0, c.width, r);
  ctx.lineTo(c.width, c.height - r); ctx.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.fillStyle = colorHex; ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeExpertPhotoTexture(name, accentHex) {
  const c = document.createElement("canvas");
  c.width = 800; c.height = 1100; // tỉ lệ 1,6 × 2,2
  const ctx = c.getContext("2d");
  const r = 70; // bo góc lớn (~14cm quy đổi)
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(c.width - r, 0); ctx.quadraticCurveTo(c.width, 0, c.width, r);
  ctx.lineTo(c.width, c.height - r); ctx.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.save(); ctx.clip();
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#e4eaef"); grad.addColorStop(1, "#b9c4cd");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#8695a3";
  ctx.beginPath(); ctx.arc(c.width / 2, c.height * .36, 130, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(c.width / 2, c.height * .92, 240, 270, 0, Math.PI, 0, true); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = "#6f8293"; ctx.stroke(); // viền kim loại mảnh
  ctx.fillStyle = "#5b6b78"; ctx.textAlign = "center"; ctx.font = "700 30px Roboto, Arial, sans-serif";
  ctx.fillText("Ảnh minh hoạ — cập nhật ảnh thật", c.width / 2, c.height - 40);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, dataUrl: c.toDataURL("image/png") };
}
function makeNameplateTexture(name, role) {
  const c = document.createElement("canvas");
  c.width = 1000; c.height = 300;
  const ctx = c.getContext("2d");
  const r = 34;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(c.width - r, 0); ctx.quadraticCurveTo(c.width, 0, c.width, r);
  ctx.lineTo(c.width, c.height - r); ctx.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.fillStyle = "#f4f7f9"; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = "#d6b86f"; ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#172032"; ctx.font = "700 62px Roboto, Arial, sans-serif";
  ctx.fillText(name, c.width / 2, 130);
  ctx.fillStyle = "rgba(23,32,50,0.72)"; ctx.font = "600 42px Roboto, Arial, sans-serif";
  ctx.fillText(role, c.width / 2, 205);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Icon loa: "idle" (nền trắng viền vàng đồng) và "playing" (nền vàng sáng + 2 vệt sóng âm + hào quang).
function makeSpeakerIconTexture(state) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (state === "playing") {
    const halo = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
    halo.addColorStop(0, "rgba(244,178,35,.55)"); halo.addColorStop(1, "rgba(244,178,35,0)");
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 256, 256);
  }
  ctx.beginPath(); ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.fillStyle = state === "playing" ? "#f4b223" : "#f8fafc"; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = "#d6b86f"; ctx.stroke();
  ctx.fillStyle = "#005baa";
  ctx.beginPath();
  ctx.moveTo(84, 104); ctx.lineTo(104, 104); ctx.lineTo(134, 78); ctx.lineTo(134, 178);
  ctx.lineTo(104, 152); ctx.lineTo(84, 152); ctx.closePath(); ctx.fill();
  if (state === "playing") {
    ctx.strokeStyle = "#005baa"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(140, 128, 26, -.6, .6); ctx.stroke();
    ctx.beginPath(); ctx.arc(140, 128, 42, -.75, .75); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Bảng "plaque" nhỏ kiểu hero-mini: nền tường sáng, viền vàng đồng, chữ đậm — dùng cho các bảng
// trang trọng ngắn gọn (vd. "Quyết định thành lập").
function createHeroPlaque(text, position, size, rotationY, parent = scene) {
  return addTextPanel(text, position, size, rotationY, {
    size: 22, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
    borderWidth: 7, weight: 900, wrap: true, width: 1100, height: 620, maxWidth: 940, lineHeight: 32
  }, parent);
}
const ROOM_HOANH_PHI_TEXTS = {
  goc1: {
    main: "T\u1ED4NG QUAN CHUY\u1EC2N \u0110\u1ED4I S\u1ED0",
    left: "G\u00D3C CHIA S\u1EBA CHUY\u00CAN GIA",
    right: "\u0110\u1ED8I H\u00CCNH \u201CB\u00CCNH D\u00C2N H\u1ECCC V\u1EE4 S\u1ED0\u201D"
  },
  goc3: {
    main: "B\u1EA2NG GHIM \u00DD T\u01AF\u1EDENG KH\u1EDCI NGHI\u1EC6P",
    left: "G\u00D3C \u00DD T\u01AF\u1EDENG M\u1EDE",
    right: "S\u1EA2N PH\u1EA8M S\u00C1NG T\u1EA0O"
  },
  goc4: {
    main: "HNUE V\u01AF\u01A0N T\u1EA6M TH\u1EBE GI\u1EDAI",
    left: "H\u00C0NH TR\u00CCNH \u0110\u1EA0I S\u1EE8 SINH VI\u00CAN",
    right: "C\u00C2U CHUY\u1EC6N H\u1ED8I NH\u1EACP"
  },
  goc5: {
    main: "ĐỘI BÌNH DÂN HỌC VỤ SỐ",
    left: "TỪ NĂNG LỰC SỐ ĐẾN HÀNH ĐỘNG CỘNG ĐỒNG",
    right: "BẢN LĨNH TRONG THỜI ĐẠI SỐ"
  }
};

function createHoanhPhiFrame(parent, text, position, size, rotationY) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  const [w, h] = size;
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x234d6f, roughness: .46, metalness: .18 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x142c40, roughness: .56, metalness: .14 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd6a84b, roughness: .34, metalness: .42 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0x982f35, roughness: .48, metalness: .10 });

  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(w + .42, h + .28, .14), darkMat);
  backPlate.position.z = -.035;
  group.add(backPlate);

  const face = new THREE.Mesh(new THREE.BoxGeometry(w, h, .08), navyMat);
  face.position.z = .03;
  group.add(face);

  [
    [w + .42, .085, 0, h / 2 + .10],
    [w + .42, .085, 0, -h / 2 - .10],
    [.085, h + .20, -w / 2 - .16, 0],
    [.085, h + .20, w / 2 + .16, 0]
  ].forEach(([rw, rh, x, y]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, .16), goldMat);
    rail.position.set(x, y, .10);
    group.add(rail);
  });

  const redAccent = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * .18, 2.6), .09, .035), redMat);
  redAccent.position.set(-w * .5 + Math.min(w * .18, 2.6) / 2 + .22, -h * .5 + .18, .19);
  const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w * .68, 3.2), .09, .035), goldMat);
  goldAccent.position.set(w * .10, -h * .5 + .18, .19);
  group.add(redAccent, goldAccent);

  const textPanel = addTextPanel(text, [0, .06, .21], [w * .94, h * .68], 0, {
    size: 125, color: "#ffffff", background: "transparent", border: false,
    weight: 900, wrap: false, width: 2200, height: 420,
    strokeColor: "#d6a84b", strokeWidth: 8,
    shadowColor: "rgba(0,0,0,.32)", shadowBlur: 8, shadowOffsetY: 3,
    depthWrite: false, depthTest: true
  }, group);
  textPanel.renderOrder = 24;

  return group;
}

function createRoomTopHoanhPhi(parent, key, opts = {}) {
  const texts = ROOM_HOANH_PHI_TEXTS[key];
  if (!texts) return;

  const y = CEIL_H - 2.18;
  const wallOffset = .24;
  const sideZ = RING_OUT + ROOM_D / 2;
  const frontW = Math.min(ROOM_W * .62, 15.4);
  const sideW = Math.min(ROOM_D * .40, 15.8);
  const h = 1.45;

  createHoanhPhiFrame(parent, texts.main, [0, y, R_BACK - WALL_T / 2 - wallOffset], [frontW, h], Math.PI);
  if (!opts.skipLeft) createHoanhPhiFrame(parent, texts.left, [-ROOM_W / 2 + WALL_T / 2 + wallOffset, y, sideZ], [sideW, h], Math.PI / 2);
  if (!opts.skipRight) createHoanhPhiFrame(parent, texts.right, [ROOM_W / 2 - WALL_T / 2 - wallOffset, y, sideZ], [sideW, h], -Math.PI / 2);
}
function createGoc3LongGlassShowcase(parent, opts = {}) {
  const cabinetLength = opts.length ?? Math.min(ROOM_D * .78, 30.4);
  const cabinetDepth = 1.72;
  const baseH = 1.55;
  const whiteBaseH = .32;
  const tierCount = opts.tiers ?? 1;
  const glassH = tierCount === 3 ? 7.2 : 2.78;
  const wallClearance = .3;
  const x = opts.x ?? (ROOM_W / 2 - WALL_T / 2 - wallClearance - cabinetDepth / 2);
  const z = opts.z ?? (RING_OUT + ROOM_D / 2);

  const group = new THREE.Group();
  // Sink showcase 0.02 below y=0 so its base box bottom does not z-fight the floor mesh.
  group.position.set(x, -0.02, z);
  group.rotation.y = opts.rotationY ?? 0;
  parent.add(group);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5733, roughness: .68, metalness: .04 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f7f9, roughness: .62, metalness: .02 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .3, metalness: .62 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff1fb, roughness: .04, metalness: 0, transparent: true, opacity: .24,
    transmission: .35, clearcoat: 1, clearcoatRoughness: .08, side: THREE.DoubleSide
  });

  const carpet = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth + .42, .035, cabinetLength + .52),
    new THREE.MeshStandardMaterial({ color: 0x8fa9bb, roughness: .86 }));
  carpet.position.y = .02;
  group.add(carpet);

  const base = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth, baseH, cabinetLength), woodMat);
  base.position.y = baseH / 2;
  group.add(base);

  const whiteBase = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .12, whiteBaseH, cabinetLength - .18), whiteMat);
  whiteBase.position.y = baseH + whiteBaseH / 2;
  group.add(whiteBase);

  const glassY = baseH + whiteBaseH + glassH / 2;
  const glassThickness = .035;
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(glassThickness, glassH, cabinetLength - .42), glassMat);
  frontGlass.position.set(cabinetDepth / 2 - .11, glassY, 0);
  frontGlass.renderOrder = 6;
  group.add(frontGlass);
  const backGlass = frontGlass.clone();
  backGlass.position.x = -cabinetDepth / 2 + .11;
  group.add(backGlass);
  [-1, 1].forEach(sign => {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .22, glassH, glassThickness), glassMat);
    sideGlass.position.set(0, glassY, sign * (cabinetLength / 2 - .21));
    sideGlass.renderOrder = 6;
    group.add(sideGlass);
  });

  const topGlass = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .22, glassThickness, cabinetLength - .42), glassMat);
  topGlass.position.set(0, baseH + whiteBaseH + glassH + glassThickness / 2, 0);
  topGlass.renderOrder = 6;
  group.add(topGlass);

  const tierHeight = glassH / tierCount;
  for (let tier = 1; tier < tierCount; tier++) {
    const shelfY = baseH + whiteBaseH + tier * tierHeight;
    const shelfDeck = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .3, .12, cabinetLength - .42), woodMat);
    shelfDeck.position.y = shelfY;
    group.add(shelfDeck);

    [-1, 1].forEach(side => {
      const shelfRail = new THREE.Mesh(new THREE.BoxGeometry(.075, .09, cabinetLength - .22), brassMat);
      shelfRail.position.set(side * (cabinetDepth / 2 - .08), shelfY + .035, 0);
      group.add(shelfRail);
    });
  }

  const bottomRailY = baseH + whiteBaseH + .035;
  const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .08, .07, cabinetLength - .18), brassMat);
  bottomRail.position.y = bottomRailY;
  group.add(bottomRail);

  const topRailY = topGlass.position.y + .055;
  [-1, 1].forEach(sx => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, cabinetLength - .18), brassMat);
    rail.position.set(sx * (cabinetDepth / 2 - .08), topRailY, 0);
    group.add(rail);
  });
  [-1, 1].forEach(sz => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(cabinetDepth - .08, .07, .07), brassMat);
    rail.position.set(0, topRailY, sz * (cabinetLength / 2 - .12));
    group.add(rail);
  });

  [-1, 1].forEach(sx => {
    [-1, 1].forEach(sz => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.07, glassH, .07), brassMat);
      post.position.set(sx * (cabinetDepth / 2 - .08), baseH + whiteBaseH + glassH / 2, sz * (cabinetLength / 2 - .12));
      group.add(post);
    });
  });

  const dividerCount = 5;
  for (let i = 1; i < dividerCount; i++) {
    const dz = -cabinetLength / 2 + (cabinetLength / dividerCount) * i;
    const divider = new THREE.Mesh(new THREE.BoxGeometry(.05, glassH * .92, .055), brassMat);
    divider.position.set(cabinetDepth / 2 - .08, baseH + whiteBaseH + glassH / 2, dz);
    group.add(divider);
  }

  const productMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .38, emissive: 0x6f8293, emissiveIntensity: .08, metalness: .05 });
  const productSlots = [-.36, -.12, .12, .36].map(t => t * cabinetLength);
  for (let tier = 0; tier < tierCount; tier++) {
    const tierBaseY = baseH + whiteBaseH + tier * tierHeight;
    productSlots.forEach((slotZ, i) => {
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, .1, 32), brassMat);
      plinth.position.set(0, tierBaseY + .08, slotZ);
      group.add(plinth);

      const model = new THREE.Mesh(
        (i + tier) % 2 === 0 ? new THREE.IcosahedronGeometry(.28, 1) : new THREE.OctahedronGeometry(.32, 0),
        productMat
      );
      model.position.set(0, tierBaseY + .42, slotZ);
      model.rotation.set(.28, (i + tier * 2) * .55, .18);
      group.add(model);
    });
  }

  const labelText = "S\u1EA2N PH\u1EA8M S\u00C1NG T\u1EA0O";
  // Product-name captions are intentionally omitted from every glass showcase.

  return group;
}
function createRoomWallGlassShowcases(parent, opts = {}) {
  const wallClearance = .3;
  const cabinetDepth = 1.72;
  const sideLength = ROOM_D * .72;
  const sideZ = RING_OUT + ROOM_D / 2;

  if (!opts.skipRight) createGoc3LongGlassShowcase(parent, {
    x: ROOM_W / 2 - WALL_T / 2 - wallClearance - cabinetDepth / 2,
    z: sideZ,
    length: sideLength,
    tiers: opts.productShowcase ? 3 : 1,
    label: opts.productShowcase
  });
  if (!opts.skipLeft) createGoc3LongGlassShowcase(parent, {
    x: -ROOM_W / 2 + WALL_T / 2 + wallClearance + cabinetDepth / 2,
    z: sideZ,
    length: sideLength,
    tiers: 1,
    label: false
  });

}
function createFlatPhotoCaption(parent, text, position, size, rotationY = 0) {
  const textureHeight = 256;
  const textureWidth = Math.round(Math.min(4000, Math.max(1800, textureHeight * size[0] / size[1])));
  const label = addTextPanel(text, position, size, rotationY, {
    size: 88, minFontSize: 58, fitSingleLine: true, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
    borderWidth: 5, weight: 900, wrap: false, width: textureWidth, height: textureHeight, maxWidth: textureWidth * .88,
    strokeColor: "rgba(255,255,255,.92)", strokeWidth: 4,
    shadowColor: "rgba(0,0,0,.16)", shadowBlur: 4, shadowOffsetY: 2,
    depthWrite: false, depthTest: true
  }, parent);
  label.renderOrder = 26;
}
function createGoc3IdeaGallery(parent) {
  const ideas = [
    ["Tu sach hoc lieu mo", "Thu vien chia se tai lieu hoc tap do sinh vien dong gop."],
    ["Ban do ky nang so", "Ban do hoa nang luc so va lo trinh tu hoc ca nhan."],
    ["Phong lab xanh", "Giai phap tai su dung vat lieu cho hoat dong sinh vien."],
    ["Tro ly hoc tap AI", "Tro ly goi y bai tap va nguon hoc lieu phu hop."],
    ["Cho phien y tuong", "Khong gian ket noi y tuong, nguoi huong dan va nguon luc."],
    ["Nhat ky cong dong", "Nen tang ghi nhan dong gop nho cho cac du an xa hoi."],
    ["Lop hoc ket noi", "Mo hinh hoc tap lien nganh voi doi tac quoc te."],
    ["He thong doi do", "Diem thuong cho hanh dong xanh va ho tro cong dong."],
    ["Goc sang tao mo", "Bo dung cu lam mau nhanh cho y tuong cua sinh vien."],
    ["Ket noi cuu sinh vien", "Mang luoi co van nghe nghiep va ho tro khoi nghiep."],
    ["Du lieu vi cong dong", "Bang dieu khien mo ve cac du an phuc vu xa hoi."],
    ["Hanh trinh du an", "Nhat ky tu y tuong den san pham cua cac nhom sinh vien."]
  ];
  const frameW = 5.35;
  const frameH = 1.95;
  const colStep = 7.25;
  const rowYs = [12.15, 8.4, 4.65];
  const accentColors = ["#d6b86f", "#6f8293", "#005baa", "#b71f32"];

  ideas.forEach(([title, desc], index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = (col - 1.5) * colStep;
    const y = rowYs[row];
    const item = { kind: "photo", title, desc };
    createFramedPanel(item, [x, y, R_BACK - .42], [frameW, frameH], Math.PI, {
      accent: accentColors[col],
      groupLabel: "Vuon uom y tuong"
    }, parent);
    createFlatPhotoCaption(parent, title, [x, y - frameH / 2 - .58, R_BACK - .47], [frameW + .62, .42], Math.PI);
  });
}
function createDigitalLiteracyPhotoFrame(parent, item, x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = -Math.PI / 2;
  parent.add(group);

  const photoW = 2.42;
  const photoH = 1.36;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .3, metalness: .58 });
  const backMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const outer = new THREE.Mesh(new THREE.BoxGeometry(photoW + .24, photoH + .24, .14), frameMat);
  outer.position.z = .02;
  group.add(outer);

  const backing = new THREE.Mesh(new THREE.BoxGeometry(photoW + .08, photoH + .08, .08), backMat);
  backing.position.z = .1;
  group.add(backing);

  const bundle = getEventFramePhoto(nextEventFramePhotoIndex++);
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(photoW, photoH),
    new THREE.MeshStandardMaterial({ map: bundle.texture, roughness: .58, side: THREE.DoubleSide })
  );
  photo.position.z = .18;
  const artId = registerArtifact({ title: item.title, description: item.desc, group: ROOM_HOANH_PHI_TEXTS.goc1.right, image: bundle.dataUrl });
  photo.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(photo);
  group.add(photo);

  createFlatPhotoCaption(group, item.title, [0, -photoH / 2 - .58, .22], [photoW + .62, .42]);
}

function createGoc1DigitalLiteracyPhotoWall(parent) {
  const items = [
    { kind: "photo", title: "L\u1EDBp h\u1ECDc s\u1ED1 c\u1ED9ng \u0111\u1ED3ng", desc: "Ph\u1ED5 c\u1EADp k\u1EF9 n\u0103ng s\u1ED1 cho sinh vi\u00EAn v\u00E0 ng\u01B0\u1EDDi d\u00E2n." },
    { kind: "photo", title: "H\u01B0\u1EDBng d\u1EABn d\u1ECBch v\u1EE5 c\u00F4ng", desc: "Th\u1EF1c h\u00E0nh thao t\u00E1c tr\u00EAn c\u1ED5ng d\u1ECBch v\u1EE5 tr\u1EF1c tuy\u1EBFn." },
    { kind: "photo", title: "T\u1EADp hu\u1EA5n \u1EE9ng d\u1EE5ng s\u1ED1", desc: "H\u1ED7 tr\u1EE3 c\u00E0i \u0111\u1EB7t, khai th\u00E1c c\u00E1c n\u1EC1n t\u1EA3ng h\u1ECDc t\u1EADp." },
    { kind: "photo", title: "Tr\u1EA1m h\u1ED7 tr\u1EE3 sinh vi\u00EAn", desc: "Gi\u1EA3i \u0111\u00E1p nhanh c\u00E1c v\u1EA5n \u0111\u1EC1 t\u00E0i kho\u1EA3n v\u00E0 bi\u1EC3u m\u1EABu." },
    { kind: "photo", title: "Ng\u00E0y h\u1ED9i chuy\u1EC3n \u0111\u1ED5i s\u1ED1", desc: "Kh\u00F4ng gian tr\u1EA3i nghi\u1EC7m c\u00F4ng c\u1EE5 s\u1ED1 trong nh\u00E0 tr\u01B0\u1EDDng." },
    { kind: "photo", title: "\u0110\u1ED9i h\u00ECnh t\u00ECnh nguy\u1EC7n s\u1ED1", desc: "Sinh vi\u00EAn \u0111\u1ED3ng h\u00E0nh c\u00F9ng c\u1ED9ng \u0111\u1ED3ng trong chuy\u1EC3n \u0111\u1ED5i s\u1ED1." },
    { kind: "photo", title: "T\u00E0i li\u1EC7u h\u01B0\u1EDBng d\u1EABn", desc: "B\u1ED9 infographic, video ng\u1EAFn v\u00E0 s\u1ED5 tay thao t\u00E1c." },
    { kind: "photo", title: "H\u1ED7 tr\u1EE3 ng\u01B0\u1EDDi d\u00E2n", desc: "T\u01B0 v\u1EA5n s\u1EED d\u1EE5ng thi\u1EBFt b\u1ECB v\u00E0 d\u1ECBch v\u1EE5 tr\u1EF1c tuy\u1EBFn." },
    { kind: "photo", title: "Truy\u1EC1n th\u00F4ng \u0111a ph\u01B0\u01A1ng ti\u1EC7n", desc: "S\u1EA3n xu\u1EA5t clip, poster v\u00E0 b\u00E0i \u0111\u0103ng lan t\u1ECFa." },
    { kind: "photo", title: "S\u1ED1 li\u1EC7u lan t\u1ECFa", desc: "T\u1ED5ng h\u1EE3p l\u01B0\u1EE3t ti\u1EBFp c\u1EADn, s\u1ED1 bu\u1ED5i v\u00E0 ng\u01B0\u1EDDi tham gia." },
    { kind: "photo", title: "M\u00F4 h\u00ECnh nh\u00E2n r\u1ED9ng", desc: "Chia s\u1EBB c\u00E1ch t\u1ED5 ch\u1EE9c \u0111\u1EC3 c\u00E1c chi \u0111o\u00E0n c\u00F9ng tri\u1EC3n khai." },
    { kind: "photo", title: "D\u1EA5u \u1EA5n \u0111\u1ED9i h\u00ECnh", desc: "Kho\u1EA3nh kh\u1EAFc ti\u00EAu bi\u1EC3u c\u1EE7a B\u00ECnh d\u00E2n h\u1ECDc v\u1EE5 s\u1ED1." }
,
    { kind: "photo", title: "Goc hoc tap truc tuyen", desc: "Huong dan khai thac lop hoc va tai nguyen truc tuyen." },
    { kind: "photo", title: "Lop ky nang an toan so", desc: "Thuc hanh bao ve tai khoan va du lieu ca nhan." },
    { kind: "photo", title: "Ket noi dich vu so", desc: "Huong dan su dung cac nen tang cong truc tuyen." },
    { kind: "photo", title: "San choi lap trinh", desc: "Cac hoat dong lam quen voi tu duy lap trinh." },
    { kind: "photo", title: "Chia se hoc lieu", desc: "Sinh vien cung dong gop video va tai lieu tu hoc." },
    { kind: "photo", title: "Tu van cong nghe", desc: "Ho tro nguoi dan tiep can cong nghe de dang hon." }  ];
  const wallX = ROOM_W / 2 - WALL_T / 2 - .34;
  const sideZ = RING_OUT + ROOM_D / 2;
  const signW = Math.min(ROOM_D * .76, 29.8);
  const colStep = signW / 6;
  const startZ = sideZ - signW / 2 + colStep / 2;
  const rowYs = [CEIL_H - 5.65, CEIL_H - 8.35, CEIL_H - 11.05];

  items.forEach((item, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    createDigitalLiteracyPhotoFrame(parent, item, wallX, rowYs[row], startZ + col * colStep);
  });
}
function createGoc1ExpertInsetFrameWall(parent) {
  const items = [
    { kind: "photo", title: "GS.TSKH L\u00ea V\u0103n Thi\u00eam", desc: "Chia s\u1ebb kinh nghi\u1ec7m t\u1ed5 ch\u1ee9c ho\u1ea1t \u0111\u1ed9ng B\u00ecnh d\u00e2n h\u1ecdc v\u1ee5 s\u1ed1." },
    { kind: "photo", title: "GS \u0110\u1eb7ng Thai Mai", desc: "G\u1ee3i m\u1edf gi\u1ea3i ph\u00e1p ph\u1ed5 c\u1eadp k\u1ef9 n\u0103ng s\u1ed1 trong sinh vi\u00ean." },
    { kind: "photo", title: "GS.VS Ph\u1ea1m Huy Th\u00f4ng", desc: "C\u00e2u chuy\u1ec7n \u1ee9ng d\u1ee5ng n\u1ec1n t\u1ea3ng s\u1ed1 trong c\u00f4ng t\u00e1c \u0110o\u00e0n." },
    { kind: "photo", title: "GS Nguy\u1ec5n L\u01b0\u01a1ng Ng\u1ecdc", desc: "\u0110\u1ecbnh h\u01b0\u1edbng n\u00e2ng cao n\u0103ng l\u1ef1c s\u1ed1 cho ng\u01b0\u1eddi h\u1ecdc." },
    { kind: "photo", title: "GS.TSKH Nguy\u1ec5n C\u1ea3nh To\u00e0n", desc: "Tr\u1ea3i nghi\u1ec7m tham gia \u0111\u1ed9i h\u00ecnh v\u00e0 h\u1ed7 tr\u1ee3 c\u1ed9ng \u0111\u1ed3ng." }
  ];
  const wallX = -ROOM_W / 2 + WALL_T / 2 + .2;
  const sideZ = RING_OUT + ROOM_D / 2;
  const colStep = 5.6;
  const startZ = sideZ - colStep * 2;
  const startY = CEIL_H - 8.0;
  const frameW = 1.85 * G3_SX;
  const frameH = 1.35 * G3_SY;

  items.forEach((item, i) => {
    const col = i;
    createBluePhotoInsetPanel(parent, {
      x: wallX,
      z: startZ + col * colStep,
      w: frameW,
      h: frameH,
      centerY: startY,
      rotationY: Math.PI / 2,
      item, enableAudio: true, photoSet: "leaders", photoIndex: i
    });
  });
}
// Một thẻ chuyên gia hoàn chỉnh: khung ảnh bo góc + bảng tên tách rời + icon loa tương tác.
/* ==========================================================================================
   4.c "CÂY Ý TƯỞNG" (Góc 3) — đúng "Hồ sơ thiết kế chi tiết Phòng Góc 3": thân cây tường
   cuối + màn hình inset, cành/nụ sáng dọc mép trên 2 tường bên (bấm nụ để "nở" + xem dự án),
   bệ mô hình 3D xoay tường phải, bảng ghim ý tưởng mở tường trái.
   ========================================================================================== */
const spinningTurntables = []; // {mesh, speed} — cập nhật xoay mỗi khung hình

function makeBarkTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 512;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, c.width, 0);
  grad.addColorStop(0, "#3d2e1c"); grad.addColorStop(.5, "#6b4f30"); grad.addColorStop(1, "#3d2e1c");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
  // noise xù xì
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * .18})`;
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2 + Math.random() * 4);
  }
  // vệt vỏ cây dọc + khe sáng vàng đồng
  for (let i = 0; i < 10; i++) {
    const x = (i / 10) * c.width + Math.sin(i) * 10;
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 3 + Math.random() * 3;
    ctx.beginPath(); ctx.moveTo(x, 0);
    for (let y = 0; y <= c.height; y += 24) ctx.lineTo(x + Math.sin(y * .05 + i) * 9, y);
    ctx.stroke();
    if (i % 3 === 0) {
      ctx.strokeStyle = "rgba(214,184,111,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + 3, 0);
      for (let y = 0; y <= c.height; y += 24) ctx.lineTo(x + 3 + Math.sin(y * .05 + i) * 9, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeWoodGrainTexture() {
  const c = document.createElement("canvas");
  c.width = 300; c.height = 500;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, c.width, 0);
  grad.addColorStop(0, "#6a4e30"); grad.addColorStop(.5, "#7a5c3a"); grad.addColorStop(1, "#6a4e30");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const x = (i / 14) * c.width + Math.sin(i) * 8;
    ctx.beginPath(); ctx.moveTo(x, 0);
    for (let y = 0; y <= c.height; y += 20) ctx.lineTo(x + Math.sin(y * .03 + i) * 6, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeStickyNoteTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#eef2f6"; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(0,0,0,.05)";
  for (let i = 0; i <= 512; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke(); }
  const colors = ["#fdeaa7", "#f7c8d0", "#c7e6f0", "#d8f2c7", "#f0d9f7", "#fde0b0"];
  for (let i = 0; i < 9; i++) {
    const cx = 55 + (i % 3) * 168, cy = 60 + Math.floor(i / 3) * 168;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.sin(i * 7.3) ) * .18);
    ctx.fillStyle = colors[i % colors.length];
    ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    ctx.fillRect(-58, -48, 116, 96);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ═══════════════════════════════════════════════════════════════════════════
// CÂY Ý TƯỞNG — hoạ tiết 2D bảo tàng, phủ cả 3 mặt tường góc phòng
// Phương án: 3 mảng phẳng (tường cuối + 2 tường bên) + 9 khung lá dự án
// ═══════════════════════════════════════════════════════════════════════════

// ── Tiện ích vẽ đường cong bezier bậc 2 với độ rộng và màu thay đổi ───────
function strokeQBez(ctx, p0, ctrl, p1, N, wFn, colorFn) {
  ctx.lineCap = "round";
  let px = p0[0], py = p0[1];
  for (let i = 1; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * ctrl[0] + t * t * p1[0];
    const y = u * u * p0[1] + 2 * u * t * ctrl[1] + t * t * p1[1];
    ctx.lineWidth = Math.max(0.5, typeof wFn === "function" ? wFn(t) : wFn);
    ctx.strokeStyle = typeof colorFn === "function" ? colorFn(t) : colorFn;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    px = x; py = y;
  }
}

// Lấy toạ độ 1 điểm trên đường bezier bậc 2
function qPt(p0, ctrl, p1, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * ctrl[0] + t * t * p1[0],
          u * u * p0[1] + 2 * u * t * ctrl[1] + t * t * p1[1]];
}

// 3-lớp vỏ cây: viền tối, thân nâu, vệt sáng trung tâm, mạch vàng đồng
function drawBark(ctx, p0, ctrl, p1, w0, w1, alpha) {
  const a = alpha ?? 1, N = 30;
  strokeQBez(ctx, p0, ctrl, p1, N, t => (w0 + (w1 - w0) * t) * 1.35, `rgba(14,7,2,${a * 0.68})`);
  strokeQBez(ctx, p0, ctrl, p1, N, t =>  w0 + (w1 - w0) * t,          `rgba(70,52,32,${a})`);
  strokeQBez(ctx, p0, ctrl, p1, N, t => (w0 + (w1 - w0) * t) * 0.28,  `rgba(115,78,42,${a * 0.52})`);
  strokeQBez(ctx, p0, ctrl, p1, N, t => Math.max(0.7, (w0 + (w1 - w0) * t) * 0.065),
             `rgba(214,184,111,${a * 0.84})`);
}

// Cụm lá trang trí nhỏ (không tương tác) quanh 1 điểm
function scatterLeaves(ctx, cx, cy, r, n) {
  const pal = ["rgba(38,76,28,0.70)", "rgba(25,60,20,0.58)", "rgba(58,105,44,0.64)", "rgba(74,122,56,0.50)"];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + Math.random() * 1.1;
    const d   = r * (0.22 + Math.random() * 0.78);
    const lx  = cx + Math.cos(ang) * d, ly = cy + Math.sin(ang) * d * 0.6;
    const lw  = r * (0.46 + Math.random() * 0.30), lh = lw * (1.5 + Math.random() * 0.55);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang * 0.32 + (Math.random() - 0.5) * 0.45);
    ctx.fillStyle = pal[Math.floor(Math.random() * 4)];
    ctx.beginPath(); ctx.ellipse(0, 0, lw / 2, lh / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(214,184,111,0.14)"; ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.moveTo(0, -lh / 2); ctx.lineTo(0, lh / 2); ctx.stroke();
    ctx.restore();
  }
}

// ── Texture tranh tường cuối (toàn bộ chiều rộng × chiều cao phòng) ───────
function makeBackWallTreeTexture(treeW, treeH) {
  const PX = 80;
  const W = Math.min(2048, Math.round(treeW * PX));
  const H = Math.min(2048, Math.round(treeH * PX));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const cx = W * .50;
  const groundY = H * .935;
  const trunkTopY = H * .625;
  const canopySpreadLeft = .98;
  const canopySpreadRight = .98;
  const canopyDensityCenter = 1.08;
  const canopyDensityTransition = .92;
  const bark = {
    dark: "rgba(49,31,17,.92)",
    mid: "rgba(104,67,35,.96)",
    light: "rgba(154,101,54,.38)",
    vein: "rgba(212,151,78,.24)"
  };
  const leafPal = [
    "rgba(28,76,35,.78)", "rgba(42,96,43,.72)", "rgba(61,118,55,.68)",
    "rgba(82,136,63,.62)", "rgba(107,148,69,.52)"
  ];

  const bez = (p0, c0, p1, t) => qPt(p0, c0, p1, t);
  const drawTaper = (p0, c0, p1, w0, w1, alpha = 1, grain = 1) => {
    const barkBase = `rgba(93,62,36,${alpha * .92})`;
    const barkShadow = `rgba(45,28,15,${alpha * .34})`;
    const barkWarm = `rgba(137,88,48,${alpha * .34})`;
    const barkLight = `rgba(188,132,76,${alpha * .22})`;
    strokeQBez(ctx, p0, c0, p1, 42, t => (w0 + (w1 - w0) * t) * 1.10, barkShadow);
    strokeQBez(ctx, p0, c0, p1, 42, t => w0 + (w1 - w0) * t, barkBase);
    strokeQBez(ctx, p0, c0, p1, 42, t => (w0 + (w1 - w0) * t) * .54, barkWarm);
    const fiberCount = Math.max(5, Math.round(9 * grain));
    for (let f = 0; f < fiberCount; f++) {
      const offset = (f - (fiberCount - 1) / 2) / fiberCount;
      const phase = f * 1.73 + p0[0] * .003;
      let prev = null;
      ctx.beginPath();
      for (let s = 0; s <= 26; s++) {
        const t = s / 26;
        const p = bez(p0, c0, p1, t);
        const dx = 2 * (1 - t) * (c0[0] - p0[0]) + 2 * t * (p1[0] - c0[0]);
        const dy = 2 * (1 - t) * (c0[1] - p0[1]) + 2 * t * (p1[1] - c0[1]);
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const width = w0 + (w1 - w0) * t;
        const wobble = Math.sin(t * Math.PI * 5.4 + phase) * width * .035 + Math.sin(t * Math.PI * 13 + phase) * width * .015;
        const x = p[0] + nx * (offset * width * .58 + wobble);
        const y = p[1] + ny * (offset * width * .58 + wobble * .35);
        if (!prev) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        prev = [x, y];
      }
      ctx.strokeStyle = f % 3 === 0 ? barkLight : (f % 3 === 1 ? "rgba(58,35,17,.30)" : "rgba(119,77,40,.26)");
      ctx.lineWidth = Math.max(.55, (w0 + w1) * (.010 + (f % 3) * .004));
      ctx.stroke();
    }
  };
  const drawLeaf = (x, y, rw, rh, rot, color, alpha = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -rh / 2);
    ctx.quadraticCurveTo(rw * .52, -rh * .18, 0, rh / 2);
    ctx.quadraticCurveTo(-rw * .52, -rh * .18, 0, -rh / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(230,208,137,.16)";
    ctx.lineWidth = Math.max(.45, rw * .03);
    ctx.beginPath();
    ctx.moveTo(0, -rh * .36);
    ctx.lineTo(0, rh * .36);
    ctx.stroke();
    ctx.restore();
  };
  const cluster = (x, y, rx, ry, count, seed, alpha = .72) => {
    for (let i = 0; i < count; i++) {
      const a = (i * 2.399963 + seed * .71) % (Math.PI * 2);
      const ring = .12 + ((i * 37 + seed * 19) % 100) / 115;
      const wobbleX = Math.sin(i * 11.17 + seed) * rx * .10;
      const wobbleY = Math.cos(i * 7.31 + seed * .5) * ry * .10;
      const lx = x + Math.cos(a) * rx * ring + wobbleX;
      const ly = y + Math.sin(a) * ry * ring + wobbleY;
      const scale = .68 + ((i * 23 + seed * 13) % 100) / 130;
      const lw = W * (.0125 + .006 * scale);
      const lh = lw * (1.55 + .38 * Math.sin(i + seed));
      drawLeaf(lx, ly, lw, lh, a * .38 + Math.sin(i + seed) * .42, leafPal[(i + seed) % leafPal.length], alpha);
    }
  };

  // Back foliage first, so branches remain visible in places.
  const canopyClusters = [
    [.055,.455,.058,.082,34], [.115,.500,.072,.092,44], [.175,.465,.085,.095,52],
    [.255,.335,.100,.118,64], [.365,.250,.116,.132,70], [.500,.205,.142,.150,84],
    [.635,.260,.116,.132,70], [.755,.350,.100,.118,64], [.835,.475,.080,.096,50],
    [.900,.520,.066,.088,40], [.955,.465,.052,.078,30], [.235,.575,.106,.100,62],
    [.365,.505,.125,.110,72], [.505,.485,.138,.116,88], [.645,.515,.125,.110,72],
    [.770,.590,.096,.092,54], [.315,.675,.092,.074,42], [.455,.645,.110,.082,54],
    [.590,.675,.098,.078,48], [.705,.705,.078,.066,38]
  ];
  canopyClusters.forEach((d, i) => cluster(W * d[0], H * d[1], W * d[2], H * d[3], Math.round(d[4] * (d[0] > .18 && d[0] < .82 ? canopyDensityCenter : canopyDensityTransition)), i + 5, .62));

  // One continuous old-root/trunk silhouette. This avoids oval lobes or separate pedestal pieces.
  const trunkShape = new Path2D();
  trunkShape.moveTo(cx - W * .205, groundY);
  trunkShape.bezierCurveTo(cx - W * .185, H * .865, cx - W * .150, H * .790, cx - W * .120, H * .735);
  trunkShape.bezierCurveTo(cx - W * .100, H * .700, cx - W * .090, H * .662, cx - W * .070, trunkTopY);
  trunkShape.bezierCurveTo(cx - W * .030, H * .642, cx + W * .005, H * .635, cx + W * .040, H * .618);
  trunkShape.bezierCurveTo(cx + W * .075, H * .675, cx + W * .122, H * .755, cx + W * .185, groundY);
  trunkShape.bezierCurveTo(cx + W * .095, groundY - H * .006, cx + W * .040, groundY - H * .022, cx, groundY - H * .014);
  trunkShape.bezierCurveTo(cx - W * .065, groundY + H * .004, cx - W * .130, groundY - H * .004, cx - W * .205, groundY);
  const trunkGrad = ctx.createLinearGradient(cx - W * .20, trunkTopY, cx + W * .22, groundY);
  trunkGrad.addColorStop(0, "rgba(128,83,45,.96)");
  trunkGrad.addColorStop(.34, "rgba(91,59,33,.98)");
  trunkGrad.addColorStop(.62, "rgba(111,72,39,.96)");
  trunkGrad.addColorStop(1, "rgba(69,43,23,.96)");
  ctx.fillStyle = trunkGrad;
  ctx.fill(trunkShape);
  ctx.save();
  ctx.clip(trunkShape);
  for (let i = 0; i < 95; i++) {
    const side = Math.sin(i * 2.17);
    const x0 = cx + side * W * (.055 + (i % 7) * .017) + Math.sin(i * 5.41) * W * .014;
    const y0 = groundY - H * (.025 + (i % 9) * .018);
    const y1 = trunkTopY + H * (.004 + (i % 6) * .018);
    const ctrlX = x0 + Math.sin(i * 1.31) * W * .035;
    const tone = i % 5;
    ctx.strokeStyle = tone === 0 ? "rgba(42,25,12,.34)" : tone === 1 ? "rgba(190,132,74,.18)" : tone === 2 ? "rgba(86,52,26,.30)" : "rgba(135,88,46,.22)";
    ctx.lineWidth = Math.max(.7, W * (.0012 + (i % 4) * .00075));
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(ctrlX, (y0 + y1) * .56, ctrlX - Math.sin(i) * W * .025, (y0 + y1) * .82, x0 + Math.cos(i * .7) * W * .018, y1);
    ctx.stroke();
  }
  for (let i = 0; i < 34; i++) {
    const x = cx + Math.sin(i * 1.91) * W * (.045 + (i % 4) * .026);
    const y = H * (.66 + (i % 11) * .022);
    ctx.fillStyle = i % 2 ? "rgba(38,23,12,.24)" : "rgba(184,126,69,.15)";
    ctx.beginPath();
    ctx.ellipse(x, y, W * (.006 + (i % 3) * .003), H * (.018 + (i % 4) * .006), Math.sin(i) * .5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Buttress roots: straighter, broad near trunk, tapering outward along the floor line.
  const rootDefs = [
    [-.160, -.390, -.055, .052, .042, .008],
    [-.112, -.270, -.038, .036, .035, .007],
    [-.052, -.145, -.026, .020, .027, .006],
    [.030, .132, -.018, .018, .026, .006],
    [.092, .265, -.034, .034, .034, .007],
    [.150, .392, -.052, .054, .042, .008]
  ];
  rootDefs.forEach(([sx, ex, cyLift, eyLift, w0, w1], i) => {
    const p0 = [cx + W * sx, groundY - H * (.018 + Math.abs(sx) * .030)];
    const p1 = [cx + W * ex, groundY - H * eyLift];
    const c0 = [(p0[0] + p1[0]) / 2, groundY - H * (Math.abs(cyLift) + .018 + (i % 2) * .010)];
    drawTaper(p0, c0, p1, W * w0, W * w1, .92, 1.35);
    const rootVein = [p0[0] * .68 + p1[0] * .32, p0[1] * .74 + p1[1] * .26];
    strokeQBez(ctx, rootVein, [(rootVein[0] + p1[0]) / 2, rootVein[1] - H * .010], p1, 18, W * .0018, "rgba(218,160,95,.18)");
  });
  [
    [-.070,-.215,.020,.017], [-.025,-.115,.012,.013], [.052,.185,.018,.015], [.115,.315,.026,.019]
  ].forEach(([sx, ex, lift, w], i) => {
    const p0 = [cx + W * sx, groundY - H * .012];
    const p1 = [cx + W * ex, groundY - H * (.010 + lift)];
    drawTaper(p0, [(p0[0] + p1[0]) / 2, groundY - H * (.028 + lift * .3)], p1, W * w, W * .0045, .70, .9);
  });

  // Larger weathered cracks and raised bark seams, uneven like old banyan bark.
  [
    [-.085,.90,-.070,.76,-.050,.64,.0042], [-.038,.92,-.030,.78,-.010,.63,.0032],
    [.018,.91,.010,.78,.035,.62,.0038], [.068,.88,.082,.76,.060,.65,.0034],
    [-.130,.84,-.105,.76,-.090,.69,.0024], [.125,.84,.110,.75,.094,.69,.0026]
  ].forEach((g, i) => {
    const p0 = [cx + W * g[0], H * g[1]];
    const c0 = [cx + W * g[2], H * g[3]];
    const p1 = [cx + W * g[4], H * g[5]];
    strokeQBez(ctx, p0, c0, p1, 22, W * g[6], i % 2 ? "rgba(39,23,12,.36)" : "rgba(202,143,82,.20)");
  });

  // Main branch hierarchy. Starts at different heights, not from one fan point.
  const branches = [
    { s: [cx - W*.070, H*.700], c: [cx - W*.280, H*.605], e: [cx - W*.488, H*.478], w0: W*.045, w1: W*.010, side: -1 },
    { s: [cx - W*.045, H*.655], c: [cx - W*.200, H*.492], e: [cx - W*.410, H*.320], w0: W*.038, w1: W*.009, side: -1 },
    { s: [cx + W*.055, H*.675], c: [cx + W*.275, H*.570], e: [cx + W*.492, H*.458], w0: W*.046, w1: W*.010, side: 1 },
    { s: [cx + W*.035, H*.630], c: [cx + W*.185, H*.465], e: [cx + W*.410, H*.308], w0: W*.036, w1: W*.009, side: 1 },
    { s: [cx - W*.010, H*.620], c: [cx - W*.055, H*.445], e: [cx + W*.015, H*.175], w0: W*.034, w1: W*.008, side: -1 }
  ];
  const tips = [];
  branches.forEach((b, bi) => {
    drawTaper(b.s, b.c, b.e, b.w0, b.w1, .95);
    tips.push(b.e);
    const offSide = b.side;
    [.36, .58, .78].forEach((t, si) => {
      const p = bez(b.s, b.c, b.e, t);
      const flip = si === 1 ? -offSide * .55 : offSide;
      const p1 = [p[0] + flip * W * (.080 + si * .030), p[1] - H * (.045 + si * .018) + Math.sin(bi + si) * H * .018];
      const pc = [p[0] + flip * W * (.040 + si * .012), p[1] - H * (.035 + si * .012)];
      drawTaper(p, pc, p1, b.w1 * (.95 - si * .15), b.w1 * .22, .75);
      tips.push(p1);
      [0.46, .84].forEach(tt => {
        const q = bez(p, pc, p1, tt);
        const r = [q[0] + flip * W * .042, q[1] - H * (.026 + tt * .016)];
        drawTaper(q, [(q[0] + r[0]) / 2, q[1] - H * .016], r, b.w1 * .23, b.w1 * .055, .48);
        tips.push(r);
      });
    });
  });

  // Near-branch and foreground leaves, denser in the middle/top but not hiding main branches fully.
  canopyClusters.forEach((d, i) => cluster(W * d[0], H * d[1], W * d[2] * .74, H * d[3] * .68, Math.round(d[4] * .65), i + 80, .72));
  tips.forEach((p, i) => cluster(p[0], p[1], W * .042, H * .050, 18, i + 140, .66));
  canopyClusters.filter((_, i) => i % 3 !== 1).forEach((d, i) => cluster(W * d[0], H * d[1], W * d[2] * .48, H * d[3] * .42, 16, i + 210, .82));

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Texture tường bên — cành tán toả từ góc tường ────────────────────────
// side='left': cành vào từ cạnh PHẢI texture (góc tường cuối)
// side='right': cành vào từ cạnh TRÁI texture
function makeSideCanopyTexture(panelW, panelH, side) {
  const PX = 76;
  const W = Math.min(1280, Math.round(panelW * PX));
  const H = Math.min(2048, Math.round(panelH * PX));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const fromX = side === "left" ? W * .98 : W * .02;
  const toDir = side === "left" ? -1 : 1;
  const leafPal = ["rgba(29,76,35,.74)", "rgba(43,96,43,.70)", "rgba(62,118,55,.65)", "rgba(84,136,63,.58)", "rgba(111,148,70,.48)"];
  const drawLeaf = (x, y, rw, rh, rot, color, alpha = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -rh / 2);
    ctx.quadraticCurveTo(rw * .50, -rh * .18, 0, rh / 2);
    ctx.quadraticCurveTo(-rw * .50, -rh * .18, 0, -rh / 2);
    ctx.fill();
    ctx.restore();
  };
  const cluster = (x, y, rx, ry, count, seed, alpha = .68) => {
    for (let i = 0; i < count; i++) {
      const a = (i * 2.399963 + seed * .83) % (Math.PI * 2);
      const d = .14 + ((i * 41 + seed * 13) % 100) / 118;
      const lx = x + Math.cos(a) * rx * d + Math.sin(i * 9.7 + seed) * rx * .10;
      const ly = y + Math.sin(a) * ry * d + Math.cos(i * 6.4 + seed) * ry * .10;
      const s = .65 + ((i * 31 + seed * 17) % 100) / 125;
      const lw = W * (.018 + .006 * s);
      const lh = lw * (1.55 + .32 * Math.sin(i + seed));
      drawLeaf(lx, ly, lw, lh, a * .34 + Math.sin(i + seed) * .42, leafPal[(i + seed) % leafPal.length], alpha);
    }
  };
  const drawBranch = (p0, c0, p1, w0, w1, alpha = .82) => {
    strokeQBez(ctx, p0, c0, p1, 34, t => (w0 + (w1 - w0) * t) * 1.28, `rgba(42,25,12,${alpha * .50})`);
    strokeQBez(ctx, p0, c0, p1, 34, t => w0 + (w1 - w0) * t, `rgba(95,61,33,${alpha})`);
    strokeQBez(ctx, p0, c0, p1, 34, t => Math.max(.7, (w0 + (w1 - w0) * t) * .10), `rgba(176,115,58,${alpha * .26})`);
  };

  const branchDefs = [
    { y: .390, ext: .78, rise: -.125, w0: .038, w1: .009 },
    { y: .505, ext: .92, rise: -.045, w0: .032, w1: .007 },
    { y: .630, ext: .72, rise: .030,  w0: .026, w1: .006 }
  ];
  const tips = [];
  branchDefs.forEach((b, bi) => {
    const p0 = [fromX, H * b.y];
    const p1 = [fromX + toDir * W * b.ext, H * (b.y + b.rise)];
    const c0 = [fromX + toDir * W * b.ext * (.38 + bi * .05), H * (b.y - .075 + bi * .025)];
    drawBranch(p0, c0, p1, W * b.w0, W * b.w1, .82);
    tips.push(p1);
    [.42, .72].forEach((t, si) => {
      const p = qPt(p0, c0, p1, t);
      const p2 = [p[0] + toDir * W * (.13 + si * .08), p[1] - H * (.060 - si * .018)];
      drawBranch(p, [p[0] + toDir * W * .075, p[1] - H * .045], p2, W * b.w1 * .85, W * b.w1 * .22, .62);
      tips.push(p2);
    });
  });

  const baseClusters = [
    [.18,.280,.145,.115,60], [.34,.230,.155,.125,68], [.53,.280,.150,.118,64], [.72,.380,.130,.110,52],
    [.22,.500,.150,.115,64], [.43,.470,.170,.125,78], [.64,.525,.150,.110,62], [.80,.640,.112,.090,44],
    [.32,.665,.130,.085,46], [.56,.675,.135,.088,52]
  ];
  baseClusters.forEach((d, i) => {
    const x = side === "left" ? W * (1 - d[0]) : W * d[0];
    cluster(x, H * d[1], W * d[2], H * d[3], d[4], i + (side === "left" ? 40 : 80), .62);
  });
  tips.forEach((p, i) => cluster(p[0], p[1], W * .070, H * .060, 18, i + 150, .70));
  baseClusters.filter((_, i) => i % 2 === 0).forEach((d, i) => {
    const x = side === "left" ? W * (1 - d[0]) : W * d[0];
    cluster(x, H * d[1], W * d[2] * .52, H * d[3] * .46, 18, i + 210, .82);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Hình dạng chiếc lá (giọt nước cách điệu) ─────────────────────────────
function makeLeafShape(w, h) {
  const shape = new THREE.Shape();
  const hw = w / 2, hh = h / 2;
  shape.moveTo(0, -hh);
  shape.quadraticCurveTo(hw, -hh * 0.28, 0, hh);
  shape.quadraticCurveTo(-hw, -hh * 0.28, 0, -hh);
  return shape;
}

// Khung ?nh h?nh l� g?n s�t t�?ng; m?i khung c� cu?ng ng?n �? b�m v�o h? c�nh n?n.
function createLeafFrame(parent, opts) {
  const { position, w, h, project, rotationY = Math.PI, tilt = 0 } = opts;
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  group.rotation.z = tilt;
  parent.add(group);

  const stemLen = Math.max(.22, h * .24);
  const leafStem = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(.045, w * .035), stemLen, .055),
    new THREE.MeshStandardMaterial({ color: 0x6f4b25, roughness: .78, side: THREE.DoubleSide })
  );
  leafStem.position.set(0, -h / 2 - stemLen / 2 + .04, -0.035);
  group.add(leafStem);

  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xc9a96a, emissive: 0xc9a96a, emissiveIntensity: 0.36,
    roughness: 0.28, side: THREE.DoubleSide
  });
  const outerGlow = new THREE.Mesh(new THREE.ShapeGeometry(makeLeafShape(w + 0.11, h + 0.13), 32), glowMat);
  outerGlow.position.z = -0.028;
  group.add(outerGlow);

  const wallToneMat = new THREE.MeshStandardMaterial({ color: 0xf1e6cf, roughness: 0.88, emissive: WALL_EMISSIVE, emissiveIntensity: .12, side: THREE.DoubleSide });
  const wallToneRing = new THREE.Mesh(new THREE.ShapeGeometry(makeLeafShape(w + 0.045, h + 0.055), 32), wallToneMat);
  wallToneRing.position.z = -0.014;
  group.add(wallToneRing);

  const bundle = getPlaceholderTexture({ kind: "photo", title: project.title }, "#d6b86f");
  const innerMat = new THREE.MeshStandardMaterial({ map: bundle.texture, roughness: 0.52, side: THREE.DoubleSide });
  const innerMesh = new THREE.Mesh(new THREE.ShapeGeometry(makeLeafShape(w, h), 32), innerMat);
  const artId = registerArtifact({
    title: project.title, description: project.desc,
    group: "Vuon uom y tuong", image: bundle.dataUrl
  });
  innerMesh.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(innerMesh);
  group.add(innerMesh);

  if (SHOW_FRAME_NAMEPLATES) {
    addTextPanel(project.title, [0, h / 2 + 0.30, 0.012], [w + 0.46, 0.36], 0, {
      size: 19, color: "#172032", background: "#f4f7f9",
      border: true, accent: "#d6b86f", weight: 900,
      wrap: true, width: 1020, height: 290, maxWidth: 860, lineHeight: 27
    }, group);
  }

  return group;
}

// Legacy procedural idea tree retained for reference only.
// Goc 3 now uses the GLB/anchor runtime in scripts/idea-tree/idea-tree-runtime.js.
function createIdeaTree(roomGroup) {
  const wallPad = WALL_T / 2 + 0.025;
  const wallZ = R_BACK - wallPad;
  const muralW = ROOM_W - .45;
  const muralH = CEIL_H * .82;
  const muralCenterY = CEIL_H * .48;
  const frameZ = wallZ - .24;
  const muralMatOpts = { transparent: true, roughness: .86, depthWrite: false, side: THREE.DoubleSide };

  const backTex = makeBackWallTreeTexture(muralW, muralH);
  const backMural = new THREE.Mesh(
    new THREE.PlaneGeometry(muralW, muralH),
    new THREE.MeshStandardMaterial({ map: backTex, ...muralMatOpts })
  );
  backMural.position.set(0, muralCenterY, wallZ);
  backMural.rotation.y = Math.PI;
  roomGroup.add(backMural);
  const canopySpreadLeft = Math.min(14.4, ROOM_D * .42);
  const canopySpreadRight = Math.min(14.4, ROOM_D * .42);
  const sideExt = Math.max(canopySpreadLeft, canopySpreadRight);
  const sideMuralH = muralH * .86;
  const sideCenterY = muralCenterY + muralH * .05;
  const sideXL = -ROOM_W / 2 + wallPad;
  const sideXR = ROOM_W / 2 - wallPad;
  const leftTex = makeSideCanopyTexture(sideExt, sideMuralH, "left");
  const leftMural = new THREE.Mesh(
    new THREE.PlaneGeometry(sideExt, sideMuralH),
    new THREE.MeshStandardMaterial({ map: leftTex, ...muralMatOpts })
  );
  leftMural.position.set(sideXL, sideCenterY, wallZ - sideExt / 2);
  leftMural.rotation.y = -Math.PI / 2;
  roomGroup.add(leftMural);

  const rightTex = makeSideCanopyTexture(sideExt, sideMuralH, "right");
  const rightMural = new THREE.Mesh(
    new THREE.PlaneGeometry(sideExt, sideMuralH),
    new THREE.MeshStandardMaterial({ map: rightTex, ...muralMatOpts })
  );
  rightMural.position.set(sideXR, sideCenterY, wallZ - sideExt / 2);
  rightMural.rotation.y = Math.PI / 2;
  roomGroup.add(rightMural);

  const titleText = "C\u00C2Y \u00DD T\u01AF\u1EDENG - V\u01AF\u1EDCN \u01AF\u01A0M \u00DD T\u01AF\u1EDENG";
  addTextPanel(titleText, [0, CEIL_H - 2.25, frameZ], [ROOM_W * .54, .48], Math.PI, {
    size: 22, color: "#7a5733", background: "transparent", weight: 900,
    wrap: true, width: 1400, height: 180, maxWidth: 1280, lineHeight: 30,
    strokeColor: "rgba(255,255,255,.72)", strokeWidth: 5
  }, roomGroup);

  const seedlingText = "M\u1ED7i \u00FD t\u01B0\u1EDFng l\u00E0 m\u1ED9t chi\u1EBFc l\u00E1 - \u01B0\u01A1m m\u1EA7m h\u00F4m nay, xanh t\u01B0\u01A1i ng\u00E0y mai.";
  addTextPanel(seedlingText, [0, 1.08, frameZ], [ROOM_W * .48, .34], Math.PI, {
    size: 15, color: "#5a6f3c", background: "rgba(255,250,238,.78)", border: true,
    borderWidth: 4, accent: "#d6b86f", weight: 800,
    wrap: true, width: 1200, height: 150, maxWidth: 1060, lineHeight: 22,
    depthWrite: false, depthTest: true
  }, roomGroup);

  const ideaProjects = [
    ["L\u1EDBp h\u1ECDc xanh", "Thi\u1EBFt k\u1EBF h\u1ECDc li\u1EC7u v\u00E0 ho\u1EA1t \u0111\u1ED9ng gi\u00E1o d\u1EE5c v\u1EC1 m\u00F4i tr\u01B0\u1EDDng."],
    ["AI tr\u1EE3 gi\u1EA3ng", "C\u00F4ng c\u1EE5 h\u1ED7 tr\u1EE3 gi\u00E1o vi\u00EAn so\u1EA1n \u0111\u1EC1 v\u00E0 ph\u1EA3n h\u1ED3i h\u1ECDc t\u1EADp."],
    ["B\u1EA3n \u0111\u1ED3 tri th\u1EE9c", "N\u1EC1n t\u1EA3ng chia s\u1EBB t\u00E0i nguy\u00EAn theo ch\u1EE7 \u0111\u1EC1 cho sinh vi\u00EAn."],
    ["S\u1ED5 tay s\u1ED1", "\u1EE8ng d\u1EE5ng ghi ch\u00E9p v\u00E0 theo d\u00F5i r\u00E8n luy\u1EC7n nghi\u1EC7p v\u1EE5 s\u01B0 ph\u1EA1m."],
    ["Gi\u1EDD h\u1ECDc m\u1EDF", "M\u00F4 h\u00ECnh l\u1EDBp h\u1ECDc k\u1EBFt n\u1ED1i chuy\u00EAn gia, sinh vi\u00EAn v\u00E0 h\u1ECDc sinh."],
    ["T\u1EE7 s\u00E1ch chia s\u1EBB", "Kh\u00F4ng gian trao \u0111\u1ED5i h\u1ECDc li\u1EC7u m\u1EDF v\u00E0 c\u00E2u chuy\u1EC7n \u0111\u1ECDc."],
    ["Tr\u1EA1m th\u1EF1c h\u00E0nh", "B\u1ED9 kit m\u00F4 ph\u1ECFng th\u00ED nghi\u1EC7m nh\u1ECF cho d\u1EA1y h\u1ECDc t\u00EDch c\u1EF1c."],
    ["L\u1EDBp h\u1ECDc bao dung", "S\u00E1ng ki\u1EBFn h\u1ED7 tr\u1EE3 h\u1ECDc sinh c\u00F3 nhu c\u1EA7u h\u1ECDc t\u1EADp kh\u00E1c nhau."],
    ["Podcast gi\u00E1o d\u1EE5c", "K\u00EAnh \u00E2m thanh lan t\u1ECFa kinh nghi\u1EC7m ngh\u1EC1 nghi\u1EC7p v\u00E0 \u00FD t\u01B0\u1EDFng m\u1EDBi."],
    ["D\u1EF1 \u00E1n STEM", "Chu\u1ED7i th\u1EED th\u00E1ch thi\u1EBFt k\u1EBF s\u1EA3n ph\u1EA9m d\u00E0nh cho h\u1ECDc sinh ph\u1ED5 th\u00F4ng."],
    ["C\u1ED9ng \u0111\u1ED3ng mentor", "M\u1EA1ng l\u01B0\u1EDBi c\u1EF1u sinh vi\u00EAn \u0111\u1ED3ng h\u00E0nh c\u00F9ng nh\u00F3m \u00FD t\u01B0\u1EDFng."],
    ["H\u1ECDc li\u1EC7u m\u1EDF", "Kho t\u01B0 li\u1EC7u c\u00F3 th\u1EC3 t\u00E1i s\u1EED d\u1EE5ng v\u00E0 b\u1ED5 sung theo th\u1EDDi gian."],
    ["Ch\u1ED3i non 01", "V\u1ECB tr\u00ED m\u1EDF d\u00E0nh cho \u00FD t\u01B0\u1EDFng ti\u1EC1m n\u0103ng m\u1EDBi."],
    ["Ch\u1ED3i non 02", "Khung d\u1EF1 ph\u00F2ng \u0111\u1EC3 thay \u0111\u1ED5i, b\u1ED5 sung n\u1ED9i dung sau."],
    ["H\u1EA1t gi\u1ED1ng \u00FD t\u01B0\u1EDFng", "M\u1ED9t \u00FD t\u01B0\u1EDFng nh\u1ECF c\u00F3 th\u1EC3 ph\u00E1t tri\u1EC3n th\u00E0nh d\u1EF1 \u00E1n."],
  ].map(([title, desc]) => ({ kind: "photo", title, desc }));

  const leafSlots = [
    { x: -12.2, y: 11.25, s: 1.05, r: -0.15 },
    { x: -7.9,  y: 12.75, s: .88, r:  0.11 },
    { x: -2.4,  y: 12.10, s: 1.12, r: -0.05 },
    { x:  4.2,  y: 12.95, s: .90, r:  0.16 },
    { x: 10.8,  y: 11.35, s: 1.02, r: -0.12 },
    { x: -14.0, y: 8.65,  s: .78, r:  0.14 },
    { x: -9.5,  y: 9.75,  s: .92, r: -0.09 },
    { x: -4.6,  y: 9.10,  s: .74, r:  0.19 },
    { x:  1.5,  y: 10.10, s: .96, r: -0.13 },
    { x:  7.4,  y: 9.35,  s: .80, r:  0.08 },
    { x: 13.2,  y: 8.35,  s: .84, r: -0.18 },
    { x: -11.2, y: 6.85,  s: .66, r: -0.08 },
    { x: -5.8,  y: 7.45,  s: .72, r:  0.12 },
    { x:  4.9,  y: 7.00,  s: .70, r: -0.11 },
    { x: 10.5,  y: 6.55,  s: .64, r:  0.15 },
  ];

  const baseLeafW = .72 * G3_SX;
  const baseLeafH = .60 * G3_SY;
  leafSlots.slice(0, 11).forEach((slot, i) => {
    createLeafFrame(roomGroup, {
      position: [slot.x, slot.y, frameZ - i * .006],
      w: baseLeafW * slot.s,
      h: baseLeafH * slot.s,
      project: ideaProjects[i],
      rotationY: Math.PI,
      tilt: slot.r
    });
  });

  const sideLeafSlots = [
    { side: -1, z: wallZ - 2.15, y: 11.2, s: .72, r: -0.12, i: 11 },
    { side: -1, z: wallZ - 5.05, y: 8.85, s: .62, r:  0.10, i: 12 },
    { side:  1, z: wallZ - 2.65, y: 10.8, s: .70, r:  0.13, i: 13 },
    { side:  1, z: wallZ - 5.70, y: 8.55, s: .60, r: -0.09, i: 14 }
  ];
  sideLeafSlots.forEach((slot, si) => {
    createLeafFrame(roomGroup, {
      position: [slot.side < 0 ? sideXL + .055 : sideXR - .055, slot.y, slot.z],
      w: baseLeafW * slot.s,
      h: baseLeafH * slot.s,
      project: ideaProjects[slot.i],
      rotationY: slot.side < 0 ? -Math.PI / 2 : Math.PI / 2,
      tilt: slot.r
    });
  });
}

function attachExclusiveFrameAudio(mesh, artifactId, audioSrc = TV_VIDEO_SRC) {
  const audio = new Audio(audioSrc);
  audio.preload = "metadata";
  const idleTexture = makeSpeakerIconTexture("idle");
  const playingTexture = makeSpeakerIconTexture("playing");
  const iconMaterial = new THREE.MeshBasicMaterial({ map: idleTexture, transparent: true, depthTest: true });
  const icon = new THREE.Mesh(new THREE.CircleGeometry(.18, 40), iconMaterial);
  const frameWidth = mesh.geometry?.parameters?.width || 1;
  const frameHeight = mesh.geometry?.parameters?.height || 1;
  icon.position.set(frameWidth / 2 - .23, -frameHeight / 2 + .23, .04);
  icon.renderOrder = 35;
  mesh.add(icon);
  const setIconState = playing => {
    iconMaterial.map = playing ? playingTexture : idleTexture;
    iconMaterial.needsUpdate = true;
    requestRender();
  };
  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    setIconState(false);
    if (currentPlayingFrameAudio === stop) currentPlayingFrameAudio = null;
  };
  const toggle = () => {
    if (currentPlayingFrameAudio === stop) { stop(); return; }
    if (currentPlayingFrameAudio) currentPlayingFrameAudio();
    audio.currentTime = 0;
    audio.play().then(() => {
      currentPlayingFrameAudio = stop;
      setIconState(true);
    }).catch(() => setIconState(false));
  };
  audio.addEventListener("ended", stop);
  mesh.userData = { kind: "frameAudio", id: artifactId, toggle };
  icon.userData = { kind: "frameAudio", toggle };
  registerInteractiveObject(icon);
}

function createBluePhotoInsetPanel(group, opts) {
  const { x, z, w, h, centerY, rotationY, item, enableAudio = false, photoSet = "activity", photoIndex } = opts
  const wallGroup = new THREE.Group();
  wallGroup.position.set(x, centerY, z);
  wallGroup.rotation.y = rotationY;
  group.add(wallGroup);

  const wallMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .3, metalness: .55 });
  const pictureFrameMat = new THREE.MeshStandardMaterial({ color: 0xcdbb86, roughness: .36, metalness: .42 });

  const backing = new THREE.Mesh(new THREE.BoxGeometry(w, h, .14), wallMat);
  wallGroup.add(backing);

  [
    [w + .18, .07, 0, h / 2 + .035],
    [w + .18, .07, 0, -h / 2 - .035],
    [.07, h + .18, -w / 2 - .035, 0],
    [.07, h + .18, w / 2 + .035, 0]
  ].forEach(v => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], .18), trimMat);
    trim.position.set(v[2], v[3], .08);
    wallGroup.add(trim);
  });

  const photoW = w * .66, photoH = h * .48;
  const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(photoW + .42, photoH + .42, .16), pictureFrameMat);
  outerFrame.position.set(0, .18, .16);
  wallGroup.add(outerFrame);

  const matBoard = new THREE.Mesh(
    new THREE.BoxGeometry(photoW + .16, photoH + .16, .08),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  matBoard.position.set(0, .18, .24);
  wallGroup.add(matBoard);

  [
    [photoW + .24, .07, 0, photoH / 2 + .12],
    [photoW + .24, .07, 0, -photoH / 2 - .12],
    [.07, photoH + .24, -photoW / 2 - .12, 0],
    [.07, photoH + .24, photoW / 2 + .12, 0]
  ].forEach(v => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], .11), pictureFrameMat);
    rail.position.set(v[2], v[3] + .18, .32);
    wallGroup.add(rail);
  });

  const bundle = photoSet === "leaders" ? getLeadershipFramePhoto(photoIndex ?? 0) : getEventFramePhoto(photoIndex ?? nextEventFramePhotoIndex++);
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(photoW, photoH),
    new THREE.MeshStandardMaterial({ map: bundle.texture, roughness: .62, side: THREE.DoubleSide })
  );
  photo.position.set(0, .18, .4);
  const artId = registerArtifact({
    title: item.title, description: item.desc, group: "Goc y tuong mo", image: bundle.dataUrl
  });
  if (enableAudio) attachExclusiveFrameAudio(photo, artId);
  else photo.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(photo);
  wallGroup.add(photo);

  createFlatPhotoCaption(
    wallGroup,
    item.title,
    [0, .18 - photoH / 2 - .58, .42],
    [photoW + .62, .42]
  );

}

function createOpenPinboardV2(group, opts) {
  const { x, z, w, h, centerY, rotationY } = opts;
  const boardGroup = new THREE.Group();
  boardGroup.position.set(x, centerY, z);
  boardGroup.rotation.y = rotationY;
  group.add(boardGroup);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x6f8293, roughness: .45, metalness: .5 });
  boardGroup.add(new THREE.Mesh(new THREE.BoxGeometry(w + .1, h + .1, .06), frameMat));
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: makeStickyNoteTexture(), roughness: .85 }));
  board.position.z = .035;
  boardGroup.add(board);
  if (SHOW_FRAME_NAMEPLATES) {
    addTextPanel("Góc ý tưởng mở — sinh viên góp ý tưởng khởi nghiệp mới", [0, -h / 2 - .28, .04], [w, .3], 0, {
    size: 15, color: "#5b6b78", background: "transparent"
  }, boardGroup);
  }

  // Kệ gỗ nhỏ gắn dưới panel + chậu cây + ống bút (trang trí, không tương tác).
  const shelfDepth = .2 * G3_SX, shelfY = -h / 2 - .12, shelfZ = shelfDepth / 2 + .02;
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, .06, shelfDepth), new THREE.MeshStandardMaterial({ map: makeWoodGrainTexture(), color: 0x8a6a3d, roughness: .7 }));
  shelf.position.set(0, shelfY, shelfZ);
  boardGroup.add(shelf);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.09 * G3_SX, .07 * G3_SX, .14 * G3_SX, 12), new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: .8 }));
  pot.position.set(-w * .28, shelfY + .03 + .07 * G3_SX, shelfZ);
  boardGroup.add(pot);
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(.11 * G3_SX, 0), new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: .8, flatShading: true }));
  plant.position.set(-w * .28, shelfY + .03 + .14 * G3_SX + .08 * G3_SX, shelfZ);
  boardGroup.add(plant);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.06 * G3_SX, .06 * G3_SX, .16 * G3_SX, 10), new THREE.MeshStandardMaterial({ color: 0x6f8293, roughness: .5, metalness: .4 }));
  cup.position.set(w * .22, shelfY + .03 + .08 * G3_SX, shelfZ);
  boardGroup.add(cup);

}

function createExpertCard(parent, opts) {
  const { x, z, rotationY, name, role, frameW, frameH, gap, plateW, plateH, iconSize, accent, audioSrc } = opts;
  const centerY = opts.centerY ?? (1 * G1_SX + frameH / 2);

  const group = new THREE.Group();
  group.position.set(x, centerY, z);
  group.rotation.y = rotationY;
  parent.add(group);
// Khung kim loại 3D thật (mảnh, bo góc lớn), nhô ra sau ảnh ~3cm mỗi cạnh — đảm bảo luôn
  // hiện rõ dưới mọi điều kiện ánh sáng, khác với viền chỉ vẽ trên texture (dễ bị đèn rọi làm
  // mờ gần như biến mất, chỉ còn thấy ở góc bo tròn — đúng lỗi đã gặp).
  const frameBorder = .045;
  const metalFrameTex = makeRoundedRectTexture("#6f8293", frameW + frameBorder * 2, frameH + frameBorder * 2, .16);
  const metalFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(frameW + frameBorder * 2, frameH + frameBorder * 2),
    new THREE.MeshStandardMaterial({ map: metalFrameTex, roughness: .35, metalness: .7, side: THREE.DoubleSide })
  );
  metalFrame.position.z = -.012;
  group.add(metalFrame);

  // Khung ảnh (viền kim loại mảnh, bo góc lớn — vẽ trực tiếp trong texture để có bo góc thật)
  const photoBundle = getEventFramePhoto(nextEventFramePhotoIndex++);
  const photoMat = new THREE.MeshStandardMaterial({ map: photoBundle.texture, roughness: .6, side: THREE.DoubleSide });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), photoMat);
  const artId = registerArtifact({ title: name, description: role, group: "Góc chia sẻ chuyên gia", image: photoBundle.dataUrl });
  photo.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(photo);
  group.add(photo);
  if (SHOW_FRAME_NAMEPLATES) {

  // Bảng tên — tách rời bằng khoảng hở "gap", tràn rộng hơn khung ảnh 2 bên.
  const plateTex = makeNameplateTexture(name, role);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(plateW, plateH), new THREE.MeshStandardMaterial({ map: plateTex, roughness: .7 }));
  plate.position.set(0, -frameH / 2 - gap - plateH / 2, .01);
  group.add(plate);
  }

  // Icon loa — góc dưới-phải khung ảnh — bấm để nghe chia sẻ (chỉ 1 thẻ phát cùng lúc).
  const idleTex = makeSpeakerIconTexture("idle");
  const playingTex = makeSpeakerIconTexture("playing");
  const iconMat = new THREE.MeshBasicMaterial({ map: idleTex, transparent: true });
  const icon = new THREE.Mesh(new THREE.CircleGeometry(iconSize / 2, 40), iconMat);
  icon.position.set(frameW / 2 - iconSize * .62, -frameH / 2 + iconSize * .62, .02);
  group.add(icon);

  const audio = new Audio(audioSrc);
  audio.loop = false;
  const state = { playing: false };
  const stopThisCard = () => {
    audio.pause(); audio.currentTime = 0;
    state.playing = false;
    iconMat.map = idleTex; iconMat.needsUpdate = true;
    if (currentPlayingExpertAudio === stopThisCard) currentPlayingExpertAudio = null;
  };
  audio.addEventListener("ended", stopThisCard);
  icon.userData = {
    kind: "expertAudio",
    toggle() {
      if (state.playing) { stopThisCard(); return; }
      if (currentPlayingExpertAudio) currentPlayingExpertAudio();
      audio.currentTime = 0;
      audio.play().then(() => {
        state.playing = true;
        iconMat.map = playingTex; iconMat.needsUpdate = true;
        currentPlayingExpertAudio = stopThisCard;
      }).catch(() => { /* chưa có file audio thật — icon giữ nguyên trạng thái mặc định */ });
    }
  };
  registerInteractiveObject(icon);

  // Đèn hắt nhẹ quanh icon, sáng dần khi camera tới gần (proximity trigger theo hồ sơ).
  // Spotlight riêng cho khung ảnh, đồng bộ hệ đèn Chủ đề 1 gốc.
  return group;
}

// Khung tranh vàng đồng 3 lớp — kiểu dáng đồng bộ createWallPicture của Chủ đề 1.
function createTheme1WallBackdrop(parent, opts) {
  const {
    position,
    size,
    rotationY = 0,
    boardColor = WALL_BEIGE,
    boardEmissive = WALL_EMISSIVE,
    trimColor = 0xd6b86f,
    renderOnTop = false,
    oneSided = false
  } = opts;
  const [w, h] = size;
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
const panelSide = oneSided ? THREE.FrontSide : THREE.DoubleSide;
  const wallMat = new THREE.MeshStandardMaterial({ color: boardColor, roughness: .72, emissive: boardEmissive, emissiveIntensity: .1, depthWrite: !renderOnTop, depthTest: !renderOnTop, side: panelSide });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: .3, metalness: .55, depthWrite: !renderOnTop, depthTest: !renderOnTop, side: panelSide });
  const centerWall = new THREE.Mesh(oneSided ? new THREE.PlaneGeometry(w, h) : new THREE.BoxGeometry(w, h, .16), wallMat);
  centerWall.renderOrder = renderOnTop ? 25 : 0;
  group.add(centerWall);

  [
    [w + .18, .12, 0, h / 2 + .06],
    [w + .18, .12, 0, -h / 2 - .06],
    [.12, h + .18, -w / 2 - .06, 0],
    [.12, h + .18, w / 2 + .06, 0]
  ].forEach(v => {
    const trim = new THREE.Mesh(oneSided ? new THREE.PlaneGeometry(v[0], v[1]) : new THREE.BoxGeometry(v[0], v[1], .22), trimMat);
    trim.position.set(v[2], v[3], oneSided ? .018 : .08);
    trim.renderOrder = renderOnTop ? 26 : 0;
    group.add(trim);
  });
  return group;
}

function makePinnedLetterTexture(item, accent = "#b71f32", paperColor = "#fff8e8") {
  const c = document.createElement("canvas");
  c.width = 620; c.height = 760;
  const ctx = c.getContext("2d");
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 220; i++) {
    ctx.fillStyle = `rgba(120,84,44,${Math.random() * .045})`;
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, c.width - 40, c.height - 40);
  ctx.fillStyle = "#172032";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 42px Roboto, Arial, sans-serif";
  wrapFillText(ctx, item.title, c.width / 2, 150, c.width - 120, 50);
  ctx.font = "700 28px Roboto, Arial, sans-serif";
  ctx.fillStyle = "#334155";
  wrapFillText(ctx, item.desc, c.width / 2, 410, c.width - 110, 38);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(c.width / 2, 58, 18, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, dataUrl: c.toDataURL("image/png") };
}

function createPinnedLetter(item, position, size, rotationY = 0, opts = {}, parent = scene) {
  const paperBundle = makePinnedLetterTexture(item, opts.accent || "#b71f32");
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  group.rotation.z = opts.tilt || 0;
  parent.add(group);
const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshStandardMaterial({ map: paperBundle.texture, roughness: .74, side: THREE.DoubleSide })
  );
  group.add(paper);

  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(Math.min(size[0], size[1]) * .065, 18, 12),
    new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .25, metalness: .55 })
  );
  pin.position.set(0, size[1] * .42, .035);
  group.add(pin);

  const artId = registerArtifact({
    title: item.title,
    description: item.desc,
    group: opts.groupLabel,
    source: opts.source,
    image: paperBundle.dataUrl
  });
  paper.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(paper);
  return group;
}

function createPinnedLetterBatch(letters, opts = {}, parent = scene) {
  const paperBundle = makePinnedLetterTexture({ kind: "letter", title: "Thu tri an", desc: "Bam vao tung mau thu de xem noi dung chi tiet." }, opts.accent || "#b71f32", opts.paperColor || "#fffdf5");
  const paperGeo = new THREE.PlaneGeometry(1, 1);
  const paperMat = new THREE.MeshStandardMaterial({
    map: paperBundle.texture,
    roughness: .74,
    side: opts.side ?? THREE.DoubleSide,
    depthWrite: !opts.renderOnTop,
    depthTest: !opts.renderOnTop
  });
  const paperMesh = new THREE.InstancedMesh(paperGeo, paperMat, letters.length);
  const pinGeo = new THREE.SphereGeometry(.018, 10, 8);
  const pinMat = new THREE.MeshStandardMaterial({ color: opts.pinColor || 0xd6b86f, roughness: .25, metalness: .55, depthWrite: !opts.renderOnTop, depthTest: !opts.renderOnTop });
  const pinMesh = new THREE.InstancedMesh(pinGeo, pinMat, letters.length);
  paperMesh.renderOrder = opts.renderOnTop ? 27 : 0;
  pinMesh.renderOrder = opts.renderOnTop ? 28 : 0;
  const ids = [];
  const matrix = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const euler = new THREE.Euler();
  const pinOffset = new THREE.Vector3();
  const pinPos = new THREE.Vector3();
  const pinScale = new THREE.Vector3();

  letters.forEach((letter, i) => {
    const letterBundle = makePinnedLetterTexture(letter.item, opts.accent || "#b71f32", opts.paperColor || "#fffdf5");
    const artId = registerArtifact({
      title: letter.item.title,
      description: letter.item.desc,
      group: opts.groupLabel,
      source: opts.source,
      image: letterBundle.dataUrl
    });
    ids.push(artId);

    pos.set(...letter.position);
    euler.set(0, letter.rotationY, letter.rotationZ || 0);
    quat.setFromEuler(euler);
    scale.set(letter.size[0], letter.size[1], 1);
    matrix.compose(pos, quat, scale);
    paperMesh.setMatrixAt(i, matrix);
    paperMesh.setColorAt(i, _instanceBaseColor);

    pinOffset.set(0, letter.size[1] * .42, .035).applyQuaternion(quat);
    pinPos.copy(pos).add(pinOffset);
    pinScale.setScalar(Math.min(letter.size[0], letter.size[1]) * 3.6);
    matrix.compose(pinPos, quat, pinScale);
    pinMesh.setMatrixAt(i, matrix);
  });

  paperMesh.instanceMatrix.needsUpdate = true;
  paperMesh.instanceColor.needsUpdate = true;
  pinMesh.instanceMatrix.needsUpdate = true;
  paperMesh.userData = { kind: "artifactInstances", ids };
  parent.add(paperMesh);
  parent.add(pinMesh);
  registerInteractiveObject(paperMesh);
  return { paperMesh, pinMesh };
}

function createGuestbookDesk(group, position, rotationY, scale = 1) {
  const desk = new THREE.Group();
  desk.position.set(...position);
  desk.rotation.y = rotationY;
  group.add(desk);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5733, roughness: .65, metalness: .02 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .32, metalness: .5 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: .72 });
  const tableHeight = 3.15;
  const topThickness = .2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.2 * scale, topThickness, 1.3 * scale), woodMat);
  top.position.y = tableHeight - topThickness / 2;
  desk.add(top);

  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.15 * scale, tableHeight - topThickness, .15 * scale), woodMat);
    leg.position.set(x * 1.82 * scale, (tableHeight - topThickness) / 2, z * .5 * scale);
    desk.add(leg);
  });

  const book = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x6d2630, roughness: .48, metalness: .04 });
  const bookCover = new THREE.Mesh(new THREE.BoxGeometry(1.12 * scale, .1, .64 * scale), coverMat);
  const bookPages = new THREE.Mesh(new THREE.BoxGeometry(1.02 * scale, .1, .54 * scale), paperMat);
  bookCover.position.y = .02;
  bookPages.position.y = .1;
  book.add(bookCover, bookPages);
  book.position.set(-.56 * scale, tableHeight + .04, 0);
  book.rotation.y = .05;
  desk.add(book);

  const pen = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .88 * scale, 16), brassMat);
  pen.position.set(.66 * scale, tableHeight + .14, .05 * scale);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = -.45;
  desk.add(pen);
  return desk;
}

function createGoc4WallGallery(group, content, room, opts = {}) {
  const G4_SX = G1_SX;
  const G4_SZ = ROOM_D / 9;
  const toZ4 = docZ => RING_OUT + docZ * G4_SZ;

  const mapPanelCenterY = CEIL_H * .50;
  createTheme1WallBackdrop(group, {
    position: [0, mapPanelCenterY, R_BACK - .26],
    size: [5.75 * G4_SX, 2.55 * G4_SX],
    rotationY: Math.PI
  });
  createFramedPanel(content.stt1, [0, mapPanelCenterY, R_BACK - .42], [5.5 * G4_SX, 2.3 * G4_SX], Math.PI,
    { accent: "#d6b86f", groupLabel: content.stt1.title, useEventPhotos: false }, group);
  createFlatPhotoCaption(group, content.stt1.title, [0, mapPanelCenterY - 1.15 * G4_SX - .58, R_BACK - .47], [5.5 * G4_SX + .62, .42], Math.PI);
  if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(content.stt1.title, [0, mapPanelCenterY - 1.45 * G4_SX, R_BACK - .47], [5.2 * G4_SX, .42], Math.PI, {
      size: 18, color: "#172032", background: "#f8fafc", border: true, accent: "#d6b86f",
      weight: 900, wrap: true, width: 1300, height: 240, maxWidth: 1120, lineHeight: 28
    }, group);
  }

  const ambassadorCenterY = GOC1_FRAME_CENTER_Y;
  const G4_SIDE_ROW_Y = [GOC1_FRAME_CENTER_Y, GOC1_FRAME_CENTER_Y + 1.05 * G4_SX, GOC1_FRAME_CENTER_Y + 2.10 * G4_SX];
  const G4_STT2_Z_SLOTS = [1.55, 3.55, 5.55, 7.55];
  if (!opts.skipLeft) G4_STT2_Z_SLOTS.flatMap((docZ, i) => G4_SIDE_ROW_Y.map((y, rowIndex) => ({
    z: toZ4(docZ),
    y,
    item: content.stt2.items[i + rowIndex * G4_STT2_Z_SLOTS.length] || { kind: "photo", title: `Dai su sinh vien 0${i + 1}`, desc: content.stt2.title }
  }))).forEach(slot => {
    createFramedPanel(slot.item, [-ROOM_W / 2 + .38, slot.y, slot.z], [.75 * G4_SX, .75 * G4_SX], Math.PI / 2,
      { accent: "#cdbb86", groupLabel: content.stt2.title }, group);
    createFlatPhotoCaption(group, slot.item.title, [-ROOM_W / 2 + .42, slot.y - .375 * G4_SX - .58, slot.z], [.75 * G4_SX + .62, .42], Math.PI / 2);
    if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(slot.item.title, [-ROOM_W / 2 + .42, slot.y - .62 * G4_SX, slot.z], [1.25 * G4_SX, .34], Math.PI / 2, {
        size: 16, color: "#172032", background: "#f8fafc", border: true, borderWidth: 6, accent: "#6f8293",
        weight: 900, wrap: true, width: 900, height: 220, maxWidth: 760, lineHeight: 24
      }, group);
    }
  });

  if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(content.stt2.title, [-ROOM_W / 2 + .42, ambassadorCenterY - 1.12 * G4_SX, toZ4(4.95)], [3.2 * G4_SX, .38], Math.PI / 2, {
      size: 17, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
      weight: 900, wrap: true, width: 1200, height: 240, maxWidth: 980, lineHeight: 26
    }, group);
  }

  const storyCenterY = GOC1_FRAME_CENTER_Y;
  const G4_STT3_Z_SLOTS = [1.8, 3.5, 5.2, 6.9];
  const storyItems = [
    { kind: "video", title: "Trao doi sinh vien", desc: content.stt3.desc },
    { kind: "video", title: "Dien dan quoc te", desc: content.stt3.desc },
    { kind: "video", title: "Lop hoc ket noi", desc: content.stt3.desc },
    { kind: "video", title: "Cau chuyen hoi nhap", desc: content.stt3.desc }
  ];
  if (!opts.skipRight) G4_STT3_Z_SLOTS.flatMap((docZ, i) => G4_SIDE_ROW_Y.map((y, rowIndex) => ({
    z: toZ4(docZ),
    y,
    item: storyItems[(i + rowIndex * G4_STT3_Z_SLOTS.length) % storyItems.length]
  }))).forEach(slot => {
    createFramedPanel(slot.item, [ROOM_W / 2 - .38, slot.y, slot.z], [.9 * G4_SX, .55 * G4_SX], -Math.PI / 2,
      { accent: "#6f8293", groupLabel: content.stt3.title, enableAudio: true }, group);
    createFlatPhotoCaption(group, slot.item.title, [ROOM_W / 2 - .42, slot.y - .275 * G4_SX - .58, slot.z], [.9 * G4_SX + .62, .42], -Math.PI / 2);
    if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(slot.item.title, [ROOM_W / 2 - .42, slot.y - .45 * G4_SX, slot.z], [.95 * G4_SX, .24], -Math.PI / 2, {
        size: 13, color: "#172032", background: "#f8fafc", border: true, borderWidth: 5, accent: "#6f8293",
        weight: 900, wrap: true, width: 760, height: 180, maxWidth: 640, lineHeight: 20
      }, group);
    }
  });

  if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(content.stt3.title, [ROOM_W / 2 - .42, storyCenterY - .92 * G4_SX, toZ4(4.35)], [3.2 * G4_SX, .34], -Math.PI / 2, {
      size: 16, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
      weight: 900, wrap: true, width: 1120, height: 220, maxWidth: 920, lineHeight: 24
    }, group);
  }

}

function createGoc5WallGallery(group, content, room) {
  const G5_SX = G1_SX;
  const G5_SZ = ROOM_D / 9;
  const toZ5 = docZ => RING_OUT + docZ * G5_SZ;
  const gratitudeGroup = new THREE.Group();
  gratitudeGroup.visible = false;
  group.add(gratitudeGroup);
  registerRoomOnlyVisibility({ group: gratitudeGroup, roomGroup: group });

  const missionCenterY = CEIL_H * .50;
  createFramedPanel(content.stt1.items[0], [0, missionCenterY, R_BACK - .42], [4.8 * G5_SX, 2.05 * G5_SX], Math.PI,
    { accent: "#d6b86f", groupLabel: content.stt1.title, useEventPhotos: false }, group);

  const standScale = G5_SX * 2.5;
  const standLengthScale = standScale * .8;
  const standHeightScale = 1.55;
  const stand = new THREE.Group();
  stand.position.set(0, .42, R_BACK - 3.05);
  group.add(stand);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3d, roughness: .68, metalness: .05 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .36, metalness: .48 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.08 * standScale, .18, .48 * standLengthScale), brassMat);
  base.position.y = .09;
  stand.add(base);
  const bookTopY = 1.62 * standHeightScale;
  const columnH = bookTopY - .23;
  const column = new THREE.Mesh(new THREE.BoxGeometry(.22 * standScale, columnH, .18 * standLengthScale), standMat);
  column.position.y = .18 + columnH / 2;
  stand.add(column);
  const bookTop = new THREE.Mesh(new THREE.BoxGeometry(1.05 * standScale, .1, .82 * standLengthScale), brassMat);
  bookTop.position.y = bookTopY;
  bookTop.rotation.x = -.20;
  stand.add(bookTop);

  const bookBundle = getPlaceholderTexture({ kind: "doc", title: "S\u00e1ch s\u1ee9 m\u1ec7nh v\u00ec c\u1ed9ng \u0111\u1ed3ng" }, "#b71f32");
  const bookPages = [
    { title: "Kh\u1edfi \u0111\u1ea7u t\u1eeb nh\u1eefng vi\u1ec7c nh\u1ecf", kicker: "Chi\u1ebfn d\u1ecbch t\u00ecnh nguy\u1ec7n", description: "Gi\u1edbi thi\u1ec7u c\u00e1c chi\u1ebfn d\u1ecbch t\u00ecnh nguy\u1ec7n v\u00ec c\u1ed9ng \u0111\u1ed3ng v\u00e0 nh\u1eefng h\u00e0nh \u0111\u1ed9ng \u0111\u1ea7u ti\u00ean c\u1ee7a sinh vi\u00ean.", image: bookBundle.dataUrl, layout: "image-left" },
    { title: "L\u1edbp h\u1ecdc k\u1ebft n\u1ed1i", kicker: "D\u1ea5u \u1ea5n gi\u00e1o d\u1ee5c", description: "Nh\u1eefng l\u1edbp h\u1ecdc, ng\u00e0y c\u00f4ng v\u00e0 d\u1ea5u \u1ea5n c\u1ee7a sinh vi\u00ean s\u01b0 ph\u1ea1m t\u1ea1i c\u00e1c \u0111\u1ecba ph\u01b0\u01a1ng.", image: bookBundle.dataUrl, layout: "image-top" },
    { title: "Cam k\u1ebft ti\u1ebfp n\u1ed1i", kicker: "H\u00e0nh tr\u00ecnh ph\u1ee5c v\u1ee5", description: "L\u1eddi nh\u1eafn g\u1eedi v\u00e0 cam k\u1ebft ti\u1ebfp t\u1ee5c \u0111\u00f3ng g\u00f3p cho x\u00e3 h\u1ed9i c\u1ee7a c\u00e1c th\u1ebf h\u1ec7 sinh vi\u00ean.", image: bookBundle.dataUrl, layout: "editorial" }
  ];
  const bookArtifactId = registerArtifact({
    title: "S\u00e1ch s\u1ee9 m\u1ec7nh v\u00ec c\u1ed9ng \u0111\u1ed3ng",
    description: "Quyen sach mo tren tru sach, co the lat tung trang de xem noi dung.",
    group: content.stt1.title,
    source: "Phong truyen thong 3D",
    image: bookBundle.dataUrl,
    presentation: "book",
    pages: bookPages
  });

  const openBook = new THREE.Group();
  openBook.position.y = bookTopY + .11;
  openBook.rotation.x = -.20;
  stand.add(openBook);

  const bookWidth = 1.0 * standScale;
  const bookDepth = .74 * standLengthScale;
  const halfWidth = bookWidth / 2;
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x7b1720, roughness: .42, metalness: .08, emissive: 0x2b070a, emissiveIntensity: .18 });
  const pageMat = new THREE.MeshStandardMaterial({ map: bookBundle.texture, color: 0xfff8e7, roughness: .68, side: THREE.DoubleSide });
  const pageEdgeMat = new THREE.MeshStandardMaterial({ color: 0xf0dfbc, roughness: .82 });

  const spine = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, bookDepth), coverMat);
  spine.position.y = 0;
  openBook.add(spine);

  [-1, 1].forEach(side => {
    const tilt = side * .16;
    const cover = new THREE.Mesh(new THREE.BoxGeometry(halfWidth, .09, bookDepth), coverMat);
    cover.position.set(side * halfWidth / 2, .23, 0);
    cover.rotation.z = tilt;
    openBook.add(cover);

    const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(halfWidth - .14, .20, bookDepth - .16), pageEdgeMat);
    pageBlock.position.set(side * halfWidth / 2, .34, 0);
    pageBlock.rotation.z = tilt;
    openBook.add(pageBlock);

    const openPage = new THREE.Mesh(new THREE.BoxGeometry(halfWidth - .2, .018, bookDepth - .24), pageMat);
    openPage.position.set(side * halfWidth / 2, .46, 0);
    openPage.rotation.z = tilt;
    openPage.userData = { kind: "artifact", id: bookArtifactId };
    registerInteractiveObject(openPage);
    openBook.add(openPage);

    for (let page = 1; page <= 3; page++) {
      const pageLine = new THREE.Mesh(new THREE.BoxGeometry(halfWidth - .34, .008, bookDepth - .38), pageEdgeMat);
      pageLine.position.set(side * halfWidth / 2, .48 + page * .017, 0);
      pageLine.rotation.z = tilt;
      openBook.add(pageLine);
    }
  });

  const volunteerItems = [
    { kind: "video", title: "Chi\u1EBFn d\u1ECBch h\u00E8 01", desc: content.stt2.desc },
    { kind: "video", title: "Chi\u1EBFn d\u1ECBch h\u00E8 02", desc: content.stt2.desc },
    { kind: "video", title: "Chi\u1EBFn d\u1ECBch h\u00E8 03", desc: content.stt2.desc },
    { kind: "video", title: "Chi\u1EBFn d\u1ECBch h\u00E8 04", desc: content.stt2.desc },
    { kind: "photo", title: "L\u1EDBp h\u1ECDc t\u00ECnh nguy\u1EC7n", desc: content.stt2.desc },
    { kind: "photo", title: "\u0110\u1ED9i h\u00ECnh xanh", desc: content.stt2.desc },
    { kind: "photo", title: "H\u1ED7 tr\u1EE3 c\u1ED9ng \u0111\u1ED3ng", desc: content.stt2.desc },
    { kind: "photo", title: "Ng\u00E0y h\u1ED9i thi\u1EBFu nhi", desc: content.stt2.desc },
    { kind: "photo", title: "Ti\u1EBFp s\u1EE9c m\u00F9a thi", desc: content.stt2.desc },
    { kind: "photo", title: "C\u00F4ng tr\u00ECnh thanh ni\u00EAn", desc: content.stt2.desc },
    { kind: "photo", title: "Tuy\u1EBFn \u0111\u01B0\u1EDDng s\u00E1ng xanh", desc: content.stt2.desc },
    { kind: "photo", title: "D\u1EA5u \u1EA5n \u0111\u1ED9i h\u00ECnh", desc: content.stt2.desc }
  ];
  const volunteerWallX = -ROOM_W / 2 + .38;
  const volunteerCenterZ = RING_OUT + ROOM_D / 2;
  const volunteerSpanZ = Math.min(ROOM_D * .74, 28.8);
  const volunteerColStep = volunteerSpanZ / 4;
  const volunteerStartZ = volunteerCenterZ - volunteerSpanZ / 2 + volunteerColStep / 2;
  const volunteerRowYs = [13.1, 10.25, 7.4];
  const volunteerFrameSize = [.9 * G5_SX, .55 * G5_SX];

  volunteerItems.forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const z = volunteerStartZ + col * volunteerColStep;
    const y = volunteerRowYs[row];
    createFramedPanel(item, [volunteerWallX, y, z], volunteerFrameSize, Math.PI / 2,
      { accent: "#6f8293", groupLabel: content.stt2.title }, group);
    createFlatPhotoCaption(group, item.title, [volunteerWallX + .24, y - volunteerFrameSize[1] / 2 - .58, z], [volunteerFrameSize[0] + .62, .42], Math.PI / 2);
  });
  const gratitudeCenterY = GOC1_FRAME_CENTER_Y + 0.55 * G5_SX;
  const boardCenterZ = RING_OUT + ROOM_D / 2;
  const rightWallInnerX = ROOM_W / 2 - WALL_T / 2;
  const boardWallX = rightWallInnerX - .42;
  const boardFrontX = boardWallX - .035;
  const guestbookDeskX = rightWallInnerX - 3.15;
  const boardW = Math.min(ROOM_D * .44, 17.4);
  const boardH = 2.72 * G5_SX;
  const boardHalfZ = boardW / 2;
  const boardHalfY = boardH / 2;
  createTheme1WallBackdrop(group, {
    position: [boardWallX, gratitudeCenterY, boardCenterZ],
    size: [boardW, boardH],
    rotationY: -Math.PI / 2,
    boardColor: 0xa9a095,
    boardEmissive: 0x1c1813,
    trimColor: 0xd6b86f,
    renderOnTop: false,
    oneSided: true
  });
  const letterCount = 120;
  const letterPadZ = .10 * G5_SZ;
  const letterPadY = .10 * G5_SX;
  const letterShapes = [
    { w: .095, h: .13 }, { w: .11, h: .12 }, { w: .085, h: .145 },
    { w: .12, h: .10 }, { w: .10, h: .155 }
  ];
  const random01 = seed => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const letterInstances = [];
  for (let i = 0; i < letterCount; i++) {
    const letterShape = letterShapes[i % letterShapes.length];
    const letterHalfZ = letterShape.w * G5_SX / 2;
    const letterHalfY = letterShape.h * G5_SX / 2;
    const localZ = THREE.MathUtils.lerp(-boardHalfZ + letterPadZ + letterHalfZ, boardHalfZ - letterPadZ - letterHalfZ, random01(i * 2 + 1));
    const localY = THREE.MathUtils.lerp(-boardHalfY + letterPadY + letterHalfY, boardHalfY - letterPadY - letterHalfY, random01(i * 2 + 2));
    const letterRot = (random01(i * 2 + 3) - .5) * .42;
    const src = content.stt3.items[i % content.stt3.items.length];
    const item = { ...src, title: src.title || `Thu tri an ${i + 1}` };
    letterInstances.push({
      item,
      position: [boardFrontX, gratitudeCenterY + localY, boardCenterZ + localZ],
      size: [letterShape.w * G5_SX, letterShape.h * G5_SX],
      rotationY: -Math.PI / 2,
      rotationZ: letterRot
    });
  }
  createPinnedLetterBatch(letterInstances, { accent: "#b89262", paperColor: "#fffdf5", pinColor: 0xb71f32, groupLabel: content.stt3.title, side: THREE.FrontSide, renderOnTop: false }, gratitudeGroup);
  if (SHOW_FRAME_NAMEPLATES) {
    const titlePanel = addTextPanel(content.stt3.title, [boardFrontX - .02, gratitudeCenterY - 1.2 * G5_SX, boardCenterZ], [3.4 * G5_SX, .34], -Math.PI / 2, {
      size: 16, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
      weight: 900, wrap: true, width: 1120, height: 220, maxWidth: 920, lineHeight: 24, side: THREE.FrontSide,
      depthWrite: false, depthTest: true
    }, gratitudeGroup);
    titlePanel.renderOrder = 29;
  }
  createGuestbookDesk(group, [guestbookDeskX, 0, boardCenterZ], -Math.PI / 2, .72 * G5_SX);

}

function createFramedPanel(item, position, size, rotationY = 0, opts = {}, parent = scene) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);
const accent = opts.accent || "#cdbb86";
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xcdbb86, roughness: .36, metalness: .42 });
  const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(size[0] + .48, size[1] + .48, .18), frameMat);
  outerFrame.position.z = .03;
  group.add(outerFrame);

  const matBoard = new THREE.Mesh(
    new THREE.BoxGeometry(size[0] + .18, size[1] + .18, .08),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  matBoard.position.z = .1;
  group.add(matBoard);

  [
    [size[0] + .26, .08, 0, size[1] / 2 + .13], [size[0] + .26, .08, 0, -size[1] / 2 - .13],
    [.08, size[1] + .26, -size[0] / 2 - .13, 0], [.08, size[1] + .26, size[0] / 2 + .13, 0]
  ].forEach(v => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(v[0], v[1], .12), frameMat);
    rail.position.set(v[2], v[3], .17);
    group.add(rail);
  });

  const bundle = getEventFramePhoto(opts.eventPhotoIndex ?? nextEventFramePhotoIndex++);
  const mat = new THREE.MeshStandardMaterial({ map: bundle.texture, roughness: .62, side: THREE.DoubleSide, emissive: 0x000000 });
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat);
  picture.position.z = .24;
  const artId = registerArtifact({
    title: item.title, description: item.desc, group: opts.groupLabel, source: opts.source, image: bundle.dataUrl
  });
  if (opts.enableAudio) attachExclusiveFrameAudio(picture, artId);
  else picture.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(picture);
  group.add(picture);

  return group;
}

/* ==========================================================================================
   4.b TV MÀN HÌNH CONG GẮN TƯỜNG — video tự phát, hết thì chiếu lại từ đầu (loop).
   Đổi TV_VIDEO_SRC dưới đây thành đường dẫn/URL video thật khi có tư liệu chính thức; trong
   lúc chưa có, TV tự động hiển thị khung "đặt chỗ" (không vỡ giao diện, không phát lỗi trắng).
   ========================================================================================== */
const TV_VIDEO_SRC = "./image_v2/vtv1.mp4"; // <-- THAY đường dẫn video thật vào đây

// Mặt cong nhẹ: một PlaneGeometry bình thường (CÙNG kiểu hình học với mọi bảng nội dung khác
// trong file, đã chạy đúng) — chỉ uốn các đỉnh dọc theo trục X bằng một đường parabol, thay vì
// dùng công thức hình trụ (bán kính/góc) phức tạp. Rộng/cao của mesh luôn đúng bằng width/height
// truyền vào — không lệ thuộc phép tính trung gian nào có thể sai.
function createCurvedPlaneGeometry(width, height, sag, segmentsX = 48) {
  const geo = new THREE.PlaneGeometry(width, height, segmentsX, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getX(i) / (width / 2); // -1 .. 1
    pos.setZ(i, sag * (1 - t * t));      // giữa lồi nhất (z=sag), 2 mép z=0
  }
  geo.computeVertexNormals();
  return geo;
}

function createCurvedFrameGeometry(width, height, border, sag, segmentsX = 56) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2, height / 2);
  shape.lineTo(-width / 2, height / 2);
  shape.lineTo(-width / 2, -height / 2);
  const hole = new THREE.Path();
  hole.moveTo(-width / 2 + border, -height / 2 + border);
  hole.lineTo(-width / 2 + border, height / 2 - border);
  hole.lineTo(width / 2 - border, height / 2 - border);
  hole.lineTo(width / 2 - border, -height / 2 + border);
  hole.lineTo(-width / 2 + border, -height / 2 + border);
  shape.holes.push(hole);
  const geo = new THREE.ShapeGeometry(shape, segmentsX);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getX(i) / (width / 2);
    pos.setZ(i, sag * (1 - t * t));
  }
  geo.computeVertexNormals();
  return geo;
}

function createCurvedWallTV(parent, opts) {
  const {
    width,
    height,                // nhận thẳng chiều cao (theo hồ sơ TV Góc 1, không ép tỉ lệ 16:9)
    wallZ,
    centerY = CEIL_H * .44,
    bezelColor = 0xf4f7f9,
    trimColor = 0x9aa3ab
  } = opts;

    const sag = width * .055;
    const wallClearance = .16;
    const standOff = sag + wallClearance;

  const group = new THREE.Group();
  group.position.set(0, centerY, wallZ - standOff);
  parent.add(group);
// ---- Vật liệu màn hình: LUÔN bắt đầu bằng khung "đặt chỗ" sáng rõ (đảm bảo luôn nhìn thấy
  // được, không bao giờ bị đen chìm vào tường) — chỉ chuyển sang video thật khi video đã thực
  // sự tải xong và phát được.
  const placeholderBundle = getPlaceholderTexture({ kind: "video", title: "TV Góc 1 — gắn video thật tại biến TV_VIDEO_SRC" }, "#8ecae6");
  const screenMat = new THREE.MeshBasicMaterial({ map: placeholderBundle.texture, side: THREE.DoubleSide, toneMapped: true });

  // ---- Nguồn video: tự phát khi tải xong, lặp vô hạn; chỉ thay vào màn hình khi chắc chắn phát được ----
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  let wasInsideGoc1 = false;
  let updateGoc1VideoSpeaker = () => {};
  const syncGoc1VideoAudio = (force = false) => {
    const room = ROOM_DEFS.goc1;
    const radial = camera.position.x * room.F[0] + camera.position.z * room.F[1];
    const lateral = camera.position.x * room.R[0] + camera.position.z * room.R[1];
    const isInsideGoc1 = radial >= RING_OUT + .6 && radial <= R_BACK - .6 && Math.abs(lateral) <= ROOM_W / 2 - WALL_T;
    if (!force && isInsideGoc1 === wasInsideGoc1) return false;
    wasInsideGoc1 = isInsideGoc1;
    if (isInsideGoc1 && goc1VideoAudioUnlocked) {
      video.muted = false;
      video.volume = .65;
      video.play().catch(() => { video.muted = true; updateGoc1VideoSpeaker(false); });
    } else {
      video.muted = true;
    }
    updateGoc1VideoSpeaker(!video.muted);
    return true;
  };
  goc1VideoAudioController = { sync: syncGoc1VideoAudio };
  window.addEventListener("pointerdown", () => {
    goc1VideoAudioUnlocked = true;
    syncGoc1VideoAudio(true);
  }, { once: true });
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.wrapS = THREE.ClampToEdgeWrapping;
  videoTexture.wrapT = THREE.ClampToEdgeWrapping;
  videoTexture.minFilter = THREE.LinearFilter;
  video.addEventListener("loadeddata", () => {
    screenMat.map = videoTexture;
    screenMat.toneMapped = false;
    screenMat.needsUpdate = true;
    requestRender();
    video.play().then(() => {
      hasActiveVideoTexture = true;
      requestRender();
    }).catch(() => {});
  });
  video.addEventListener("pause", () => {
    hasActiveVideoTexture = false;
    requestRender();
  });
  const tryPlay = () => video.play().then(() => {
    hasActiveVideoTexture = true;
    requestRender();
  }).catch(() => {});
  window.addEventListener("pointerdown", tryPlay, { once: true });
  video.src = TV_VIDEO_SRC;
  tryPlay();

  // ---- Mặt màn hình cong nhẹ — DoubleSide để chắc chắn không bao giờ bị ẩn do hướng pháp
  // tuyến, dù nhìn từ góc nào. rotation.y=Math.PI đúng quy ước mọi bảng nội dung tường cuối
  // khác trong file (đối chiếu addTextPanel/createFramedPanel trên cùng bức tường).
  const screenGeo = createCurvedPlaneGeometry(width, height, -sag);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.rotation.y = Math.PI;
  screen.renderOrder = 10;
  group.add(screen);
  const tvIdleTexture = makeSpeakerIconTexture("idle");
  const tvPlayingTexture = makeSpeakerIconTexture("playing");
  const tvIconMaterial = new THREE.MeshBasicMaterial({ map: tvIdleTexture, transparent: true, depthTest: true });
  const tvIcon = new THREE.Mesh(new THREE.CircleGeometry(.32, 40), tvIconMaterial);
  tvIcon.position.set(width / 2 - .48, -height / 2 + .48, standOff + .08);
  tvIcon.renderOrder = 35;
  group.add(tvIcon);
  updateGoc1VideoSpeaker = isPlaying => {
    tvIconMaterial.map = isPlaying ? tvPlayingTexture : tvIdleTexture;
    tvIconMaterial.needsUpdate = true;
    requestRender();
  };
  tvIcon.userData = {
    kind: "videoAudio",
    toggle() {
      goc1VideoAudioUnlocked = !goc1VideoAudioUnlocked;
      syncGoc1VideoAudio(true);
    }
  };
  registerInteractiveObject(tvIcon);
  updateGoc1VideoSpeaker(false);
  const trimRingGeo = createCurvedFrameGeometry(width + .24, height + .24, .12, -sag);
  const trimRing = new THREE.Mesh(trimRingGeo, new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .28, metalness: .65, side: THREE.DoubleSide }));
  trimRing.rotation.y = Math.PI;
  trimRing.position.z = .045;
  group.add(trimRing);
// Lớp kính bóng phủ nhẹ trước mặt màn hình — mô phỏng ánh phản chiếu của mặt kính TV thật,
  // giúp phân biệt với một tấm ảnh in phẳng.
  const glassGeo = createCurvedPlaneGeometry(width, height, -sag);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: .05, roughness: .12, metalness: 0,
    clearcoat: 1, clearcoatRoughness: .1, side: THREE.FrontSide
  }));
  glass.rotation.y = Math.PI;
  glass.position.z = -.008;
  glass.renderOrder = 11;
  group.add(glass);

  // Đèn báo nguồn nhỏ ở mép dưới khung — chi tiết thực tế thường thấy trên TV thật.
  const led = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0x7ddfff }));
  led.position.set(0, -height / 2 - .2, standOff * .3);
  group.add(led);

  // ---- Giá đỡ gắn tường: đế áp tường + 2 cánh tay nối ra sau lưng màn hình cong ----
  const mountMat = new THREE.MeshStandardMaterial({ color: 0x6f8293, roughness: .45, metalness: .5 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(width * .3, height * .5, .05), mountMat);
  plate.position.set(0, 0, standOff - .03);
  group.add(plate);
  [-1, 1].forEach(sign => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, standOff - sag + .06), mountMat);
    arm.position.set(sign * width * .18, 0, (sag + standOff) / 2);
    group.add(arm);
  });

  // ---- Ánh sáng hắt sau lưng TV (ambilight, áp sát tường) + đèn phụ hắt sáng lên mặt cong ----
  return group;
}

/* ==========================================================================================
   5. VẬT LIỆU DÙNG CHUNG — bám bảng màu Chủ đề 1
   ========================================================================================== */
const materials = createSceneMaterials({
  wallColor: WALL_BEIGE,
  wallEmissive: WALL_EMISSIVE,
  lightAmberPale: LIGHT_AMBER_PALE
});
const {
  floor: floorMat,
  floorPatch: floorPatchMat,
  wall: wallMat,
  innerWall: innerWallMat,
  trim: trimMat,
  baseboard: baseboardMat,
  carpet: carpetMat,
  hub: hubMat,
  centralCeiling: centralCeilingMat
} = materials;
const CENTRAL_CEILING_TIER_LIFT = .78;
const SOUTH_UNIFIED_WALL_T = ENTRY_WALL_T * 1;
const SOUTH_ENTRY_VEST_DEPTH = 4.8;
const SOUTH_ROOM_OUTER_WALL_T = SOUTH_UNIFIED_WALL_T;
const SHOW_FRAME_NAMEPLATES = false;

/* ==========================================================================================
   6. HÌNH HỌC — Hạt nhân số, vành khuyên, phòng chéo, tường cong, lối vào chính
   ========================================================================================== */
const CENTRAL_HALL_SIDE_WALLS = [
  { key: "goc1", connectorDir: "west", quote: "Không có việc gì khó, chỉ sợ lòng không bền, đào núi và lấp biển, quyết chí ắt làm nên", author: "Hồ Chí Minh", arrow: "←" },
  { key: "goc5", connectorDir: "west", quote: "Cống hiến bắt đầu từ trách nhiệm với cộng đồng", author: "Thông điệp HNUE", arrow: "←" }
];

function createHubCore() {
  return buildHubCore({ parent: scene, radius: HUB_R, material: innerWallMat });
}

function createCentralInteractiveKiosk() {
  const kiosk = new THREE.Group();
  kiosk.name = "central-single-screen-kiosk";
  // The main entry is on the positive-Z (south) axis, so the display faces +Z.
  kiosk.position.y = .15;
  scene.add(kiosk);

  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .42, metalness: .16 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x005baa, roughness: .34, metalness: .28, emissive: 0x00264a, emissiveIntensity: .12 });
  const red = new THREE.MeshStandardMaterial({ color: 0xa9252b, roughness: .38, metalness: .18 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .28, metalness: .7 });
  const screen = new THREE.MeshBasicMaterial({ color: 0x005baa });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, .36, 64), blue);
  base.position.y = .18;
  const baseInset = new THREE.Mesh(new THREE.CylinderGeometry(2.08, 2.22, .18, 64), white);
  baseInset.position.y = .45;
  const goldFoot = new THREE.Mesh(new THREE.TorusGeometry(2.24, .07, 12, 64), gold);
  goldFoot.rotation.x = Math.PI / 2;
  goldFoot.position.y = .57;

  const column = new THREE.Mesh(new THREE.CylinderGeometry(.88, 1.14, 3.6, 48), white);
  column.position.y = 2.35;
  const blueCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.10, 1.10, .34, 48), blue);
  blueCollar.position.y = 1.05;
  const redCollar = new THREE.Mesh(new THREE.CylinderGeometry(.98, .98, .16, 48), red);
  redCollar.position.y = 2.82;
  const goldCollar = new THREE.Mesh(new THREE.TorusGeometry(.96, .075, 12, 48), gold);
  goldCollar.rotation.x = Math.PI / 2;
  goldCollar.position.y = 2.98;
  kiosk.add(base, baseInset, goldFoot, column, blueCollar, redCollar, goldCollar);

  // Weldable mechanical connection: a curved saddle plate fits the circular column.
  const weld = new THREE.MeshStandardMaterial({ color: 0x00477f, roughness: .42, metalness: .32 });
  const curvedPlateGeometry = (innerRadius, outerRadius, height, angleStart, angleSpan, segments = 24) => {
    const vertices = [];
    const indices = [];
    for (let index = 0; index <= segments; index += 1) {
      const angle = angleStart + angleSpan * index / segments;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      [[innerRadius, -height / 2], [innerRadius, height / 2], [outerRadius, -height / 2], [outerRadius, height / 2]].forEach(([radius, y]) => vertices.push(radius * sin, y, radius * cos));
    }
    for (let index = 0; index < segments; index += 1) {
      const a = index * 4, b = a + 4;
      indices.push(a, b, b + 1, a, b + 1, a + 1); // inner weld face
      indices.push(a + 2, a + 3, b + 3, a + 2, b + 3, b + 2); // outer plate face
      indices.push(a + 1, b + 1, b + 3, a + 1, b + 3, a + 3); // top edge
      indices.push(a, a + 2, b + 2, a, b + 2, b); // bottom edge
    }
    indices.push(0, 1, 3, 0, 3, 2);
    const end = segments * 4;
    indices.push(end, end + 2, end + 3, end, end + 3, end + 1);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };
  const saddle = new THREE.Mesh(curvedPlateGeometry(.94, 1.08, 1.22, -1.04, 2.08), blue);
  saddle.position.y = 3.75;
  // Thin continuous fillet-weld beads at both vertical edges of the saddle plate.
  [-1.04, 1.04].forEach(angle => {
    const bead = new THREE.Mesh(new THREE.CylinderGeometry(.047, .047, 1.12, 10), weld);
    bead.position.set(1.10 * Math.sin(angle), 3.75, 1.10 * Math.cos(angle));
    kiosk.add(bead);
  });
  // A slim rear strap spreads the load around part of the column circumference.
  const loadStrap = new THREE.Mesh(curvedPlateGeometry(1.075, 1.16, .20, 1.04, Math.PI * 2 - 2.08), blue);
  loadStrap.position.y = 3.75;

  // The rectangular steel arm starts on the outer face of the saddle and aligns radially with the column.
  const screenYoke = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.6, 1.05), blue);
  screenYoke.position.set(0, 4.535, 1.54);
  screenYoke.rotation.x = .666;
  const armWeld = new THREE.Mesh(new THREE.BoxGeometry(1.86, .10, 1.15), weld);
  armWeld.position.set(0, 3.91, 1.07);
  armWeld.rotation.x = .666;

  const makeGusset = x => {
    const thickness = .16;
    const half = thickness / 2;
    const points = [[3.78, 1.10], [4.24, 1.53], [3.78, 1.62]]; // [y, z], upper edge follows the arm
    const vertices = [];
    [-half, half].forEach(offset => points.forEach(([y, z]) => vertices.push(x + offset, y, z)));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0]);
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, blue);
  };
  // Paired triangular gussets sit beneath the arm, symmetrical about its centre line.
  const gussetLeft = makeGusset(-.72);
  const gussetRight = makeGusset(.72);
  kiosk.add(saddle, loadStrap, armWeld, screenYoke, gussetLeft, gussetRight);

  const display = new THREE.Group();
  display.name = "central-kiosk-display";
  display.position.set(0, 7.10, .42);
  // Negative X rotation tilts the display face up toward the ceiling and the entry.
  display.rotation.x = -.78;
  kiosk.add(display);

  // The rear mounting plate overlaps the angled arm, making one continuous structural joint.
  const rearMount = new THREE.Mesh(new THREE.BoxGeometry(3.85, 1.55, .52), blue);
  rearMount.position.set(0, -2.52, -.27);
  const rearMountBand = new THREE.Mesh(new THREE.BoxGeometry(3.45, .16, .57), red);
  rearMountBand.position.set(0, -2.52, -.55);
  display.add(rearMount, rearMountBand);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(11.6, 8.7, .30), white);
  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(11.15, 8.25, .16), gold);
  goldTrim.position.z = .20;
  const quizCanvas = document.createElement("canvas");
  quizCanvas.width = 2048;
  quizCanvas.height = 1468;
  const quizContext = quizCanvas.getContext("2d");
  const quizTexture = new THREE.CanvasTexture(quizCanvas);
  quizTexture.colorSpace = THREE.SRGBColorSpace;
  quizTexture.minFilter = THREE.LinearFilter;
  quizTexture.magFilter = THREE.LinearFilter;
  const quizMaterial = new THREE.MeshBasicMaterial({ map: quizTexture, side: THREE.DoubleSide });
  const screenFace = new THREE.Mesh(new THREE.BoxGeometry(10.25, 7.35, .12), quizMaterial);
  screenFace.position.z = .30;
  const redFooter = new THREE.Mesh(new THREE.BoxGeometry(10.25, .25, .07), red);
  redFooter.position.set(0, -3.30, .40);
  const statusLight = new THREE.Mesh(new THREE.CircleGeometry(.20, 24), gold);
  statusLight.position.set(0, -2.93, .41);
  display.add(frame, goldTrim, screenFace, redFooter, statusLight);

  const quizState = { view: "welcome", subject: 0, topic: 0, question: 0, score: 0, answered: false, selected: -1 };
  const font = "Roboto, Arial, sans-serif";
  const box = (x, y, w, h, color, radius = 28) => {
    quizContext.fillStyle = color;
    quizContext.beginPath();
    quizContext.roundRect(x, y, w, h, radius);
    quizContext.fill();
  };
  const text = (value, x, y, size, color, align = "left", weight = 700) => {
    quizContext.fillStyle = color;
    quizContext.font = `${weight} ${size}px ${font}`;
    quizContext.textAlign = align;
    quizContext.textBaseline = "middle";
    quizContext.fillText(value, x, y);
  };
  const lines = (value, x, y, width, size, color, lineHeight = size * 1.3, weight = 700) => {
    quizContext.font = `${weight} ${size}px ${font}`;
    const words = value.split(/\s+/);
    const output = [];
    let line = "";
    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (quizContext.measureText(candidate).width > width && line) { output.push(line); line = word; }
      else line = candidate;
    });
    if (line) output.push(line);
    quizContext.fillStyle = color;
    quizContext.textAlign = "left";
    quizContext.textBaseline = "middle";
    output.forEach((entry, index) => quizContext.fillText(entry, x, y + index * lineHeight));
    return output.length;
  };
  const activeTopic = () => KIOSK_QUIZ_DATA[quizState.subject].topics[quizState.topic];
  const currentQuestion = () => activeTopic().questions[quizState.question];
  const header = (label, detail = "") => {
    quizContext.fillStyle = "#005BAA";
    quizContext.fillRect(0, 0, 2048, 166);
    text("KHÔNG GIAN TRUYỀN THỐNG SỐ", 86, 65, 40, "#FFFFFF", "left", 900);
    text(label, 86, 118, 28, "#D6B86F", "left", 800);
    if (detail) text(detail, 1958, 84, 29, "#FFFFFF", "right", 700);
  };
  const redrawQuiz = () => {
    quizContext.fillStyle = "#F7F9FC";
    quizContext.fillRect(0, 0, 2048, 1468);
    if (quizState.view === "welcome") {
      header("KIOSK TƯƠNG TÁC");
      text("TRẮC NGHIỆM KHÁM PHÁ", 1024, 410, 82, "#005BAA", "center", 900);
      text("Chọn môn học · chọn chủ đề · trả lời câu hỏi", 1024, 500, 38, "#243B53", "center", 600);
      box(558, 730, 932, 172, "#A9252B", 38);
      text("BẮT ĐẦU", 1024, 816, 54, "#FFFFFF", "center", 900);
      text("CHẠM VÀO MÀN HÌNH ĐỂ TƯƠNG TÁC", 1024, 1035, 28, "#627D98", "center", 700);
    } else if (quizState.view === "subjects") {
      header("CHỌN MÔN HỌC", "Bước 1 / 3");
      text("Bạn muốn khám phá nội dung nào?", 1024, 286, 49, "#102A43", "center", 800);
      KIOSK_QUIZ_DATA.forEach((subject, index) => {
        const y = 410 + index * 312;
        box(210, y, 1628, 244, index === quizState.subject ? "#E7F2FA" : "#FFFFFF", 34);
        box(250, y + 42, 160, 160, "#005BAA", 26);
        text(subject.shortTitle, 330, y + 123, 46, "#FFFFFF", "center", 900);
        text(subject.title.toUpperCase(), 460, y + 91, 43, "#005BAA", "left", 900);
        text(`${subject.topics.length} CHỦ ĐỀ · ${subject.topics.reduce((sum, topic) => sum + topic.questions.length, 0)} CÂU HỎI`, 460, y + 151, 27, "#52677D", "left", 700);
        text("CHỌN  ›", 1748, y + 123, 30, "#A9252B", "right", 900);
      });
    } else if (quizState.view === "topics") {
      const subject = KIOSK_QUIZ_DATA[quizState.subject];
      header(subject.title.toUpperCase(), "Bước 2 / 3");
      text("CHỌN CHỦ ĐỀ", 108, 267, 49, "#102A43", "left", 900);
      subject.topics.forEach((topic, index) => {
        const y = 355 + index * 256;
        box(108, y, 1832, 204, "#FFFFFF", 30);
        box(144, y + 39, 126, 126, index === quizState.topic ? "#A9252B" : "#005BAA", 22);
        text(String(index + 1).padStart(2, "0"), 207, y + 102, 38, "#FFFFFF", "center", 900);
        text(topic.title.toUpperCase(), 320, y + 78, 38, "#005BAA", "left", 900);
        text(`${topic.questions.length} CÂU HỎI TRẮC NGHIỆM`, 320, y + 135, 26, "#52677D", "left", 700);
        text("BẮT ĐẦU  ›", 1852, y + 102, 29, "#A9252B", "right", 900);
      });
      text("‹  QUAY LẠI", 110, 1320, 28, "#A9252B", "left", 900);
    } else if (quizState.view === "question") {
      const topic = activeTopic();
      const question = currentQuestion();
      header(topic.title.toUpperCase(), `Câu ${quizState.question + 1} / ${topic.questions.length}`);
      box(95, 212, 1858, 232, "#E7F2FA", 28);
      const questionLines = lines(question.question, 146, 292, 1710, 45, "#102A43", 58, 800);
      const answerStart = 470 + Math.max(0, questionLines - 2) * 24;
      quizState.answerStart = answerStart;
      const answerStep = Math.min(184, Math.floor((1260 - answerStart) / question.choices.length));
      question.choices.forEach((choice, index) => {
        const y = answerStart + index * answerStep;
        let fill = "#FFFFFF";
        let accent = "#005BAA";
        if (quizState.answered && index === question.answer) { fill = "#E4F7EB"; accent = "#16803C"; }
        if (quizState.answered && index === quizState.selected && index !== question.answer) { fill = "#FDEBEC"; accent = "#A9252B"; }
        box(95, y, 1858, answerStep - 18, fill, 26);
        box(125, y + 24, 78, 78, accent, 20);
        text(["A", "B", "C", "D"][index], 164, y + 63, 31, "#FFFFFF", "center", 900);
        lines(String(choice).replace(/\.$/,""), 235, y + (answerStep - 18) / 2, 1580, 31, "#102A43", 37, 700);
      });
      if (quizState.answered) {
        const correct = quizState.selected === question.answer;
        text(correct ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC", 110, 1280, 31, correct ? "#16803C" : "#A9252B", "left", 900);
        text(question.explanation, 370, 1280, 25, "#52677D", "left", 600);
        box(1520, 1310, 430, 102, "#A9252B", 24);
        text(quizState.question + 1 === topic.questions.length ? "XEM KẾT QUẢ" : "CÂU TIẾP  ›", 1735, 1361, 25, "#FFFFFF", "center", 900);
      }
    } else {
      const topic = activeTopic();
      header("HOÀN THÀNH", "Kết quả");
      text("KẾT QUẢ CỦA BẠN", 1024, 345, 62, "#005BAA", "center", 900);
      text(`${quizState.score} / ${topic.questions.length}`, 1024, 552, 142, "#A9252B", "center", 900);
      text("SỐ CÂU TRẢ LỜI ĐÚNG", 1024, 666, 30, "#52677D", "center", 800);
      text(quizState.score === topic.questions.length ? "Xuất sắc! Bạn đã nắm rất vững nội dung." : "Hãy thử lại để khám phá thêm kiến thức nhé.", 1024, 790, 34, "#102A43", "center", 700);
      box(388, 980, 600, 132, "#A9252B", 30);
      box(1060, 980, 600, 132, "#005BAA", 30);
      text("LÀM LẠI", 688, 1046, 35, "#FFFFFF", "center", 900);
      text("CHỌN CHỦ ĐỀ", 1360, 1046, 35, "#FFFFFF", "center", 900);
    }
    quizTexture.needsUpdate = true;
    requestRender();
  };
  const resetTopic = () => { quizState.question = 0; quizState.score = 0; quizState.answered = false; quizState.selected = -1; };
  screenFace.userData = {
    kind: "sceneAction",
    action: rayHit => {
      const uv = rayHit?.uv;
      if (!uv) return;
      const x = uv.x * quizCanvas.width;
      const y = (1 - uv.y) * quizCanvas.height;
      if (quizState.view === "welcome") { quizState.view = "subjects"; }
      else if (quizState.view === "subjects") {
        const index = Math.floor((y - 410) / 312);
        if (index >= 0 && index < KIOSK_QUIZ_DATA.length) { quizState.subject = index; quizState.topic = 0; quizState.view = "topics"; }
      } else if (quizState.view === "topics") {
        if (y > 1260) quizState.view = "subjects";
        else { const index = Math.floor((y - 355) / 256); if (index >= 0 && index < KIOSK_QUIZ_DATA[quizState.subject].topics.length) { quizState.topic = index; resetTopic(); quizState.view = "question"; } }
      } else if (quizState.view === "question") {
        const question = currentQuestion();
        const answerStart = quizState.answerStart || 470;
        const answerStep = Math.min(184, Math.floor((1260 - answerStart) / question.choices.length));
        const answerIndex = Math.floor((y - answerStart) / answerStep);
        if (!quizState.answered && answerIndex >= 0 && answerIndex < question.choices.length) { quizState.selected = answerIndex; quizState.answered = true; if (answerIndex === question.answer) quizState.score += 1; }
        else if (quizState.answered && x > 1480 && y > 1280) { if (quizState.question + 1 < activeTopic().questions.length) { quizState.question += 1; quizState.answered = false; quizState.selected = -1; } else quizState.view = "result"; }
      } else if (quizState.view === "result") {
        if (x < 1024 && y > 920) { resetTopic(); quizState.view = "question"; }
        else if (x >= 1024 && y > 920) quizState.view = "topics";
      }
      redrawQuiz();
    }
  };
  registerInteractiveObject(screenFace);
  redrawQuiz();

  const kioskGlow = new THREE.PointLight(0xd6b86f, 2.1, 9, 2);
  kioskGlow.position.set(0, 5.65, 2.4);
  kioskGlow.userData.keepRealLight = true;
  kiosk.add(kioskGlow);
  return kiosk;
}
function createRadialCarpet() {
  if (!carpetMat.map) carpetMat.map = createSoftWalkwayTexture();
}

function createFloorColorUnderlay() {
  if (!carpetMat.map) carpetMat.map = createSoftWalkwayTexture();
  // One continuous foundation is deliberately larger than every wall footprint.
  // It removes background leaks at joins while remaining hidden outside the room
  // by the enclosing architecture.
  const hallFloorR = R_BACK + SOUTH_ENTRY_VEST_DEPTH + WALL_T * 2;
  const ring = new THREE.Shape();
  ring.absarc(0, 0, hallFloorR, 0, Math.PI * 2, false);
  // The opaque central core sits on this surface. Keep the floor continuous
  // underneath it so its tapered base cannot reveal the scene background.

  const roomFloorShape = room => {
    const shape = new THREE.Shape();
    const innerA = projectPointToRadius(room.corners.A.door, hallFloorR);
    const innerB = projectPointToRadius(room.corners.B.door, hallFloorR);
    const backRadius = R_BACK + WALL_T;
    const outerHalfWidth = ROOM_W / 2 + WALL_T;
    const outerA = [
      room.F[0] * backRadius - room.R[0] * outerHalfWidth,
      room.F[1] * backRadius - room.R[1] * outerHalfWidth
    ];
    const outerB = [
      room.F[0] * backRadius + room.R[0] * outerHalfWidth,
      room.F[1] * backRadius + room.R[1] * outerHalfWidth
    ];
    shape.moveTo(innerA[0], innerA[1]);
    addShortArcToShape(shape, innerA, innerB, hallFloorR, 48);
    shape.lineTo(outerB[0], outerB[1]);
    shape.lineTo(outerA[0], outerA[1]);
    shape.closePath();
    return shape;
  };

  const northEast = ROOM_DEFS.goc3;
  const southEast = ROOM_DEFS.goc4;
  const east = new THREE.Shape();
  const eastInnerNorth = projectPointToRadius(northEast.corners.A.door, hallFloorR);
  const eastInnerSouth = projectPointToRadius(southEast.corners.B.door, hallFloorR);
  const eastBackRadius = R_BACK + WALL_T;
  const eastOuterHalfWidth = ROOM_W / 2 + WALL_T;
  const northEastOuterA = [
    northEast.F[0] * eastBackRadius - northEast.R[0] * eastOuterHalfWidth,
    northEast.F[1] * eastBackRadius - northEast.R[1] * eastOuterHalfWidth
  ];
  const northEastOuterB = [
    northEast.F[0] * eastBackRadius + northEast.R[0] * eastOuterHalfWidth,
    northEast.F[1] * eastBackRadius + northEast.R[1] * eastOuterHalfWidth
  ];
  const southEastOuterA = [
    southEast.F[0] * eastBackRadius - southEast.R[0] * eastOuterHalfWidth,
    southEast.F[1] * eastBackRadius - southEast.R[1] * eastOuterHalfWidth
  ];
  const southEastOuterB = [
    southEast.F[0] * eastBackRadius + southEast.R[0] * eastOuterHalfWidth,
    southEast.F[1] * eastBackRadius + southEast.R[1] * eastOuterHalfWidth
  ];
  const eastCurveRadius = R_OUT + WALL_T;
  const southEastCurve = projectPointToRadius(southEast.corners.A.back, eastCurveRadius);
  const northEastCurve = projectPointToRadius(northEast.corners.B.back, eastCurveRadius);
  east.moveTo(eastInnerNorth[0], eastInnerNorth[1]);
  addShortArcToShape(east, eastInnerNorth, eastInnerSouth, hallFloorR, 72);
  east.lineTo(southEastOuterB[0], southEastOuterB[1]);
  east.lineTo(southEastOuterA[0], southEastOuterA[1]);
  east.lineTo(southEastCurve[0], southEastCurve[1]);
  addShortArcToShape(east, southEastCurve, northEastCurve, eastCurveRadius, 48);
  east.lineTo(northEastOuterB[0], northEastOuterB[1]);
  east.lineTo(northEastOuterA[0], northEastOuterA[1]);
  east.closePath();

  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry([ring], 128),
    floorPatchMat
  );
  mesh.name = 'unified-architecture-floor';
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = 0;
  scene.add(mesh);
}

function projectPointToRadius(point, radius) {
  const len = Math.hypot(point[0], point[1]) || 1;
  return [point[0] / len * radius, point[1] / len * radius];
}

function createRoomCeilingBridgePatch(room, y, radiusOut, material = centralCeilingMat) {
  const overlap = .45;
  const halfW = ROOM_W / 2 + WALL_T + overlap;
  const frontR = RING_OUT - overlap;
  const frontA = [
    room.F[0] * frontR + room.R[0] * -halfW,
    room.F[1] * frontR + room.R[1] * -halfW
  ];
  const frontB = [
    room.F[0] * frontR + room.R[0] * halfW,
    room.F[1] * frontR + room.R[1] * halfW
  ];
  const outerA = projectPointToRadius(frontA, radiusOut + overlap);
  const outerB = projectPointToRadius(frontB, radiusOut + overlap);
  const shape = new THREE.Shape();
  shape.moveTo(frontA[0], frontA[1]);
  shape.lineTo(frontB[0], frontB[1]);
  shape.lineTo(outerB[0], outerB[1]);
  addShortArcToShape(shape, outerB, outerA, radiusOut + overlap, 40);
  shape.lineTo(frontA[0], frontA[1]);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 56), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y + .012;
  mesh.renderOrder = 12;
  scene.add(mesh);
  return mesh;
}

function createArcWallSolid(radiusIn, radiusOut, angleStart, angleEnd, color = WALL_BEIGE, opts = {}) {
  // Shape (x,y) = (world_x, world_z) trực tiếp (dùng absarc theo đúng quy ước góc của toàn bộ file).
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radiusOut, angleStart, angleEnd, false);
  shape.absarc(0, 0, radiusIn, angleEnd, angleStart, true);
  shape.closePath();
  // Sink arc walls 0.02 below y=0 so their bottom face does not z-fight the floor mesh.
  const WALL_SINK = 0.02;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: CEIL_H + CEILING_JOIN_OVERLAP + WALL_SINK, bevelEnabled: false, curveSegments: 48 });
  // rotateX(-90°) đưa trục extrude (Z) thành chiều cao (Y, 0..CEIL_H) nhưng đồng thời đảo dấu
  // trục Z gốc (Y_shape -> -Z_world). scale(1,1,-1) bù lại để giữ đúng vị trí world_z đã tính.
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, 1, -1);
  geo.translate(0, -WALL_SINK, 0);
  const wallMaterial = color?.isMaterial
    ? color
    : new THREE.MeshStandardMaterial({
      color, roughness: .86, emissive: WALL_EMISSIVE, emissiveIntensity: .12,
      side: THREE.DoubleSide, transparent: false, opacity: 1, depthTest: true, depthWrite: true
    });
  const mesh = new THREE.Mesh(geo, wallMaterial);
  scene.add(mesh);
  if (opts.trims === false) return mesh;
  // One cap sits directly above the white base tiles; the other remains at ceiling level.
  [1.12, CEIL_H - .1].forEach(y => {
    [
      [radiusIn - .04, radiusIn + .08],
      [radiusOut - .08, radiusOut + .04]
    ].forEach(([trimInnerR, trimOuterR]) => {
      const trimShape = new THREE.Shape();
      trimShape.absarc(0, 0, trimOuterR, angleStart, angleEnd, false);
      trimShape.absarc(0, 0, trimInnerR, angleEnd, angleStart, true);
      trimShape.closePath();
      const trimGeo = new THREE.ExtrudeGeometry(trimShape, { depth: .18, bevelEnabled: false, curveSegments: 48 });
      trimGeo.rotateX(-Math.PI / 2);
      trimGeo.scale(1, 1, -1);
      trimGeo.translate(0, y, 0);
      scene.add(new THREE.Mesh(trimGeo, trimMat));
    });
  });

  // Approximate the curved perimeter with individual tangent-aligned white
  // rectangular tiles, retaining the same grout joint as straight walls.
  const tileHeight = 1.05;
  const meanRadius = (radiusIn + radiusOut) / 2;
  const arcLength = Math.abs(angleEnd - angleStart) * meanRadius;
  const tileCount = Math.max(1, Math.ceil(arcLength / 3.15));
  const tileArcLength = arcLength / tileCount;
  [radiusIn - .035, radiusOut + .035].forEach(tileRadius => {
    for (let index = 0; index < tileCount; index++) {
      const angle = angleStart + (angleEnd - angleStart) * ((index + .5) / tileCount);
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(.06, tileHeight, Math.max(.2, tileArcLength - .055)),
        baseboardMat
      );
      tile.position.set(Math.cos(angle) * tileRadius, tileHeight / 2, Math.sin(angle) * tileRadius);
      tile.rotation.y = -angle;
      scene.add(tile);
    }
  });
  return mesh;
}

function angleOf(p) { return Math.atan2(p[1], p[0]); }

// Trả về [start,end] sao cho end-start luôn là cung NGẮN (ngược kim đồng hồ) giữa 2 góc —
// xử lý đúng cả trường hợp cung ngắn đi qua ranh giới ±180° (ví dụ khoảng nối phía Tây).
function shortArcOrder(a1, a2) {
  let start = Math.min(a1, a2), end = Math.max(a1, a2);
  if (end - start > Math.PI) [start, end] = [end, start + Math.PI * 2];
  return [start, end];
}
function addLongWallHorizontalTrims(parent, position, rotationY, length, thickness, height = CEIL_H) {
  const trimGroup = new THREE.Group();
  trimGroup.position.set(...position);
  trimGroup.rotation.y = rotationY;
  parent.add(trimGroup);
  [-1, 1].forEach(faceSign => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(.12, .18, length), trimMat);
    trim.position.set(faceSign * (thickness / 2 + .03), height - .1, 0);
    trimGroup.add(trim);
  });
  return trimGroup;
}

function createStraightGapWall(pA, pB, height = CEIL_H, thickness = WALL_T, color = WALL_BEIGE, endCapExtra = thickness) {
  const wallMaterial = color?.isMaterial
    ? color
    : new THREE.MeshStandardMaterial({
      color, roughness: .86, emissive: WALL_EMISSIVE, emissiveIntensity: .12,
      side: THREE.DoubleSide, transparent: false, opacity: 1, depthTest: true, depthWrite: true
    });
  const { wall, trimGroup } = createStraightWallParts({
    from: pA,
    to: pB,
    height,
    thickness,
    endCapExtra,
    material: wallMaterial,
    trimMaterial: trimMat,
    baseboardMaterial: baseboardMat,
    ceilingJoinOverlap: CEILING_JOIN_OVERLAP
  });
  scene.add(wall);
  scene.add(trimGroup);
  return wall;
}

function createSouthEntranceWoodenDoor(pA, pB, height = CEIL_H, thickness = WALL_T) {
  const spanX = pB[0] - pA[0];
  const spanZ = pB[1] - pA[1];
  const span = Math.hypot(spanX, spanZ);
  if (span < .1) return;

  const group = new THREE.Group();
  group.position.set((pA[0] + pB[0]) / 2, 0, (pA[1] + pB[1]) / 2);
  group.rotation.y = Math.atan2(spanZ, spanX);
  scene.add(group);

  const frameWood = new THREE.MeshStandardMaterial({ color: 0x3c1d0e, roughness: .42, metalness: .04 });
  const doorWood = new THREE.MeshStandardMaterial({ color: 0x70401f, roughness: .48, metalness: .03 });
  const panelWood = new THREE.MeshStandardMaterial({ color: 0x9a6234, roughness: .44, metalness: .02 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79a45, roughness: .28, metalness: .72 });
  const frameDepth = thickness + .14;
  const headerHeight = .62;
  const sillHeight = .24;
  const doorHeight = height - headerHeight - sillHeight;
  const framePostWidth = .34;
  const clearWidth = span - framePostWidth * 2;
  const leafGap = .18;
  const leafWidth = (clearWidth - leafGap) / 2;
  const leafDepth = Math.min(.26, thickness * .42);

  const add = (geometry, material, x, y, z) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // No vertical jambs at floor level: the white base-tile run can meet cleanly
  // at the starting entrance without being visually blocked.
  add(new THREE.BoxGeometry(clearWidth, headerHeight, frameDepth), frameWood, 0, height - headerHeight / 2, 0);
  add(new THREE.BoxGeometry(clearWidth, sillHeight, frameDepth), frameWood, 0, sillHeight / 2, 0);

  [-1, 1].forEach(side => {
    const leafCenterX = side * (leafGap / 2 + leafWidth / 2);
    add(new THREE.BoxGeometry(leafWidth, doorHeight, leafDepth), doorWood, leafCenterX, sillHeight + doorHeight / 2, 0);

    // Hai pano nổi bằng gỗ ở cả hai mặt cánh cửa.
    [-1, 1].forEach(face => {
      const panelDepth = leafDepth / 2 + .028;
      [doorHeight * .29, doorHeight * .71].forEach(offsetY => {
        add(
          new THREE.BoxGeometry(leafWidth - .58, doorHeight * .31, .052),
          panelWood,
          leafCenterX,
          sillHeight + offsetY,
          face * panelDepth
        );
      });
    });
  });

  // Tay nắm đồng đặt ở mép gặp nhau của hai cánh, có mặt trong và mặt ngoài.
  [-1, 1].forEach(face => {
    [-1, 1].forEach(side => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .78, 16), brass);
      handle.position.set(side * .23, sillHeight + doorHeight * .51, face * (leafDepth / 2 + .09));
      handle.castShadow = true;
      group.add(handle);
    });
  });
}

function createEntranceWedge() {
  // Main entry: the gap directly between the southeast and southwest room walls.
  createConnectorNeckPatch(SOUTH, -0.09, floorPatchMat, RING_OUT + .05);
  createInsetConnectorNeckCeilingPatch(SOUTH, CEIL_H + .3, centralCeilingMat, RING_OUT + WALL_T, WALL_T);

  const wallA = SOUTH.doorA;
  const wallB = SOUTH.doorB;
  const spanX = wallB[0] - wallA[0];
  const spanZ = wallB[1] - wallA[1];
  const span = Math.hypot(spanX, spanZ) || 1;
  const ux = spanX / span;
  const uz = spanZ / span;
  const doorHalf = Math.min(6, span * .22);
  const center = [(wallA[0] + wallB[0]) / 2, (wallA[1] + wallB[1]) / 2];
  const doorA = [center[0] - ux * doorHalf, center[1] - uz * doorHalf];
  const doorB = [center[0] + ux * doorHalf, center[1] + uz * doorHalf];

  createStraightGapWall(wallA, doorA, CEIL_H, WALL_T, WALL_BEIGE);
  createStraightGapWall(doorB, wallB, CEIL_H, WALL_T, WALL_BEIGE);

  const headerH = .6;
  const header = new THREE.Mesh(new THREE.BoxGeometry(doorHalf * 2 + WALL_T * 2, headerH, WALL_T), trimMat);
  header.position.set(center[0], CEIL_H - headerH / 2, center[1]);
  header.rotation.y = Math.atan2(-uz, ux);
  scene.add(header);

  const centerRadius = Math.hypot(center[0], center[1]) || 1;
  const outwardX = center[0] / centerRadius;
  const outwardZ = center[1] / centerRadius;
  const outerA = [doorA[0] + outwardX * SOUTH_ENTRY_VEST_DEPTH, doorA[1] + outwardZ * SOUTH_ENTRY_VEST_DEPTH];
  const outerB = [doorB[0] + outwardX * SOUTH_ENTRY_VEST_DEPTH, doorB[1] + outwardZ * SOUTH_ENTRY_VEST_DEPTH];

  // Short, visible vertical caps at the inner south gateway: these are the
  // edges seen when looking outward from the central circle.
  // Match the base-tile system: 1.05 m tiles plus the full 0.14 m top cap.
  // Ending flush with the cap's upper edge makes the vertical trim read as a
  // continuous continuation of the skirting detail.
  const baseTileCapHeight = 1.05 + .14;
  [doorA, doorB].forEach(point => {
    const baseTileJamb = new THREE.Mesh(new THREE.BoxGeometry(.22, baseTileCapHeight, WALL_T + .12), trimMat);
    baseTileJamb.position.set(point[0], baseTileCapHeight / 2, point[1]);
    baseTileJamb.rotation.y = Math.atan2(-uz, ux);
    scene.add(baseTileJamb);
  });

  createStraightGapWall(doorA, outerA, CEIL_H, WALL_T, WALL_BEIGE);
  createStraightGapWall(doorB, outerB, CEIL_H, WALL_T, WALL_BEIGE);
  createSouthEntranceWoodenDoor(outerA, outerB, CEIL_H, WALL_T);
  createFlatFloorPatch([doorA, doorB, outerB, outerA]);

  const vestCenterX = center[0] + outwardX * SOUTH_ENTRY_VEST_DEPTH / 2;
  const vestCenterZ = center[1] + outwardZ * SOUTH_ENTRY_VEST_DEPTH / 2;
  const vestCarpet = new THREE.Mesh(new THREE.PlaneGeometry(doorHalf * 2 - .25, SOUTH_ENTRY_VEST_DEPTH - .25), carpetMat);
  vestCarpet.rotation.x = -Math.PI / 2;
  vestCarpet.position.set(vestCenterX, .055, vestCenterZ);
  scene.add(vestCarpet);

  createDropCeiling(doorHalf * 2, SOUTH_ENTRY_VEST_DEPTH, CEIL_H + .5, vestCenterZ, scene, vestCenterX, {
    surfaceMat: centralCeilingMat,
    coveColor: LIGHT_AMBER_COVE
  });
}
function createSolidConnector(connector) {
  const ceilingPatchMat = centralCeilingMat;
  createConnectorNeckPatch(connector, -0.09, floorPatchMat, RING_OUT + .05);
  createConnectorNeckPatch(connector, CEIL_H + .3, ceilingPatchMat, RING_OUT + WALL_T);
  createConnectorSurfacePatch(connector, -0.09, floorPatchMat);
  createConnectorSurfacePatch(connector, CEIL_H + .3, ceilingPatchMat);
  createStraightGapWall(connector.doorA, connector.doorB, CEIL_H, WALL_T, WALL_BEIGE);
  // The two side runs are already supplied by the adjoining room shells.
  // Rebuilding them here puts coplanar walls in the same place and causes
  // visible z-fighting, especially at the west and north connectors.
  const [start, end] = shortArcOrder(angleOf(connector.backA), angleOf(connector.backB));
  createArcWallSolid(R_OUT - .02, R_OUT + WALL_T, start, end, WALL_BEIGE);
}

function createOpenRegionConnector(connector) {
  createConnectorNeckPatch(connector, -0.09, floorPatchMat, RING_OUT + .05);
  createConnectorNeckPatch(connector, CEIL_H + .3, centralCeilingMat, RING_OUT + WALL_T);
  createConnectorSurfacePatch(connector, -0.09, floorPatchMat);
  createConnectorSurfacePatch(connector, CEIL_H + .3, centralCeilingMat);
  const [start, end] = shortArcOrder(angleOf(connector.backA), angleOf(connector.backB));
  createArcWallSolid(R_OUT - .02, R_OUT + WALL_T, start, end, WALL_BEIGE);
}
function createMergedEastRoomIdentity() {
  // One shared identity replaces the visual impression of two separate rooms.
  createRaisedTitleSign(
    "HỘI NHẬP QUỐC TẾ",
    [R_OUT - WALL_T - .18, CEIL_H - 2.35, 0],
    [16.4, 2.10],
    -Math.PI / 2
  );
  addTextPanel(
    "KẾT NỐI TRI THỨC · MỞ RỘNG TẦM NHÌN · CÙNG KIẾN TẠO TƯƠNG LAI",
    [R_OUT - WALL_T - .12, CEIL_H - 4.35, 0],
    [15.2, .5],
    -Math.PI / 2,
    { size: 18, color: "#334155", background: "transparent", border: false, weight: 800, width: 1800, height: 180 }
  );
}
function createMergedEastDropCeiling(outline) {
  const group = new THREE.Group();
  group.name = "merged-east-drop-ceiling";
  scene.add(group);

  const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];
  const polygonArea = outline.reduce((sum, point, index) => {
    const next = outline[(index + 1) % outline.length];
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0) / 2;
  const orientation = polygonArea >= 0 ? 1 : -1;
  const rimWidth = Math.min(2.35, ROOM_W / 5);

  const innerOutline = outline.map((point, index) => {
    const previous = outline[(index - 1 + outline.length) % outline.length];
    const next = outline[(index + 1) % outline.length];
    const edgeIn = [point[0] - previous[0], point[1] - previous[1]];
    const edgeOut = [next[0] - point[0], next[1] - point[1]];
    const lenIn = Math.hypot(edgeIn[0], edgeIn[1]) || 1;
    const lenOut = Math.hypot(edgeOut[0], edgeOut[1]) || 1;
    const dirIn = [edgeIn[0] / lenIn, edgeIn[1] / lenIn];
    const dirOut = [edgeOut[0] / lenOut, edgeOut[1] / lenOut];
    const normalFor = ([dx, dz]) => orientation > 0 ? [-dz, dx] : [dz, -dx];
    const normalIn = normalFor(dirIn);
    const normalOut = normalFor(dirOut);
    const lineA = [point[0] + normalIn[0] * rimWidth, point[1] + normalIn[1] * rimWidth];
    const lineB = [point[0] + normalOut[0] * rimWidth, point[1] + normalOut[1] * rimWidth];
    const denominator = cross2(dirIn, dirOut);
    if (Math.abs(denominator) > 1e-5) {
      const delta = [lineB[0] - lineA[0], lineB[1] - lineA[1]];
      const t = cross2(delta, dirOut) / denominator;
      const intersection = [lineA[0] + dirIn[0] * t, lineA[1] + dirIn[1] * t];
      if (Math.hypot(intersection[0] - point[0], intersection[1] - point[1]) <= rimWidth * 3) return intersection;
    }
    const normalSum = [normalIn[0] + normalOut[0], normalIn[1] + normalOut[1]];
    const normalLength = Math.hypot(normalSum[0], normalSum[1]) || 1;
    return [
      point[0] + normalSum[0] / normalLength * rimWidth,
      point[1] + normalSum[1] / normalLength * rimWidth
    ];
  });

  const addLoopToPath = (path, points) => {
    path.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, z]) => path.lineTo(x, z));
    path.closePath();
  };
  const makeShape = points => {
    const shape = new THREE.Shape();
    addLoopToPath(shape, points);
    return shape;
  };
  const orientExtrudedCeiling = geometry => {
    geometry.rotateX(-Math.PI / 2);
    geometry.scale(1, 1, -1);
    return geometry;
  };

  const rimShape = makeShape(outline);
  const innerHole = new THREE.Path();
  addLoopToPath(innerHole, innerOutline);
  rimShape.holes.push(innerHole);

  const mergedCeilingRimMaterial = new THREE.MeshStandardMaterial({
    color: CEILING_BEIGE,
    roughness: .9,
    emissive: LIGHT_AMBER_PALE,
    emissiveIntensity: .08,
    side: THREE.DoubleSide
  });
  const mergedCeilingCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: .88,
    emissive: LIGHT_AMBER_PALE,
    emissiveIntensity: .1,
    side: THREE.DoubleSide
  });
  const rim = new THREE.Mesh(
    orientExtrudedCeiling(new THREE.ExtrudeGeometry(rimShape, { depth: .4, bevelEnabled: false, curveSegments: 48 })),
    mergedCeilingRimMaterial
  );
  rim.position.y = CEIL_H + .3;
  group.add(rim);

  const core = new THREE.Mesh(
    orientExtrudedCeiling(new THREE.ExtrudeGeometry(makeShape(innerOutline), { depth: .12, bevelEnabled: false, curveSegments: 48 })),
    mergedCeilingCoreMaterial
  );
  core.position.y = CEIL_H + .82;
  group.add(core);

  // The underside of the extruded polygon does not react to point lights as
  // reliably as a room ceiling's BoxGeometry underside. This coplanar
  // downward-facing skin restores the same light-receiving surface without
  // changing the unified ceiling silhouette.
  const lightReceivingCore = new THREE.Mesh(
    new THREE.ShapeGeometry(makeShape(innerOutline), 48),
    mergedCeilingCoreMaterial
  );
  lightReceivingCore.rotation.x = Math.PI / 2;
  lightReceivingCore.position.y = CEIL_H + .818;
  group.add(lightReceivingCore);

  // One continuous cove replaces the four straight strips of an individual
  // rectangular room, preserving that lighting language around the unified
  // East ceiling perimeter.
  const covePath = new THREE.CurvePath();
  innerOutline.forEach((point, index) => {
    const next = innerOutline[(index + 1) % innerOutline.length];
    covePath.add(new THREE.LineCurve3(
      new THREE.Vector3(point[0], 0, point[1]),
      new THREE.Vector3(next[0], 0, next[1])
    ));
  });
  const coveGlowMaterial = new THREE.MeshBasicMaterial({
    color: LIGHT_AMBER_COVE,
    transparent: true,
    opacity: .2,
    depthWrite: false,
    toneMapped: false
  });
  const coveCoreMaterial = new THREE.MeshBasicMaterial({
    color: LIGHT_AMBER_COVE,
    transparent: true,
    opacity: .74,
    depthWrite: false,
    toneMapped: false
  });
  const coveGlow = new THREE.Mesh(new THREE.TubeGeometry(covePath, 192, .17, 8, true), coveGlowMaterial);
  const coveCore = new THREE.Mesh(new THREE.TubeGeometry(covePath, 192, .0225, 8, true), coveCoreMaterial);
  [coveGlow, coveCore].forEach(cove => {
    cove.position.y = CEIL_H + .827;
    cove.renderOrder = 18;
    group.add(cove);
  });

  // Exact fixture palette and light response used by createDropCeiling().
  const ringMaterial = new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_RING, toneMapped: false });
  const lampFaceMaterial = new THREE.MeshBasicMaterial({
    color: LIGHT_AMBER_SOFT,
    transparent: true,
    opacity: .92,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const northCenter = ROOM_DEFS.goc3.center;
  const southCenter = ROOM_DEFS.goc4.center;
  const mergedCenter = [
    (northCenter[0] + southCenter[0]) / 2,
    (northCenter[1] + southCenter[1]) / 2
  ];
  // The rear wall of the merged East room is the outward side: away from the
  // building centre through the midpoint of its two original room bays.
  const eastRearDirection = [mergedCenter[0], mergedCenter[1]];
  const eastRearDirectionLength = Math.hypot(eastRearDirection[0], eastRearDirection[1]) || 1;
  const middleLampTowardRearWall = [
    mergedCenter[0] + eastRearDirection[0] / eastRearDirectionLength * ROOM_D * .28,
    mergedCenter[1] + eastRearDirection[1] / eastRearDirectionLength * ROOM_D * .28
  ];
  const connectorPoints = MERGED_REGION_CONNECTOR
    ? [
      MERGED_REGION_CONNECTOR.doorA,
      MERGED_REGION_CONNECTOR.doorB,
      MERGED_REGION_CONNECTOR.backA,
      MERGED_REGION_CONNECTOR.backB
    ]
    : [mergedCenter];
  const connectorCenter = connectorPoints.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1]],
    [0, 0]
  ).map(value => value / connectorPoints.length);
  // The startup-idea pinboard is on the rear wall of Góc 5.  Move only the
  // connector-bay lamp toward that real exhibit direction.
  const startupBoardRoom = ROOM_DEFS.goc5;
  const startupBoardCenter = [
    startupBoardRoom.F[0] * R_BACK,
    startupBoardRoom.F[1] * R_BACK
  ];
  const towardStartupBoard = [
    startupBoardCenter[0] - connectorCenter[0],
    startupBoardCenter[1] - connectorCenter[1]
  ];
  const towardStartupBoardLength = Math.hypot(towardStartupBoard[0], towardStartupBoard[1]) || 1;
  const middleLampTowardBoardOffset = ROOM_D * .08;
  const middleConnectorLampCenter = [
    connectorCenter[0] + towardStartupBoard[0] / towardStartupBoardLength * middleLampTowardBoardOffset,
    connectorCenter[1] + towardStartupBoard[1] / towardStartupBoardLength * middleLampTowardBoardOffset
  ];
  // The merged east room retains three ceiling bays: north wing, connector,
  // and south wing.  Each lamp is anchored to its own bay centre rather than
  // being distributed across the combined footprint.
  const eastR1 = Math.min(1.18, ROOM_W / 6, ROOM_D / 6);
  const eastR2 = eastR1 * .75;
  // Two original room lamps plus one matching fixture at their exact midpoint.
  const eastLampCenters = [northCenter, middleLampTowardRearWall, southCenter];
  eastLampCenters.forEach(([x, z], index) => {
    const lampGroup = new THREE.Group();
    lampGroup.name = `merged-east-ceiling-lamp-${index + 1}`;
    // Same mounting height as the original independent-room drop ceilings.
    lampGroup.position.set(x, CEIL_H + .5, z);
    group.add(lampGroup);

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(eastR1, .065, 16, 72), ringMaterial);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.set(-eastR1 * .45, -.7, 0);
    lampGroup.add(outerRing);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(eastR2, .065, 16, 72), ringMaterial);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.set(eastR1 * .42, -.88, 0);
    lampGroup.add(innerRing);
    // Đĩa phát sáng amber — kích thước và material đồng nhất với pairLightSpot của createDropCeiling.
    const lampFace = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(.22, eastR2 * .22), 32),
      lampFaceMaterial
    );
    lampFace.rotation.x = Math.PI / 2;
    lampFace.position.set(0, -.72, 0);
    lampGroup.add(lampFace);

    const lampGlow = new THREE.PointLight(LIGHT_AMBER, 68, Math.max(ROOM_W, ROOM_D) * 1.28, 1.45);
    lampGlow.position.set(0, -1.15, 0);
    lampGlow.userData.keepRealLight = true;
    lampGroup.add(lampGlow);

  });
}
function createMergedEastRoom() {
  buildMergedEastRoom({
    scene,
    roomDefs: ROOM_DEFS,
    connector: MERGED_REGION_CONNECTOR,
    createDiagonalRoom,
    angleOf,
    outerRadius: R_OUT,
    wallThickness: WALL_T,
    ceilingHeight: CEIL_H,
    floorMaterial: floorPatchMat,
    // Keep the east room's straight middle walls and curved perimeter on the
    // same material instance as the surrounding room wall faces.
    wallMaterial: innerWallMat,
    createFlatFloorPatch,
    createDropCeiling: createMergedEastDropCeiling,
    createStraightGapWall,
    buildExhibits: parent => buildInternationalIntegrationRoom({
      parent, roomDefs: ROOM_DEFS, renderer, addTextPanel, registerArtifact,
      registerInteractive: registerInteractiveObject,
      registerMediaController: registerGoc1MediaController,
      requestRender,
      setVideoActive: active => { hasActiveVideoTexture = active; requestRender(); }
    })
  });
}
function createClosedConnectors() {
  createSolidConnector(NORTH_RECESSED);
  EAST_W.filter(connector => connector !== MERGED_REGION_CONNECTOR).forEach(createSolidConnector);
  // The merged east room builds its own continuous floor, ceiling, and exterior perimeter.
}

function createOrientationScreen(position, rotationY) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  scene.add(group);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 3.9, .18),
    new THREE.MeshStandardMaterial({ color: 0xd6b86f, roughness: .32, metalness: .46 })
  );
  group.add(frame);
  const screen = addTextPanel("S� �? �?NH H�?NG\n4 KH�NG GIAN CH? �?", [0, 0, .11], [7.9, 3.35], 0, {
    size: 32, color: "#172032", background: "#f8fafc", border: true, accent: "#6f8293",
    weight: 900, wrap: true, width: 1200, height: 620, maxWidth: 1000, lineHeight: 48
  }, group);
  const bundle = getPlaceholderTexture({ kind: "doc", title: "So do dinh huong" }, "#6f8293");
  const artId = registerArtifact({
    title: "So do dinh huong",
    description: "Bang dinh huong trung tam cho Chu de 4.",
    group: "Dinh huong",
    image: bundle.dataUrl
  });
  screen.userData = { kind: "artifact", id: artId };
  registerInteractiveObject(screen);
  return group;
}

function connectorFacePose(pA, pB) {
  const midX = (pA[0] + pB[0]) / 2;
  const midZ = (pA[1] + pB[1]) / 2;
  const dx = pB[0] - pA[0];
  const dz = pB[1] - pA[1];
  const len = Math.hypot(dx, dz) || 1;
  let nx = -dz / len;
  let nz = dx / len;
  if (nx * -midX + nz * -midZ < 0) { nx *= -1; nz *= -1; }
  const rotationY = Math.atan2(nx, nz);
  return {
    rotationY,
    at(y, offset = .08, along = 0) {
      return [midX + nx * offset + dx / len * along, y, midZ + nz * offset + dz / len * along];
    }
  };
}

function createNorthOrientationWall() {
  const northFace = connectorFacePose(NORTH_RECESSED.doorA, NORTH_RECESSED.doorB);
  const northPanelOffset = WALL_T + .1;
  const northSignH = 4.45;
  const northLogoR = 1.95;
  const northRowH = Math.max(northSignH, northLogoR * 2);
  // Lift the title-and-logo row as a single unit by 10%, preserving its
  // horizontal alignment and the spacing between the three elements.
  const northRowY = (CEIL_H - .1 - northRowH * .7 - CEIL_H * .1) * 1.1;
  createRaisedTitleSign("H\u1ED8I NH\u1EACP - S\u00C1NG T\u1EA0O\nTI\u00CAN PHONG", northFace.at(northRowY, northPanelOffset), [22.5, northSignH + .5], northFace.rotationY);
  createLayeredLogoMark("./image/HNUE_logo.png", northFace.at(northRowY, northPanelOffset + .14, -15.15), northLogoR, northFace.rotationY);
  createLayeredLogoMark("./image/doan_logo.png", northFace.at(northRowY, northPanelOffset + .14, 15.15), northLogoR, northFace.rotationY);
}

function createCentralSideQuoteWall(wall) {
  const room = ROOM_DEFS[wall.key];
  const connector = CONNECTORS.find(c => c.dir === wall.connectorDir && (c.a === wall.key || c.b === wall.key));
  if (!connector) return;
  const pose = connectorFacePose(connector.doorA, connector.doorB);
  const panelOffset = WALL_T + .08;
  const lane = connector.a === wall.key ? -3.95 : 3.95;
  addTextPanel(wall.quote, pose.at(CEIL_H * .52, panelOffset, lane), [3.35, 2.2], pose.rotationY, {
    size: 22, color: "#172032", background: "#f4f7f9", border: true, accent: "#d6b86f",
    weight: 900, wrap: true, width: 980, height: 620, maxWidth: 760, lineHeight: 32,
    shadowColor: "rgba(0,0,0,.2)", shadowBlur: 4, shadowOffsetY: 3
  });
  addTextPanel(wall.author, pose.at(CEIL_H * .34, panelOffset + .02, lane), [2.45, .38], pose.rotationY, {
    size: 17, color: "#d6b86f", background: "transparent", weight: 900, wrap: true, width: 760, height: 170, maxWidth: 700, lineHeight: 26
  });
  if (SHOW_FRAME_NAMEPLATES) {
      addTextPanel(`${wall.arrow} ${room.label} � ${room.title}`, pose.at(LOW_TITLE_STRIP_Y, panelOffset + .04, lane), [3.1, .42], pose.rotationY, {
      size: 15, color: "#172032", background: "#f4f7f9", border: true, accent: room.accent,
      weight: 900, wrap: true, width: 880, height: 170, maxWidth: 760, lineHeight: 24
    });
  }
}

function createConnectorLedStrip(connector) {
  const x = (connector.doorA[0] + connector.doorB[0]) / 2;
  const z = (connector.doorA[1] + connector.doorB[1]) / 2;
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(.12, CEIL_H * .72, .08),
    new THREE.MeshBasicMaterial({ color: 0xd6b86f })
  );
  led.position.set(x, CEIL_H * .46, z);
  led.rotation.y = Math.atan2(connector.doorB[0] - connector.doorA[0], connector.doorB[1] - connector.doorA[1]);
  scene.add(led);
  return led;
}

function createLeadBoardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 1240;
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, "#fffef9");
  background.addColorStop(1, "#f7f0e3");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#7a293a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,255,255,.28)";
  ctx.shadowBlur = 8;
  ctx.font = "800 98px Roboto, Arial, sans-serif";
  ctx.fillText("L\u1eddi d\u1eabn t\u1ed5ng qu\u00e1t:", canvas.width / 2, 128);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(192,155,93,.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width * .18, 208);
  ctx.lineTo(canvas.width * .82, 208);
  ctx.stroke();
  ctx.fillStyle = "#1f1713";
  ctx.strokeStyle = "rgba(255,255,255,.92)";
  ctx.lineWidth = 5;
  ctx.shadowColor = "rgba(75,45,28,.20)";
  ctx.shadowBlur = 5;
  ctx.font = "800 72px Roboto, Arial, sans-serif";
  const words = "\u004C\u1ECB\u0063\u0068\u0020\u0073\u1EED\u0020\u0110\u006F\u00E0\u006E\u0020\u0054\u0068\u0061\u006E\u0068\u0020\u006E\u0069\u00EA\u006E\u0020\u0054\u0072\u01B0\u1EDD\u006E\u0067\u0020\u0110\u1EA1\u0069\u0020\u0068\u1ECD\u0063\u0020\u0053\u01B0\u0020\u0070\u0068\u1EA1\u006D\u0020\u0048\u00E0\u0020\u004E\u1ED9\u0069\u0020\u006B\u0068\u00F4\u006E\u0067\u0020\u0063\u0068\u1EC9\u0020\u006C\u00E0\u0020\u0064\u00F2\u006E\u0067\u0020\u0063\u0068\u1EA3\u0079\u0020\u0063\u1EE7\u0061\u0020\u0074\u0068\u1EDD\u0069\u0020\u0067\u0069\u0061\u006E\u002C\u0020\u006D\u00E0\u0020\u006C\u00E0\u0020\u0068\u00E0\u006E\u0068\u0020\u0074\u0072\u00EC\u006E\u0068\u0020\u0063\u1EE7\u0061\u0020\u006E\u0068\u1EEF\u006E\u0067\u0020\u0074\u0068\u1EBF\u0020\u0068\u1EC7\u0020\u0074\u0072\u00ED\u0020\u0074\u0068\u1EE9\u0063\u0020\u0074\u0072\u1EBB\u0020\u006D\u0061\u006E\u0067\u0020\u0074\u0072\u006F\u006E\u0067\u0020\u006D\u00EC\u006E\u0068\u0020\u006C\u00FD\u0020\u0074\u01B0\u1EDF\u006E\u0067\u002C\u0020\u0074\u0072\u00E1\u0063\u0068\u0020\u006E\u0068\u0069\u1EC7\u006D\u0020\u0076\u00E0\u0020\u006B\u0068\u00E1\u0074\u0020\u0076\u1ECD\u006E\u0067\u0020\u0063\u1ED1\u006E\u0067\u0020\u0068\u0069\u1EBF\u006E\u002E\u0020\u0054\u1EEB\u0020\u0067\u0069\u1EA3\u006E\u0067\u0020\u0111\u01B0\u1EDD\u006E\u0067\u0020\u0111\u1EBF\u006E\u0020\u0074\u0068\u1EF1\u0063\u0020\u0074\u0069\u1EC5\u006E\u002C\u0020\u0074\u1EEB\u0020\u0063\u0068\u0069\u1EBF\u006E\u0020\u0074\u0072\u0061\u006E\u0068\u0020\u0111\u1EBF\u006E\u0020\u0068\u006F\u00E0\u0020\u0062\u00EC\u006E\u0068\u002C\u0020\u0074\u0075\u1ED5\u0069\u0020\u0074\u0072\u1EBB\u0020\u0053\u01B0\u0020\u0070\u0068\u1EA1\u006D\u0020\u006C\u0075\u00F4\u006E\u0020\u0111\u1ED3\u006E\u0067\u0020\u0068\u00E0\u006E\u0068\u0020\u0063\u00F9\u006E\u0067\u0020\u0064\u00E2\u006E\u0020\u0074\u1ED9\u0063\u0020\u2013\u0020\u0068\u1ECD\u0063\u0020\u0074\u1EAD\u0070\u002C\u0020\u0068\u00E0\u006E\u0068\u0020\u0111\u1ED9\u006E\u0067\u0020\u0076\u00E0\u0020\u006C\u0061\u006E\u0020\u0074\u1ECF\u0061\u0020\u0067\u0069\u00E1\u0020\u0074\u0072\u1ECB\u002E".split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > 1840 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.forEach((item, index) => {
    const y = 310 + index * 94;
    ctx.strokeText(item, canvas.width / 2, y);
    ctx.fillText(item, canvas.width / 2, y);
  });
  ctx.shadowBlur = 0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createGeneralLeadBoard(connector) {
  const pose = connectorFacePose(connector.doorA, connector.doorB);
  const wallWidth = dist(connector.doorA, connector.doorB);
  const frameW = wallWidth * .8;
  const frameH = frameW * (7.55 / 14.1);
  const centerY = CEIL_H * .50;
  const group = new THREE.Group();
  group.position.set(...pose.at(centerY, WALL_T + .12));
  group.rotation.y = pose.rotationY;
  scene.add(group);
  const addFrameBox = (size, position, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0xfffef9, roughness: .76 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xb89262, roughness: .68, metalness: .04 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xc09b5d, roughness: .32, metalness: .48 });
  addFrameBox([frameW, frameH, .08], [0, 0, .02], panelMaterial);
  [[frameW + .36, .17, 0, frameH / 2, .11], [frameW + .36, .17, 0, -frameH / 2, .11], [.17, frameH + .36, -frameW / 2, 0, .11], [.17, frameH + .36, frameW / 2, 0, .11]].forEach(item => addFrameBox([item[0], item[1], .14], [item[2], item[3], item[4]], woodMaterial));
  const innerW = frameW - .78;
  const innerH = frameH - .78;
  [[innerW, .07, 0, innerH / 2, .17], [innerW, .07, 0, -innerH / 2, .17], [.07, innerH, -innerW / 2, 0, .17], [.07, innerH, innerW / 2, 0, .17]].forEach(item => addFrameBox([item[0], item[1], .12], [item[2], item[3], item[4]], trimMaterial));
  const content = new THREE.Mesh(new THREE.PlaneGeometry(innerW - .46, innerH - .32), new THREE.MeshStandardMaterial({ map: createLeadBoardTexture(), roughness: .72 }));
  content.position.set(0, 0, .23);
  group.add(content);
}

function createCentralHallExperience() {
  buildCentralHallExperience({
    createNorthOrientationWall,
    connectors: CONNECTORS,
    createGeneralLeadBoard
  });
}

const TALL_POTTED_PLANT_MODEL = "./\u0110\u1ed3 3D decord/House plant/tall_potted_house_plant.glb";

function addRoomCornerPlant(parent, key, opts = {}) {
  const rearInset = ROOM_W / 2 - 3.0;
  const entranceInset = ROOM_W / 2 - 2.3;
  const entranceZ = RING_OUT + 2.5;
  const plantLayouts = [
    ...((key === "goc5" || key === "goc1") ? [
      { position: [-entranceInset, 0, entranceZ], rotationY: -.48 },
      { position: [entranceInset, 0, entranceZ], rotationY: .48 }
    ] : [
      { position: [-rearInset, 0, R_BACK - 3.0], rotationY: .48 },
      { position: [rearInset, 0, R_BACK - 3.0], rotationY: -.48 }
    ])
  ];

  const selectedLayouts = opts.eastEndpointPlant
    ? [key === 'goc3'
      ? { position: [entranceInset, 0, entranceZ], rotationY: .48 }
      : { position: [-entranceInset, 0, entranceZ], rotationY: -.48 }]
    : plantLayouts;
  loadModelScene(TALL_POTTED_PLANT_MODEL).then(source => {
    selectedLayouts.forEach(layout => {
      const plant = createPottedPlant({ source, ...layout });
      parent.add(plant);
    });
    sceneContext?.requestRender?.();
  }).catch(error => console.warn("Unable to load the room plant model:", error));
}

function createDiagonalRoomLegacy(key, parent = scene, opts = {}) {
  const room = ROOM_DEFS[key];
  const content = key === "goc5" ? CONTENT.goc3 : (key === "goc3" ? CONTENT.goc4 : CONTENT[key]);
  const sideExhibitOpts = key === "goc3" || key === "goc4" ? { skipLeft: true, skipRight: true } : {};
  const group = new THREE.Group();
  group.rotation.y = room.groupRotY;
  parent.add(group);

  const cz = RING_OUT + ROOM_D / 2;
  if (!opts.skipShell) {
    buildRoomShell({
      parent: group,
      roomKey: key,
      roomWidth: ROOM_W,
      roomDepth: ROOM_D,
      ringOut: RING_OUT,
      roomBack: R_BACK,
      ceilingHeight: CEIL_H,
      ceilingJoinOverlap: CEILING_JOIN_OVERLAP,
      wallThickness: WALL_T,
      southOuterWallThickness: SOUTH_ROOM_OUTER_WALL_T,
      materials,
      createDropCeiling
    });
  }

  if (key !== "goc3" && key !== "goc5") {
    addTextPanel(room.title, [0, 13.25, R_BACK - .18], [ROOM_W - 1.4, .68], Math.PI, {
      size: 30, color: "#172032", background: "transparent", width: 1400, height: 260
    }, group);
  }
  addTextPanel(room.subtitle, [0, CEIL_H - 1.15, R_BACK - .17], [ROOM_W - 2, .5], Math.PI, {
    size: 19, color: "#334155", background: "transparent", width: 1400, height: 220
  }, group);
  createRoomTopHoanhPhi(group, key, sideExhibitOpts);

  if (key === "goc1") {

    const toZ = (docZ) => RING_OUT + docZ * G1_SZ;
    const tvWidth = .83 * ROOM_W;
    const tvHeight = 4.35 * G1_SX;
    const tvCenterY = CEIL_H * .50;
    createCurvedWallTV(group, {
      width: tvWidth, height: tvHeight, wallZ: R_BACK - WALL_T / 2,
      centerY: tvCenterY,
      bezelColor: 0xf4f7f9, trimColor: 0xd6b86f
    });

    createGoc1DigitalLiteracyPhotoWall(group);
    createGoc1ExpertInsetFrameWall(group);
    createRoomWallGlassShowcases(group);

  } else if (key === "goc5") {
    const toZ3 = (docZ) => RING_OUT + docZ * G3_SZ;

    createGoc3IdeaGallery(group);
    createRoomWallGlassShowcases(group, { productShowcase: true });
    [
      [2.25, "Goc y tuong mo", "Khung anh vang dat trong mang tuong sang lon, danh cho y tuong khoi nghiep moi cua sinh vien."],
      [3.75, "Thu vien chia se", "Ke sach va hoc lieu mo do sinh vien cung xay dung."],
      [5.25, "Phong thi nghiem xanh", "Giai phap tiet kiem nang luong cho khong gian hoc tap."],
      [6.75, "San pham vi cong dong", "Mo hinh ket noi sang kien sinh vien voi nhu cau xa hoi."]
    ].forEach(([docZ, title, desc]) => {
      createBluePhotoInsetPanel(group, {
        x: -ROOM_W / 2 + .2, z: toZ3(docZ), w: 1.85 * G3_SX, h: 1.35 * G3_SY,
        centerY: CEIL_H * .52, rotationY: Math.PI / 2,
        item: { kind: "photo", title, desc }
      });
    });
  } else if (key === "goc3" || key === "goc4") {
    createGoc4WallGallery(group, content, room, sideExhibitOpts);
    createRoomWallGlassShowcases(group, sideExhibitOpts);
  } else if (key === "goc5") {
    createGoc5WallGallery(group, content, room);
  } else if (content.stt2.items) {
    const n = content.stt2.items.length;
    const spread = Math.min(ROOM_W - 2, n * 2.4);
    content.stt2.items.forEach((item, i) => {
      const x = (i - (n - 1) / 2) * (spread / n);
      createFramedPanel(item, [x, CEIL_H / 2 - .1, R_BACK - .16], [2, 1.6], Math.PI, { accent: room.accent, groupLabel: content.stt2.title, useEventPhotos: false }, group);
    });
  } else {
    createFramedPanel(content.stt2, [0, CEIL_H / 2 - .35, R_BACK - .16], [5, 3.3], Math.PI, { accent: room.accent, groupLabel: room.subtitle, useEventPhotos: false }, group);
  }

  if (key !== "goc1" && key !== "goc3" && key !== "goc4" && key !== "goc5") {
    const stt1Z = cz - 5.7;
    createFramedPanel(content.stt1.items ? content.stt1.items[0] : content.stt1,
      [-ROOM_W / 2 + .17, CEIL_H / 2 - .1, stt1Z], [2.8, 2], Math.PI / 2,
      { accent: "#8ecae6", groupLabel: content.stt1.title || "T?ng quan" }, group);
    if (content.stt1.items) {
      content.stt1.items.slice(1, 4).forEach((item, i) => {
        createFramedPanel(item, [-ROOM_W / 2 + .16, 1.6, stt1Z - 1.5 + i * 1.3], [1.6, 1.2], Math.PI / 2, { accent: "#8ecae6", groupLabel: content.stt1.title }, group);
      });
    }

    const stt3Z = R_BACK - 4.8;
    createFramedPanel(content.stt3.items ? content.stt3.items[0] : content.stt3,
      [ROOM_W / 2 - .17, CEIL_H / 2 - .1, stt3Z], [2.8, 2], -Math.PI / 2,
      { accent: "#ffb454", groupLabel: content.stt3.title || "Tr?i nghi?m" }, group);
    createGalleryBench(ROOM_W / 2 - 1.9, stt3Z + 1.7, -Math.PI / 2, group, .85);
    if (content.stt3.items) {
      content.stt3.items.slice(1, 3).forEach((item, i) => {
        createFramedPanel(item, [ROOM_W / 2 - .16, 1.6, stt3Z - 1.4 + i * 1.3], [1.6, 1.2], -Math.PI / 2, { accent: "#ffb454", groupLabel: content.stt3.title }, group);
      });
    }
  }

  addRoomCornerPlant(group, key);

  const ledStrip = new THREE.MeshBasicMaterial({ color: 0xd6b86f });
  [[-ROOM_W / 2 + .05, cz, 0, ROOM_D - .4], [ROOM_W / 2 - .05, cz, 0, ROOM_D - .4]].filter((_, index) => !((key === "goc3" && index === 1) || (key === "goc4" && index === 0))).forEach(v => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, v[3]), ledStrip);
    strip.position.set(v[0], .64, v[1]);
    group.add(strip);
  });
  const backStrip = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - .4, .05, .05), ledStrip);
  backStrip.position.set(0, .64, R_BACK - .12);
  group.add(backStrip);
  // Circular room-number badges were removed to keep the wall identity uncluttered.

}
/* ==========================================================================================
   7. ÁNH SÁNG TỔNG THỂ (6 lớp — mục 3 hồ sơ) — không lặp lại phần đèn đã gắn trong từng phòng
   ========================================================================================== */
function createDiagonalRoom(key, parent = scene, opts = {}) {
  return buildRoom({
    key,
    parent,
    opts,
    roomDefs: ROOM_DEFS,
    contentByKey: CONTENT,
    dimensions: {
      roomWidth: ROOM_W,
      roomDepth: ROOM_D,
      ringOut: RING_OUT,
      roomBack: R_BACK,
      ceilingHeight: CEIL_H,
      ceilingJoinOverlap: CEILING_JOIN_OVERLAP,
      wallThickness: WALL_T,
      southOuterWallThickness: SOUTH_ROOM_OUTER_WALL_T,
      g1ScaleX: G1_SX,
      g1ScaleZ: G1_SZ,
      g3ScaleX: G3_SX,
      g3ScaleY: G3_SY,
      g3ScaleZ: G3_SZ
    },
    materials,
    renderer,
    registerArtifact,
    registerInteractive: registerInteractiveObject,
    requestRender,
    setVideoActive: active => { hasActiveVideoTexture = active; requestRender(); },
    registerMediaController: registerGoc1MediaController,
    buildRoomShell,
    createDropCeiling,
    exhibits: {
      addTextPanel,
      createRoomTopHoanhPhi,
      createCurvedWallTV,
      createGoc1DigitalLiteracyPhotoWall,
      createGoc1ExpertInsetFrameWall,
      createRoomWallGlassShowcases,
      createGoc3IdeaGallery,
      createBluePhotoInsetPanel,
      createGoc4WallGallery,
      createGoc5WallGallery,
      createFramedPanel,
      createGalleryBench,
      addRoomCornerPlant,
      createLogoBadge
    }
  });
}

function createOverallLighting() {
  // Lớp 1 — đèn lõi trung tâm: đã gắn trong createHubCore() (coreGlow).

  // Lớp 3 — đèn ngưỡng cửa mỗi phòng
  // Lớp 4 — spotlight vách nội dung: đã gắn cục bộ trong createDiagonalRoom() (mainSpot).

  // Lớp 5 — đèn cổng + tiền sảnh (dọc trục Nam)
  // Lớp 6 — dải đèn hắt tường cong (cung tường ngoài lối vào)
  const glowMat = new THREE.MeshBasicMaterial({ color: LIGHT_AMBER_COVE });

  // Dải đèn thẳng đánh dấu ngưỡng nối giữa quạt loe và tiền sảnh ngoài (thay cho cung tròn cũ —
  // từ khi tiền sảnh nối thẳng trực tiếp với 2 phòng, đoạn này không còn là tường cong nữa).


  scene.add(new THREE.AmbientLight(AMBIENT_AMBER, 1.02));
  scene.add(new THREE.HemisphereLight(HEMI_SKY_AMBER, HEMI_GROUND_WARM, .86));
}

/* ==========================================================================================
   8. GIỚI HẠN DI CHUYỂN — thay thế isPointInSquareCorridor gốc cho mặt bằng "bông hoa"
   ========================================================================================== */
function isPointInPolygon(x, z, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, zi] = points[i];
    const [xj, zj] = points[j];
    const crosses = (zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function isPointInMergedEastRoom(x, z) {
  if (!MERGED_REGION_CONNECTOR) return false;
  const northEast = ROOM_DEFS.goc3;
  const southEast = ROOM_DEFS.goc4;
  // The straight East exhibition wall is the physical and navigation boundary.
  return isPointInPolygon(x, z, [
    northEast.corners.A.door,
    northEast.corners.A.back,
    northEast.corners.B.back,
    southEast.corners.A.back,
    southEast.corners.B.back,
    southEast.corners.B.door,
    southEast.corners.A.door,
    northEast.corners.B.door
  ]);
}
function isPointInFlowerFloor(x, z) {
  const r = Math.hypot(x, z);

  // Vành khuyên trung tâm quanh Hạt nhân số (chặn lõi bằng biên trong HUB_R)
  if (r >= HUB_R + .25 && r <= RING_OUT + .05) return true;
  if (isPointInMergedEastRoom(x, z)) return true;

  for (const connector of CONNECTORS) {
    const midR = Math.hypot(connector.mid[0], connector.mid[1]) || 1;
    const F = [connector.mid[0] / midR, connector.mid[1] / midR];
    const R = [-F[1], F[0]];
    const lr = x * F[0] + z * F[1];
    const lx = x * R[0] + z * R[1];
    const halfDoor = dist(connector.doorA, connector.doorB) / 2;
    if (lr >= RING_OUT - .15 && lr <= midR + .2 && Math.abs(lx) <= halfDoor - .25) return true;
  }

  // 4 phòng chéo
  for (const key of ROOM_KEYS) {
    const room = ROOM_DEFS[key];
    const lr = x * room.F[0] + z * room.F[1];
    const lx = x * room.R[0] + z * room.R[1];
    if (lr >= RING_OUT - 1.1 && lr <= R_BACK - .35 && Math.abs(lx) <= ROOM_W / 2 - .1) return true;
  }

  // Lối vào chính (Nam): cổng thắt
  if (Math.abs(x) <= GATE_HALF - .05 && z >= RING_OUT - .1 && z <= GATE_Z) return true;

  const southDoorHalf = Math.min(6, GATE_HALF * .44);
  if (Math.abs(x) <= southDoorHalf - .2 && z >= GATE_Z - .15 && z <= GATE_Z + SOUTH_ENTRY_VEST_DEPTH - .25) return true;

  // Lối vào chính: tiền sảnh hình quạt (nội suy tuyến tính theo 2 tường phòng)

  // Tiền sảnh ngoài (rộng không đổi = VEST_HALF, nối thẳng từ điểm chạm phòng tới cửa ra vào)

  return false;
}

/* ==========================================================================================
   10. CAMERA / TƯƠNG TÁC / VÒNG LẶP CHÍNH — giữ nguyên cơ chế điều khiển của Chủ đề 1
   ========================================================================================== */
function updateCameraRotation() {
  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}

function updatePointer(event) {
  const rect = canvas3d.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function clearHover() {
  if (!hovered) return;
  if (hovered.object?.userData?.kind === "artifactInstances" && hovered.instanceId !== undefined) {
    hovered.object.setColorAt(hovered.instanceId, _instanceBaseColor);
    hovered.object.instanceColor.needsUpdate = true;
  } else if (hovered.object?.material?.emissive) {
    hovered.object.material.emissive.setHex(0x000000);
    hovered.object.material.emissiveIntensity = 0;
  }
  hovered = null;
}

function applyHover(rayHit) {
  clearHover();
  if (!rayHit?.object) return;
  hovered = { object: rayHit.object, instanceId: rayHit.instanceId };
  if (hovered.object.userData?.kind === "artifactInstances" && hovered.instanceId !== undefined) {
    hovered.object.setColorAt(hovered.instanceId, _instanceHoverColor);
    hovered.object.instanceColor.needsUpdate = true;
  } else if (hovered.object.material?.emissive) {
    hovered.object.material.emissive.setHex(0xd4af37);
    hovered.object.material.emissiveIntensity = .2;
  }
}

function sameHover(rayHit) {
  return hovered?.object === rayHit?.object && hovered?.instanceId === rayHit?.instanceId;
}

function pickInteractive(event) {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(interactive, true)[0];
}

function onPointerMove(event) {
  if (isLooking && pointerDown) {
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) suppressClick = true;
    pointerDown = { x: event.clientX, y: event.clientY };
    yaw -= dx * .0032;
    pitch = Math.max(-.62, Math.min(.28, pitch - dy * .0026));
    updateCameraRotation();
    requestRender();
    return;
  }
  if (event.timeStamp - lastPointerRaycastTime < 48) return;
  lastPointerRaycastTime = event.timeStamp;
  const rayHit = pickInteractive(event);
  if (!sameHover(rayHit)) {
    applyHover(rayHit);
    canvas3d.style.cursor = rayHit ? "pointer" : "default";
    requestRender();
  }
}

function onClick(event) {
  if (suppressClick) return;
  const rayHit = pickInteractive(event);
  const hit = rayHit?.object;
  if (hit?.userData?.kind === "artifactInstances" && rayHit.instanceId !== undefined) openArtifact(hit.userData.ids[rayHit.instanceId]);
  if (hit?.userData?.kind === "frameAudio") hit.userData.toggle();
  else if (hit?.userData?.kind === "videoAudio") hit.userData.toggle();
  else if (hit?.userData?.kind === "artifact") openArtifact(hit.userData.id);
  else if (hit?.userData?.kind === "expertAudio") hit.userData.toggle();
  else if (hit?.userData?.kind === "goc1Action" || hit?.userData?.kind === "sceneAction") hit.userData.action(rayHit, event);
}

function updateMovement(delta) {
  return navigationSystem?.update(delta) ?? false;
}

// Icon loa thẻ chuyên gia "sáng dần khi khách đến gần" — dùng khoảng cách world thật từ camera
// tới icon (world position, không phải tâm phòng) để hiệu ứng chỉ kích hoạt đúng thẻ gần nhất.
const _iconWorldPos = new THREE.Vector3();
function updateExpertProximity() {
  return sceneUpdateSystem?.updateExpertProximity() ?? false;
}

// Turntable mô hình 3D (Góc 3) — xoay chậm liên tục.
function updateRoomOnlyVisibility() {
  return sceneUpdateSystem?.updateRoomOnlyVisibility() ?? false;
}

function updateTurntables(delta) {
  return sceneUpdateSystem?.updateTurntables(delta) ?? false;
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  requestRender();
}

function stopRenderLoop() {
  renderLoop?.stop();
}

function startRenderLoop() {
  renderLoop?.start();
}

function animate() {
  if (!renderLoopRunning || !renderer || !scene || !camera) return;
  renderFrameId = requestAnimationFrame(animate);
  try {
    const delta = Math.min(clock.getDelta(), .1);
    const moved = updateMovement(delta);
    const proximityChanged = updateExpertProximity();
    const roomVisibilityChanged = updateRoomOnlyVisibility();
    goc1VideoAudioController?.sync();
    const turntableChanged = updateTurntables(delta);
    if (needsRender || moved || proximityChanged || roomVisibilityChanged || turntableChanged || hasActiveVideoTexture) {
      if (needsRender || moved) updatePlayerMapIndicator(camera);
      renderer.render(scene, camera);
      needsRender = false;
    }
  } catch (error) {
    stopRenderLoop();
    if (!renderFailureReported) {
      renderFailureReported = true;
      console.error("Scene 4 render loop stopped after a render failure.", error);
    }
  }
}

function optimizeDynamicLights() {
  const proximityGlows = new Set(expertProximityIcons.map(({ glow }) => glow));
  let realLightCount = 0;

  scene.traverse(obj => {
    if (!obj.isPointLight && !obj.isSpotLight) return;
    if (obj.userData.keepRealLight) {
      obj.visible = true;
      if (!obj.userData.keepFullIntensity) obj.intensity *= 0.82;
      return;
    }
    if (proximityGlows.has(obj)) {
      obj.visible = true;
      return;
    }
    if (realLightCount < MAX_REAL_POINT_OR_SPOT_LIGHTS) {
      obj.intensity *= 0.72;
      realLightCount++;
      return;
    }
    obj.visible = false;
  });
}

/* ==========================================================================================
   11. KHỞI TẠO
   ========================================================================================== */
function init() {
  if (hasInitialized) return;
  hasInitialized = true;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_WARM_BACKGROUND);
  scene.fog = new THREE.Fog(SCENE_WARM_BACKGROUND, 44, 158);

  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 220);
  camera.position.set(0, VIEW_EYE_Y, GATE_Z + SOUTH_ENTRY_VEST_DEPTH - 1.1);
  yaw = 0; pitch = 0;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas3d,
    antialias: devicePixelRatio <= 1.25,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_DEVICE_PIXEL_RATIO));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas3d.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    stopRenderLoop();
  });
  canvas3d.addEventListener("webglcontextrestored", () => {
    renderFailureReported = false;
    renderLoop?.resetFailure();
    needsRender = true;
    startRenderLoop();
  });

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  sceneContext = createSceneContext({
    scene,
    camera,
    renderer,
    materials,
    requestRender,
    registries: {
      interactive,
      roomOnlyVisibilityGroups,
      expertProximityIcons,
      spinningTurntables
    }
  });
  navigationSystem = createNavigationSystem({
    camera,
    keys,
    getYaw: () => yaw,
    setYaw: value => { yaw = value; },
    updateCameraRotation,
    isModalOpen: isArtifactModalOpen,
    geometry: {
      connectors: CONNECTORS,
      mergedRegionConnector: MERGED_REGION_CONNECTOR,
      roomDefs: ROOM_DEFS,
      roomKeys: ROOM_KEYS,
      hubRadius: HUB_R,
      ringOut: RING_OUT,
      roomBack: R_BACK,
      roomWidth: ROOM_W,
      wallThickness: WALL_T,
      gateHalf: GATE_HALF,
      gateZ: GATE_Z,
      southEntryVestDepth: SOUTH_ENTRY_VEST_DEPTH,
      outerRadius: R_OUT
    }
  });
  sceneUpdateSystem = createSceneUpdateSystem({
    camera,
    expertProximityIcons,
    roomOnlyVisibilityGroups,
    spinningTurntables,
    roomWidth: ROOM_W,
    wallThickness: WALL_T,
    ringOut: RING_OUT,
    roomBack: R_BACK
  });
  renderLoop = createRenderLoop({
    clock,
    renderer,
    scene,
    camera,
    updateMovement,
    updateExpertProximity,
    updateRoomOnlyVisibility,
    updateTurntables,
    syncMedia: () => { goc1VideoAudioController?.sync(); syncGoc1Media(); },
    updatePlayerIndicator: updatePlayerMapIndicator,
    shouldRender: () => needsRender,
    markRendered: () => { needsRender = false; },
    hasActiveVideoTexture: () => hasActiveVideoTexture,
    onFailure: error => console.error("Scene 4 render loop stopped after a render failure.", error)
  });

  buildMinimap();

  createHubCore();
  createCentralInteractiveKiosk();
  createCeilingBackfill();
  createCentralCeiling();
  createFloorColorUnderlay();
  createRadialCarpet();
  ROOM_KEYS.filter(key => key !== "goc3" && key !== "goc4").forEach(key => createDiagonalRoom(key));
  createMergedEastRoom();
  createClosedConnectors();
  createEntranceWedge();
  createCentralHallExperience();
  createOverallLighting();

  optimizeDynamicLights();
  window.__scene4Audit = () => collectSceneAudit(scene, sceneContext, { expectedRoomKeys: ROOM_KEYS });

  updateCameraRotation();
  requestRender();
  startRenderLoop();
  roomSceneBuilt = true;
  dismissRoomLoadingWhenReady();
}

initArtifactModal(artifactModalElements);

canvas3d.addEventListener("pointerdown", e => {
  if (e.button !== 0 || isArtifactModalOpen()) return;
  isLooking = true;
  suppressClick = false;
  pointerDown = { x: e.clientX, y: e.clientY };
});
canvas3d.addEventListener("pointermove", onPointerMove);
canvas3d.addEventListener("click", onClick);
window.addEventListener("pointerup", () => {
  isLooking = false;
  pointerDown = null;
  setTimeout(() => suppressClick = false, 0);
});
window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (["w", "a", "s", "d", "q", "e", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
    e.preventDefault();
    keys.add(key);
    hintToast.classList.add("is-hidden");
  }
  if (e.key === "Escape") closeArtifactModal();
});
window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
window.addEventListener("resize", resize);
artifactModalElements.closeBtn.addEventListener("click", closeArtifactModal);
artifactModalElements.modal.addEventListener("click", e => { if (e.target === artifactModalElements.modal) closeArtifactModal(); });
artifactModalElements.image.addEventListener("click", toggleArtifactImageZoom);
artifactModalElements.prevPageBtn.addEventListener("click", showPreviousArtifactPage);
artifactModalElements.nextPageBtn.addEventListener("click", showNextArtifactPage);
artifactModalElements.bookPrevPageBtn.addEventListener("click", showPreviousArtifactPage);
artifactModalElements.bookNextPageBtn.addEventListener("click", showNextArtifactPage);
canvas3d.addEventListener("pointerdown", () => hintToast.classList.add("is-hidden"));
setTimeout(() => hintToast.classList.add("is-hidden"), 9000);

const robotoFontSet = document.fonts;
if (robotoFontSet?.load) {
  Promise.all([
    robotoFontSet.load("400 16px Roboto"),
    robotoFontSet.load("600 16px Roboto"),
    robotoFontSet.load("700 16px Roboto"),
    robotoFontSet.load("900 16px Roboto")
  ]).then(init, init);
} else {
  init();
}

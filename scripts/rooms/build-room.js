import * as THREE from "three";
import { buildGoc1DigitalRoom } from "./build-goc1-digital-room.js";
import { buildGoc2StartupRoom } from "./build-goc2-startup-room.js";

/**
 * Builds one diagonal room and routes its exhibits by room key.  The visual
 * factories are injected so this module stays independent of app globals.
 */
export function buildRoom({
  key,
  parent,
  opts = {},
  roomDefs,
  contentByKey,
  dimensions,
  materials,
  buildRoomShell,
  createDropCeiling,
  renderer,
  registerArtifact,
  registerInteractive,
  requestRender,
  setVideoActive,
  registerMediaController,
  exhibits
}) {
  const room = roomDefs[key];
  const content = key === "goc5" ? contentByKey.goc3 : (key === "goc3" ? contentByKey.goc4 : contentByKey[key]);
  const sideExhibitOpts = key === "goc3" || key === "goc4" ? { skipLeft: true, skipRight: true } : {};
  const group = new THREE.Group();
  group.name = `${key}-room-content`;
  group.rotation.y = room.groupRotY;
  parent.add(group);

  const {
    roomWidth,
    roomDepth,
    ringOut,
    roomBack,
    ceilingHeight,
    ceilingJoinOverlap,
    wallThickness,
    southOuterWallThickness,
    g1ScaleX,
    g1ScaleZ,
    g3ScaleX,
    g3ScaleY,
    g3ScaleZ
  } = dimensions;
  const {
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
  } = exhibits;

  const centerZ = ringOut + roomDepth / 2;
  if (!opts.skipShell) {
    buildRoomShell({
      parent: group,
      roomKey: key,
      roomWidth,
      roomDepth,
      ringOut,
      roomBack,
      ceilingHeight,
      ceilingJoinOverlap,
      wallThickness,
      southOuterWallThickness,
      materials,
      createDropCeiling
    });
  }

  if (key === "goc5") {
    const goc1 = buildGoc1DigitalRoom({
      parent: group,
      renderer,
      addTextPanel: exhibits.addTextPanel,
      createRoomTopHoanhPhi: exhibits.createRoomTopHoanhPhi,
      registerArtifact,
      registerInteractive,
      requestRender,
      setVideoActive
    });
    if (goc1.videoController) registerMediaController?.(goc1.videoController, group);
    addRoomCornerPlant(group, key);
    return group;
  }
  if (key === "goc1") {
    buildGoc2StartupRoom({
      parent: group,
      renderer,
      addTextPanel: exhibits.addTextPanel,
      registerArtifact,
      registerInteractive
    });
    addRoomCornerPlant(group, key);
    return group;
  }
  // The rooms are being reset for a new three-zone layout. Keep only their
  // architectural shells; all movable exhibits, signage, media and decor are
  // intentionally omitted until the new content plan is installed.
  if (opts.clearContents !== false) {
    if (opts.eastEndpointPlant) addRoomCornerPlant(group, key, { eastEndpointPlant: true });
    return group;
  }

  if (key !== "goc3" && key !== "goc5") {
    addTextPanel(room.title, [0, 13.25, roomBack - .18], [roomWidth - 1.4, .68], Math.PI, {
      size: 30, color: "#172032", background: "transparent", width: 1400, height: 260
    }, group);
  }
  addTextPanel(room.subtitle, [0, ceilingHeight - 1.15, roomBack - .17], [roomWidth - 2, .5], Math.PI, {
    size: 19, color: "#334155", background: "transparent", width: 1400, height: 220
  }, group);
  createRoomTopHoanhPhi(group, key, sideExhibitOpts);

  if (key === "goc1") {
    const toZ = docZ => ringOut + docZ * g1ScaleZ;
    createCurvedWallTV(group, {
      width: .83 * roomWidth,
      height: 4.35 * g1ScaleX,
      wallZ: roomBack - wallThickness / 2,
      centerY: ceilingHeight * .50,
      bezelColor: 0xf4f7f9,
      trimColor: 0xd6b86f
    });
    createGoc1DigitalLiteracyPhotoWall(group);
    createGoc1ExpertInsetFrameWall(group);
    createRoomWallGlassShowcases(group);
  } else if (key === "goc5") {
    const toZ = docZ => ringOut + docZ * g3ScaleZ;
    createGoc3IdeaGallery(group);
    createRoomWallGlassShowcases(group, { productShowcase: true });
    [
      [2.25, "Goc y tuong mo", "Khung anh vang dat trong mang tuong sang lon, danh cho y tuong khoi nghiep moi cua sinh vien."],
      [3.75, "Thu vien chia se", "Ke sach va hoc lieu mo do sinh vien cung xay dung."],
      [5.25, "Phong thi nghiem xanh", "Giai phap tiet kiem nang luong cho khong gian hoc tap."],
      [6.75, "San pham vi cong dong", "Mo hinh ket noi sang kien sinh vien voi nhu cau xa hoi."]
    ].forEach(([docZ, title, desc]) => {
      createBluePhotoInsetPanel(group, {
        x: -roomWidth / 2 + .2,
        z: toZ(docZ),
        w: 1.85 * g3ScaleX,
        h: 1.35 * g3ScaleY,
        centerY: ceilingHeight * .52,
        rotationY: Math.PI / 2,
        item: { kind: "photo", title, desc }
      });
    });
  } else if (key === "goc3" || key === "goc4") {
    createGoc4WallGallery(group, content, room, sideExhibitOpts);
    createRoomWallGlassShowcases(group, sideExhibitOpts);
  } else if (content.stt2.items) {
    const count = content.stt2.items.length;
    const spread = Math.min(roomWidth - 2, count * 2.4);
    content.stt2.items.forEach((item, index) => {
      const x = (index - (count - 1) / 2) * (spread / count);
      createFramedPanel(item, [x, ceilingHeight / 2 - .1, roomBack - .16], [2, 1.6], Math.PI,
        { accent: room.accent, groupLabel: content.stt2.title, useEventPhotos: false }, group);
    });
  } else {
    createFramedPanel(content.stt2, [0, ceilingHeight / 2 - .35, roomBack - .16], [5, 3.3], Math.PI,
      { accent: room.accent, groupLabel: room.subtitle, useEventPhotos: false }, group);
  }

  if (key !== "goc1" && key !== "goc3" && key !== "goc4" && key !== "goc5") {
    const firstSectionZ = centerZ - 5.7;
    createFramedPanel(content.stt1.items ? content.stt1.items[0] : content.stt1,
      [-roomWidth / 2 + .17, ceilingHeight / 2 - .1, firstSectionZ], [2.8, 2], Math.PI / 2,
      { accent: "#8ecae6", groupLabel: content.stt1.title || "Tong quan" }, group);
    if (content.stt1.items) {
      content.stt1.items.slice(1, 4).forEach((item, index) => {
        createFramedPanel(item, [-roomWidth / 2 + .16, 1.6, firstSectionZ - 1.5 + index * 1.3], [1.6, 1.2], Math.PI / 2,
          { accent: "#8ecae6", groupLabel: content.stt1.title }, group);
      });
    }

    const thirdSectionZ = roomBack - 4.8;
    createFramedPanel(content.stt3.items ? content.stt3.items[0] : content.stt3,
      [roomWidth / 2 - .17, ceilingHeight / 2 - .1, thirdSectionZ], [2.8, 2], -Math.PI / 2,
      { accent: "#ffb454", groupLabel: content.stt3.title || "Trai nghiem" }, group);
    createGalleryBench(roomWidth / 2 - 1.9, thirdSectionZ + 1.7, -Math.PI / 2, group, .85);
    if (content.stt3.items) {
      content.stt3.items.slice(1, 3).forEach((item, index) => {
        createFramedPanel(item, [roomWidth / 2 - .16, 1.6, thirdSectionZ - 1.4 + index * 1.3], [1.6, 1.2], -Math.PI / 2,
          { accent: "#ffb454", groupLabel: content.stt3.title }, group);
      });
    }
  }

  addRoomCornerPlant(group, key);
  // The merged East region has one continuous floor, so it omits the low
  // gold room-outline accents inherited from the two former room bays.
  if (!opts.skipShell) {
  const ledStrip = new THREE.MeshBasicMaterial({ color: 0xd6b86f });
  [[-roomWidth / 2 + .05, centerZ, 0, roomDepth - .4], [roomWidth / 2 - .05, centerZ, 0, roomDepth - .4]]
    .filter((_, index) => !((key === "goc3" && index === 1) || (key === "goc4" && index === 0)))
    .forEach(([x, z, , length]) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, length), ledStrip);
      strip.position.set(x, .64, z);
      group.add(strip);
    });
  const backStrip = new THREE.Mesh(new THREE.BoxGeometry(roomWidth - .4, .05, .05), ledStrip);
  backStrip.position.set(0, .64, roomBack - .12);
  group.add(backStrip);
  }
  createLogoBadge(room.label.replace("Góc ", "G"), room.accent, "#ffffff", [0, ceilingHeight - .35, ringOut + .05], .55, group);
  return group;
}

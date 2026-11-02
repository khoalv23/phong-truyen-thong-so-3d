import * as THREE from "three";
import { INTERNATIONAL_MEDIA } from "../data/international-integration-media.js";
import { INTERNATIONAL_SELECTED_MEDIA } from "../data/international-selected-media.js";

const COLORS = {
  navy: 0x234d6f,
  blue: 0x4b8ba5,
  pale: 0xdbe7ec,
  gold: 0xd6a84b,
  red: 0x982f35,
  white: 0xffffff,
  ink: 0x172032
};

const MAP_SOURCE = "./assets/maps/ne_110m_admin_0_countries.geojson";
const MAP_BOUNDS = { minLon: -180, maxLon: 180, minLat: -58, maxLat: 85 };
const MAP_SIZE = { width: 36.5, height: 14.5 };
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export const INTERNATIONAL_CONNECTIONS = [
  {
    id: "singapore", label: "SINGAPORE", lon: 103.82, lat: 1.35, topic: 3,
    title: "H\u1ecdc k\u1ef3 qu\u1ed1c t\u1ebf Semester@NIE 2026", unit: "National Institute of Education, Singapore",
    stat: "05 SINH VIÊN · HỌC BỔNG HƠN 400 TRIỆU ĐỒNG",
    description: "Học kỳ quốc tế, phát triển chuyên môn, ngoại ngữ và trải nghiệm môi trường giáo dục đa văn hóa.",
    labelOffset: [-1.15, -.52]
  },
  {
    id: "japan", label: "NHẬT BẢN", lon: 139.77, lat: 35.71, topic: 4,
    title: "Summer Program for Global Leaders 2026", unit: "Ochanomizu University",
    stat: "HỌC THUẬT · NGOẠI NGỮ · ĐA VĂN HÓA",
    description: "Chương trình dành cho sinh viên toàn cầu, phát triển năng lực học thuật và kỹ năng làm việc quốc tế.",
    labelOffset: [-1.05, 1.35]
  },
  {
    id: "korea", label: "H\u00c0N QU\u1ed0C", lon: 128.10, lat: 35.15,
    title: "K\u00fd k\u1ebft MOU v\u1edbi \u0110\u1ea1i h\u1ecdc Qu\u1ed1c gia Jeonbuk", unit: "Tr\u01b0\u1eddng THPT Chuy\u00ean \u0110HSP \u00b7 \u0110\u1ea1i h\u1ecdc Qu\u1ed1c gia Jeonbuk",
    stat: "H\u1ee2P T\u00c1C GI\u00c1O D\u1ee4C \u00b7 TH\u00c1NG 8/2026",
    description: "L\u1ec5 k\u00fd k\u1ebft bi\u00ean b\u1ea3n ghi nh\u1edb m\u1edf r\u1ed9ng h\u1ee3p t\u00e1c gi\u00e1o d\u1ee5c v\u00e0 t\u0103ng c\u01b0\u1eddng k\u1ebft n\u1ed1i h\u1ecdc thu\u1eadt gi\u1eefa hai \u0111\u01a1n v\u1ecb t\u1ea1i Tr\u01b0\u1eddng \u0110\u1ea1i h\u1ecdc S\u01b0 ph\u1ea1m H\u00e0 N\u1ed9i.",
    labelOffset: [-1.45, .82]
  },
  {
    id: "france", label: "PHÁP", lon: 7.75, lat: 48.57, topic: 6,
    imageId: "intl-090",
    title: "Trao đổi sinh viên tại Strasbourg", unit: "Université de Strasbourg",
    stat: "UNISTRA · CHƯƠNG TRÌNH MIỄN HỌC PHÍ",
    description: "Hành trình học tập, thích nghi và phát triển năng lực trong môi trường giáo dục Pháp.",
    labelOffset: [1.25, .55]
  },
  {
    id: "china", label: "TRUNG QUỐC", lon: 115.86, lat: 28.68, topic: 9,
    title: "Chương trình trao đổi sinh viên một năm", unit: "Đại học Kinh tế Tài chính Giang Tây",
    stat: "HỌC TẬP · NGÔN NGỮ · VĂN HÓA",
    description: "Chương trình trao đổi dài hạn giúp sinh viên phát triển ngoại ngữ và khả năng thích nghi trong môi trường quốc tế.",
    labelOffset: [-1.85, .72]
  },
  {
    id: "taiwan", label: "ĐÀI LOAN", lon: 121.56, lat: 25.03, topic: 8,
    title: "Giao lưu sinh viên quốc tế", unit: "Kết nối học thuật và văn hóa",
    stat: "GẶP GỠ · WORKSHOP · ẨM THỰC · TỔNG KẾT",
    description: "Không gian giao lưu học thuật và văn hóa, thúc đẩy sự cởi mở và kết nối giữa sinh viên hai bên.",
    labelOffset: [1.45, .12]
  },
  {
    id: "philippines", label: "PHILIPPINES", lon: 120.99, lat: 14.60, topic: 14,
    title: "Chia sẻ kinh nghiệm trao đổi quốc tế",
    unit: "De La Salle University và De La Salle University – Dasmariñas",
    stat: "TỌA ĐÀM NGÀY 11/03/2026",
    description: "Sinh viên quốc tế chia sẻ trải nghiệm và định hướng tiếp cận các chương trình trao đổi của Nhà trường.",
    labelOffset: [1.45, -.38]
  },  {
    id: "usa", label: "HOA KỲ", lon: -77.04, lat: 38.91,
    title: "Kết nối học thuật Hoa Kỳ", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · HỌC THUẬT · ĐỔI MỚI", description: "Điểm kết nối học thuật tại khu vực Bắc Mỹ.", labelOffset: [-1.4, .85]
  },
  {
    id: "canada", label: "CANADA", lon: -75.70, lat: 45.42,
    title: "Kết nối học thuật Canada", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · TRAO ĐỔI", description: "Điểm kết nối giáo dục tại Canada.", labelOffset: [-1.05, .72]
  },
  {
    id: "brazil", label: "BRAZIL", lon: -47.88, lat: -15.79,
    title: "Kết nối học thuật Brazil", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · GIAO LƯU", description: "Điểm kết nối tại khu vực Nam Mỹ.", labelOffset: [-.85, -.68]
  },
  {
    id: "uk", label: "ANH", lon: -0.13, lat: 51.51,
    title: "Kết nối học thuật Vương quốc Anh", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · HỌC THUẬT", description: "Điểm kết nối giáo dục tại Vương quốc Anh.", labelOffset: [-.85, .7]
  },
  {
    id: "germany", label: "ĐỨC", lon: 13.40, lat: 52.52,
    title: "Kết nối học thuật Đức", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · NGHIÊN CỨU", description: "Điểm kết nối giáo dục tại Đức.", labelOffset: [1.0, .62]
  },
  {
    id: "spain", label: "TÂY BAN NHA", lon: -3.70, lat: 40.42,
    title: "Kết nối học thuật Tây Ban Nha", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · VĂN HÓA", description: "Điểm kết nối giáo dục tại Tây Ban Nha.", labelOffset: [-1.15, -.62]
  },
  {
    id: "russia", label: "NGA", lon: 37.62, lat: 55.75,
    title: "Kết nối học thuật Nga", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · HỌC THUẬT · VĂN HÓA", description: "Điểm kết nối giáo dục tại Liên bang Nga.", labelOffset: [1.05, .72]
  },  {
    id: "india", label: "ẤN ĐỘ", lon: 77.21, lat: 28.61,
    title: "Kết nối học thuật Ấn Độ", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · CÔNG NGHỆ", description: "Điểm kết nối giáo dục tại Ấn Độ.", labelOffset: [-.85, .72]
  },
  {
    id: "thailand", label: "THÁI LAN", lon: 100.50, lat: 13.75,
    title: "Kết nối học thuật Thái Lan", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · GIAO LƯU", description: "Điểm kết nối giáo dục tại Thái Lan.", labelOffset: [-1.05, -.65]
  },
  {
    id: "indonesia", label: "INDONESIA", lon: 106.85, lat: -6.21,
    title: "Kết nối học thuật Indonesia", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · GIAO LƯU", description: "Điểm kết nối giáo dục tại Indonesia.", labelOffset: [1.1, -.72]
  },
  {
    id: "australia", label: "ÚC", lon: 151.21, lat: -33.87,
    title: "Kết nối học thuật Úc", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · HỌC THUẬT", description: "Điểm kết nối giáo dục tại Úc.", labelOffset: [-.55, -.72]
  },
  {
    id: "new-zealand", label: "NEW ZEALAND", lon: 174.76, lat: -36.85,
    title: "Kết nối học thuật New Zealand", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · HỌC THUẬT", description: "Điểm kết nối giáo dục tại New Zealand.", labelOffset: [-1.6, -.72]
  },
  {
    id: "turkey", label: "THỔ NHĨ KỲ", lon: 32.86, lat: 39.93,
    title: "Kết nối học thuật Thổ Nhĩ Kỳ", unit: "Đối tác giáo dục quốc tế", stat: "KẾT NỐI · VĂN HÓA", description: "Điểm kết nối giáo dục tại Thổ Nhĩ Kỳ.", labelOffset: [1.15, .62]
  }
];

const HNUE = { lon: 105.85, lat: 21.03 };

function sourceUrl(value) { return encodeURI(value); }

function imageForData(data) {
  const selectedNumber = {
    singapore: 1, japan: 4, korea: 39, france: 28,
    china: 6, taiwan: 5, philippines: 40
  }[data.id];
  const selected = INTERNATIONAL_SELECTED_MEDIA.find(item => item.number === selectedNumber);
  if (selected) return selected.displayPath;
  return INTERNATIONAL_MEDIA.find(item =>
    item.id === data.imageId && item.mediaType === "image" && !item.isDuplicate && IMAGE_EXTENSIONS.has(item.extension)
  )?.displayPath || INTERNATIONAL_MEDIA.find(item =>
    item.topic === data.topic && item.mediaType === "image" && !item.isDuplicate && IMAGE_EXTENSIONS.has(item.extension)
  )?.displayPath;
}

function mapPoint(lon, lat) {
  const x = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * MAP_SIZE.width - MAP_SIZE.width / 2;
  const y = (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * MAP_SIZE.height - MAP_SIZE.height / 2;
  return [x, y];
}

function panelMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? .62, metalness: options.metalness ?? .06 });
}

function addFramedPanel(parent, width, height, z = 0) {
  const group = new THREE.Group();
  group.position.z = z;
  const outer = new THREE.Mesh(new THREE.BoxGeometry(width, height, .14), panelMaterial(COLORS.navy, { metalness: .18, roughness: .48 }));
  const gold = new THREE.Mesh(new THREE.BoxGeometry(width - .24, height - .24, .045), panelMaterial(COLORS.gold, { metalness: .42, roughness: .34 }));
  const face = new THREE.Mesh(new THREE.BoxGeometry(width - .48, height - .48, .025), new THREE.MeshBasicMaterial({ color: COLORS.white }));
  outer.position.z = .07; gold.position.z = .16; face.position.z = .205;
  group.add(outer, gold, face); parent.add(group);
  return group;
}

function createMapTexture(requestRender) {
  const canvas = document.createElement("canvas");
  canvas.width = 3072; canvas.height = 804;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const drawBase = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f7fafc"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#eaf2f5"); gradient.addColorStop(1, "#dce9ee");
    ctx.fillStyle = gradient; ctx.fillRect(22, 22, canvas.width - 44, canvas.height - 44);
    ctx.strokeStyle = "rgba(75,139,165,.18)"; ctx.lineWidth = 2;
    for (let i = 1; i < 8; i++) { const x = i * canvas.width / 8; ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, canvas.height - 22); ctx.stroke(); }
    for (let i = 1; i < 4; i++) { const y = i * canvas.height / 4; ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(canvas.width - 22, y); ctx.stroke(); }
  };

  const project = ([lon, lat]) => [
    (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * canvas.width,
    canvas.height - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * canvas.height
  ];

  const drawRing = ring => {
    if (!ring?.length) return;
    ctx.beginPath();
    ring.forEach((coordinate, index) => {
      const [x, y] = project(coordinate);
      if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };

  const drawGeoJson = geoJson => {
    drawBase();
    ctx.save();
    ctx.beginPath(); ctx.rect(22, 22, canvas.width - 44, canvas.height - 44); ctx.clip();
    ctx.fillStyle = "#9fb7c2"; ctx.strokeStyle = "#f7fafc"; ctx.lineWidth = 2.2;
    for (const feature of geoJson.features || []) {
      const geometry = feature.geometry;
      if (!geometry) continue;
      if (geometry.type === "Polygon") geometry.coordinates.forEach(drawRing);
      if (geometry.type === "MultiPolygon") geometry.coordinates.forEach(polygon => polygon.forEach(drawRing));
    }
    ctx.restore();
    texture.needsUpdate = true; requestRender?.();
  };

  drawBase(); texture.needsUpdate = true;
  return { canvas, texture, drawGeoJson };
}

function wrapLines(ctx, text, maxWidth, maxLines = 4) {
  const words = String(text || "").split(/\s+/); const lines = []; let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) current = candidate;
    else { lines.push(current); current = word; if (lines.length === maxLines - 1) break; }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function mediaForData(data) {
  // The generated topic manifest may reference source folders that are not shipped with the scene.
  // Use the curated, top-level display asset that is guaranteed to be part of the exhibition bundle.
  const path = imageForData(data);
  const selected = INTERNATIONAL_SELECTED_MEDIA.find(item => item.displayPath === path);
  return selected ? [selected] : [];
}

function drawJustifiedText(ctx, text, x, y, width, lineHeight, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean); const lines = []; let line = [];
  for (const word of words) {
    const candidate = [...line, word].join(" ");
    if (!line.length || ctx.measureText(candidate).width <= width) line.push(word);
    else { lines.push(line); line = [word]; if (lines.length === maxLines - 1) break; }
  }
  if (line.length && lines.length < maxLines) lines.push(line);
  lines.forEach((parts, index) => {
    const last = index === lines.length - 1;
    if (last || parts.length === 1) ctx.fillText(parts.join(" "), x, y + index * lineHeight);
    else { const wordsWidth = parts.reduce((sum, part) => sum + ctx.measureText(part).width, 0); const gap = (width - wordsWidth) / (parts.length - 1); let cursor = x;
      parts.forEach(part => { ctx.fillText(part, cursor, y + index * lineHeight); cursor += ctx.measureText(part).width + gap; }); }
  });
  return lines.length;
}

function createInfoScreen(requestRender) {
  const canvas = document.createElement("canvas"); canvas.width = 1800; canvas.height = 1080;
  const ctx = canvas.getContext("2d"); const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter; texture.generateMipmaps = false;
  let token = 0; let disposed = false;
  const base = () => { const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, "#f8fbfc"); gradient.addColorStop(1, "#e7eff3");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#102a3c"; ctx.fillRect(0, 0, canvas.width, 112); ctx.fillStyle = "#d6a84b"; ctx.fillRect(0, 112, canvas.width, 9); };
  const drawEmpty = () => { base(); ctx.textAlign = "center"; ctx.fillStyle = "#234d6f"; ctx.font = "900 58px Roboto, Arial, sans-serif"; ctx.fillText("KH\u00c1M PH\u00c1 H\u1ed8I NH\u1eacP QU\u1ed0C T\u1ebe", 900, 470);
    ctx.font = "500 35px Roboto, Arial, sans-serif"; ctx.fillStyle = "#526b7a"; ctx.fillText("Ch\u1ecdn m\u1ed9t ch\u1ea5m v\u00e0ng tr\u00ean b\u1ea3n \u0111\u1ed3 \u0111\u1ec3 xem th\u00f4ng tin", 900, 545); ctx.textAlign = "left"; texture.needsUpdate = true; };
  const drawContent = (data, media, index, image) => { base(); ctx.textAlign = "left"; ctx.fillStyle = "#ffffff"; ctx.font = "900 42px Roboto, Arial, sans-serif"; ctx.fillText(data.label, 58, 73);
    ctx.fillStyle = "#d6a84b"; ctx.font = "800 27px Roboto, Arial, sans-serif"; ctx.textAlign = "right"; ctx.fillText("\u0110I\u1ec2M K\u1ebeT N\u1ed0I \u0110ANG CH\u1eccN", 1740, 70); ctx.textAlign = "left";
    const imageX = 46, imageY = 164, imageW = 930, imageH = 748; ctx.fillStyle = "#0b1821"; ctx.fillRect(imageX, imageY, imageW, imageH);
    if (image?.naturalWidth) { const scale = Math.min(imageW / image.naturalWidth, imageH / image.naturalHeight); const w = image.naturalWidth * scale, h = image.naturalHeight * scale; ctx.drawImage(image, imageX + (imageW - w) / 2, imageY + (imageH - h) / 2, w, h); }
    else { ctx.fillStyle = "#8fa4b0"; ctx.font = "700 31px Roboto, Arial, sans-serif"; ctx.textAlign = "center"; ctx.fillText("\u0110ANG T\u1ea2I H\u00ccNH \u1ea2NH", imageX + imageW / 2, imageY + imageH / 2); ctx.textAlign = "left"; }
    const x = 1035, width = 710; let y = 205; ctx.fillStyle = "#172032"; ctx.font = "900 48px Roboto, Arial, sans-serif";
    for (const line of wrapLines(ctx, data.title, width, 3)) { ctx.fillText(line, x, y); y += 57; }
    y += 12; ctx.fillStyle = "#234d6f"; ctx.font = "700 29px Roboto, Arial, sans-serif"; for (const line of wrapLines(ctx, data.unit, width, 3)) { ctx.fillText(line, x, y); y += 38; }
    y += 20; ctx.fillStyle = "#d6a84b"; ctx.fillRect(x, y, 115, 7); y += 48; ctx.fillStyle = "#344b5a"; ctx.font = "500 30px Roboto, Arial, sans-serif"; drawJustifiedText(ctx, data.description, x, y, width, 44, 7);
    ctx.fillStyle = "#edf3f6"; ctx.fillRect(0, 948, canvas.width, 132); ctx.fillStyle = "#234d6f"; ctx.font = "800 27px Roboto, Arial, sans-serif"; ctx.fillText(data.stat, 56, 1011);
    ctx.fillStyle = "#5a7180"; ctx.font = "700 25px Roboto, Arial, sans-serif"; ctx.textAlign = "right"; ctx.fillText(media.length > 1 ? (index + 1) + " / " + media.length + " T\u01af LI\u1ec6U" : "01 T\u01af LI\u1ec6U", 1742, 1011); ctx.textAlign = "left";
    texture.needsUpdate = true; requestRender?.(); };
  drawEmpty();
  return { texture, show(data, media, index = 0) { const currentToken = ++token; const item = media[index]; drawContent(data, media, index, null); if (!item?.displayPath) return;
      const image = new Image(); image.onload = () => { if (!disposed && currentToken === token) drawContent(data, media, index, image); }; image.onerror = () => { if (!disposed && currentToken === token) drawContent(data, media, index, null); }; image.src = sourceUrl(item.displayPath); },
    dispose() { disposed = true; token++; texture.dispose(); } };
}
export function buildInternationalMapBoard({ parent, addTextPanel, registerInteractive, renderer, requestRender }) {
  const root = new THREE.Group(); root.name = "hnue-international-map-board";
  root.position.set(0, 10.75, .10); parent.add(root);
  addFramedPanel(root, 56, 22, 0);

  const header = new THREE.Mesh(new THREE.BoxGeometry(54.9, 2.65, .075), panelMaterial(0x0b5e9c, { metalness: .18, roughness: .46 }));
  header.position.set(0, 9.15, .31); root.add(header);
  const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(44.8, .12, .03), new THREE.MeshBasicMaterial({ color: COLORS.gold }));
  goldAccent.position.set(5.0, 7.88, .37); root.add(goldAccent);
  addTextPanel("HỘI NHẬP QUỐC TẾ", [0, 9.15, .37], [34, 1.32], 0, {
    size: 150, minFontSize: 130, color: "#FFFFFF", background: "transparent", border: false,
    weight: 900, wrap: false, width: 6600, height: 250, lineHeight: 165, unlit: true
  }, root);


  const mapRoot = new THREE.Group(); mapRoot.position.set(-8.85, -.15, .35); root.add(mapRoot);
  addFramedPanel(mapRoot, 37.5, 15.3, 0);
  const mapBundle = createMapTexture(requestRender);
  mapBundle.texture.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE.width, MAP_SIZE.height), new THREE.MeshBasicMaterial({ map: mapBundle.texture }));
  mapPlane.position.z = .24; mapRoot.add(mapPlane);

  const infoRoot = new THREE.Group(); infoRoot.position.set(19.0, -.15, .35); root.add(infoRoot);
  addFramedPanel(infoRoot, 16.4, 15.3, 0);

  // Wall-mounted television housing for contextual information from the gold markers.
  const tvGlow = new THREE.Mesh(new THREE.PlaneGeometry(16.0, 10.75), new THREE.MeshBasicMaterial({ color: 0xdbe7ec, transparent: true, opacity: .22, depthWrite: false }));
  tvGlow.position.set(0, .35, .225); infoRoot.add(tvGlow);
  const tvRear = new THREE.Mesh(new THREE.BoxGeometry(15.5, 10.15, .42), panelMaterial(0x17222a, { metalness: .48, roughness: .35 }));
  tvRear.position.set(0, .35, .34); infoRoot.add(tvRear);
  const tvShell = new THREE.Mesh(new THREE.BoxGeometry(15.78, 10.35, .30), panelMaterial(0x26343d, { metalness: .55, roughness: .3 }));
  tvShell.position.set(0, .35, .58); infoRoot.add(tvShell);
  const tvBezel = new THREE.Mesh(new THREE.BoxGeometry(15.20, 9.55, .16), panelMaterial(0x090e12, { metalness: .24, roughness: .24 }));
  tvBezel.position.set(0, .62, .79); infoRoot.add(tvBezel);
  const infoScreen = createInfoScreen(requestRender);
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(14.75, 8.85), new THREE.MeshBasicMaterial({ map: infoScreen.texture, toneMapped: false }));
  screenMesh.position.set(0, .72, .90); infoRoot.add(screenMesh);
  const tvAccent = new THREE.Mesh(new THREE.BoxGeometry(10.7, .09, .05), panelMaterial(COLORS.gold, { metalness: .7, roughness: .25 }));
  tvAccent.position.set(0, -4.67, .80); infoRoot.add(tvAccent);
  const statusLed = new THREE.Mesh(new THREE.CircleGeometry(.075, 20), new THREE.MeshBasicMaterial({ color: 0x7ed6a7 }));
  statusLed.position.set(6.88, -4.62, .91); infoRoot.add(statusLed);
  const navMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a84b, emissive: 0x4d3510, emissiveIntensity: .18, roughness: .35, metalness: .5, transparent: true, opacity: .35 });
  const prevButton = new THREE.Mesh(new THREE.CircleGeometry(.29, 28), navMaterial.clone()); prevButton.position.set(-6.86, -4.61, .92); infoRoot.add(prevButton);
  const nextButton = new THREE.Mesh(new THREE.CircleGeometry(.29, 28), navMaterial.clone()); nextButton.position.set(-6.10, -4.61, .92); infoRoot.add(nextButton);
  addTextPanel("\u2039", [-6.86,-4.61,.94], [.42,.42], 0, { size:72,minFontSize:64,color:"#172032",background:"transparent",border:false,weight:900,wrap:false,width:160,height:160,unlit:true }, infoRoot);
  addTextPanel("\u203a", [-6.10,-4.61,.94], [.42,.42], 0, { size:72,minFontSize:64,color:"#172032",background:"transparent",border:false,weight:900,wrap:false,width:160,height:160,unlit:true }, infoRoot);
  const routeEntries = new Map(); const markerEntries = new Map();
  const [hx, hy] = mapPoint(HNUE.lon, HNUE.lat);
  const routeOffsets = { france: 1.35, singapore: -1.0, japan: 1.2, korea: .78, china: .48, taiwan: -.22, philippines: -.72 };
  for (const data of INTERNATIONAL_CONNECTIONS) {
    const [x, y] = mapPoint(data.lon, data.lat);
    const midpoint = new THREE.Vector3((hx + x) / 2, (hy + y) / 2 + (routeOffsets[data.id] ?? .5), .30);
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(hx, hy, .30), midpoint, new THREE.Vector3(x, y, .30));
    const verified=Number.isFinite(data.topic);
    const material = new THREE.MeshBasicMaterial({ color: verified?COLORS.gold:COLORS.blue, transparent: true, opacity: verified?.78:.35 });
    const route = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, .045, 7, false), material);
    mapRoot.add(route); routeEntries.set(data.id, route);
  }

  const hnueRing = new THREE.Mesh(new THREE.RingGeometry(.48, .66, 48), new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: .9 }));
  const hnuePoint = new THREE.Mesh(new THREE.CircleGeometry(.42, 40), new THREE.MeshBasicMaterial({ color: COLORS.red }));
  hnueRing.position.set(hx, hy, .36); hnuePoint.position.set(hx, hy, .37); mapRoot.add(hnueRing, hnuePoint);
  addTextPanel("HNUE · HÀ NỘI", [hx - 2.35, hy - .05, .38], [4.5, .72], 0, {
    size: 46, minFontSize: 40, color: "#8F2F34", background: "transparent", border: false,
    weight: 900, wrap: false, width: 1500, height: 240, strokeColor: "#FFFFFF", unlit: true
  }, mapRoot);

  let selectedCountry = null; let disposed = false; let currentMedia = []; let mediaIndex = 0;
  const interactiveMeshes = [];

  function refreshNavigation() {
    const enabled = currentMedia.length > 1;
    prevButton.material.opacity = enabled ? 1 : .35; nextButton.material.opacity = enabled ? 1 : .35;
    prevButton.material.needsUpdate = true; nextButton.material.needsUpdate = true;
  }

  function cycleMedia(direction) {
    if (!selectedCountry || currentMedia.length < 2) return;
    mediaIndex = (mediaIndex + direction + currentMedia.length) % currentMedia.length;
    const data = INTERNATIONAL_CONNECTIONS.find(item => item.id === selectedCountry);
    if (data) infoScreen.show(data, currentMedia, mediaIndex);
  }

  prevButton.userData = { kind: "sceneAction", action: () => cycleMedia(-1) };
  nextButton.userData = { kind: "sceneAction", action: () => cycleMedia(1) };
  registerInteractive(prevButton); registerInteractive(nextButton); interactiveMeshes.push(prevButton, nextButton);

  function selectCountry(id) {
    const data = INTERNATIONAL_CONNECTIONS.find(item => item.id === id && Number.isFinite(item.topic)); if (!data) return;
    selectedCountry = id; currentMedia = mediaForData(data); mediaIndex = 0;
    for (const item of INTERNATIONAL_CONNECTIONS) {
      const active = item.id === id; const marker = markerEntries.get(item.id); const route = routeEntries.get(item.id); const verified = Number.isFinite(item.topic);
      marker.material.color.setHex(active ? COLORS.red : (verified ? COLORS.gold : COLORS.blue)); marker.scale.setScalar(active ? 1.28 : 1);
      route.material.color.setHex(active ? COLORS.red : (verified ? COLORS.gold : COLORS.blue)); route.material.opacity = active ? 1 : (verified ? .62 : .35);
    }
    infoScreen.show(data, currentMedia, mediaIndex); refreshNavigation(); requestRender?.();
  }

  for (const data of INTERNATIONAL_CONNECTIONS) {
    const [x, y] = mapPoint(data.lon, data.lat);
    const verified=Number.isFinite(data.topic);
    const markerColor=verified?COLORS.gold:COLORS.blue;
    const material = new THREE.MeshStandardMaterial({ color: markerColor, emissive: markerColor, emissiveIntensity: .06, roughness: .4, metalness: .18, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(new THREE.CircleGeometry(.32, 32), material); marker.position.set(x, y, .39);
    if(verified){marker.userData = { kind: "sceneAction", action: () => selectCountry(data.id) };registerInteractive(marker);interactiveMeshes.push(marker)}
    mapRoot.add(marker); markerEntries.set(data.id, marker);
    const [ox, oy] = data.labelOffset;
    addTextPanel(data.label, [x + ox, y + oy, .40], [4.15, .64], 0, {
      size: 38, minFontSize: 32, color: "#234D6F", background: "transparent", border: false,
      weight: 900, wrap: false, width: 1480, height: 230, strokeColor: "#FFFFFF", unlit: true
    }, mapRoot);
  }
  addTextPanel("B\u1ea2N \u0110\u1ed2 THANH NI\u00caN HNUE", [-8.85,-8.25,.40], [34,1.18], 0, {
    size:82,minFontSize:68,color:"#FFFFFF",background:"#234D6F",border:true,accent:"#D6A84B",
    borderWidth:12,weight:900,wrap:false,width:4600,height:310,lineHeight:96,unlit:true
  }, root);

  // The screen remains idle until the visitor deliberately selects a verified gold marker.
  const abortController = new AbortController();
  fetch(MAP_SOURCE, { signal: abortController.signal }).then(response => {
    if (!response.ok) throw new Error(`Map data ${response.status}`); return response.json();
  }).then(data => { if (!disposed) mapBundle.drawGeoJson(data); }).catch(error => {
    if (error.name !== "AbortError") console.warn("Unable to load local international map data", error);
  });

  const controller = {
    sync() {},
    dispose() {
      if (disposed) return; disposed = true; abortController.abort();
      interactiveMeshes.forEach(mesh => { mesh.userData.action = () => {}; });
      infoScreen.dispose(); mapBundle.texture.dispose();
      root.traverse(object => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach(material => { material.map?.dispose?.(); material.dispose?.(); });
      });
    }
  };
  return { root, controller, selectCountry };
}

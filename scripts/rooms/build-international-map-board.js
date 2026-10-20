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
    title: "Semester@NIE", unit: "National Institute of Education, Singapore",
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
    id: "korea", label: "HÀN QUỐC", lon: 128.10, lat: 35.15, topic: 7,
    title: "GNU-GIMS Fellowship", unit: "Gyeongsang National University",
    stat: "02 SINH VIÊN · GIÁ TRỊ GẦN 200 TRIỆU ĐỒNG",
    description: "Học bổng hỗ trợ học phí một học kỳ và các chi phí liên quan cho sinh viên HNUE.",
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

function createInfoTexture(data) {
  const canvas = document.createElement("canvas"); canvas.width = 1800; canvas.height = 590;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#F8FBFC"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#234D6F"; ctx.fillRect(0, 0, canvas.width, 78);
  ctx.fillStyle = "#D6A84B"; ctx.fillRect(0, 78, canvas.width, 10);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "900 40px Roboto, Arial, sans-serif"; ctx.fillText(data.label, 58, 53);
  ctx.fillStyle = "#172032"; ctx.font = "900 52px Roboto, Arial, sans-serif";
  let y = 148;
  for (const line of wrapLines(ctx, data.title, 1665, 2)) { ctx.fillText(line, 58, y); y += 60; }
  ctx.fillStyle = "#234D6F"; ctx.font = "700 31px Roboto, Arial, sans-serif";
  for (const line of wrapLines(ctx, data.unit, 1665, 2)) { ctx.fillText(line, 58, y); y += 40; }
  y += 13;
  ctx.fillStyle = "#D6A84B"; ctx.fillRect(46, y, 1708, 68);
  ctx.strokeStyle = "#8F2F34"; ctx.lineWidth = 5; ctx.strokeRect(48.5, y + 2.5, 1703, 63);
  ctx.fillStyle = "#172032"; ctx.font = "900 30px Roboto, Arial, sans-serif"; ctx.fillText(data.stat, 76, y + 45);
  y += 112;
  ctx.fillStyle = "#334155"; ctx.font = "600 31px Roboto, Arial, sans-serif";
  for (const line of wrapLines(ctx, data.description, 1665, 3)) { ctx.fillText(line, 58, y); y += 40; }
  ctx.fillStyle = "#EAF2F5"; ctx.fillRect(0, 540, canvas.width, 50);
  ctx.fillStyle = "#234D6F"; ctx.font = "italic 700 24px Roboto, Arial, sans-serif";
  ctx.fillText("Ch\u1ecdn m\u1ed9t \u0111i\u1ec3m tr\u00ean b\u1ea3n \u0111\u1ed3 \u0111\u1ec3 xem n\u1ed9i dung", 58, 573);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createContinuousSlideshow(paths, requestRender) {
  const canvas = document.createElement('canvas');
  // Match the right-hand display panel (14.9 × 8.85) so the texture itself is never stretched.
  canvas.width = 1200; canvas.height = 1128;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const slides = paths.map(path => ({ image: new Image(), ready: false }));
  let slideIndex = 0; let elapsedOnSlide = 0; let lastTime = performance.now(); let disposed = false;
  const HOLD_SECONDS = 0, SLIDE_SECONDS = 9;
  const CARD_GAP = 12, CARD_WIDTH = canvas.width - CARD_GAP;
  slides.forEach((slide, index) => {
    slide.image.onload = () => { slide.ready = true; requestRender?.(); };
    slide.image.onerror = () => { slides.splice(index, 1); };
    slide.image.src = sourceUrl(paths[index]);
  });

  const drawContain = (image, offsetX = 0) => {
    const scale = Math.min(CARD_WIDTH / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    ctx.drawImage(image, offsetX + (CARD_WIDTH - width) / 2, (canvas.height - height) / 2, width, height);
  };

  return {
    texture,
    step(now = performance.now()) {
      if (disposed) return;
      const delta = Math.min((now - lastTime) / 1000, .1); lastTime = now;
      const readySlides = slides.filter(slide => slide.ready);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!readySlides.length) {
        ctx.fillStyle = '#FFFFFF'; ctx.font = '900 46px Roboto, Arial, sans-serif';
        ctx.textAlign = 'center'; ctx.fillText('ĐANG TẢI HÌNH ẢNH HỘI NHẬP', canvas.width / 2, canvas.height / 2);
      } else {
        elapsedOnSlide += delta;
        if (elapsedOnSlide >= HOLD_SECONDS + SLIDE_SECONDS) {
          slideIndex = (slideIndex + 1) % readySlides.length;
          elapsedOnSlide = 0;
        }
        const progress = Math.max(0, (elapsedOnSlide - HOLD_SECONDS) / SLIDE_SECONDS);
        const current = readySlides[slideIndex % readySlides.length].image;
        const next = readySlides[(slideIndex + 1) % readySlides.length].image;
        drawContain(current, -canvas.width * progress);
        if (progress > 0) drawContain(next, canvas.width * (1 - progress));
      }
      texture.needsUpdate = true; requestRender?.();
    },
    dispose() { disposed = true; texture.dispose(); }
  };
}
export function buildInternationalMapBoard({ parent, addTextPanel, registerInteractive, renderer, requestRender }) {
  const root = new THREE.Group(); root.name = "hnue-international-map-board";
  root.position.set(0, 10.75, .10); parent.add(root);
  addFramedPanel(root, 56, 22, 0);

  const header = new THREE.Mesh(new THREE.BoxGeometry(54.9, 2.65, .075), panelMaterial(COLORS.navy, { metalness: .18, roughness: .46 }));
  header.position.set(0, 9.15, .31); root.add(header);
  const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(44.8, .12, .03), new THREE.MeshBasicMaterial({ color: COLORS.gold }));
  goldAccent.position.set(5.0, 7.88, .37); root.add(goldAccent);
  addTextPanel("HỘI NHẬP QUỐC TẾ", [0, 9.56, .37], [34, 1.32], 0, {
    size: 116, minFontSize: 94, color: "#FFFFFF", background: "transparent", border: false,
    weight: 900, wrap: false, width: 6600, height: 250, lineHeight: 132, unlit: true
  }, root);
  addTextPanel("KẾT NỐI TRI THỨC · MỞ RỘNG TẦM NHÌN · CÙNG KIẾN TẠO TƯƠNG LAI", [0, 8.35, .37], [52, .58], 0, {
    size: 46, minFontSize: 40, color: "#FFFFFF", background: "transparent", border: false,
    weight: 900, wrap: false, width: 8000, height: 92, lineHeight: 56, unlit: true
  }, root);

  const mapRoot = new THREE.Group(); mapRoot.position.set(-8.85, -.15, .35); root.add(mapRoot);
  addFramedPanel(mapRoot, 37.5, 15.3, 0);
  const mapBundle = createMapTexture(requestRender);
  mapBundle.texture.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE.width, MAP_SIZE.height), new THREE.MeshBasicMaterial({ map: mapBundle.texture }));
  mapPlane.position.z = .24; mapRoot.add(mapPlane);

  const infoRoot = new THREE.Group(); infoRoot.position.set(19.0, -.15, .35); root.add(infoRoot);
  addFramedPanel(infoRoot, 16.4, 15.3, 0);
  const imageFrame = new THREE.Mesh(new THREE.BoxGeometry(15.85, 14.75, .045), panelMaterial(COLORS.navy, { metalness: .12, roughness: .5 }));
  imageFrame.position.set(0, 0, .22); infoRoot.add(imageFrame);
  const imageTrim = new THREE.Mesh(new THREE.BoxGeometry(15.55, 14.4, .035), panelMaterial(COLORS.gold, { metalness: .36, roughness: .34 }));
  imageTrim.position.set(0, 0, .255); infoRoot.add(imageTrim);
  const imageBacking = new THREE.Mesh(new THREE.BoxGeometry(15.22, 14.05, .03), new THREE.MeshBasicMaterial({ color: COLORS.white }));
  imageBacking.position.set(0, 0, .285); infoRoot.add(imageBacking);
  const imageMat = new THREE.MeshBasicMaterial({ color: COLORS.white, side: THREE.DoubleSide });
  const imageMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imageMat); imageMesh.position.set(0, 0, .31); infoRoot.add(imageMesh);
  const slideshowPaths = INTERNATIONAL_CONNECTIONS.filter(data=>Number.isFinite(data.topic)).map(imageForData).filter(Boolean);
  const slideshow = createContinuousSlideshow(slideshowPaths, requestRender);
  imageMat.map = slideshow.texture; imageMat.needsUpdate = true;
  imageMesh.scale.set(14.9, 13.85, 1);
  const infoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0 }));
  infoMesh.position.set(0, 0, -.1); infoRoot.add(infoMesh);

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

  let selectedCountry = "singapore"; let disposed = false; let infoTexture = null;
  const textureCache = new Map(); const interactiveMeshes = [];
  const textureLoader = new THREE.TextureLoader(); let imageRequestToken = 0;

  function updateImage(data) {
    const path = imageForData(data); if (!path) return;
    const apply = texture => {
      if (disposed || selectedCountry !== data.id) return;
      imageMat.map = texture; imageMat.color.setHex(COLORS.white); imageMat.needsUpdate = true;
      const aspect = texture.image?.width && texture.image?.height ? texture.image.width / texture.image.height : 16 / 9;
      const maxW = 14.9, maxH = 13.85, drawW = Math.min(maxW, maxH * aspect);
      imageMesh.scale.set(drawW, drawW / aspect, 1); requestRender?.();
    };
    if (textureCache.has(path)) { apply(textureCache.get(path)); return; }
    const token = ++imageRequestToken;
    const texture = textureLoader.load(sourceUrl(path), () => {
      if (disposed) { texture.dispose(); return; }
      textureCache.set(path, texture); if (token === imageRequestToken) apply(texture);
    });
    texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter; texture.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  }

  function selectCountry(id) {
    const data = INTERNATIONAL_CONNECTIONS.find(item => item.id === id); if (!data) return;
    selectedCountry = id;
    for (const item of INTERNATIONAL_CONNECTIONS) {
      const active = item.id === id; const marker = markerEntries.get(item.id); const route = routeEntries.get(item.id);
      const verified=Number.isFinite(item.topic);
      marker.material.color.setHex(active ? COLORS.red : (verified?COLORS.gold:COLORS.blue)); marker.scale.setScalar(active ? 1.28 : 1);
      route.material.color.setHex(active ? COLORS.red : (verified?COLORS.gold:COLORS.blue)); route.material.opacity = active ? 1 : (verified?.62:.35);
    }
    infoTexture?.dispose(); infoTexture = createInfoTexture(data);
    infoMesh.material.map = infoTexture; infoMesh.material.needsUpdate = true;
    requestRender?.();
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

  // The full-width slideshow is the sole presentation surface; no country is selected by default.
  const abortController = new AbortController();
  fetch(MAP_SOURCE, { signal: abortController.signal }).then(response => {
    if (!response.ok) throw new Error(`Map data ${response.status}`); return response.json();
  }).then(data => { if (!disposed) mapBundle.drawGeoJson(data); }).catch(error => {
    if (error.name !== "AbortError") console.warn("Unable to load local international map data", error);
  });

  const controller = {
    sync() { slideshow.step(); },
    dispose() {
      if (disposed) return; disposed = true; abortController.abort(); imageRequestToken++;
      interactiveMeshes.forEach(mesh => { mesh.userData.action = () => {}; });
      infoTexture?.dispose(); slideshow.dispose(); mapBundle.texture.dispose(); textureCache.forEach(texture => texture.dispose()); textureCache.clear();
      root.traverse(object => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach(material => { material.map?.dispose?.(); material.dispose?.(); });
      });
    }
  };
  return { root, controller, selectCountry };
}

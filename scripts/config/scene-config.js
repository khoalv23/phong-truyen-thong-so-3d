/* ==========================================================================================
   0. HẰNG SỐ KIẾN TRÚC — theo Hồ sơ thiết kế tổng hợp Chủ đề 4 (mục 1 & mục 6)
   Gốc tọa độ (0,0,0) đặt tại tâm khối "Hạt nhân số". Z dương = hướng ra lối vào chính (Nam).
   ========================================================================================== */
export const HUB_R = 9;
export const ROOM_WIDTH_SCALE = 2;
export const ROOM_DEPTH_SCALE = 2;
export const BASE_RING_OUT = 30.3;
export const BASE_ROOM_W = 18;
export const BASE_ROOM_D = 19.5;
export const BASE_CORNER_ANGLE = 32.6 * Math.PI / 180;
const BASE_SOUTH_GATE_HALF = Math.cos(BASE_CORNER_ANGLE) * BASE_RING_OUT - Math.sin(BASE_CORNER_ANGLE) * (BASE_ROOM_W / 2);
const BASE_EAST_CONNECTOR_HALF = Math.sin(BASE_CORNER_ANGLE) * BASE_RING_OUT - Math.cos(BASE_CORNER_ANGLE) * (BASE_ROOM_W / 2);
export const ROOM_W = BASE_ROOM_W * ROOM_WIDTH_SCALE;
export const ROOM_D = BASE_ROOM_D * ROOM_DEPTH_SCALE;
export const CORNER_ANGLE = solveCornerAngle(ROOM_W);
export const RING_OUT = ringOutForRoomWidth(ROOM_W, CORNER_ANGLE);
export const R_BACK = RING_OUT + ROOM_D;
// Higher walls give the exhibition panels more breathing room above the floor.
export const CEIL_H = 25.2;
export const EXHIBIT_LIFT_Y = 2.25;
export const CEILING_JOIN_OVERLAP = 0.35;

function ringOutForRoomWidth(roomW, angle) {
  return (BASE_SOUTH_GATE_HALF + Math.sin(angle) * (roomW / 2)) / Math.cos(angle);
}

function solveCornerAngle(roomW) {
  let low = 1 * Math.PI / 180;
  let high = 89 * Math.PI / 180;
  for (let i = 0; i < 64; i++) {
    const mid = (low + high) / 2;
    const ringOut = ringOutForRoomWidth(roomW, mid);
    const eastHalf = Math.sin(mid) * ringOut - Math.cos(mid) * (roomW / 2);
    if (eastHalf < BASE_EAST_CONNECTOR_HALF) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}// Tỉ lệ quy đổi nội dung Phòng Góc 1: "Hồ sơ thiết kế chi tiết Phòng Góc 1" tính mọi kích
// thước/vị trí theo phòng GỐC 7×9m (trước các đợt phóng to). Quy đổi sang đúng phòng hiện tại
// bằng 2 tỉ lệ riêng theo từng trục — không làm lại kích thước phòng, chỉ scale vật thể/vị trí.
export const G1_SX = BASE_ROOM_W / 7;  // tỉ lệ theo bề rộng phòng gốc (7m)
export const G1_SZ = ROOM_D / 9;  // tỉ lệ theo chiều sâu phòng gốc (9m)
export const GOC1_FRAME_CENTER_Y = CEIL_H * .40; // cao độ trung bình cho cụm khung treo Góc 1.
export const VIEW_EYE_Y = GOC1_FRAME_CENTER_Y;
export const LOW_TITLE_STRIP_Y = 2.15;
export const HNUE_LOGO_SRC = "./resource/logo/LOGO_HNUE.png";
export const DOAN_LOGO_SRC = "./resource/logo/LOGO_DOAN.png";
// Phòng Góc 3 dùng thêm tỉ lệ riêng cho chiều cao (theo trần 4,5m gốc -> trần hiện tại), vì
// hồ sơ Góc 3 neo độ cao cành/nụ theo trần ("sát trần 4,5m") — rút kinh nghiệm từ Góc 1 (dùng
// tỉ lệ bề rộng cho chiều cao khiến vật bị thấp sát sàn so với trần 12m hiện tại).
export const G3_SX = BASE_ROOM_W / 7;
export const G3_SZ = ROOM_D / 9;
export const G3_SY = CEIL_H / 4.5;
export const WALL_T        = 0.3;     // độ dày tường (kích thước vật lý, không cần scale theo)
export const ENTRY_WALL_T  = WALL_T * 10;
export const WALL_BEIGE    = 0xf6efe2;
export const WALL_EMISSIVE = 0xeee5d4;
export const CEILING_BEIGE = 0xfffbf2;
export const ROOM_DEFS = {
  goc1: { theta: Math.PI + CORNER_ANGLE, label: "Miền 1", title: "CHUYỂN ĐỔI SỐ", subtitle: "Chuyển đổi số trong công tác Đoàn", accent: "#005baa", tone: 0x005baa },
  goc3: { theta: -CORNER_ANGLE,          label: "Miền 3", title: "HỘI NHẬP QUỐC TẾ", subtitle: "Hội nhập quốc tế", accent: "#6f8293", tone: 0x6f8293 },
  goc4: { theta: CORNER_ANGLE,           label: "Miền 3", title: "HỘI NHẬP QUỐC TẾ", subtitle: "Hội nhập quốc tế", accent: "#6f8293", tone: 0x6f8293 },
  goc5: { theta: Math.PI - CORNER_ANGLE, label: "Miền 2", title: "ĐỔI MỚI SÁNG TẠO", subtitle: "Đổi mới sáng tạo, khởi nghiệp", accent: "#f4b223", tone: 0xb8860b }
};

// Tính sẵn vector hướng (F: dọc trục sâu phòng, R: dọc trục rộng phòng) và 4 góc mỗi phòng.
// Topic assignment follows the current minimap colours and three-room plan.
Object.assign(ROOM_DEFS.goc5, {
  label: 'G\u00f3c 1',
  title: 'CHUY\u1ec2N \u0110\u1ed4I S\u1ed0 TRONG C\u00d4NG T\u00c1C \u0110O\u00c0N',
  subtitle: 'Chuy\u1ec3n \u0111\u1ed5i s\u1ed1 trong c\u00f4ng t\u00e1c \u0110o\u00e0n'
});
Object.assign(ROOM_DEFS.goc1, {
  label: 'G\u00f3c 2',
  title: '\u0110\u1ed4I M\u1edaI S\u00c1NG T\u1ea0O KH\u1edeI NGHI\u1ec6P',
  subtitle: '\u0110\u1ed5i m\u1edbi s\u00e1ng t\u1ea1o, kh\u1edfi nghi\u1ec7p'
});
[ROOM_DEFS.goc3, ROOM_DEFS.goc4].forEach(room => {
  Object.assign(room, {
    label: 'G\u00f3c 3',
    title: 'H\u1ed8I NH\u1eacP QU\u1ed0C T\u1ebe',
    subtitle: 'H\u1ed9i nh\u1eadp qu\u1ed1c t\u1ebf'
  });
});

for (const key in ROOM_DEFS) {
  const room = ROOM_DEFS[key];
  const F = [Math.cos(room.theta), Math.sin(room.theta)];
  const R = [-F[1], F[0]];
  const pt = (r, x) => [F[0] * r + R[0] * x, F[1] * r + R[1] * x];
  room.F = F; room.R = R;
  room.corners = {
    A: { door: pt(RING_OUT, -ROOM_W / 2), back: pt(R_BACK, -ROOM_W / 2) },
    B: { door: pt(RING_OUT,  ROOM_W / 2), back: pt(R_BACK,  ROOM_W / 2) }
  };
  room.center = [F[0] * (RING_OUT + ROOM_D / 2), F[1] * (RING_OUT + ROOM_D / 2)];
  room.groupRotY = Math.PI / 2 - room.theta;
}

// Phân loại 4 khoảng nối (Bắc/Đông/Nam/Tây): với 4 phòng có đúng 6 cặp có thể ghép, trong đó
// 4 cặp là THẬT SỰ kề nhau (khoảng cách góc cửa nhỏ) và 2 cặp còn lại là đường chéo đối diện
// (khoảng cách luôn lớn hơn hẳn). Lấy 4 cặp có khoảng cách nhỏ nhất — cách này đúng với mọi
// tỉ lệ kích thước, không phụ thuộc một ngưỡng số cố định (vốn chỉ đúng ở quy mô cũ, nhỏ).
export function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
export const ROOM_KEYS = ["goc1", "goc3", "goc4", "goc5"];
export const ALL_PAIRS = [];
for (let i = 0; i < ROOM_KEYS.length; i++) {
  for (let j = i + 1; j < ROOM_KEYS.length; j++) {
    const ra = ROOM_DEFS[ROOM_KEYS[i]], rb = ROOM_DEFS[ROOM_KEYS[j]];
    let best = null;
    for (const sa of ["A", "B"]) {
      for (const sb of ["A", "B"]) {
        const d = dist(ra.corners[sa].door, rb.corners[sb].door);
        if (!best || d < best.d) best = { d, sa, sb };
      }
    }
    ALL_PAIRS.push({ a: ROOM_KEYS[i], b: ROOM_KEYS[j], ...best });
  }
}
ALL_PAIRS.sort((p, q) => p.d - q.d);
export const CONNECTORS = ALL_PAIRS.slice(0, 4).map(({ a, b, sa, sb }) => {
  const ra = ROOM_DEFS[a], rb = ROOM_DEFS[b];
  const pA = ra.corners[sa].door, pB = rb.corners[sb].door;
  const mid = [(pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2];
  const dir = Math.abs(mid[1]) >= Math.abs(mid[0])
    ? (mid[1] > 0 ? "south" : "north")
    : (mid[0] > 0 ? "east" : "west");
  return { a, b, sideA: sa, sideB: sb, doorA: pA, doorB: pB, backA: ra.corners[sa].back, backB: rb.corners[sb].back, dir, mid };
});
export const SOUTH = CONNECTORS.find(c => c.dir === "south");
export const NORTH = CONNECTORS.find(c => c.dir === "north");
export const EAST_W = CONNECTORS.filter(c => c.dir === "east" || c.dir === "west");
// Hai cánh phòng phía Đông được gộp thành Miền 3. Connector này chỉ còn là phần sàn/trần
// nối, không dựng các vách ngăn giữa hai không gian nữa.
export const MERGED_REGION_KEYS = ["goc3", "goc4"];
export const MERGED_REGION_CONNECTOR = CONNECTORS.find(c =>
  c.dir === "east" && MERGED_REGION_KEYS.includes(c.a) && MERGED_REGION_KEYS.includes(c.b)
);
export const NORTH_WALL_RETREAT = 0; // tuong Bac nam tai dau tuong goc phong; do lui duoc xu ly bang RING_OUT

export function retreatConnectorDoor(connector, amount) {
  const len = Math.hypot(connector.mid[0], connector.mid[1]) || 1;
  const ox = connector.mid[0] / len * amount;
  const oz = connector.mid[1] / len * amount;
  const targetMid = [connector.mid[0] + ox, connector.mid[1] + oz];
  const pointOnSideAt = (door, back) => {
    if (Math.abs(oz) >= Math.abs(ox)) {
      const t = (targetMid[1] - door[1]) / (back[1] - door[1] || 1);
      return [door[0] + (back[0] - door[0]) * t, targetMid[1]];
    }
    const t = (targetMid[0] - door[0]) / (back[0] - door[0] || 1);
    return [targetMid[0], door[1] + (back[1] - door[1]) * t];
  };
  return {
    ...connector,
    doorA: pointOnSideAt(connector.doorA, connector.backA),
    doorB: pointOnSideAt(connector.doorB, connector.backB),
    mid: targetMid
  };
}

export const NORTH_RECESSED = retreatConnectorDoor(NORTH, NORTH_WALL_RETREAT);

// Toạ độ then chốt của lối vào chính (Nam) — suy ra trực tiếp từ hình học 2 phòng Góc4/Góc5.
export const GATE_Z    = SOUTH.doorA[1];                     // độ sâu "cổng thắt"
export const GATE_HALF = Math.abs(SOUTH.doorB[0]);            // nửa độ rộng cổng thắt
export const FLARE_Z    = SOUTH.backA[1];                      // độ sâu góc đáy phòng (điểm loe tối đa theo tường phòng)
export const FLARE_HALF = Math.abs(SOUTH.backB[0]);            // nửa độ rộng tại góc đáy phòng
export const R_OUT       = Math.hypot(FLARE_HALF, FLARE_Z);     // bán kính vòng ngoài cùng (dùng cho khoảng nối Bắc/Đông/Tây)
// Tiền sảnh ngoài được ĐẨY LÊN để bắt đầu NGAY TẠI góc đáy phòng (FLARE_Z) với đúng độ rộng
// đó (FLARE_HALF) — tức tường bên của tiền sảnh là phần NỐI DÀI THẲNG của tường trong Góc4/Góc5,
// không còn khe/bậc như thiết kế cũ (khi đó tiền sảnh hẹp hơn và lùi ra sau cung tường ngoài).
export const VEST_HALF  = FLARE_HALF;                          // nửa rộng đoạn nối = đúng bằng nửa rộng chỗ loe
export const VEST_Z0     = FLARE_Z;                             // đoạn nối bắt đầu ngay tại góc đáy phòng

// TIỀN SẢNH NGOÀI (cổng vào phía sau, khác với "sảnh chính" chứa Hạt nhân số ở giữa): chỉ nối
// THẲNG với 2 phòng, rộng không đổi = VEST_HALF — không loe rộng thêm nữa (đã bỏ bớt vì trước
// đây bị hiểu nhầm là "sảnh chính" nên lỡ mở quá rộng). Cuối tiền sảnh là tường có khoét cửa.
export const HALL_Z1        = VEST_Z0 + 16;                        // tiền sảnh ngoài (rộng = VEST_HALF), sâu 16m
export const DOOR_HALF     = Math.min(6, VEST_HALF * .22);         // nửa rộng cửa ra vào khoét trên tường cuối
export const ENTRY_Z1       = HALL_Z1 + 6;                          // thềm nhỏ ngoài cửa, sâu 6m — nơi camera xuất phát

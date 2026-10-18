import {
  GATE_HALF,
  GATE_Z,
  HUB_R,
  MERGED_REGION_CONNECTOR,
  RING_OUT,
  ROOM_DEFS,
  ROOM_KEYS,
  SOUTH,
} from "../config/scene-config.js";
import { playerDot } from "./dom-elements.js";

let lastMapX = Number.NaN;
let lastMapZ = Number.NaN;

/* ==========================================================================================
   9. MINIMAP SVG - ve tinh 1 lan theo dung hinh hoc, cap nhat cham dinh vi theo toa do the gioi
   ========================================================================================== */
export function buildMinimap() {
  const svgNS = "http://www.w3.org/2000/svg";
  const g = document.getElementById("map-static");

  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", 0); ring.setAttribute("cy", 0); ring.setAttribute("r", RING_OUT);
  ring.setAttribute("fill", "#8fa9bb"); ring.setAttribute("opacity", "0.9");
  g.appendChild(ring);

  ROOM_KEYS.filter(key => key !== "goc3" && key !== "goc4").forEach(key => {
    const room = ROOM_DEFS[key];
    const c = room.corners;
    const poly = document.createElementNS(svgNS, "polygon");
    const pts = [c.A.door, c.B.door, c.B.back, c.A.back].map(p => p.join(",")).join(" ");
    poly.setAttribute("points", pts);
    poly.setAttribute("fill", room.accent);
    poly.setAttribute("opacity", "0.85");
    poly.setAttribute("stroke", "#6f8293");
    poly.setAttribute("stroke-width", "0.12");
    g.appendChild(poly);
  });

  if (MERGED_REGION_CONNECTOR) {
    const northEast = ROOM_DEFS.goc3;
    const southEast = ROOM_DEFS.goc4;
    const mergedRoom = document.createElementNS(svgNS, "polygon");
    const points = [
      northEast.corners.A.door,
      northEast.corners.A.back,
      northEast.corners.B.back,
      southEast.corners.A.back,
      southEast.corners.B.back,
      southEast.corners.B.door,
      southEast.corners.A.door,
      northEast.corners.B.door
    ].map(point => point.join(",")).join(" ");
    mergedRoom.setAttribute("points", points);
    mergedRoom.setAttribute("fill", ROOM_DEFS.goc3.accent);
    mergedRoom.setAttribute("opacity", "0.85");
    mergedRoom.setAttribute("stroke", "#6f8293");
    mergedRoom.setAttribute("stroke-width", "0.12");
    g.appendChild(mergedRoom);
  }
  const hub = document.createElementNS(svgNS, "circle");
  hub.setAttribute("cx", 0); hub.setAttribute("cy", 0); hub.setAttribute("r", HUB_R);
  hub.setAttribute("fill", "#f4f7f9"); hub.setAttribute("stroke", "#d6b86f"); hub.setAttribute("stroke-width", "0.15");
  g.appendChild(hub);

  const gate = document.createElementNS(svgNS, "polygon");
  const gatePts = [
    [-GATE_HALF, RING_OUT], [GATE_HALF, RING_OUT], SOUTH.doorB, SOUTH.doorA
  ].map(p => p.join(",")).join(" ");
  gate.setAttribute("points", gatePts);
  gate.setAttribute("fill", "#8fa9bb"); gate.setAttribute("opacity", "0.9");
  g.appendChild(gate);

  const southVest = document.createElementNS(svgNS, "rect");
  const southDoorHalf = Math.min(6, GATE_HALF * .44);
  southVest.setAttribute("x", -southDoorHalf); southVest.setAttribute("y", GATE_Z);
  southVest.setAttribute("width", southDoorHalf * 2); southVest.setAttribute("height", 4.8);
  southVest.setAttribute("fill", "#8fa9bb"); southVest.setAttribute("opacity", "0.9");
  g.appendChild(southVest);


}

export function updatePlayerMapIndicator(camera) {
  if (!playerDot || !camera) return;
  const x = camera.position.x;
  const z = camera.position.z;
  if (Math.abs(x - lastMapX) < 0.025 && Math.abs(z - lastMapZ) < 0.025) return;
  lastMapX = x;
  lastMapZ = z;
  playerDot.setAttribute("cx", x.toFixed(2));
  playerDot.setAttribute("cy", z.toFixed(2));
}

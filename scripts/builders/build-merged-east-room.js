import * as THREE from "three";

/** Builds the combined east region while keeping its geometry decisions explicit. */
export function buildMergedEastRoom({
  scene,
  roomDefs,
  connector,
  createDiagonalRoom,
  angleOf,
  outerRadius,
  wallThickness,
  ceilingHeight,
  floorMaterial,
  wallMaterial,
  createFlatFloorPatch,
  createDropCeiling,
  createStraightGapWall,
  buildExhibits
}) {
  const northEast = roomDefs.goc3;
  const southEast = roomDefs.goc4;
  if (!connector) {
    createDiagonalRoom("goc3");
    createDiagonalRoom("goc4");
    return;
  }

  // The straight East wall is the real room boundary. Keep the ceiling,
  // circulation and exhibition footprint on the same chord.
  const outline = [
    northEast.corners.A.door,
    northEast.corners.A.back,
    northEast.corners.B.back,
    southEast.corners.A.back,
    southEast.corners.B.back,
    southEast.corners.B.door,
    southEast.corners.A.door,
    northEast.corners.B.door
  ];
  createDropCeiling(outline);

  [
    [northEast.corners.A.door, northEast.corners.A.back],
    [northEast.corners.A.back, northEast.corners.B.back],
    // The middle east wall deliberately uses the exact same straight-wall
    // module as the two former room end walls: matching thickness, material,
    // ceiling overlap, and gold trims on both faces.
    [northEast.corners.B.back, southEast.corners.A.back],
    [southEast.corners.A.back, southEast.corners.B.back],
    [southEast.corners.B.back, southEast.corners.B.door]
  ].forEach(([from, to]) => createStraightGapWall(from, to, ceilingHeight, wallThickness, wallMaterial));

  const contentGroup = new THREE.Group();
  contentGroup.name = "merged-east-room-content";
  scene.add(contentGroup);
  createDiagonalRoom('goc3', contentGroup, { skipShell: true, eastEndpointPlant: true });
  createDiagonalRoom('goc4', contentGroup, { skipShell: true, eastEndpointPlant: true });
  buildExhibits?.(contentGroup);
}

function shortArcOrder(a1, a2) {
  let start = Math.min(a1, a2);
  let end = Math.max(a1, a2);
  if (end - start > Math.PI) [start, end] = [end, start + Math.PI * 2];
  return [start, end];
}

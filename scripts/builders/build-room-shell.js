import { createBox } from "../objects/architecture/primitives.js";

/**
 * Builds only the architectural shell of one diagonal room.  Exhibits remain
 * outside this builder so the room geometry can be reused independently.
 */
export function buildRoomShell({
  parent,
  roomKey,
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
}) {
  const centerZ = ringOut + roomDepth / 2;
  // Sink walls 0.02 below y=0 so their bottom face never z-fights the floor mesh.
  const WALL_SINK = 0.02;
  const wallHeight = ceilingHeight + ceilingJoinOverlap + WALL_SINK;

  parent.add(createBox({
    name: `${roomKey}-back-wall`,
    size: [roomWidth + wallThickness * 2, wallHeight, wallThickness],
    position: [0, wallHeight / 2 - WALL_SINK, roomBack],
    material: materials.innerWall
  }));

  const tileHeight = 1.05;
  const tilePitch = 3.15;
  const addBaseTiles = ({ name, length, at }) => {
    const tileCount = Math.max(1, Math.ceil(length / tilePitch));
    const tileLength = length / tileCount;
    for (let index = 0; index < tileCount; index++) {
      parent.add(createBox({
        name,
        size: [Math.max(.2, tileLength - .055), tileHeight, .06],
        position: at(-length / 2 + tileLength * (index + .5)),
        material: materials.baseboard
      }));
    }
  };
  addBaseTiles({
    name: `${roomKey}-back-base-tile`,
    length: roomWidth + wallThickness * 2,
    at: x => [x, tileHeight / 2, roomBack - wallThickness / 2 - .035]
  });
  parent.add(createBox({
    name: `${roomKey}-back-base-cap`,
    size: [roomWidth + wallThickness * 2, .14, .12],
    position: [0, tileHeight + .07, roomBack - wallThickness / 2 - .05],
    material: materials.trim
  }));

  parent.add(createBox({
    name: `${roomKey}-back-trim`,
    size: [roomWidth + wallThickness * 2, .18, .12],
    position: [0, ceilingHeight - .1, roomBack - wallThickness / 2 - .05],
    material: materials.trim
  }));

  const southUnifiedSideSign = roomKey === "goc4" ? -1 : (roomKey === "goc5" ? 1 : 0);
  [-1, 1].forEach(sideSign => {
    const isMergedRegionSharedSide = (roomKey === "goc3" && sideSign === 1) || (roomKey === "goc4" && sideSign === -1);
    if (isMergedRegionSharedSide) return;

    const sideThickness = sideSign === southUnifiedSideSign ? southOuterWallThickness : wallThickness;
    const innerFaceX = sideSign * (roomWidth / 2 - wallThickness / 2);
    parent.add(createBox({
      name: `${roomKey}-side-wall`,
      size: [sideThickness, wallHeight, roomDepth + wallThickness],
      position: [innerFaceX + sideSign * sideThickness / 2, wallHeight / 2 - WALL_SINK, centerZ + wallThickness / 2],
      material: materials.wall
    }));

    const trimFaces = sideThickness > wallThickness
      ? [innerFaceX - sideSign * .06, innerFaceX + sideSign * (sideThickness + .06)]
      : [innerFaceX - sideSign * .06];
    trimFaces.forEach(trimX => {
      parent.add(createBox({
        name: `${roomKey}-side-trim`,
        size: [.12, .18, roomDepth + wallThickness],
        position: [trimX, ceilingHeight - .1, centerZ + wallThickness / 2],
        material: materials.trim
      }));

      const tileCount = Math.max(1, Math.ceil((roomDepth + wallThickness) / tilePitch));
      const tileLength = (roomDepth + wallThickness) / tileCount;
      for (let index = 0; index < tileCount; index++) {
        parent.add(createBox({
          name: `${roomKey}-side-base-tile`,
          size: [.06, tileHeight, Math.max(.2, tileLength - .055)],
          position: [trimX, tileHeight / 2, centerZ + wallThickness / 2 - (roomDepth + wallThickness) / 2 + tileLength * (index + .5)],
          material: materials.baseboard
        }));
      }
      parent.add(createBox({
        name: `${roomKey}-side-base-cap`,
        size: [.12, .14, roomDepth + wallThickness],
        position: [trimX, tileHeight + .07, centerZ + wallThickness / 2],
        material: materials.trim
      }));
    });
  });

  createDropCeiling(roomWidth + wallThickness * 2, roomDepth, ceilingHeight + .5, centerZ, parent);
}

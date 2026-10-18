import * as THREE from "three";

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

/** Owns movement bounds and keyboard locomotion without depending on scene globals. */
export function createNavigationSystem({
  camera,
  keys,
  getYaw,
  setYaw,
  updateCameraRotation,
  isModalOpen,
  geometry
}) {
  const moveForward = new THREE.Vector3();
  const moveRight = new THREE.Vector3();
  const moveVector = new THREE.Vector3();
  const {
    connectors,
    mergedRegionConnector,
    roomDefs,
    roomKeys,
    hubRadius,
    ringOut,
    roomBack,
    roomWidth,
    wallThickness,
    gateHalf,
    gateZ,
    southEntryVestDepth
  } = geometry;

  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const wallClearance = wallThickness / 2 + .35;


  function isTooCloseToSegment(x, z, from, to) {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const lengthSq = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - from[0]) * dx + (z - from[1]) * dz) / lengthSq));
    return Math.hypot(x - (from[0] + dx * t), z - (from[1] + dz * t)) < wallClearance;
  }

  function isPointInMergedEastRoom(x, z) {
    if (!mergedRegionConnector) return false;
    const northEast = roomDefs.goc3;
    const southEast = roomDefs.goc4;
    // The physical East boundary is the straight exhibition wall, not the
    // decorative ceiling arc beyond it.
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
    if (!isPointInPolygon(x, z, outline)) return false;

    // Stop only at the five built perimeter walls. The shared doorway between
    // the two wings and the entrance toward the central ring remain open.
    const walls = [
      [northEast.corners.A.door, northEast.corners.A.back],
      [northEast.corners.A.back, northEast.corners.B.back],
      [northEast.corners.B.back, southEast.corners.A.back],
      [southEast.corners.A.back, southEast.corners.B.back],
      [southEast.corners.B.back, southEast.corners.B.door]
    ];
    return !walls.some(([from, to]) => isTooCloseToSegment(x, z, from, to));
  }

  // The doorway is an open, continuous floor strip. Keep it separate from
  // the generic connector rules so no join seam can become a collision line.
  function isPointInMergedEastGateway(x, z) {
    if (!mergedRegionConnector) return false;
    const midR = Math.hypot(mergedRegionConnector.mid[0], mergedRegionConnector.mid[1]) || 1;
    const forward = [mergedRegionConnector.mid[0] / midR, mergedRegionConnector.mid[1] / midR];
    const right = [-forward[1], forward[0]];
    const localR = x * forward[0] + z * forward[1];
    const localX = x * right[0] + z * right[1];
    const halfDoor = distance(mergedRegionConnector.doorA, mergedRegionConnector.doorB) / 2;
    return localR >= ringOut - .35 && localR <= midR + .55 && Math.abs(localX) <= halfDoor - wallClearance;
  }

  function isWalkable(x, z) {
    const radius = Math.hypot(x, z);
    if (radius >= hubRadius + .25 && radius <= ringOut + .05) return true;
    if (isPointInMergedEastGateway(x, z)) return true;
    if (isPointInMergedEastRoom(x, z)) return true;

    for (const connector of connectors) {
      // The East doorway is handled by isPointInMergedEastGateway() above.
      // North and west connectors remain closed; the south entrance is open.
      if (connector.dir !== 'south') continue;
      const midR = Math.hypot(connector.mid[0], connector.mid[1]) || 1;
      const forward = [connector.mid[0] / midR, connector.mid[1] / midR];
      const right = [-forward[1], forward[0]];
      const localR = x * forward[0] + z * forward[1];
      const localX = x * right[0] + z * right[1];
      const halfDoor = distance(connector.doorA, connector.doorB) / 2;
      if (localR >= ringOut - .15 && localR <= midR + .2 && Math.abs(localX) <= halfDoor - .25) return true;
    }

    for (const key of roomKeys) {
      if (key === 'goc3' || key === 'goc4') continue;
      const room = roomDefs[key];
      const localR = x * room.F[0] + z * room.F[1];
      const localX = x * room.R[0] + z * room.R[1];
      if (
        localR >= ringOut - .6 &&
        localR <= roomBack - wallClearance &&
        Math.abs(localX) <= roomWidth / 2 - wallClearance
      ) return true;
    }

    if (Math.abs(x) <= gateHalf - .05 && z >= ringOut - .1 && z <= gateZ) return true;
    const southDoorHalf = Math.min(6, gateHalf * .44);
    return Math.abs(x) <= southDoorHalf - .2 && z >= gateZ - .15 && z <= gateZ + southEntryVestDepth - .25;
  }

  function update(delta) {
    if (!keys.size || isModalOpen()) return false;
    const speed = keys.has("shift") ? 10.4 : 7.4;
    let changed = false;
    let yaw = getYaw();
    moveForward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    moveRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
    moveVector.set(0, 0, 0);
    if (keys.has("w") || keys.has("arrowup")) moveVector.add(moveForward);
    if (keys.has("s") || keys.has("arrowdown")) moveVector.sub(moveForward);
    if (keys.has("a")) moveVector.sub(moveRight);
    if (keys.has("d")) moveVector.add(moveRight);
    if (keys.has("arrowleft") || keys.has("q")) { yaw += 1.75 * delta; changed = true; }
    if (keys.has("arrowright") || keys.has("e")) { yaw -= 1.75 * delta; changed = true; }
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      const nextX = camera.position.x + moveVector.x;
      const nextZ = camera.position.z + moveVector.z;
      if (isWalkable(nextX, camera.position.z)) camera.position.x = nextX;
      if (isWalkable(camera.position.x, nextZ)) camera.position.z = nextZ;
      changed = true;
    }
    if (changed) {
      setYaw(yaw);
      updateCameraRotation();
    }
    return changed;
  }

  return { isWalkable, update };
}

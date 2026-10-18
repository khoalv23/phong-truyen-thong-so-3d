import * as THREE from "three";

/** Groups small per-frame scene updates that only depend on the injected registries. */
export function createSceneUpdateSystem({
  camera,
  expertProximityIcons,
  roomOnlyVisibilityGroups,
  spinningTurntables,
  roomWidth,
  wallThickness,
  ringOut,
  roomBack
}) {
  const worldPosition = new THREE.Vector3();
  const localCamera = new THREE.Vector3();

  function updateExpertProximity() {
    let changed = false;
    expertProximityIcons.forEach(({ icon, glow }) => {
      icon.getWorldPosition(worldPosition);
      const distance = camera.position.distanceTo(worldPosition);
      const target = Math.max(0, 1 - distance / 6) * 14;
      if (Math.abs(target - glow.intensity) > .02) changed = true;
      glow.intensity += (target - glow.intensity) * .12;
    });
    return changed;
  }

  function updateRoomOnlyVisibility() {
    let changed = false;
    roomOnlyVisibilityGroups.forEach(({ group, roomGroup }) => {
      localCamera.copy(camera.position);
      roomGroup.worldToLocal(localCamera);
      const shouldShow =
        Math.abs(localCamera.x) <= roomWidth / 2 - wallThickness &&
        localCamera.z >= ringOut + .6 &&
        localCamera.z <= roomBack - .6;
      if (group.visible !== shouldShow) {
        group.visible = shouldShow;
        changed = true;
      }
    });
    return changed;
  }

  function updateTurntables(delta) {
    let changed = false;
    spinningTurntables.forEach(({ mesh, speed }) => {
      if (mesh.getWorldPosition(worldPosition).distanceTo(camera.position) > 22) return;
      mesh.rotation.y += speed * delta;
      changed = true;
    });
    return changed;
  }

  return { updateExpertProximity, updateRoomOnlyVisibility, updateTurntables };
}

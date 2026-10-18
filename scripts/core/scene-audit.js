/**
 * Produces a lightweight, serializable scene signature for visual-regression
 * checks. It deliberately does not mutate Three.js objects.
 */
export function collectSceneAudit(scene, registries = {}, options = {}) {
  const counts = { objects: 0, meshes: 0, lights: 0, groups: 0 };
  const roomContentKeys = [];
  let mergedEastContentGroups = 0;
  scene.traverse(object => {
    counts.objects++;
    if (object.isMesh) counts.meshes++;
    if (object.isLight) counts.lights++;
    if (object.isGroup) counts.groups++;
    if (object.name === 'merged-east-room-content') {
      mergedEastContentGroups++;
    } else {
      const match = /^(.+)-room-content$/.exec(object.name);
      if (match) roomContentKeys.push(match[1]);
    }
  });

  const expectedRoomKeys = options.expectedRoomKeys ?? [];
  const duplicateRoomContentKeys = roomContentKeys.filter((key, index) => roomContentKeys.indexOf(key) !== index);
  const missingRoomContentKeys = expectedRoomKeys.filter(key => !roomContentKeys.includes(key));
  const unexpectedRoomContentKeys = roomContentKeys.filter(key => !expectedRoomKeys.includes(key));

  return {
    ...counts,
    interactive: registries.interactive?.length ?? 0,
    roomOnlyVisibilityGroups: registries.roomOnlyVisibilityGroups?.length ?? 0,
    expertProximityIcons: registries.expertProximityIcons?.length ?? 0,
    spinningTurntables: registries.spinningTurntables?.length ?? 0,
    architecture: {
      roomContentKeys: [...roomContentKeys].sort(),
      duplicateRoomContentKeys: [...new Set(duplicateRoomContentKeys)].sort(),
      missingRoomContentKeys,
      unexpectedRoomContentKeys: [...new Set(unexpectedRoomContentKeys)].sort(),
      mergedEastContentGroups,
      valid: duplicateRoomContentKeys.length === 0 &&
        missingRoomContentKeys.length === 0 &&
        unexpectedRoomContentKeys.length === 0 &&
        mergedEastContentGroups === 1
    }
  };
}

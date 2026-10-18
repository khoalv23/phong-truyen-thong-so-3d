/**
 * Runtime state shared by scene builders.
 *
 * Builders receive this object explicitly instead of reaching into module-level
 * variables.  The existing arrays are injected so the runtime behaviour and
 * object registration order remain unchanged during the migration.
 */
export function createSceneContext({
  scene,
  camera,
  renderer,
  materials,
  requestRender,
  registries = {}
}) {
  return {
    scene,
    camera,
    renderer,
    materials,
    requestRender,
    interactive: registries.interactive ?? [],
    roomOnlyVisibilityGroups: registries.roomOnlyVisibilityGroups ?? [],
    expertProximityIcons: registries.expertProximityIcons ?? [],
    spinningTurntables: registries.spinningTurntables ?? []
  };
}

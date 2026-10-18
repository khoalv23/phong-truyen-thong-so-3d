/** Owns requestAnimationFrame scheduling and delegates scene-specific updates. */
export function createRenderLoop({
  clock,
  renderer,
  scene,
  camera,
  updateMovement,
  updateExpertProximity,
  updateRoomOnlyVisibility,
  updateTurntables,
  syncMedia,
  updatePlayerIndicator,
  shouldRender,
  markRendered,
  hasActiveVideoTexture,
  onFailure
}) {
  let running = false;
  let frameId = null;
  let failureReported = false;

  function stop() {
    running = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  }

  function tick() {
    if (!running) return;
    frameId = requestAnimationFrame(tick);
    try {
      const delta = Math.min(clock.getDelta(), .1);
      const moved = updateMovement(delta);
      const proximityChanged = updateExpertProximity();
      const roomVisibilityChanged = updateRoomOnlyVisibility();
      syncMedia?.();
      const turntableChanged = updateTurntables(delta);
      if (shouldRender() || moved || proximityChanged || roomVisibilityChanged || turntableChanged || hasActiveVideoTexture()) {
        if (shouldRender() || moved) updatePlayerIndicator(camera);
        renderer.render(scene, camera);
        markRendered();
      }
    } catch (error) {
      stop();
      if (!failureReported) {
        failureReported = true;
        onFailure?.(error);
      }
    }
  }

  function start() {
    if (running) return;
    running = true;
    frameId = requestAnimationFrame(tick);
  }

  function resetFailure() {
    failureReported = false;
  }

  return { start, stop, resetFailure };
}

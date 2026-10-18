# Production Runtime Review Checklist

Open the scene with production preview:

```text
scene/scene-4/Chu_De_4.html?ideaTreeProductionPreview=1&ideaTreeShadow=tree-mass
```

Use debug view:

```text
scene/scene-4/Chu_De_4.html?ideaTreeProductionPreview=1&ideaTreeDebug=1&ideaTreeShadow=tree-mass
```

## Required Screenshots

- [ ] Main camera, no debug.
- [ ] Main camera, anchor/debug enabled.
- [ ] Front view of niche.
- [ ] Side-depth view.
- [ ] Close-up bark view.

## Console Checks

Run after the scene is stable:

```js
await window.__ideaTreeMeasureFPS(10000)
window.__ideaTreeRuntimeReview()
await window.__ideaTreeLifecycleValidation(3)
```

Save the console output for:

- [ ] FPS average/min/max.
- [ ] Frame screen-space rectangles.
- [ ] Frame overlap warnings.
- [ ] Frame-to-tree-mass distance report.
- [ ] Lifecycle renderer memory before/after each load/dispose.
- [ ] Interactive object count before/after each load/dispose.

## Shadow Checks

Capture or inspect these URLs:

```text
?ideaTreeProductionPreview=1&ideaTreeShadow=none
?ideaTreeProductionPreview=1&ideaTreeShadow=tree-mass
?ideaTreeProductionPreview=1&ideaTreeShadow=all
```

Preferred candidate is `tree-mass` unless screenshots or FPS show a clear issue.

## Known Review Notes

- Production is not default yet.
- Runtime rope is independent from the frame.
- `RopeTop_Hanging_01` through `RopeTop_Hanging_04` are expected in the production GLB.
- Missing RopeTop warnings must be zero before production can be enabled by default.
- Pass 2 runtime review must include screenshots plus FPS and lifecycle console output before changing the default `assetMode`.

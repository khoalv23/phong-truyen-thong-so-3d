# Idea Tree GLB Asset Contract

`idea-tree-validation.glb` is a technical regression asset only. It must not be used as the visual basis for the final tree and must not be used for aesthetic acceptance screenshots.

## Source File Roles

- `idea-tree-blockout-template.blend`: regenerable bootstrap/template file.
- `idea-tree-art-blockout.blend`: artist-owned manual blockout file. Do not overwrite this with scripts after manual editing starts.
- `idea-tree-production.blend`: future production sculpt/source file, created during the production sculpt phase.
- `tools/create-blender-art-blockout.py`: bootstrap/template generator only. It must not be used to generate the final tree silhouette.

## Scene Niche Reference

- Niche width: `15.2 m`.
- Niche height: `11.0 m`.
- Niche depth: `1.8 m`.
- Niche base height above room floor: `0.4 m`.
- Niche frame thickness: `0.24 m`.
- Niche corner radius reference: `0.12 m`.
- Tree asset must fit these dimensions at root scale `[1, 1, 1]`.
- Target blockout occupancy: 82-89% width, 82-89% usable height, 61-72% depth.
- Target tree bounds: width `12.5-13.5 m`, height `9.0-9.8 m`, depth `1.1-1.3 m`.

## Units

- Unit: meters.
- One GLB unit must equal one scene meter.
- Apply transforms before export unless a node is explicitly an anchor.

## Origin And Placement

- Root node name: `IdeaTreeRoot`.
- Root origin: bottom center of the wall niche, on the back-wall centerline.
- Positive Y is up.
- Local +Z is viewer-facing/front, toward the room interior.
- Local -Z is toward the back wall.

## Front Direction

- The tree front must face local +Z.
- Frames should face local +Z unless an anchor intentionally rotates them.
- Mesh normals must point outward. Do not rely on double-sided materials for trunk, branches, or roots.

## Viewer Left And Right

- `viewer-left` means the visitor's left when facing the final wall niche.
- In asset local space, viewer-left is local -X.
- `viewer-right` is local +X.

## Required Nodes

- `IdeaTreeRoot`
- `TreeStatic`
- `Trunk`
- `MainBranches`
- `ButtressRoots`
- `SecondaryBranches`
- `Foliage`
- `FrameAnchors`
- `HangingSystem`
- `IdeaFrames`
- `LightingHelpers`
- `InteractionHotspots`

## Required Anchors

- `Anchor_Trunk_01`
- `Anchor_Trunk_02`
- `Anchor_Branch_L_01`
- `Anchor_Branch_L_02`
- `Anchor_Branch_R_01`
- `Anchor_Branch_R_02`
- `Anchor_Hanging_01`
- `Anchor_Hanging_02`
- `Anchor_Hanging_03`
- `Anchor_Hanging_04`

## Anchor Axes

- Anchor local +Z points out from the wall, toward the visitor.
- Anchor local +Y points upward.
- Anchor local +X points to the frame's local right edge.
- Anchor scale must be positive and normally `[1, 1, 1]`.
- Do not use negative scale or mirrored parents.

## Scale Rules

- Keep `IdeaTreeRoot.scale = [1, 1, 1]`.
- Use real mesh dimensions instead of root scaling whenever possible.
- Anchors may have rotation and translation, but should not have non-uniform scale.

## Material Naming

- Bark: `MAT_tree_bark_*`
- Leaves: `MAT_leaf_*`
- Rope: `MAT_rope_*`
- Frame: `MAT_frame_*`
- Metal hardware: `MAT_hardware_*`

## Texture Naming

- Base color: `*_basecolor.*`
- Normal: `*_normal.*`
- Roughness: `*_roughness.*`
- Ambient occlusion: `*_ao.*`
- Metallic roughness packed map: `*_metallicRoughness.*`

Base color textures must be treated as sRGB. Normal, roughness, metallic and AO maps must be linear/non-sRGB.

## Triangle Budget

- Trunk, roots and main branches: 50k-120k triangles.
- Secondary branches: 15k-40k triangles.
- Leaves: use atlas and instancing where possible.
- Validation/prototype assets may be much lower, but must preserve node and material contracts.

## Texture Budget

- Web default bark texture: 2048 square.
- High quality bark texture: 4096 square only after performance testing.
- Frame images: 512-1024 square or equivalent aspect resolution.
- Leaf atlas: 1024-2048 square.

## GLB Export

- Export `.glb`, not loose `.gltf` for handoff.
- Export selected production objects only.
- Keep node names exactly as listed.
- Export Principled BSDF-compatible PBR material slots.
- Remove unused cameras, lights, hidden objects and duplicate materials.
- Check normals, UVs and texture links before export.
- Do not export Draco, Meshopt or KTX2 in this validation phase.

## Artist Handoff Checklist

- [ ] The imported art blockout GLB fits fully inside the final back-wall niche.
- [ ] Origin is at the bottom center of the tree base.
- [ ] 1 Blender unit equals 1 meter.
- [ ] Root base is broad, trunk is low, and branching starts early.
- [ ] There are 4-6 organic main branches.
- [ ] All 10 anchors exist.
- [ ] Anchors follow viewer-left/viewer-right naming correctly.
- [ ] No object or parent has negative scale.
- [ ] Frames are not baked into trunk or branch meshes.
- [ ] Leaves are secondary supporting elements.
- [ ] Silhouette is checked from the main visitor camera.
- [ ] Niche proxy or bounding volume matching `15.2 x 11.0 x 1.8 m` is present in the Blender source.
- [ ] Main branch spread has been widened manually, without non-uniform root scale.
- [ ] Root and buttress roots have been widened manually to visually balance the wider crown.
- [ ] Reference camera matching the main scene view is present in the Blender source.
- [ ] Frame proxy locations remain readable and do not overlap.
- [ ] Tree depth is checked from a side view before GLB export.
- [ ] Root and required group nodes exist.
- [ ] All 10 anchors exist and face local +Z toward visitors.
- [ ] No anchor or parent has negative scale.
- [ ] Trunk, branches and roots have outward normals.
- [ ] Bark material includes base color, normal and roughness.
- [ ] Base color is authored as sRGB.
- [ ] Normal, roughness and AO are authored as linear data.
- [ ] Tree fits inside the wall niche and does not spill onto side walls.
- [ ] Leaves are secondary and do not hide trunk/branch structure.
- [ ] Frames and hanging ropes have clear attachment logic.
- [ ] GLB opens in a glTF viewer without validation errors.

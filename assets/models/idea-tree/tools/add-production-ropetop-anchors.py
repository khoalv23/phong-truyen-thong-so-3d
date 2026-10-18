import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-production.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-production.glb")

ROPE_TOPS = {
    "RopeTop_Hanging_01": {
        "anchor": "Anchor_Hanging_01",
        "parent": "MainBranch_ViewerLeft_Low",
        "location": (-6.28, -0.0, 5.36),
    },
    "RopeTop_Hanging_02": {
        "anchor": "Anchor_Hanging_02",
        "parent": "MainBranch_ViewerLeft_High",
        "location": (-1.65, -0.03, 7.48),
    },
    "RopeTop_Hanging_03": {
        "anchor": "Anchor_Hanging_03",
        "parent": "MainBranch_ViewerRight_High",
        "location": (1.65, -0.03, 7.38),
    },
    "RopeTop_Hanging_04": {
        "anchor": "Anchor_Hanging_04",
        "parent": "MainBranch_ViewerRight_Low",
        "location": (6.13, -0.0, 5.33),
    },
}

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

anchors_parent = bpy.data.objects.get("FrameAnchors") or bpy.data.objects.get("IdeaTreeRoot")

for name, spec in ROPE_TOPS.items():
    old = bpy.data.objects.get(name)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)

    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "ARROWS"
    empty.empty_display_size = 0.28
    empty.location = Vector(spec["location"])
    empty.rotation_euler = (0, 0, 0)
    empty.scale = (1, 1, 1)

    parent = bpy.data.objects.get(spec["parent"]) or anchors_parent
    if parent:
        parent.matrix_world.inverted()
        world = empty.location.copy()
        empty.parent = parent
        empty.matrix_parent_inverse = parent.matrix_world.inverted()
        empty.location = parent.matrix_world.inverted() @ world

    collection = bpy.data.collections.get("FrameAnchors")
    if collection:
        collection.objects.link(empty)
    else:
        bpy.context.scene.collection.objects.link(empty)

for obj in bpy.data.objects:
    obj.select_set(True)

bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    use_selection=True,
    export_apply=False,
    export_yup=True,
    export_cameras=False,
    export_lights=False
)

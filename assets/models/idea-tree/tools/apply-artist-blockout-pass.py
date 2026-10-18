import math
import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-art-blockout.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-art-blockout.glb")

WIDTH_BAKE = 1.52
HEIGHT_BAKE = 1.15
DEPTH_BAKE = 1.08

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0

SKIP_COLLECTIONS = {"SceneReference"}
ANCHORS = {
    "Anchor_Trunk_01": (-1.05, 2.95, 0.42, (0.0, 0.0, -0.06)),
    "Anchor_Trunk_02": (0.82, 3.78, 0.40, (0.0, -0.08, 0.04)),
    "Anchor_Branch_L_01": (-4.25, 5.15, 0.22, (0.02, 0.16, -0.12)),
    "Anchor_Branch_L_02": (-2.55, 6.78, 0.16, (-0.02, 0.12, 0.08)),
    "Anchor_Branch_R_01": (4.05, 5.0, 0.22, (0.02, -0.16, 0.12)),
    "Anchor_Branch_R_02": (2.55, 6.62, 0.16, (-0.02, -0.12, -0.08)),
    "Anchor_Hanging_01": (-6.1, 4.75, 0.06, (0.0, 0.08, -0.04)),
    "Anchor_Hanging_02": (-1.45, 7.28, 0.06, (0.0, 0.04, -0.02)),
    "Anchor_Hanging_03": (1.45, 7.18, 0.06, (0.0, -0.04, 0.02)),
    "Anchor_Hanging_04": (5.95, 4.72, 0.06, (0.0, -0.08, 0.04)),
}

def is_scene_reference(obj):
    return any(col.name in SKIP_COLLECTIONS for col in obj.users_collection)

def tree_coord_to_blender(x, y_up, z_front):
    return Vector((x, -z_front, y_up))

def apply_baked_silhouette_transform(obj):
    if is_scene_reference(obj):
        return
    if obj.type == "MESH":
        local_matrix = obj.matrix_local.copy()
        for vertex in obj.data.vertices:
            point = local_matrix @ vertex.co
            point.x *= WIDTH_BAKE
            point.y *= DEPTH_BAKE
            point.z *= HEIGHT_BAKE
            vertex.co = point
        obj.data.update()
        obj.location = (0, 0, 0)
        obj.rotation_euler = (0, 0, 0)
        obj.scale = (1, 1, 1)
    elif obj.type == "EMPTY":
        if obj.name in {
            "IdeaTreeRoot",
            "TreeStatic",
            "ButtressRoots",
            "MainBranches",
            "SecondaryBranches",
            "Foliage",
            "FrameAnchors",
            "HangingSystem",
            "IdeaFrames",
            "LightingHelpers",
            "InteractionHotspots",
        }:
            return
        obj.location.x *= WIDTH_BAKE
        obj.location.y *= DEPTH_BAKE
        obj.location.z *= HEIGHT_BAKE

for obj in list(bpy.data.objects):
    apply_baked_silhouette_transform(obj)

for name, (x, y_up, z_front, rot) in ANCHORS.items():
    obj = bpy.data.objects.get(name)
    if not obj:
        continue
    obj.location = tree_coord_to_blender(x, y_up, z_front)
    obj.rotation_euler = rot
    obj.scale = (1, 1, 1)

for obj in bpy.data.objects:
    if obj.name == "IdeaTreeRoot":
        obj.location = (0, 0, 0)
        obj.rotation_euler = (0, 0, 0)
        obj.scale = (1, 1, 1)

min_floor = None
for obj in bpy.data.objects:
    if obj.type != "MESH" or is_scene_reference(obj):
        continue
    for vertex in obj.data.vertices:
        z = (obj.matrix_world @ vertex.co).z
        min_floor = z if min_floor is None else min(min_floor, z)

if min_floor is not None and abs(min_floor) > 1e-5:
    for obj in bpy.data.objects:
        if is_scene_reference(obj):
            continue
        if obj.name in {"IdeaTreeRoot", "TreeStatic", "ButtressRoots", "MainBranches", "SecondaryBranches", "Foliage", "FrameAnchors", "HangingSystem", "IdeaFrames", "LightingHelpers", "InteractionHotspots"}:
            continue
        obj.location.z -= min_floor

for obj in bpy.data.objects:
    obj.select_set(False)

for obj in bpy.data.objects:
    if not is_scene_reference(obj):
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

import os
import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-art-blockout.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-art-blockout.glb")
GROUP_EMPTY_NAMES = {
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
}

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

def is_scene_reference(obj):
    return any(col.name == "SceneReference" for col in obj.users_collection)

min_floor = None
for obj in bpy.data.objects:
    if obj.type != "MESH" or is_scene_reference(obj):
        continue
    for vertex in obj.data.vertices:
        z = (obj.matrix_world @ vertex.co).z
        min_floor = z if min_floor is None else min(min_floor, z)

if min_floor is not None and abs(min_floor) > 1e-5:
    for obj in bpy.data.objects:
        if is_scene_reference(obj) or obj.name in GROUP_EMPTY_NAMES:
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

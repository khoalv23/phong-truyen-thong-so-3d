import os
import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-production.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-production.glb")

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

for material in bpy.data.materials:
    if "bark" in material.name.lower() or "rope" in material.name.lower():
        material.use_backface_culling = True
        material.show_transparent_back = False
    if "leaf" in material.name.lower() or "frame" in material.name.lower():
        material.use_backface_culling = False

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

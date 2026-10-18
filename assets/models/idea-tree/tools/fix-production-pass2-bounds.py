import os
import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-production.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-production.glb")

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)

def editable_mesh(obj):
    return obj.type == "MESH" and not obj.name.startswith("FrameProxy_")

# Compress only mesh depth slightly in Blender local Y. Do not move anchors or frame layout.
for obj in bpy.data.objects:
    if not editable_mesh(obj):
        continue
    for vertex in obj.data.vertices:
        vertex.co.y *= 0.92
    obj.location.y *= 0.92
    obj.data.update()

min_floor = None
for obj in bpy.data.objects:
    if not editable_mesh(obj):
        continue
    for vertex in obj.data.vertices:
        z = (obj.matrix_world @ vertex.co).z
        min_floor = z if min_floor is None else min(min_floor, z)

if min_floor is not None and min_floor < 0:
    for obj in bpy.data.objects:
        if editable_mesh(obj):
            obj.location.z -= min_floor

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

import math
import os
import sys
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = sys.argv[-1] if sys.argv[-1].lower().endswith(".blend") else os.path.join(ROOT, "idea-tree-art-blockout.blend")

NICHE = {
    "width": 15.2,
    "height": 11.0,
    "depth": 1.8,
    "baseHeight": 0.4,
}

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0

old = bpy.data.collections.get("SceneReference")
if old:
    for obj in list(old.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(old)

ref_col = bpy.data.collections.new("SceneReference")
scene.collection.children.link(ref_col)

mat = bpy.data.materials.new("MAT_reference_niche_bounds")
mat.diffuse_color = (0.1, 0.55, 1.0, 0.28)

def link_only(obj, collection):
    for col in obj.users_collection:
        col.objects.unlink(obj)
    collection.objects.link(obj)

bpy.ops.mesh.primitive_cube_add(
    size=1,
    location=(0, -NICHE["depth"] / 2, NICHE["baseHeight"] + NICHE["height"] / 2)
)
box = bpy.context.object
box.name = "NicheBoundingVolume_15_2x11_0x1_8m"
box.dimensions = (NICHE["width"], NICHE["depth"], NICHE["height"])
box.display_type = "WIRE"
box.show_wire = True
box.show_in_front = True
box.data.materials.append(mat)
link_only(box, ref_col)

bpy.ops.mesh.primitive_cube_add(
    size=1,
    location=(0, 0.01, NICHE["baseHeight"] + NICHE["height"] / 2)
)
back = bpy.context.object
back.name = "NicheBackPlaneReference"
back.dimensions = (NICHE["width"], 0.02, NICHE["height"])
back.display_type = "WIRE"
back.show_in_front = True
back.data.materials.append(mat)
link_only(back, ref_col)

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

cam_data = bpy.data.cameras.new("MainSceneReferenceCamera")
cam = bpy.data.objects.new("MainSceneReferenceCamera", cam_data)
cam.location = (0, -11.5, 4.7)
look_at(cam, (0, -0.55, 4.7))
cam.data.lens = 28
ref_col.objects.link(cam)

side_data = bpy.data.cameras.new("SideDepthReferenceCamera")
side = bpy.data.objects.new("SideDepthReferenceCamera", side_data)
side.location = (7.6, -2.4, 4.2)
look_at(side, (0, -0.6, 4.2))
side.data.lens = 35
ref_col.objects.link(side)

scene.camera = cam

for obj in bpy.data.objects:
    obj.select_set(False)

bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-production.blend")

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
scene = bpy.context.scene
engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "CYCLES"
if scene.render.engine == "CYCLES":
    scene.cycles.samples = 10
scene.render.resolution_x = 1100
scene.render.resolution_y = 760
scene.world.color = (0.78, 0.8, 0.84)

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

def make_camera(name, location, target, lens):
    data = bpy.data.cameras.new(name)
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    look_at(obj, target)
    obj.data.lens = lens
    scene.collection.objects.link(obj)
    return obj

light_data = bpy.data.lights.new("Pass2Detail_Area", "AREA")
light = bpy.data.objects.new("Pass2Detail_Area", light_data)
light.location = (-1.5, -3.5, 8.0)
light.data.energy = 900
light.data.size = 4.0
scene.collection.objects.link(light)

views = [
    ("production-pass2-closeup-bark.png", make_camera("Pass2_Closeup_Bark", (-1.4, -3.4, 3.1), (-0.2, 0.0, 3.2), 58)),
    ("production-pass2-frame-rope-detail.png", make_camera("Pass2_Frame_Rope", (-5.8, -3.2, 5.2), (-5.7, 0.0, 5.0), 54)),
]

for file_name, camera in views:
    scene.camera = camera
    scene.render.filepath = os.path.join(ROOT, file_name)
    bpy.ops.render.render(write_still=True)

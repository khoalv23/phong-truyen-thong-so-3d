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
    scene.cycles.samples = 6
scene.render.resolution_x = 1100
scene.render.resolution_y = 760
scene.world.color = (0.78, 0.8, 0.84)

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

def camera(name, location, target, lens):
    data = bpy.data.cameras.new(name)
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    look_at(obj, target)
    obj.data.lens = lens
    scene.collection.objects.link(obj)
    return obj

light_data = bpy.data.lights.new("ProductionReview_Area", "AREA")
light = bpy.data.objects.new("ProductionReview_Area", light_data)
light.location = (0, -4.5, 10.5)
light.data.energy = 780
light.data.size = 7.0
scene.collection.objects.link(light)

views = [
    ("production-review-main.png", camera("ProductionReview_Main", (0, -12.5, 4.85), (0, -0.45, 4.9), 28)),
    ("production-review-front.png", camera("ProductionReview_Front", (0, -13.5, 5.2), (0, -0.55, 5.2), 35)),
    ("production-review-side-depth.png", camera("ProductionReview_SideDepth", (9.4, -2.8, 4.7), (0, -0.6, 4.7), 35)),
]

for file_name, cam in views:
    scene.camera = cam
    scene.render.filepath = os.path.join(ROOT, file_name)
    bpy.ops.render.render(write_still=True)

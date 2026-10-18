import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT, "idea-tree-art-blockout.blend"))
scene = bpy.context.scene
engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "CYCLES"
if scene.render.engine == "CYCLES":
    scene.cycles.samples = 8
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
scene.world.color = (0.78, 0.8, 0.84)

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

data = bpy.data.cameras.new("Review_SideDepth_RenderOnly")
camera = bpy.data.objects.new("Review_SideDepth_RenderOnly", data)
camera.location = (9.4, -2.8, 4.7)
look_at(camera, (0, -0.6, 4.7))
camera.data.lens = 35
scene.collection.objects.link(camera)
scene.camera = camera

light_data = bpy.data.lights.new("Review_Side_Area", "AREA")
light = bpy.data.objects.new("Review_Side_Area", light_data)
light.location = (0, -4.5, 10.5)
light.data.energy = 600
light.data.size = 6
scene.collection.objects.link(light)

scene.render.filepath = os.path.join(ROOT, "art-blockout-side-depth.png")
bpy.ops.render.render(write_still=True)

import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-art-blockout.blend")
OUT_DIR = ROOT

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
scene = bpy.context.scene
engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "CYCLES"
if scene.render.engine == "CYCLES":
    scene.cycles.samples = 24
scene.render.resolution_x = 1440
scene.render.resolution_y = 1000
scene.world.color = (0.78, 0.8, 0.84)

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

def ensure_camera(name, location, target, lens):
    obj = bpy.data.objects.get(name)
    if not obj:
        data = bpy.data.cameras.new(name)
        obj = bpy.data.objects.new(name, data)
        bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    look_at(obj, target)
    obj.data.lens = lens
    return obj

views = [
    ("art-blockout-main-no-debug.png", ensure_camera("Review_Main_NoDebug", (0, -12.5, 4.85), (0, -0.45, 4.9), 28)),
    ("art-blockout-main-anchor-debug.png", ensure_camera("Review_Main_AnchorDebug", (0, -12.5, 4.85), (0, -0.45, 4.9), 28)),
    ("art-blockout-front.png", ensure_camera("Review_Front", (0, -13.5, 5.2), (0, -0.55, 5.2), 35)),
    ("art-blockout-side-depth.png", ensure_camera("Review_SideDepth", (9.4, -2.8, 4.7), (0, -0.6, 4.7), 35)),
]

anchor_names = {
    "Anchor_Trunk_01", "Anchor_Trunk_02", "Anchor_Branch_L_01", "Anchor_Branch_L_02",
    "Anchor_Branch_R_01", "Anchor_Branch_R_02", "Anchor_Hanging_01", "Anchor_Hanging_02",
    "Anchor_Hanging_03", "Anchor_Hanging_04"
}

debug_objects = []
debug_mat = bpy.data.materials.new("MAT_anchor_debug_review")
debug_mat.diffuse_color = (1.0, 0.18, 0.05, 1.0)
for name in anchor_names:
    anchor = bpy.data.objects.get(name)
    if not anchor:
        continue
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.09, location=anchor.matrix_world.translation)
    marker = bpy.context.object
    marker.name = f"ReviewMarker_{name}"
    marker.data.materials.append(debug_mat)
    debug_objects.append(marker)
    font_curve = bpy.data.curves.new(f"ReviewLabelCurve_{name}", "FONT")
    font_curve.body = name
    font_curve.align_x = "CENTER"
    font_curve.size = 0.16
    label = bpy.data.objects.new(f"ReviewLabel_{name}", font_curve)
    label.location = anchor.matrix_world.translation + Vector((0, -0.02, 0.22))
    look_at(label, (label.location.x, label.location.y - 1, label.location.z))
    bpy.context.scene.collection.objects.link(label)
    debug_objects.append(label)

light_data = bpy.data.lights.new("Review_Key_Area", "AREA")
light = bpy.data.objects.new("Review_Key_Area", light_data)
light.location = (0, -4.5, 10.5)
light.data.energy = 600
light.data.size = 6
bpy.context.scene.collection.objects.link(light)
debug_objects.append(light)

for name in anchor_names:
    obj = bpy.data.objects.get(name)
    if obj:
        obj.empty_display_size = 0.7
        obj.show_name = True
        obj.show_in_front = True

for file_name, camera in views:
    show_debug = "anchor" in file_name
    for obj in debug_objects:
        obj.hide_viewport = not show_debug
        obj.hide_render = not show_debug
    light.hide_viewport = False
    light.hide_render = False
    for name in anchor_names:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.hide_viewport = not show_debug
            obj.hide_render = not show_debug
    scene.camera = camera
    scene.render.filepath = os.path.join(OUT_DIR, file_name)
    bpy.ops.render.render(write_still=True)

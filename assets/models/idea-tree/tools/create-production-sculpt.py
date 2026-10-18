import math
import os
import bpy
from mathutils import Vector
from mathutils.noise import noise

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_BLEND = os.path.join(ROOT, "idea-tree-art-blockout.blend")
PRODUCTION_BLEND = os.path.join(ROOT, "idea-tree-production.blend")
PRODUCTION_GLB = os.path.join(ROOT, "idea-tree-production.glb")
TEXTURE_DIR = os.path.abspath(os.path.join(ROOT, "..", "..", "textures", "idea-tree", "production"))

TREE_MASS_KEYWORDS = ("Trunk", "Branch", "Root")
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

os.makedirs(TEXTURE_DIR, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0

reference = bpy.data.collections.get("SceneReference")
if reference:
    for obj in list(reference.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(reference)

def save_texture(name, width, height, pixel_fn, colorspace="sRGB"):
    image = bpy.data.images.new(name, width=width, height=height, alpha=True)
    pixels = []
    for y in range(height):
        for x in range(width):
            pixels.extend(pixel_fn(x, y, width, height))
    image.pixels = pixels
    image.filepath_raw = os.path.join(TEXTURE_DIR, name)
    image.file_format = "PNG"
    image.colorspace_settings.name = colorspace
    image.save()
    return image.filepath_raw

def fract(value):
    return value - math.floor(value)

def bark_height(x, y, w, h):
    u = x / max(1, w - 1)
    v = y / max(1, h - 1)
    grooves = math.sin(u * math.tau * 18 + noise(Vector((u * 3.0, v * 9.0, 0))) * 2.8)
    fine = noise(Vector((u * 34.0, v * 18.0, 1.7)))
    knots = noise(Vector((u * 8.0, v * 5.0, 8.2)))
    return max(0.0, min(1.0, 0.52 + grooves * 0.18 + fine * 0.16 + knots * 0.08))

def basecolor(x, y, w, h):
    hgt = bark_height(x, y, w, h)
    n = noise(Vector((x * 0.06, y * 0.045, 2.0))) * 0.5 + 0.5
    r = 0.20 + hgt * 0.15 + n * 0.05
    g = 0.12 + hgt * 0.09 + n * 0.035
    b = 0.07 + hgt * 0.045 + n * 0.025
    return (r, g, b, 1.0)

def roughness(x, y, w, h):
    hgt = bark_height(x, y, w, h)
    value = 0.82 + (1.0 - hgt) * 0.12
    return (value, value, value, 1.0)

def normal_map(x, y, w, h):
    sx = bark_height(min(w - 1, x + 1), y, w, h) - bark_height(max(0, x - 1), y, w, h)
    sy = bark_height(x, min(h - 1, y + 1), w, h) - bark_height(x, max(0, y - 1), w, h)
    strength = 3.6
    n = Vector((-sx * strength, -sy * strength, 1.0)).normalized()
    return (n.x * 0.5 + 0.5, n.y * 0.5 + 0.5, n.z * 0.5 + 0.5, 1.0)

base_path = save_texture("tree_bark_basecolor.png", 1024, 1024, basecolor, "sRGB")
normal_path = save_texture("tree_bark_normal.png", 1024, 1024, normal_map, "Non-Color")
roughness_path = save_texture("tree_bark_roughness.png", 1024, 1024, roughness, "Non-Color")

def make_bark_material():
    material = bpy.data.materials.new("MAT_tree_bark_production_pbr")
    material.use_backface_culling = True
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.88

    base_node = nodes.new("ShaderNodeTexImage")
    base_node.name = "tree_bark_basecolor"
    base_node.image = bpy.data.images.load(base_path, check_existing=True)
    base_node.image.colorspace_settings.name = "sRGB"
    links.new(base_node.outputs["Color"], bsdf.inputs["Base Color"])

    normal_tex = nodes.new("ShaderNodeTexImage")
    normal_tex.name = "tree_bark_normal"
    normal_tex.image = bpy.data.images.load(normal_path, check_existing=True)
    normal_tex.image.colorspace_settings.name = "Non-Color"
    normal_node = nodes.new("ShaderNodeNormalMap")
    normal_node.inputs["Strength"].default_value = 0.8
    links.new(normal_tex.outputs["Color"], normal_node.inputs["Color"])
    links.new(normal_node.outputs["Normal"], bsdf.inputs["Normal"])

    rough_node = nodes.new("ShaderNodeTexImage")
    rough_node.name = "tree_bark_roughness"
    rough_node.image = bpy.data.images.load(roughness_path, check_existing=True)
    rough_node.image.colorspace_settings.name = "Non-Color"
    links.new(rough_node.outputs["Color"], bsdf.inputs["Roughness"])
    return material

bark_material = make_bark_material()

def is_tree_mass(obj):
    return obj.type == "MESH" and any(key in obj.name for key in TREE_MASS_KEYWORDS)

def sculpt_tree_mesh(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    sub = obj.modifiers.new("Production_Simple_Subdivision", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    sub.subdivision_type = "SIMPLE"
    bpy.ops.object.modifier_apply(modifier=sub.name)

    obj.data.materials.clear()
    obj.data.materials.append(bark_material)
    obj.data.update()
    for poly in obj.data.polygons:
        poly.use_smooth = True

    obj.data.update()
    for vertex in obj.data.vertices:
        co = vertex.co
        long = co.z
        radial = math.hypot(co.x, co.y)
        large = noise(Vector((co.x * 0.55, co.y * 0.55, co.z * 0.72)))
        groove = math.sin((math.atan2(co.y, co.x) + long * 0.72) * 13.0 + noise(Vector((co.x, co.y, co.z))) * 2.5)
        fine = noise(Vector((co.x * 8.0, co.y * 8.0, co.z * 3.4)))
        bark = large * 0.035 + groove * 0.018 + fine * 0.012
        if "Root" in obj.name:
            bark += math.sin(radial * 7.5 + co.x * 0.8) * 0.025
        vertex.co += vertex.normal.normalized() * bark
    obj.data.update()

for obj in list(bpy.data.objects):
    if is_tree_mass(obj):
        sculpt_tree_mesh(obj)

leaf_mat = bpy.data.materials.get("MAT_leaf_proxy_art_blockout")
if leaf_mat:
    leaf_mat.name = "MAT_leaf_proxy_production_support"
    leaf_mat.diffuse_color = (0.16, 0.38, 0.18, 0.62)
    leaf_mat.use_backface_culling = False

for obj in bpy.data.objects:
    if obj.name in GROUP_EMPTY_NAMES:
        obj.scale = (1, 1, 1)
    if obj.name.startswith("Anchor_"):
        obj.scale = (1, 1, 1)

min_floor = None
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    for vertex in obj.data.vertices:
        z = (obj.matrix_world @ vertex.co).z
        min_floor = z if min_floor is None else min(min_floor, z)

if min_floor is not None and abs(min_floor) > 1e-5:
    for obj in bpy.data.objects:
        if obj.name in GROUP_EMPTY_NAMES:
            continue
        obj.location.z -= min_floor

for obj in bpy.data.objects:
    obj.select_set(True)

bpy.ops.wm.save_as_mainfile(filepath=PRODUCTION_BLEND)
bpy.ops.export_scene.gltf(
    filepath=PRODUCTION_GLB,
    export_format="GLB",
    use_selection=True,
    export_apply=False,
    export_yup=True,
    export_cameras=False,
    export_lights=False
)

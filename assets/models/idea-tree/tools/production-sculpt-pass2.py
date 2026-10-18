import math
import os
import bpy
from mathutils import Vector
from mathutils.noise import noise

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-production.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-production.glb")
TEXTURE_DIR = os.path.abspath(os.path.join(ROOT, "..", "..", "textures", "idea-tree", "production"))

os.makedirs(TEXTURE_DIR, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0

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

def collection_object(name):
    return bpy.data.objects.get(name)

def material_node(name, base=(0.2, 0.12, 0.06, 1), roughness=0.85, backface=True):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = backface
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Metallic"].default_value = 0
    bsdf.inputs["Roughness"].default_value = roughness
    return mat

def height_fn(x, y, w, h):
    u = x / max(1, w - 1)
    v = y / max(1, h - 1)
    long_groove = math.sin(u * math.tau * 24 + noise(Vector((u * 4.0, v * 7.0, 1.0))) * 4.0)
    vertical = math.sin((u + v * 0.08) * math.tau * 13)
    fine = noise(Vector((u * 42.0, v * 18.0, 4.7)))
    knot = noise(Vector((u * 8.0, v * 6.0, 12.2)))
    value = 0.48 + long_groove * 0.18 + vertical * 0.08 + fine * 0.18 + knot * 0.1
    return max(0.0, min(1.0, value))

def save_texture(name, width, height, pixel_fn, colorspace):
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

def basecolor_px(x, y, w, h):
    hgt = height_fn(x, y, w, h)
    warm = noise(Vector((x * 0.025, y * 0.017, 2.4))) * 0.5 + 0.5
    cool = noise(Vector((x * 0.011, y * 0.033, 8.1))) * 0.5 + 0.5
    r = 0.16 + hgt * 0.17 + warm * 0.08
    g = 0.095 + hgt * 0.095 + cool * 0.055
    b = 0.055 + hgt * 0.045 + cool * 0.035
    if (x // 83 + y // 149) % 5 == 0:
        r *= 0.86
        g *= 0.9
        b *= 0.92
    return (r, g, b, 1)

def roughness_px(x, y, w, h):
    hgt = height_fn(x, y, w, h)
    value = 0.86 + (1 - hgt) * 0.1
    return (value, value, value, 1)

def normal_px(x, y, w, h):
    sx = height_fn(min(w - 1, x + 1), y, w, h) - height_fn(max(0, x - 1), y, w, h)
    sy = height_fn(x, min(h - 1, y + 1), w, h) - height_fn(x, max(0, y - 1), w, h)
    n = Vector((-sx * 4.2, -sy * 4.2, 1)).normalized()
    return (n.x * 0.5 + 0.5, n.y * 0.5 + 0.5, n.z * 0.5 + 0.5, 1)

base_path = save_texture("tree_bark_basecolor.png", 1024, 1024, basecolor_px, "sRGB")
normal_path = save_texture("tree_bark_normal.png", 1024, 1024, normal_px, "Non-Color")
rough_path = save_texture("tree_bark_roughness.png", 1024, 1024, roughness_px, "Non-Color")

bark_mat = material_node("MAT_tree_bark_production_pbr", roughness=0.9, backface=True)
nodes = bark_mat.node_tree.nodes
links = bark_mat.node_tree.links
bsdf = nodes.get("Principled BSDF")
for node in list(nodes):
    if node.type == "TEX_IMAGE" or node.type == "NORMAL_MAP":
        nodes.remove(node)
base_node = nodes.new("ShaderNodeTexImage")
base_node.image = bpy.data.images.load(base_path, check_existing=True)
base_node.image.colorspace_settings.name = "sRGB"
normal_tex = nodes.new("ShaderNodeTexImage")
normal_tex.image = bpy.data.images.load(normal_path, check_existing=True)
normal_tex.image.colorspace_settings.name = "Non-Color"
normal_node = nodes.new("ShaderNodeNormalMap")
normal_node.inputs["Strength"].default_value = 1.15
rough_node = nodes.new("ShaderNodeTexImage")
rough_node.image = bpy.data.images.load(rough_path, check_existing=True)
rough_node.image.colorspace_settings.name = "Non-Color"
links.new(base_node.outputs["Color"], bsdf.inputs["Base Color"])
links.new(normal_tex.outputs["Color"], normal_node.inputs["Color"])
links.new(normal_node.outputs["Normal"], bsdf.inputs["Normal"])
links.new(rough_node.outputs["Color"], bsdf.inputs["Roughness"])
bsdf.inputs["Metallic"].default_value = 0

leaf_mat = material_node("MAT_leaf_cluster_production", (0.11, 0.34, 0.16, 1), 0.72, backface=False)
rope_mat = bpy.data.materials.get("MAT_rope_art_blockout")
if rope_mat:
    rope_mat.use_backface_culling = True

def normalize(v):
    v = Vector(v)
    return v.normalized() if v.length else Vector((0, 0, 1))

def make_branch_mesh(name, points, radii, parent_name, mat, sides=14):
    verts, faces = [], []
    rings = []
    points = [Vector(p) for p in points]
    for i, p in enumerate(points):
        prev_p = points[max(0, i - 1)]
        next_p = points[min(len(points) - 1, i + 1)]
        tangent = normalize(next_p - prev_p)
        ref = Vector((0, 1, 0)) if abs(tangent.dot(Vector((0, 1, 0)))) < 0.85 else Vector((1, 0, 0))
        right = normalize(tangent.cross(ref))
        up = normalize(right.cross(tangent))
        ring = []
        for s in range(sides):
            t = s / sides * math.tau
            oval = 0.74 + 0.24 * math.sin(i * 1.7 + s * 0.9)
            r = radii[i] * oval
            p2 = p + right * math.cos(t) * r + up * math.sin(t) * r
            verts.append(tuple(p2))
            ring.append(len(verts) - 1)
        rings.append(ring)
    for i in range(len(rings) - 1):
        for s in range(sides):
            a = rings[i][s]
            b = rings[i][(s + 1) % sides]
            c = rings[i + 1][(s + 1) % sides]
            d = rings[i + 1][s]
            faces.append((a, d, c, b))
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    parent = collection_object(parent_name)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj

def sculpt_existing_tree_mass(obj):
    if not obj.type == "MESH" or not any(k in obj.name for k in ("Trunk", "Branch", "Root")):
        return
    if "Pass2_Subdivision" not in obj.modifiers:
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        sub = obj.modifiers.new("Pass2_Subdivision", "SUBSURF")
        sub.levels = 1
        sub.render_levels = 1
        sub.subdivision_type = "SIMPLE"
        bpy.ops.object.modifier_apply(modifier=sub.name)
    obj.data.materials.clear()
    obj.data.materials.append(bark_mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    for v in obj.data.vertices:
        co = v.co
        n = v.normal.normalized()
        twist = math.sin(co.z * 1.1 + math.atan2(co.y, co.x) * 3.4)
        groove = math.sin(math.atan2(co.y, co.x) * 18 + co.z * 4.2)
        lump = noise(Vector((co.x * 0.9, co.y * 0.9, co.z * 0.85)))
        fine = noise(Vector((co.x * 7.5, co.y * 7.5, co.z * 2.6)))
        amount = twist * 0.025 + groove * 0.035 + lump * 0.055 + fine * 0.018
        if "Trunk" in obj.name:
            amount += math.sin(co.z * 2.2 + co.x * 0.7) * 0.035
        if "Root" in obj.name:
            amount += math.sin(co.x * 4.8 + co.z * 1.2) * 0.025
        v.co += n * amount
    obj.data.update()

for obj in list(bpy.data.objects):
    sculpt_existing_tree_mass(obj)

# Add fuller buttress roots that blend into the trunk but stay within the approved bounds.
for old in list(bpy.data.objects):
    if old.name.startswith("ButtressRoot_P2_") or old.name.startswith("SecondaryBranch_P2_") or old.name.startswith("LeafCluster_P2_"):
        bpy.data.objects.remove(old, do_unlink=True)

root_defs = [
    ("ButtressRoot_P2_FrontLeft", [(-0.35, -0.06, 0.42), (-1.15, -0.33, 0.22), (-2.35, -0.42, 0.08), (-3.25, -0.45, 0.03)], [0.46, 0.32, 0.19, 0.07]),
    ("ButtressRoot_P2_FrontRight", [(0.22, -0.05, 0.43), (1.1, -0.32, 0.22), (2.25, -0.42, 0.08), (3.12, -0.44, 0.03)], [0.44, 0.31, 0.18, 0.07]),
    ("ButtressRoot_P2_LeftBack", [(-0.48, 0.14, 0.45), (-1.55, 0.34, 0.25), (-2.95, 0.38, 0.08), (-4.1, 0.32, 0.03)], [0.42, 0.29, 0.17, 0.06]),
    ("ButtressRoot_P2_RightBack", [(0.46, 0.12, 0.45), (1.48, 0.32, 0.25), (2.86, 0.38, 0.08), (3.95, 0.32, 0.03)], [0.42, 0.29, 0.17, 0.06]),
    ("ButtressRoot_P2_CenterRidge", [(0.0, -0.02, 0.55), (-0.18, -0.52, 0.25), (-0.28, -0.58, 0.06)], [0.38, 0.22, 0.075]),
]
for args in root_defs:
    make_branch_mesh(args[0], args[1], args[2], "ButtressRoots", bark_mat, sides=16)

branch_defs = [
    ("SecondaryBranch_P2_LeftTip", [(-4.2, 0.24, 5.05), (-5.05, 0.28, 5.55), (-5.75, 0.18, 5.82)], [0.09, 0.055, 0.02]),
    ("SecondaryBranch_P2_LeftHigh", [(-2.9, 0.32, 6.95), (-3.85, 0.28, 7.58), (-4.62, 0.16, 7.85)], [0.085, 0.052, 0.02]),
    ("SecondaryBranch_P2_RightHigh", [(2.9, 0.32, 6.9), (3.82, 0.28, 7.52), (4.55, 0.16, 7.78)], [0.085, 0.052, 0.02]),
    ("SecondaryBranch_P2_RightTip", [(4.28, 0.24, 4.95), (5.15, 0.28, 5.48), (5.85, 0.18, 5.74)], [0.09, 0.055, 0.02]),
]
for args in branch_defs:
    make_branch_mesh(args[0], args[1], args[2], "SecondaryBranches", bark_mat, sides=12)

# Replace old flat leaf planes with restrained 3D leaf clusters near branch ends and joints.
for obj in list(bpy.data.objects):
    if obj.name.startswith("LeafCluster_") and obj.type == "MESH":
        bpy.data.objects.remove(obj, do_unlink=True)

def add_leaf(name, loc, rot, scale, parent_name="Foliage"):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(leaf_mat)
    parent = collection_object(parent_name)
    if parent:
        obj.parent = parent
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

leaf_clusters = [
    (-5.35, 0.08, 5.82),
    (-4.35, 0.08, 7.65),
    (-0.35, 0.06, 8.72),
    (4.28, 0.08, 7.62),
    (5.42, 0.08, 5.72),
]
leaf_index = 0
for cx, cy, cz in leaf_clusters:
    for i in range(7):
        angle = i * 0.9 + cx * 0.13
        radius = 0.18 + (i % 3) * 0.07
        loc = (
            cx + math.cos(angle) * radius,
            cy + math.sin(angle * 1.7) * 0.08,
            cz + math.sin(angle) * radius * 0.55,
        )
        rot = (math.radians(18 + i * 7), math.radians(8 * math.sin(angle)), angle)
        scl = (0.11 + (i % 2) * 0.025, 0.028, 0.21 + (i % 3) * 0.035)
        add_leaf(f"LeafCluster_P2_{leaf_index:02d}", loc, rot, scl)
        leaf_index += 1

# Make rope visual thinner if static rope proxy is seen in GLB.
for obj in bpy.data.objects:
    if obj.name.startswith("Rope_") and obj.type == "MESH":
        obj.scale.x *= 0.62
        obj.scale.y *= 0.62

for obj in bpy.data.objects:
    if obj.name in GROUP_EMPTY_NAMES or obj.name.startswith("Anchor_") or obj.name.startswith("RopeTop_"):
        obj.scale = (1, 1, 1)

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

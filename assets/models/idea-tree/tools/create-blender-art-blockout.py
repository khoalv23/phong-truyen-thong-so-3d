import math
import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BLEND_PATH = os.path.join(ROOT, "idea-tree-blockout-template.blend")
GLB_PATH = os.path.join(ROOT, "idea-tree-blockout-template.glb")

# Bootstrap/template generator only.
# Do not point this script at idea-tree-art-blockout.blend after artist edits begin.
# The official art blockout and production tree must be adjusted manually in Blender.

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
DEPTH_FINAL_SCALE = 0.82

def mat(name, color, roughness=0.75):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0
    return material

bark_mat = mat("MAT_tree_bark_art_blockout", (0.36, 0.22, 0.12, 1), 0.86)
leaf_mat = mat("MAT_leaf_proxy_art_blockout", (0.22, 0.48, 0.25, 0.72), 0.8)
frame_mat = mat("MAT_frame_proxy_art_blockout", (0.78, 0.63, 0.38, 1), 0.58)
rope_mat = mat("MAT_rope_art_blockout", (0.24, 0.15, 0.08, 1), 0.9)

def collection(name, parent=None):
    col = bpy.data.collections.new(name)
    (parent or scene.collection).children.link(col)
    return col

root_col = collection("IdeaTreeRoot")
static_col = collection("TreeStatic", root_col)
roots_col = collection("ButtressRoots", static_col)
branches_col = collection("MainBranches", static_col)
secondary_col = collection("SecondaryBranches", static_col)
foliage_col = collection("Foliage", root_col)
anchors_col = collection("FrameAnchors", root_col)
hanging_col = collection("HangingSystem", root_col)
frames_col = collection("IdeaFrames", root_col)
lighting_col = collection("LightingHelpers", root_col)
hotspot_col = collection("InteractionHotspots", root_col)

def link_to(obj, col):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)

def coord(p):
    return (p[0], -p[2] * 0.65, p[1])

def normalize(v):
    v = Vector(v)
    if v.length == 0:
        return Vector((0, 1, 0))
    return v.normalized()

def make_branch(name, points, radii, col, material, sides=14):
    verts, faces = [], []
    points = [coord(p) for p in points]
    rings = []
    for i, point in enumerate(points):
        p = Vector(point)
        prev_p = Vector(points[max(i - 1, 0)])
        next_p = Vector(points[min(i + 1, len(points) - 1)])
        tangent = normalize(next_p - prev_p)
        ref = Vector((1, 0, 0)) if abs(tangent.y) > 0.9 else Vector((0, 1, 0))
        right = normalize(tangent.cross(ref))
        up = normalize(right.cross(tangent))
        ring = []
        for s in range(sides):
            t = s / sides * math.tau
            oval = 0.82 + 0.16 * math.sin(i * 1.61 + s * 0.73)
            r = radii[i] * oval
            v = p + right * math.cos(t) * r + up * math.sin(t) * r
            verts.append(tuple(v))
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
    obj.data.materials.append(material)
    col.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)
    return obj

make_branch("Trunk", [(-0.12, 0.18, 0.02), (-0.34, 1.15, 0.02), (-0.08, 2.1, -0.03), (0.25, 3.05, -0.06), (0.03, 3.82, -0.08)], [0.82, 0.78, 0.66, 0.54, 0.42], static_col, bark_mat, 18)
make_branch("ButtressRoot_ViewerLeft", [(-0.18, 0.38, 0.08), (-1.1, 0.22, 0.03), (-2.0, 0.1, -0.03), (-2.72, 0.04, -0.08)], [0.32, 0.24, 0.16, 0.06], roots_col, bark_mat, 10)
make_branch("ButtressRoot_ViewerRight", [(0.1, 0.4, 0.06), (0.95, 0.2, 0.0), (1.74, 0.08, -0.05), (2.28, 0.04, -0.1)], [0.3, 0.23, 0.15, 0.06], roots_col, bark_mat, 10)
make_branch("ButtressRoot_Front", [(0.0, 0.34, 0.12), (-0.18, 0.14, 0.38), (-0.48, 0.05, 0.52)], [0.28, 0.16, 0.06], roots_col, bark_mat, 10)

branch_defs = [
    ("MainBranch_ViewerLeft_Low", [(-0.1, 2.65, -0.04), (-1.1, 3.58, -0.08), (-2.55, 4.4, -0.16), (-4.15, 5.0, -0.24)], [0.4, 0.31, 0.2, 0.075]),
    ("MainBranch_ViewerRight_Low", [(0.18, 2.55, -0.04), (1.05, 3.34, -0.1), (2.42, 4.15, -0.18), (4.35, 4.72, -0.25)], [0.42, 0.31, 0.2, 0.075]),
    ("MainBranch_ViewerLeft_High", [(0.0, 3.38, -0.08), (-0.75, 4.62, -0.13), (-1.72, 5.82, -0.22), (-3.05, 6.86, -0.32)], [0.34, 0.25, 0.16, 0.06]),
    ("MainBranch_Center", [(0.1, 3.72, -0.09), (0.38, 4.92, -0.15), (0.2, 6.18, -0.23), (-0.28, 7.55, -0.34)], [0.32, 0.23, 0.145, 0.055]),
    ("MainBranch_ViewerRight_High", [(0.14, 3.42, -0.08), (0.86, 4.6, -0.16), (1.78, 5.78, -0.25), (3.08, 6.9, -0.35)], [0.34, 0.24, 0.15, 0.06]),
]
for name, points, radii in branch_defs:
    make_branch(name, points, radii, branches_col, bark_mat, 14)

make_branch("SecondaryBranch_ViewerLeft", [(-1.75, 4.54, -0.16), (-2.35, 5.45, -0.22), (-2.88, 6.26, -0.29)], [0.14, 0.085, 0.04], secondary_col, bark_mat, 9)
make_branch("SecondaryBranch_ViewerRight", [(2.05, 4.16, -0.2), (2.85, 5.04, -0.27), (3.42, 5.82, -0.34)], [0.14, 0.085, 0.04], secondary_col, bark_mat, 9)

def make_leaf_cluster(name, loc, scale, rot=0):
    bpy.ops.mesh.primitive_plane_add(size=1, location=coord(loc), rotation=(math.radians(90), 0.08, rot))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(leaf_mat)
    link_to(obj, foliage_col)
    return obj

make_leaf_cluster("LeafCluster_ViewerLeft_proxy", (-3.05, 6.62, -0.46), (1.45, 0.55, 1), -0.18)
make_leaf_cluster("LeafCluster_Center_proxy", (0.05, 7.82, -0.48), (1.6, 0.58, 1), 0.05)
make_leaf_cluster("LeafCluster_ViewerRight_proxy", (3.0, 6.48, -0.48), (1.4, 0.52, 1), 0.2)

make_branch("Rope_01", [(-4.15, 5.28, 0.12), (-4.15, 4.55, 0.12)], [0.018, 0.018], hanging_col, rope_mat, 6)

def make_frame(name, loc, size):
    bpy.ops.mesh.primitive_cube_add(size=1, location=coord(loc))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0], 0.035, size[1])
    obj.data.materials.append(frame_mat)
    link_to(obj, frames_col)
    return obj

make_frame("FrameProxy_Trunk", (-0.62, 2.5, 0.5), (0.52, 0.36, 1))
make_frame("FrameProxy_Branch", (2.35, 4.28, 0.25), (0.44, 0.31, 1))
make_frame("FrameProxy_Hanging", (-4.15, 4.25, 0.16), (0.36, 0.26, 1))

anchor_defs = [
    ("Anchor_Trunk_01", (-0.62, 2.5, 0.48), (0, 0, 0)),
    ("Anchor_Trunk_02", (0.46, 3.12, 0.46), (0, 0.1, 0)),
    ("Anchor_Branch_L_01", (-2.42, 4.62, 0.22), (0, 0.16, -0.08)),
    ("Anchor_Branch_L_02", (-1.48, 5.88, 0.18), (0, 0.14, 0.08)),
    ("Anchor_Branch_R_01", (2.36, 4.32, 0.22), (0, -0.16, 0.08)),
    ("Anchor_Branch_R_02", (1.65, 5.75, 0.18), (0, -0.14, -0.08)),
    ("Anchor_Hanging_01", (-4.15, 4.25, 0.12), (0, 0.08, 0)),
    ("Anchor_Hanging_02", (-0.82, 6.28, 0.12), (0, 0.04, 0)),
    ("Anchor_Hanging_03", (0.92, 6.18, 0.12), (0, -0.04, 0)),
    ("Anchor_Hanging_04", (4.0, 4.18, 0.12), (0, -0.08, 0)),
]
for name, loc, rot in anchor_defs:
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "ARROWS"
    empty.empty_display_size = 0.35
    empty.location = coord(loc)
    empty.rotation_euler = rot
    anchors_col.objects.link(empty)

for name, loc in [("AccentTarget_01", (0, 3.2, 0)), ("AccentTarget_02", (0, 6.4, 0))]:
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "SPHERE"
    empty.empty_display_size = 0.2
    empty.location = coord(loc)
    lighting_col.objects.link(empty)

for name, loc in [("Hotspot_01", (-0.62, 2.5, 0.56)), ("Hotspot_02", (2.36, 4.32, 0.3))]:
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "CUBE"
    empty.empty_display_size = 0.25
    empty.location = coord(loc)
    hotspot_col.objects.link(empty)

def make_empty_node(name, parent=None, display="PLAIN_AXES", size=0.25):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = display
    empty.empty_display_size = size
    if parent:
        empty.parent = parent
    scene.collection.objects.link(empty)
    return empty

root_empty = make_empty_node("IdeaTreeRoot", None, "PLAIN_AXES", 0.45)
tree_static_empty = make_empty_node("TreeStatic", root_empty)
roots_empty = make_empty_node("ButtressRoots", tree_static_empty)
branches_empty = make_empty_node("MainBranches", tree_static_empty)
secondary_empty = make_empty_node("SecondaryBranches", tree_static_empty)
foliage_empty = make_empty_node("Foliage", root_empty)
anchors_empty = make_empty_node("FrameAnchors", root_empty)
hanging_empty = make_empty_node("HangingSystem", root_empty)
frames_empty = make_empty_node("IdeaFrames", root_empty)
lighting_empty = make_empty_node("LightingHelpers", root_empty)
hotspots_empty = make_empty_node("InteractionHotspots", root_empty)

for obj in list(static_col.objects):
    if obj.name == "Trunk":
        obj.parent = tree_static_empty
for obj in list(roots_col.objects):
    obj.parent = roots_empty
for obj in list(branches_col.objects):
    obj.parent = branches_empty
for obj in list(secondary_col.objects):
    obj.parent = secondary_empty
for obj in list(foliage_col.objects):
    obj.parent = foliage_empty
for obj in list(anchors_col.objects):
    obj.parent = anchors_empty
for obj in list(hanging_col.objects):
    obj.parent = hanging_empty
for obj in list(frames_col.objects):
    obj.parent = frames_empty
for obj in list(lighting_col.objects):
    obj.parent = lighting_empty
for obj in list(hotspot_col.objects):
    obj.parent = hotspots_empty

for obj in bpy.data.objects:
    obj.select_set(False)

for obj in bpy.data.objects:
    obj.location.y *= DEPTH_FINAL_SCALE
    if obj.type == "MESH":
        for vertex in obj.data.vertices:
            vertex.co.y *= DEPTH_FINAL_SCALE
        obj.data.update()

group_empty_names = {
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
min_floor_z = None
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    for vertex in obj.data.vertices:
        z = (obj.matrix_world @ vertex.co).z
        min_floor_z = z if min_floor_z is None else min(min_floor_z, z)

if min_floor_z is not None and min_floor_z < 0:
    for obj in bpy.data.objects:
        if obj.name not in group_empty_names:
            obj.location.z -= min_floor_z

bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    use_selection=False,
    export_apply=False,
    export_yup=True,
    export_cameras=False,
    export_lights=False
)

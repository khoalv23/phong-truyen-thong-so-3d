import * as THREE from "three";

/** A plain box primitive. It never mutates a parent or the scene. */
export function createBox({
  name = "box",
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  material,
  castShadow = false,
  receiveShadow = false
}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  return mesh;
}

/** Creates, but does not attach, a horizontal floor/ceiling patch from world XZ points. */
export function createPolygonPatch({
  name = "polygon-patch",
  points,
  y,
  material,
  segments = 32,
  rotationX = Math.PI / 2,
  renderOrder
}) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, z]) => shape.lineTo(x, z));
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, segments), material);
  mesh.name = name;
  mesh.rotation.x = rotationX;
  mesh.position.y = y;
  if (renderOrder !== undefined) mesh.renderOrder = renderOrder;
  return mesh;
}

/**
 * Builds a straight wall and its two trim rails as a group.  Coordinates are
 * world XZ points, matching the existing connector calculations.
 */
export function createStraightWallParts({
  name = "straight-wall",
  from,
  to,
  height,
  thickness,
  endCapExtra = thickness,
  material,
  trimMaterial,
  baseboardMaterial,
  ceilingJoinOverlap = 0,
  trimHeight = .18,
  trimDepth = .12
}) {
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[1] + to[1]) / 2;
  const length = Math.hypot(from[0] - to[0], from[1] - to[1]) + endCapExtra;
  const rotationY = Math.atan2(to[0] - from[0], to[1] - from[1]);
  // Sink walls 0.02 below y=0 so their bottom face does not z-fight the floor mesh.
  const WALL_SINK = 0.02;
  const wallHeight = height + ceilingJoinOverlap + WALL_SINK;
  const wall = createBox({
    name: `${name}-surface`,
    size: [thickness, wallHeight, length],
    position: [mx, wallHeight / 2 - WALL_SINK, mz],
    rotation: [0, rotationY, 0],
    material
  });
  const trimGroup = new THREE.Group();
  trimGroup.name = `${name}-trims`;
  trimGroup.position.set(mx, 0, mz);
  trimGroup.rotation.y = rotationY;

  [-1, 1].forEach(faceSign => {
    trimGroup.add(createBox({
      name: `${name}-trim`,
      size: [trimDepth, trimHeight, length],
      position: [faceSign * (thickness / 2 + .03), height - .1, 0],
      material: trimMaterial
    }));
  });

  // White rectangular base tiles, separated by a thin exposed joint.
  const tileHeight = 1.05;
  const tilePitch = 3.15;
  const tileCount = Math.max(1, Math.ceil(length / tilePitch));
  const tileLength = length / tileCount;
  [-1, 1].forEach(faceSign => {
    for (let index = 0; index < tileCount; index++) {
      trimGroup.add(createBox({
        name: `${name}-base-tile`,
        size: [.06, tileHeight, Math.max(.2, tileLength - .055)],
        position: [
          faceSign * (thickness / 2 + .035),
          tileHeight / 2,
          -length / 2 + tileLength * (index + .5)
        ],
        material: baseboardMaterial || trimMaterial
      }));
    }
    trimGroup.add(createBox({
      name: `${name}-base-cap`,
      size: [trimDepth, .14, length],
      position: [faceSign * (thickness / 2 + .04), tileHeight + .07, 0],
      material: trimMaterial
    }));
  });
  return { wall, trimGroup };
}

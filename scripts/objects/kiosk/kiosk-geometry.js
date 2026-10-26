import * as THREE from "three";
import { createKioskMaterials } from "./kiosk-materials.js";

const addMesh = (parent, geometry, material, name) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const DISPLAY_WIDTH = 9.2;
const DISPLAY_HEIGHT = 6.9;
const DISPLAY_TILT = -.34;
const DISPLAY_CENTER_Y = 7.12 + (DISPLAY_HEIGHT - 5.08) * .5 * Math.cos(DISPLAY_TILT);
const DISPLAY_CENTER_Z = .52;
const DISPLAY_MOUNT_Y = -DISPLAY_HEIGHT * .5 + .53;
const DISPLAY_MOUNT_Z = -.43;
function displayPointInKiosk(y, z) {
  return new THREE.Vector3(0, DISPLAY_CENTER_Y + y * Math.cos(DISPLAY_TILT) - z * Math.sin(DISPLAY_TILT), DISPLAY_CENTER_Z + y * Math.sin(DISPLAY_TILT) + z * Math.cos(DISPLAY_TILT));
}

function roundedRectangleShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function roundedFrameGeometry(width, height, border, depth, radius) {
  const shape = roundedRectangleShape(width, height, radius);
  const hole = roundedRectangleShape(width - border * 2, height - border * 2, Math.max(.08, radius - border));
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: .055,
    bevelThickness: .045,
    curveSegments: 8
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function createRevolvedBody(parent, materials) {
  const baseProfile = [
    [0, 0], [1.34, 0], [1.42, .08], [1.45, .2], [1.40, .34],
    [1.28, .46], [1.18, .56], [0, .56]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  addMesh(parent, new THREE.LatheGeometry(baseProfile, 64), materials.blueDark, "kiosk-sculpted-base");

  const plinth = addMesh(parent, new THREE.CylinderGeometry(1.18, 1.30, .2, 64), materials.porcelain, "kiosk-base-inlay");
  plinth.position.y = .51;
  const footRing = addMesh(parent, new THREE.TorusGeometry(1.27, .055, 10, 64), materials.gold, "kiosk-base-gold-ring");
  footRing.rotation.x = Math.PI / 2;
  footRing.position.y = .64;

  const bodyProfile = [
    [.98, .62], [1.08, .76], [1.12, 1.02], [1.0, 1.18],
    [.82, 1.42], [.76, 2.75], [.8, 3.18], [.94, 3.42],
    [1.02, 3.56], [1.02, 3.82], [.9, 3.98]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  addMesh(parent, new THREE.LatheGeometry(bodyProfile, 48), materials.porcelain, "kiosk-tapered-column");

  [[1.08, .2, 1.04, materials.blue], [.89, .13, 3.25, materials.red]].forEach(([radius, height, y, material], index) => {
    const collar = addMesh(parent, new THREE.CylinderGeometry(radius, radius, height, 48), material, `kiosk-collar-${index}`);
    collar.position.y = y;
  });
  const neckRing = addMesh(parent, new THREE.TorusGeometry(.92, .055, 10, 48), materials.gold, "kiosk-neck-gold-ring");
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.y = 3.42;

  for (let index = 0; index < 8; index += 1) {
    const angle = index / 8 * Math.PI * 2;
    const rib = addMesh(parent, new THREE.BoxGeometry(.07, 1.38, .055), materials.porcelainSide, `kiosk-column-rib-${index}`);
    rib.position.set(.785 * Math.sin(angle), 2.18, .785 * Math.cos(angle));
    rib.rotation.y = angle;
  }
}

function createSupport(parent, materials) {
  // Keep the column silhouette circular from every viewing angle.
  const columnCollar = addMesh(
    parent,
    new THREE.CylinderGeometry(1.055, 1.055, .24, 48, 1, true),
    materials.blue,
    "kiosk-column-support-collar"
  );
  columnCollar.position.y = 3.86;

  const collarTopRing = addMesh(
    parent,
    new THREE.TorusGeometry(1.055, .065, 10, 48),
    materials.blue,
    "kiosk-column-support-ring"
  );
  collarTopRing.rotation.x = Math.PI / 2;
  collarTopRing.position.y = 3.98;

  const columnTopPlate = addMesh(
    parent,
    new THREE.CylinderGeometry(.995, .995, .14, 48),
    materials.blue,
    "kiosk-column-top-cover-plate"
  );
  columnTopPlate.position.y = 3.99;

  // Flat plate bridges the collar and the screen upright without a visible gap.
  const mountingPlate = addMesh(
    parent,
    new THREE.BoxGeometry(1.58, .34, 1.34),
    materials.blue,
    "kiosk-column-mounting-plate"
  );
  mountingPlate.position.set(0, 4.04, .48);

  // Build the support from two real endpoints. The previous fixed-size spine
  // used a different angle from the display group, creating a wedge-shaped seam.
  const spineStart = new THREE.Vector3(0, 3.92, .72);
  const hingeCenter = displayPointInKiosk(DISPLAY_MOUNT_Y, DISPLAY_MOUNT_Z);
  const spineEnd = hingeCenter.clone();
  const spineDirection = new THREE.Vector3().subVectors(spineEnd, spineStart);
  const spineLength = spineDirection.length();
  const spine = addMesh(
    parent,
    new THREE.BoxGeometry(1.52, spineLength + .18, .62, 1, 1, 1),
    materials.blueDark,
    "kiosk-screen-spine"
  );
  spine.position.copy(spineStart).add(spineEnd).multiplyScalar(.5);
  spine.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), spineDirection.normalize());
  const hinge = addMesh(parent, new THREE.CylinderGeometry(.27, .27, 2.18, 28), materials.blue, "kiosk-display-hinge");
  hinge.rotation.z = Math.PI / 2;
  hinge.position.copy(hingeCenter);
  for (const x of [-1.13, 1.13]) {
    const cap = addMesh(parent, new THREE.CylinderGeometry(.18, .18, .08, 24), materials.gold, "kiosk-display-hinge-cap");
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x, hingeCenter.y, hingeCenter.z);
  }
  const accent = addMesh(parent, new THREE.BoxGeometry(1.2, .13, .68), materials.red, "kiosk-support-accent");
  accent.position.set(0, 4.12, 1.0);

  [-.68, .68].forEach((x, index) => {
    const braceShape = new THREE.Shape();
    braceShape.moveTo(0, 0);
    braceShape.lineTo(0, 1.25);
    braceShape.lineTo(.72, .2);
    braceShape.closePath();
    const geometry = new THREE.ExtrudeGeometry(braceShape, { depth: .11, bevelEnabled: false });
    geometry.rotateY(Math.PI / 2);
    const brace = addMesh(parent, geometry, materials.blue, `kiosk-support-brace-${index}`);
    brace.position.set(x, 3.82, .76);
  });

  for (const x of [-.57, .57]) {
    for (const y of [4.25, 4.78]) {
      const bolt = addMesh(parent, new THREE.CylinderGeometry(.07, .07, .08, 16), materials.gold, "kiosk-gold-fastener");
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(x, y, 1.055);
    }
  }
}

function createDisplay(parent, materials) {
  const display = new THREE.Group();
  display.name = "central-kiosk-display";
  display.position.set(0, DISPLAY_CENTER_Y, DISPLAY_CENTER_Z);
  display.rotation.x = DISPLAY_TILT;
  parent.add(display);

  const rearShell = addMesh(display, new THREE.BoxGeometry(DISPLAY_WIDTH, DISPLAY_HEIGHT, .34), materials.blueDark, "kiosk-display-rear-shell");
  rearShell.position.z = -.18;
  const frame = addMesh(display, roundedFrameGeometry(DISPLAY_WIDTH, DISPLAY_HEIGHT, .34, .24, .28), materials.porcelain, "kiosk-display-frame");
  frame.position.z = .08;
  const goldFrame = addMesh(display, roundedFrameGeometry(DISPLAY_WIDTH - .54, DISPLAY_HEIGHT - .54, .085, .07, .18), materials.gold, "kiosk-display-gold-trim");
  goldFrame.position.z = .245;

  const screenWidth = DISPLAY_WIDTH - .78;
  const screenHeight = DISPLAY_HEIGHT - .82;
  const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
  const screenFace = addMesh(display, screenGeometry, new THREE.MeshBasicMaterial({ color: 0x07141d }), "central-kiosk-screen-face");
  screenFace.position.z = .3;
  screenFace.castShadow = false;

  const footer = addMesh(display, new THREE.BoxGeometry(screenWidth, .13, .06), materials.red, "kiosk-display-red-footer");
  footer.position.set(0, -DISPLAY_HEIGHT * .5 + .48, .31);
  const status = addMesh(display, new THREE.CircleGeometry(.09, 20), materials.gold, "kiosk-status-light");
  status.position.set(0, -DISPLAY_HEIGHT * .5 + .26, .32);

  const rearMount = addMesh(display, new THREE.BoxGeometry(2.05, .94, .46), materials.blue, "kiosk-display-rear-mount");
  rearMount.position.set(0, DISPLAY_MOUNT_Y, DISPLAY_MOUNT_Z);
  return { display, screenFace };
}

export function buildKioskGeometry() {
  const kiosk = new THREE.Group();
  kiosk.name = "central-single-screen-kiosk";
  kiosk.position.y = .15;
  const materials = createKioskMaterials();
  createRevolvedBody(kiosk, materials);
  createSupport(kiosk, materials);
  const { display, screenFace } = createDisplay(kiosk, materials);
  return { kiosk, display, screenFace, materials };
}

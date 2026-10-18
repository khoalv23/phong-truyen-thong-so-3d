import * as THREE from "three";

export const INTERNATIONAL_TOPIC_SIGN_SIZE = Object.freeze([16.4, 2.1]);

// Canonical top-of-wall sign, matching the HỘI NHẬP QUỐC TẾ identity sign.
export function createInternationalTopicSign({ addTextPanel, parent, text, position, rotationY = 0 }) {
  const [w, h] = INTERNATIONAL_TOPIC_SIGN_SIZE;
  const group = new THREE.Group();
  group.name = "international-style-topic-sign";
  group.position.set(...position);
  group.rotation.y = rotationY;
  parent.add(group);

  const youthBlue = new THREE.MeshStandardMaterial({ color: 0x0b5e9c, roughness: .46, metalness: .18 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd6a84b, roughness: .34, metalness: .42 });
  const red = new THREE.MeshStandardMaterial({ color: 0x982f35, roughness: .48, metalness: .10 });
  const backing = new THREE.Mesh(new THREE.BoxGeometry(w + .32, h + .26, .15), new THREE.MeshStandardMaterial({ color: 0x142c40, roughness: .56, metalness: .14 }));
  backing.position.z = .04;
  const face = new THREE.Mesh(new THREE.BoxGeometry(w, h, .09), youthBlue);
  face.position.z = .12;
  group.add(backing, face);
  [
    [w, .12, 0, h / 2 - .06],
    [w, .12, 0, -h / 2 + .06],
    [.12, h, -w / 2 + .06, 0],
    [.12, h, w / 2 - .06, 0]
  ].forEach(([railW, railH, x, y]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(railW, railH, .04), gold);
    rail.position.set(x, y, .19);
    group.add(rail);
  });

  const textPanel = addTextPanel(text, [0, .05, .225], [w * .91, h * .63], 0, {
    size: 220, minFontSize: 72, color: "#FFFFFF", background: "transparent",
    border: false, weight: 900, wrap: false, width: 4200, height: 900,
    strokeColor: "#D6A84B", strokeWidth: 7, depthWrite: false, depthTest: false,
    unlit: true
  }, group);
  textPanel.renderOrder = 45;

  const redWidth = Math.min(w * .18, 3.6);
  const redAccent = new THREE.Mesh(new THREE.BoxGeometry(redWidth, .11, .04), red);
  redAccent.position.set(-w / 2 + redWidth / 2 + .24, -h / 2 + .27, .24);
  const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w * .68, 4), .11, .04), gold);
  goldAccent.position.set(w * .10, -h / 2 + .27, .24);
  group.add(redAccent, goldAccent);
  return group;
}

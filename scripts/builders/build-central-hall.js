import * as THREE from "three";

/** Builds the central architectural core without coupling it to global scene state. */
export function buildHubCore({ parent, radius, material }) {
  const group = new THREE.Group();
  group.name = "hub-core";
  parent.add(group);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.06, .5, 48), material);
  base.position.y = .25;
  group.add(base);
  return group;
}

/** Assembles the central-hall content while preserving its existing callbacks. */
export function buildCentralHallExperience({
  createNorthOrientationWall,
  connectors,
  createGeneralLeadBoard
}) {
  createNorthOrientationWall();
  [["goc1", "goc5"]].forEach(([firstRoom, secondRoom]) => {
    const connector = connectors.find(item =>
      (item.a === firstRoom && item.b === secondRoom) ||
      (item.a === secondRoom && item.b === firstRoom)
    );
    // Keep this connector wall clear between the digital-transformation and
    // startup-innovation rooms; the former general introduction board was
    // intentionally removed from this location.
  });
}

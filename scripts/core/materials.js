import * as THREE from "three";

/** Creates the shared material palette without adding anything to the scene. */
export function createSceneMaterials({
  wallColor,
  wallEmissive,
  lightAmberPale
}) {
  const floor = new THREE.MeshStandardMaterial({ color: 0x8fa9bb, roughness: .82 });
  const floorPatch = floor.clone();
  floorPatch.side = THREE.DoubleSide;

  return {
    floor,
    floorPatch,
    wall: new THREE.MeshStandardMaterial({ color: wallColor, roughness: .86, emissive: wallEmissive, emissiveIntensity: .06 }),
    innerWall: new THREE.MeshStandardMaterial({ color: wallColor, roughness: .86, emissive: wallEmissive, emissiveIntensity: .06 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: .3, metalness: .55 }),
    baseboard: new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: .72, metalness: .02 }),
    carpet: new THREE.MeshStandardMaterial({ map: null, color: 0x8fa9bb, roughness: .98, metalness: 0, side: THREE.DoubleSide }),
    hub: new THREE.MeshStandardMaterial({ color: wallColor, roughness: .82, metalness: .04, emissive: wallEmissive, emissiveIntensity: .07 }),
    centralCeiling: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88, emissive: lightAmberPale, emissiveIntensity: .04, side: THREE.DoubleSide })
  };
}

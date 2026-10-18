import * as THREE from "three";

/**
 * Clones a loaded plant model, normalizes its largest axis and places its base
 * precisely on the floor. The caller owns loading and parent attachment.
 */
export function createPottedPlant({ source, position, rotationY = 0, maxAxis = 4.9 }) {
  const plant = source.clone(true);
  plant.rotation.y = rotationY;
  plant.updateMatrixWorld(true);

  const sourceBox = new THREE.Box3().setFromObject(plant);
  const sourceSize = new THREE.Vector3();
  sourceBox.getSize(sourceSize);
  const largestAxis = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
  if (largestAxis > 0) plant.scale.setScalar(maxAxis / largestAxis);

  plant.updateMatrixWorld(true);
  const floorBox = new THREE.Box3().setFromObject(plant);
  plant.position.set(position[0], -floorBox.min.y + position[1], position[2]);
  plant.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return plant;
}

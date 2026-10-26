import * as THREE from "three";

export function createKioskMaterials() {
  const standard = options => new THREE.MeshStandardMaterial(options);

  return {
    porcelain: standard({ color: 0xf5f2ea, roughness: .3, metalness: .08 }),
    porcelainSide: standard({ color: 0xdad9d4, roughness: .42, metalness: .12 }),
    blue: standard({ color: 0x07558d, roughness: .27, metalness: .38 }),
    blueDark: standard({ color: 0x063653, roughness: .34, metalness: .5 }),
    red: standard({ color: 0xa82b31, roughness: .32, metalness: .22 }),
    gold: standard({ color: 0xc9a95d, roughness: .24, metalness: .78 }),
    darkMetal: standard({ color: 0x17242b, roughness: .3, metalness: .72 }),
    rubber: standard({ color: 0x111820, roughness: .72, metalness: .02 })
  };
}

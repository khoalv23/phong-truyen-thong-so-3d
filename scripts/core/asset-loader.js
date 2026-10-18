import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const gltfLoader = new GLTFLoader();
const sceneCache = new Map();

/** Loads a GLB/GLTF scene once per URL and shares the immutable source scene. */
export function loadModelScene(url) {
  if (!sceneCache.has(url)) {
    sceneCache.set(url, gltfLoader.loadAsync(encodeURI(url)).then(gltf => gltf.scene));
  }
  return sceneCache.get(url);
}

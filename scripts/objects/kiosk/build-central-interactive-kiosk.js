import * as THREE from "three";
import { buildKioskGeometry } from "./kiosk-geometry.js";
import { attachKioskQuiz } from "./kiosk-quiz-controller.js";

export function buildCentralInteractiveKiosk({ parent, quizData, registerInteractiveObject, requestRender }) {
  const { kiosk, screenFace } = buildKioskGeometry();
  parent.add(kiosk);
  attachKioskQuiz({ screenFace, quizData, registerInteractiveObject, requestRender });

  const screenGlow = new THREE.PointLight(0xd6b86f, 1.15, 5.5, 2);
  screenGlow.name = "central-kiosk-screen-glow";
  screenGlow.position.set(0, 6.55, 2.05);
  screenGlow.userData.keepRealLight = true;
  kiosk.add(screenGlow);
  return kiosk;
}

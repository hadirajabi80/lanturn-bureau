import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../store/game';
import { BOARD_CX, OUTER_D, OUTER_L, OUTER_R } from './layout';
import { motionBus } from './motion';

const damp = THREE.MathUtils.damp;

/**
 * Spherical camera around the board. Each parameter is damped independently, which gives the
 * sweeping, curved transitions between the menu orbit and the play view.
 */
export function CameraRig() {
  const { camera, size } = useThree();
  const st = useRef({ dist: 40, polar: 0.25, az: -0.9, roll: 0, init: false });

  useFrame((state, dt) => {
    const g = useGame.getState();
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const portrait = aspect < 0.95;
    const inMenu = g.screen !== 'game';

    // Fit the board (plus room for the HUD) inside the view.
    const boardW = OUTER_R - OUTER_L + 0.6;
    const boardD = OUTER_D * 2 + 0.6;
    const hudPx = portrait ? 230 : 150;
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const tanV = Math.tan(vFov / 2);
    const tanH = tanV * aspect;
    const screenW = portrait ? boardD : boardW;
    const screenH = (portrait ? boardW : boardD) * 0.93;
    const usable = Math.max(0.5, 1 - hudPx / size.height);
    const fitDist = Math.max(screenH / 2 / (tanV * usable), screenW / 2 / tanH) * 1.04 + 0.6;

    let polar: number;
    let az: number;
    let dist: number;
    if (inMenu) {
      polar = 0.95;
      dist = fitDist * 0.92;
      az = state.clock.elapsedTime * 0.06 - 0.6;
    } else {
      polar = portrait ? 0.32 : 0.5;
      dist = fitDist;
      const flip = g.settings.rotateBoard && g.mode === 'pvp' && g.turn === 1 ? Math.PI : 0;
      az = (portrait ? -Math.PI / 2 : 0) + flip;
    }

    const s = st.current;
    if (!s.init) {
      s.init = true;
      s.az = az - 0.8;
      s.dist = dist * 1.6;
      s.polar = 1.2;
    }
    // unwrap azimuth to the nearest equivalent angle
    az = az + Math.PI * 2 * Math.round((s.az - az) / (Math.PI * 2));
    const speed = inMenu ? 1.2 : 2.6;
    s.az = damp(s.az, az, speed, dt);
    s.polar = damp(s.polar, polar, speed, dt);
    s.dist = damp(s.dist, dist, speed, dt);

    // gentle parallax from the pointer (not while dragging)
    const par = !inMenu && !motionBus.drag && !portrait ? 0.5 : 0;
    const px = state.pointer.x * par;
    const py = state.pointer.y * par;

    const target = new THREE.Vector3(BOARD_CX, 0, 0);
    const sinP = Math.sin(s.polar);
    const offset = new THREE.Vector3(Math.sin(s.az) * sinP, Math.cos(s.polar), Math.cos(s.az) * sinP).multiplyScalar(s.dist);
    cam.position.copy(target).add(offset);
    // parallax in the camera's screen plane
    const right = new THREE.Vector3(Math.cos(s.az), 0, -Math.sin(s.az));
    cam.position.addScaledVector(right, px);
    cam.position.y += py * 0.6;
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
  });

  return null;
}

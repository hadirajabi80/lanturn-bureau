// Pointer input on the board: tap to select / tap a destination, double-tap for a quick move,
// or drag a checker and drop it. Hit-testing is done against the board geometry directly.
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { BAR, OFF } from '../engine/rules';
import { isAiTurn, useGame } from '../store/game';
import { BAR_W, FIELD_L, FIELD_R, HALF_D, PW, TRAY_L, TRAY_R } from './layout';
import { motionBus } from './motion';

/** Board location under a world-space point (x, z), or null. */
export function locAt(x: number, z: number): number | null {
  if (Math.abs(z) > HALF_D + 0.3) return null;
  if (x >= TRAY_L - 0.25 && x <= TRAY_R + 0.4) return OFF;
  if (Math.abs(x) <= BAR_W / 2) return BAR;
  if (x < FIELD_L - 0.2 || x > FIELD_R + 0.15) return null;
  const bottom = z > 0;
  const col = (v: number) => Math.min(5, Math.max(0, Math.floor(v / PW)));
  if (bottom) return x > 0 ? col(FIELD_R - x) : 6 + col(-BAR_W / 2 - x);
  return x < 0 ? 12 + col(x - FIELD_L) : 18 + col(x - BAR_W / 2);
}

export function Interaction() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const worldAt = (e: PointerEvent, y: number) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
      return raycaster.ray.intersectPlane(plane, hit) ? hit.clone() : null;
    };

    const topCheckerId = (loc: number) => {
      const s = useGame.getState();
      let best: { id: number; slot: number } | null = null;
      for (const c of s.checkers) {
        if (c.owner === s.turn && c.loc === loc && (!best || c.slot > best.slot)) best = c;
      }
      return best?.id ?? null;
    };

    let candidate: null | { loc: number; id: number; x: number; y: number; wasSelected: boolean; pointerId: number } = null;
    let dragging = false;
    let lastTap = { loc: -1, t: 0 };

    const isSource = (loc: number | null) => {
      const s = useGame.getState();
      return loc !== null && s.phase === 'move' && !s.busy && s.legal.some((m) => m.from === loc);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const s = useGame.getState();
      if (s.screen !== 'game' || s.menuOpen || isAiTurn(s)) return;
      if (s.phase === 'roll' && !s.busy) {
        s.roll();
        return;
      }
      if (s.phase === 'opening' && !s.busy) {
        s.rollOpening();
        return;
      }
      if (s.phase !== 'move' || s.busy) return;
      const p = worldAt(e, 0.15);
      const loc = p ? locAt(p.x, p.z) : null;

      if (s.selected !== null && loc !== null && loc !== s.selected && s.dests.some((d) => d.to === loc)) {
        s.moveTo(loc);
        return;
      }
      if (loc !== null && isSource(loc)) {
        const now = performance.now();
        if (lastTap.loc === loc && now - lastTap.t < 330) {
          lastTap = { loc: -1, t: 0 };
          s.quickMove(loc);
          return;
        }
        lastTap = { loc, t: now };
        const wasSelected = s.selected === loc && !s.autoSelected;
        if (s.selected !== loc) s.select(loc);
        const id = topCheckerId(loc);
        if (id !== null) {
          candidate = { loc, id, x: e.clientX, y: e.clientY, wasSelected, pointerId: e.pointerId };
          el.setPointerCapture?.(e.pointerId);
        }
        return;
      }
      s.select(null);
    };

    const onMove = (e: PointerEvent) => {
      const s = useGame.getState();
      if (candidate) {
        if (!dragging && Math.hypot(e.clientX - candidate.x, e.clientY - candidate.y) > 7) dragging = true;
        if (dragging) {
          const p = worldAt(e, 0.85);
          if (p) motionBus.drag = { id: candidate.id, pos: [p.x, 0.85, p.z] };
          el.style.cursor = 'grabbing';
        }
        return;
      }
      // hover feedback
      if (s.screen !== 'game' || isAiTurn(s)) {
        el.style.cursor = 'default';
        motionBus.hover = null;
        return;
      }
      const p = worldAt(e, 0.15);
      const loc = p ? locAt(p.x, p.z) : null;
      const canAct =
        (s.phase === 'roll' || s.phase === 'opening') && !s.busy
          ? true
          : loc !== null && (isSource(loc) || (s.selected !== null && s.dests.some((d) => d.to === loc)));
      el.style.cursor = canAct ? 'pointer' : 'default';
      motionBus.hover = loc !== null && isSource(loc) ? topCheckerId(loc) : null;
    };

    const onUp = (e: PointerEvent) => {
      if (!candidate) return;
      const c = candidate;
      candidate = null;
      el.releasePointerCapture?.(c.pointerId);
      const s = useGame.getState();
      if (dragging) {
        dragging = false;
        el.style.cursor = 'default';
        const p = worldAt(e, 0.15);
        const loc = p ? locAt(p.x, p.z) : null;
        if (loc !== null && loc !== c.loc && s.dests.some((d) => d.to === loc)) {
          s.moveTo(loc, true);
        } else {
          motionBus.drag = null; // fly back
        }
        return;
      }
      if (c.wasSelected) s.select(null);
    };

    const onCancel = () => {
      candidate = null;
      dragging = false;
      motionBus.drag = null;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('pointerleave', () => (motionBus.hover = null));
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
    };
  }, [camera, gl]);

  return null;
}

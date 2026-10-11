// Non-reactive channel between the game director (store) and per-frame animation code.
import type { Vec3 } from './layout';

export type MotionKind = 'move' | 'hit' | 'bearoff' | 'drop' | 'undo' | 'reset';

export interface MotionHint {
  kind: MotionKind;
  delay: number; // seconds before the checker starts moving
  duration: number; // seconds
}

export const motionBus = {
  hints: new Map<number, MotionHint>(),
  drag: null as null | { id: number; pos: Vec3 },
  /** id of the checker currently hovered (for subtle lift). */
  hover: null as null | number,
};

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[2] - b[2]);

/** Flight time for a checker hop — longer trips take a little longer, but never sluggish. */
export function flightTime(from: Vec3, to: Vec3, kind: MotionKind = 'move'): number {
  const d = dist(from, to);
  if (kind === 'drop') return Math.min(0.32, 0.16 + d * 0.03);
  if (kind === 'undo' || kind === 'reset') return Math.min(0.75, 0.32 + d * 0.025);
  if (kind === 'hit') return Math.min(0.85, 0.42 + d * 0.03);
  return Math.min(0.72, 0.3 + d * 0.035);
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

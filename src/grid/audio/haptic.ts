/**
 * Haptics via `navigator.vibrate` (Android Chrome & co.; iOS Safari ignores it).
 * Accepts a raw pattern or a named preset. Always a safe no-op when unsupported.
 */

export type HapticName = 'tap' | 'pin' | 'cross' | 'erase' | 'stamp' | 'lever' | 'error' | 'burn' | 'success' | 'tick';

export const HAPTICS: Record<HapticName, number | number[]> = {
  tap: 8,
  pin: 14,
  cross: [6, 40, 6],
  erase: 10,
  stamp: [28, 30, 50],
  lever: [5, 25, 5, 25, 5, 25, 30],
  error: [40, 60, 40],
  burn: [60, 40, 30, 40, 20],
  success: [20, 40, 20, 40, 70],
  tick: 5,
};

let hapticsEnabled = true;

export function setHapticsEnabled(b: boolean): void {
  hapticsEnabled = b;
}

export function hapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Vibrate with a preset name or a raw pattern (ms). Returns true if the call was made. */
export function haptic(pattern: HapticName | number | number[]): boolean {
  if (!hapticsEnabled || !hapticsSupported()) return false;
  const p = typeof pattern === 'string' ? HAPTICS[pattern] : pattern;
  if (p === undefined) return false;
  try {
    return navigator.vibrate(p);
  } catch {
    return false;
  }
}

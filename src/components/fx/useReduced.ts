import { useReducedMotion } from 'framer-motion';
import { useGame } from '../../engine/store';

function osPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * True when the OS asks for reduced motion OR the player switched on "Reduce effects" in
 * settings. Every FX component consults this and degrades to an instant / static variant.
 */
export function useReduced(): boolean {
  const os = useReducedMotion() === true;
  const setting = useGame((s) => s.settings.reducedFx);
  return os || setting;
}

/**
 * Non-hook check for imperative helpers (confetti, audio-adjacent code): OS preference OR the
 * persisted "Reduce effects" setting. Safe in SSR/tests.
 */
export function prefersReducedMotion(): boolean {
  if (osPrefersReducedMotion()) return true;
  try {
    return useGame.getState().settings.reducedFx === true;
  } catch {
    return false;
  }
}

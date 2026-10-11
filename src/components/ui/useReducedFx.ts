import { useReducedMotion } from 'framer-motion';
import { useGame } from '@/engine/store';

/** True when the OS asks for reduced motion OR the player switched on "Reduce effects". */
export function useReducedFx(): boolean {
  const os = useReducedMotion() === true;
  const setting = useGame((s) => s.settings.reducedFx);
  return os || setting;
}

/** Non-hook variant for event handlers. */
export function reducedFxNow(): boolean {
  const os =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return os || useGame.getState().settings.reducedFx;
}

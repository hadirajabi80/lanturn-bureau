import { useReducedMotion } from 'framer-motion';

/** True when the OS asks for reduced motion. */
export function useReducedFx(): boolean {
  return useReducedMotion() === true;
}

/** Non-hook variant for event handlers. */
export function reducedFxNow(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

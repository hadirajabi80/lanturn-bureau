import { useReducedMotion } from 'framer-motion';

function osPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** True when the OS asks for reduced motion. Every FX component degrades to a static variant then. */
export function useReduced(): boolean {
  return useReducedMotion() === true;
}

/** Non-hook check for imperative helpers (confetti, audio-adjacent code). Safe in SSR/tests. */
export function prefersReducedMotion(): boolean {
  return osPrefersReducedMotion();
}

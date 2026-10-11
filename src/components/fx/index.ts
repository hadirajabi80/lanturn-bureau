/**
 * Lantern Bureau FX kit — animation & atmosphere components (see docs/PLAN.md §4/§7).
 * All components honour prefers-reduced-motion and animate transform/opacity only where possible.
 */
export { Typewriter, type TypewriterProps } from './Typewriter';
export { ContradictionFlash, type ContradictionFlashProps } from './ContradictionFlash';
export { Fog, type FogProps } from './Fog';
export { Stamp, type StampProps } from './Stamp';
export { PageTransition, type PageTransitionProps } from './PageTransition';
export { GlowCard, type GlowCardProps } from './GlowCard';
export { Spotlight, type SpotlightProps } from './Spotlight';
export { fireConfetti } from './confetti';
export { LanternGlow, type LanternGlowProps } from './LanternGlow';
export { ShakeOnError, type ShakeOnErrorProps } from './ShakeOnError';
export { CountUp, type CountUpProps } from './CountUp';
export { useReduced, prefersReducedMotion } from './useReduced';

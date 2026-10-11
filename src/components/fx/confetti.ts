import confetti from 'canvas-confetti';
import { prefersReducedMotion } from './useReduced';

const GOLD = ['#D4A857', '#FFB347', '#F3E9D2', '#FFF4D6', '#E8C77A'];
const RANK = [...GOLD, '#C8323C', '#2EC4B6'];
const Z = 9000;

/**
 * Celebration bursts via canvas-confetti. 'solve' = one gold/cream burst; 'rank' = a bigger
 * centre burst plus ~1.2 s of side cannons. No-op under reduced motion or outside the browser.
 */
export function fireConfetti(kind: 'solve' | 'rank'): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;

  if (kind === 'solve') {
    void confetti({ particleCount: 90, spread: 70, startVelocity: 42, origin: { y: 0.62 }, colors: GOLD, scalar: 0.95, zIndex: Z });
    return;
  }

  void confetti({ particleCount: 180, spread: 110, startVelocity: 55, origin: { y: 0.55 }, colors: RANK, scalar: 1.1, zIndex: Z });
  const end = performance.now() + 1200;
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 55, startVelocity: 62, origin: { x: 0, y: 0.75 }, colors: RANK, zIndex: Z });
    void confetti({ particleCount: 5, angle: 120, spread: 55, startVelocity: 62, origin: { x: 1, y: 0.75 }, colors: RANK, zIndex: Z });
    if (performance.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

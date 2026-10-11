import { useEffect } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useSpring } from 'framer-motion';
import { useReduced } from './useReduced';

export interface SpotlightProps {
  /** Hole centre in viewport px. */
  x: number;
  y: number;
  /** Hole radius in px (the outer 30% is a soft falloff). */
  radius: number;
  show?: boolean;
  /** Opacity of the darkness outside the hole, 0–1. */
  darkness?: number;
}

const SPRING = { stiffness: 120, damping: 20, mass: 0.8 };

/**
 * Fixed full-screen darkness with a soft circular hole at (x, y). Position and radius changes
 * glide on springs (motion values, no React re-renders); fades in/out with `show`.
 * Pointer-events none so the UI underneath stays interactive.
 */
export function Spotlight({ x, y, radius, show = true, darkness = 0.85 }: SpotlightProps) {
  const reduced = useReduced();
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const sr = useSpring(radius, SPRING);

  useEffect(() => {
    if (reduced) {
      sx.jump(x);
      sy.jump(y);
      sr.jump(radius);
    } else {
      sx.set(x);
      sy.set(y);
      sr.set(radius);
    }
  }, [x, y, radius, reduced, sx, sy, sr]);

  const d = Math.max(0, Math.min(1, darkness));
  const background = useMotionTemplate`radial-gradient(circle ${sr}px at ${sx}px ${sy}px, rgba(5,6,10,0) 0%, rgba(5,6,10,0) 70%, rgba(5,6,10,${d}) 100%)`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="spotlight"
          aria-hidden="true"
          className="fixed inset-0 z-[60]"
          style={{ pointerEvents: 'none', background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: reduced ? 0.1 : 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        />
      )}
    </AnimatePresence>
  );
}

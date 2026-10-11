import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface ShakeOnErrorProps {
  /** Plays a short horizontal shake each time this flips to true. */
  shake: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that does a quick "nope" head-shake (translateX only) when `shake` turns true,
 * e.g. on a wrong code entry. Reset `shake` to false afterwards to allow re-triggering.
 * Under reduced motion it gives a brief opacity dip instead.
 */
export function ShakeOnError({ shake, children, className }: ShakeOnErrorProps) {
  const reduced = useReduced();
  const target = !shake
    ? { x: 0, opacity: 1 }
    : reduced
      ? { x: 0, opacity: [1, 0.55, 1] }
      : { x: [0, -10, 10, -7, 7, -3, 3, 0], opacity: 1 };
  return (
    <motion.div className={className} animate={target} transition={{ duration: 0.42, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
}

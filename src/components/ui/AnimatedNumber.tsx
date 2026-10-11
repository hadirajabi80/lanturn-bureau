import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export interface AnimatedNumberProps {
  value: number;
  /** Start from this number on mount (e.g. 0 for a count-up). */
  from?: number;
  duration?: number;
  className?: string;
  delay?: number;
}

/** Number that springs to its new value (used for score and count-ups). */
export function AnimatedNumber({ value, from, duration = 0.9, className, delay = 0 }: AnimatedNumberProps) {
  const mv = useMotionValue(from ?? value);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString('en-GB'));
  useEffect(() => {
    const controls = animate(mv, value, { duration, delay, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, value, duration, delay]);
  return <motion.span className={className}>{text}</motion.span>;
}

import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { useReduced } from './useReduced';

export interface CountUpProps {
  to: number;
  /** Animation length in ms. */
  duration?: number;
  className?: string;
}

const fmt = (v: number) => Math.round(v).toLocaleString('en-US');

/**
 * Animated number that eases (expo-out) from its previous value to `to`, writing straight to
 * the DOM via a motion value so there are no per-frame React renders. Jumps instantly under
 * reduced motion. Starts from 0 on mount.
 */
export function CountUp({ to, duration = 1200, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReduced();
  const value = useMotionValue(0);

  useLayoutEffect(() => {
    const write = (v: number) => {
      if (ref.current) ref.current.textContent = fmt(v);
    };
    write(value.get());
    return value.on('change', write);
  }, [value]);

  useEffect(() => {
    if (reduced) {
      value.jump(to);
      return;
    }
    const controls = animate(value, to, { duration: duration / 1000, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [to, duration, reduced, value]);

  return <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }} />;
}

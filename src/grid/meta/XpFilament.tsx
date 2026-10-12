import { motion } from 'framer-motion';
import { useReduced } from '../../components/fx';
import { FP } from './theme';

export interface XpFilamentProps {
  /** 0..1 */
  pct: number;
  /** Start value for the fill animation (0..1). Defaults to `pct` (no animation) unless `animateFrom` given. */
  animateFrom?: number;
  height?: number;
  /** Fill colour (default print red). */
  color?: string;
  className?: string;
  /** seconds */
  duration?: number;
  delay?: number;
}

/** Plain printed XP bar: white track in an ink outline, flat fill. */
export function XpFilament({ pct, animateFrom, height = 8, color = FP.accent, className, duration = 0.8, delay = 0 }: XpFilamentProps) {
  const reduced = useReduced();
  const to = Math.max(0, Math.min(1, pct));
  const from = animateFrom == null ? to : Math.max(0, Math.min(1, animateFrom));
  const h = Math.max(6, height);
  return (
    <div
      className={className}
      style={{ position: 'relative', height: h, borderRadius: 3, background: FP.panel, boxShadow: `inset 0 0 0 1.5px ${FP.ink}`, overflow: 'hidden' }}
    >
      <motion.div
        initial={{ width: `${from * 100}%` }}
        animate={{ width: `${to * 100}%` }}
        transition={reduced ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', inset: 0, right: 'auto', borderRadius: 3, background: color,
          boxShadow: to > 0 ? `inset 0 0 0 1.5px ${FP.ink}` : undefined,
        }}
      />
    </div>
  );
}

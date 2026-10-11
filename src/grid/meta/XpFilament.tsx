import { motion } from 'framer-motion';
import { useReduced } from '../../components/fx';
import { FP } from './theme';

export interface XpFilamentProps {
  /** 0..1 */
  pct: number;
  /** Start value for the fill animation (0..1). Defaults to `pct` (no animation) unless `animateFrom` given. */
  animateFrom?: number;
  height?: number;
  color?: string;
  className?: string;
  /** seconds */
  duration?: number;
  delay?: number;
}

/** Thin glowing "lamp filament" XP bar. */
export function XpFilament({ pct, animateFrom, height = 4, color = FP.accent2, className, duration = 1.1, delay = 0 }: XpFilamentProps) {
  const reduced = useReduced();
  const to = Math.max(0, Math.min(1, pct));
  const from = animateFrom == null ? to : Math.max(0, Math.min(1, animateFrom));
  return (
    <div
      className={className}
      style={{ position: 'relative', height, borderRadius: height, background: 'rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5)', overflow: 'visible' }}
    >
      <motion.div
        initial={{ width: `${from * 100}%` }}
        animate={{ width: `${to * 100}%` }}
        transition={reduced ? { duration: 0 } : { duration, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', inset: 0, right: 'auto', borderRadius: height,
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), ${color})`,
          boxShadow: `0 0 ${height * 2}px ${color}, 0 0 ${height * 5}px color-mix(in srgb, ${color} 45%, transparent)`,
        }}
      >
        <span
          style={{
            position: 'absolute', right: -1, top: '50%', width: height * 1.6, height: height * 1.6, transform: 'translate(25%, -50%)',
            borderRadius: '50%', background: '#FFF4D6', boxShadow: `0 0 ${height * 3}px ${color}`, opacity: to > 0 ? 1 : 0,
          }}
        />
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface LanternGlowProps {
  /** Sizing/positioning classes; width drives the size (default `w-32`). */
  className?: string;
}

/**
 * A brass lantern hanging from a chain, swinging like a pendulum (±6°, 3 s loop) and casting a
 * warm flickering radial light that swings with it. Decorative (aria-hidden, pointer-events none);
 * holds still under reduced motion. Used on the Landing screen.
 */
export function LanternGlow({ className }: LanternGlowProps) {
  const reduced = useReduced();
  return (
    <div aria-hidden="true" className={['pointer-events-none relative', className ?? 'w-32'].join(' ')}>
      <motion.div
        className="relative w-full"
        style={{ transformOrigin: '50% 0%', willChange: 'transform' }}
        animate={reduced ? { rotate: 0 } : { rotate: [-6, 6, -6] }}
        transition={reduced ? { duration: 0 } : { duration: 3, ease: 'easeInOut', repeat: Infinity }}
      >
        {/* Cast light, centred on the glass body; opacity-only flicker. */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '61%',
            width: '760%',
            aspectRatio: '1 / 1',
            x: '-50%',
            y: '-50%',
            background:
              'radial-gradient(circle, rgba(255,179,71,0.42) 0%, rgba(255,179,71,0.16) 22%, rgba(212,168,87,0.06) 42%, transparent 66%)',
            mixBlendMode: 'screen',
            willChange: 'opacity',
          }}
          animate={reduced ? { opacity: 0.9 } : { opacity: [0.82, 1, 0.88, 0.97, 0.84] }}
          transition={reduced ? { duration: 0 } : { duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
        />
        <svg viewBox="0 0 120 150" className="relative block h-auto w-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="lb-lantern-brass" x1="0" x2="1">
              <stop offset="0" stopColor="#8C6A2C" />
              <stop offset="0.45" stopColor="#E6C27A" />
              <stop offset="1" stopColor="#7A5A22" />
            </linearGradient>
            <radialGradient id="lb-lantern-glass" cx="0.5" cy="0.55" r="0.6">
              <stop offset="0" stopColor="#FFE7B0" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#FFB347" stopOpacity="0.6" />
              <stop offset="1" stopColor="#B86A1C" stopOpacity="0.35" />
            </radialGradient>
            <radialGradient id="lb-lantern-flame" cx="0.5" cy="0.7" r="0.6">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.4" stopColor="#FFE08A" />
              <stop offset="1" stopColor="#FF8A1F" />
            </radialGradient>
          </defs>
          {/* Chain */}
          <line x1="60" y1="-400" x2="60" y2="30" stroke="#B48A45" strokeWidth="2.5" strokeDasharray="5 3" />
          <circle cx="60" cy="34" r="5" fill="none" stroke="url(#lb-lantern-brass)" strokeWidth="2.5" />
          {/* Cap */}
          <path d="M44 52 L76 52 L68 39 L52 39 Z" fill="url(#lb-lantern-brass)" />
          <rect x="34" y="51" width="52" height="8" rx="2" fill="url(#lb-lantern-brass)" />
          {/* Glass body */}
          <rect x="39" y="59" width="42" height="64" rx="4" fill="url(#lb-lantern-glass)" />
          <motion.path
            d="M60 76 C66 86 68 94 66 100 C64 106 56 106 54 100 C52 94 54 86 60 76 Z"
            fill="url(#lb-lantern-flame)"
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
            animate={reduced ? { scaleY: 1 } : { scaleY: [1, 1.12, 0.94, 1.06, 1], scaleX: [1, 0.94, 1.04, 0.97, 1] }}
            transition={reduced ? { duration: 0 } : { duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
          />
          {/* Frame bars */}
          <g stroke="url(#lb-lantern-brass)" strokeWidth="3" fill="none">
            <rect x="39" y="59" width="42" height="64" rx="4" />
            <line x1="60" y1="59" x2="60" y2="74" />
            <line x1="60" y1="108" x2="60" y2="123" />
          </g>
          <line x1="44" y1="64" x2="44" y2="118" stroke="#FFF4D6" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
          {/* Base */}
          <rect x="34" y="122" width="52" height="8" rx="2" fill="url(#lb-lantern-brass)" />
          <path d="M44 130 L76 130 L70 141 L50 141 Z" fill="url(#lb-lantern-brass)" />
          <circle cx="60" cy="144" r="3" fill="#B48A45" />
        </svg>
      </motion.div>
    </div>
  );
}

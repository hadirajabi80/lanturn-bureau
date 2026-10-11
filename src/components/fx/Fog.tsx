import { motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface FogProps {
  /** 0–1, scales layer opacity. */
  intensity?: number;
  className?: string;
}

interface Layer {
  blobs: string;
  duration: number;
  opacity: number;
  direction: 1 | -1;
  top: string;
}

const LAYERS: Layer[] = [
  {
    blobs:
      'radial-gradient(ellipse 22% 38% at 18% 70%, rgba(190,200,225,0.55), transparent 70%),' +
      'radial-gradient(ellipse 28% 30% at 62% 55%, rgba(170,185,215,0.45), transparent 70%),' +
      'radial-gradient(ellipse 18% 26% at 88% 80%, rgba(200,210,230,0.4), transparent 70%)',
    duration: 90,
    opacity: 0.5,
    direction: 1,
    top: '20%',
  },
  {
    blobs:
      'radial-gradient(ellipse 30% 34% at 30% 40%, rgba(160,175,205,0.45), transparent 70%),' +
      'radial-gradient(ellipse 20% 28% at 75% 65%, rgba(185,195,220,0.5), transparent 70%)',
    duration: 60,
    opacity: 0.4,
    direction: -1,
    top: '35%',
  },
  {
    blobs:
      'radial-gradient(ellipse 26% 40% at 10% 60%, rgba(215,220,235,0.4), transparent 70%),' +
      'radial-gradient(ellipse 34% 30% at 50% 75%, rgba(200,205,225,0.35), transparent 70%),' +
      'radial-gradient(ellipse 16% 22% at 85% 45%, rgba(220,225,240,0.35), transparent 70%)',
    duration: 40,
    opacity: 0.35,
    direction: 1,
    top: '50%',
  },
];

/**
 * Three drifting translucent fog banks (layered radial gradients) for atmospheric backdrops.
 * Absolute-inset and pointer-events none; each layer is 200% wide with a seamless tile and only
 * its transform animates, so it stays on the compositor. Static under reduced motion.
 */
export function Fog({ intensity = 0.5, className }: FogProps) {
  const reduced = useReduced();
  const k = Math.max(0, Math.min(1, intensity));
  return (
    <div
      aria-hidden="true"
      className={['pointer-events-none absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')}
    >
      {LAYERS.map((l, i) => (
        <motion.div
          key={i}
          className="absolute left-0"
          style={{
            top: l.top,
            bottom: 0,
            width: '200%',
            opacity: Math.min(1, l.opacity * k * 2),
            backgroundImage: l.blobs,
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            willChange: 'transform',
          }}
          initial={{ x: l.direction === 1 ? '-50%' : '0%' }}
          animate={reduced ? undefined : { x: l.direction === 1 ? '0%' : '-50%' }}
          transition={{ duration: l.duration, ease: 'linear', repeat: Infinity }}
        />
      ))}
    </div>
  );
}

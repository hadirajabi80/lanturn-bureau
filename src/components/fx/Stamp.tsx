import { AnimatePresence, motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface StampProps {
  text: string;
  show: boolean;
  /** Ink colour (default crimson #C8323C). */
  color?: string;
  className?: string;
}

// Static speckle noise used as an alpha mask for a worn-ink look (rasterised once).
const INK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4 2.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Rubber-stamp impression: drops in from scale 1.6 to 1 at −12° with a springy thud,
 * double border, uppercase Playfair lettering and a speckled ink mask. Place it inside a
 * relatively positioned parent; pair with `sfx.stamp()` on show for the sound.
 */
export function Stamp({ text, show, color = '#C8323C', className }: StampProps) {
  const reduced = useReduced();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="stamp"
          className={['inline-block select-none', className].filter(Boolean).join(' ')}
          style={{ willChange: 'transform, opacity' }}
          initial={reduced ? { opacity: 0, rotate: -12 } : { opacity: 0, scale: 1.6, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={
            reduced
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 520, damping: 16, mass: 0.8, opacity: { duration: 0.06 } }
          }
        >
          <div
            className="px-4 py-1.5 text-center font-black uppercase"
            style={{
              color,
              border: `4px double ${color}`,
              borderRadius: 6,
              fontFamily: '"Playfair Display", Georgia, serif',
              letterSpacing: '0.14em',
              lineHeight: 1.1,
              fontSize: 'clamp(1rem, 3.2vw, 1.75rem)',
              textShadow: `0 0 1px ${color}, 0.5px 0.5px 0 ${color}`,
              boxShadow: `inset 0 0 0 1px ${color}33`,
              opacity: 0.88,
              mixBlendMode: 'multiply',
              WebkitMaskImage: INK_MASK,
              maskImage: INK_MASK,
              WebkitMaskSize: '160px 160px',
              maskSize: '160px 160px',
            }}
          >
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

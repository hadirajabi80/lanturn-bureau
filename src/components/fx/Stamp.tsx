import { AnimatePresence, motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface StampProps {
  text: string;
  show: boolean;
  /** Ink colour (default print red #D7261E). */
  color?: string;
  className?: string;
}

// Static speckle noise used as an alpha mask for a worn rubber-stamp look (rasterised once).
const INK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4 3.1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Red rubber-stamp impression (printed case-file look): a thick red outline with a thin inner rule,
 * condensed Archivo capitals, slightly rotated, with a speckled ink mask. Thuds in from scale 1.4.
 * Place it inside a relatively positioned parent; pair with `sfx.stamp()` on show for the sound.
 */
export function Stamp({ text, show, color = '#D7261E', className }: StampProps) {
  const reduced = useReduced();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="stamp"
          className={['inline-block select-none', className].filter(Boolean).join(' ')}
          style={{ willChange: 'transform, opacity' }}
          initial={reduced ? { opacity: 0, rotate: -7 } : { opacity: 0, scale: 1.4, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: -7 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 640, damping: 22, mass: 0.7, opacity: { duration: 0.05 } }}
        >
          <div
            className="text-center uppercase"
            style={{
              color,
              border: `5px solid ${color}`,
              outline: `1.5px solid ${color}`,
              outlineOffset: -11,
              borderRadius: 8,
              padding: '0.3em 0.75em 0.25em',
              fontFamily: 'var(--font-display, Archivo, sans-serif)',
              fontWeight: 900,
              fontStretch: '75%',
              letterSpacing: '0.03em',
              lineHeight: 1,
              fontSize: 'clamp(1.4rem, 4.4vw, 2.6rem)',
              opacity: 0.92,
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

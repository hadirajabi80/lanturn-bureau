import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReduced } from './useReduced';

export interface ContradictionFlashProps {
  show: boolean;
  /** Fired ~1100 ms after `show` becomes true; the parent should then set `show` false. */
  onDone?: () => void;
}

const SHAKE_CLASS = 'lb-fx-shake';
const STYLE_ID = 'lb-fx-shake-style';
const SHAKE_MS = 300;
const TOTAL_MS = 1100;

function ensureShakeStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@keyframes lb-fx-shake-kf {
  0%,100% { transform: translate3d(0,0,0); }
  15% { transform: translate3d(-9px, 4px, 0) rotate(-0.4deg); }
  30% { transform: translate3d(8px, -5px, 0) rotate(0.4deg); }
  45% { transform: translate3d(-7px, -3px, 0); }
  60% { transform: translate3d(6px, 4px, 0) rotate(0.2deg); }
  75% { transform: translate3d(-4px, 2px, 0); }
  90% { transform: translate3d(2px, -1px, 0); }
}
.${SHAKE_CLASS} { animation: lb-fx-shake-kf ${SHAKE_MS}ms cubic-bezier(.36,.07,.19,.97) both; }`;
  document.head.appendChild(style);
}

interface Shard {
  id: number;
  clip: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  delay: number;
}

function makeShards(count: number): Shard[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 260 + Math.random() * 420;
    const corners = 3 + Math.floor(Math.random() * 2);
    const pts = Array.from({ length: corners }, (_, k) => {
      const a = (k / corners) * Math.PI * 2 + Math.random() * 0.8;
      const r = 30 + Math.random() * 20;
      return `${(50 + Math.cos(a) * r).toFixed(1)}% ${(50 + Math.sin(a) * r).toFixed(1)}%`;
    });
    return {
      id: i,
      clip: `polygon(${pts.join(',')})`,
      size: 18 + Math.random() * 46,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: (Math.random() - 0.5) * 540,
      delay: 0.08 + Math.random() * 0.08,
    };
  });
}

/**
 * Full-screen "CONTRADICTION!" hit: 300 ms body shake, red radial flash, slam-in title and
 * ~20 glass shards flying outward. Portaled to <body>, pointer-events none, calls `onDone`
 * after ~1100 ms. Reduced motion: no shake/shards, just a short flash and the word.
 */
export function ContradictionFlash({ show, onDone }: ContradictionFlashProps) {
  const reduced = useReduced();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  // New shard layout each time the flash is triggered.
  const shards = useMemo(() => (show && !reduced ? makeShards(20) : []), [show, reduced]);

  useEffect(() => {
    if (!show || typeof document === 'undefined') return;
    const body = document.body;
    let shakeTimer: number | undefined;
    if (!reduced) {
      ensureShakeStyle();
      body.classList.remove(SHAKE_CLASS);
      void body.offsetWidth; // restart the animation if re-triggered quickly
      body.classList.add(SHAKE_CLASS);
      shakeTimer = window.setTimeout(() => body.classList.remove(SHAKE_CLASS), SHAKE_MS + 20);
    }
    const doneTimer = window.setTimeout(() => onDoneRef.current?.(), TOTAL_MS);
    return () => {
      window.clearTimeout(shakeTimer);
      window.clearTimeout(doneTimer);
      body.classList.remove(SHAKE_CLASS);
    };
  }, [show, reduced]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="contradiction"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ pointerEvents: 'none' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          aria-live="assertive"
        >
          {/* Red radial flash */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,70,80,0.75) 0%, rgba(200,50,60,0.55) 35%, rgba(60,0,8,0.65) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55, 0.35] }}
            transition={{ duration: 0.6, times: [0, 0.12, 0.5, 1], ease: 'easeOut' }}
          />
          {/* Shockwave ring */}
          {!reduced && (
            <motion.div
              className="absolute rounded-full"
              style={{ width: 200, height: 200, border: '6px solid rgba(255,220,200,0.8)' }}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 7, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
            />
          )}
          {/* Glass shards */}
          {!reduced &&
            shards.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                style={{
                  width: s.size,
                  height: s.size,
                  clipPath: s.clip,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(200,225,255,0.55) 45%, rgba(255,180,180,0.35))',
                  willChange: 'transform, opacity',
                }}
                initial={{ x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 0 }}
                animate={{ x: s.x, y: s.y, rotate: s.rotate, scale: 1, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.85, delay: s.delay, ease: [0.12, 0.8, 0.3, 1], opacity: { duration: 0.85, delay: s.delay, times: [0, 0.1, 0.6, 1] } }}
              />
            ))}
          {/* Title slam */}
          <motion.div
            className="relative select-none text-center font-black uppercase"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(2.75rem, 11vw, 9rem)',
              lineHeight: 1,
              color: '#FFF4E6',
              textShadow:
                '0 0 2px #fff, 0 4px 0 #8a1820, 0 8px 24px rgba(0,0,0,0.6), 0 0 60px rgba(255,60,70,0.9)',
              WebkitTextStroke: '1px rgba(120,10,20,0.6)',
              willChange: 'transform, opacity',
            }}
            initial={reduced ? { opacity: 0 } : { scale: 3, rotate: -8, opacity: 0, letterSpacing: '0.4em' }}
            animate={reduced ? { opacity: 1 } : { scale: 1, rotate: -3, opacity: 1, letterSpacing: '0.02em' }}
            transition={
              reduced
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 700, damping: 22, mass: 0.9, opacity: { duration: 0.08 } }
            }
          >
            Contradiction!
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Stamp, fireConfetti, useReduced } from '../../components/fx';
import { RankInsignia } from './RankInsignia';
import { FP } from './theme';
import type { Rank, RankId } from './types';
import { RANKS, RANK_BY_ID } from './xp';

export interface RankUpCelebrationProps {
  from: Rank | number | RankId;
  to: Rank | number | RankId;
  onDone: () => void;
  /** Auto-dismiss after this many ms (0 = never). Default 8000. */
  autoCloseMs?: number;
  /** Optional sound hook, called when the stamp lands. */
  onStamp?: () => void;
}

const resolve = (r: Rank | number | RankId): Rank => (typeof r === 'number' ? RANKS[r] ?? RANKS[0] : typeof r === 'string' ? RANK_BY_ID[r] ?? RANKS[0] : r);

const OTTO_LINES = [
  "Hm. Don't let it go to your head, Rookie.",
  'Hm. New brass. Same desk.',
  'Hm. The paperwork for this was longer than the case.',
  'Hm. I suppose you earned it.',
];

/**
 * Full-screen promotion moment: the old insignia flips away, the new one flips in under a
 * spotlight, a PROMOTED stamp thuds and `fireConfetti('rank')` bursts. Click, Enter or Esc dismisses.
 */
export function RankUpCelebration({ from, to, onDone, autoCloseMs = 8000, onStamp }: RankUpCelebrationProps) {
  const a = resolve(from);
  const b = resolve(to);
  const reduced = useReduced();
  const [phase, setPhase] = useState<0 | 1 | 2>(reduced ? 2 : 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const stampRef = useRef(onStamp);
  stampRef.current = onStamp;
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t: number[] = [];
    if (!reduced) {
      t.push(window.setTimeout(() => setPhase(1), 700));
      t.push(window.setTimeout(() => setPhase(2), 1500));
    }
    t.push(window.setTimeout(() => {
      fireConfetti('rank');
      stampRef.current?.();
    }, reduced ? 50 : 1550));
    if (autoCloseMs > 0) t.push(window.setTimeout(() => doneRef.current(), autoCloseMs));
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') doneRef.current();
    };
    window.addEventListener('keydown', key);
    btnRef.current?.focus({ preventScroll: true });
    return () => {
      t.forEach(clearTimeout);
      window.removeEventListener('keydown', key);
    };
  }, [reduced, autoCloseMs]);

  const line = OTTO_LINES[b.index % OTTO_LINES.length];

  const node = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Promoted to ${b.name}`}
      className="fixed inset-0 flex overflow-y-auto px-4 pt-[calc(2rem+var(--safe-top))] pb-[calc(2rem+var(--safe-bottom))]"
      style={{ zIndex: 8000, background: 'radial-gradient(ellipse at 50% 40%, rgba(40,28,14,0.92), rgba(5,4,3,0.97) 70%)', color: FP.ink }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => doneRef.current()}
    >
      {/* spotlight cone */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[75vh] w-[min(720px,140vw)] -translate-x-1/2"
        style={{ background: `conic-gradient(from 180deg at 50% 0%, transparent 160deg, ${b.color}22 172deg, ${b.color}33 180deg, ${b.color}22 188deg, transparent 200deg)`, filter: 'blur(6px)' }}
      />
      <div className="relative m-auto flex max-w-md flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
        <motion.p
          className="mb-4 text-[11px] uppercase tracking-[0.4em]"
          style={{ fontFamily: FP.mono, color: FP.muted }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Lantern Bureau · Promotion
        </motion.p>

        <div className="relative grid h-[200px] w-[200px] place-items-center" style={{ perspective: 800 }}>
          {/* rotating rays */}
          <motion.div
            aria-hidden
            className="absolute inset-[-40px] rounded-full"
            style={{ background: `repeating-conic-gradient(from 0deg, ${b.color}26 0deg 6deg, transparent 6deg 18deg)`, maskImage: 'radial-gradient(circle, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, rotate: reduced ? 0 : 360 }}
            transition={{ opacity: { duration: 0.6 }, rotate: { duration: 40, repeat: Infinity, ease: 'linear' } }}
          />
          {phase === 0 && (
            <motion.div
              key="from"
              className="absolute"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <RankInsignia rank={a} size={150} />
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="flip" className="absolute" initial={{ rotateY: 0, scale: 1 }} animate={{ rotateY: 90, scale: 0.9, opacity: 0.4 }} transition={{ duration: 0.4, ease: 'easeIn' }}>
              <RankInsignia rank={a} size={150} />
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div
              key="to"
              className="absolute"
              initial={reduced ? { opacity: 0 } : { rotateY: -90, scale: 0.9 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 200, damping: 14 }}
            >
              <RankInsignia rank={b} size={168} glow />
            </motion.div>
          )}
          <div className="absolute -right-8 bottom-2" style={{ isolation: 'isolate' }}>
            <Stamp text="Promoted" show={phase === 2} color="#C8323C" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase === 2 ? 1 : 0, y: phase === 2 ? 0 : 10 }} transition={{ delay: reduced ? 0 : 0.25 }}>
          <p className="mt-6 text-sm" style={{ color: FP.muted, fontFamily: FP.mono }}>
            {a.name} <span aria-hidden>→</span>
          </p>
          <h2 className="mt-1 text-4xl font-black sm:text-5xl" style={{ fontFamily: FP.display, color: b.color, textShadow: `0 0 24px ${b.color}55` }}>
            {b.name}
          </h2>
          <p className="mt-4 text-sm italic" style={{ color: FP.ink, opacity: 0.85 }}>
            “{line}” <span className="not-italic" style={{ color: FP.muted }}>— Otto</span>
          </p>
          <button
            ref={btnRef}
            type="button"
            onClick={() => doneRef.current()}
            className="mt-7 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] outline-none transition hover:brightness-110 focus-visible:ring-2"
            style={{ borderRadius: 8, color: '#1A120A', background: 'linear-gradient(180deg, #F3D99A, #D4A857 55%, #A9833D)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 24px -12px rgba(212,168,87,0.9)', textShadow: '0 1px 0 rgba(255,255,255,0.35)' }}
          >
            Back to the desk
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
  return typeof document === 'undefined' ? node : createPortal(node, document.body);
}

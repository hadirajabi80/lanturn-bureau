import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Stamp, fireConfetti, useReduced } from '../../components/fx';
import { RankInsignia } from './RankInsignia';
import { SkinProvider } from '../ui/skin';
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
      style={{ zIndex: 8000, background: 'rgb(20 20 20 / 0.45)', color: FP.ink }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => doneRef.current()}
    >
      <motion.div
        className="relative m-auto flex w-full max-w-sm flex-col items-center px-6 pb-6 pt-5 text-center"
        style={{ background: FP.panel, borderRadius: 8, boxShadow: `inset 0 0 0 2px ${FP.ink}, 5px 5px 0 ${FP.ink}` }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="self-stretch pb-2 text-left text-[13px] font-semibold" style={{ color: FP.muted, borderBottom: `1px solid ${FP.hair}` }}>
          Lantern Bureau, personnel office
        </p>

        <div className="relative mt-4 grid h-[168px] w-[168px] place-items-center" style={{ perspective: 800 }}>
          {phase === 0 && (
            <motion.div
              key="from"
              className="absolute"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            >
              <RankInsignia rank={a} size={132} />
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="flip" className="absolute" initial={{ rotateY: 0, scale: 1 }} animate={{ rotateY: 90, scale: 0.92, opacity: 0.4 }} transition={{ duration: 0.22, ease: 'easeIn' }}>
              <RankInsignia rank={a} size={132} />
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div
              key="to"
              className="absolute"
              initial={reduced ? { opacity: 0 } : { rotateY: -90, scale: 0.92 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 20 }}
            >
              <RankInsignia rank={b} size={144} />
            </motion.div>
          )}
          <div className="absolute -bottom-4 -right-16" style={{ isolation: 'isolate' }}>
            <Stamp text="Promoted" show={phase === 2} color="#D7261E" />
          </div>
        </div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 2 ? 1 : 0 }}
          transition={{ delay: reduced ? 0 : 0.2, duration: 0.15 }}
        >
          <p className="mt-4 text-sm" style={{ color: FP.muted }}>
            {a.name} <span aria-hidden>→</span>
          </p>
          <h2 className="mt-0.5 text-4xl font-black leading-none sm:text-[2.6rem]" style={{ fontFamily: FP.display, letterSpacing: '-0.03em' }}>
            {b.name}
          </h2>
          <p className="mt-4 text-left text-sm" style={{ color: FP.ink, borderLeft: `3px solid ${FP.hl}`, paddingLeft: 10 }}>
            “{line}” <span style={{ color: FP.muted }}>Otto</span>
          </p>
          <button ref={btnRef} type="button" onClick={() => doneRef.current()} className="fp-brass mt-6 min-h-11 w-full px-6 text-sm">
            Back to the desk
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
  return typeof document === 'undefined' ? node : createPortal(<SkinProvider>{node}</SkinProvider>, document.body);
}

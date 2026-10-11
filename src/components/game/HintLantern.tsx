import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Flame, Lamp } from 'lucide-react';
import type { CaseFile } from '@/data/types';
import { game, type Session } from '@/engine/store';
import { PENALTY } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useReducedFx } from '@/components/ui/useReducedFx';

export interface HintLanternProps {
  caseFile: CaseFile;
  session: Session;
  className?: string;
}

const LEVELS = ['A nudge', 'A pointer', 'Practically a confession'];

export function HintLantern({ caseFile, session, className }: HintLanternProps) {
  const reduced = useReducedFx();
  const [open, setOpen] = useState(false);
  const [arming, setArming] = useState(false);
  const used = Math.min(session.hintsUsed, caseFile.hints.length);
  const left = caseFile.hints.length - used;

  const light = () => {
    if (!arming) {
      setArming(true);
      return;
    }
    const h = game().useHint();
    setArming(false);
    if (h) sfx.reveal();
  };

  const close = () => {
    setOpen(false);
    setArming(false);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          sfx.blip();
          setOpen(true);
        }}
        aria-label={`Hint lantern, ${left} hint${left === 1 ? '' : 's'} left`}
        className={clsx(
          'fixed bottom-24 right-4 z-40 grid size-14 place-items-center rounded-full border border-lantern/50 text-ink sm:bottom-6 sm:right-6',
          'bg-[radial-gradient(circle_at_40%_35%,#ffe0a3,#ffb347_45%,#c27d1e)]',
          className,
        )}
        animate={reduced ? undefined : { boxShadow: ['0 0 18px -2px rgb(255 179 71 / 0.55)', '0 0 34px 2px rgb(255 179 71 / 0.8)', '0 0 18px -2px rgb(255 179 71 / 0.55)'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.08, rotate: -6 }}
        whileTap={{ scale: 0.92 }}
      >
        <Lamp className="size-6" strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-ink bg-ink text-[10px] font-bold text-lantern">
          {left}
        </span>
      </motion.button>

      <Modal open={open} onClose={close} size="md" eyebrow="The hint lantern" title="Light it, and Otto will hear about it.">
        <p className="mb-4 text-sm text-paper/65">
          Each hint costs <span className="font-semibold text-[#ff8a90]">{PENALTY.hint} points</span>. They get progressively less subtle.
        </p>
        <ol className="space-y-2.5">
          {caseFile.hints.map((h, i) => {
            const lit = i < used;
            return (
              <li
                key={i}
                className={clsx(
                  'flex gap-3 rounded-xl border p-3.5',
                  lit ? 'border-lantern/40 bg-lantern/8' : 'border-white/6 bg-fog/40',
                )}
              >
                <Flame className={clsx('mt-0.5 size-4 shrink-0', lit ? 'text-lantern' : 'text-paper/20')} />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-paper/45">{LEVELS[i] ?? `Hint ${i + 1}`}</div>
                  <AnimatePresence mode="wait">
                    {lit ? (
                      <motion.p key="lit" initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="mt-0.5 text-paper/90">
                        {h}
                      </motion.p>
                    ) : (
                      <p key="dark" className="mt-0.5 select-none text-paper/25 blur-[3px]" aria-hidden>
                        {'The answer is hiding somewhere in this sentence, obviously.'}
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex items-center justify-end gap-2">
          {left > 0 ? (
            <>
              {arming && (
                <Button variant="ghost" onClick={() => setArming(false)}>
                  Actually, no
                </Button>
              )}
              <Button variant={arming ? 'danger' : 'primary'} icon={<Flame className="size-4" />} onClick={light}>
                {arming ? `Yes — spend ${PENALTY.hint} points` : `Light hint ${used + 1}`}
              </Button>
            </>
          ) : (
            <span className="text-sm italic text-paper/50">The lantern is out of oil. You're on your own, Rookie.</span>
          )}
        </div>
      </Modal>
    </>
  );
}

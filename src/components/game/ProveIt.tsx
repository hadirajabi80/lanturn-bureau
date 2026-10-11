import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { CaseFile } from '@/data/types';
import { game, type Session } from '@/engine/store';
import { PENALTY } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';

export interface ProveItProps {
  caseFile: CaseFile;
  session: Session;
  onDone: () => void;
}

interface Shown {
  qid: string;
  chosen: string;
  ok: boolean;
}

export function ProveIt({ caseFile, session, onDone }: ProveItProps) {
  const [shown, setShown] = useState<Shown | null>(null);
  const questions = caseFile.proveIt;
  const firstOpen = questions.findIndex((q) => session.proveItAnswers[q.id] === undefined);
  const idx = shown ? questions.findIndex((q) => q.id === shown.qid) : firstOpen;
  const q = idx >= 0 ? questions[idx] : undefined;

  const answer = (optionId: string) => {
    if (!q || shown) return;
    const ok = game().answerProveIt(q.id, optionId);
    if (ok) sfx.success();
    else sfx.wrong();
    setShown({ qid: q.id, chosen: optionId, ok });
  };

  const next = () => {
    setShown(null);
    if (firstOpen === -1) onDone();
  };

  if (!q) {
    return (
      <div className="text-center">
        <Button onClick={onDone} iconRight={<ArrowRight className="size-4" />}>
          Close the case
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* progress dots */}
      <div className="mb-5 flex items-center justify-center gap-2" aria-label={`Question ${idx + 1} of ${questions.length}`}>
        {questions.map((x, i) => {
          const a = session.proveItAnswers[x.id];
          const state = a === undefined ? (i === idx ? 'current' : 'todo') : a === x.correct ? 'right' : 'wrong';
          return (
            <motion.span
              key={x.id}
              layout
              className={clsx(
                'h-2.5 rounded-full',
                state === 'current' ? 'w-8 bg-lantern shadow-[0_0_10px_var(--color-lantern)]' : 'w-2.5',
                state === 'todo' && 'bg-white/15',
                state === 'right' && 'bg-teal',
                state === 'wrong' && 'bg-crimson',
              )}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-5 sm:p-6"
        >
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">
            Prove it · {idx + 1} of {questions.length}
          </div>
          <h3 className="font-display text-xl font-bold leading-snug sm:text-2xl">{q.prompt}</h3>
          <div className="mt-5 grid gap-2.5">
            {q.options.map((o, oi) => {
              const isChosen = shown?.chosen === o.id;
              const isCorrect = o.id === q.correct;
              const reveal = shown !== null;
              return (
                <motion.button
                  key={o.id}
                  type="button"
                  disabled={reveal}
                  onClick={() => answer(o.id)}
                  whileHover={reveal ? undefined : { x: 4 }}
                  className={clsx(
                    'flex items-start gap-3 rounded-xl border p-3.5 text-left text-[15px] leading-snug transition-colors',
                    !reveal && 'border-white/8 bg-fog/60 hover:border-brass/50 hover:bg-brass/5',
                    reveal && isCorrect && 'border-teal/60 bg-teal/10',
                    reveal && isChosen && !isCorrect && 'border-crimson/60 bg-crimson/10',
                    reveal && !isChosen && !isCorrect && 'border-white/5 bg-fog/30 opacity-50',
                  )}
                >
                  <span
                    className={clsx(
                      'grid size-6 shrink-0 place-items-center rounded-md border font-mono text-xs font-semibold',
                      reveal && isCorrect ? 'border-teal text-teal' : 'border-white/15 text-paper/60',
                    )}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="min-w-0 flex-1 text-paper/90">{o.text}</span>
                  {reveal && isCorrect && <CheckCircle2 className="size-5 shrink-0 text-teal" />}
                  {reveal && isChosen && !isCorrect && <XCircle className="size-5 shrink-0 text-crimson" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {shown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div
                  className={clsx(
                    'mt-4 rounded-xl border p-4 text-sm',
                    shown.ok ? 'border-teal/30 bg-teal/8' : 'border-crimson/30 bg-crimson/8',
                  )}
                >
                  <div className={clsx('mb-1 font-semibold', shown.ok ? 'text-teal' : 'text-[#ff8a90]')}>
                    {shown.ok ? 'Exactly.' : `Not quite. −${PENALTY.wrongProveIt} points.`}
                  </div>
                  <RichText text={q.explanation} className="text-paper/85" />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={next} iconRight={<ArrowRight className="size-4" />} data-autofocus>
                    {firstOpen === -1 ? 'Close the case' : 'Next question'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

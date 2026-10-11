import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { CheckCircle2, Grid3x3, KeyRound, Lightbulb, ListOrdered } from 'lucide-react';
import type { MiniPuzzle } from '@/data/types';
import { RichText } from '@/components/ui/RichText';
import { Badge } from '@/components/ui/Badge';

const TYPE_META: Record<MiniPuzzle['type'], { label: string; icon: ReactNode }> = {
  code: { label: 'Cipher lock', icon: <KeyRound className="size-4" /> },
  order: { label: 'Timeline', icon: <ListOrdered className="size-4" /> },
  grid: { label: 'Logic grid', icon: <Grid3x3 className="size-4" /> },
};

export interface PuzzleShellProps {
  puzzle: MiniPuzzle;
  index: number;
  solved: boolean;
  children: ReactNode;
  /** Message under the controls (e.g. "Not quite"). */
  feedback?: ReactNode;
}

export function PuzzleShell({ puzzle, index, solved, children, feedback }: PuzzleShellProps) {
  const [hint, setHint] = useState(false);
  const meta = TYPE_META[puzzle.type];
  return (
    <article
      className={clsx(
        'glass relative overflow-hidden rounded-2xl p-4 sm:p-6',
        solved && 'border-teal/40 shadow-[0_0_40px_-18px_var(--color-teal)]',
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">
            {meta.icon}
            Lock {index + 1} · {meta.label}
          </div>
          <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">{puzzle.title}</h3>
        </div>
        {solved && (
          <Badge tone="teal" icon={<CheckCircle2 className="size-3" />}>
            Solved
          </Badge>
        )}
      </header>

      <RichText text={puzzle.prompt} className="mb-5 text-[15px] text-paper/85" />

      {children}

      {feedback && <div className="mt-3 text-sm">{feedback}</div>}

      {!solved && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setHint((h) => !h)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brass/80 transition-colors hover:text-lantern"
            aria-expanded={hint}
          >
            <Lightbulb className="size-3.5" /> {hint ? 'Hide the nudge' : 'Need a nudge? (free)'}
          </button>
          <AnimatePresence>
            {hint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden text-sm italic text-paper/70"
              >
                <span className="mt-2 block rounded-lg border border-brass/20 bg-brass/5 p-3">{puzzle.hint}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 rounded-xl border border-teal/30 bg-teal/8 p-4 text-sm text-paper/90"
          >
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-teal">How it opens</div>
            <RichText text={puzzle.explanation} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export const normalizeAnswer = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

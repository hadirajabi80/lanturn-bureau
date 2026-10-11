import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronsRight, FastForward } from 'lucide-react';
import type { CaseFile, Line } from '@/data/types';
import { speakerOf } from '@/engine/characters';
import { sfx } from '@/engine/audio';
import { Avatar } from '@/components/avatar/Avatar';
import { Typewriter } from '@/components/fx';
import { useReducedFx } from '@/components/ui/useReducedFx';

export interface DialogueBoxProps {
  lines: Line[];
  caseFile?: CaseFile;
  onDone: () => void;
  className?: string;
  /** Label of the last advance button. */
  doneLabel?: string;
}

export function DialogueBox({ lines, caseFile, onDone, className, doneLabel = 'Continue' }: DialogueBoxProps) {
  const reduced = useReducedFx();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(false);
  const [instant, setInstant] = useState(false);
  const line = lines[idx];
  const isLast = idx >= lines.length - 1;

  const advance = useCallback(() => {
    if (!line) return;
    if (!typed) {
      setInstant(true);
      return;
    }
    if (isLast) {
      onDone();
      return;
    }
    sfx.blip();
    setIdx((i) => i + 1);
    setTyped(false);
    setInstant(false);
  }, [line, typed, isLast, onDone]);

  useEffect(() => {
    if (lines.length === 0) onDone();
  }, [lines.length, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        if (target?.tagName === 'BUTTON' && target.dataset.dialogue !== 'advance') return;
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  if (!line) return null;
  const who = speakerOf(caseFile, line.speaker);
  const isYou = line.speaker === 'you';

  return (
    <div className={clsx('relative', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Advance dialogue"
        onClick={advance}
        className="glass relative cursor-pointer select-none overflow-hidden rounded-2xl p-4 sm:p-5"
      >
        <div
          className="pointer-events-none absolute -top-24 size-64 rounded-full opacity-25 blur-3xl transition-all duration-700"
          style={{ background: who.avatar.accent, left: isYou ? 'auto' : '-4rem', right: isYou ? '-4rem' : 'auto' }}
          aria-hidden
        />
        <div className={clsx('relative flex items-end gap-4', isYou && 'flex-row-reverse')}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${line.speaker}-${idx}`}
              className="shrink-0"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: typed ? 0 : [0, -4, 0], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, y: { duration: 0.5, repeat: typed ? 0 : Infinity } }}
            >
              <Avatar spec={who.avatar} size={96} mood={line.mood ?? 'neutral'} speaking={!typed} />
            </motion.div>
          </AnimatePresence>
          <div className={clsx('min-w-0 flex-1 pb-1', isYou && 'text-right')}>
            <div className={clsx('mb-1.5 flex items-baseline gap-2', isYou && 'flex-row-reverse')}>
              <span className="rounded-md bg-brass/15 px-2 py-0.5 font-display text-sm font-bold text-lantern">{who.name}</span>
              {who.role && <span className="hidden truncate text-xs text-paper/45 sm:inline">{who.role}</span>}
            </div>
            <p className="min-h-[3.5rem] text-[15px] leading-relaxed text-paper/95 sm:text-base">
              <Typewriter key={idx} text={line.text} speed={18} instant={instant} onDone={() => setTyped(true)} />
            </p>
          </div>
        </div>
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-widest text-paper/35">
            {idx + 1} / {lines.length}
          </span>
          <motion.span
            className={clsx('flex items-center gap-1 text-xs font-semibold', typed ? 'text-lantern' : 'text-paper/30')}
            animate={typed && !reduced ? { x: [0, 3, 0] } : undefined}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isLast && typed ? doneLabel : 'Click or Enter'}
            <ChevronsRight className="size-4" />
          </motion.span>
        </div>
      </div>
      {!isLast && (
        <button
          type="button"
          onClick={onDone}
          className="absolute -top-9 right-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-paper/50 transition-colors hover:bg-white/5 hover:text-paper"
        >
          Skip <FastForward className="size-3.5" />
        </button>
      )}
    </div>
  );
}

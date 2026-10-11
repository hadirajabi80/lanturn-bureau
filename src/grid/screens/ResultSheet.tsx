import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Lightbulb, List, RotateCcw, Star, Trophy } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { Stamp, fireConfetti } from '@/components/fx';
import type { GuessResult } from '@/grid/store';
import type { Person } from '@/grid/types';
import { Sheet } from '@/grid/components/Sheet';
import { formatTime, play } from '@/grid/components/theme';

export interface ResultSheetProps {
  open: boolean;
  onClose: () => void;
  result: GuessResult | null;
  killer: Person | undefined;
  title: string;
  parSeconds: number;
  /** null hides the "Next case" button (end of season / daily case). */
  onNext: (() => void) | null;
  nextLabel?: string;
  onList: () => void;
  listLabel?: string;
  onReplay: () => void;
}

/** CASE CLOSED stamp, time, animated stars, confetti, and where-next buttons. */
export function ResultSheet({
  open,
  onClose,
  result,
  killer,
  title,
  parSeconds,
  onNext,
  nextLabel = 'Next case',
  onList,
  listLabel = 'Case list',
  onReplay,
}: ResultSheetProps) {
  const [stamped, setStamped] = useState(false);
  const stars = result?.stars ?? 0;

  useEffect(() => {
    if (!open || !result?.correct) {
      setStamped(false);
      return;
    }
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setStamped(true);
        play('stamp');
        fireConfetti('solve');
      }, 260),
    );
    for (let i = 0; i < stars; i++) timers.push(window.setTimeout(() => play('blip'), 900 + i * 260));
    timers.push(window.setTimeout(() => play('success'), 950 + stars * 260));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [open, result, stars]);

  return (
    <Sheet open={open && !!result} onClose={onClose}>
      {result && (
        <div className="flex flex-col items-center text-center">
          <div className="relative mt-1 flex h-24 w-full items-center justify-center">
            {killer && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="block size-20 overflow-hidden rounded-[22px] shadow-[0_12px_24px_-14px_rgb(0_0_0/0.6)]"
                style={{ background: `linear-gradient(170deg, ${killer.avatar.accent}66, ${killer.avatar.accent})` }}
              >
                <Avatar spec={killer.avatar} size={80} mood="angry" />
              </motion.span>
            )}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Stamp text="Case closed" show={stamped} />
            </div>
          </div>

          <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8632b]">{title}</div>
          <h2 className="font-display text-2xl font-black leading-tight">
            {killer ? `${killer.name} did it.` : 'Killer found.'}
          </h2>

          <div className="mt-4 flex items-center gap-2" aria-label={`${stars} of 3 stars`}>
            {[0, 1, 2].map((i) => {
              const on = i < stars;
              return (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -40, opacity: 0 }}
                  animate={{ scale: on ? [0, 1.35, 1] : 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.26, duration: 0.45 }}
                  className={i === 1 ? '-translate-y-2' : ''}
                >
                  <Star
                    className="size-12 drop-shadow-[0_6px_10px_rgb(242_176_30/0.45)]"
                    style={{ color: on ? '#f2b01e' : '#d9d0c3' }}
                    fill={on ? '#f2b01e' : '#ece4d8'}
                    strokeWidth={1.4}
                  />
                </motion.span>
              );
            })}
          </div>

          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            <Stat icon={<Clock className="size-4" />} label="Time" value={formatTime(result.timeMs)} />
            <Stat
              icon={<Trophy className="size-4" />}
              label={result.newBest ? 'New best!' : 'Best'}
              value={formatTime(result.bestTimeMs ?? result.timeMs)}
              highlight={result.newBest}
            />
            <Stat icon={<Lightbulb className="size-4" />} label="Hints" value={String(result.hintsUsed)} />
          </div>
          <p className="mt-2 text-[12px] text-[#8a8178]">
            Par {formatTime(parSeconds * 1000)} ·{' '}
            {stars === 3 ? 'Flawless detective work.' : 'No hints and under par earns three stars.'}
          </p>

          <div className="mt-5 flex w-full flex-col gap-2">
            {onNext && (
              <button
                type="button"
                data-autofocus
                onClick={onNext}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#e8632b] py-3.5 text-base font-bold text-white shadow-[0_14px_26px_-14px_#e8632b] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {nextLabel} <ArrowRight className="size-5" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-autofocus={onNext ? undefined : true}
                onClick={onList}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-[#2b2724] ring-1 ring-black/10 hover:bg-[#fbf8f3]"
              >
                <List className="size-4" /> {listLabel}
              </button>
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-[#2b2724] ring-1 ring-black/10 hover:bg-[#fbf8f3]"
              >
                <RotateCcw className="size-4" /> Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Stat({ icon, label, value, highlight }: { icon: ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-2.5 ring-1 ring-black/5">
      <span className={highlight ? 'text-[#e8632b]' : 'text-[#8a8178]'}>{icon}</span>
      <span className="font-mono text-base font-bold tabular-nums text-[#2b2724]">{value}</span>
      <span className={`text-[11px] font-semibold ${highlight ? 'text-[#e8632b]' : 'text-[#8a8178]'}`}>{label}</span>
    </div>
  );
}

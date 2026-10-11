import clsx from 'clsx';
import { formatTime } from './theme';

export interface TimerPillProps {
  ms: number;
  /** Stops the pulsing dot. */
  stopped?: boolean;
  className?: string;
}

/** "● mm:ss" pill in the case top bar. */
export function TimerPill({ ms, stopped, className }: TimerPillProps) {
  return (
    <span
      role="timer"
      aria-label={`Elapsed time ${formatTime(ms)}`}
      className={clsx(
        'inline-flex h-9 items-center gap-2 rounded-full bg-white px-3.5 font-mono text-sm font-semibold tabular-nums text-[#2b2724]',
        'shadow-[0_6px_16px_-10px_rgb(70_45_20/0.35)] ring-1 ring-black/5',
        className,
      )}
    >
      <span className="relative flex size-2">
        {!stopped && <span className="absolute inset-0 animate-ping rounded-full bg-[#e8632b]/50" />}
        <span className={clsx('relative size-2 rounded-full', stopped ? 'bg-[#bdb3a6]' : 'bg-[#e8632b]')} />
      </span>
      {formatTime(ms)}
    </span>
  );
}

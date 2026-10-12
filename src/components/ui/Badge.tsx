import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeTone = 'brass' | 'crimson' | 'teal' | 'fog' | 'paper' | 'lantern';

/** v3 printed tags: flat fills with an ink (or red / green) outline. Tone names kept from v2. */
const TONES: Record<BadgeTone, string> = {
  brass: 'bg-print-yellow text-print-ink shadow-[inset_0_0_0_1.5px_#141414]',
  crimson: 'bg-print-card text-print-red-ink shadow-[inset_0_0_0_1.5px_#D7261E]',
  teal: 'bg-print-card text-print-green shadow-[inset_0_0_0_1.5px_#1E8A4C]',
  fog: 'bg-print-paper text-print-muted shadow-[inset_0_0_0_1px_#D9D9D2]',
  paper: 'bg-print-card text-print-ink shadow-[inset_0_0_0_1.5px_#141414]',
  lantern: 'bg-print-yellow text-print-ink shadow-[inset_0_0_0_1.5px_#141414]',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  title?: string;
}

export function Badge({ tone = 'brass', icon, className, children, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={clsx('inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold leading-4', TONES[tone], className)}
    >
      {icon}
      {children}
    </span>
  );
}

/** Round counter dot for icon badges. */
export function CountDot({ count, tone = 'lantern' }: { count: number; tone?: 'lantern' | 'crimson' }) {
  return (
    <span
      className={clsx(
        'grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[11px] font-semibold shadow-[inset_0_0_0_1.5px_#141414]',
        tone === 'lantern' ? 'bg-print-yellow text-print-ink' : 'bg-print-red text-white',
      )}
    >
      {count}
    </span>
  );
}

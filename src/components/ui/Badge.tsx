import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeTone = 'brass' | 'crimson' | 'teal' | 'fog' | 'paper' | 'lantern';

const TONES: Record<BadgeTone, string> = {
  brass: 'bg-brass/15 text-brass border-brass/40',
  crimson: 'bg-crimson/15 text-[#ff7b82] border-crimson/50',
  teal: 'bg-teal/12 text-teal border-teal/40',
  fog: 'bg-fog-2 text-paper/70 border-white/10',
  paper: 'bg-paper text-ink border-paper',
  lantern: 'bg-lantern text-ink border-lantern',
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
      className={clsx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4',
        TONES[tone],
        className,
      )}
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
        'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-ink shadow',
        tone === 'lantern' ? 'bg-lantern' : 'bg-crimson text-paper',
      )}
    >
      {count}
    </span>
  );
}

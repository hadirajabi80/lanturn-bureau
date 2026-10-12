import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Legacy tone names; in the printed UI `glass` and `paper` are white cards, `ink` is a paper-grey inset. */
  tone?: 'glass' | 'paper' | 'ink';
  padded?: boolean;
  title?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

const TONES = {
  glass: 'bg-print-card text-print-ink shadow-[inset_0_0_0_2px_#141414]',
  paper: 'bg-print-card text-print-ink shadow-[inset_0_0_0_2px_#141414]',
  ink: 'bg-print-paper text-print-ink shadow-[inset_0_0_0_1.5px_#D9D9D2]',
} as const;

/** White card with a 2px ink border and an optional header row (title over a 2px ink rule). */
export function Panel({ tone = 'glass', padded = true, title, eyebrow, actions, className, children, ...rest }: PanelProps) {
  return (
    <section className={clsx('rounded-lg', TONES[tone], padded && 'p-4 sm:p-5', className)} {...rest}>
      {(title || eyebrow || actions) && (
        <header className="mb-3 flex items-end justify-between gap-3 border-b-2 border-print-ink pb-2">
          <div className="min-w-0">
            {eyebrow && <div className="mb-0.5 text-[13px] font-semibold text-print-muted">{eyebrow}</div>}
            {title && <h3 className="font-display text-lg font-extrabold leading-tight sm:text-xl">{title}</h3>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

/** Small inner card used for list items; `selected` = yellow highlighter with an ink border. */
export function Card({ interactive, selected, className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-md p-3 text-print-ink transition-colors duration-100',
        selected ? 'bg-print-yellow shadow-[inset_0_0_0_2px_#141414]' : 'bg-print-card shadow-[inset_0_0_0_1.5px_#D9D9D2]',
        interactive && !selected && 'hover:shadow-[inset_0_0_0_1.5px_#141414]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Small label used across panels: 13px semibold muted, sentence case. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('text-[13px] font-semibold text-print-muted', className)}>{children}</div>;
}

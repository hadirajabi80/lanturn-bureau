import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'glass' | 'paper' | 'ink';
  padded?: boolean;
  title?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

const TONES = {
  glass: 'glass text-paper',
  paper: 'paper',
  ink: 'bg-ink-2/90 border border-white/5 text-paper',
} as const;

/** Rounded surface with an optional header row. */
export function Panel({ tone = 'glass', padded = true, title, eyebrow, actions, className, children, ...rest }: PanelProps) {
  return (
    <section className={clsx('rounded-2xl', TONES[tone], padded && 'p-4 sm:p-5', className)} {...rest}>
      {(title || eyebrow || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <div
                className={clsx(
                  'mb-0.5 font-mono text-[10px] uppercase tracking-[0.25em]',
                  tone === 'paper' ? 'text-[#8a6a35]' : 'text-brass/80',
                )}
              >
                {eyebrow}
              </div>
            )}
            {title && <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">{title}</h3>}
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

/** Small inner card used for list items. */
export function Card({ interactive, selected, className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border bg-fog/60 p-3 transition-all duration-200',
        selected ? 'border-brass/70 bg-brass/10 shadow-glow' : 'border-white/6',
        interactive && !selected && 'hover:-translate-y-0.5 hover:border-brass/35 hover:bg-fog-2/70',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Small uppercase label used across panels. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80', className)}>{children}</div>
  );
}

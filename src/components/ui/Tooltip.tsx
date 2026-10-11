import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  disabled?: boolean;
  className?: string;
}

/** CSS-only tooltip: shows on hover and on keyboard focus within. */
export function Tooltip({ content, children, side = 'top', disabled, className }: TooltipProps) {
  if (disabled || content === null || content === undefined || content === '') return <>{children}</>;
  return (
    <span className={clsx('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-lg border border-brass/30 bg-ink/95 px-2.5 py-1.5',
          'text-center text-xs font-medium text-paper opacity-0 shadow-deep transition-all duration-150',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top'
            ? 'bottom-full mb-2 translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0'
            : 'top-full mt-2 -translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}

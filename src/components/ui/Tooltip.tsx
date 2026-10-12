import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  disabled?: boolean;
  className?: string;
}

/** CSS-only tooltip: a small white label with an ink outline; shows on hover and on keyboard focus within. */
export function Tooltip({ content, children, side = 'top', disabled, className }: TooltipProps) {
  if (disabled || content === null || content === undefined || content === '') return <>{children}</>;
  return (
    <span className={clsx('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-md bg-print-card px-2.5 py-1.5',
          'text-center text-xs font-semibold text-print-ink opacity-0 shadow-[inset_0_0_0_1.5px_#141414,2px_2px_0_#141414] transition-opacity duration-100',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  );
}

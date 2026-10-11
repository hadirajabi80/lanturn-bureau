import { Star } from 'lucide-react';
import clsx from 'clsx';
import type { CaseStatus } from '@/grid/store';
import { C } from './theme';

export interface StatusPillProps {
  status: CaseStatus;
  stars?: number;
  className?: string;
}

/** NEW / IN PROGRESS / SOLVED ★★★ chip used in the case list. */
export function StatusPill({ status, stars = 0, className }: StatusPillProps) {
  if (status === 'solved') {
    return (
      <span className={clsx('inline-flex items-center gap-1.5', className)}>
        <span className="rounded-full bg-[#e6f3e8] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#2f7d43]">
          SOLVED
        </span>
        <Stars value={stars} size={12} />
      </span>
    );
  }
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider',
        status === 'progress' ? 'bg-[#fdebdf] text-[#c4501d]' : 'bg-[#efe9df] text-[#8a8178]',
        className,
      )}
    >
      {status === 'progress' ? 'IN PROGRESS' : 'NEW'}
    </span>
  );
}

export function Stars({ value, size = 14, max = 3 }: { value: number; size?: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          style={{ width: size, height: size, color: i < value ? '#f2b01e' : '#d9d0c3' }}
          fill={i < value ? '#f2b01e' : 'none'}
          strokeWidth={i < value ? 1.5 : 2}
        />
      ))}
    </span>
  );
}

export const STATUS_DOT: Record<CaseStatus, string> = { new: C.muted, progress: C.orange, solved: C.green };

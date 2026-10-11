import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color: string;
  className?: string;
  /** Bar height in px (default 6). */
  height?: number;
  label?: string;
}

export function ProgressBar({ value, color, className, height = 6, label }: ProgressBarProps) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={clsx('w-full overflow-hidden rounded-full bg-[#ece4d8]', className)}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${v * 100}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.1 }}
      />
    </div>
  );
}

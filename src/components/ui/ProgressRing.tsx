import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
}

export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  color = 'var(--color-brass)',
  track = 'rgb(255 255 255 / 0.08)',
  children,
  label,
}: ProgressRingProps) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      {children !== undefined && (
        <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">{children}</div>
      )}
    </div>
  );
}

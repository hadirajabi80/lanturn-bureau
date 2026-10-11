import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle' | 'teal';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Gentle lantern hum (used on hero calls-to-action). */
  hum?: boolean;
  block?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#e7c47c] via-brass to-[#a9833d] text-ink border border-[#f3d99a]/60 ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_10px_24px_-12px_rgb(212_168_87/0.9)] ' +
    'hover:brightness-110 disabled:brightness-75',
  ghost:
    'bg-transparent text-paper border border-paper/15 hover:border-brass/60 hover:text-lantern hover:bg-brass/5',
  danger:
    'bg-gradient-to-b from-[#de4a52] to-crimson text-paper border border-[#ff8a8f]/30 ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-12px_rgb(200_50_60/0.9)] hover:brightness-110',
  subtle: 'bg-fog-2/70 text-paper border border-white/5 hover:bg-fog-3/80 hover:border-brass/30',
  teal:
    'bg-gradient-to-b from-[#4fd8cb] to-teal text-ink border border-[#9ff0e8]/40 ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_24px_-12px_rgb(46_196_182/0.9)] hover:brightness-110',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  hum,
  block,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      whileHover={isDisabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={clsx(
        'relative inline-flex select-none items-center justify-center font-semibold tracking-wide transition-[filter,background-color,border-color,color] duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        hum && !isDisabled && 'animate-hum',
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children !== undefined && <span>{children}</span>}
      {iconRight}
    </motion.button>
  );
}

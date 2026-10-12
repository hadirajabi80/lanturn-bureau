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
  /** Legacy v2 prop (idle lantern hum). Ignored: the printed UI has no idle animation. */
  hum?: boolean;
  block?: boolean;
  children?: ReactNode;
}

/** v3 printed buttons (docs/PRINT-DESIGN.md): flat fills, 2px ink border, hard shadow only on the primary. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-print-red text-white font-display font-extrabold shadow-[inset_0_0_0_2px_#141414,3px_3px_0_#141414] ' +
    'hover:shadow-[inset_0_0_0_2px_#141414,4px_4px_0_#141414] hover:-translate-x-px hover:-translate-y-px ' +
    'active:translate-x-[3px] active:translate-y-[3px] active:bg-print-red-ink active:shadow-[inset_0_0_0_2px_#141414]',
  ghost: 'bg-print-card text-print-ink shadow-[inset_0_0_0_2px_#141414] hover:bg-[#FFEFA6]',
  danger: 'bg-print-card text-print-red-ink shadow-[inset_0_0_0_2px_#D7261E] hover:bg-[#FBE3E1]',
  subtle: 'bg-print-paper text-print-ink shadow-[inset_0_0_0_1.5px_#D9D9D2] hover:shadow-[inset_0_0_0_1.5px_#141414]',
  teal: 'bg-print-blue text-white shadow-[inset_0_0_0_2px_#141414] hover:brightness-110',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-md',
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
  void hum;
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      className={clsx(
        'relative inline-flex select-none items-center justify-center font-semibold transition-[transform,box-shadow,background-color] duration-100',
        'disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:bg-print-grey disabled:text-[#6B6B66] disabled:shadow-[inset_0_0_0_2px_#9A9A94]',
        VARIANTS[variant],
        SIZES[size],
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

import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string;
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  badge?: ReactNode;
}

const SIZES = { sm: 'size-8', md: 'size-10', lg: 'size-12' } as const;

/** Square white button with an ink outline; `active` = yellow highlighter. */
export function IconButton({ label, icon, size = 'md', active, badge, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <motion.button
      type={type}
      aria-label={label}
      title={label}
      whileTap={{ y: 1 }}
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center rounded-md text-print-ink transition-colors duration-100',
        'disabled:cursor-not-allowed disabled:bg-print-grey disabled:text-[#6B6B66] disabled:shadow-[inset_0_0_0_1.5px_#9A9A94]',
        active ? 'bg-print-yellow shadow-[inset_0_0_0_2px_#141414]' : 'bg-print-card shadow-[inset_0_0_0_1.5px_#141414] hover:bg-[#FFEFA6]',
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {badge !== undefined && badge !== null && badge !== false && <span className="absolute -right-1.5 -top-1.5">{badge}</span>}
    </motion.button>
  );
}

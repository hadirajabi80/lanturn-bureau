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

const SIZES = { sm: 'size-8 rounded-lg', md: 'size-10 rounded-xl', lg: 'size-12 rounded-2xl' } as const;

export function IconButton({ label, icon, size = 'md', active, badge, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <motion.button
      type={type}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center border transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'border-brass/60 bg-brass/15 text-lantern'
          : 'border-white/8 bg-fog/60 text-paper/80 hover:border-brass/40 hover:text-lantern',
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {badge !== undefined && badge !== null && badge !== false && (
        <span className="absolute -right-1.5 -top-1.5">{badge}</span>
      )}
    </motion.button>
  );
}

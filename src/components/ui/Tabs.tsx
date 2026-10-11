import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Tooltip } from './Tooltip';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Shown as a tooltip (useful to explain why a tab is disabled). */
  hint?: string;
  badge?: ReactNode;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** 'top' = underline tabs; 'bottom' = mobile bottom bar with icons. */
  variant?: 'top' | 'bottom';
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, variant = 'top', className }: TabsProps<T>) {
  const group = useId();
  const enabled = items.filter((i) => !i.disabled);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const idx = enabled.findIndex((i) => i.id === value);
    const next = enabled[(idx + (e.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length];
    if (next) {
      e.preventDefault();
      onChange(next.id);
    }
  };

  if (variant === 'bottom') {
    return (
      <div
        role="tablist"
        onKeyDown={onKey}
        className={clsx('glass pb-safe flex items-stretch justify-around rounded-none border-x-0 border-b-0', className)}
      >
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              role="tab"
              aria-selected={active}
              disabled={it.disabled}
              title={it.disabled ? it.hint : undefined}
              onClick={() => onChange(it.id)}
              className={clsx(
                'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                active ? 'text-lantern' : 'text-paper/55',
                it.disabled && 'opacity-35',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${group}-bar`}
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-lantern shadow-[0_0_10px_var(--color-lantern)]"
                />
              )}
              <span className="relative">
                {it.icon}
                {it.badge !== undefined && <span className="absolute -right-3 -top-2">{it.badge}</span>}
              </span>
              <span className="truncate">{it.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="tablist" onKeyDown={onKey} className={clsx('flex items-end gap-1 border-b border-white/8', className)}>
      {items.map((it) => {
        const active = it.id === value;
        const btn = (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            aria-disabled={it.disabled || undefined}
            disabled={it.disabled}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(it.id)}
            className={clsx(
              'relative flex items-center gap-2 px-3.5 pb-3 pt-2 text-sm font-semibold tracking-wide transition-colors',
              active ? 'text-lantern' : 'text-paper/60 hover:text-paper',
              it.disabled && 'cursor-not-allowed opacity-40 hover:text-paper/60',
            )}
          >
            {it.icon}
            {it.label}
            {it.badge}
            {active && (
              <motion.span
                layoutId={`${group}-line`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-lantern shadow-[0_0_12px_var(--color-lantern)]"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
        return it.disabled && it.hint ? (
          <Tooltip key={it.id} content={it.hint} side="bottom">
            {btn}
          </Tooltip>
        ) : (
          btn
        );
      })}
    </div>
  );
}

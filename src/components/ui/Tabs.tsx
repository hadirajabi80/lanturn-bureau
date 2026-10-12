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
        className={clsx('pb-safe flex items-stretch justify-around bg-print-card shadow-[inset_0_2px_0_#141414]', className)}
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
                'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pb-1.5 pt-2 text-[11px] font-semibold transition-colors',
                active ? 'text-print-ink' : 'text-print-muted',
                it.disabled && 'text-[#9A9A94]',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${group}-bar`}
                  className="absolute inset-x-3 top-0.5 h-[3px] rounded-full bg-print-red"
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
    <div role="tablist" onKeyDown={onKey} className={clsx('flex items-end gap-1 border-b-2 border-print-ink', className)}>
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
              'relative flex items-center gap-2 px-3.5 pb-2.5 pt-2 text-sm font-semibold transition-colors',
              active ? 'text-print-ink' : 'text-print-muted hover:text-print-ink',
              it.disabled && 'cursor-not-allowed text-[#9A9A94] hover:text-[#9A9A94]',
            )}
          >
            {it.icon}
            {it.label}
            {it.badge}
            {active && (
              <motion.span
                layoutId={`${group}-line`}
                className="absolute inset-x-2 -bottom-[2px] h-[4px] bg-print-red"
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

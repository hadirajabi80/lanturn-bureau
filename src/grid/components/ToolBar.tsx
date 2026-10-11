import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Eraser, Lightbulb, MapPin, Pencil, type LucideIcon } from 'lucide-react';
import type { Tool } from '@/grid/store';

export interface ToolBarProps {
  tool: Tool;
  onTool: (t: Tool) => void;
  hintsLeft: number;
  onHint: () => void;
  disabled?: boolean;
  className?: string;
}

const TOOLS: { id: Tool; label: string; icon: LucideIcon; key: string }[] = [
  { id: 'notes', label: 'Notes', icon: Pencil, key: '1' },
  { id: 'place', label: 'Place', icon: MapPin, key: '2' },
  { id: 'erase', label: 'Erase', icon: Eraser, key: '3' },
];

const base =
  'relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[12px] font-semibold transition-colors disabled:opacity-45';

/** Notes · Place · Erase · Hint row. */
export function ToolBar({ tool, onTool, hintsLeft, onHint, disabled, className }: ToolBarProps) {
  return (
    <div role="toolbar" aria-label="Tools" className={clsx('flex gap-2', className)}>
      {TOOLS.map(({ id, label, icon: Icon, key }) => {
        const active = tool === id;
        return (
          <motion.button
            key={id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-keyshortcuts={key}
            title={`${label} (${key})`}
            whileTap={{ scale: 0.94 }}
            onClick={() => onTool(id)}
            className={clsx(
              base,
              active
                ? 'bg-[#2b2724] text-white shadow-[0_10px_20px_-12px_rgb(0_0_0/0.6)]'
                : 'bg-white text-[#2b2724] shadow-[0_6px_16px_-12px_rgb(70_45_20/0.4)] ring-1 ring-black/5 hover:bg-[#fbf8f3]',
            )}
          >
            <Icon className="size-5" strokeWidth={2.2} />
            {label}
          </motion.button>
        );
      })}
      <motion.button
        type="button"
        disabled={disabled || hintsLeft <= 0}
        aria-keyshortcuts="h"
        title={`Hint (H) — ${hintsLeft} left`}
        aria-label={`Hint, ${hintsLeft} left`}
        whileTap={{ scale: 0.94 }}
        onClick={onHint}
        className={clsx(
          base,
          'bg-white text-[#2b2724] shadow-[0_6px_16px_-12px_rgb(70_45_20/0.4)] ring-1 ring-black/5 hover:bg-[#fff7ee]',
        )}
      >
        <Lightbulb className="size-5 text-[#e8632b]" strokeWidth={2.2} />
        Hint
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#e8632b] px-1 text-[11px] font-bold leading-5 text-white shadow ring-2 ring-[#f3ede4]">
          {hintsLeft}
        </span>
      </motion.button>
    </div>
  );
}

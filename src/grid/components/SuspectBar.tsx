import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, ChevronLeft, ChevronRight, Skull } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import type { Cell, Person } from '@/grid/types';

export interface SuspectBarProps {
  people: Person[];
  placements: Record<string, Cell | null>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Person ids to pulse (wrong submission). */
  violations?: string[];
  className?: string;
}

/**
 * Horizontally scrollable carousel of avatar tiles (64 px; 52 px when there are more than 8 people),
 * selected one outlined in orange and kept in view, placed ones ticked.
 */
export function SuspectBar({ people, placements, selectedId, onSelect, violations = [], className }: SuspectBarProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const compact = people.length > 8;
  const placedCount = people.filter((p) => !!placements[p.id]).length;

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, people.length]);

  // Keep the selected tile in view (keyboard / hint selection).
  useEffect(() => {
    if (!selectedId) return;
    const el = scroller.current?.querySelector<HTMLElement>(`[data-person="${CSS.escape(selectedId)}"]`);
    const box = scroller.current;
    if (!el || !box) return;
    // Scroll only the carousel (never the page): bring the tile fully into view with a little margin.
    const pad = 24;
    const left = el.offsetLeft; // the scroller is the offsetParent (position: relative)
    const right = left + el.offsetWidth;
    let target = box.scrollLeft;
    if (left - pad < box.scrollLeft) target = left - pad;
    else if (right + pad > box.scrollLeft + box.clientWidth) target = right + pad - box.clientWidth;
    if (target !== box.scrollLeft) box.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [selectedId]);

  const nudge = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scroller}
        onScroll={measure}
        role="listbox"
        aria-label={`Suspects, ${placedCount} of ${people.length} placed`}
        aria-orientation="horizontal"
        className={clsx(
          'relative flex snap-x overflow-x-auto overscroll-x-contain px-1 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          compact ? 'gap-1.5' : 'gap-2.5',
        )}
      >
        {people.map((p) => {
          const selected = p.id === selectedId;
          const placed = !!placements[p.id];
          const bad = violations.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-person={p.id}
              onClick={() => onSelect(p.id)}
              aria-label={`${p.isVictim ? 'Victim: ' : ''}${p.name}${placed ? ', placed' : ''}`}
              className={clsx('group flex shrink-0 snap-start flex-col items-center gap-1 outline-none', compact ? 'w-[60px]' : 'w-[72px]')}
            >
              <motion.span
                className={clsx(
                  'relative grid place-items-center rounded-2xl transition-shadow',
                  compact ? 'size-[52px]' : 'size-16',
                  selected
                    ? 'shadow-[0_0_0_3px_#e8632b,0_10px_18px_-10px_rgb(232_99_43/0.8)]'
                    : 'shadow-[0_6px_14px_-10px_rgb(70_45_20/0.5)] ring-1 ring-black/5 group-focus-visible:shadow-[0_0_0_3px_#e8632b80]',
                )}
                style={{ background: `linear-gradient(170deg, ${p.avatar.accent}55, ${p.avatar.accent}cc)` }}
                animate={bad ? { scale: [1, 1.1, 1, 1.1, 1], boxShadow: '0 0 0 3px #d9443a' } : { scale: 1 }}
                transition={bad ? { duration: 1.6, ease: 'easeInOut' } : { duration: 0.2 }}
                whileTap={{ scale: 0.93 }}
              >
                <span className={clsx('block overflow-hidden rounded-xl', compact ? 'size-[44px]' : 'size-14')}>
                  <Avatar spec={p.avatar} size={compact ? 44 : 56} />
                </span>
                {p.isVictim && (
                  <span
                    className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-[#2b2724] text-white ring-2 ring-[#f3ede4]"
                    title="Victim"
                  >
                    <Skull className="size-3" strokeWidth={2.4} />
                  </span>
                )}
                {placed && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#3f9d55] text-white ring-2 ring-[#f3ede4]">
                    <Check className="size-3" strokeWidth={3.2} />
                  </span>
                )}
              </motion.span>
              <span
                className={clsx(
                  'w-full truncate text-center leading-tight',
                  compact ? 'text-[11px]' : 'text-[12px]',
                  selected ? 'font-bold text-[#e8632b]' : 'font-medium text-[#2b2724]',
                )}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
      {edges.left && (
        <button
          type="button"
          aria-label="Scroll suspects left"
          onClick={() => nudge(-1)}
          className={clsx('absolute -left-2 grid size-7 place-items-center rounded-full bg-white text-[#e8632b] shadow-md ring-1 ring-black/5', compact ? 'top-5' : 'top-7')}
        >
          <ChevronLeft className="size-4" strokeWidth={3} />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label="Scroll suspects right"
          onClick={() => nudge(1)}
          className={clsx('absolute -right-2 grid size-7 place-items-center rounded-full bg-white text-[#e8632b] shadow-md ring-1 ring-black/5', compact ? 'top-5' : 'top-7')}
        >
          <ChevronRight className="size-4" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

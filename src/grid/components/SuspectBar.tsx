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

/** Horizontally scrollable carousel of avatar tiles (64 px), selected one outlined in orange. */
export function SuspectBar({ people, placements, selectedId, onSelect, violations = [], className }: SuspectBarProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

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
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const nudge = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scroller}
        onScroll={measure}
        role="listbox"
        aria-label="Suspects"
        aria-orientation="horizontal"
        className="flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              className="group flex w-[72px] shrink-0 snap-start flex-col items-center gap-1 outline-none"
            >
              <motion.span
                className={clsx(
                  'relative grid size-16 place-items-center rounded-2xl transition-shadow',
                  selected
                    ? 'shadow-[0_0_0_3px_#e8632b,0_10px_18px_-10px_rgb(232_99_43/0.8)]'
                    : 'shadow-[0_6px_14px_-10px_rgb(70_45_20/0.5)] ring-1 ring-black/5 group-focus-visible:shadow-[0_0_0_3px_#e8632b80]',
                )}
                style={{ background: `linear-gradient(170deg, ${p.avatar.accent}55, ${p.avatar.accent}cc)` }}
                animate={bad ? { scale: [1, 1.1, 1, 1.1, 1], boxShadow: '0 0 0 3px #d9443a' } : { scale: 1 }}
                transition={bad ? { duration: 1.6, ease: 'easeInOut' } : { duration: 0.2 }}
                whileTap={{ scale: 0.93 }}
              >
                <span className="block size-14 overflow-hidden rounded-xl">
                  <Avatar spec={p.avatar} size={56} />
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
                  'w-full truncate text-center text-[12px] leading-tight',
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
          className="absolute -left-2 top-7 grid size-7 place-items-center rounded-full bg-white text-[#e8632b] shadow-md ring-1 ring-black/5"
        >
          <ChevronLeft className="size-4" strokeWidth={3} />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label="Scroll suspects right"
          onClick={() => nudge(1)}
          className="absolute -right-2 top-7 grid size-7 place-items-center rounded-full bg-white text-[#e8632b] shadow-md ring-1 ring-black/5"
        >
          <ChevronRight className="size-4" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

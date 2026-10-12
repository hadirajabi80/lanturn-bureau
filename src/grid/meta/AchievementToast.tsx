import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { create } from 'zustand';
import { useReduced } from '../../components/fx';
import { ACHIEVEMENT_ICONS } from './icons';
import { FP, METAL } from './theme';
import type { Achievement } from './types';

export interface ToastItem {
  key: string;
  achievement: Achievement;
}

interface ToastState {
  queue: ToastItem[];
  push: (list: Achievement | Achievement[]) => void;
  dismiss: (key: string) => void;
  clear: () => void;
}

let seq = 0;

const useToastStore = create<ToastState>()((set) => ({
  queue: [],
  push: (list) => {
    const arr = Array.isArray(list) ? list : [list];
    if (!arr.length) return;
    set((s) => ({ queue: [...s.queue, ...arr.map((achievement) => ({ key: `${achievement.id}-${++seq}`, achievement }))] }));
  },
  dismiss: (key) => set((s) => ({ queue: s.queue.filter((t) => t.key !== key) })),
  clear: () => set({ queue: [] }),
}));

/** Queue newly unlocked achievements (e.g. `pushAchievementToasts(outcome.achievements)`). */
export const pushAchievementToasts = (list: Achievement | Achievement[]): void => useToastStore.getState().push(list);

/** Toast queue hook: `{ queue, push, dismiss, clear }`. Mount one `<AchievementToast />` host to display it. */
export function useAchievementToasts() {
  const queue = useToastStore((s) => s.queue);
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);
  const clear = useToastStore((s) => s.clear);
  return { queue, push, dismiss, clear };
}

export interface AchievementToastProps {
  /** How many toasts are visible at once (default 3). */
  max?: number;
  /** ms each toast stays (default 4800). */
  duration?: number;
  /** Optional sound hook, called once when a toast appears. */
  onShow?: (a: Achievement) => void;
}

/** Toast host: slides unlocked achievements in from the top-right. Mount once (e.g. in the /plans layout). */
export function AchievementToast({ max = 3, duration = 4800, onShow }: AchievementToastProps) {
  const { queue, dismiss } = useAchievementToasts();
  const visible = queue.slice(0, max);
  const node = (
    <div
      className="pointer-events-none fixed right-3 top-[calc(0.75rem+var(--safe-top))] flex w-[min(340px,calc(100vw-24px))] flex-col gap-2 sm:right-5 sm:top-[calc(1.25rem+var(--safe-top))]"
      style={{ zIndex: 8500 }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {visible.map((t) => (
          <ToastCard key={t.key} item={t} duration={duration} onDismiss={dismiss} onShow={onShow} />
        ))}
      </AnimatePresence>
    </div>
  );
  return typeof document === 'undefined' ? node : createPortal(node, document.body);
}

function ToastCard({ item, duration, onDismiss, onShow }: { item: ToastItem; duration: number; onDismiss: (k: string) => void; onShow?: (a: Achievement) => void }) {
  const reduced = useReduced();
  const a = item.achievement;
  const m = METAL[a.tier];
  const Icon = ACHIEVEMENT_ICONS[a.icon];
  const shown = useRef(false);
  useEffect(() => {
    if (!shown.current) {
      shown.current = true;
      onShow?.(a);
    }
    const t = window.setTimeout(() => onDismiss(item.key), duration);
    return () => clearTimeout(t);
  }, [a, duration, item.key, onDismiss, onShow]);

  return (
    <motion.div
      layout={!reduced}
      role="status"
      className="pointer-events-auto relative flex items-center gap-3 overflow-hidden py-2.5 pl-2.5 pr-8"
      style={{
        background: `linear-gradient(100deg, color-mix(in srgb, ${m.base} 16%, ${FP.panel}), ${FP.panel} 60%)`,
        borderRadius: 10,
        boxShadow: `inset 0 0 0 1px ${m.base}55, 0 16px 40px -18px rgba(0,0,0,0.9), 0 0 24px -12px ${m.base}`,
        color: FP.ink,
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 80, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 60, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <Medallion tier={a.tier} size={42}>
        <Icon size={19} strokeWidth={2.2} color={m.dark} />
      </Medallion>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: FP.mono, color: m.base }}>
          Achievement · {m.label}
        </p>
        <p className="truncate text-[15px] font-bold leading-tight" style={{ fontFamily: FP.display }}>
          {a.title}
        </p>
        <p className="truncate text-xs" style={{ color: FP.muted }}>
          {a.description}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(item.key)}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded opacity-60 transition hover:opacity-100"
        style={{ color: FP.muted }}
      >
        <X size={14} />
      </button>
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ background: m.base, boxShadow: `0 0 6px ${m.base}` }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

/** Round metal medallion (achievement badge face). */
export function Medallion({ tier, size = 48, locked, children }: { tier: keyof typeof METAL; size?: number; locked?: boolean; children?: ReactNode }) {
  const m = METAL[tier];
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: locked
          ? 'radial-gradient(circle at 35% 30%, #3A332C, #1C1814 70%)'
          : `radial-gradient(circle at 32% 28%, ${m.light}, ${m.base} 48%, ${m.dark} 100%)`,
        boxShadow: locked
          ? 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 4px rgba(0,0,0,0.6)'
          : `inset 0 0 0 ${Math.max(2, size / 16)}px ${m.dark}66, inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 8px -2px rgba(0,0,0,0.8)`,
      }}
    >
      {!locked && (
        <span aria-hidden className="absolute rounded-full" style={{ inset: size * 0.12, border: `1px dashed ${m.dark}88` }} />
      )}
      <span className="relative grid place-items-center">{children}</span>
    </span>
  );
}

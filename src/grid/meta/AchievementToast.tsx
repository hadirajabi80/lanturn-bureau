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
      className="pointer-events-auto relative flex items-center gap-3 overflow-hidden py-3 pl-3 pr-9"
      style={{
        background: FP.panel,
        borderRadius: 8,
        boxShadow: `inset 0 0 0 2px ${FP.ink}, 3px 3px 0 ${FP.ink}`,
        color: FP.ink,
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 40, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
    >
      <Medallion tier={a.tier} size={42}>
        <Icon size={19} strokeWidth={2.2} color={FP.ink} />
      </Medallion>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: FP.muted }}>
          Achievement unlocked
          <TierSwatch tier={a.tier} />
          {m.label}
        </p>
        <p className="truncate text-base font-extrabold leading-tight" style={{ fontFamily: FP.display }}>
          {a.title}
        </p>
        <p className="truncate text-[13px]" style={{ color: FP.muted }}>
          {a.description}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(item.key)}
        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-[#F1F1EC]"
        style={{ color: FP.ink }}
      >
        <X size={15} />
      </button>
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute bottom-[2px] left-[2px] h-[3px]"
          style={{ background: FP.ink }}
          initial={{ width: 'calc(100% - 4px)' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

/** Small square swatch in the tier's spot colour. */
export function TierSwatch({ tier, size = 9 }: { tier: keyof typeof METAL; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{ width: size, height: size, borderRadius: 2, background: METAL[tier].base, boxShadow: `inset 0 0 0 1px ${FP.ink}` }}
    />
  );
}

/**
 * Round badge face, printed like a rubber stamp: earned = yellow disc with an ink double ring,
 * locked = white disc with a dashed grey outline.
 */
export function Medallion({ tier, size = 48, locked, children }: { tier: keyof typeof METAL; size?: number; locked?: boolean; children?: ReactNode }) {
  void tier;
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: locked ? '#FFFFFF' : FP.hl,
        boxShadow: locked ? undefined : `inset 0 0 0 2px ${FP.ink}`,
        border: locked ? `1.5px dashed #9A9A94` : undefined,
      }}
    >
      {!locked && <span aria-hidden className="absolute rounded-full" style={{ inset: Math.max(3, size * 0.1), border: `1px solid ${FP.ink}` }} />}
      <span className="relative grid place-items-center">{children}</span>
    </span>
  );
}

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';
import clsx from 'clsx';
import { AlertTriangle, Check, Info, Search, X } from 'lucide-react';

export type ToastKind = 'info' | 'success' | 'evidence' | 'error' | 'warn';

export interface ToastItem {
  id: number;
  message: ReactNode;
  kind: ToastKind;
  title?: string;
  duration: number;
}

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => number;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = nextId++;
    set((s) => ({ items: [...s.items.slice(-3), { ...t, id }] }));
    window.setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), t.duration);
    return id;
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

const DURATION: Record<ToastKind, number> = { info: 4200, success: 3200, evidence: 3600, error: 3400, warn: 3600 };

/** Fire a toast from anywhere (no hook needed). */
export function toast(message: ReactNode, kind: ToastKind = 'info', opts: { title?: string; duration?: number } = {}): number {
  return useToasts.getState().push({ message, kind, title: opts.title, duration: opts.duration ?? DURATION[kind] });
}

/** Per kind: an icon on a small square swatch (the only colour in the toast). */
const STYLE: Record<ToastKind, { icon: ReactNode; swatch: string }> = {
  info: { icon: <Info className="size-4" strokeWidth={2.2} />, swatch: 'bg-print-card text-print-ink' },
  success: { icon: <Check className="size-4" strokeWidth={3} />, swatch: 'bg-print-green text-white' },
  evidence: { icon: <Search className="size-4" strokeWidth={2.4} />, swatch: 'bg-print-yellow text-print-ink' },
  error: { icon: <X className="size-4" strokeWidth={3} />, swatch: 'bg-print-red text-white' },
  warn: { icon: <AlertTriangle className="size-4" strokeWidth={2.2} />, swatch: 'bg-print-yellow text-print-ink' },
};

/** Mount once near the app root. White card, 2px ink border, hard shadow; tap to dismiss. */
export function Toaster() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[95] flex flex-col items-center gap-2 px-4 sm:bottom-auto sm:left-auto sm:right-5 sm:top-20 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.button
            type="button"
            key={t.id}
            layout
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 32, transition: { duration: 0.14 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-print-card px-3 py-2.5 text-left text-sm text-print-ink shadow-[inset_0_0_0_2px_#141414,3px_3px_0_#141414]"
          >
            <span className={clsx('mt-px grid size-6 shrink-0 place-items-center rounded shadow-[inset_0_0_0_1.5px_#141414]', STYLE[t.kind].swatch)}>
              {STYLE[t.kind].icon}
            </span>
            <span className="min-w-0">
              {t.title && <span className="block font-display font-extrabold leading-tight">{t.title}</span>}
              <span className={clsx('block leading-snug', t.title ? 'text-print-muted' : 'text-print-ink')}>{t.message}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

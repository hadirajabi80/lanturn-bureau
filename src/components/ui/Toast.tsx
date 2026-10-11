import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, Sparkles, XCircle } from 'lucide-react';

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

const STYLE: Record<ToastKind, { icon: ReactNode; ring: string }> = {
  info: { icon: <Info className="size-4 text-paper/70" />, ring: 'border-white/10' },
  success: { icon: <CheckCircle2 className="size-4 text-teal" />, ring: 'border-teal/40' },
  evidence: { icon: <Sparkles className="size-4 text-lantern" />, ring: 'border-lantern/50' },
  error: { icon: <XCircle className="size-4 text-[#ff7b82]" />, ring: 'border-crimson/50' },
  warn: { icon: <AlertTriangle className="size-4 text-brass" />, ring: 'border-brass/40' },
};

/** Mount once near the app root. */
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
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={clsx(
              'glass pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm text-paper',
              STYLE[t.kind].ring,
              t.kind === 'evidence' && 'shadow-[0_0_30px_-8px_rgb(255_179_71/0.6)]',
            )}
          >
            <span className="mt-0.5 shrink-0">{STYLE[t.kind].icon}</span>
            <span className="min-w-0">
              {t.title && <span className="block font-semibold text-lantern">{t.title}</span>}
              <span className="block leading-snug text-paper/90">{t.message}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  /** Omit to make the sheet non-dismissable (no ×, Esc and backdrop do nothing). */
  onClose?: () => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Open sheet ids; Esc only closes the top-most one. */
const stack: string[] = [];

/** Whether any Crime Files sheet is currently open (keyboard shortcuts stand down). */
export const anySheetOpen = () => stack.length > 0;

/** Light slide-up sheet (bottom on mobile, centred card from sm up). */
export function Sheet(props: SheetProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>{props.open && <SheetInner key="sheet" {...props} />}</AnimatePresence>, document.body);
}

function SheetInner({ onClose, title, eyebrow, children, className }: SheetProps) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    stack.push(id);
    const prevFocus = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const el = panel.current;
      const auto = el?.querySelector<HTMLElement>('[data-autofocus]');
      (auto ?? el)?.focus({ preventScroll: true });
    }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || stack[stack.length - 1] !== id || !closeRef.current) return;
      e.stopPropagation();
      closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6" style={{ colorScheme: 'light' }}>
      <motion.div
        className="absolute inset-0 bg-[#2b2724]/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose?.()}
        aria-hidden
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-t` : undefined}
        tabIndex={-1}
        className={clsx(
          'relative flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] bg-[#fbf8f3] text-[#2b2724] outline-none sm:rounded-[24px]',
          'shadow-[0_-10px_40px_-12px_rgb(0_0_0/0.35)]',
          className,
        )}
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.4, transition: { duration: 0.22, ease: 'easeIn' } }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-[#d9d0c3] sm:hidden" aria-hidden />
        {(title || eyebrow || onClose) && (
          <header className="flex items-start justify-between gap-3 px-5 pb-1 pt-4">
            <div className="min-w-0">
              {eyebrow && (
                <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8632b]">{eyebrow}</div>
              )}
              {title && (
                <h2 id={`${id}-t`} className="font-display text-2xl font-black leading-tight text-[#2b2724]">
                  {title}
                </h2>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#5b524a] shadow-sm ring-1 ring-black/5 hover:text-[#2b2724]"
              >
                <X className="size-4.5" />
              </button>
            )}
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">{children}</div>
      </motion.div>
    </div>
  );
}

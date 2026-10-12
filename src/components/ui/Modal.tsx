import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useReducedFx } from './useReducedFx';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Legacy v2 tone; both render as the printed white card. */
  tone?: 'glass' | 'paper';
  /** If false, Esc / backdrop clicks do nothing (e.g. while an animation must finish). */
  dismissable?: boolean;
  className?: string;
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const;

/** Stack of open modal ids so Esc only closes the top-most one. */
const stack: string[] = [];

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal(props: ModalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>{props.open && <ModalInner key="modal" {...props} />}</AnimatePresence>,
    document.body,
  );
}

function ModalInner({
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = 'md',
  tone = 'glass',
  dismissable = true,
  className,
}: ModalProps) {
  const id = useId();
  const reduced = useReducedFx();
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissRef = useRef(dismissable);
  dismissRef.current = dismissable;

  useEffect(() => {
    stack.push(id);
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = window.setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      const auto = el.querySelector<HTMLElement>('[data-autofocus]');
      const first = auto ?? el.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? el).focus({ preventScroll: true });
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        if (dismissRef.current) {
          e.stopPropagation();
          onCloseRef.current();
        }
        return;
      }
      if (e.key === 'Tab' && panel.current) {
        const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null,
        );
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!panel.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (stack.length === 0) document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <motion.div
        className="absolute inset-0 bg-[rgb(20_20_20/0.45)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => dismissable && onClose()}
        aria-hidden
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        tabIndex={-1}
        data-tone={tone}
        className={clsx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-print-card text-print-ink outline-none',
          'rounded-t-lg shadow-[inset_0_0_0_2px_#141414] sm:rounded-lg sm:shadow-[inset_0_0_0_2px_#141414,5px_5px_0_#141414]',
          SIZES[size],
          className,
        )}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, transition: { duration: 0.12 } }}
        transition={{ type: 'spring', stiffness: 520, damping: 38 }}
      >
        {(title || eyebrow || dismissable) && (
          <header className="mx-5 flex items-start justify-between gap-4 border-b-2 border-print-ink pb-3 pt-5 sm:mx-6">
            <div className="min-w-0">
              {eyebrow && <div className="mb-0.5 text-[13px] font-semibold text-print-muted">{eyebrow}</div>}
              {title && (
                <h2 id={`${id}-title`} className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
                  {title}
                </h2>
              )}
            </div>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 grid size-9 shrink-0 place-items-center rounded-md bg-print-card text-print-ink shadow-[inset_0_0_0_2px_#141414] transition-colors hover:bg-[#FFEFA6]"
              >
                <X className="size-5" />
              </button>
            )}
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6">{children}</div>
        {footer && (
          <footer className="mx-5 flex flex-wrap items-center justify-end gap-2 border-t border-print-rule py-4 sm:mx-6">{footer}</footer>
        )}
      </motion.div>
    </div>
  );
}

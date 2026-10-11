/** Ask Otto: the chief's explained deduction, typed out, with an Apply button. */
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { Typewriter } from '@/components/fx';
import { BUREAU } from '@/data/bureau';
import type { Deduction } from '@/grid/store';
import { BrassBtn, GhostBtn } from './parts';

export type OttoView = { kind: 'hint'; d: Deduction } | { kind: 'none' } | { kind: 'limit' } | null;

const OTTO = BUREAU.otto;

export function OttoPanel({
  view,
  onApply,
  onDismiss,
  className,
}: {
  view: OttoView;
  onApply: () => void;
  onDismiss: () => void;
  className?: string;
}) {
  const text =
    view?.kind === 'hint'
      ? view.d.text
      : view?.kind === 'limit'
        ? 'Hm. You have had your two questions, Rookie. The rest is yours.'
        : 'Hm. Nothing new to say from here. Check your pins against every sentence — then pull the lever.';
  const applyLabel =
    view?.kind === 'hint' ? (view.d.kind === 'place' ? 'Pin it' : view.d.kind === 'mistake' ? 'Unpin' : 'Cross it out') : '';
  return (
    <AnimatePresence>
      {view && (
        <motion.div
          role="dialog"
          aria-label="Otto's deduction"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          className={clsx(
            'flex gap-3 rounded-[10px] p-3 pr-9 shadow-[0_20px_40px_-18px_var(--dk-shadow,var(--dk-shadow,rgb(0_0_0/0.9)))]',
            className,
          )}
          style={{ background: 'color-mix(in srgb, var(--fp-panel) 94%, #000)', boxShadow: 'inset 0 0 0 1px var(--fp-hair), 0 20px 40px -18px var(--dk-shadow, var(--dk-shadow, rgb(0 0 0 / 0.9)))' }}
        >
          <div className="shrink-0 overflow-hidden rounded-full bg-[var(--dk-shade,#2a241e)] ring-2 ring-[var(--fp-accent)]/60">
            {OTTO && <Avatar spec={OTTO.avatar} size={56} speaking mood="thinking" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--dk-accent-text,var(--fp-accent2))]">Otto</div>
            <p className="mt-0.5 min-h-[2.6em] font-mono text-[13px] leading-snug text-[var(--fp-ink)]">
              <Typewriter text={text} speed={14} />
            </p>
            <div className="mt-2 flex gap-2">
              {view.kind === 'hint' && (
                <BrassBtn size="sm" onClick={onApply} data-autofocus>
                  {applyLabel}
                </BrassBtn>
              )}
              <GhostBtn size="sm" onClick={onDismiss}>
                {view.kind === 'hint' ? 'I will do it myself' : 'Thanks'}
              </GhostBtn>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close Otto"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.08))] hover:text-[var(--fp-ink)] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

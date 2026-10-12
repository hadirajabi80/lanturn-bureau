/** Ask Otto: the chief's explained deduction, typed out, with an Apply button. A white note card. */
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
        : 'Hm. Nothing new to say from here. Check your pins against every sentence. Then close the case.';
  const applyLabel =
    view?.kind === 'hint' ? (view.d.kind === 'place' ? 'Pin it' : view.d.kind === 'mistake' ? 'Unpin' : 'Cross it out') : '';
  return (
    <AnimatePresence>
      {view && (
        <motion.div
          role="dialog"
          aria-label="Otto's deduction"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
          className={clsx('flex gap-3 rounded-[8px] bg-[var(--fp-panel)] p-3 pr-10 shadow-[inset_0_0_0_2px_var(--fp-ink),5px_5px_0_var(--fp-ink)]', className)}
        >
          <div className="shrink-0 self-start overflow-hidden rounded-[6px] border-2 border-[var(--fp-ink)] bg-[#E6E6DF]">
            {OTTO && <Avatar spec={OTTO.avatar} size={56} speaking mood="thinking" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-[var(--fp-ink)]">Otto</span>
              <span className="text-[12px] font-semibold text-[var(--fp-muted)]">Chief inspector</span>
            </div>
            <p className="mt-0.5 min-h-[2.9em] text-[15px] leading-snug text-[var(--fp-ink)]">
              <Typewriter text={text} speed={14} />
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {view.kind === 'hint' && (
                <BrassBtn size="sm" onClick={onApply} data-autofocus className="!text-[13px]">
                  {applyLabel}
                </BrassBtn>
              )}
              <GhostBtn size="sm" onClick={onDismiss} className="!text-[13px]">
                {view.kind === 'hint' ? 'I will do it myself' : 'Thanks'}
              </GhostBtn>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close Otto"
            className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-[4px] text-[var(--fp-ink)] hover:bg-[var(--dk-hover)]"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

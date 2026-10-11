/** Shared bits for the mode screens: run-end card, district/tier pickers, run puzzles. */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { RankUpCelebration, XpCountUp } from '@/grid/meta';
import { DISTRICTS, TIER_INFO } from '@/grid/skins/districts';
import { TIERS, type Tier } from '@/grid/types';
import { Chip } from '@/grid/ui';
import type { RecordOutcome } from '@/grid/store';
import { play, pushAchievementToasts } from '../desk/bridge';

/** Award feedback for a finished run (achievement toasts + optional rank-up). */
export function useRunOutcome(outcome: RecordOutcome | null): ReactNode {
  const [rankUp, setRankUp] = useState(false);
  useEffect(() => {
    if (!outcome) return;
    if (outcome.achievements.length) pushAchievementToasts(outcome.achievements);
    if (outcome.rankUp) setRankUp(true);
  }, [outcome]);
  if (!outcome || !rankUp) return null;
  return <RankUpCelebration from={outcome.rankBefore} to={outcome.rankAfter} onStamp={() => play('stamp')} onDone={() => setRankUp(false)} />;
}

export function RunCard({
  kicker,
  title,
  big,
  bigLabel,
  lines,
  outcome,
  children,
}: {
  kicker: string;
  title: string;
  big: ReactNode;
  bigLabel: string;
  lines?: ReactNode;
  outcome: RecordOutcome | null;
  children: ReactNode;
}) {
  const celebration = useRunOutcome(outcome);
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="fp-panel fp-panel--glow mx-auto w-full max-w-md p-6 text-center"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--dk-accent-text,var(--fp-accent2))]">{kicker}</div>
      <h2 className="mt-1 font-display text-3xl font-black">{title}</h2>
      <div className="mt-5 font-mono text-6xl font-bold tabular-nums text-[var(--dk-accent-text,var(--fp-accent2))]">{big}</div>
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--fp-muted)]">{bigLabel}</div>
      {lines && <div className="mt-4 text-sm text-[var(--fp-muted)]">{lines}</div>}
      {!!outcome?.breakdown.length && (
        <div className="mt-5 rounded-[8px] bg-[var(--dk-shade,rgb(0_0_0/0.25))] p-3 text-left">
          <XpCountUp breakdown={outcome.breakdown} />
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
      {celebration}
    </motion.section>
  );
}

export function DistrictPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="District" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {DISTRICTS.map((d) => {
        const on = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(d.id)}
            className={clsx(
              'relative min-w-0 overflow-hidden rounded-[10px] p-3 text-left transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5',
              on ? 'shadow-[0_0_0_2px_var(--fp-accent2)]' : 'shadow-[inset_0_0_0_1px_var(--fp-hair)]',
            )}
            style={{ background: `linear-gradient(160deg, ${d.palette.panel}, ${d.palette.bg})`, color: d.palette.ink }}
          >
            <span className="flex gap-1" aria-hidden>
              {[d.palette.accent, d.palette.accent2, d.palette.sheet, d.palette.glow].map((c, i) => (
                <span key={i} className="size-3 rounded-full ring-1 ring-black/40" style={{ background: c }} />
              ))}
            </span>
            <span className="mt-2 block font-display text-sm font-bold leading-tight">{d.name}</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: d.palette.muted }}>
              {d.kicker.split('·')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TierPicker({ value, onChange, tiers = TIERS }: { value: Tier; onChange: (t: Tier) => void; tiers?: Tier[] }) {
  return (
    <div role="radiogroup" aria-label="Tier" className="flex flex-wrap gap-2">
      {tiers.map((t) => (
        <Chip key={t} active={t === value} onClick={() => onChange(t)} role="radio" aria-checked={t === value}>
          {TIER_INFO[t].name}
        </Chip>
      ))}
    </div>
  );
}

export function Section({ title, children, hint }: { title: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--fp-muted)]">{title}</h2>
        {hint && <span className="text-[11px] text-[var(--fp-muted)]">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

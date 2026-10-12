/** Shared bits for the mode screens: run-end card, intro sheet, district/tier pickers, numbered sections. */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { RankUpCelebration, XpCountUp } from '@/grid/meta';
import { DISTRICTS, TIER_INFO } from '@/grid/skins/districts';
import { TIERS, type Tier } from '@/grid/types';
import type { RecordOutcome } from '@/grid/store';
import { play, pushAchievementToasts } from '../desk/bridge';
import './modes.css';

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

/** Result slip at the end of a run: what happened, the big number, the XP receipt, what next. */
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
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 36 }}
      className="fp-panel fp-panel--glow mx-auto w-full max-w-md p-5 sm:p-6"
    >
      <p className="text-[13px] font-semibold text-(--fp-muted)">{kicker}</p>
      <h2 className="mt-0.5 font-display text-[1.9rem] font-black leading-[1.05] tracking-[-0.02em]">{title}</h2>
      <div className="mt-4 flex items-baseline gap-3 border-t-2 border-(--fp-ink) pt-3">
        <span className="font-mono text-6xl font-semibold leading-none tabular-nums text-(--fp-ink)">{big}</span>
        <span className="text-[15px] font-semibold text-(--fp-muted)">{bigLabel}</span>
      </div>
      {lines && <p className="mt-2 text-sm text-(--fp-muted)">{lines}</p>}
      {!!outcome?.breakdown.length && (
        <div className="mt-5 rounded-md bg-(--fp-bg) p-3 shadow-[inset_0_0_0_1px_var(--fp-hair)]">
          <XpCountUp breakdown={outcome.breakdown} />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">{children}</div>
      {celebration}
    </motion.section>
  );
}

/** Mode intro sheet: label, headline, an optional big printed figure, numbered rules and a footer row. */
export function IntroSheet({
  label,
  title,
  figure,
  figureLabel,
  rules,
  extra,
  footer,
}: {
  label: string;
  title: string;
  figure?: ReactNode;
  figureLabel?: string;
  rules: ReactNode[];
  extra?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="fp-panel min-w-0 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b-2 border-(--fp-ink) pb-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-(--fp-muted)">{label}</p>
          <h2 className="mt-1 font-display text-[clamp(1.6rem,1.2rem+1.5vw,2.2rem)] font-black leading-[1.05] tracking-[-0.02em]">{title}</h2>
        </div>
        {figure != null && (
          <div className="shrink-0 rounded-md px-3 py-1.5 text-center shadow-[inset_0_0_0_2px_var(--fp-ink)]" aria-label={figureLabel}>
            <span className="block font-mono text-3xl font-semibold leading-tight tabular-nums sm:text-4xl">{figure}</span>
          </div>
        )}
      </div>
      <ol className="text-[15px] leading-relaxed">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-3 border-b border-(--fp-hair) py-3 last:border-b-0">
            <span className="w-5 shrink-0 pt-px font-mono text-sm font-semibold text-(--fp-accent)">{i + 1}</span>
            <span className="min-w-0">{r}</span>
          </li>
        ))}
      </ol>
      {extra}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t-2 border-(--fp-ink) pt-4">{footer}</div>
    </section>
  );
}

/** District radio tiles: white index cards with the district's colour as a stripe; selected = highlighter. */
export function DistrictPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="District" className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
      {DISTRICTS.map((d) => {
        const on = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(d.id)}
            className={[
              'relative flex min-h-[3.75rem] min-w-0 items-stretch overflow-hidden rounded-md text-left transition-[background-color,transform] duration-100 active:translate-y-px',
              on
                ? 'bg-(--fp-hl) shadow-[inset_0_0_0_2px_var(--fp-ink)]'
                : 'bg-(--fp-panel) shadow-[inset_0_0_0_1.5px_var(--fp-ink)] hover:bg-[color-mix(in_srgb,var(--fp-hl)_40%,white)]',
            ].join(' ')}
          >
            <span aria-hidden className="my-[2px] ml-[2px] w-2 shrink-0 rounded-l-[4px] border-r-[1.5px] border-(--fp-ink)" style={{ background: d.palette.accent }} />
            <span className="flex min-w-0 flex-1 flex-col justify-center py-2 pl-2.5 pr-6">
              <span className="line-clamp-2 font-display text-sm font-extrabold leading-tight">{d.name}</span>
              <span className="truncate text-xs text-(--fp-muted)">{d.kicker.split('·')[0]}</span>
            </span>
            {on && <Check aria-hidden className="absolute right-2 top-2 size-4" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

/** Tier segmented control. */
export function TierPicker({ value, onChange, tiers = TIERS }: { value: Tier; onChange: (t: Tier) => void; tiers?: Tier[] }) {
  return (
    <div role="radiogroup" aria-label="Tier" className="fpm-seg">
      {tiers.map((t) => (
        <button key={t} type="button" role="radio" aria-checked={t === value} onClick={() => onChange(t)}>
          {TIER_INFO[t].name}
        </button>
      ))}
    </div>
  );
}

/** Numbered form section: red index number, title, optional hint on the right. */
export function Section({ title, children, hint, n }: { title: string; children: ReactNode; hint?: ReactNode; n?: number }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b-2 border-(--fp-ink) pb-1.5">
        <h2 className="flex items-baseline gap-2 font-display text-lg font-extrabold leading-tight">
          {n != null && <span className="font-mono text-sm font-semibold text-(--fp-accent)">{String(n).padStart(2, '0')}</span>}
          {title}
        </h2>
        {hint && <span className="text-[13px] text-(--fp-muted)">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

/** Two-column mode page on wide screens: the intro sheet on the left, a fact panel on the right. */
export function ModeLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-5 py-2 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
      {children}
      {aside && <aside className="min-w-0">{aside}</aside>}
    </div>
  );
}

/** Small printed table: a title over an ink rule, then label / value rows separated by hairlines. */
export function FactTable({ title, rows, children }: { title: string; rows?: [ReactNode, ReactNode][]; children?: ReactNode }) {
  return (
    <section className="fp-panel p-5">
      <h2 className="border-b-2 border-(--fp-ink) pb-1.5 font-display text-lg font-extrabold leading-tight">{title}</h2>
      {rows && (
        <dl className="text-sm">
          {rows.map(([k, v], i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 border-b border-(--fp-hair) py-2 last:border-b-0">
              <dt className="text-(--fp-muted)">{k}</dt>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

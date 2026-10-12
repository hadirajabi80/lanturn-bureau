import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Lock, Star } from 'lucide-react';
import { Avatar } from '../../components/avatar';
import { useReduced } from '../../components/fx';
import { BUREAU } from '../../data/bureau';
import { DISTRICT_BY_ID } from '../skins/districts';
import { PageShell } from '../ui/PageShell';
import { SkinProvider } from '../ui/skin';
import { ACHIEVEMENTS, ACHIEVEMENT_TIERS, achievementProgress } from './achievements';
import { Medallion, TierSwatch } from './AchievementToast';
import { dayNumber, localISODate } from './dates';
import { ACHIEVEMENT_ICONS, VARIANT_ICONS } from './icons';
import { computeStats, liveStreak, type ProfileStats } from './logic';
import { RankInsignia } from './RankInsignia';
import { useProfileStore } from './store';
import { FP, METAL, fmtInt, fmtTime, panelStyle } from './theme';
import type { AchievementTier, ProfileData } from './types';
import { GAUNTLET_STAGES, TIER_LABEL, VARIANT_LABEL, rankProgress } from './xp';
import { XpFilament } from './XpFilament';

export interface ProfileScreenProps {
  /** Back-link target (default `/plans`). */
  backTo?: string;
}

/** `/plans/profile`: the detective's personnel file. Record card, streak, stats, achievements, case log. */
export function ProfileScreen({ backTo = '/plans' }: ProfileScreenProps) {
  const state = useProfileStore();
  const now = Date.now();
  const stats = useMemo(() => computeStats(state, now), [state]);

  return (
    <SkinProvider>
      <PageShell title="Detective profile" kicker="Personnel file" back={backTo} backLabel="Back to the Bureau">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          <Section i={0} className="lg:col-span-7">
            <IdCard state={state} />
          </Section>
          <Section i={1} className="lg:col-span-5">
            <StreakCard state={state} stats={stats} now={now} />
          </Section>
          <Section i={2} className="lg:col-span-12" n={1} title="Record" kicker="Totals since your first day">
            <SummaryTable state={state} stats={stats} />
          </Section>
          <Section i={3} className="lg:col-span-5" n={2} title="Floors" kicker="Solves by tier">
            <BarRows rows={stats.byTier.map((t) => ({ key: t.tier, label: TIER_LABEL[t.tier], value: t.count }))} />
          </Section>
          <Section i={4} className="lg:col-span-7 lg:row-span-2" n={3} title="Districts" kicker="Solves by building">
            <BarRows
              rows={stats.byDistrict.map((d) => ({
                key: d.id,
                label: d.name,
                value: d.count,
                swatch: d.color,
                note: `${d.unique}/${d.total}`,
              }))}
              labelWidth="11rem"
            />
          </Section>
          <Section i={5} className="lg:col-span-5" n={4} title="Scenarios" kicker="Solves by variant">
            <VariantGrid stats={stats} />
          </Section>
          <Section i={6} className="lg:col-span-12" n={5} title="Last 30 days" kicker="Cases closed per day">
            <ActivityChart data={stats.activity30} />
          </Section>
          <Section i={7} className="lg:col-span-6" n={6} title="Times" kicker="Best and average by plan size">
            <TimesTable stats={stats} />
          </Section>
          <Section i={8} className="lg:col-span-6" n={7} title="Recent cases" kicker="Case log">
            <RecentList stats={stats} now={now} />
          </Section>
          <Section
            i={9}
            className="lg:col-span-12"
            n={8}
            title="Commendations"
            kicker={`${stats.achievementsUnlocked} of ${stats.achievementsTotal} awarded`}
          >
            <AchievementWall state={state} />
          </Section>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

// ─────────────────────────── layout bits ───────────────────────────
function Section({
  i,
  n,
  className,
  title,
  kicker,
  children,
}: {
  i: number;
  n?: number;
  className?: string;
  title?: string;
  kicker?: string;
  children: ReactNode;
}) {
  const reduced = useReduced();
  return (
    <motion.section
      className={['min-w-0', className].filter(Boolean).join(' ')}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.025 * i, type: 'spring', stiffness: 520, damping: 38 }}
    >
      {title ? (
        <div className="h-full p-4 sm:p-5" style={panelStyle}>
          <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-2" style={{ borderBottom: `2px solid ${FP.ink}` }}>
            <h2 className="flex items-baseline gap-2 text-lg font-extrabold leading-tight" style={{ fontFamily: FP.display }}>
              {n != null && (
                <span className="text-sm font-semibold tabular-nums" style={{ fontFamily: FP.mono, color: FP.accent }}>
                  {String(n).padStart(2, '0')}
                </span>
              )}
              {title}
            </h2>
            {kicker && (
              <p className="text-[13px] font-medium" style={{ color: FP.muted }}>
                {kicker}
              </p>
            )}
          </header>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.section>
  );
}

const rule = (last?: boolean): CSSProperties => (last ? {} : { borderBottom: `1px solid ${FP.hair}` });
/** Grid cell rules: a hairline on the left and top of every cell (the outer ones are clipped by the grid). */
const cellRules: CSSProperties = { background: FP.panel, boxShadow: `-1px 0 0 ${FP.hair}, 0 -1px 0 ${FP.hair}` };

// ─────────────────────────── ID card ───────────────────────────
function IdCard({ state }: { state: ProfileData }) {
  const rp = rankProgress(state.xp);
  const me = BUREAU.you;
  const since = new Date(state.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const badgeNo = `LB-${String(4000 + (Math.abs(Math.floor(state.createdAt / 1000)) % 5999)).padStart(4, '0')}`;
  return (
    <div className="h-full p-4 sm:p-5" style={{ ...panelStyle, boxShadow: `inset 0 0 0 2px ${FP.ink}, 5px 5px 0 ${FP.ink}` }}>
      <div className="mb-4 flex items-baseline justify-between gap-3 pb-2" style={{ borderBottom: `2px solid ${FP.ink}` }}>
        <p className="text-[13px] font-semibold" style={{ color: FP.muted }}>
          Lantern Bureau, Greywick
        </p>
        <p className="text-[13px] font-semibold" style={{ color: FP.muted }}>
          Personnel record
        </p>
      </div>
      <div className="flex items-start gap-4">
        <div className="shrink-0 overflow-hidden" style={{ borderRadius: 4, background: FP.bg, boxShadow: `inset 0 0 0 2px ${FP.ink}` }}>
          <Avatar spec={me.avatar} size={92} title="Rookie" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[clamp(1.6rem,1.2rem+1.6vw,2.25rem)] font-black leading-none" style={{ fontFamily: FP.display, letterSpacing: '-0.03em' }}>
            {me.name}
          </h2>
          <p className="mt-2">
            <span className="fp-plate">{rp.rank.name}</span>
          </p>
          <IdFacts badgeNo={badgeNo} since={since} className="mt-3 hidden sm:grid" />
        </div>
        <div className="hidden shrink-0 sm:block">
          <RankInsignia rank={rp.rank} size={84} title={rp.rank.name} />
        </div>
        <div className="shrink-0 sm:hidden">
          <RankInsignia rank={rp.rank} size={52} title={rp.rank.name} />
        </div>
      </div>
      <IdFacts badgeNo={badgeNo} since={since} className="mt-3 grid sm:hidden" />
      <div className="mt-5">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
          <span className="font-semibold">
            <span className="text-base tabular-nums" style={{ fontFamily: FP.mono }}>
              {fmtInt(state.xp)}
            </span>{' '}
            XP
          </span>
          <span style={{ color: FP.muted }}>
            {rp.next ? (
              <>
                <span className="tabular-nums" style={{ fontFamily: FP.mono, color: FP.ink }}>
                  {fmtInt(rp.xpForNext - rp.xpInRank)}
                </span>{' '}
                to {rp.next.name}
              </>
            ) : (
              'Highest rank'
            )}
          </span>
        </div>
        <XpFilament pct={rp.pct} animateFrom={0} height={10} />
      </div>
    </div>
  );
}

// ─────────────────────────── streak ───────────────────────────
const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function StreakCard({ state, stats, now }: { state: ProfileData; stats: ProfileStats; now: number }) {
  const streak = liveStreak(state.streak, localISODate(now));
  const lit = streak > 0;
  return (
    <div className="h-full p-4 sm:p-5" style={panelStyle}>
      <div className="mb-3 flex items-baseline justify-between gap-3 pb-2" style={{ borderBottom: `2px solid ${FP.ink}` }}>
        <h2 className="text-lg font-extrabold" style={{ fontFamily: FP.display }}>
          Daily streak
        </h2>
        <p className="text-[13px]" style={{ color: FP.muted }}>
          Best{' '}
          <span className="tabular-nums" style={{ color: FP.ink, fontFamily: FP.mono }}>
            {state.streak.best}
          </span>{' '}
          · Today{' '}
          <span className="tabular-nums" style={{ color: FP.ink, fontFamily: FP.mono }}>
            {stats.calendar14[13]?.count ?? 0}
          </span>{' '}
          closed
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Flame size={30} strokeWidth={2} color={lit ? FP.accent : FP.grey} fill={lit ? FP.hl : 'none'} aria-hidden />
        <p className="text-5xl font-black leading-none tabular-nums" style={{ fontFamily: FP.display, letterSpacing: '-0.03em' }}>
          {streak}
          <span className="ml-2 text-base font-semibold" style={{ color: FP.muted, letterSpacing: 0 }}>
            {streak === 1 ? 'day' : 'days'}
          </span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1" role="list" aria-label="Last 14 days">
        {stats.calendar14.map((d) => {
          const dow = (((dayNumber(d.date) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
          const on = d.count > 0;
          return (
            <div
              key={d.date}
              role="listitem"
              title={`${d.date}: ${d.count} closed${d.daily ? ", today's case solved" : ''}`}
              className="relative flex h-12 flex-col items-center justify-center text-xs leading-tight sm:h-[3.25rem]"
              style={{
                borderRadius: 4,
                background: on ? FP.hl : FP.panel,
                boxShadow: d.today ? `inset 0 0 0 2px ${FP.ink}` : on ? `inset 0 0 0 1.5px ${FP.ink}` : `inset 0 0 0 1px ${FP.hair}`,
                color: on || d.today ? FP.ink : FP.muted,
              }}
            >
              <span className="text-[11px]" style={{ color: FP.muted }}>
                {WEEKDAY[dow]}
              </span>
              <span className="font-semibold tabular-nums" style={{ fontFamily: FP.mono }}>
                {Number(d.date.slice(8))}
              </span>
              {d.daily && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: FP.accent }} />}
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: FP.muted }}>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px]" style={{ background: FP.hl, boxShadow: `inset 0 0 0 1.5px ${FP.ink}` }} /> Case closed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: FP.accent }} /> Today’s case solved
        </span>
      </p>
    </div>
  );
}

// ─────────────────────────── summary ───────────────────────────
function SummaryTable({ state, stats }: { state: ProfileData; stats: ProfileStats }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Cases closed', value: fmtInt(stats.totalSolved) },
    { label: 'Files burned', value: fmtInt(stats.totalBurns) },
    { label: 'Accuracy', value: `${Math.round(stats.accuracy * 100)}%` },
    { label: 'Three-star rate', value: `${Math.round(stats.threeStarRate * 100)}%` },
    { label: 'Blitz best', value: fmtInt(state.blitzBest) },
    { label: 'Gauntlet best', value: `${state.gauntletBest}/${GAUNTLET_STAGES}` },
  ];
  return (
    <dl className="grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
      {rows.map((t) => (
        <div key={t.label} className="px-1 py-2.5 sm:px-3" style={cellRules}>
          <dt className="text-[13px] font-semibold" style={{ color: FP.muted }}>
            {t.label}
          </dt>
          <dd className="mt-0.5 text-[1.65rem] font-semibold leading-tight tabular-nums" style={{ fontFamily: FP.mono }}>
            {t.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─────────────────────────── bars ───────────────────────────
interface BarRow {
  key: string;
  label: string;
  value: number;
  /** identity swatch (district accent) shown before the label */
  swatch?: string;
  note?: string;
}

function BarRows({ rows, labelWidth = '8rem' }: { rows: BarRow[]; labelWidth?: string }) {
  const reduced = useReduced();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col">
      {rows.map((r, i) => (
        <li
          key={r.key}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-1.5 text-sm sm:grid-cols-[minmax(0,var(--lw))_1fr_auto]"
          style={{ ['--lw' as string]: labelWidth, ...rule(i === rows.length - 1) }}
        >
          <span className="flex min-w-0 items-center gap-2">
            {r.swatch && (
              <span aria-hidden className="h-3 w-3 shrink-0 rounded-[2px]" style={{ background: r.swatch, boxShadow: `inset 0 0 0 1px ${FP.ink}` }} />
            )}
            <span className="truncate" style={{ color: r.value ? FP.ink : FP.muted }}>
              {r.label}
            </span>
          </span>
          <span className="relative col-span-2 row-start-2 h-2.5 overflow-hidden rounded-[2px] sm:col-span-1 sm:row-start-auto" style={{ background: FP.bg }}>
            <motion.span
              className="absolute inset-y-0 left-0 rounded-[2px]"
              style={{ background: FP.ink }}
              initial={{ width: reduced ? `${(r.value / max) * 100}%` : 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ delay: 0.1 + i * 0.02, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="min-w-[3.5rem] text-right text-[13px] tabular-nums" style={{ fontFamily: FP.mono }}>
            {fmtInt(r.value)}
            {r.note && <span style={{ color: FP.muted }}> · {r.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────── variants ───────────────────────────
function VariantGrid({ stats }: { stats: ProfileStats }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden">
      {stats.byVariant.map((v) => {
        const Icon = VARIANT_ICONS[v.variant];
        const on = v.count > 0;
        return (
          <div
            key={v.variant}
            className="flex flex-col gap-1 px-2 py-2.5"
            title={`${VARIANT_LABEL[v.variant]}: ${v.count}`}
            style={{ ...cellRules, color: on ? FP.ink : FP.muted }}
          >
            <span className="flex items-center justify-between gap-1">
              <Icon size={16} color={on ? FP.ink : FP.grey} aria-hidden />
              <span className="text-lg font-semibold leading-none tabular-nums" style={{ fontFamily: FP.mono }}>
                {v.count}
              </span>
            </span>
            <span className="text-xs leading-tight">{VARIANT_LABEL[v.variant]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── activity chart ───────────────────────────
function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  const reduced = useReduced();
  const W = 300;
  const H = 92;
  const padX = 2;
  const top = 10;
  const base = H - 2;
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const active = data.filter((d) => d.count > 0).length;
  const slot = (W - padX * 2) / Math.max(1, data.length);
  const bw = Math.max(2, slot * 0.58);
  const y = (v: number) => base - (v / max) * (base - top);
  const peak = data.reduce((b, d, i) => (d.count > (data[b]?.count ?? 0) ? i : b), 0);
  const avg = total / Math.max(1, data.length);
  return (
    <div>
      <dl className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
        {[
          ['Closed', total],
          ['Active days', `${active}/30`],
          ['Busiest day', data[peak]?.count ?? 0],
        ].map(([k, v]) => (
          <div key={k as string} className="flex items-baseline gap-1.5">
            <dt className="font-semibold" style={{ color: FP.muted }}>
              {k}
            </dt>
            <dd className="text-base font-semibold tabular-nums" style={{ fontFamily: FP.mono }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[130px] w-full sm:h-[160px]" role="img" aria-label={`Cases closed per day over the last 30 days: ${total} in total`}>
        {[0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={base - f * (base - top)} y2={base - f * (base - top)} stroke="#D9D9D2" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {avg > 0 && <line x1={0} x2={W} y1={y(avg)} y2={y(avg)} stroke="#D7261E" strokeWidth={1.5} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
        {data.map((d, i) => {
          const x = padX + i * slot + (slot - bw) / 2;
          const last = i === data.length - 1;
          if (d.count === 0) return <rect key={d.date} x={x} y={base - 1.2} width={bw} height={1.2} fill="#C9C9C3" />;
          const h = base - y(d.count);
          return (
            <motion.rect
              key={d.date}
              x={x}
              width={bw}
              fill={last ? '#D7261E' : '#141414'}
              initial={reduced ? false : { y: base, height: 0 }}
              animate={{ y: base - h, height: h }}
              transition={{ delay: i * 0.008, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <title>{`${d.date}: ${d.count}`}</title>
            </motion.rect>
          );
        })}
        <line x1={0} x2={W} y1={base + 0.75} y2={base + 0.75} stroke="#141414" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs" style={{ color: FP.muted }}>
        <span className="tabular-nums" style={{ fontFamily: FP.mono }}>
          {data[0]?.date.slice(5)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4" style={{ borderTop: `1.5px dashed ${FP.accent}` }} /> Daily average
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}

// ─────────────────────────── times ───────────────────────────
function TimesTable({ stats }: { stats: ProfileStats }) {
  const head: CSSProperties = { borderBottom: `2px solid ${FP.ink}`, color: FP.muted };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[13px]">
            <th className="py-1.5 font-semibold" style={head}>
              Plan
            </th>
            <th className="py-1.5 text-right font-semibold" style={head}>
              Solved
            </th>
            <th className="py-1.5 text-right font-semibold" style={head}>
              Best
            </th>
            <th className="py-1.5 text-right font-semibold" style={head}>
              Average
            </th>
          </tr>
        </thead>
        <tbody style={{ fontFamily: FP.mono }}>
          {stats.bySize.map((r, i) => {
            const cell: CSSProperties = { ...rule(i === stats.bySize.length - 1), color: r.count ? FP.ink : '#9A9A94' };
            return (
              <tr key={r.size}>
                <td className="py-1.5" style={cell}>
                  {r.size}×{r.size}
                </td>
                <td className="py-1.5 text-right tabular-nums" style={cell}>
                  {r.count}
                </td>
                <td className="py-1.5 text-right font-semibold tabular-nums" style={cell}>
                  {fmtTime(r.bestMs)}
                </td>
                <td className="py-1.5 text-right tabular-nums" style={cell}>
                  {fmtTime(r.avgMs)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────── recent ───────────────────────────
function relDay(at: number, now: number): string {
  const d = dayNumber(localISODate(now)) - dayNumber(localISODate(at));
  if (d <= 0) return new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function RecentList({ stats, now }: { stats: ProfileStats; now: number }) {
  if (!stats.recent.length) {
    return (
      <p className="py-6 text-sm" style={{ color: FP.muted }}>
        No cases on file yet. Pick a building and open the first one.
      </p>
    );
  }
  return (
    <ul className="flex flex-col">
      {stats.recent.map((r, i) => {
        const d = DISTRICT_BY_ID[r.district];
        const VIcon = VARIANT_ICONS[r.variant];
        const burned = r.kind === 'burn';
        return (
          <li key={`${r.id}-${r.at}-${i}`} className="flex items-center gap-3 py-2" style={rule(i === stats.recent.length - 1)}>
            <span aria-hidden className="h-8 w-1.5 shrink-0 rounded-[2px]" style={{ background: d?.palette.accent ?? FP.grey }} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                <span className="truncate">{d?.name ?? r.district}</span>
                <VIcon size={13} color={FP.muted} aria-label={VARIANT_LABEL[r.variant]} />
              </p>
              <p className="truncate text-xs" style={{ color: FP.muted }}>
                {TIER_LABEL[r.tier]}
                {r.kind === 'solve' ? (
                  <>
                    {' · '}
                    <span style={{ fontFamily: FP.mono }}>
                      {r.size}×{r.size} · {fmtTime(r.timeMs)}
                    </span>
                  </>
                ) : null}{' '}
                · {r.mode}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              {r.mode === 'zen' && !burned ? (
                <span className="px-1.5 py-0.5 text-xs font-semibold" style={{ color: FP.ink, boxShadow: `inset 0 0 0 1.5px ${FP.ink}`, borderRadius: 4 }}>
                  Zen
                </span>
              ) : burned ? (
                <span className="px-1.5 py-0.5 text-xs font-bold" style={{ color: FP.accent2, boxShadow: `inset 0 0 0 1.5px ${FP.accent}`, borderRadius: 4 }}>
                  Burned
                </span>
              ) : (
                <span className="flex gap-0.5" aria-label={`${r.stars} stars`}>
                  {[1, 2, 3].map((k) => (
                    <Star key={k} size={12} strokeWidth={2} color={k <= r.stars ? FP.ink : FP.grey} fill={k <= r.stars ? FP.ink : 'none'} />
                  ))}
                </span>
              )}
              <span className="text-xs tabular-nums" style={{ color: FP.muted }}>
                {relDay(r.at, now)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────── achievements ───────────────────────────
type Filter = 'all' | AchievementTier;

function AchievementWall({ state }: { state: ProfileData }) {
  const [filter, setFilter] = useState<Filter>('all');
  const list = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => filter === 'all' || a.tier === filter)
        .map((a) => ({ a, s: achievementProgress(a, state) }))
        .sort((x, y) => Number(y.s.unlocked) - Number(x.s.unlocked) || y.s.pct - x.s.pct),
    [filter, state],
  );
  const filters: Filter[] = ['all', ...ACHIEVEMENT_TIERS];
  return (
    <div>
      <div
        className="mb-4 flex flex-wrap gap-[2px] overflow-hidden p-[2px] sm:inline-flex"
        style={{ background: FP.ink, borderRadius: 6 }}
        role="tablist"
        aria-label="Filter by tier"
      >
        {filters.map((f) => {
          const on = f === filter;
          const count = ACHIEVEMENTS.filter((a) => (f === 'all' || a.tier === f) && state.unlocked[a.id]).length;
          const tot = ACHIEVEMENTS.filter((a) => f === 'all' || a.tier === f).length;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(f)}
              className="flex min-h-9 flex-[1_1_5.5rem] items-center justify-center gap-1.5 px-3 text-[13px] capitalize transition-colors sm:flex-none"
              style={{
                borderRadius: 4,
                color: FP.ink,
                background: on ? FP.hl : FP.panel,
                fontWeight: on ? 700 : 500,
              }}
            >
              {f !== 'all' && <TierSwatch tier={f} />}
              {f}{' '}
              <span className="tabular-nums" style={{ fontFamily: FP.mono, color: on ? FP.ink : FP.muted }}>
                {count}/{tot}
              </span>
            </button>
          );
        })}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ borderTop: `1px solid ${FP.hair}`, borderLeft: `1px solid ${FP.hair}` }}>
        {list.map(({ a, s }) => {
          const Icon = ACHIEVEMENT_ICONS[a.icon];
          const m = METAL[a.tier];
          return (
            <li key={a.id} className="flex items-center gap-3 p-3" style={{ background: FP.panel, boxShadow: `inset -1px -1px 0 ${FP.hair}` }}>
              <Medallion tier={a.tier} size={44} locked={!s.unlocked}>
                {s.unlocked ? <Icon size={19} strokeWidth={2.2} color={FP.ink} /> : <Lock size={15} color="#9A9A94" />}
              </Medallion>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold" style={{ fontFamily: FP.display, color: s.unlocked ? FP.ink : FP.muted }}>
                    {a.title}
                  </span>
                  <span className="ml-auto flex shrink-0 items-center gap-1 text-xs" style={{ color: FP.muted }}>
                    <TierSwatch tier={a.tier} size={8} />
                    {m.label}
                  </span>
                </p>
                <p className="truncate text-xs" style={{ color: FP.muted }} title={a.description}>
                  {a.description}
                </p>
                {s.unlocked ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: FP.ink }}>
                    <Check size={13} strokeWidth={3} color={FP.green} aria-hidden />
                    Awarded {s.at ? new Date(s.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-[2px]" style={{ background: FP.bg, boxShadow: `inset 0 0 0 1px ${FP.hair}` }}>
                      <span className="absolute inset-y-0 left-0 rounded-[2px]" style={{ width: `${s.pct * 100}%`, background: '#9A9A94' }} />
                    </span>
                    <span className="text-xs tabular-nums" style={{ fontFamily: FP.mono, color: FP.muted }}>
                      {fmtInt(s.value)}/{fmtInt(s.goal)}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IdFacts({ badgeNo, since, className }: { badgeNo: string; since: string; className?: string }) {
  return (
    <dl className={['grid-cols-[auto_1fr] gap-x-4 text-[13px]', className].filter(Boolean).join(' ')}>
      <dt className="py-1 font-semibold" style={{ color: FP.muted, ...rule() }}>
        Badge
      </dt>
      <dd className="py-1 tabular-nums" style={{ fontFamily: FP.mono, ...rule() }}>
        {badgeNo}
      </dd>
      <dt className="py-1 font-semibold" style={{ color: FP.muted }}>
        On duty since
      </dt>
      <dd className="py-1 tabular-nums" style={{ fontFamily: FP.mono }}>
        {since}
      </dd>
    </dl>
  );
}

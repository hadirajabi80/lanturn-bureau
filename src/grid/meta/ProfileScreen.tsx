import { useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Flame, Lock, Star, Target, Timer, TrendingUp, Trophy } from 'lucide-react';
import { Avatar } from '../../components/avatar';
import { useReduced } from '../../components/fx';
import { BUREAU } from '../../data/bureau';
import { DISTRICT_BY_ID } from '../skins/districts';
import { ACHIEVEMENTS, ACHIEVEMENT_TIERS, achievementProgress } from './achievements';
import { Medallion } from './AchievementToast';
import { dayNumber, localISODate } from './dates';
import { ACHIEVEMENT_ICONS, VARIANT_ICONS, districtIcon } from './icons';
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

/** `/plans/profile` — the detective's personnel file: ID card, streak, stats, achievements, recent cases. */
export function ProfileScreen({ backTo = '/plans' }: ProfileScreenProps) {
  const state = useProfileStore();
  const now = Date.now();
  const stats = useMemo(() => computeStats(state, now), [state]);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden pb-16"
      style={{
        background: `radial-gradient(1200px 700px at 50% -10%, color-mix(in srgb, ${FP.accent2} 10%, transparent), transparent 60%), ${FP.bg}`,
        color: FP.ink,
        paddingTop: 'var(--safe-top)',
        fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)',
      }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 pb-2 pt-5 sm:px-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm outline-none transition hover:brightness-125 focus-visible:ring-2"
          style={{ color: FP.muted, borderRadius: 8, boxShadow: `inset 0 0 0 1px ${FP.hair}` }}
        >
          <ChevronLeft size={16} /> The Bureau
        </Link>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
            Personnel file
          </p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl" style={{ fontFamily: FP.display }}>
            Detective profile
          </h1>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 pt-3 sm:px-6 lg:grid-cols-12">
        <Section i={0} className="lg:col-span-7">
          <IdCard state={state} />
        </Section>
        <Section i={1} className="lg:col-span-5">
          <StreakCard state={state} stats={stats} now={now} />
        </Section>
        <Section i={2} className="lg:col-span-12">
          <SummaryTiles state={state} stats={stats} />
        </Section>
        <Section i={3} className="lg:col-span-6" title="Floors" kicker="Solves by tier">
          <BarRows rows={stats.byTier.map((t) => ({ key: t.tier, label: TIER_LABEL[t.tier], value: t.count }))} color={FP.accent} />
        </Section>
        <Section i={4} className="lg:col-span-6" title="Districts" kicker="Solves by building">
          <BarRows
            rows={stats.byDistrict.map((d) => ({
              key: d.id,
              label: d.name,
              value: d.count,
              color: d.color,
              color2: d.light ? d.color2 : undefined,
              light: d.light,
              icon: districtIcon(d.icon),
              note: `${d.unique}/${d.total}`,
            }))}
            labelWidth="12rem"
          />
        </Section>
        <Section i={5} className="lg:col-span-5" title="Scenarios" kicker="Solves by variant">
          <VariantGrid stats={stats} />
        </Section>
        <Section i={6} className="lg:col-span-7" title="Last 30 days" kicker="Activity">
          <Sparkline data={stats.activity30} />
        </Section>
        <Section i={7} className="lg:col-span-6" title="Times" kicker="Best & average by plan size">
          <TimesTable stats={stats} />
        </Section>
        <Section i={8} className="lg:col-span-6" title="Recent cases" kicker="Case log">
          <RecentList stats={stats} now={now} />
        </Section>
        <Section i={9} className="lg:col-span-12" title="Commendations" kicker={`Achievements · ${stats.achievementsUnlocked} of ${stats.achievementsTotal}`}>
          <AchievementWall state={state} />
        </Section>
      </main>
    </div>
  );
}

// ─────────────────────────── layout bits ───────────────────────────
function Section({ i, className, title, kicker, children }: { i: number; className?: string; title?: string; kicker?: string; children: ReactNode }) {
  const reduced = useReduced();
  return (
    <motion.section
      className={['min-w-0', className].filter(Boolean).join(' ')}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 28 }}
    >
      {title ? (
        <div className="h-full p-4 sm:p-5" style={panelStyle}>
          <div className="mb-3">
            {kicker && (
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
                {kicker}
              </p>
            )}
            <h2 className="text-lg font-bold" style={{ fontFamily: FP.display }}>
              {title}
            </h2>
          </div>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.section>
  );
}

// ─────────────────────────── ID card ───────────────────────────
function IdCard({ state }: { state: ProfileData }) {
  const rp = rankProgress(state.xp);
  const me = BUREAU.you;
  const since = new Date(state.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const badgeNo = `LB-${String(4000 + (Math.abs(Math.floor(state.createdAt / 1000)) % 5999)).padStart(4, '0')}`;
  return (
    <div
      className="relative h-full overflow-hidden p-4 sm:p-5"
      style={{
        ...panelStyle,
        background: `linear-gradient(135deg, color-mix(in srgb, ${rp.rank.color} 9%, ${FP.panel}), ${FP.panel} 55%)`,
      }}
    >
      {/* guilloche-ish engraved lines */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 400 200">
        {Array.from({ length: 14 }, (_, k) => (
          <path key={k} d={`M0 ${20 + k * 12} C 100 ${k * 12 - 10}, 300 ${40 + k * 12}, 400 ${10 + k * 12}`} fill="none" stroke={rp.rank.color} strokeWidth={0.6} />
        ))}
      </svg>
      <div className="relative flex items-start gap-4">
        <div
          className="shrink-0 overflow-hidden"
          style={{ borderRadius: 8, background: 'linear-gradient(180deg,#2A231C,#15110D)', boxShadow: `inset 0 0 0 1px ${FP.hairStrong}, 0 6px 18px -8px rgba(0,0,0,0.9)` }}
        >
          <Avatar spec={me.avatar} size={92} title="Rookie" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
            Lantern Bureau · Greywick
          </p>
          <h2 className="text-3xl font-black leading-tight" style={{ fontFamily: FP.display }}>
            {me.name}
          </h2>
          <p className="text-sm font-semibold" style={{ color: rp.rank.color }}>
            {rp.rank.name}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]" style={{ fontFamily: FP.mono }}>
            <dt style={{ color: FP.muted }}>Badge</dt>
            <dd>{badgeNo}</dd>
            <dt style={{ color: FP.muted }}>On duty since</dt>
            <dd>{since}</dd>
          </dl>
        </div>
        <div className="hidden shrink-0 sm:block">
          <RankInsignia rank={rp.rank} size={92} glow title={rp.rank.name} />
        </div>
        <div className="shrink-0 sm:hidden">
          <RankInsignia rank={rp.rank} size={56} glow title={rp.rank.name} />
        </div>
      </div>
      <div className="relative mt-5">
        <div className="mb-1.5 flex items-baseline justify-between text-xs" style={{ fontFamily: FP.mono }}>
          <span>
            <span style={{ color: FP.accent2 }}>{fmtInt(state.xp)}</span> <span style={{ color: FP.muted }}>XP</span>
          </span>
          <span style={{ color: FP.muted }}>{rp.next ? `${fmtInt(rp.xpForNext - rp.xpInRank)} to ${rp.next.name}` : 'Highest rank'}</span>
        </div>
        <XpFilament pct={rp.pct} animateFrom={0} height={5} color={rp.rank.color} />
      </div>
    </div>
  );
}

// ─────────────────────────── streak ───────────────────────────
const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function StreakCard({ state, stats, now }: { state: ProfileData; stats: ProfileStats; now: number }) {
  const reduced = useReduced();
  const streak = liveStreak(state.streak, localISODate(now));
  const lit = streak > 0;
  return (
    <div className="h-full p-4 sm:p-5" style={panelStyle}>
      <div className="flex items-center gap-4">
        <motion.div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background: lit ? 'radial-gradient(circle at 50% 65%, rgba(255,179,71,0.35), transparent 70%)' : 'rgba(255,255,255,0.03)',
            boxShadow: `inset 0 0 0 1px ${FP.hair}`,
          }}
          animate={lit && !reduced ? { scale: [1, 1.06, 1] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame size={34} strokeWidth={1.8} color={lit ? '#FFB347' : '#6B5E4E'} fill={lit ? 'rgba(255,140,40,0.45)' : 'none'} style={lit ? { filter: 'drop-shadow(0 0 8px #FF8C28)' } : undefined} />
        </motion.div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
            Daily streak
          </p>
          <p className="text-4xl font-black leading-none" style={{ fontFamily: FP.display, color: lit ? FP.accent2 : FP.ink }}>
            {streak}
            <span className="ml-1.5 text-base font-semibold" style={{ color: FP.muted }}>
              {streak === 1 ? 'day' : 'days'}
            </span>
          </p>
          <p className="mt-1 text-xs" style={{ color: FP.muted }}>
            Best <span style={{ color: FP.ink, fontFamily: FP.mono }}>{state.streak.best}</span> · Today{' '}
            <span style={{ color: FP.ink, fontFamily: FP.mono }}>{stats.calendar14[13]?.count ?? 0}</span> closed
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5" role="list" aria-label="Last 14 days">
        {stats.calendar14.map((d) => {
          const dow = (((dayNumber(d.date) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
          const on = d.count > 0;
          return (
            <div
              key={d.date}
              role="listitem"
              title={`${d.date}: ${d.count} closed${d.daily ? " · Today's case" : ''}`}
              className="relative flex aspect-square flex-col items-center justify-center text-[10px]"
              style={{
                borderRadius: 6,
                fontFamily: FP.mono,
                background: on ? `rgba(255,179,71,${Math.min(0.55, 0.18 + d.count * 0.07)})` : 'rgba(255,255,255,0.03)',
                boxShadow: d.today ? `inset 0 0 0 1.5px ${FP.accent2}` : `inset 0 0 0 1px ${FP.hair}`,
                color: on ? '#FFF4D6' : FP.muted,
              }}
            >
              <span className="opacity-70">{WEEKDAY[dow]}</span>
              <span className="font-semibold">{Number(d.date.slice(8))}</span>
              {d.daily && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: FP.danger, boxShadow: `0 0 4px ${FP.danger}` }} />}
            </div>
          );
        })}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: FP.muted }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: FP.danger }} /> Today's case solved
      </p>
    </div>
  );
}

// ─────────────────────────── summary ───────────────────────────
function SummaryTiles({ state, stats }: { state: ProfileData; stats: ProfileStats }) {
  const tiles: { label: string; value: string; icon: ReactNode; tone?: string }[] = [
    { label: 'Cases closed', value: fmtInt(stats.totalSolved), icon: <Trophy size={16} /> },
    { label: 'Files burned', value: fmtInt(stats.totalBurns), icon: <Flame size={16} />, tone: FP.danger },
    { label: 'Accuracy', value: `${Math.round(stats.accuracy * 100)}%`, icon: <Target size={16} /> },
    { label: 'Three-star rate', value: `${Math.round(stats.threeStarRate * 100)}%`, icon: <Star size={16} /> },
    { label: 'Blitz best', value: fmtInt(state.blitzBest), icon: <Timer size={16} /> },
    { label: 'Gauntlet best', value: `${state.gauntletBest}/${GAUNTLET_STAGES}`, icon: <TrendingUp size={16} /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="p-3" style={panelStyle}>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
            <span style={{ color: t.tone ?? FP.accent }}>{t.icon}</span>
            {t.label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ fontFamily: FP.display }}>
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────── bars ───────────────────────────
interface BarRow {
  key: string;
  label: string;
  value: number;
  color?: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
  note?: string;
  /** second stop: the bar becomes a two-tone gradient (light-mood districts) */
  color2?: string;
  /** daytime district: pastel candy-stripe bar + icon on a light chip so it reads as "day" on the night desk */
  light?: boolean;
}

function BarRows({ rows, color, labelWidth = '9.5rem' }: { rows: BarRow[]; color?: string; labelWidth?: string }) {
  const reduced = useReduced();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r, i) => {
        const c = r.color ?? color ?? FP.accent;
        const Icon = r.icon;
        return (
          <li key={r.key} className="grid items-center gap-3 text-sm" style={{ gridTemplateColumns: `minmax(0,${labelWidth}) 1fr auto` }}>
            <span className="flex min-w-0 items-center gap-1.5">
              {Icon &&
                (r.light ? (
                  <span
                    className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
                    style={{ background: `radial-gradient(circle at 35% 30%, #FFFFFF, color-mix(in srgb, ${c} 22%, #FFF6FA))`, boxShadow: `0 0 8px -2px ${c}` }}
                  >
                    <Icon size={11} color={c} />
                  </span>
                ) : (
                  <Icon size={14} color={c} />
                ))}
              <span className="truncate" style={{ color: r.value ? FP.ink : FP.muted }}>
                {r.label}
              </span>
            </span>
            <span className="relative h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: r.color2
                    ? `repeating-linear-gradient(135deg, rgba(255,255,255,0.28) 0 3px, transparent 3px 7px), linear-gradient(90deg, ${c}, ${r.color2})`
                    : `linear-gradient(90deg, color-mix(in srgb, ${c} 50%, transparent), ${c})`,
                  boxShadow: r.value ? `0 0 8px color-mix(in srgb, ${r.color2 ?? c} 55%, transparent)` : undefined,
                }}
                initial={{ width: reduced ? `${(r.value / max) * 100}%` : 0 }}
                animate={{ width: `${(r.value / max) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            <span className="min-w-[3.5rem] text-right text-xs tabular-nums" style={{ fontFamily: FP.mono }}>
              {fmtInt(r.value)}
              {r.note && <span style={{ color: FP.muted }}> · {r.note}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────── variants ───────────────────────────
function VariantGrid({ stats }: { stats: ProfileStats }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.byVariant.map((v) => {
        const Icon = VARIANT_ICONS[v.variant];
        const on = v.count > 0;
        return (
          <div
            key={v.variant}
            className="flex flex-col items-center gap-1 px-1 py-2.5 text-center"
            title={`${VARIANT_LABEL[v.variant]}: ${v.count}`}
            style={{
              borderRadius: 8,
              background: on ? `color-mix(in srgb, ${FP.accent} 8%, transparent)` : 'rgba(255,255,255,0.02)',
              boxShadow: `inset 0 0 0 1px ${on ? FP.hairStrong : FP.hair}`,
              opacity: on ? 1 : 0.5,
            }}
          >
            <Icon size={20} color={on ? FP.accent2 : FP.muted} />
            <span className="text-lg font-bold leading-none tabular-nums" style={{ fontFamily: FP.display }}>
              {v.count}
            </span>
            <span className="text-[10px] leading-tight" style={{ color: FP.muted }}>
              {VARIANT_LABEL[v.variant]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── sparkline ───────────────────────────
function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const reduced = useReduced();
  const W = 300;
  const H = 86;
  const pad = 6;
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const active = data.filter((d) => d.count > 0).length;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2 - 6);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;
  const peak = data.reduce((b, d, i) => (d.count > data[b].count ? i : b), 0);
  const avg = total / Math.max(1, data.length);
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ fontFamily: FP.mono, color: FP.muted }}>
        <span>
          <span style={{ color: FP.ink }}>{total}</span> closed
        </span>
        <span>
          <span style={{ color: FP.ink }}>{active}</span>/30 active days
        </span>
        <span>
          peak <span style={{ color: FP.ink }}>{data[peak]?.count ?? 0}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Cases closed per day over the last 30 days: ${total} in total`}>
        <defs>
          <linearGradient id="fp-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB347" stopOpacity={0.35} />
            <stop offset="1" stopColor="#FFB347" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2 - 6)} y2={H - pad - f * (H - pad * 2 - 6)} stroke="rgba(255,255,255,0.05)" strokeWidth={0.6} />
        ))}
        <line x1={pad} x2={W - pad} y1={y(avg)} y2={y(avg)} stroke="rgba(255,179,71,0.35)" strokeWidth={0.7} strokeDasharray="3 3" />
        <motion.path d={area} fill="url(#fp-spark-fill)" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="#FFB347"
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255,179,71,0.6))' }}
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {data.map((d, i) =>
          d.count > 0 ? <circle key={d.date} cx={x(i)} cy={y(d.count)} r={i === peak ? 3 : 1.6} fill={i === peak ? '#FFF4D6' : '#FFB347'} /> : null,
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px]" style={{ fontFamily: FP.mono, color: FP.muted }}>
        <span>{data[0]?.date.slice(5)}</span>
        <span>today</span>
      </div>
    </div>
  );
}

// ─────────────────────────── times ───────────────────────────
function TimesTable({ stats }: { stats: ProfileStats }) {
  const cell: CSSProperties = { borderBottom: `1px solid ${FP.hair}` };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ fontFamily: FP.mono }}>
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.18em]" style={{ color: FP.muted }}>
            <th className="py-1.5 font-normal" style={cell}>Plan</th>
            <th className="py-1.5 text-right font-normal" style={cell}>Solved</th>
            <th className="py-1.5 text-right font-normal" style={cell}>Best</th>
            <th className="py-1.5 text-right font-normal" style={cell}>Average</th>
          </tr>
        </thead>
        <tbody>
          {stats.bySize.map((r) => (
            <tr key={r.size} style={{ opacity: r.count ? 1 : 0.38 }}>
              <td className="py-1.5" style={cell}>
                {r.size}×{r.size}
              </td>
              <td className="py-1.5 text-right tabular-nums" style={cell}>
                {r.count}
              </td>
              <td className="py-1.5 text-right tabular-nums" style={{ ...cell, color: r.count ? FP.accent2 : undefined }}>
                {fmtTime(r.bestMs)}
              </td>
              <td className="py-1.5 text-right tabular-nums" style={cell}>
                {fmtTime(r.avgMs)}
              </td>
            </tr>
          ))}
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
      <p className="py-6 text-center text-sm italic" style={{ color: FP.muted }}>
        No cases on file yet. The lamp is lit — pick a building.
      </p>
    );
  }
  return (
    <ul className="flex flex-col">
      {stats.recent.map((r, i) => {
        const d = DISTRICT_BY_ID[r.district];
        const DIcon = districtIcon(d?.icon ?? '');
        const VIcon = VARIANT_ICONS[r.variant];
        const burned = r.kind === 'burn';
        return (
          <li key={`${r.id}-${r.at}-${i}`} className="flex items-center gap-3 py-2" style={{ borderBottom: i < stats.recent.length - 1 ? `1px solid ${FP.hair}` : undefined }}>
            <span
              className="grid h-8 w-8 shrink-0 place-items-center"
              style={{
                borderRadius: 8,
                background:
                  d?.mood === 'light'
                    ? `linear-gradient(135deg, #FFFFFF, color-mix(in srgb, ${d.palette.accent} 18%, ${d.palette.bg}))`
                    : `color-mix(in srgb, ${d?.palette.accent ?? '#D4A857'} 14%, transparent)`,
                boxShadow: d?.mood === 'light' ? `0 0 10px -4px ${d.palette.accent}` : undefined,
              }}
            >
              <DIcon size={16} color={d?.palette.accent ?? '#D4A857'} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm">
                <span className="truncate">{d?.name ?? r.district}</span>
                <VIcon size={12} color={FP.muted} aria-label={VARIANT_LABEL[r.variant]} />
              </p>
              <p className="truncate text-[11px]" style={{ fontFamily: FP.mono, color: FP.muted }}>
                {TIER_LABEL[r.tier]}
                {r.kind === 'solve' ? ` · ${r.size}×${r.size} · ${fmtTime(r.timeMs)}` : ''} · {r.mode}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              {r.mode === 'zen' && !burned ? (
                <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-[0.15em]" style={{ color: FP.muted, boxShadow: `inset 0 0 0 1px ${FP.hair}`, borderRadius: 4, fontFamily: FP.mono }}>
                  Zen
                </span>
              ) : burned ? (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: FP.danger, boxShadow: `inset 0 0 0 1px ${FP.danger}`, borderRadius: 4, fontFamily: FP.mono }}>
                  Burned
                </span>
              ) : (
                <span className="flex gap-0.5" aria-label={`${r.stars} stars`}>
                  {[1, 2, 3].map((k) => (
                    <Star key={k} size={11} color={k <= r.stars ? '#FFB347' : '#5A4E40'} fill={k <= r.stars ? '#FFB347' : 'none'} />
                  ))}
                </span>
              )}
              <span className="text-[10px]" style={{ fontFamily: FP.mono, color: FP.muted }}>
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
  const reduced = useReduced();
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
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by tier">
        {filters.map((f) => {
          const on = f === filter;
          const c = f === 'all' ? FP.accent : METAL[f].base;
          const count = ACHIEVEMENTS.filter((a) => (f === 'all' || a.tier === f) && state.unlocked[a.id]).length;
          const tot = ACHIEVEMENTS.filter((a) => f === 'all' || a.tier === f).length;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(f)}
              className="px-3 py-1 text-xs capitalize outline-none transition focus-visible:ring-2"
              style={{
                borderRadius: 999,
                color: on ? '#160F08' : FP.ink,
                background: on ? c : 'transparent',
                boxShadow: on ? `0 0 12px -4px ${c}` : `inset 0 0 0 1px ${FP.hair}`,
                fontWeight: on ? 700 : 500,
              }}
            >
              {f} <span style={{ fontFamily: FP.mono, opacity: 0.75 }}>{count}/{tot}</span>
            </button>
          );
        })}
      </div>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(({ a, s }, i) => {
          const Icon = ACHIEVEMENT_ICONS[a.icon];
          const m = METAL[a.tier];
          return (
            <motion.li
              key={a.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.5, i * 0.015) }}
              className="flex items-center gap-3 p-2.5"
              style={{
                borderRadius: 10,
                background: s.unlocked ? `linear-gradient(110deg, color-mix(in srgb, ${m.base} 10%, transparent), transparent 70%)` : 'rgba(255,255,255,0.02)',
                boxShadow: `inset 0 0 0 1px ${s.unlocked ? `${m.base}44` : FP.hair}`,
              }}
            >
              <Medallion tier={a.tier} size={46} locked={!s.unlocked}>
                {s.unlocked ? <Icon size={20} strokeWidth={2.2} color={m.dark} /> : <Lock size={16} color="#6B5E4E" />}
              </Medallion>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold" style={{ fontFamily: FP.display, color: s.unlocked ? FP.ink : FP.muted }}>
                    {a.title}
                  </span>
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: FP.mono, color: m.base, opacity: s.unlocked ? 1 : 0.6 }}>
                    {m.label}
                  </span>
                </p>
                <p className="truncate text-[11px]" style={{ color: FP.muted }} title={a.description}>
                  {a.description}
                </p>
                {s.unlocked ? (
                  <p className="mt-1 text-[10px]" style={{ fontFamily: FP.mono, color: m.base }}>
                    Awarded {s.at ? new Date(s.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="relative h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.pct * 100}%`, background: m.base, opacity: 0.8 }} />
                    </span>
                    <span className="text-[10px] tabular-nums" style={{ fontFamily: FP.mono, color: FP.muted }}>
                      {fmtInt(s.value)}/{fmtInt(s.goal)}
                    </span>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

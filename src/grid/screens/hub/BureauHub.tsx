import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Dices, Hourglass, InfinityIcon, KeyRound, Swords, Trophy, UserRound } from 'lucide-react';
import { DISTRICTS, TIER_INFO } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import { TIERS } from '@/grid/types';
import {
  BrassButton,
  FacadeArt,
  FACADE_SIZE,
  GhostButton,
  MonoStat,
  PageShell,
  Panel,
  Plate,
  ProgressFilament,
  SkinProvider,
  isLightDistrict,
  skinVars,
  StarRow,
  VARIANT_INFO,
  VariantGlyph,
  useFpReduced,
} from '@/grid/ui';
import {
  dailyInfo,
  districtTally,
  tierTally,
  todayISO,
  useProfileSafe,
  useProgressMap,
  type DailyInfo,
  type ProgressMap,
} from '@/grid/ui/bridge';
import { RankChip } from '@/grid/meta';
import { roman, StreakFlame } from './shared';

const SUM_W = DISTRICTS.reduce((a, d) => a + FACADE_SIZE[d.facade.shape].w, 0);
const OVERLAP = 10;
const NIGHT = DISTRICTS.filter((d) => !isLightDistrict(d));
const SUGAR = DISTRICTS.filter((d) => isLightDistrict(d));

/** /plans — The Bureau: Greywick's night skyline, one building per district. */
export default function BureauHub() {
  const progress = useProgressMap();
  const [selected, setSelected] = useState<string>(DISTRICTS[0]!.id);
  const sel = DISTRICTS.find((d) => d.id === selected) ?? DISTRICTS[0]!;
  const total = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally(progress, d.id).solved, 0), [progress]);
  const totalCases = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally({}, d.id).total, 0), []);

  return (
    <SkinProvider district="ashcombe">
      <PageShell
        title="The Bureau"
        kicker="Greywick · Night shift"
        right={
          <RankChip compact className="hidden sm:flex" />
        }
      >
        <section aria-labelledby="skyline-h" className="relative">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="skyline-h" className="fp-display fp-text-glow">Greywick after dark</h2>
              <p className="mt-1 max-w-xl text-sm text-(--fp-muted)">
                Every lit window is a case you closed. Pick a building to open its floor plans.
              </p>
            </div>
            <MonoStat label="Cases closed" value={`${total.toLocaleString()} / ${totalCases.toLocaleString()}`} />
          </div>
          <Skyline progress={progress} selected={selected} onSelect={setSelected} />
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
          <DistrictCard district={sel} progress={progress} />
          <Rail />
        </div>

        <section aria-labelledby="ledger-h" className="mt-8">
          <h2 id="ledger-h" className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-(--fp-muted)">
            District ledger
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {DISTRICTS.map((d) => (
              <LedgerRow key={d.id} district={d} progress={progress} />
            ))}
          </ul>
        </section>
      </PageShell>
    </SkinProvider>
  );
}

// ───────────────────────────── skyline ─────────────────────────────

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Skyline({ progress, selected, onSelect }: { progress: ProgressMap; selected: string; onSelect: (id: string) => void }) {
  const navigate = useNavigate();
  const reduced = useFpReduced();
  const [ref, width] = useWidth();
  const phone = width > 0 && width < 760;
  const k = phone ? 0.62 : Math.max(0.25, Math.min(1.1, (width - 60) / (SUM_W - OVERLAP * (DISTRICTS.length - 2))));

  const onEnter = (id: string) => (e: PointerEvent) => {
    if (e.pointerType === 'mouse') onSelect(id);
  };
  const onFocus = (id: string) => (e: FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(':focus-visible')) onSelect(id);
  };

  return (
    <div
      ref={ref}
      className="fp-panel relative overflow-hidden"
      style={{
        background:
          'radial-gradient(60% 50% at 78% 18%, rgb(255 255 255 / 0.07), transparent 60%), linear-gradient(180deg, color-mix(in srgb, var(--fp-bg) 70%, black) 0%, color-mix(in srgb, var(--fp-bg) 80%, #1b2233) 70%, color-mix(in srgb, var(--fp-glow) 14%, var(--fp-bg)) 100%)',
      }}
    >
      {/* stars + moon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 32% 8%, #fff, transparent), radial-gradient(1.5px 1.5px at 48% 22%, #fff, transparent), radial-gradient(1px 1px at 63% 12%, #fff, transparent), radial-gradient(1px 1px at 86% 30%, #fff, transparent), radial-gradient(1px 1px at 92% 9%, #fff, transparent), radial-gradient(1px 1px at 22% 34%, #fff, transparent), radial-gradient(1px 1px at 72% 36%, #fff, transparent)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[46%] top-5 size-10 rounded-full sm:size-14"
        style={{ background: 'radial-gradient(circle at 38% 38%, #fffbe8, #e9e1c4 55%, #c9bf9e)', boxShadow: '0 0 40px 8px rgb(255 248 220 / 0.18)' }}
      />
      <div
        role="list"
        aria-label="Districts of Greywick"
        className={[
          'no-scrollbar relative flex items-end px-3 pt-10',
          phone ? 'fp-snap-x overflow-x-auto overflow-y-hidden' : 'justify-center',
        ].join(' ')}
      >
        {NIGHT.map((d, i) => building(d, i))}
        {SUGAR.length > 0 && (
          <div
            role="group"
            aria-label="Sugar Lane"
            className="relative -mr-3 -mt-10 flex shrink-0 items-end self-stretch pl-4 pr-3 pt-10"
            style={{
              marginLeft: phone ? 10 : 4,
              background:
                'radial-gradient(70% 45% at 70% 22%, rgb(255 244 200 / 0.95), transparent 70%), linear-gradient(180deg, #ffd3e6 0%, #ffe3c9 55%, #fff1d6 100%)',
              maskImage: 'linear-gradient(90deg, transparent 0, #000 18px)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 18px)',
            }}
          >
            <span
              aria-hidden
              className="absolute left-5 top-2.5 font-display text-[11px] font-bold italic tracking-wide"
              style={{ color: '#c2547f' }}
            >
              ♥ Sugar Lane
            </span>
            {SUGAR.map((d, i) => building(d, NIGHT.length + i, i === 0))}
          </div>
        )}
        {phone && <div className="w-3 shrink-0" aria-hidden />}
      </div>
      {/* street */}
      <div aria-hidden className="h-3" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--fp-bg) 60%, black), black)' }} />
    </div>
  );

  function building(d: District, i: number, firstInGroup = false) {
          const t = districtTally(progress, d.id);
          const size = FACADE_SIZE[d.facade.shape];
          const active = d.id === selected;
          return (
            <motion.div
              role="listitem"
              key={d.id}
              className="relative shrink-0"
              style={{ marginLeft: i === 0 || firstInGroup ? 0 : phone ? 6 : -OVERLAP * k, zIndex: active ? 5 : 1 }}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.05 * i, type: 'spring', stiffness: 220, damping: 22 }}
            >
              <motion.button
                type="button"
                className="group relative block rounded-md pb-8 outline-none"
                aria-label={`${d.name} — ${t.solved} of ${t.total} cases closed`}
                aria-current={active ? 'true' : undefined}
                onPointerEnter={onEnter(d.id)}
                onFocus={onFocus(d.id)}
                onClick={() => (active ? navigate(`/plans/d/${d.id}`) : onSelect(d.id))}
                animate={{ y: active ? -10 : 0, filter: active ? 'brightness(1.12)' : 'brightness(0.82)' }}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <FacadeArt district={d} sky={false} fog litFraction={t.total ? t.solved / t.total : 0} height={size.h * k} />
                <span
                  className="absolute inset-x-0 bottom-1 flex justify-center"
                  style={{ opacity: active ? 1 : 0.7 }}
                >
                  <span className={active ? 'fp-plate' : 'fp-plate fp-plate--dark'} style={skinVars(d.palette)}>{roman(d.number)}</span>
                </span>
                {active && (
                  <motion.span
                    layoutId="hub-beacon"
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full"
                    style={{ background: d.palette.glow, boxShadow: `0 0 12px ${d.palette.glow}` }}
                  />
                )}
              </motion.button>
            </motion.div>
          );
  }
}

// ───────────────────────────── district card ─────────────────────────────

function DistrictCard({ district: d, progress }: { district: District; progress: ProgressMap }) {
  const t = districtTally(progress, d.id);
  const reduced = useFpReduced();
  return (
    <SkinProvider district={d} className="min-w-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={d.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Panel tone="glow" className="overflow-hidden p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="hidden shrink-0 sm:block">
                <div className="overflow-hidden rounded-lg" style={{ boxShadow: 'inset 0 0 0 1px var(--fp-hair)' }}>
                  <FacadeArt district={d} litFraction={t.total ? t.solved / t.total : 0} height={150} title={`${d.name} facade`} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Plate>District {roman(d.number)}</Plate>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-(--fp-muted)">{d.kicker.split('·')[1]?.trim()}</span>
                </div>
                <h3 className="mt-2 font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.3rem)] font-black leading-tight text-(--fp-ink)">{d.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--fp-muted) sm:text-base">{d.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  <MonoStat label="Closed" value={`${t.solved}/${t.total}`} />
                  <MonoStat label="Stars" value={t.stars} />
                  <MonoStat label="Open files" value={t.inProgress} />
                </div>
                <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-4" label={`${d.name} progress`} />
                <ul className="mt-4 grid grid-cols-5 gap-2" aria-label="Floors">
                  {TIERS.map((tier) => {
                    const tt = tierTally(progress, d.id, tier);
                    return (
                      <li key={tier} className="min-w-0">
                        <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-(--fp-muted)">{TIER_INFO[tier].name}</div>
                        <ProgressFilament value={tt.total ? tt.solved / tt.total : 0} className="mt-1.5" label={`${TIER_INFO[tier].name} progress`} />
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <BrassButton to={`/plans/d/${d.id}`} size="lg" iconRight={<ArrowRight className="size-4" />}>
                    Enter {d.name.replace(/^The /, '')}
                  </BrassButton>
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>
      </AnimatePresence>
    </SkinProvider>
  );
}

// ───────────────────────────── rail ─────────────────────────────

function useDaily(): { date: string; info: DailyInfo; districtId: string; tier: DailyInfo['tier'] } {
  const date = useMemo(() => todayISO(), []);
  const info = useMemo(() => dailyInfo(date), [date]);
  return { date, info, districtId: info.districtId, tier: info.tier };
}

function Rail() {
  const prof = useProfileSafe();
  const daily = useDaily();
  const dd = DISTRICTS.find((d) => d.id === daily.districtId) ?? DISTRICTS[0]!;
  const dateLabel = new Date(`${daily.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <aside className="flex min-w-0 flex-col gap-4" aria-label="Bureau desk">
      <SkinProvider district={dd}>
        <Panel className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <Plate>Today’s case</Plate>
            <StreakFlame streak={prof.streak} lit={prof.solvedToday} />
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-(--fp-muted)">{dateLabel}</div>
          <div className="mt-1 font-display text-xl font-bold text-(--fp-ink)">{daily.info?.title ?? dd.name}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="fp-chip px-2.5 py-1">{dd.name}</span>
            <span className="fp-chip px-2.5 py-1">{TIER_INFO[daily.tier].name}</span>
            <span className="fp-chip px-2.5 py-1 font-mono">{daily.info ? `${daily.info.size}×${daily.info.size}` : '…'}</span>
            {daily.info && (
              <span className="fp-chip px-2.5 py-1">
                <VariantGlyph variant={daily.info.variant} size={12} /> {VARIANT_INFO[daily.info.variant].name}
              </span>
            )}
          </div>
          <BrassButton to="/plans/daily" block className="mt-4" icon={<CalendarDays className="size-4" />}>
            {prof.solvedToday ? 'Review today’s file' : 'Open today’s file'}
          </BrassButton>
        </Panel>
      </SkinProvider>

      <Panel className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Plate dark>After hours</Plate>
          <Link to="/plans/modes" className="text-xs font-semibold text-(--fp-muted) hover:text-(--fp-hi)">
            All modes →
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <GhostButton to="/plans/blitz" size="sm" icon={<Hourglass className="size-3.5" />}>Blitz</GhostButton>
          <GhostButton to="/plans/gauntlet" size="sm" icon={<Swords className="size-3.5" />}>Gauntlet</GhostButton>
          <GhostButton to="/plans/weekly" size="sm" icon={<Trophy className="size-3.5" />}>Weekly</GhostButton>
          <GhostButton to="/plans/zen" size="sm" icon={<InfinityIcon className="size-3.5" />}>Zen</GhostButton>
          <GhostButton to="/plans/custom" size="sm" icon={<KeyRound className="size-3.5" />} className="col-span-2">
            Custom &amp; codes
          </GhostButton>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <Plate dark>
            <UserRound className="size-3" aria-hidden /> Detective
          </Plate>
          <span className="font-mono text-[11px] tabular-nums text-(--fp-muted)">{prof.xp.toLocaleString()} XP</span>
        </div>
        <RankChip className="w-full" />
      </Panel>

      <RandomCase />
    </aside>
  );
}

function RandomCase() {
  const navigate = useNavigate();
  const progress = useProgressMap();
  const go = () => {
    const pool: string[] = [];
    for (const d of DISTRICTS)
      for (const tier of TIERS)
        for (let n = 1; n <= d.casesPerTier[tier]; n++) if (!progress[`${d.id}-${tier}-${n}`]?.solved) pool.push(`/plans/d/${d.id}/${tier}/${n}`);
    const to = pool[Math.floor(Math.random() * pool.length)];
    if (to) navigate(to);
  };
  return (
    <GhostButton onClick={go} icon={<Dices className="size-4" />}>
      Pull a random file
    </GhostButton>
  );
}

// ───────────────────────────── ledger ─────────────────────────────

function LedgerRow({ district: d, progress }: { district: District; progress: ProgressMap }) {
  const t = districtTally(progress, d.id);
  return (
    <li>
      <SkinProvider district={d}>
        <Link to={`/plans/d/${d.id}`} className="group block rounded-[10px]">
          <Panel className="flex items-center gap-3 p-3 transition-transform group-hover:-translate-y-0.5">
            <span className="fp-plate shrink-0">{roman(d.number)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[15px] font-bold">{d.name}</div>
              <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-2" label={`${d.name} progress`} />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="font-mono text-xs tabular-nums text-(--fp-muted)">
                {t.solved}/{t.total}
              </span>
              {t.stars > 0 && <StarRow stars={Math.min(3, Math.round((t.stars / Math.max(1, t.solved * 3)) * 3))} size={9} className="text-(--fp-hi)" />}
            </div>
          </Panel>
        </Link>
      </SkinProvider>
    </li>
  );
}

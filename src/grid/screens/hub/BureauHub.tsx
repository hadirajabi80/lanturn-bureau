import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Dices } from 'lucide-react';
import { DISTRICTS, TIER_INFO } from '@/grid/skins/districts';
import { isGuideDone, markGuideDone } from '@/grid/guide';
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
import { DAY_PLATE, NIGHT_PLATE, quarterOf, roman, SectionTitle, StreakFlame, Swatch } from './shared';

const SUM_W = DISTRICTS.reduce((a, d) => a + FACADE_SIZE[d.facade.shape].w, 0);
const OVERLAP = 10;
const NIGHT = DISTRICTS.filter((d) => !isLightDistrict(d));
const SUGAR = DISTRICTS.filter((d) => isLightDistrict(d));

/** /plans — The Bureau: one building per district, a district card, today's case and the ledger. */
export default function BureauHub() {
  const progress = useProgressMap();
  const [selected, setSelected] = useState<string>(DISTRICTS[0]!.id);
  const sel = DISTRICTS.find((d) => d.id === selected) ?? DISTRICTS[0]!;
  const total = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally(progress, d.id).solved, 0), [progress]);
  const totalCases = useMemo(() => DISTRICTS.reduce((a, d) => a + districtTally({}, d.id).total, 0), []);

  return (
    <SkinProvider district="ashcombe">
      <PageShell title="The Bureau" kicker="Greywick case index" right={<RankChip compact className="hidden sm:flex" />}>
        <GuideBanner />
        <section aria-labelledby="skyline-h">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h2 id="skyline-h" className="fp-display text-(--fp-ink)">
                Greywick after dark
              </h2>
              <p className="mt-2 max-w-xl text-[15px] text-(--fp-muted)">
                Every lit window is a case you closed. Pick a building to open its floor plans.
              </p>
            </div>
            <MonoStat label="Cases closed" value={`${total.toLocaleString()} / ${totalCases.toLocaleString()}`} />
          </div>
          <Skyline progress={progress} selected={selected} onSelect={setSelected} />
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
          <DistrictCard district={sel} progress={progress} />
          <Rail />
        </div>

        <section aria-labelledby="ledger-h" className="mt-10">
          <SectionTitle index={3} id="ledger-h">
            District ledger
          </SectionTitle>
          <Panel className="px-4 sm:px-5">
            <ul className="grid lg:grid-cols-2 lg:gap-x-10">
              {DISTRICTS.map((d) => (
                <LedgerRow key={d.id} district={d} progress={progress} />
              ))}
            </ul>
          </Panel>
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
  const k = phone ? 0.48 : Math.max(0.25, Math.min(1.1, (width - 60) / (SUM_W - OVERLAP * (DISTRICTS.length - 2))));

  const onEnter = (id: string) => (e: PointerEvent) => {
    if (e.pointerType === 'mouse') onSelect(id);
  };
  const onFocus = (id: string) => (e: FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(':focus-visible')) onSelect(id);
  };

  return (
    <figure className="m-0">
      <div ref={ref} className="fp-panel overflow-hidden p-[2px]">
        <div className="overflow-hidden rounded-[6px]" style={{ background: NIGHT_PLATE }}>
          <div
            role="list"
            aria-label="Districts of Greywick"
            className={['no-scrollbar relative flex items-end px-3 pt-6', phone ? 'fp-snap-x overflow-x-auto overflow-y-hidden' : 'justify-center'].join(' ')}
          >
            {NIGHT.map((d, i) => building(d, i))}
            {SUGAR.length > 0 && (
              <div
                role="group"
                aria-label="Sugar Lane"
                className="relative -mr-3 -mt-6 flex shrink-0 items-end self-stretch pl-4 pr-3 pt-9"
                style={{ marginLeft: phone ? 10 : 6, background: DAY_PLATE, boxShadow: 'inset 2px 0 0 var(--fp-ink)' }}
              >
                <span aria-hidden className="absolute left-4 top-2 text-[12px] font-semibold text-(--fp-ink)">
                  Sugar Lane
                </span>
                {SUGAR.map((d, i) => building(d, NIGHT.length + i, i === 0))}
              </div>
            )}
            {phone && <div className="w-3 shrink-0" aria-hidden />}
          </div>
          {/* street */}
          <div aria-hidden className="h-2.5 bg-(--fp-ink)" />
        </div>
      </div>
      <figcaption className="mt-2 text-[12px] font-medium text-(--fp-muted)">
        {phone ? 'Swipe for more buildings. Tap once to select, twice to enter.' : 'Hover or tab to a building to see its file. Click the selected one to enter.'}
      </figcaption>
    </figure>
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
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.025 * i, type: 'spring', stiffness: 420, damping: 30 }}
      >
        <motion.button
          type="button"
          className="group relative block rounded-md pb-9 outline-none"
          aria-label={`${d.name}: ${t.solved} of ${t.total} cases closed`}
          aria-current={active ? 'true' : undefined}
          onPointerEnter={onEnter(d.id)}
          onFocus={onFocus(d.id)}
          onClick={() => (active ? navigate(`/plans/d/${d.id}`) : onSelect(d.id))}
          animate={{ y: active ? -6 : 0 }}
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <FacadeArt district={d} sky={false} fog={false} litFraction={t.total ? t.solved / t.total : 0} height={size.h * k} />
          <span className="absolute inset-x-0 bottom-1.5 flex justify-center">
            <span
              className="inline-flex min-w-7 items-center justify-center rounded-[4px] px-1.5 py-0.5 font-mono text-[12px] font-semibold leading-tight text-(--fp-ink)"
              style={{
                background: active ? 'var(--fp-hl)' : 'var(--fp-panel)',
                boxShadow: active ? 'inset 0 0 0 2px var(--fp-ink), 2px 2px 0 var(--fp-ink)' : 'inset 0 0 0 1.5px var(--fp-ink)',
              }}
            >
              {roman(d.number)}
            </span>
          </span>
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
      <section aria-labelledby="district-h">
        <SectionTitle index={1} id="district-h">
          Selected building
        </SectionTitle>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={d.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <Panel className="overflow-hidden">
              <div className="mx-[2px] mt-[2px] h-2 rounded-t-[6px] border-b-2 border-(--fp-ink)" style={{ background: 'var(--fp-district)' }} aria-hidden />
              <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-6">
                <div className="hidden shrink-0 sm:block">
                  <div
                    className="overflow-hidden rounded-md"
                    style={{ background: 'var(--fp-district-bg)', boxShadow: 'inset 0 0 0 2px var(--fp-ink)', padding: 2 }}
                  >
                    <FacadeArt district={d} fog={false} litFraction={t.total ? t.solved / t.total : 0} height={164} title={`${d.name} facade`} className="block rounded-[4px]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-(--fp-muted)">
                    <Swatch />
                    <span className="text-(--fp-ink)">District {roman(d.number)}</span>
                    <span aria-hidden>·</span>
                    <span>{quarterOf(d.kicker)}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-[clamp(1.6rem,1.15rem+1.7vw,2.4rem)] font-black leading-[1.05] tracking-[-0.02em] text-(--fp-ink)">
                    {d.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-(--fp-muted)">{d.blurb}</p>

                  <dl className="mt-4 grid grid-cols-3 border-y border-(--fp-hair)">
                    {[
                      ['Closed', `${t.solved}/${t.total}`],
                      ['Stars', t.stars],
                      ['Open files', t.inProgress],
                    ].map(([label, value], i) => (
                      <div key={label as string} className={['py-2.5', i ? 'border-l border-(--fp-hair) pl-3 sm:pl-4' : ''].join(' ')}>
                        <dt className="text-[12px] font-semibold text-(--fp-muted)">{label}</dt>
                        <dd className="font-mono text-lg font-semibold tabular-nums text-(--fp-ink)">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-4 flex flex-col gap-2" aria-label="Floors">
                    {TIERS.map((tier) => {
                      const tt = tierTally(progress, d.id, tier);
                      return (
                        <li key={tier} className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.25rem] items-center gap-3">
                          <span className="text-[13px] font-semibold text-(--fp-ink)">{TIER_INFO[tier].name}</span>
                          <ProgressFilament value={tt.total ? tt.solved / tt.total : 0} label={`${TIER_INFO[tier].name} progress`} />
                          <span className="text-right font-mono text-[12px] tabular-nums text-(--fp-muted)">
                            {tt.solved}/{tt.total}
                          </span>
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
      </section>
    </SkinProvider>
  );
}

// ───────────────────────────── rail ─────────────────────────────

function useDaily(): { date: string; info: DailyInfo; districtId: string; tier: DailyInfo['tier'] } {
  const date = useMemo(() => todayISO(), []);
  const info = useMemo(() => dailyInfo(date), [date]);
  return { date, info, districtId: info.districtId, tier: info.tier };
}

const MODE_ROWS = [
  { to: '/plans/blitz', name: 'Blitz', note: '3:00' },
  { to: '/plans/gauntlet', name: 'Gauntlet', note: '7 floors' },
  { to: '/plans/weekly', name: 'Weekly', note: '14×14' },
  { to: '/plans/zen', name: 'Zen', note: 'No clock' },
  { to: '/plans/custom', name: 'Custom & codes', note: 'Builder' },
] as const;

function Rail() {
  const prof = useProfileSafe();
  const daily = useDaily();
  const dd = DISTRICTS.find((d) => d.id === daily.districtId) ?? DISTRICTS[0]!;
  const dateLabel = new Date(`${daily.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <aside className="flex min-w-0 flex-col gap-5" aria-label="Bureau desk">
      <SkinProvider district={dd}>
        <section aria-labelledby="today-h">
          <SectionTitle index={2} id="today-h" aside={<StreakFlame streak={prof.streak} lit={prof.solvedToday} />}>
            Today’s case
          </SectionTitle>
          <Panel className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Plate>{dateLabel}</Plate>
              {prof.solvedToday && <span className="text-[13px] font-semibold text-(--fp-green)">Solved</span>}
            </div>
            <div className="mt-2.5 font-display text-xl font-extrabold leading-snug tracking-[-0.01em] text-(--fp-ink)">{daily.info?.title ?? dd.name}</div>
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-[13px]">
              <dt className="font-semibold text-(--fp-muted)">Building</dt>
              <dd className="flex min-w-0 items-center gap-1.5 font-medium text-(--fp-ink)">
                <Swatch size={11} />
                <span className="truncate">{dd.name}</span>
              </dd>
              <dt className="font-semibold text-(--fp-muted)">Floor</dt>
              <dd className="font-medium text-(--fp-ink)">{TIER_INFO[daily.tier].name}</dd>
              <dt className="font-semibold text-(--fp-muted)">Grid</dt>
              <dd className="font-mono text-(--fp-ink)">{daily.info ? `${daily.info.size}×${daily.info.size}` : '…'}</dd>
              {daily.info && (
                <>
                  <dt className="font-semibold text-(--fp-muted)">Scenario</dt>
                  <dd className="inline-flex items-center gap-1.5 font-medium text-(--fp-ink)">
                    <VariantGlyph variant={daily.info.variant} size={12} /> {VARIANT_INFO[daily.info.variant].name}
                  </dd>
                </>
              )}
            </dl>
            <BrassButton to="/plans/daily" block className="mt-4" icon={<CalendarDays className="size-4" />}>
              {prof.solvedToday ? 'Review today’s file' : 'Open today’s file'}
            </BrassButton>
          </Panel>
        </section>
      </SkinProvider>

      <Panel className="p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-extrabold tracking-[-0.01em] text-(--fp-ink)">After hours</h3>
          <Link to="/plans/modes" className="text-[13px] font-semibold text-(--fp-blue) underline underline-offset-2 hover:text-(--fp-ink)">
            All modes
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-(--fp-hair) border-t border-(--fp-hair)">
          {MODE_ROWS.map((m) => (
            <li key={m.to}>
              <Link to={m.to} className="group flex items-center justify-between gap-3 py-2.5 text-[15px] font-semibold text-(--fp-ink) hover:bg-[color-mix(in_srgb,var(--fp-hl)_40%,transparent)]">
                <span>{m.name}</span>
                <span className="inline-flex items-center gap-2 font-mono text-[12px] font-medium text-(--fp-muted)">
                  {m.note}
                  <ArrowRight className="size-3.5 text-(--fp-ink) transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg font-extrabold tracking-[-0.01em] text-(--fp-ink)">Detective</h3>
          <span className="font-mono text-[12px] tabular-nums text-(--fp-muted)">{prof.xp.toLocaleString()} XP</span>
        </div>
        <RankChip className="w-full max-w-none" />
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
    <li className="border-b border-(--fp-hair) last:border-b-0">
      <SkinProvider district={d}>
        <Link
          to={`/plans/d/${d.id}`}
          className="group -mx-2 grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[4px] px-2 py-3 hover:bg-[color-mix(in_srgb,var(--fp-hl)_40%,transparent)]"
        >
          <span className="font-mono text-[13px] font-semibold text-(--fp-muted)">{roman(d.number)}</span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <Swatch size={12} />
              <span className="truncate font-display text-[15px] font-bold text-(--fp-ink) group-hover:underline">{d.name}</span>
            </span>
            <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-2" label={`${d.name} progress`} />
          </span>
          <span className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[13px] tabular-nums text-(--fp-ink)">
              {t.solved}
              <span className="text-(--fp-muted)">/{t.total}</span>
            </span>
            {t.stars > 0 && <StarRow stars={Math.min(3, Math.round((t.stars / Math.max(1, t.solved * 3)) * 3))} size={10} className="text-(--fp-ink)" />}
          </span>
        </Link>
      </SkinProvider>
    </li>
  );
}

/** First visit: point new players at the practice case (dismissible, never shown again once done). */
function GuideBanner() {
  const [hidden, setHidden] = useState(() => isGuideDone());
  if (hidden) return null;
  return (
    <div className="fp-panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'color-mix(in srgb, var(--fp-hl) 55%, white)' }}>
      <div>
        <div className="font-display text-lg font-extrabold leading-tight">New to floor plans?</div>
        <p className="mt-0.5 text-[15px]">A 2-minute practice case shows you every move, one step at a time.</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <BrassButton to="/plans/guide/practice" size="md">
          Start the practice case
        </BrassButton>
        <GhostButton
          size="md"
          onClick={() => {
            markGuideDone();
            setHidden(true);
          }}
        >
          Not now
        </GhostButton>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Heart } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import { TIERS, VARIANTS_BY_TIER, type Tier } from '@/grid/types';
import { FacadeArt, PageShell, ProgressFilament, SkinProvider, VARIANT_INFO, VariantGlyph, isLightDistrict, useFpReduced } from '@/grid/ui';
import { districtTally, tierTally, useProgressMap, useDistrictAmbience } from '@/grid/ui/bridge';
import { quarterOf, roman, SectionTitle, Swatch } from './shared';

const FLOOR_MARK: Record<Tier, string> = { easy: 'G', medium: '1', hard: '2', extreme: '3', mastermind: 'R' };
const TOP_DOWN: Tier[] = [...TIERS].reverse();

/** /plans/d/:district — the building, five floors stacked ground → roof, with an elevator. */
export default function DistrictScreen() {
  const { district: id } = useParams<{ district: string }>();
  const d = id ? getDistrict(id) : undefined;
  const navigate = useNavigate();
  const reduced = useFpReduced();
  const progress = useProgressMap();
  const [hover, setHover] = useState<Tier | null>(null);
  const [going, setGoing] = useState<Tier | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useDistrictAmbience(d?.ambience ?? null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!d) return <Navigate to="/plans" replace />;

  const t = districtTally(progress, d.id);
  const car: Tier = going ?? hover ?? 'easy';
  const light = isLightDistrict(d);

  const pick = (tier: Tier) => {
    if (going) return;
    setGoing(tier);
    const to = `/plans/d/${d.id}/${tier}`;
    if (reduced) navigate(to);
    else timer.current = window.setTimeout(() => navigate(to), 720);
  };

  return (
    <SkinProvider district={d}>
      <PageShell title={d.name} kicker={d.kicker} back="/plans" backLabel="Back to the Bureau">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
          {/* facade */}
          <section className="min-w-0" aria-label={`${d.name} facade`}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-(--fp-muted)">
              <Swatch />
              <span className="text-(--fp-ink)">District {roman(d.number)}</span>
              <span aria-hidden>·</span>
              <span>{quarterOf(d.kicker)}</span>
            </div>
            <h2 className="fp-display mt-2 text-(--fp-ink)">{d.name}</h2>
            <figure className="m-0 mt-4">
              <div className="fp-panel overflow-hidden p-[2px]">
                <div className="flex justify-center overflow-hidden rounded-[6px]" style={{ background: 'var(--fp-district-bg)' }}>
                  <FacadeArt
                    district={d}
                    litFraction={t.total ? t.solved / t.total : 0}
                    highlightFloor={TIERS.indexOf(car)}
                    height="clamp(180px, 30vh, 520px)"
                    className="block max-w-full"
                    title={`${d.name}: ${t.solved} windows lit`}
                  />
                </div>
              </div>
              <figcaption className="mt-2 text-[12px] font-medium text-(--fp-muted)">
                Each lit window is a closed case. The highlighted floor is the one under the elevator.
              </figcaption>
            </figure>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-(--fp-ink)">{d.blurb}</p>
            <dl className="mt-4 grid grid-cols-3 border-y border-(--fp-hair)">
              {[
                ['Closed', `${t.solved}/${t.total}`],
                ['Stars', t.stars],
                ['Burned', t.burns],
              ].map(([label, value], i) => (
                <div key={label as string} className={['py-2.5', i ? 'border-l border-(--fp-hair) pl-4' : ''].join(' ')}>
                  <dt className="text-[12px] font-semibold text-(--fp-muted)">{label}</dt>
                  <dd className="font-mono text-lg font-semibold tabular-nums text-(--fp-ink)">{value}</dd>
                </div>
              ))}
            </dl>
            <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-4" label="District progress" />
          </section>

          {/* floors */}
          <section aria-labelledby="floors-h" className="min-w-0">
            <SectionTitle
              index={1}
              id="floors-h"
              aside={
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-(--fp-muted)" aria-live="polite">
                  Elevator at
                  <span className="fp-plate">{TIER_INFO[car].name}</span>
                </span>
              }
            >
              Pick a floor
            </SectionTitle>
            <ol className="relative flex flex-col gap-3">
              {/* elevator shaft */}
              <span aria-hidden className="absolute bottom-5 left-[21px] top-5 w-[2px] bg-(--fp-ink) sm:left-[25px]" />
              {TOP_DOWN.map((tier, i) => {
                const info = TIER_INFO[tier];
                const tt = tierTally(progress, d.id, tier);
                const isCar = car === tier;
                const done = tt.total > 0 && tt.solved === tt.total;
                const variants = VARIANTS_BY_TIER[tier];
                return (
                  <motion.li
                    key={tier}
                    initial={reduced ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduced ? 0 : 0.03 * i, type: 'spring', stiffness: 420, damping: 32 }}
                  >
                    <button
                      type="button"
                      onClick={() => pick(tier)}
                      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(tier)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(tier)}
                      onBlur={() => setHover(null)}
                      aria-label={`${info.name}, ${info.floor}: ${tt.solved} of ${tt.total} closed`}
                      className="group grid w-full grid-cols-[44px_minmax(0,1fr)] items-stretch gap-3 text-left outline-none sm:grid-cols-[52px_minmax(0,1fr)]"
                    >
                      {/* shaft stop + car */}
                      <span className="relative flex items-center justify-center">
                        {light ? (
                          <Heart
                            aria-hidden
                            className="relative size-3.5 text-(--fp-ink)"
                            strokeWidth={2}
                            style={{ fill: done ? 'var(--fp-green)' : 'var(--fp-panel)' }}
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="relative size-3 rounded-full"
                            style={{ background: done ? 'var(--fp-green)' : 'var(--fp-panel)', boxShadow: 'inset 0 0 0 2px var(--fp-ink)' }}
                          />
                        )}
                        {isCar && (
                          <motion.span
                            layoutId="elevator-car"
                            aria-hidden
                            className={[
                              'absolute inset-x-0.5 top-1/2 grid h-11 -translate-y-1/2 place-items-center bg-(--fp-hl) font-mono text-sm font-bold text-(--fp-ink) shadow-[inset_0_0_0_2px_var(--fp-ink),2px_2px_0_var(--fp-ink)]',
                              light ? 'rounded-full' : 'rounded-md',
                            ].join(' ')}
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          >
                            {light ? (
                              <span className="flex flex-col items-center leading-none">
                                <Heart className="size-3 fill-current" aria-hidden />
                                <span className="mt-0.5 text-[12px]">{FLOOR_MARK[tier]}</span>
                              </span>
                            ) : (
                              FLOOR_MARK[tier]
                            )}
                          </motion.span>
                        )}
                        {!isCar && (
                          <span
                            aria-hidden
                            className="absolute grid size-6 place-items-center rounded-[4px] bg-(--fp-panel) font-mono text-[12px] font-semibold text-(--fp-ink) opacity-0 shadow-[inset_0_0_0_1.5px_var(--fp-ink)] transition-opacity group-hover:opacity-100"
                          >
                            {FLOOR_MARK[tier]}
                          </span>
                        )}
                      </span>
                      <span
                        className={[
                          'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-3.5 transition-[transform,box-shadow,background-color] duration-100 sm:p-4',
                          'shadow-[inset_0_0_0_2px_var(--fp-ink),3px_3px_0_var(--fp-ink)] group-hover:-translate-x-px group-hover:-translate-y-px group-active:translate-x-[3px] group-active:translate-y-[3px] group-active:shadow-[inset_0_0_0_2px_var(--fp-ink)]',
                          isCar ? 'bg-[color-mix(in_srgb,var(--fp-hl)_45%,white)]' : 'bg-(--fp-panel)',
                        ].join(' ')}
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-baseline gap-x-2.5">
                            <span className="font-display text-lg font-extrabold tracking-[-0.01em] text-(--fp-ink) sm:text-xl">{info.name}</span>
                            <span className="text-[13px] font-semibold text-(--fp-muted)">{info.floor}</span>
                          </span>
                          <span className="mt-0.5 block text-[14px] leading-snug text-(--fp-muted)">{info.blurb}</span>
                          <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-(--fp-muted)">
                            <span className="font-mono">{info.sizes}</span>
                            <span
                              className="inline-flex items-center gap-1.5 text-(--fp-ink)"
                              aria-label={`Scenarios: ${variants.map((v) => VARIANT_INFO[v].name).join(', ')}`}
                            >
                              {variants.map((v) => (
                                <span key={v} title={VARIANT_INFO[v].name}>
                                  <VariantGlyph variant={v} size={14} />
                                </span>
                              ))}
                            </span>
                          </span>
                          <ProgressFilament value={tt.total ? tt.solved / tt.total : 0} className="mt-3" />
                        </span>
                        <span className="flex flex-col items-end gap-1">
                          <span className="font-mono text-sm font-semibold tabular-nums text-(--fp-ink)">
                            {tt.solved}
                            <span className="text-(--fp-muted)">/{tt.total}</span>
                          </span>
                          {tt.inProgress > 0 && <span className="text-[12px] font-medium text-(--fp-muted)">{tt.inProgress} open</span>}
                          <ChevronRight className="mt-1 size-4 text-(--fp-ink) transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ol>
          </section>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

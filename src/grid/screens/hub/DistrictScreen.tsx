import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronsUp, Heart } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import { TIERS, VARIANTS_BY_TIER, type Tier } from '@/grid/types';
import { FacadeArt, MonoStat, PageShell, Panel, Plate, ProgressFilament, SkinProvider, VARIANT_INFO, VariantGlyph, isLightDistrict, useFpReduced } from '@/grid/ui';
import { districtTally, tierTally, useProgressMap, useDistrictAmbience } from '@/grid/ui/bridge';
import { roman } from './shared';

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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
          {/* facade */}
          <section className="min-w-0" aria-label={`${d.name} facade`}>
            <Panel
              tone="inset"
              className="relative flex justify-center overflow-hidden"
              style={{
                background: light
                  ? 'linear-gradient(180deg, color-mix(in srgb, var(--fp-glow) 85%, white), color-mix(in srgb, var(--fp-accent2) 45%, white) 70%, #fff1d6)'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--fp-bg) 70%, black), color-mix(in srgb, var(--fp-panel) 70%, var(--fp-glow) 8%))',
              }}
            >
              <FacadeArt
                district={d}
                litFraction={t.total ? t.solved / t.total : 0}
                highlightFloor={TIERS.indexOf(car)}
                height="clamp(200px, 36vh, 560px)"
                className="max-w-full"
                title={`${d.name} at night — ${t.solved} windows lit`}
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                <Plate>District {roman(d.number)}</Plate>
              </div>
            </Panel>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-(--fp-muted)">{d.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <MonoStat label="Closed" value={`${t.solved}/${t.total}`} />
              <MonoStat label="Stars" value={t.stars} />
              <MonoStat label="Burned" value={t.burns} />
            </div>
            <ProgressFilament value={t.total ? t.solved / t.total : 0} className="mt-4" label="District progress" />
          </section>

          {/* floors */}
          <section aria-labelledby="floors-h" className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="floors-h" className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--fp-muted)">
                Directory · pick a floor
              </h2>
              <span className="fp-plate fp-plate--dark tabular-nums" aria-live="polite">
                <ChevronsUp className="size-3" aria-hidden /> {TIER_INFO[car].name}
              </span>
            </div>
            <ol className="relative flex flex-col gap-2.5">
              {/* elevator shaft */}
              <span
                aria-hidden
                className="absolute bottom-3 left-[22px] top-3 w-px sm:left-[26px]"
                style={{ background: 'linear-gradient(180deg, transparent, var(--fp-hair-strong) 8%, var(--fp-hair-strong) 92%, transparent)' }}
              />
              {TOP_DOWN.map((tier, i) => {
                const info = TIER_INFO[tier];
                const tt = tierTally(progress, d.id, tier);
                const isCar = car === tier;
                const variants = VARIANTS_BY_TIER[tier];
                return (
                  <motion.li
                    key={tier}
                    initial={reduced ? false : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduced ? 0 : 0.05 * i + 0.1, type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <button
                      type="button"
                      onClick={() => pick(tier)}
                      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(tier)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(tier)}
                      onBlur={() => setHover(null)}
                      aria-label={`${info.name}, ${info.floor}: ${tt.solved} of ${tt.total} closed`}
                      className="group grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-stretch gap-3 text-left sm:grid-cols-[52px_minmax(0,1fr)_auto]"
                    >
                      {/* shaft stop + car */}
                      <span className="relative flex items-center justify-center">
                        {light ? (
                          <Heart
                            aria-hidden
                            className="size-3"
                            style={{ color: 'var(--fp-accent)', fill: tt.solved === tt.total ? 'var(--fp-accent)' : 'transparent' }}
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="size-2 rounded-full"
                            style={{ background: tt.solved === tt.total ? 'var(--fp-glow)' : 'var(--fp-hair-strong)' }}
                          />
                        )}
                        {isCar && (
                          <motion.span
                            layoutId="elevator-car"
                            aria-hidden
                            className={[
                              'absolute inset-x-1 top-1/2 grid h-11 -translate-y-1/2 place-items-center font-mono text-sm font-bold',
                              light ? 'rounded-full' : 'rounded-md',
                            ].join(' ')}
                            transition={{ type: 'spring', stiffness: 170, damping: 22 }}
                            style={
                              light
                                ? {
                                    color: '#ffffff',
                                    background: 'linear-gradient(180deg, color-mix(in srgb, var(--fp-accent) 65%, white), var(--fp-accent))',
                                    boxShadow: '0 6px 16px -6px var(--fp-accent), inset 0 1px 0 rgb(255 255 255 / 0.6)',
                                  }
                                : {
                                    color: 'color-mix(in srgb, var(--fp-accent) 25%, #120a04)',
                                    background: 'linear-gradient(180deg, var(--fp-accent2), var(--fp-accent))',
                                    boxShadow: '0 0 18px -4px var(--fp-glow), inset 0 1px 0 rgb(255 255 255 / 0.4)',
                                  }
                            }
                          >
                            {light ? (
                              <span className="flex flex-col items-center leading-none">
                                <Heart className="size-3 fill-current" aria-hidden />
                                <span className="mt-0.5 text-[11px]">{FLOOR_MARK[tier]}</span>
                              </span>
                            ) : (
                              FLOOR_MARK[tier]
                            )}
                          </motion.span>
                        )}
                        {!isCar && (
                          <span aria-hidden className="absolute font-mono text-[11px] text-(--fp-muted) opacity-0 transition-opacity group-hover:opacity-100">
                            {FLOOR_MARK[tier]}
                          </span>
                        )}
                      </span>
                      <Panel
                        tone={isCar ? 'glow' : 'default'}
                        className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3.5 transition-transform group-hover:-translate-x-0.5 sm:p-4"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-display text-lg font-bold text-(--fp-ink) sm:text-xl">{info.name}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--fp-muted)">{info.floor}</span>
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-snug text-(--fp-muted)">{info.blurb}</span>
                          <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-(--fp-muted)">
                            <span className="font-mono">{info.sizes}</span>
                            <span className="inline-flex items-center gap-1.5" aria-label={`Scenarios: ${variants.map((v) => VARIANT_INFO[v].name).join(', ')}`}>
                              {variants.map((v) => (
                                <span key={v} title={VARIANT_INFO[v].name} className="text-(--fp-hi)">
                                  <VariantGlyph variant={v} size={14} />
                                </span>
                              ))}
                            </span>
                          </span>
                          <ProgressFilament value={tt.total ? tt.solved / tt.total : 0} className="mt-3" />
                        </span>
                        <span className="flex flex-col items-end gap-1">
                          <span className="font-mono text-sm font-semibold tabular-nums">
                            {tt.solved}
                            <span className="text-(--fp-muted)">/{tt.total}</span>
                          </span>
                          {tt.inProgress > 0 && <span className="text-[10px] text-(--fp-muted)">{tt.inProgress} open</span>}
                          <ChevronRight className="mt-1 size-4 text-(--fp-muted) transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </Panel>
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

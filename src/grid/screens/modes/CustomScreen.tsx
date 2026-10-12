/**
 * /plans/custom — build a case (district, tier, size 4–14, scenario, seed) or open one by its code.
 * "Open case" generates the plan and goes to /plans/code/<code>.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Check, Dices, FolderOpen, KeyRound, TriangleAlert } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import type { Tier, Variant } from '@/grid/types';
import { BrassButton, PageShell, SkinProvider, VariantGlyph } from '@/grid/ui';
import { codeFor, generateCustom, parseCode } from '../desk/bridge';
import { MiniPlan } from '../desk/ScenarioExplainer';
import { VARIANT_META } from '../desk/util';
import { DistrictPicker, Section, TierPicker } from './shared';

/** Smallest plan on which a scenario makes sense. */
export const VARIANT_MIN_SIZE: Record<Variant, number> = {
  classic: 4,
  lockedRoom: 5,
  poison: 5,
  sniper: 5,
  accomplice: 5,
  liar: 5,
  double: 7,
  accompliceLiar: 8,
  liarDouble: 9,
};
const VARIANTS = Object.keys(VARIANT_MIN_SIZE) as Variant[];
const TIER_DEFAULT_SIZE: Record<Tier, number> = { easy: 5, medium: 6, hard: 8, extreme: 10, mastermind: 12 };

const SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const newSeed = () => Math.floor(Math.random() * 99999) + 1;

export function CustomScreen() {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('ashcombe');
  const [tier, setTier] = useState<Tier>('hard');
  const [size, setSize] = useState(8);
  const [variant, setVariant] = useState<Variant>('classic');
  const [seed, setSeed] = useState(newSeed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const allowed = useMemo(() => VARIANTS.filter((v) => size >= VARIANT_MIN_SIZE[v]), [size]);
  const effectiveVariant: Variant = allowed.includes(variant) ? variant : 'classic';
  const d = getDistrict(district);

  const parsed = useMemo(() => (code.trim() ? parseCode(code.trim()) : null), [code]);

  const open = () => {
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      try {
        const p = generateCustom({ districtId: district, tier, size, variant: effectiveVariant, seed });
        navigate(`/plans/code/${encodeURIComponent(codeFor(p))}`);
      } catch (err) {
        console.error('[custom] generation failed', err);
        setError('The draughtsman could not draw that plan. Try another seed or size.');
        setBusy(false);
      }
    }, 20);
  };

  const openCode = () => {
    if (!parsed) return;
    navigate(`/plans/code/${encodeURIComponent(code.trim())}`);
  };

  const spec: [string, ReactNode][] = [
    ['Building', d?.name ?? 'the Bureau'],
    ['Tier', TIER_INFO[tier].name],
    ['Plan', <span className="font-mono">{size}×{size}</span>],
    ['Scenario', VARIANT_META[effectiveVariant].name],
    ['Seed', <span className="font-mono">{seed}</span>],
  ];

  return (
    <SkinProvider>
      <PageShell title="Custom cases" kicker="Modes · the drafting table" back="/plans/modes" backLabel="Back to modes">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-7 py-2 sm:py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-7">
            <Section n={1} title="Building">
              <DistrictPicker value={district} onChange={setDistrict} />
            </Section>
            <Section n={2} title="Tier">
              <TierPicker
                value={tier}
                onChange={(t) => {
                  setTier(t);
                  setSize(TIER_DEFAULT_SIZE[t]);
                }}
              />
            </Section>
            <Section n={3} title="Plan size" hint={`${size} × ${size} · ${size} people`}>
              <div>
                <input
                  type="range"
                  min={4}
                  max={14}
                  step={1}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  aria-label="Plan size"
                  aria-valuetext={`${size} by ${size}`}
                  className="fpm-range"
                />
                <div className="flex justify-between px-[3px] font-mono text-xs" aria-hidden>
                  {SIZES.map((n) => (
                    <span
                      key={n}
                      className={clsx('flex w-4 flex-col items-center gap-0.5 tabular-nums', n === size ? 'font-bold text-(--fp-ink)' : 'text-(--fp-muted)')}
                    >
                      <span className={clsx('w-px', n === size ? 'h-2 bg-(--fp-ink)' : 'h-1.5 bg-(--fp-muted)')} />
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </Section>
            <Section n={4} title="Scenario" hint={allowed.length < VARIANTS.length ? 'Bigger plans unlock more scenarios' : undefined}>
              <div role="radiogroup" aria-label="Scenario" className="flex flex-wrap gap-2">
                {VARIANTS.map((v) => {
                  const ok = allowed.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      className="fpm-opt"
                      aria-checked={effectiveVariant === v}
                      aria-disabled={!ok}
                      onClick={() => ok && setVariant(v)}
                      title={ok ? VARIANT_META[v].blurb : `Needs a ${VARIANT_MIN_SIZE[v]}×${VARIANT_MIN_SIZE[v]} plan or larger`}
                    >
                      <VariantGlyph variant={v} size={15} />
                      {VARIANT_META[v].name}
                      {!ok && <span className="font-mono text-xs">{VARIANT_MIN_SIZE[v]}+</span>}
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section n={5} title="Seed" hint="Same seed, same plan">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99999}
                  value={seed}
                  onChange={(e) => setSeed(Math.max(1, Math.min(99999, Math.floor(Number(e.target.value) || 1))))}
                  aria-label="Seed"
                  className="fpm-field w-32"
                />
                <button type="button" onClick={() => setSeed(newSeed())} aria-label="Roll a random seed" className="fp-ghost size-10">
                  <Dices className="size-5" />
                </button>
              </div>
            </Section>
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-20 lg:self-start">
            <section className="fp-panel fp-panel--glow p-5" aria-live="polite">
              <p className="text-[13px] font-semibold text-(--fp-muted)">Case file preview</p>
              <h2 className="mt-0.5 font-display text-2xl font-black leading-tight tracking-[-0.02em]">
                {VARIANT_META[effectiveVariant].name} at {d?.name ?? 'the Bureau'}
              </h2>
              <dl className="mt-3 border-t-2 border-(--fp-ink) text-sm">
                {spec.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-(--fp-hair) py-1.5">
                    <dt className="font-semibold text-(--fp-muted)">{k}</dt>
                    <dd className="truncate text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-start gap-3">
                <MiniPlan variant={effectiveVariant} className="w-24 shrink-0" />
                <p className="text-[13px] leading-relaxed text-(--fp-muted)">{VARIANT_META[effectiveVariant].blurb}</p>
              </div>
              <BrassButton block size="lg" className="mt-5" onClick={open} disabled={busy} icon={<FolderOpen className="size-4" />}>
                {busy ? 'Drawing the plan…' : 'Open case'}
              </BrassButton>
              {error && <p className="mt-2 text-[13px] font-semibold text-(--fp-accent2)">{error}</p>}
            </section>

            <section className="fp-panel p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <KeyRound className="size-4" aria-hidden /> Enter a case code
              </h2>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  openCode();
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ASH-H-12"
                  aria-label="Case code"
                  aria-invalid={!!code.trim() && !parsed}
                  spellCheck={false}
                  autoCapitalize="characters"
                  className="fpm-field min-w-0 flex-1 uppercase"
                />
                <BrassButton type="submit" disabled={!parsed}>
                  Open
                </BrassButton>
              </form>
              <p className="mt-2 flex min-h-5 items-center gap-1.5 text-[13px]">
                {code.trim() ? (
                  parsed ? (
                    <>
                      <Check className="size-3.5 text-(--fp-green)" strokeWidth={3} /> <span className="text-(--fp-ink)">{parsed.label}</span>
                    </>
                  ) : (
                    <>
                      <TriangleAlert className="size-3.5 text-(--fp-accent)" />
                      <span className="font-semibold text-(--fp-accent2)">Not a case code we know.</span>
                    </>
                  )
                ) : (
                  <span className="text-(--fp-muted)">
                    Codes look like <span className="font-mono">ASH-H-12</span>, <span className="font-mono">DAILY-20261011</span> or{' '}
                    <span className="font-mono">WEEK-2026W41</span>.
                  </span>
                )}
              </p>
            </section>
          </aside>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

export default CustomScreen;

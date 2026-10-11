/**
 * /plans/custom — build a case (district, tier, size 4–14, scenario, seed) or open one by its code.
 * "Open case" generates the plan and goes to /plans/code/<code>.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Check, Dices, FolderOpen, KeyRound, TriangleAlert } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import type { Tier, Variant } from '@/grid/types';
import { BrassButton, Chip, PageShell, VariantGlyph } from '@/grid/ui';
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

  return (
    <PageShell title="Custom cases" kicker="Modes · the drafting table" back="/plans/modes" backLabel="Back to modes">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Section title="Building">
            <DistrictPicker value={district} onChange={setDistrict} />
          </Section>
          <Section title="Tier">
            <TierPicker
              value={tier}
              onChange={(t) => {
                setTier(t);
                setSize(TIER_DEFAULT_SIZE[t]);
              }}
            />
          </Section>
          <Section title="Plan size" hint={`${size} × ${size} · ${size} people`}>
            <input
              type="range"
              min={4}
              max={14}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label="Plan size"
              aria-valuetext={`${size} by ${size}`}
              className="w-full accent-[var(--fp-accent)]"
            />
            <div className="flex justify-between font-mono text-[10px] text-[var(--fp-muted)]">
              <span>4×4</span>
              <span>9×9</span>
              <span>14×14</span>
            </div>
          </Section>
          <Section title="Scenario" hint={allowed.length < VARIANTS.length ? 'Bigger plans unlock more scenarios' : undefined}>
            <div role="radiogroup" aria-label="Scenario" className="flex flex-wrap gap-2">
              {VARIANTS.map((v) => {
                const ok = allowed.includes(v);
                return (
                  <Chip
                    key={v}
                    role="radio"
                    aria-checked={effectiveVariant === v}
                    aria-disabled={!ok}
                    active={effectiveVariant === v}
                    onClick={() => ok && setVariant(v)}
                    icon={<VariantGlyph variant={v} size={14} />}
                    className={clsx(!ok && 'pointer-events-none opacity-35')}
                    title={ok ? VARIANT_META[v].blurb : `Needs a ${VARIANT_MIN_SIZE[v]}×${VARIANT_MIN_SIZE[v]} plan or larger`}
                  >
                    {VARIANT_META[v].name}
                  </Chip>
                );
              })}
            </div>
          </Section>
          <Section title="Seed">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={99999}
                value={seed}
                onChange={(e) => setSeed(Math.max(1, Math.min(99999, Math.floor(Number(e.target.value) || 1))))}
                aria-label="Seed"
                className="h-10 w-32 rounded-[8px] border border-[var(--fp-hair)] bg-[var(--dk-shade,rgb(0_0_0/0.25))] px-3 font-mono text-[var(--fp-ink)] outline-none focus-visible:border-[var(--fp-accent2)]"
              />
              <button
                type="button"
                onClick={() => setSeed(newSeed())}
                aria-label="Roll a random seed"
                className="fp-ghost grid size-10 place-items-center"
              >
                <Dices className="size-5" />
              </button>
            </div>
          </Section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="fp-panel fp-panel--glow p-5" aria-live="polite">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--fp-muted)]">Case file preview</div>
            <h2 className="mt-1 font-display text-2xl font-black leading-tight">
              {VARIANT_META[effectiveVariant].name} at {d?.name ?? 'the Bureau'}
            </h2>
            <p className="mt-1 text-sm text-[var(--fp-muted)]">
              A {size}×{size} {TIER_INFO[tier].name} plan · seed <span className="font-mono">{seed}</span>
            </p>
            <div className="mt-4 flex items-start gap-3">
              <MiniPlan variant={effectiveVariant} className="w-24 shrink-0" />
              <p className="text-xs leading-relaxed text-[var(--fp-muted)]">{VARIANT_META[effectiveVariant].blurb}</p>
            </div>
            <BrassButton block size="lg" className="mt-5" onClick={open} disabled={busy} icon={<FolderOpen className="size-4" />}>
              {busy ? 'Drawing the plan…' : 'Open case'}
            </BrassButton>
            {error && <p className="mt-2 text-xs text-[var(--fp-danger)]">{error}</p>}
          </section>

          <section className="fp-panel p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <KeyRound className="size-4 text-[var(--dk-accent-text,var(--fp-accent2))]" /> Enter a case code
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
                className="h-10 min-w-0 flex-1 rounded-[8px] border border-[var(--fp-hair)] bg-[var(--dk-shade,rgb(0_0_0/0.25))] px-3 font-mono uppercase text-[var(--fp-ink)] outline-none placeholder:text-[var(--fp-muted)]/60 focus-visible:border-[var(--fp-accent2)]"
              />
              <BrassButton type="submit" disabled={!parsed}>
                Open
              </BrassButton>
            </form>
            <p className="mt-2 flex min-h-5 items-center gap-1.5 text-xs">
              {code.trim() ? (
                parsed ? (
                  <>
                    <Check className="size-3.5 text-[#3fae6a]" /> <span className="text-[var(--fp-ink)]">{parsed.label}</span>
                  </>
                ) : (
                  <>
                    <TriangleAlert className="size-3.5 text-[var(--fp-danger)]" />
                    <span className="text-[var(--fp-danger)]">Not a case code we know.</span>
                  </>
                )
              ) : (
                <span className="text-[var(--fp-muted)]">Codes look like ASH-H-12, DAILY-20261011 or WEEK-2026W41.</span>
              )}
            </p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}

export default CustomScreen;

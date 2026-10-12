/**
 * /plans/zen — pick a district and a tier, get a random case. No timer, no stars, unlimited Otto,
 * and the file never burns: a wrong lever just highlights the first contradiction.
 */
import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { getDistrict, TIER_INFO } from '@/grid/skins/districts';
import { useFloorplan } from '@/grid/store';
import type { Tier } from '@/grid/types';
import { BrassButton, PageShell, SkinProvider } from '@/grid/ui';
import { generatePuzzle } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
import { HEAVY_TIERS } from '../desk/genJob';
import { DeskLoading, DeskMissing, useGeneratedPuzzle } from '../desk/loading';
import { DistrictPicker, Section, TierPicker } from './shared';

export function ZenScreen() {
  const zenSolved = useFloorplan((s) => s.records.zenSolved);
  const [district, setDistrict] = useState('ashcombe');
  const [tier, setTier] = useState<Tier>('medium');
  const [pick, setPick] = useState<{ district: string; tier: Tier; n: number; nonce: number } | null>(null);

  const roll = (d = district, t = tier) => {
    const max = getDistrict(d)?.casesPerTier[t] ?? 30;
    setPick({ district: d, tier: t, n: 1 + Math.floor(Math.random() * max), nonce: Date.now() });
  };

  const gen = useGeneratedPuzzle(
    pick ? `${pick.district}-${pick.tier}-${pick.n}-${pick.nonce}` : null,
    () => (pick ? generatePuzzle(pick.district, pick.tier, pick.n) : null),
    pick && HEAVY_TIERS.has(pick.tier) ? { kind: 'case', districtId: pick.district, tier: pick.tier, n: pick.n } : null,
  );

  if (pick) {
    if (gen.status === 'loading')
      return <DeskLoading district={getDistrict(pick.district)} label="Brewing tea, unrolling a plan…" attic={pick.tier === 'ultra'} />;
    if (gen.status === 'error') return <DeskMissing message={gen.error} back="/plans/zen" backLabel="Back to Zen" />;
    return (
      <CasePlayer
        key={`${gen.puzzle.id}-${pick.nonce}`}
        puzzle={gen.puzzle}
        mode="zen"
        fresh
        record={false}
        burnEnabled={false}
        showTimer={false}
        backTo="/plans/modes"
        backLabel="Leave Zen"
        kicker={`Zen · ${getDistrict(pick.district)?.name ?? ''} · case ${pick.n}`}
        onSolved={() => useFloorplan.getState().recordZen()}
        resultActions={[
          { label: 'Another case', onClick: () => roll(pick.district, pick.tier), primary: true },
          { label: 'Change desk', onClick: () => setPick(null) },
        ]}
      />
    );
  }

  return (
    <SkinProvider>
      <PageShell title="Zen" kicker="Modes · no clock, no fire" back="/plans/modes" backLabel="Back to modes">
        <div className="mx-auto max-w-4xl space-y-7 py-2 sm:py-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(1.6rem,1.2rem+1.5vw,2.2rem)] font-black leading-[1.05] tracking-[-0.02em]">Take your time.</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-(--fp-muted)">
              No timer and no stars. Otto answers as often as you like, and a wrong lever never burns the file. It only points at the
              first contradiction.
            </p>
            {zenSolved > 0 && (
              <p className="mt-3">
                <span className="fp-plate">
                  <span className="font-mono">{zenSolved}</span> {zenSolved === 1 ? 'case' : 'cases'} closed in Zen
                </span>
              </p>
            )}
          </div>
          <Section n={1} title="District">
            <DistrictPicker value={district} onChange={setDistrict} />
          </Section>
          <Section n={2} title="Tier">
            <TierPicker value={tier} onChange={setTier} />
          </Section>
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-(--fp-ink) pt-5">
            <BrassButton size="lg" onClick={() => roll()} icon={<Shuffle className="size-4" />}>
              Open a random case
            </BrassButton>
            <span className="text-sm text-(--fp-muted)">
              {getDistrict(district)?.name} · {TIER_INFO[tier].name}
            </span>
          </div>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

export default ZenScreen;

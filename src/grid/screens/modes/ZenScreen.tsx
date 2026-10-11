/**
 * /plans/zen — pick a district and a tier, get a random case. No timer, no stars, unlimited Otto,
 * and the file never burns: a wrong lever just highlights the first contradiction.
 */
import { useState } from 'react';
import { Feather, Shuffle } from 'lucide-react';
import { getDistrict } from '@/grid/skins/districts';
import { useFloorplan } from '@/grid/store';
import type { Tier } from '@/grid/types';
import { BrassButton, PageShell } from '@/grid/ui';
import { generatePuzzle } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
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

  const gen = useGeneratedPuzzle(pick ? `${pick.district}-${pick.tier}-${pick.n}-${pick.nonce}` : null, () =>
    pick ? generatePuzzle(pick.district, pick.tier, pick.n) : null,
  );

  if (pick) {
    if (gen.status === 'loading') return <DeskLoading district={getDistrict(pick.district)} label="Brewing tea, unrolling a plan…" />;
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
    <PageShell title="Zen" kicker="Modes · no clock, no fire" back="/plans/modes" backLabel="Back to modes">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="fp-panel flex items-start gap-3 p-5">
          <Feather className="mt-1 size-6 shrink-0 text-[var(--dk-accent-text,var(--fp-accent2))]" />
          <div className="text-sm leading-relaxed">
            <p className="font-display text-xl font-bold">Take your time.</p>
            <p className="mt-1 text-[var(--fp-muted)]">
              No timer and no stars. Otto answers as often as you like, and a wrong lever never burns the file — it only points at the
              first contradiction. {zenSolved > 0 && <>You have closed {zenSolved} {zenSolved === 1 ? 'case' : 'cases'} in Zen.</>}
            </p>
          </div>
        </div>
        <Section title="District">
          <DistrictPicker value={district} onChange={setDistrict} />
        </Section>
        <Section title="Tier">
          <TierPicker value={tier} onChange={setTier} />
        </Section>
        <div className="flex flex-wrap gap-2">
          <BrassButton size="lg" onClick={() => roll()} icon={<Shuffle className="size-4" />}>
            Open a random case
          </BrassButton>
        </div>
      </div>
    </PageShell>
  );
}

export default ZenScreen;

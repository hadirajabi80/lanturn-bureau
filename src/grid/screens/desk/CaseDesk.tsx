/** /plans/d/:district/:tier/:n — a catalogue case on the desk. */
import { useParams } from 'react-router-dom';
import { getDistrict } from '@/grid/skins/districts';
import { parseTierParam } from '@/grid/ui';
import { generatePuzzle } from './bridge';
import { CasePlayer } from './CasePlayer';
import { DeskLoading, DeskMissing, useGeneratedPuzzle } from './loading';

export function CaseDesk() {
  const params = useParams<{ district: string; tier: string; n: string }>();
  const district = getDistrict(params.district ?? '');
  const tier = parseTierParam(params.tier);
  const n = Number(params.n);
  const max = district && tier ? district.casesPerTier[tier] : 0;
  const valid = !!district && !!tier && Number.isInteger(n) && n >= 1 && n <= max;
  const key = valid ? `${district.id}-${tier}-${n}` : null;
  const gen = useGeneratedPuzzle(key, () => (valid ? generatePuzzle(district.id, tier, n) : null));

  const rack = district && tier ? `/plans/d/${district.id}/${tier}` : district ? `/plans/d/${district.id}` : '/plans';
  if (!valid) return <DeskMissing message="No such case in the files." back={rack} backLabel="Back to the rack" />;
  if (gen.status === 'loading') return <DeskLoading district={district} />;
  if (gen.status === 'error') return <DeskMissing message={gen.error} back={rack} backLabel="Back to the rack" />;
  return (
    <CasePlayer
      key={gen.puzzle.id}
      puzzle={gen.puzzle}
      mode="case"
      backTo={rack}
      backLabel="Back to the rack"
      nextTo={n < max ? `/plans/d/${district.id}/${tier}/${n + 1}` : null}
    />
  );
}

export default CaseDesk;

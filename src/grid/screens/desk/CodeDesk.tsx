/** /plans/code/:code — open any case by its code (catalogue, daily, weekly or custom). */
import { useParams } from 'react-router-dom';
import type { PlayMode } from '@/grid/types';
import { parseCode } from './bridge';
import { CasePlayer } from './CasePlayer';
import { DeskLoading, DeskMissing, useGeneratedPuzzle } from './loading';

const MODE: Record<'case' | 'daily' | 'weekly' | 'custom', PlayMode> = { case: 'case', daily: 'daily', weekly: 'weekly', custom: 'custom' };

export function CodeDesk() {
  const { code: raw = '' } = useParams<{ code: string }>();
  let code = raw;
  try {
    code = decodeURIComponent(raw).trim();
  } catch {
    /* keep raw */
  }
  const parsed = parseCode(code);
  const gen = useGeneratedPuzzle(parsed ? code.toUpperCase() : null, () => parsed?.puzzle() ?? null);
  if (!parsed) return <DeskMissing message={`"${code}" is not a case code.`} back="/plans/custom" backLabel="Back to custom cases" />;
  if (gen.status === 'loading') return <DeskLoading label={`Pulling file ${code.toUpperCase()}…`} />;
  if (gen.status === 'error') return <DeskMissing message={gen.error} back="/plans/custom" backLabel="Back to custom cases" />;
  return (
    <CasePlayer
      key={gen.puzzle.id}
      puzzle={gen.puzzle}
      mode={MODE[parsed.kind]}
      kicker={`Case code · ${code.toUpperCase()} · ${parsed.label}`}
      backTo="/plans/custom"
      backLabel="Back to custom cases"
    />
  );
}

export default CodeDesk;

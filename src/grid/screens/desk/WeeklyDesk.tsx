/** /plans/weekly — the Weekly Mastermind: one giant liarDouble plan per ISO week. */
import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useFloorplan } from '@/grid/store';
import { weeklyPuzzle } from './bridge';
import { CasePlayer } from './CasePlayer';
import { DeskLoading, DeskMissing, useGeneratedPuzzle } from './loading';
import { formatTime, isoWeek } from './util';

export function WeeklyDesk() {
  const [week] = useState(() => isoWeek());
  const gen = useGeneratedPuzzle(`weekly-${week}`, () => weeklyPuzzle(week));
  const best = useFloorplan((s) => (gen.status === 'ready' ? s.records.weeklyBest[gen.puzzle.id] : undefined));
  if (gen.status === 'loading') return <DeskLoading label="Unrolling the Mastermind plan…" />;
  if (gen.status === 'error') return <DeskMissing message={gen.error} back="/plans/modes" backLabel="Back to modes" />;
  return (
    <CasePlayer
      key={gen.puzzle.id}
      puzzle={gen.puzzle}
      mode="weekly"
      kicker={`Weekly Mastermind · week ${week.slice(5)} of ${week.slice(0, 4)}`}
      backTo="/plans/modes"
      backLabel="Back to modes"
      hud={
        best !== undefined ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--fp-hair)] px-3 py-1 font-mono text-xs text-[var(--dk-accent-text,var(--fp-accent2))] sm:inline-flex" title="Your best this week">
            <Trophy className="size-3.5" /> {formatTime(best)}
          </span>
        ) : null
      }
    />
  );
}

export default WeeklyDesk;

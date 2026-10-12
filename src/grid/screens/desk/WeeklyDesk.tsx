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
          <span className="hidden h-9 items-center gap-1.5 rounded-[6px] border-2 border-[var(--fp-ink)] bg-[var(--fp-panel)] px-2.5 font-mono text-[13px] font-semibold text-[var(--fp-ink)] sm:inline-flex" title="Your best this week">
            <Trophy className="size-3.5" /> {formatTime(best)}
          </span>
        ) : null
      }
    />
  );
}

export default WeeklyDesk;

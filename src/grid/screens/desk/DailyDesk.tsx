/** /plans/daily — today's case (rotating district & tier). */
import { useState } from 'react';
import { dailyPuzzle } from './bridge';
import { CasePlayer } from './CasePlayer';
import { DeskLoading, DeskMissing, useGeneratedPuzzle } from './loading';
import { todayISO } from './util';

export function DailyDesk() {
  const [today] = useState(todayISO);
  const gen = useGeneratedPuzzle(`daily-${today}`, () => dailyPuzzle(today));
  if (gen.status === 'loading') return <DeskLoading label="Fetching today's file…" />;
  if (gen.status === 'error') return <DeskMissing message={gen.error} />;
  const date = new Date(`${today}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <CasePlayer
      key={gen.puzzle.id}
      puzzle={gen.puzzle}
      mode="daily"
      kicker={`Today's case · ${date}`}
      backTo="/plans"
      backLabel="Back to the Bureau"
    />
  );
}

export default DailyDesk;

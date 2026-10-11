import { Unlock } from 'lucide-react';
import type { CaseFile, MiniPuzzle } from '@/data/types';
import { game, type Session } from '@/engine/store';
import { sfx } from '@/engine/audio';
import { fireConfetti } from '@/components/fx';
import { reducedFxNow } from '@/components/ui/useReducedFx';
import { toast } from '@/components/ui/Toast';
import { PuzzleCode } from './PuzzleCode';
import { PuzzleOrder } from './PuzzleOrder';
import { PuzzleGrid } from './PuzzleGrid';
import { announceClue } from './announce';

export interface PuzzleBoardProps {
  caseFile: CaseFile;
  session: Session;
}

export function PuzzleBoard({ caseFile, session }: PuzzleBoardProps) {
  if (caseFile.puzzles.length === 0) {
    return (
      <div className="glass grid place-items-center rounded-2xl p-10 text-center">
        <Unlock className="mb-3 size-10 text-brass" />
        <h3 className="font-display text-2xl font-bold">No locks on this one</h3>
        <p className="mt-1 max-w-md text-paper/65">
          Nothing to decode, nothing to reorder. When the statements stop adding up, head to the Accuse tab.
        </p>
      </div>
    );
  }

  const solvedCount = caseFile.puzzles.filter((p) => session.solvedPuzzles.includes(p.id)).length;

  const solve = (p: MiniPuzzle) => {
    const revealed = game().solvePuzzle(p.id);
    sfx.success();
    if (!reducedFxNow()) fireConfetti('solve');
    const remaining = caseFile.puzzles.length - solvedCount - 1;
    toast(remaining > 0 ? `${remaining} lock${remaining === 1 ? '' : 's'} to go.` : 'Every lock is open. The Accuse tab is live.', 'success', {
      title: `${p.title} — solved`,
    });
    if (revealed) window.setTimeout(() => announceClue(caseFile, revealed), 500);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-paper/60">
        {solvedCount === caseFile.puzzles.length
          ? 'All locks open. Time to name a name.'
          : `Solve every lock to unlock the accusation · ${solvedCount}/${caseFile.puzzles.length} open.`}
      </p>
      {caseFile.puzzles.map((p, i) => {
        const solved = session.solvedPuzzles.includes(p.id);
        const props = { index: i, solved, onSolved: () => solve(p) };
        switch (p.type) {
          case 'code':
            return <PuzzleCode key={p.id} puzzle={p} {...props} />;
          case 'order':
            return <PuzzleOrder key={p.id} puzzle={p} {...props} />;
          case 'grid':
            return <PuzzleGrid key={p.id} puzzle={p} {...props} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

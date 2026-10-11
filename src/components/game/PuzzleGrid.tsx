import { useState } from 'react';
import clsx from 'clsx';
import { Check, CheckCheck, Eraser, X } from 'lucide-react';
import type { GridPuzzle } from '@/data/types';
import { sfx } from '@/engine/audio';
import { Button } from '@/components/ui/Button';
import { PuzzleShell } from './PuzzleShell';
import type { PuzzleProps } from './PuzzleCode';

type Mark = 0 | 1 | 2; // blank, ✓, ✗
const cellKey = (r: string, c: string): string => `${r}\u0000${c}`;

export function PuzzleGrid({ puzzle, index, solved, onSolved }: PuzzleProps<GridPuzzle>) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const markOf = (r: string, c: string): Mark => {
    if (solved) return puzzle.solution[r] === c ? 1 : 2;
    return marks[cellKey(r, c)] ?? 0;
  };

  const cycle = (r: string, c: string) => {
    if (solved) return;
    sfx.blip();
    setFeedback(null);
    setMarks((m) => {
      const k = cellKey(r, c);
      const next = (((m[k] ?? 0) + 1) % 3) as Mark;
      return { ...m, [k]: next };
    });
  };

  const check = () => {
    let malformed = 0;
    let right = 0;
    for (const r of puzzle.rows) {
      const ticks = puzzle.cols.filter((c) => (marks[cellKey(r, c)] ?? 0) === 1);
      if (ticks.length !== 1) malformed++;
      else if (ticks[0] === puzzle.solution[r]) right++;
    }
    if (malformed === 0 && right === puzzle.rows.length) {
      setFeedback(null);
      onSolved();
      return;
    }
    sfx.wrong();
    setShakeKey((k) => k + 1);
    setFeedback(
      malformed > 0
        ? `Each row needs exactly one ✓ — ${malformed} row${malformed === 1 ? '' : 's'} still undecided.`
        : `${right} of ${puzzle.rows.length} placements hold up. The rest won't survive cross-examination.`,
    );
  };

  return (
    <PuzzleShell
      puzzle={puzzle}
      index={index}
      solved={solved}
      feedback={feedback && !solved ? <span className="text-[#ff8a90]">{feedback}</span> : undefined}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(220px,300px)]">
        <div key={shakeKey} className={clsx('min-w-0', shakeKey > 0 && 'animate-shake')}>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white/4">
                  <th className="sticky left-0 z-10 bg-fog px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-paper/40" />
                  {puzzle.cols.map((c) => (
                    <th key={c} className="px-2 py-2 text-center text-xs font-semibold text-brass">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {puzzle.rows.map((r) => (
                  <tr key={r} className="border-t border-white/6">
                    <th scope="row" className="sticky left-0 z-10 max-w-40 bg-fog px-3 py-2 text-left text-xs font-semibold text-paper/85">
                      {r}
                    </th>
                    {puzzle.cols.map((c) => {
                      const m = markOf(r, c);
                      return (
                        <td key={c} className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => cycle(r, c)}
                            disabled={solved}
                            aria-label={`${r} / ${c}: ${m === 1 ? 'yes' : m === 2 ? 'no' : 'unmarked'}`}
                            className={clsx(
                              'mx-auto grid size-10 place-items-center rounded-lg border transition-all',
                              m === 1 && 'border-teal/60 bg-teal/15 text-teal',
                              m === 2 && 'border-crimson/30 bg-crimson/8 text-[#ff8a90]/80',
                              m === 0 && 'border-white/8 bg-ink/40 hover:border-brass/40 hover:bg-brass/5',
                            )}
                          >
                            {m === 1 && <Check className="size-5" strokeWidth={3} />}
                            {m === 2 && <X className="size-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!solved && (
            <p className="mt-2 text-xs text-paper/45">Tap a cell to cycle: blank → ✓ → ✗. Only the ✓ marks are checked.</p>
          )}
        </div>
        <aside className="rounded-xl border border-white/6 bg-ink/40 p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">What we know</div>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-snug text-paper/85">
            {puzzle.clues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        </aside>
      </div>
      {!solved && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" icon={<Eraser className="size-4" />} onClick={() => setMarks({})}>
            Clear
          </Button>
          <Button icon={<CheckCheck className="size-4" />} onClick={check}>
            Check the grid
          </Button>
        </div>
      )}
    </PuzzleShell>
  );
}

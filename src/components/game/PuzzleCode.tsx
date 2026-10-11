import { useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { KeyRound } from 'lucide-react';
import type { CodePuzzle } from '@/data/types';
import { sfx } from '@/engine/audio';
import { Button } from '@/components/ui/Button';
import { PuzzleShell, normalizeAnswer } from './PuzzleShell';

export interface PuzzleProps<P> {
  puzzle: P;
  index: number;
  solved: boolean;
  onSolved: () => void;
}

const MISSES = [
  'The lock stays shut. It looks faintly amused.',
  "Not it. Somewhere, Lucien is smirking.",
  'Wrong. Pip yawns at you.',
  'Nope. Read it again, slower.',
];

export function PuzzleCode({ puzzle, index, solved, onSolved }: PuzzleProps<CodePuzzle>) {
  const [value, setValue] = useState('');
  const [misses, setMisses] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (solved) return;
    const guess = normalizeAnswer(value);
    if (!guess) return;
    if (puzzle.answers.some((a) => normalizeAnswer(a) === guess)) {
      onSolved();
    } else {
      sfx.wrong();
      setMisses((m) => m + 1);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <PuzzleShell
      puzzle={puzzle}
      index={index}
      solved={solved}
      feedback={
        !solved && misses > 0 ? (
          <span className="text-[#ff8a90]">{MISSES[(misses - 1) % MISSES.length]}</span>
        ) : undefined
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-paper/55">{puzzle.inputLabel}</span>
          <div key={shakeKey} className={clsx(shakeKey > 0 && 'animate-shake')}>
            <input
              value={solved ? puzzle.answers[0] ?? value : value}
              onChange={(e) => setValue(e.target.value)}
              disabled={solved}
              autoComplete="off"
              spellCheck={false}
              placeholder="Type your answer…"
              className={clsx(
                'h-12 w-full rounded-xl border bg-ink/70 px-4 font-mono text-base tracking-wide text-paper outline-none transition-colors placeholder:text-paper/25',
                solved
                  ? 'border-teal/50 text-teal'
                  : misses > 0
                    ? 'border-crimson/50 focus:border-crimson'
                    : 'border-white/10 focus:border-brass/70 focus:shadow-glow',
              )}
            />
          </div>
        </label>
        {!solved && (
          <Button type="submit" size="lg" icon={<KeyRound className="size-4" />} disabled={!value.trim()}>
            Try it
          </Button>
        )}
      </form>
    </PuzzleShell>
  );
}

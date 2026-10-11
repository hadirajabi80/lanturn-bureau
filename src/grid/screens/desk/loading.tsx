/** Deferred puzzle generation (big plans take a moment) + loading / missing-case screens. */
import { useEffect, useState } from 'react';
import { DISTRICTS } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import type { Puzzle } from '@/grid/types';
import { LanternLoader, PageShell } from '@/grid/ui';
import { DeskFrame } from './parts';

export type GenState = { status: 'loading' } | { status: 'ready'; puzzle: Puzzle } | { status: 'error'; error: string };

/** Generates `make()` after the first paint (so the lantern shows), re-running when `key` changes. */
export function useGeneratedPuzzle(key: string | null, make: () => Puzzle | null): GenState {
  const [state, setState] = useState<{ key: string | null; gen: GenState }>({ key, gen: { status: 'loading' } });
  const current = state.key === key ? state.gen : ({ status: 'loading' } as GenState);
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      let gen: GenState;
      try {
        const p = key === null ? null : make();
        gen = p ? { status: 'ready', puzzle: p } : { status: 'error', error: 'No such case in the files.' };
      } catch (err) {
        console.error('[desk] puzzle generation failed', err);
        gen = { status: 'error', error: 'This file is missing pages.' };
      }
      if (alive) setState({ key, gen });
    }, 16);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
    // `make` is derived from `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return current;
}

export function DeskLoading({ district = DISTRICTS[0]!, label }: { district?: District; label?: string }) {
  return (
    <DeskFrame district={district}>
      <div className="grid min-h-dvh place-items-center">
        <LanternLoader label={label ?? 'Unrolling the plan…'} />
      </div>
    </DeskFrame>
  );
}

export function DeskMissing({ message, back = '/plans', backLabel = 'Back to the Bureau' }: { message: string; back?: string; backLabel?: string }) {
  return (
    <PageShell title="Case not found" kicker="The archive" back={back} backLabel={backLabel}>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-display text-2xl font-bold">{message}</p>
        <p className="mt-2 text-sm text-[var(--fp-muted)]">The clerk shrugs. Try another key tag or case code.</p>
      </div>
    </PageShell>
  );
}

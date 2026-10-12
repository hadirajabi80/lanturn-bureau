/** Deferred puzzle generation (big plans take a moment) + loading / missing-case screens. */
import { useEffect, useState } from 'react';
import { DISTRICTS } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import type { Puzzle } from '@/grid/types';
import { LanternLoader, PageShell, SkullKeyGlyph } from '@/grid/ui';
import { runGenJob, type GenJob } from './genJob';
import { DeskFrame } from './parts';

export type GenState = { status: 'loading' } | { status: 'ready'; puzzle: Puzzle } | { status: 'error'; error: string };

/**
 * Generates the puzzle after the first paint (so the lantern shows), re-running when `key` changes.
 * With a `job` (big plans: Chief, Mastermind, Extra Extreme) the work runs in a module worker so the page never
 * freezes; if workers are unavailable or fail, it falls back to `make()` on the main thread, after two frames.
 */
export function useGeneratedPuzzle(key: string | null, make: () => Puzzle | null, job?: GenJob | null): GenState {
  const [state, setState] = useState<{ key: string | null; gen: GenState }>({ key, gen: { status: 'loading' } });
  const current = state.key === key ? state.gen : ({ status: 'loading' } as GenState);
  useEffect(() => {
    let alive = true;
    let raf = 0;
    let t: number | undefined;
    const onMain = () => {
      // two frames: the loader is painted before the (blocking) generation starts
      raf = window.requestAnimationFrame(() => {
        raf = window.requestAnimationFrame(() => {
          t = window.setTimeout(() => {
            let gen: GenState;
            try {
              const p = key === null ? null : make();
              gen = p ? { status: 'ready', puzzle: p } : { status: 'error', error: 'No such case in the files.' };
            } catch (err) {
              console.error('[desk] puzzle generation failed', err);
              gen = { status: 'error', error: 'This file is missing pages.' };
            }
            if (alive) setState({ key, gen });
          }, 0);
        });
      });
    };
    if (key !== null && job) {
      runGenJob(job).then(
        (puzzle) => {
          if (alive) setState({ key, gen: { status: 'ready', puzzle } });
        },
        (err: unknown) => {
          if (!alive) return;
          if (err instanceof Error && err.message !== 'no worker' && err.message !== 'worker error') console.warn('[desk] worker generation failed, retrying on the main thread', err);
          onMain();
        },
      );
    } else onMain();
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
    // `make` is derived from `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return current;
}

export function DeskLoading({ district = DISTRICTS[0]!, label, attic }: { district?: District; label?: string; attic?: boolean }) {
  return (
    <DeskFrame district={district}>
      <div className="grid min-h-dvh place-items-center">
        {attic ? (
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <span
              aria-hidden
              className="fp-attic grid size-12 place-items-center rounded-lg text-(--attic-red-ink) shadow-[inset_0_0_0_2px_var(--fp-ink),3px_3px_0_var(--fp-ink)]"
            >
              <SkullKeyGlyph size={28} />
            </span>
            <LanternLoader label={label ?? 'Unsealing the attic…'} tall={false} />
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-(--attic-red)">No coordinates · read the room</p>
          </div>
        ) : (
          <LanternLoader label={label ?? 'Unrolling the plan…'} />
        )}
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

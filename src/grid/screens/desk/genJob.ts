/**
 * Off-main-thread puzzle generation (see gen.worker.ts). `runGenJob` posts a job to a shared module worker and
 * resolves with the puzzle; it rejects when workers are unavailable so callers can fall back to the main thread.
 */
import type { Puzzle, Tier } from '@/grid/types';
import type { CustomOpts } from './bridge';

export type GenJob = { kind: 'case'; districtId: string; tier: Tier; n: number } | { kind: 'custom'; opts: CustomOpts };

/** Tiers whose plans are big enough to be worth a worker round-trip. */
export const HEAVY_TIERS: ReadonlySet<Tier> = new Set<Tier>(['extreme', 'mastermind', 'ultra']);

type Pending = { resolve: (p: Puzzle) => void; reject: (e: Error) => void };

let worker: Worker | null | undefined;
let seq = 0;
const pending = new Map<number, Pending>();

function failAll(err: Error) {
  for (const p of pending.values()) p.reject(err);
  pending.clear();
}

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof Worker === 'undefined') return (worker = null);
    const w = new Worker(new URL('./gen.worker.ts', import.meta.url), { type: 'module', name: 'puzzle-gen' });
    w.onmessage = (e: MessageEvent<{ id: number; puzzle?: Puzzle; error?: string }>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.puzzle) p.resolve(e.data.puzzle);
      else p.reject(new Error(e.data.error ?? 'generation failed'));
    };
    w.onerror = (e) => {
      // a worker that cannot even load (old browser, CSP) is retired; callers fall back to the main thread
      e.preventDefault?.();
      worker = null;
      failAll(new Error('worker error'));
      w.terminate();
    };
    worker = w;
  } catch {
    worker = null;
  }
  return worker;
}

export function runGenJob(job: GenJob): Promise<Puzzle> {
  const w = getWorker();
  if (!w) return Promise.reject(new Error('no worker'));
  const id = ++seq;
  return new Promise<Puzzle>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    try {
      w.postMessage({ id, job });
    } catch (err) {
      pending.delete(id);
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

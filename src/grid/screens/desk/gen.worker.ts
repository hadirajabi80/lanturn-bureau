/**
 * Puzzle generation off the main thread. Big plans (Extra Extreme 12×12 can take ~1.5 s) are generated here so
 * the lantern loader keeps animating and the page never freezes. The engine is pure and seeded, so the result
 * is identical to a main-thread call. Protocol: { id, job } → { id, puzzle } | { id, error }.
 */
import * as Engine from '@/grid/engine';
import type { Puzzle, Tier } from '@/grid/types';
import type { CustomOpts } from './bridge';
import type { GenJob } from './genJob';

const E = Engine as unknown as {
  generatePuzzle(districtId: string, tier: Tier, index: number): Puzzle;
  generateCustom?(opts: CustomOpts): Puzzle;
};

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<{ id: number; job: GenJob }>) => void) | null;
  postMessage: (msg: unknown) => void;
};

ctx.onmessage = (e) => {
  const { id, job } = e.data;
  try {
    let puzzle: Puzzle;
    if (job.kind === 'case') puzzle = E.generatePuzzle(job.districtId, job.tier, job.n);
    else if (E.generateCustom) puzzle = E.generateCustom(job.opts);
    else throw new Error('generateCustom unavailable');
    ctx.postMessage({ id, puzzle });
  } catch (err) {
    ctx.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};

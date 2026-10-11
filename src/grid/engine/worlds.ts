/**
 * Solver "worlds" for a puzzle: the clue set + the variant rule as solver
 * problems. Non-liar variants have one world. Liar variants have one world per
 * liar hypothesis L (every suspect): L's sentences are all false, everybody
 * else's are true, and L is the killer (or accomplice). A valid case has
 * exactly one solution summed over all worlds.
 */
import type { Cell, Clue, Puzzle } from '../types';
import { indexCell } from './geometry';
import { makePuzzleCtx } from './predicates';
import type { RuleSpec } from './rules';
import { baseRuleItems, hypothesisItems, isLiarVariant, liarCandidates, negatePred } from './rules';
import type { DeduceStatus, Domains, Problem, ProblemItem } from './solver';
import { deduce, makeProblem, search } from './solver';

export function ruleSpecOf(p: Puzzle): RuleSpec {
  const ctx = makePuzzleCtx(p);
  const ids = p.victimIds?.length ? p.victimIds : p.people.filter((x) => x.isVictim).map((x) => x.id);
  return {
    variant: p.variant ?? 'classic',
    victims: ids.map((id) => ctx.personIndex.get(id) ?? -1).filter((i) => i >= 0),
    poisonKind: p.poisonKind,
  };
}

export interface World {
  /** person index of the hypothetical liar, or null (non-liar variant) */
  liar: number | null;
  prob: Problem;
  act: Uint8Array;
}

/** The solver worlds of a puzzle for a clue list (default: the puzzle's own clues). */
export function puzzleWorlds(p: Puzzle, clues: Clue[] = p.clues): World[] {
  const ctx = makePuzzleCtx(p);
  const spec = ruleSpecOf(p);
  const base = baseRuleItems(ctx, spec);
  const own = clues
    .map((cl) => ({ owner: ctx.personIndex.get(cl.personId) ?? -1, pred: cl.predicate }))
    .filter((x) => x.owner >= 0);
  const mk = (items: ProblemItem[], liar: number | null): World => {
    const prob = makeProblem(ctx, items);
    return { liar, prob, act: new Uint8Array(prob.clues.length).fill(1) };
  };
  if (!isLiarVariant(spec.variant)) return [mk([...own, ...base], null)];
  return liarCandidates(ctx.personIds.length, spec).map((L) => mk([
    ...own.map((x) => (x.owner === L ? { owner: L, pred: negatePred(x.pred) } : x)),
    ...base,
    ...hypothesisItems(ctx, spec, L),
  ], L));
}

/**
 * Count placements satisfying the clues and the variant rule (summed over
 * liar hypotheses), early exit at `limit`. `liarId` = the hypothesis of the
 * first solution (liar variants only).
 */
export function countSolutions(
  puzzle: Puzzle,
  clues: Clue[] = puzzle.clues,
  limit = 2,
): { count: number; first?: Record<string, Cell>; liarId?: string } {
  const ctx = makePuzzleCtx(puzzle);
  let count = 0;
  let firstPos: Int16Array | undefined;
  let liar: number | null = null;
  for (const w of puzzleWorlds(puzzle, clues)) {
    const sols = search(w.prob, w.act, limit - count);
    if (sols.length && !firstPos) { firstPos = sols[0]; liar = w.liar; }
    count += sols.length;
    if (count >= limit) break;
  }
  if (!firstPos) return { count: 0 };
  const fp = firstPos;
  const first: Record<string, Cell> = {};
  ctx.personIds.forEach((id, i) => { first[id] = indexCell(ctx.grid.cols, fp[i] as number); });
  return liar === null ? { count, first } : { count, first, liarId: ctx.personIds[liar] };
}

/**
 * Human-style deduction (propagation + what-if probing on people with ≤
 * `probeMax` cells) in every world. A fair case has exactly one 'solved' world
 * and every other world ends in 'contradiction'.
 */
export function deduceWorlds(p: Puzzle, probeMax = 3, clues: Clue[] = p.clues): { liar: string | null; status: DeduceStatus; D: Domains }[] {
  const ctx = makePuzzleCtx(p);
  return puzzleWorlds(p, clues).map((w) => {
    const r = deduce(w.prob, w.act, probeMax);
    return { liar: w.liar === null ? null : (ctx.personIds[w.liar] as string), status: r.status, D: r.D };
  });
}

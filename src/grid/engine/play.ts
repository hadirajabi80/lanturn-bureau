/**
 * Play-time API used by the case screen: validating a placement, naming the
 * killer, and computing assist / hint candidate cells.
 */
import type { Cell, Predicate, Puzzle } from '../types';
import { cellIndex, indexCell } from './geometry';
import { killerIndex } from './killer';
import { compilePredicate, makePuzzleCtx, toPositions } from './predicates';

/**
 * Placeholder predicate attached to the victim's killer-rule sentence. It is a
 * tautology ("in a corner or not in a corner") so it never constrains anything.
 */
export const KILLER_RULE_PREDICATE: Predicate = {
  type: 'or',
  a: { type: 'corner', value: true },
  b: { type: 'corner', value: false },
};

/** True for the victim's killer-rule sentence (no positional meaning). */
export function isKillerRuleClue(puzzle: Puzzle, clueIndex: number): boolean {
  const cl = puzzle.clues[clueIndex];
  if (!cl) return false;
  const pr = cl.predicate; // structural check: survives JSON round-trips
  return pr.type === 'or' && pr.a.type === 'corner' && pr.b.type === 'corner' && pr.a.value !== pr.b.value;
}

/**
 * Check the current placements against every clue.
 *  - `violations`: clues that are definitely false (clueIndex = index in
 *    `puzzle.clues`). Clues that cannot be decided yet are not reported.
 *    Structural problems (two people on one cell, someone on blocking
 *    furniture, off-grid) are reported with clueIndex -1.
 *  - `ok`: everyone is placed and nothing is violated (⇔ the unique solution).
 */
export function checkPlacement(
  p: Puzzle,
  placements: Record<string, Cell | null>,
): { ok: boolean; violations: { personId: string; clueIndex: number }[] } {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const violations: { personId: string; clueIndex: number }[] = [];
  const seen = new Map<number, string>();
  let allPlaced = true;
  for (const person of p.people) {
    const c = placements[person.id];
    if (!c) { allPlaced = false; continue; }
    if (c.r < 0 || c.c < 0 || c.r >= p.rows || c.c >= p.cols) {
      violations.push({ personId: person.id, clueIndex: -1 });
      continue;
    }
    const i = cellIndex(p.cols, c);
    if (g.blocked[i]) violations.push({ personId: person.id, clueIndex: -1 });
    const other = seen.get(i);
    if (other !== undefined) violations.push({ personId: person.id, clueIndex: -1 });
    else seen.set(i, person.id);
  }
  const pos = toPositions(ctx, placements);
  p.clues.forEach((cl, ci) => {
    const self = ctx.personIndex.get(cl.personId);
    if (self === undefined) return;
    if (compilePredicate(cl.predicate, self, ctx)(pos) === 0) violations.push({ personId: cl.personId, clueIndex: ci });
  });
  return { ok: allPlaced && violations.length === 0, violations };
}

/** The unique person matching the killer rule, or null (someone unplaced / no unique match). */
export function killerFor(p: Puzzle, placements: Record<string, Cell>): string | null {
  const ctx = makePuzzleCtx(p);
  const victim = p.people.findIndex((x) => x.isVictim);
  if (victim < 0) return null;
  const k = killerIndex(ctx.grid, p.killerRule, toPositions(ctx, placements), victim);
  return k >= 0 ? (ctx.personIds[k] ?? null) : null;
}

/**
 * Cells where `personId` could stand without contradicting any of their own
 * clues, given everyone else's current placements (free, unblocked cells only).
 */
export function candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell | null>): Cell[] {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const self = ctx.personIndex.get(personId);
  if (self === undefined) return [];
  const fs = p.clues.filter((cl) => cl.personId === personId).map((cl) => compilePredicate(cl.predicate, self, ctx));
  const pos = toPositions(ctx, placements);
  pos[self] = -1;
  const occ = new Set<number>();
  for (let q = 0; q < pos.length; q++) if (q !== self && (pos[q] as number) >= 0) occ.add(pos[q] as number);
  const out: Cell[] = [];
  for (const c of g.free) {
    if (occ.has(c)) continue;
    pos[self] = c;
    if (fs.every((f) => f(pos) !== 0)) out.push(indexCell(g.cols, c));
  }
  return out;
}

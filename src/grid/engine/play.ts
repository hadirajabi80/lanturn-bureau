/**
 * Play-time API used by the case screen: validating a placement, naming the
 * killer, and computing assist / hint candidate cells.
 *
 * Board rule (always on): exactly one person per row and per column.
 */
import type { Cell, KillerRule, Predicate, Puzzle } from '../types';
import { cellIndex, indexCell } from './geometry';
import { killerIndex } from './killer';
import { compilePredicate, makePuzzleCtx, toPositions } from './predicates';

/**
 * Tautology ("in a corner or not in a corner") — the placeholder predicate for
 * killer rules that carry no positional meaning. Kept for compatibility; the
 * generator only emits `aloneWithVictim`, whose sentence is backed by
 * {@link killerRulePredicate}.
 */
export const KILLER_RULE_PREDICATE: Predicate = {
  type: 'or',
  a: { type: 'corner', value: true },
  b: { type: 'corner', value: false },
};

/**
 * The predicate attached to the victim's killer-rule sentence. "{He} was alone
 * with the killer" means the victim's room holds exactly two people — a real
 * constraint the player (and the solver) use.
 */
export function killerRulePredicate(rule: KillerRule): Predicate {
  return rule.type === 'aloneWithVictim' ? { type: 'roomCount', cmp: 'exactly', n: 2 } : KILLER_RULE_PREDICATE;
}

/** True for the victim's killer-rule sentence (always the victim's first clue). */
export function isKillerRuleClue(puzzle: Puzzle, clueIndex: number): boolean {
  const cl = puzzle.clues[clueIndex];
  if (!cl) return false;
  const victim = puzzle.people.find((x) => x.isVictim);
  if (!victim || cl.personId !== victim.id) return false;
  return puzzle.clues.findIndex((x) => x.personId === victim.id) === clueIndex;
}

/**
 * Check the current placements against every clue.
 *  - `violations`: clues that are definitely false (clueIndex = index in
 *    `puzzle.clues`). Clues that cannot be decided yet are not reported.
 *    Structural problems (two people on one cell or in one row/column,
 *    someone on blocking furniture, off-grid) are reported with clueIndex -1.
 *  - `ok`: everyone is placed and nothing is violated (⇔ the unique solution).
 */
export function checkPlacement(
  p: Puzzle,
  placements: Record<string, Cell | null>,
): { ok: boolean; violations: { personId: string; clueIndex: number }[] } {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const violations: { personId: string; clueIndex: number }[] = [];
  const structural = new Set<string>();
  const flag = (id: string): void => {
    if (structural.has(id)) return;
    structural.add(id);
    violations.push({ personId: id, clueIndex: -1 });
  };
  const byRow = new Map<number, string>();
  const byCol = new Map<number, string>();
  let allPlaced = true;
  for (const person of p.people) {
    const c = placements[person.id];
    if (!c) { allPlaced = false; continue; }
    if (c.r < 0 || c.c < 0 || c.r >= p.rows || c.c >= p.cols) { flag(person.id); continue; }
    if (g.blocked[cellIndex(p.cols, c)]) flag(person.id);
    // same cell ⇒ same row, so this also catches two people on one cell
    const rowMate = byRow.get(c.r);
    if (rowMate !== undefined) { flag(rowMate); flag(person.id); } else byRow.set(c.r, person.id);
    const colMate = byCol.get(c.c);
    if (colMate !== undefined) { flag(colMate); flag(person.id); } else byCol.set(c.c, person.id);
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
 * clues, given everyone else's current placements: free (unblocked) cells,
 * outside every row and column already used by another placed person.
 */
export function candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell | null>): Cell[] {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const self = ctx.personIndex.get(personId);
  if (self === undefined) return [];
  const fs = p.clues.filter((cl) => cl.personId === personId).map((cl) => compilePredicate(cl.predicate, self, ctx));
  const pos = toPositions(ctx, placements);
  pos[self] = -1;
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  for (let q = 0; q < pos.length; q++) {
    const cq = pos[q] as number;
    if (q === self || cq < 0) continue;
    usedRows.add(Math.floor(cq / g.cols));
    usedCols.add(cq % g.cols);
  }
  const out: Cell[] = [];
  for (const c of g.free) {
    if (usedRows.has(Math.floor(c / g.cols)) || usedCols.has(c % g.cols)) continue;
    pos[self] = c;
    if (fs.every((f) => f(pos) !== 0)) out.push(indexCell(g.cols, c));
  }
  return out;
}

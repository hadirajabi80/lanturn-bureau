/**
 * Play-time API used by the case desk: validating a placement, naming the
 * culprits, judging an accusation and computing assist / hint candidate cells.
 *
 * Board rule (always on): exactly one person per row and per column — but the
 * desk never blocks a move, so every function here accepts any placement
 * (collisions included) and never throws.
 */
import type { Cell, KillerRule, Predicate, Puzzle } from '../types';
import { cellIndex, indexCell } from './geometry';
import { compilePredicate, makePuzzleCtx, toPositions } from './predicates';
import type { RuleSpec } from './rules';
import { baseRuleItems, culpritsFromPos, hypothesisItems, isAccompliceVariant, isDoubleVariant, isLiarVariant, liarCandidates } from './rules';
import { compileItem } from './solver';

/**
 * Tautology ("in a corner or not in a corner") — the placeholder predicate for
 * rule sentences that carry no positional meaning of their own (sniper).
 */
export const KILLER_RULE_PREDICATE: Predicate = {
  type: 'or',
  a: { type: 'corner', value: true },
  b: { type: 'corner', value: false },
};

/**
 * The predicate attached to a classic victim's rule sentence. "{He} was alone
 * with the killer" means the victim's room holds exactly two people.
 */
export function killerRulePredicate(rule: KillerRule): Predicate {
  return rule.type === 'aloneWithVictim' ? { type: 'roomCount', cmp: 'exactly', n: 2 } : KILLER_RULE_PREDICATE;
}

const victimIdsOf = (p: Puzzle): string[] =>
  p.victimIds?.length ? p.victimIds : p.people.filter((x) => x.isVictim).map((x) => x.id);

/** True for a victim's rule sentence (always that victim's first clue). */
export function isKillerRuleClue(puzzle: Puzzle, clueIndex: number): boolean {
  const cl = puzzle.clues[clueIndex];
  if (!cl) return false;
  if (!victimIdsOf(puzzle).includes(cl.personId)) return false;
  return puzzle.clues.findIndex((x) => x.personId === cl.personId) === clueIndex;
}

/** Index of a victim's rule sentence in `puzzle.clues` (first victim by default), or -1. */
export function ruleClueIndex(puzzle: Puzzle, victimId?: string): number {
  const v = victimId ?? victimIdsOf(puzzle)[0];
  return puzzle.clues.findIndex((x) => x.personId === v);
}

function specOf(p: Puzzle): RuleSpec {
  const ctx = makePuzzleCtx(p);
  return {
    variant: p.variant ?? 'classic',
    victims: victimIdsOf(p).map((id) => ctx.personIndex.get(id) ?? -1).filter((i) => i >= 0),
    poisonKind: p.poisonKind,
  };
}

/**
 * Check the current placements against every clue and the scenario rule.
 *  - `violations`: clues that are definitely false (clueIndex = index in
 *    `puzzle.clues`; a broken scenario rule is reported on the victim's rule
 *    sentence). Clues that cannot be decided yet are not reported. Structural
 *    problems (two people on one cell or in one row/column, someone on blocking
 *    furniture, off-grid) are reported with clueIndex -1.
 *  - Liar scenarios: the placement is judged under the most favourable "X is
 *    the liar" reading (X's sentences must all be false, X must be the killer /
 *    accomplice), so violations never reveal who lies.
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
  const valid: Record<string, Cell | null> = {};
  let allPlaced = true;
  for (const person of p.people) {
    const c = placements[person.id];
    valid[person.id] = null;
    if (!c) { allPlaced = false; continue; }
    if (!Number.isInteger(c.r) || !Number.isInteger(c.c) || c.r < 0 || c.c < 0 || c.r >= p.rows || c.c >= p.cols) {
      flag(person.id);
      continue;
    }
    valid[person.id] = c;
    if (g.blocked[cellIndex(p.cols, c)]) flag(person.id);
    // same cell ⇒ same row, so this also catches two people on one cell
    const rowMate = byRow.get(c.r);
    if (rowMate !== undefined) { flag(rowMate); flag(person.id); } else byRow.set(c.r, person.id);
    const colMate = byCol.get(c.c);
    if (colMate !== undefined) { flag(colMate); flag(person.id); } else byCol.set(c.c, person.id);
  }
  const pos = toPositions(ctx, valid);
  const spec = specOf(p);
  const ruleAt = ruleClueIndex(p);
  const ruleOwner = p.clues[ruleAt]?.personId ?? '';

  // the scenario rule itself (truthful part)
  for (const it of baseRuleItems(ctx, spec)) {
    if (compileItem(ctx, it).f(pos) === 0) {
      const vid = ctx.personIds[it.owner] as string;
      const at = ruleClueIndex(p, vid);
      violations.push({ personId: at >= 0 ? vid : ruleOwner, clueIndex: at >= 0 ? at : ruleAt });
    }
  }

  const compiled = p.clues.map((cl) => {
    const self = ctx.personIndex.get(cl.personId);
    return self === undefined ? null : { self, f: compilePredicate(cl.predicate, self, ctx) };
  });
  const clueViolations = (liar: number): { personId: string; clueIndex: number }[] => {
    const out: { personId: string; clueIndex: number }[] = [];
    compiled.forEach((c, ci) => {
      if (!c) return;
      const v = c.f(pos);
      if (c.self === liar ? v === 1 : v === 0) out.push({ personId: (p.clues[ci] as { personId: string }).personId, clueIndex: ci });
    });
    return out;
  };

  if (!isLiarVariant(spec.variant)) violations.push(...clueViolations(-1));
  else {
    let best: { personId: string; clueIndex: number }[] | null = null;
    for (const L of liarCandidates(ctx.personIds.length, spec)) {
      const vs = clueViolations(L);
      for (const it of hypothesisItems(ctx, spec, L)) {
        if (compileItem(ctx, it).f(pos) === 0) vs.push({ personId: ruleOwner, clueIndex: ruleAt });
      }
      if (!best || vs.length < best.length) best = vs;
      if (!vs.length) break;
    }
    violations.push(...(best ?? []));
  }
  const seen = new Set<string>();
  const uniq = violations.filter((v) => {
    const k = `${v.personId}|${v.clueIndex}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { ok: allPlaced && uniq.length === 0, violations: uniq };
}

export interface CulpritNames {
  /** killers[i] killed victims[i] */
  killers: string[];
  victims: string[];
  accomplice?: string;
}

/** The people the scenario rule names for a full placement, or null (someone unplaced / rule shape not met). */
export function culpritsFor(p: Puzzle, placements: Record<string, Cell | null>): CulpritNames | null {
  const ctx = makePuzzleCtx(p);
  const spec = specOf(p);
  const valid: Record<string, Cell | null> = {};
  for (const person of p.people) {
    const c = placements[person.id];
    valid[person.id] = c && c.r >= 0 && c.c >= 0 && c.r < p.rows && c.c < p.cols ? c : null;
  }
  const cul = culpritsFromPos(ctx, spec, toPositions(ctx, valid));
  if (!cul) return null;
  const id = (i: number): string => ctx.personIds[i] as string;
  const out: CulpritNames = { killers: cul.killers.map(id), victims: spec.victims.map(id) };
  if (cul.accomplice >= 0) out.accomplice = id(cul.accomplice);
  return out;
}

/** The (primary) killer named by the scenario rule, or null. */
export function killerFor(p: Puzzle, placements: Record<string, Cell | null>): string | null {
  return culpritsFor(p, placements)?.killers[0] ?? null;
}

/**
 * Judge an accusation (brief §4):
 *  - every variant: `killers` must be exactly the killer set (order free);
 *  - accomplice variants: `accomplice` must be the accomplice;
 *  - double variants: when `pairs` (victimId → killerId) is given it must match.
 */
export function checkAccusation(
  p: Puzzle,
  accusation: { killers: string[]; accomplice?: string; pairs?: Record<string, string> },
): boolean {
  const variant = p.variant ?? 'classic';
  const killers = p.killerIds?.length ? p.killerIds : [p.killerId];
  const given = [...new Set(accusation.killers ?? [])];
  if (given.length !== killers.length || !given.every((k) => killers.includes(k))) return false;
  if (isAccompliceVariant(variant) && accusation.accomplice !== p.accompliceId) return false;
  if (isDoubleVariant(variant) && accusation.pairs) {
    const victims = victimIdsOf(p);
    for (let i = 0; i < victims.length; i++) {
      if (accusation.pairs[victims[i] as string] !== killers[i]) return false;
    }
  }
  return true;
}

/**
 * Cells where `personId` could stand without contradicting their own
 * sentences, given everyone else's current placements: free (unblocked) cells,
 * outside every row and column already used by another placed person. In liar
 * scenarios a suspect's sentences may also be ALL false (any suspect could be
 * the liar), so this never reveals the liar.
 */
export function candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell | null>): Cell[] {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const self = ctx.personIndex.get(personId);
  if (self === undefined) return [];
  const spec = specOf(p);
  const mayLie = isLiarVariant(spec.variant) && !spec.victims.includes(self);
  const fs = p.clues.filter((cl) => cl.personId === personId).map((cl) => compilePredicate(cl.predicate, self, ctx));
  const valid: Record<string, Cell | null> = {};
  for (const person of p.people) {
    const c = placements[person.id];
    valid[person.id] = c && c.r >= 0 && c.c >= 0 && c.r < p.rows && c.c < p.cols ? c : null;
  }
  const pos = toPositions(ctx, valid);
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
    const vals = fs.map((f) => f(pos));
    if (vals.every((v) => v !== 0) || (mayLie && vals.every((v) => v !== 1))) out.push(indexCell(g.cols, c));
  }
  return out;
}

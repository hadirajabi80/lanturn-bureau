/**
 * Extra Extreme difficulty contract (docs/EXTRA-EXTREME.md §3) — measured on a
 * finished puzzle with the human-style deduction engine.
 *
 *  - no free start: unary clues + the row/column rule alone pin nobody,
 *  - ≥ 3 what-if steps, at least one of depth 2 (gradedSolve, k1 / k2 below; in liar cases refuting a wrong
 *    "X is the liar" reading counts as one what-if, one level deeper than the deepest step inside it),
 *  - ≥ 40 % of the facts are relational (mention another person or room occupancy),
 *  - ≥ 3 clue families, ≥ 2 of them from new (★) predicates,
 *  - ≤ 3 sentences and ≤ 1 either/or (or conditional) per person,
 *  - no coordinate predicates (row / col / corner / edge).
 * Uniqueness and "every clue matters" are checked by the generator / tests
 * with the exhaustive solver (they need one full search per clue).
 */
import type { Predicate, Puzzle } from '../types';
import { isGlobalPredicate, predicatePeople } from './predicates';
import { isKillerRuleClue } from './play';
import { gradedSolve, initialDomains, propagate } from './solver';
import { puzzleWorlds } from './worlds';
import { makePuzzleCtx } from './predicates';

/** What-if bounds of the Extra Extreme deduction engine (depth-1 probes people with ≤ K1 cells, depth-2 with ≤ K2). */
export let ULTRA_K1 = 8;
export let ULTRA_K2 = 6;
/** Tuning hook (tests / experiments): change the what-if bounds. Generation caches are not cleared. */
export function setUltraBounds(k1: number, k2: number): void { ULTRA_K1 = k1; ULTRA_K2 = k2; }

export type ClueFamily =
  | 'sight' | 'company' | 'neighbours' | 'order' | 'distance' | 'furniture' | 'rooms' | 'conditionals' | 'eitherOr'
  | 'negatives' | 'coordinates';

/** Predicate types that may never appear in an Extra Extreme case. */
export const BANNED_ULTRA: ReadonlySet<Predicate['type']> = new Set(['row', 'notRow', 'col', 'notCol', 'corner', 'edge']);

/** New (★) predicate types introduced with Extra Extreme. */
export const STAR_TYPES: ReadonlySet<Predicate['type']> = new Set([
  'seeCount', 'seenByNobody', 'crowdedThan', 'onlyOnFurnitureInRoom', 'noDiagonalNeighbour', 'closerToKindThan',
  'closestToKind', 'roomAllOccupiable', 'roomHasButNot', 'largestRoomWith', 'roomTouches', 'canSeeKind', 'cannotSeeKind',
  'ifThen', 'xor',
]);

/** The clue family a predicate belongs to (docs/EXTRA-EXTREME.md §2). `and` → families of its parts. */
export function familiesOf(p: Predicate): ClueFamily[] {
  switch (p.type) {
    case 'lineOfSight': case 'seeCount': case 'seenByNobody': case 'canSeeKind': return ['sight'];
    case 'sameRoomAs': case 'differentRoomFrom': case 'aloneInRoom': case 'roomCount': case 'crowdedThan':
    case 'onlyOnFurnitureInRoom': return ['company'];
    case 'besidePerson': case 'notBesidePerson': case 'noDiagonalNeighbour': return ['neighbours'];
    case 'dirOf': case 'directlyDirOf': case 'between': case 'sameRowAs': case 'sameColAs': return ['order'];
    case 'distance': case 'closerToKindThan': case 'closestToKind': return ['distance'];
    case 'onFurniture': case 'onAnyFurniture': case 'besideFurniture': case 'besideAnyFurniture': case 'roomHasFurniture':
    case 'roomAllOccupiable': case 'roomHasButNot': return ['furniture'];
    case 'inRoom': case 'notInRoom': case 'roomSizeCmp': case 'largestRoomWith': case 'roomTouches': return ['rooms'];
    case 'ifThen': return ['conditionals'];
    case 'xor': case 'or': return ['eitherOr'];
    case 'notOnFurniture': case 'onNoFurniture': case 'notBesideFurniture': case 'notBesideAnyFurniture': case 'cannotSeeKind':
    case 'not': return ['negatives'];
    case 'row': case 'notRow': case 'col': case 'notCol': case 'corner': case 'edge': return ['coordinates'];
    case 'and': return [...new Set([...familiesOf(p.a), ...familiesOf(p.b)])];
  }
}

/** ★ families: families of the new predicates used (an `and` contributes its parts). */
export function starFamiliesOf(p: Predicate): ClueFamily[] {
  if (p.type === 'and') return [...new Set([...starFamiliesOf(p.a), ...starFamiliesOf(p.b)])];
  return STAR_TYPES.has(p.type) ? familiesOf(p) : [];
}

/** Atomic facts of a sentence (an `and` carries two). */
export const atomsOf = (p: Predicate): Predicate[] => (p.type === 'and' ? [...atomsOf(p.a), ...atomsOf(p.b)] : [p]);

/** A fact is relational when it mentions another person or depends on where everybody is. */
export const isRelational = (p: Predicate): boolean => predicatePeople(p).length > 0 || isGlobalPredicate(p);

function typesIn(p: Predicate, out: Set<Predicate['type']>): Set<Predicate['type']> {
  out.add(p.type);
  if (p.type === 'or' || p.type === 'ifThen' || p.type === 'xor' || p.type === 'and') { typesIn(p.a, out); typesIn(p.b, out); }
  if (p.type === 'not') typesIn(p.p, out);
  return out;
}

export interface DifficultyReport {
  /** written sentences, rule sentences excluded */
  clues: number;
  /** atomic facts (an `and` sentence counts twice) */
  facts: number;
  relational: number;
  relationalPct: number;
  families: ClueFamily[];
  starFamilies: ClueFamily[];
  starTypes: Predicate['type'][];
  /** what-if steps of the graded solve, and how many / the deepest */
  whatIf: number;
  whatIfDepth2: number;
  maxDepth: number;
  /** graded solve outcome on the true world */
  status: 'solved' | 'stuck' | 'contradiction';
  /** some person is pinned by unary clues + rows/columns alone */
  freeStart: boolean;
  /** coordinate predicates present */
  banned: Predicate['type'][];
  maxCluesPerPerson: number;
  maxEitherOrPerPerson: number;
  /** contract §3 (except uniqueness / clue necessity) satisfied */
  ok: boolean;
  /** human-readable reasons when !ok */
  problems: string[];
}

/** Measure a puzzle against the Extra Extreme contract (works for any tier; `ok` is only meaningful for ultra). */
export function difficultyReport(p: Puzzle): DifficultyReport {
  const ctx = makePuzzleCtx(p);
  const own = p.clues.filter((_, i) => !isKillerRuleClue(p, i));
  const atoms = own.flatMap((cl) => atomsOf(cl.predicate));
  const relational = atoms.filter(isRelational).length;
  const fam = new Set<ClueFamily>(), star = new Set<ClueFamily>(), starT = new Set<Predicate['type']>();
  const banned = new Set<Predicate['type']>();
  const per = new Map<string, number>(), perOr = new Map<string, number>();
  for (const cl of own) {
    for (const f of familiesOf(cl.predicate)) fam.add(f);
    for (const f of starFamiliesOf(cl.predicate)) star.add(f);
    for (const t of typesIn(cl.predicate, new Set())) {
      if (BANNED_ULTRA.has(t)) banned.add(t);
      if (STAR_TYPES.has(t)) starT.add(t);
    }
    per.set(cl.personId, (per.get(cl.personId) ?? 0) + 1);
    const t = cl.predicate.type;
    if (t === 'xor' || t === 'or' || t === 'ifThen') perOr.set(cl.personId, (perOr.get(cl.personId) ?? 0) + 1);
  }
  // the true world (for liar cases: the real liar's hypothesis)
  const worlds = puzzleWorlds(p);
  const liarIdx = p.liarId ? ctx.personIndex.get(p.liarId) ?? null : null;
  const w = worlds.find((x) => x.liar === liarIdx) ?? worlds[0];
  let freeStart = false;
  let status: DifficultyReport['status'] = 'stuck';
  let steps: number[] = [];
  if (w) {
    const unaryOnly = w.act.map((on, i) => (on && w.prob.clues[i]?.unary ? 1 : 0));
    const D = initialDomains(w.prob, unaryOnly);
    if (!propagate(w.prob, unaryOnly, D) || D.some((d) => d.length === 1)) freeStart = true;
    const g = gradedSolve(w.prob, w.act, ULTRA_K1, ULTRA_K2);
    status = g.status;
    steps = g.steps;
    // liar cases: each wrong "X is the liar" reading must collapse; that refutation is a what-if one level
    // above the deepest step it needs ("suppose Felix lies … then Ivy at C3 fails …" is depth 2)
    for (const o of worlds) {
      if (o === w) continue;
      const go = gradedSolve(o.prob, o.act, ULTRA_K1, ULTRA_K2);
      if (go.status !== 'contradiction') status = 'stuck';
      steps.push(1 + go.steps.reduce((m, d) => Math.max(m, d), 0));
    }
  }
  const whatIfDepth2 = steps.filter((d) => d >= 2).length;
  const rep: DifficultyReport = {
    clues: own.length,
    facts: atoms.length,
    relational,
    relationalPct: atoms.length ? (100 * relational) / atoms.length : 0,
    families: [...fam].sort(),
    starFamilies: [...star].sort(),
    starTypes: [...starT].sort(),
    whatIf: steps.length,
    whatIfDepth2,
    maxDepth: steps.reduce((m, d) => Math.max(m, d), 0),
    status,
    freeStart,
    banned: [...banned].sort(),
    maxCluesPerPerson: Math.max(0, ...per.values()),
    maxEitherOrPerPerson: Math.max(0, ...perOr.values()),
    ok: true,
    problems: [],
  };
  const pr = rep.problems;
  if (rep.status !== 'solved') pr.push(`deduction ${rep.status}`);
  if (rep.freeStart) pr.push('free start');
  if (rep.whatIf < 3) pr.push(`${rep.whatIf} what-if steps`);
  if (rep.whatIfDepth2 < 1) pr.push('no depth-2 what-if');
  if (rep.relationalPct < 40) pr.push(`relational ${rep.relationalPct.toFixed(0)}%`);
  if (rep.families.length < 3) pr.push(`${rep.families.length} families`);
  if (rep.starFamilies.length < 2) pr.push(`${rep.starFamilies.length} star families`);
  if (rep.banned.length) pr.push(`banned ${rep.banned.join(',')}`);
  if (rep.maxCluesPerPerson > 3) pr.push(`${rep.maxCluesPerPerson} clues for one person`);
  if (rep.maxEitherOrPerPerson > 1) pr.push(`${rep.maxEitherOrPerPerson} either/or for one person`);
  rep.ok = pr.length === 0;
  return rep;
}

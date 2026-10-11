/**
 * Clue semantics — the single source of truth for what every Predicate means
 * (docs/GRID-PLAN.md §1). The solver, the generator, checkPlacement and the
 * assist highlighting all go through `compilePredicate`.
 *
 * Evaluation is three-valued: 1 (true), 0 (false), -1 (undecidable yet because
 * someone it depends on is unplaced).
 */
import type { Cell, Predicate } from '../types';
import { OCCUPIABLE } from '../types';
import type { GridCtx, GridLike } from './geometry';
import {
  buildGridCtx, cellIndex, colOf, diagAdjacent, isCorner, isEdge, lineOfSight, manhattan, rowOf, strictlyBetween,
} from './geometry';

export type Tri = 1 | 0 | -1;
/** `pos[personIndex]` = flat cell index, or -1 when unplaced. */
export type PosFn = (pos: Int16Array) => Tri;

/** Grid tables + person indexing for one puzzle. */
export interface PuzzleCtx {
  grid: GridCtx;
  personIds: string[];
  personIndex: Map<string, number>;
}

const pctxCache = new WeakMap<object, PuzzleCtx>();

/** Build (cached per object) the evaluation context for a puzzle-like object. */
export function makePuzzleCtx(p: GridLike & { people: { id: string }[] }): PuzzleCtx {
  const hit = pctxCache.get(p);
  if (hit) return hit;
  const personIds = p.people.map((x) => x.id);
  const personIndex = new Map<string, number>();
  personIds.forEach((id, i) => personIndex.set(id, i));
  const ctx: PuzzleCtx = { grid: buildGridCtx(p), personIds, personIndex };
  pctxCache.set(p, ctx);
  return ctx;
}

/** Ids of the *other* people a predicate mentions (not including its owner). */
export function predicatePeople(p: Predicate): string[] {
  switch (p.type) {
    case 'sameRoomAs': case 'differentRoomFrom': case 'besidePerson': case 'notBesidePerson':
    case 'sameRowAs': case 'sameColAs': case 'dirOf': case 'directlyDirOf': case 'distance': case 'lineOfSight':
      return [p.personId];
    case 'between':
      return [p.a, p.b];
    case 'or': {
      const s = new Set([...predicatePeople(p.a), ...predicatePeople(p.b)]);
      return [...s];
    }
    case 'not':
      return predicatePeople(p.p);
    default:
      return [];
  }
}

/** Predicates whose truth depends on where *everybody* is (room occupancy). */
export function isGlobalPredicate(p: Predicate): boolean {
  switch (p.type) {
    case 'aloneInRoom': case 'roomCount': return true;
    case 'or': return isGlobalPredicate(p.a) || isGlobalPredicate(p.b);
    case 'not': return isGlobalPredicate(p.p);
    default: return false;
  }
}

const cmpOk = (cmp: 'exactly' | 'atLeast' | 'atMost', v: number, n: number): boolean =>
  cmp === 'exactly' ? v === n : cmp === 'atLeast' ? v >= n : v <= n;

/** Truth helper for a unary cell test. */
function unary(self: number, test: (c: number) => boolean): PosFn {
  return (pos) => {
    const c = pos[self] as number;
    if (c < 0) return -1;
    return test(c) ? 1 : 0;
  };
}

/** Truth helper for a test on (own cell, other cell). */
function binary(self: number, other: number, test: (a: number, b: number) => boolean): PosFn {
  if (other < 0) return () => -1;
  return (pos) => {
    const a = pos[self] as number, b = pos[other] as number;
    if (a < 0 || b < 0) return -1;
    return test(a, b) ? 1 : 0;
  };
}

/**
 * Compile a predicate owned by person `self` into a fast evaluator.
 * This is THE definition of clue semantics.
 */
export function compilePredicate(p: Predicate, self: number, ctx: PuzzleCtx): PosFn {
  const g = ctx.grid;
  const who = (id: string): number => ctx.personIndex.get(id) ?? -1;
  switch (p.type) {
    case 'inRoom': {
      const R = g.roomIndex.get(p.roomId) ?? -2;
      return unary(self, (c) => g.roomOf[c] === R);
    }
    case 'notInRoom': {
      const R = g.roomIndex.get(p.roomId) ?? -2;
      return unary(self, (c) => g.roomOf[c] !== R);
    }
    case 'onFurniture':
      return unary(self, (c) => g.kindAt[c] === p.kind && OCCUPIABLE[p.kind]);
    case 'notOnFurniture':
      return unary(self, (c) => g.kindAt[c] !== p.kind);
    case 'onAnyFurniture':
      return unary(self, (c) => g.kindAt[c] !== null);
    case 'onNoFurniture':
      return unary(self, (c) => g.kindAt[c] === null);
    case 'besideFurniture':
      return unary(self, (c) => (g.adjKinds[c] as Set<string>).has(p.kind));
    case 'notBesideFurniture':
      return unary(self, (c) => !(g.adjKinds[c] as Set<string>).has(p.kind));
    case 'besideAnyFurniture':
      return unary(self, (c) => (g.adjKinds[c] as Set<string>).size > 0);
    case 'notBesideAnyFurniture':
      return unary(self, (c) => (g.adjKinds[c] as Set<string>).size === 0);
    case 'row':
      return unary(self, (c) => rowOf(g, c) === p.index);
    case 'notRow':
      return unary(self, (c) => rowOf(g, c) !== p.index);
    case 'col':
      return unary(self, (c) => colOf(g, c) === p.index);
    case 'notCol':
      return unary(self, (c) => colOf(g, c) !== p.index);
    case 'corner':
      return unary(self, (c) => isCorner(g, c) === p.value);
    case 'edge':
      return unary(self, (c) => isEdge(g, c) === p.value);
    case 'roomHasFurniture':
      return unary(self, (c) => (g.roomKinds[g.roomOf[c] as number] as Set<string>).has(p.kind) === p.value);
    case 'roomSizeCmp':
      return unary(self, (c) => cmpOk(p.cmp, g.roomSize[g.roomOf[c] as number] as number, p.n));

    case 'sameRoomAs':
      return binary(self, who(p.personId), (a, b) => g.roomOf[a] === g.roomOf[b]);
    case 'differentRoomFrom':
      return binary(self, who(p.personId), (a, b) => g.roomOf[a] !== g.roomOf[b]);
    // People never share a row or column, so two people can only touch diagonally.
    case 'besidePerson':
      return binary(self, who(p.personId), (a, b) => diagAdjacent(g, a, b));
    case 'notBesidePerson':
      return binary(self, who(p.personId), (a, b) => !diagAdjacent(g, a, b));
    case 'sameRowAs':
      return binary(self, who(p.personId), (a, b) => rowOf(g, a) === rowOf(g, b));
    case 'sameColAs':
      return binary(self, who(p.personId), (a, b) => colOf(g, a) === colOf(g, b));
    case 'dirOf': {
      const d = p.dir;
      return binary(self, who(p.personId), (a, b) =>
        d === 'north' ? rowOf(g, a) < rowOf(g, b)
          : d === 'south' ? rowOf(g, a) > rowOf(g, b)
            : d === 'west' ? colOf(g, a) < colOf(g, b)
              : colOf(g, a) > colOf(g, b));
    }
    case 'directlyDirOf': {
      const d = p.dir;
      return binary(self, who(p.personId), (a, b) =>
        d === 'north' ? colOf(g, a) === colOf(g, b) && rowOf(g, a) < rowOf(g, b)
          : d === 'south' ? colOf(g, a) === colOf(g, b) && rowOf(g, a) > rowOf(g, b)
            : d === 'west' ? rowOf(g, a) === rowOf(g, b) && colOf(g, a) < colOf(g, b)
              : rowOf(g, a) === rowOf(g, b) && colOf(g, a) > colOf(g, b));
    }
    case 'distance':
      return binary(self, who(p.personId), (a, b) => cmpOk(p.cmp, manhattan(g, a, b), p.n));
    case 'lineOfSight':
      return binary(self, who(p.personId), (a, b) => lineOfSight(g, a, b) === p.value);

    case 'between': {
      const ia = who(p.a), ib = who(p.b);
      if (ia < 0 || ib < 0) return () => -1;
      return (pos) => {
        const x = pos[self] as number, a = pos[ia] as number, b = pos[ib] as number;
        if (x < 0 || a < 0 || b < 0) return -1;
        return strictlyBetween(g, x, a, b) ? 1 : 0;
      };
    }

    case 'aloneInRoom':
      return (pos) => {
        const c = pos[self] as number;
        if (c < 0) return -1;
        const R = g.roomOf[c];
        let unknown = false;
        for (let q = 0; q < pos.length; q++) {
          if (q === self) continue;
          const cq = pos[q] as number;
          if (cq < 0) unknown = true;
          else if (g.roomOf[cq] === R) return 0;
        }
        return unknown ? -1 : 1;
      };
    case 'roomCount': {
      const { cmp, n } = p;
      return (pos) => {
        const c = pos[self] as number;
        if (c < 0) return -1;
        const R = g.roomOf[c];
        let k = 1, u = 0;
        for (let q = 0; q < pos.length; q++) {
          if (q === self) continue;
          const cq = pos[q] as number;
          if (cq < 0) u++;
          else if (g.roomOf[cq] === R) k++;
        }
        // k = certain occupants (incl. self); k + u = the most there could be
        if (cmp === 'exactly') {
          if (k > n || k + u < n) return 0;
          return u === 0 ? 1 : -1;
        }
        if (cmp === 'atLeast') {
          if (k >= n) return 1;
          return k + u < n ? 0 : -1;
        }
        if (k > n) return 0;
        return k + u <= n ? 1 : -1;
      };
    }

    case 'or': {
      const fa = compilePredicate(p.a, self, ctx), fb = compilePredicate(p.b, self, ctx);
      return (pos) => {
        const a = fa(pos);
        if (a === 1) return 1;
        const b = fb(pos);
        if (b === 1) return 1;
        return a === 0 && b === 0 ? 0 : -1;
      };
    }
    case 'not': {
      const f = compilePredicate(p.p, self, ctx);
      return (pos) => {
        const v = f(pos);
        return v < 0 ? -1 : v === 1 ? 0 : 1;
      };
    }
  }
}

/** Convert a placements record to the internal position array. */
export function toPositions(ctx: PuzzleCtx, placements: Record<string, Cell | null | undefined>): Int16Array {
  const pos = new Int16Array(ctx.personIds.length).fill(-1);
  ctx.personIds.forEach((id, i) => {
    const c = placements[id];
    if (c) pos[i] = cellIndex(ctx.grid.cols, c);
  });
  return pos;
}

/**
 * Public evaluator. Returns `undefined` when the predicate cannot be decided
 * yet because the owner or a referenced person is unplaced.
 */
export function evalPredicate(
  p: Predicate,
  personId: string,
  placements: Record<string, Cell | null | undefined>,
  ctx: PuzzleCtx,
): boolean | undefined {
  const self = ctx.personIndex.get(personId);
  if (self === undefined) return undefined;
  const v = compilePredicate(p, self, ctx)(toPositions(ctx, placements));
  return v === -1 ? undefined : v === 1;
}

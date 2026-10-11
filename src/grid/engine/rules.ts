/**
 * Scenario (variant) rules — THE definition of what each `Variant` means
 * (docs/GRID-PLAN.md §2, types.ts). Used by the solver worlds, the generator,
 * checkPlacement / checkAccusation and the explain layer.
 *
 * Every variant is expressed as constraints over positions:
 *  - predicate items owned by a victim (e.g. "the victim's room holds exactly two people"),
 *  - custom global rules (exactly one suspect "hits" the victim: adjacent room, beside the poison, clear sight line),
 *  - for liar variants, per-hypothesis items: "if L is the liar, L is the killer (or accomplice)".
 */
import type { FurnitureKind, Predicate, Variant } from '../types';
import type { GridCtx } from './geometry';
import { lineOfSight, manhattan } from './geometry';
import type { PuzzleCtx } from './predicates';
import type { CustomRule, Domains, ProblemItem } from './solver';

export const isLiarVariant = (v: Variant): boolean => v === 'liar' || v === 'liarDouble' || v === 'accompliceLiar';
export const isDoubleVariant = (v: Variant): boolean => v === 'double' || v === 'liarDouble';
export const isAccompliceVariant = (v: Variant): boolean => v === 'accomplice' || v === 'accompliceLiar';

/** What the rules need to know about a case, in person indices. */
export interface RuleSpec {
  variant: Variant;
  /** victim person indices (1, or 2 for double variants) */
  victims: number[];
  poisonKind?: FurnitureKind;
}

// ─────────────────────────── negation ───────────────────────────

const OPP: Record<'north' | 'south' | 'east' | 'west', 'north' | 'south' | 'east' | 'west'> = {
  north: 'south', south: 'north', east: 'west', west: 'east',
};

/**
 * Exact negation of a predicate as another readable predicate when one exists
 * (under the one-per-row/column rule), else `{ type: 'not', p }`.
 * Used for liar statements: the liar says `negatePred(P)` where P is true.
 */
export function negatePred(p: Predicate): Predicate {
  switch (p.type) {
    case 'inRoom': return { type: 'notInRoom', roomId: p.roomId };
    case 'notInRoom': return { type: 'inRoom', roomId: p.roomId };
    case 'onFurniture': return { type: 'notOnFurniture', kind: p.kind };
    case 'notOnFurniture': return { type: 'onFurniture', kind: p.kind };
    case 'besideFurniture': return { type: 'notBesideFurniture', kind: p.kind };
    case 'notBesideFurniture': return { type: 'besideFurniture', kind: p.kind };
    case 'onAnyFurniture': return { type: 'onNoFurniture' };
    case 'onNoFurniture': return { type: 'onAnyFurniture' };
    case 'besideAnyFurniture': return { type: 'notBesideAnyFurniture' };
    case 'notBesideAnyFurniture': return { type: 'besideAnyFurniture' };
    case 'row': return { type: 'notRow', index: p.index };
    case 'notRow': return { type: 'row', index: p.index };
    case 'col': return { type: 'notCol', index: p.index };
    case 'notCol': return { type: 'col', index: p.index };
    case 'corner': return { type: 'corner', value: !p.value };
    case 'edge': return { type: 'edge', value: !p.value };
    case 'sameRoomAs': return { type: 'differentRoomFrom', personId: p.personId };
    case 'differentRoomFrom': return { type: 'sameRoomAs', personId: p.personId };
    case 'besidePerson': return { type: 'notBesidePerson', personId: p.personId };
    case 'notBesidePerson': return { type: 'besidePerson', personId: p.personId };
    case 'dirOf': return { type: 'dirOf', personId: p.personId, dir: OPP[p.dir] };
    case 'roomHasFurniture': return { type: 'roomHasFurniture', kind: p.kind, value: !p.value };
    case 'lineOfSight': return { type: 'lineOfSight', personId: p.personId, value: !p.value };
    case 'aloneInRoom': return { type: 'roomCount', cmp: 'atLeast', n: 2 };
    case 'roomCount':
      if (p.cmp === 'atLeast') return { type: 'roomCount', cmp: 'atMost', n: p.n - 1 };
      if (p.cmp === 'atMost') return { type: 'roomCount', cmp: 'atLeast', n: p.n + 1 };
      return { type: 'not', p };
    case 'distance':
      if (p.cmp === 'atLeast') return { type: 'distance', personId: p.personId, cmp: 'atMost', n: p.n - 1 };
      if (p.cmp === 'atMost') return { type: 'distance', personId: p.personId, cmp: 'atLeast', n: p.n + 1 };
      return { type: 'not', p };
    case 'not': return p.p;
    default: return { type: 'not', p };
  }
}

/** True when the negation of `p` is itself a plain, readable predicate. */
export const hasPlainNegation = (p: Predicate): boolean => p.type !== 'not' && negatePred(p).type !== 'not';

// ─────────────────────────── geometry helpers ───────────────────────────

const adjCache = new WeakMap<GridCtx, Set<number>[]>();

/** For each room, the set of OTHER rooms sharing a wall (orthogonally adjacent cells). */
export function roomAdjacency(g: GridCtx): Set<number>[] {
  const hit = adjCache.get(g);
  if (hit) return hit;
  const adj = g.roomIds.map(() => new Set<number>());
  for (let i = 0; i < g.size; i++) {
    const a = g.roomOf[i] as number;
    for (const j of g.neighbors[i] as number[]) {
      const b = g.roomOf[j] as number;
      if (a !== b) adj[a]?.add(b);
    }
  }
  adjCache.set(g, adj);
  return adj;
}

/** Relation "suspect at cell c hits the victim at cell v" for the exactly-one rules. */
export type HitFn = (c: number, v: number) => boolean;

export function hitFor(g: GridCtx, spec: RuleSpec): HitFn | null {
  switch (spec.variant) {
    case 'lockedRoom': {
      const adj = roomAdjacency(g);
      return (c, v) => (adj[g.roomOf[v] as number] as Set<number>).has(g.roomOf[c] as number);
    }
    case 'poison': {
      const k = spec.poisonKind;
      return (c) => !!k && (g.adjKinds[c] as Set<FurnitureKind>).has(k);
    }
    case 'sniper':
      return (c, v) => lineOfSight(g, c, v);
    default:
      return null;
  }
}

/**
 * "Exactly one suspect (non-victim) hits the victim." `key(v)` groups victim
 * cells with identical hit sets (room for lockedRoom, constant for poison).
 */
function exactlyOneHit(n: number, victim: number, hit: HitFn, key: (v: number) => number): CustomRule {
  const f = (pos: Int16Array): 1 | 0 | -1 => {
    const v = pos[victim] as number;
    if (v < 0) return -1;
    let hits = 0, unknown = 0;
    for (let q = 0; q < n; q++) {
      if (q === victim) continue;
      const c = pos[q] as number;
      if (c < 0) unknown++;
      else if (hit(c, v)) hits++;
    }
    if (hits >= 2) return 0;
    if (unknown === 0) return hits === 1 ? 1 : 0;
    return -1;
  };
  /** forced / possible counts for victim cell v; early exit flags */
  const tally = (D: Domains, v: number): { forced: number; forcedQ: number; possible: number; possibleQ: number } => {
    let forced = 0, forcedQ = -1, possible = 0, possibleQ = -1;
    for (let q = 0; q < n; q++) {
      if (q === victim) continue;
      const d = D[q] as number[];
      let any = false, all = d.length > 0;
      for (const c of d) {
        if (hit(c, v)) any = true;
        else all = false;
        if (any && !all) break;
      }
      if (any) { possible++; possibleQ = q; }
      if (all) { forced++; forcedQ = q; }
    }
    return { forced, forcedQ, possible, possibleQ };
  };
  const revise = (D: Domains, setDom: (q: number, list: number[]) => void): number => {
    const dv = D[victim] as number[];
    if (!dv.length) return -1;
    const k0 = key(dv[0] as number);
    if (dv.every((v) => key(v) === k0)) {
      const v = dv[0] as number;
      const t = tally(D, v);
      if (t.forced >= 2 || t.possible === 0) return -1;
      let changed = 0;
      if (t.forced === 1) {
        for (let q = 0; q < n; q++) {
          if (q === victim || q === t.forcedQ) continue;
          const d = D[q] as number[];
          const nd = d.filter((c) => !hit(c, v));
          if (!nd.length) return -1;
          if (nd.length !== d.length) { setDom(q, nd); changed = 1; }
        }
      } else if (t.possible === 1) {
        const q = t.possibleQ;
        const d = D[q] as number[];
        const nd = d.filter((c) => hit(c, v));
        if (nd.length !== d.length) { setDom(q, nd); changed = 1; }
      }
      return changed;
    }
    if (dv.length > 16) return 0;
    const keep = dv.filter((v) => {
      const t = tally(D, v);
      return t.forced <= 1 && t.possible >= 1;
    });
    if (!keep.length) return -1;
    if (keep.length !== dv.length) { setDom(victim, keep); return 1; }
    return 0;
  };
  return { f, revise };
}

/** Accomplice rule refinement: the two people with the victim are at different distances from them. */
function distinctDistances(g: GridCtx, n: number, victim: number): CustomRule {
  return {
    f: (pos) => {
      const v = pos[victim] as number;
      if (v < 0) return -1;
      const R = g.roomOf[v];
      const ds: number[] = [];
      let unknown = false;
      for (let q = 0; q < n; q++) {
        if (q === victim) continue;
        const c = pos[q] as number;
        if (c < 0) unknown = true;
        else if (g.roomOf[c] === R) ds.push(manhattan(g, c, v));
      }
      if (ds.length === 2) return ds[0] === ds[1] ? 0 : unknown ? -1 : 1;
      return unknown ? -1 : 1; // the room count itself is checked by roomCount
    },
  };
}

/** accompliceLiar hypothesis: L shares the victim's room and is FARTHER from the victim than the other person there. */
function fartherInRoom(g: GridCtx, n: number, victim: number, L: number): CustomRule {
  return {
    f: (pos) => {
      const v = pos[victim] as number, l = pos[L] as number;
      if (v < 0 || l < 0) return -1;
      if (g.roomOf[l] !== g.roomOf[v]) return 0;
      const dl = manhattan(g, l, v);
      let unknown = false;
      for (let q = 0; q < n; q++) {
        if (q === victim || q === L) continue;
        const c = pos[q] as number;
        if (c < 0) { unknown = true; continue; }
        if (g.roomOf[c] === g.roomOf[v]) return manhattan(g, c, v) < dl ? 1 : 0;
      }
      return unknown ? -1 : 0;
    },
  };
}

/** liarDouble hypothesis: L shares a room with one of the victims (room-level reviser, cheap on big boards). */
function inRoomOfAVictim(g: GridCtx, L: number, victims: number[]): CustomRule {
  const roomsOf = (d: number[]): Set<number> => {
    const s = new Set<number>();
    for (const c of d) s.add(g.roomOf[c] as number);
    return s;
  };
  return {
    f: (pos) => {
      const l = pos[L] as number;
      if (l < 0) return -1;
      let unknown = false;
      for (const v of victims) {
        const c = pos[v] as number;
        if (c < 0) unknown = true;
        else if (g.roomOf[c] === g.roomOf[l]) return 1;
      }
      return unknown ? -1 : 0;
    },
    revise: (D, setDom) => {
      const rl = roomsOf(D[L] as number[]);
      const rv = victims.map((v) => roomsOf(D[v] as number[]));
      const allowed = new Set<number>();
      for (const s of rv) for (const r of s) allowed.add(r);
      let changed = 0;
      const dl = (D[L] as number[]).filter((c) => allowed.has(g.roomOf[c] as number));
      if (!dl.length) return -1;
      if (dl.length !== (D[L] as number[]).length) { setDom(L, dl); changed = 1; }
      const rl2 = changed ? roomsOf(dl) : rl;
      const meet = victims.filter((_, i) => [...(rv[i] as Set<number>)].some((r) => rl2.has(r)));
      if (!meet.length) return -1;
      if (meet.length === 1) {
        const v = meet[0] as number;
        const dv = (D[v] as number[]).filter((c) => rl2.has(g.roomOf[c] as number));
        if (!dv.length) return -1;
        if (dv.length !== (D[v] as number[]).length) { setDom(v, dv); changed = 1; }
        const rvv = roomsOf(dv);
        const dl2 = (D[L] as number[]).filter((c) => rvv.has(g.roomOf[c] as number));
        if (!dl2.length) return -1;
        if (dl2.length !== (D[L] as number[]).length) { setDom(L, dl2); changed = 1; }
      }
      return changed;
    },
  };
}

// ─────────────────────────── rule items ───────────────────────────

/** The always-on variant rule as solver items (truthful about positions; no liar hypothesis). */
export function baseRuleItems(ctx: PuzzleCtx, spec: RuleSpec): ProblemItem[] {
  const g = ctx.grid;
  const n = ctx.personIds.length;
  const [v, v2] = spec.victims as [number, number | undefined];
  const id = (i: number): string => ctx.personIds[i] as string;
  switch (spec.variant) {
    case 'classic': case 'liar':
      return [{ owner: v, pred: { type: 'roomCount', cmp: 'exactly', n: 2 } }];
    case 'accomplice': case 'accompliceLiar':
      return [{ owner: v, pred: { type: 'roomCount', cmp: 'exactly', n: 3 } }, { owner: v, custom: distinctDistances(g, n, v) }];
    case 'lockedRoom':
      return [
        { owner: v, pred: { type: 'aloneInRoom' } },
        { owner: v, custom: exactlyOneHit(n, v, hitFor(g, spec) as HitFn, (c) => g.roomOf[c] as number) },
      ];
    case 'poison':
      return [
        { owner: v, pred: { type: 'notBesideFurniture', kind: spec.poisonKind as FurnitureKind } },
        { owner: v, custom: exactlyOneHit(n, v, hitFor(g, spec) as HitFn, () => 0) },
      ];
    case 'sniper':
      return [{ owner: v, custom: exactlyOneHit(n, v, hitFor(g, spec) as HitFn, (c) => c) }];
    case 'double': case 'liarDouble': {
      const w = v2 as number;
      return [
        { owner: v, pred: { type: 'roomCount', cmp: 'exactly', n: 2 } },
        { owner: w, pred: { type: 'roomCount', cmp: 'exactly', n: 2 } },
        { owner: v, pred: { type: 'differentRoomFrom', personId: id(w) } },
      ];
    }
  }
}

/**
 * Liar variants: what "L is the liar" adds about positions (the liar is the
 * killer — or one of the two killers, or the accomplice). Same item count for
 * every L of a variant.
 */
export function hypothesisItems(ctx: PuzzleCtx, spec: RuleSpec, L: number): ProblemItem[] {
  const g = ctx.grid;
  const n = ctx.personIds.length;
  const [v, v2] = spec.victims as [number, number | undefined];
  const id = (i: number): string => ctx.personIds[i] as string;
  switch (spec.variant) {
    case 'liar':
      return [{ owner: L, pred: { type: 'sameRoomAs', personId: id(v) } }];
    case 'liarDouble':
      return [{ owner: L, custom: inRoomOfAVictim(g, L, [v, v2 as number]) }];
    case 'accompliceLiar':
      return [{ owner: L, pred: { type: 'sameRoomAs', personId: id(v) } }, { owner: L, custom: fartherInRoom(g, n, v, L) }];
    default:
      return [];
  }
}

/** Liar hypotheses to consider: every suspect (non-victim). */
export function liarCandidates(n: number, spec: RuleSpec): number[] {
  const out: number[] = [];
  for (let q = 0; q < n; q++) if (!spec.victims.includes(q)) out.push(q);
  return out;
}

// ─────────────────────────── culprits ───────────────────────────

export interface Culprits {
  /** killers[i] killed victims[i] */
  killers: number[];
  accomplice: number;
}

/**
 * Who the rule names, from a full placement (person index → cell). null when
 * the placement does not satisfy the rule's shape (nobody / several match).
 */
export function culpritsFromPos(ctx: PuzzleCtx, spec: RuleSpec, pos: Int16Array): Culprits | null {
  const g = ctx.grid;
  const n = ctx.personIds.length;
  for (let q = 0; q < n; q++) if ((pos[q] as number) < 0) return null;
  const others = (v: number): number[] => {
    const out: number[] = [];
    for (let q = 0; q < n; q++) if (q !== v && g.roomOf[pos[q] as number] === g.roomOf[pos[v] as number]) out.push(q);
    return out;
  };
  const v = spec.victims[0] as number;
  switch (spec.variant) {
    case 'classic': case 'liar': {
      const o = others(v);
      return o.length === 1 ? { killers: [o[0] as number], accomplice: -1 } : null;
    }
    case 'double': case 'liarDouble': {
      const ks: number[] = [];
      for (const w of spec.victims) {
        const o = others(w);
        if (o.length !== 1 || spec.victims.includes(o[0] as number)) return null;
        ks.push(o[0] as number);
      }
      return ks[0] !== ks[1] ? { killers: ks, accomplice: -1 } : null;
    }
    case 'accomplice': case 'accompliceLiar': {
      const o = others(v);
      if (o.length !== 2) return null;
      const [a, b] = o as [number, number];
      const da = manhattan(g, pos[a] as number, pos[v] as number), db = manhattan(g, pos[b] as number, pos[v] as number);
      if (da === db) return null;
      return da < db ? { killers: [a], accomplice: b } : { killers: [b], accomplice: a };
    }
    case 'lockedRoom': case 'poison': case 'sniper': {
      const hit = hitFor(g, spec) as HitFn;
      if (spec.variant === 'lockedRoom' && others(v).length) return null;
      const hits: number[] = [];
      for (let q = 0; q < n; q++) if (q !== v && hit(pos[q] as number, pos[v] as number)) hits.push(q);
      return hits.length === 1 ? { killers: [hits[0] as number], accomplice: -1 } : null;
    }
  }
}

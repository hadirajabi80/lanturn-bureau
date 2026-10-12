/**
 * Extra Extreme (tier `ultra`) predicate support: per-grid lookup tables and
 * the sound domain revisers of the new *global* predicates (they depend on
 * where everybody is). Shared by the solver (solver.ts) and Ask Otto
 * (explain.ts) so both reason with exactly the same rules.
 *
 *  - count-type: seeCount, seenByNobody, noDiagonalNeighbour, closestToKind —
 *    "the number of OTHER people q with rel(owner cell, q cell) is (cmp) n".
 *  - crowdedThan          — room-occupancy bounds.
 *  - onlyOnFurnitureInRoom — the owner is on furniture, nobody else in the room is.
 */
import type { FurnitureKind, Predicate } from '../types';
import type { GridCtx } from './geometry';
import { colOf, diagAdjacent, lineOfSight, manhattan, rowOf } from './geometry';

type CmpT = 'exactly' | 'atLeast' | 'atMost';

// ─────────────────────────── per-grid tables ───────────────────────────

interface Tables {
  words: number;
  sight: Uint32Array[];          // per cell: bitset of cells in clear sight
  diag: Uint32Array[];           // per cell: bitset of diagonal neighbours
  lineMask: Uint32Array[];       // per cell: bitset of its row ∪ column
  kindDist: Map<FurnitureKind, Int16Array>;
  kindSee: Map<FurnitureKind, Uint8Array>;
  closeBits: Map<FurnitureKind, Uint32Array[]>; // per cell c: cells d with dist(d) ≤ dist(c)
  touch: Set<number>[] | null;
  largest: Map<FurnitureKind, number>;
}

const cache = new WeakMap<GridCtx, Tables>();

function tables(g: GridCtx): Tables {
  const hit = cache.get(g);
  if (hit) return hit;
  const words = Math.ceil(g.size / 32);
  const mk = (): Uint32Array => new Uint32Array(words);
  const sight: Uint32Array[] = [], diag: Uint32Array[] = [], lineMask: Uint32Array[] = [];
  for (let a = 0; a < g.size; a++) {
    const s = mk(), d = mk(), l = mk();
    for (let b = 0; b < g.size; b++) {
      if (a === b) continue;
      if (lineOfSight(g, a, b)) s[b >> 5] = (s[b >> 5] as number) | (1 << (b & 31));
      if (diagAdjacent(g, a, b)) d[b >> 5] = (d[b >> 5] as number) | (1 << (b & 31));
    }
    for (let b = 0; b < g.size; b++) {
      if (rowOf(g, a) === rowOf(g, b) || colOf(g, a) === colOf(g, b)) l[b >> 5] = (l[b >> 5] as number) | (1 << (b & 31));
    }
    sight.push(s); diag.push(d); lineMask.push(l);
  }
  const t: Tables = { words, sight, diag, lineMask, kindDist: new Map(), kindSee: new Map(), closeBits: new Map(), touch: null, largest: new Map() };
  cache.set(g, t);
  return t;
}

/** Steps (Manhattan) from each cell to the nearest cell of a piece of `kind` (999 when the kind is absent). */
export function kindDistance(g: GridCtx, kind: FurnitureKind): Int16Array {
  const t = tables(g);
  const hit = t.kindDist.get(kind);
  if (hit) return hit;
  const cells: number[] = [];
  for (let i = 0; i < g.size; i++) if (g.kindAt[i] === kind) cells.push(i);
  const out = new Int16Array(g.size).fill(999);
  for (let i = 0; i < g.size; i++) for (const k of cells) out[i] = Math.min(out[i] as number, manhattan(g, i, k));
  t.kindDist.set(kind, out);
  return out;
}

/** Cells from which a piece of `kind` is in clear sight (row, column or diagonal; the piece stood on does not count). */
export function seesKindMask(g: GridCtx, kind: FurnitureKind): Uint8Array {
  const t = tables(g);
  const hit = t.kindSee.get(kind);
  if (hit) return hit;
  const cells: number[] = [];
  for (let i = 0; i < g.size; i++) if (g.kindAt[i] === kind) cells.push(i);
  const out = new Uint8Array(g.size);
  for (let i = 0; i < g.size; i++) {
    const own = g.pieceAt[i] as number;
    for (const k of cells) {
      if (own >= 0 && g.pieceAt[k] === own) continue;
      if (lineOfSight(g, i, k)) { out[i] = 1; break; }
    }
  }
  t.kindSee.set(kind, out);
  return out;
}

/** For each room, the other rooms sharing a wall with it. */
export function roomsTouching(g: GridCtx): Set<number>[] {
  const t = tables(g);
  if (t.touch) return t.touch;
  const adj = g.roomIds.map(() => new Set<number>());
  for (let i = 0; i < g.size; i++) {
    const a = g.roomOf[i] as number;
    for (const j of g.neighbors[i] as number[]) {
      const b = g.roomOf[j] as number;
      if (a !== b) adj[a]?.add(b);
    }
  }
  t.touch = adj;
  return adj;
}

/** Room index of the unique largest room containing `kind`, or -1 (absent / tie). */
export function largestRoomWith(g: GridCtx, kind: FurnitureKind): number {
  const t = tables(g);
  const hit = t.largest.get(kind);
  if (hit !== undefined) return hit;
  let best = -1, bestSize = -1, tie = false;
  g.roomKinds.forEach((ks, R) => {
    if (!ks.has(kind)) return;
    const s = g.roomSize[R] as number;
    if (s > bestSize) { best = R; bestSize = s; tie = false; } else if (s === bestSize) tie = true;
  });
  const r = tie ? -1 : best;
  t.largest.set(kind, r);
  return r;
}

/** True when every piece in room R is occupiable and the room has at least one piece. */
export function roomAllOccupiable(g: GridCtx, R: number): boolean {
  const ks = g.roomKinds[R] as Set<FurnitureKind>;
  if (!ks.size) return false;
  for (const c of g.roomCells[R] as number[]) if (g.blocked[c]) return false;
  return true;
}

// ─────────────────────────── count-type predicates ───────────────────────────

export interface CountSpec {
  cmp: CmpT;
  n: number;
  /** rel(owner cell, other cell) */
  rel: (a: number, b: number) => boolean;
  /** rel as bitsets over the other cell, per owner cell */
  bits: (a: number) => Uint32Array;
}

/** The count form of a count-type predicate, or null. */
export function countSpecOf(p: Predicate, g: GridCtx): CountSpec | null {
  const t = tables(g);
  switch (p.type) {
    case 'seeCount': case 'seenByNobody': {
      const cmp: CmpT = p.type === 'seeCount' ? p.cmp : 'exactly';
      const n = p.type === 'seeCount' ? p.n : 0;
      return { cmp, n, rel: (a, b) => hasBit(t.sight[a] as Uint32Array, b), bits: (a) => t.sight[a] as Uint32Array };
    }
    case 'noDiagonalNeighbour':
      return { cmp: 'exactly', n: 0, rel: (a, b) => diagAdjacent(g, a, b), bits: (a) => t.diag[a] as Uint32Array };
    case 'closestToKind': {
      const dist = kindDistance(g, p.kind);
      let cb = t.closeBits.get(p.kind);
      if (!cb) {
        cb = [];
        for (let a = 0; a < g.size; a++) {
          const s = new Uint32Array(t.words);
          for (let b = 0; b < g.size; b++) if ((dist[b] as number) <= (dist[a] as number)) s[b >> 5] = (s[b >> 5] as number) | (1 << (b & 31));
          cb.push(s);
        }
        t.closeBits.set(p.kind, cb);
      }
      const bitsArr = cb;
      return { cmp: 'exactly', n: 0, rel: (a, b) => (dist[b] as number) <= (dist[a] as number), bits: (a) => bitsArr[a] as Uint32Array };
    }
    default:
      return null;
  }
}

const hasBit = (s: Uint32Array, i: number): boolean => (((s[i >> 5] as number) >>> (i & 31)) & 1) === 1;

/** Three-valued count evaluation (pos[q] = cell or -1). */
export function countEval(cs: CountSpec, self: number, pos: Int16Array): 1 | 0 | -1 {
  const c = pos[self] as number;
  if (c < 0) return -1;
  let k = 0, u = 0;
  for (let q = 0; q < pos.length; q++) {
    if (q === self) continue;
    const d = pos[q] as number;
    if (d < 0) u++;
    else if (cs.rel(c, d)) k++;
  }
  const { cmp, n } = cs;
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
}

// ─────────────────────────── revisers ───────────────────────────

/**
 * One elimination found by a global reviser.
 *  - own-few  : owner squares from which too few people could satisfy the relation
 *  - own-many : owner squares from which too many people must satisfy it (`who` = those people)
 *  - own-dead : owner squares that would leave `who` with no square at all (row/column rule)
 *  - own-base : owner squares that fail the predicate's own-square part (e.g. not on furniture)
 *  - cap      : owner pinned; the count is already reached, so `p` must avoid the relation
 *  - fill     : owner pinned; every remaining candidate is needed, so `p` must satisfy it
 *  - crowd    : room-occupancy bounds (crowdedThan)
 *  - only     : another person on furniture in the owner's room (onlyOnFurnitureInRoom)
 */
export interface GElim {
  p: number;
  cells: number[];
  mode: 'own-few' | 'own-many' | 'own-dead' | 'own-base' | 'cap' | 'fill' | 'crowd' | 'only';
  who: number[];
}

export function isExtraGlobal(p: Predicate): boolean {
  switch (p.type) {
    case 'seeCount': case 'seenByNobody': case 'noDiagonalNeighbour': case 'closestToKind': case 'crowdedThan':
    case 'onlyOnFurnitureInRoom':
      return true;
    default:
      return false;
  }
}

/**
 * Sound eliminations for an extra global predicate owned by `s`, computed on
 * one snapshot of the domains. 'contra' when the predicate cannot hold at all.
 * `other` = person index for crowdedThan.
 */
export function reviseExtra(p: Predicate, s: number, other: number, D: number[][], g: GridCtx): GElim[] | 'contra' {
  const n = D.length;
  const t = tables(g);
  const W = t.words;
  const out: GElim[] = [];
  const cs = countSpecOf(p, g);
  if (cs) {
    // domain bitsets
    const dom: Uint32Array[] = [];
    for (let q = 0; q < n; q++) {
      const b = new Uint32Array(W);
      for (const c of D[q] as number[]) b[c >> 5] = (b[c >> 5] as number) | (1 << (c & 31));
      dom.push(b);
    }
    const ds = D[s] as number[];
    const few: number[] = [], many: number[] = [], deadCells: number[] = [];
    let manyWho: number[] = [], deadWho: number[] = [];
    for (const c of ds) {
      const rel = cs.bits(c), line = t.lineMask[c] as Uint32Array;
      let forced = 0, possible = 0, dead = -1;
      const who: number[] = [];
      for (let q = 0; q < n && dead < 0; q++) {
        if (q === s) continue;
        const dq = dom[q] as Uint32Array;
        let any = false, rest = false, nonEmpty = false;
        for (let w = 0; w < W; w++) {
          const x = (dq[w] as number) & ~(line[w] as number);
          if (x) nonEmpty = true;
          if (x & (rel[w] as number)) any = true;
          if (x & ~(rel[w] as number)) rest = true;
        }
        if (!nonEmpty) { dead = q; break; }
        if (any) possible++;
        if (any && !rest) { forced++; who.push(q); }
      }
      if (dead >= 0) { deadCells.push(c); if (!deadWho.length) deadWho = [dead]; continue; }
      const { cmp, n: N } = cs;
      const okLo = cmp === 'atMost' || possible >= N;
      const okHi = cmp === 'atLeast' || forced <= N;
      if (!okLo) few.push(c);
      else if (!okHi) { many.push(c); if (!manyWho.length) manyWho = who; }
    }
    if (few.length + many.length + deadCells.length === ds.length && ds.length) return 'contra';
    if (deadCells.length) out.push({ p: s, cells: deadCells, mode: 'own-dead', who: deadWho });
    if (few.length) out.push({ p: s, cells: few, mode: 'own-few', who: [] });
    if (many.length) out.push({ p: s, cells: many, mode: 'own-many', who: manyWho });
    if (out.length) return out;
    if (ds.length !== 1) return out;
    // owner pinned: cap / fill
    const c = ds[0] as number;
    const notLine = (d: number): boolean => rowOf(g, d) !== rowOf(g, c) && colOf(g, d) !== colOf(g, c);
    let forced = 0, possible = 0;
    const forcedQ: boolean[] = [], possQ: boolean[] = [];
    for (let q = 0; q < n; q++) {
      forcedQ.push(false); possQ.push(false);
      if (q === s) continue;
      const dq = (D[q] as number[]).filter(notLine);
      const any = dq.some((d) => cs.rel(c, d)), all = dq.length > 0 && dq.every((d) => cs.rel(c, d));
      if (any) { possible++; possQ[q] = true; }
      if (all) { forced++; forcedQ[q] = true; }
    }
    const cap = (cs.cmp === 'exactly' || cs.cmp === 'atMost') && forced === cs.n;
    const fill = (cs.cmp === 'exactly' || cs.cmp === 'atLeast') && possible === cs.n;
    const capWho: number[] = [];
    for (let q = 0; q < n; q++) if (forcedQ[q]) capWho.push(q);
    for (let q = 0; q < n; q++) {
      if (q === s) continue;
      const dq = D[q] as number[];
      if (cap && !forcedQ[q]) {
        const bad = dq.filter((d) => cs.rel(c, d));
        if (bad.length) out.push({ p: q, cells: bad, mode: 'cap', who: capWho });
      } else if (fill && possQ[q]) {
        const bad = dq.filter((d) => !cs.rel(c, d));
        if (bad.length) out.push({ p: q, cells: bad, mode: 'fill', who: [] });
      }
    }
    return out;
  }

  if (p.type === 'onlyOnFurnitureInRoom') {
    const ds = D[s] as number[];
    const base = ds.filter((c) => g.kindAt[c] === null);
    if (base.length === ds.length) return 'contra';
    if (base.length) return [{ p: s, cells: base, mode: 'own-base', who: [] }];
    // someone certainly on furniture in room R rules R out for the owner
    const sure = new Map<number, number>();
    for (let q = 0; q < n; q++) {
      if (q === s) continue;
      const d = D[q] as number[];
      if (!d.length) continue;
      const R = g.roomOf[d[0] as number] as number;
      if (d.every((c) => g.roomOf[c] === R && g.kindAt[c] !== null)) sure.set(R, q);
    }
    const bad = ds.filter((c) => sure.has(g.roomOf[c] as number));
    if (bad.length === ds.length) return 'contra';
    if (bad.length) {
      return [{ p: s, cells: bad, mode: 'only', who: [sure.get(g.roomOf[bad[0] as number] as number) as number] }];
    }
    const R = g.roomOf[ds[0] as number] as number;
    if (!ds.every((c) => g.roomOf[c] === R)) return out;
    for (let q = 0; q < n; q++) {
      if (q === s) continue;
      const cells = (D[q] as number[]).filter((c) => g.roomOf[c] === R && g.kindAt[c] !== null);
      if (cells.length) out.push({ p: q, cells, mode: 'only', who: [s] });
    }
    return out;
  }

  if (p.type === 'crowdedThan') {
    const x = other;
    if (x < 0 || x === s) return 'contra';
    const nR = g.roomIds.length;
    const lo = new Int32Array(nR), hi = new Int32Array(nR);
    for (let q = 0; q < n; q++) {
      if (q === s || q === x) continue;
      const d = D[q] as number[];
      if (!d.length) continue;
      const seen = new Set<number>();
      for (const c of d) seen.add(g.roomOf[c] as number);
      for (const R of seen) hi[R] = (hi[R] as number) + 1;
      if (seen.size === 1) { const R = [...seen][0] as number; lo[R] = (lo[R] as number) + 1; }
    }
    const roomsOf = (d: number[]): Set<number> => { const r = new Set<number>(); for (const c of d) r.add(g.roomOf[c] as number); return r; };
    const rs = roomsOf(D[s] as number[]), rx = roomsOf(D[x] as number[]);
    const okS = (R: number): boolean => { for (const R2 of rx) if (R2 !== R && (hi[R] as number) > (lo[R2] as number)) return true; return false; };
    const okX = (R2: number): boolean => { for (const R of rs) if (R !== R2 && (hi[R] as number) > (lo[R2] as number)) return true; return false; };
    const badS = (D[s] as number[]).filter((c) => !okS(g.roomOf[c] as number));
    const badX = (D[x] as number[]).filter((c) => !okX(g.roomOf[c] as number));
    if (badS.length === (D[s] as number[]).length || badX.length === (D[x] as number[]).length) return 'contra';
    if (badS.length) out.push({ p: s, cells: badS, mode: 'crowd', who: [x] });
    if (badX.length) out.push({ p: x, cells: badX, mode: 'crowd', who: [s] });
    return out;
  }
  return out;
}

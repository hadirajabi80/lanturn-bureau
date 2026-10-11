/**
 * Constraint machinery for Crime Files.
 *
 *  - `propagate`  : sound domain filtering (arc consistency over relational
 *                   clues, all-different, room-occupancy reasoning). It never
 *                   removes a cell that belongs to a real solution.
 *  - `deduce`     : propagation + optional "what-if" probing on people with
 *                   few remaining cells. This models what a human can do and
 *                   is what the generator uses to certify a puzzle is
 *                   *deducible*, not merely unique.
 *  - `search`     : exhaustive backtracking (forward checking, MRV ordering)
 *                   used to count solutions — the ground truth for uniqueness.
 */
import type { Cell, Clue, Predicate, Puzzle } from '../types';
import { indexCell } from './geometry';
import type { PosFn, PuzzleCtx } from './predicates';
import { compilePredicate, isGlobalPredicate, makePuzzleCtx, predicatePeople } from './predicates';

/** A clue compiled against one puzzle. */
export interface CClue {
  owner: number;
  /** distinct people involved, owner first (empty for global clues — they involve everybody) */
  deps: number[];
  global: boolean;
  unary: boolean;
  f: PosFn;
  pred: Predicate;
  /** unary clues: mask[cell] = 1 where the clue holds */
  mask: Uint8Array | null;
}

export interface Problem {
  ctx: PuzzleCtx;
  n: number;
  clues: CClue[];
}

/** Domains: for each person the sorted list of still-possible cells. */
export type Domains = number[][];

export function compileClue(ctx: PuzzleCtx, owner: number, pred: Predicate): CClue {
  const f = compilePredicate(pred, owner, ctx);
  const global = isGlobalPredicate(pred);
  const others = predicatePeople(pred)
    .map((id) => ctx.personIndex.get(id) ?? -1)
    .filter((i) => i >= 0 && i !== owner);
  const deps = [owner, ...new Set(others)];
  const unary = !global && deps.length === 1;
  let mask: Uint8Array | null = null;
  if (unary) {
    const g = ctx.grid;
    mask = new Uint8Array(g.size);
    const pos = new Int16Array(ctx.personIds.length).fill(-1);
    for (let c = 0; c < g.size; c++) {
      pos[owner] = c;
      mask[c] = f(pos) === 1 ? 1 : 0;
    }
  }
  return { owner, deps: global ? [] : deps, global, unary, f, pred, mask };
}

export function makeProblem(ctx: PuzzleCtx, list: { owner: number; pred: Predicate }[]): Problem {
  return { ctx, n: ctx.personIds.length, clues: list.map((x) => compileClue(ctx, x.owner, x.pred)) };
}

/** Free cells filtered by every active unary clue. */
export function initialDomains(prob: Problem, act: Uint8Array): Domains {
  const g = prob.ctx.grid;
  const D: Domains = [];
  for (let p = 0; p < prob.n; p++) D.push(g.free.slice());
  prob.clues.forEach((cl, ci) => {
    if (!act[ci] || !cl.unary || !cl.mask) return;
    const m = cl.mask;
    D[cl.owner] = (D[cl.owner] as number[]).filter((c) => m[c] === 1);
  });
  return D;
}

export const cloneDomains = (D: Domains): Domains => D.map((d) => d.slice());
export const allSingle = (D: Domains): boolean => D.every((d) => d.length === 1);

/** Product-size guard for ternary support enumeration (human-plausible + cheap). */
const TERNARY_LIMIT = 900;

/**
 * Bring D to a propagation fixpoint for the active clues. Returns false on
 * contradiction (some domain emptied). `dirty`: when D is already a fixpoint
 * for the active set except for changes to these people (or a newly added
 * clue touching them), only the affected clues are revisited.
 */
export function propagate(prob: Problem, act: Uint8Array, D: Domains, dirty?: number[]): boolean {
  const { n, clues } = prob;
  const g = prob.ctx.grid;
  const pos = new Int16Array(n).fill(-1);
  let stamp = 1;
  const changedAt = new Int32Array(n);
  const singleDone = new Uint8Array(n);
  if (dirty) {
    for (const p of dirty) changedAt[p] = 1;
    for (let p = 0; p < n; p++) if (changedAt[p] === 0 && (D[p] as number[]).length === 1) singleDone[p] = 1;
  } else changedAt.fill(1);
  const seenAt = new Int32Array(clues.length);

  const setDom = (q: number, list: number[]): void => {
    D[q] = list;
    changedAt[q] = ++stamp;
  };

  // ── support search: is there an assignment of `rest` (distinct cells) making f true?
  const supported = (cl: CClue, rest: number[], k: number): boolean => {
    if (k === rest.length) return cl.f(pos) === 1;
    const q = rest[k] as number;
    for (const c of D[q] as number[]) {
      let clash = false;
      for (let j = 0; j < pos.length; j++) if (pos[j] === c && j !== q) { clash = true; break; }
      if (clash) continue;
      pos[q] = c;
      const ok = supported(cl, rest, k + 1);
      pos[q] = -1;
      if (ok) return true;
    }
    return false;
  };

  /** -1 contradiction, 0 unchanged, 1 changed */
  const reviseLocal = (cl: CClue): number => {
    let changed = 0;
    for (const v of cl.deps) {
      const rest = cl.deps.filter((x) => x !== v);
      if (rest.length >= 2) {
        let prod = 1;
        for (const q of rest) prod *= (D[q] as number[]).length;
        if (prod > TERNARY_LIMIT) continue;
      }
      const dv = D[v] as number[];
      const nd: number[] = [];
      for (const c of dv) {
        pos[v] = c;
        if (supported(cl, rest, 0)) nd.push(c);
        pos[v] = -1;
      }
      if (nd.length !== dv.length) {
        if (nd.length === 0) return -1;
        setDom(v, nd);
        changed = 1;
      }
    }
    return changed;
  };

  const reviseGlobal = (cl: CClue): number => {
    const s = cl.owner;
    const roomOf = g.roomOf;
    const nRooms = g.roomIds.length;
    let changed = 0;
    // room-level summary of every domain
    const fixedRoom = new Int16Array(n);
    const canBe = new Uint8Array(n * nRooms);
    const summarize = (): void => {
      for (let q = 0; q < n; q++) {
        const d = D[q] as number[];
        let fr = d.length ? (roomOf[d[0] as number] as number) : -1;
        for (const c of d) {
          const R = roomOf[c] as number;
          canBe[q * nRooms + R] = 1;
          if (R !== fr) fr = -1;
        }
        fixedRoom[q] = fr;
      }
    };
    const restrictTo = (q: number, keep: (c: number) => boolean): boolean => {
      const d = D[q] as number[];
      const nd = d.filter(keep);
      if (nd.length === d.length) return true;
      if (nd.length === 0) return false;
      setDom(q, nd);
      changed = 1;
      return true;
    };
    const p = cl.pred;
    if (p.type === 'aloneInRoom' || p.type === 'roomCount') {
      canBe.fill(0);
      summarize();
      const counts = (R: number): [number, number] => {
        let kf = 0, kp = 0;
        for (let q = 0; q < n; q++) {
          if (q === s) continue;
          if (fixedRoom[q] === R) kf++;
          if (canBe[q * nRooms + R]) kp++;
        }
        return [kf, kp];
      };
      const okCount = (R: number): boolean => {
        const [kf, kp] = counts(R);
        if (p.type === 'aloneInRoom') return kf === 0;
        const lo = 1 + kf, hi = 1 + kp;
        return p.cmp === 'exactly' ? lo <= p.n && p.n <= hi : p.cmp === 'atLeast' ? hi >= p.n : lo <= p.n;
      };
      if (!restrictTo(s, (c) => okCount(roomOf[c] as number))) return -1;
      if (changed) { canBe.fill(0); summarize(); }
      const R = fixedRoom[s] as number;
      if (R >= 0) {
        const [kf, kp] = counts(R);
        const capReached = p.type === 'aloneInRoom' ? true
          : (p.cmp === 'exactly' || p.cmp === 'atMost') && 1 + kf === p.n;
        const mustFill = p.type === 'roomCount' && (p.cmp === 'exactly' || p.cmp === 'atLeast') && 1 + kp === p.n;
        for (let q = 0; q < n; q++) {
          if (q === s) continue;
          if (capReached && fixedRoom[q] !== R) {
            if (!restrictTo(q, (c) => roomOf[c] !== R)) return -1;
          } else if (mustFill && canBe[q * nRooms + R]) {
            if (!restrictTo(q, (c) => roomOf[c] === R)) return -1;
          }
        }
      }
      return changed;
    }
    // generic: only people already pinned to one cell are taken into account
    for (let q = 0; q < n; q++) pos[q] = q !== s && (D[q] as number[]).length === 1 ? ((D[q] as number[])[0] as number) : -1;
    const ok = restrictTo(s, (c) => {
      pos[s] = c;
      const v = cl.f(pos);
      pos[s] = -1;
      return v !== 0;
    });
    pos.fill(-1);
    return ok ? changed : -1;
  };

  let progress = true;
  while (progress) {
    progress = false;
    // all-different: a person pinned to a cell takes it away from everyone else
    for (let p = 0; p < n; p++) {
      const d = D[p] as number[];
      if (d.length === 0) return false;
      if (d.length === 1 && !singleDone[p]) {
        singleDone[p] = 1;
        const c = d[0] as number;
        for (let q = 0; q < n; q++) {
          if (q === p) continue;
          const dq = D[q] as number[];
          if (dq.includes(c)) {
            const nd = dq.filter((x) => x !== c);
            if (nd.length === 0) return false;
            setDom(q, nd);
            progress = true;
          }
        }
      }
    }
    for (let ci = 0; ci < clues.length; ci++) {
      if (!act[ci]) continue;
      const cl = clues[ci] as CClue;
      if (cl.unary) continue;
      let need = false;
      if (cl.global) need = stamp > (seenAt[ci] as number);
      else for (const d of cl.deps) if ((changedAt[d] as number) > (seenAt[ci] as number)) { need = true; break; }
      if (!need) continue;
      seenAt[ci] = stamp;
      const r = cl.global ? reviseGlobal(cl) : reviseLocal(cl);
      if (r < 0) return false;
      if (r > 0) progress = true;
    }
  }
  return true;
}

/**
 * "What-if" probing (singleton consistency) restricted to people with at most
 * `probeMax` candidate cells: try each cell, propagate, discard the cell when
 * that leads to a contradiction. Modifies D. Returns false on contradiction.
 */
export function probe(prob: Problem, act: Uint8Array, D: Domains, probeMax: number): boolean {
  if (probeMax < 2) return true;
  for (;;) {
    if (allSingle(D)) return true;
    const order: number[] = [];
    for (let p = 0; p < prob.n; p++) {
      const len = (D[p] as number[]).length;
      if (len >= 2 && len <= probeMax) order.push(p);
    }
    order.sort((a, b) => (D[a] as number[]).length - (D[b] as number[]).length);
    let progress = false;
    for (const p of order) {
      for (const c of (D[p] as number[]).slice()) {
        const Dc = cloneDomains(D);
        Dc[p] = [c];
        if (!propagate(prob, act, Dc, [p])) {
          D[p] = (D[p] as number[]).filter((x) => x !== c);
          progress = true;
        }
      }
      if (progress) {
        if (!propagate(prob, act, D, [p])) return false;
        break;
      }
    }
    if (!progress) return true;
  }
}

export type DeduceStatus = 'solved' | 'stuck' | 'contradiction';

/** From scratch: unary filtering → propagation → probing. */
export function deduce(prob: Problem, act: Uint8Array, probeMax: number): { status: DeduceStatus; D: Domains } {
  const D = initialDomains(prob, act);
  if (!propagate(prob, act, D)) return { status: 'contradiction', D };
  if (!probe(prob, act, D, probeMax)) return { status: 'contradiction', D };
  return { status: allSingle(D) ? 'solved' : 'stuck', D };
}

/**
 * Exhaustive backtracking. Returns up to `limit` solutions as position arrays
 * (person index → cell index).
 */
export function search(prob: Problem, act: Uint8Array, limit: number): Int16Array[] {
  const { n, clues } = prob;
  const D = initialDomains(prob, act);
  const results: Int16Array[] = [];
  if (!propagate(prob, act, D)) return results;
  const size = prob.ctx.grid.size;

  // clues to check whenever person p is (tentatively) placed
  const byPerson: number[][] = Array.from({ length: n }, () => []);
  const nonUnary: number[] = [];
  clues.forEach((cl, ci) => {
    if (!act[ci] || cl.unary) return;
    nonUnary.push(ci);
    if (cl.global) for (let p = 0; p < n; p++) (byPerson[p] as number[]).push(ci);
    else for (const p of cl.deps) (byPerson[p] as number[]).push(ci);
  });

  const pos = new Int16Array(n).fill(-1);
  const occ = new Uint8Array(size);

  const consistent = (p: number, c: number): boolean => {
    pos[p] = c;
    for (const ci of byPerson[p] as number[]) {
      if ((clues[ci] as CClue).f(pos) === 0) { pos[p] = -1; return false; }
    }
    pos[p] = -1;
    return true;
  };

  const rec = (placed: number): boolean => {
    if (placed === n) {
      for (const ci of nonUnary) if ((clues[ci] as CClue).f(pos) !== 1) return false;
      results.push(pos.slice());
      return results.length >= limit;
    }
    // most-constrained person first (forward checking)
    let best = -1;
    let bestList: number[] = [];
    for (let p = 0; p < n; p++) {
      if (pos[p] !== -1) continue;
      const list: number[] = [];
      for (const c of D[p] as number[]) if (!occ[c] && consistent(p, c)) list.push(c);
      if (list.length === 0) return false;
      if (best < 0 || list.length < bestList.length) { best = p; bestList = list; }
      if (list.length === 1) break;
    }
    for (const c of bestList) {
      pos[best] = c;
      occ[c] = 1;
      if (rec(placed + 1)) return true;
      occ[c] = 0;
      pos[best] = -1;
    }
    return false;
  };
  rec(0);
  return results;
}

/** Public: count solutions of a puzzle under the given clues (early exit at `limit`). */
export function countSolutions(
  puzzle: Puzzle,
  clues: Clue[],
  limit = 2,
): { count: number; first?: Record<string, Cell> } {
  const ctx = makePuzzleCtx(puzzle);
  const list: { owner: number; pred: Predicate }[] = [];
  for (const cl of clues) {
    const owner = ctx.personIndex.get(cl.personId);
    if (owner !== undefined) list.push({ owner, pred: cl.predicate });
  }
  const prob = makeProblem(ctx, list);
  const act = new Uint8Array(prob.clues.length).fill(1);
  const sols = search(prob, act, limit);
  const firstPos = sols[0];
  if (!firstPos) return { count: 0 };
  const first: Record<string, Cell> = {};
  ctx.personIds.forEach((id, i) => { first[id] = indexCell(ctx.grid.cols, firstPos[i] as number); });
  return { count: sols.length, first };
}

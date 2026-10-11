/**
 * Constraint machinery for Crime Files.
 *
 * The board is N×N with exactly N people and the always-on rule "exactly one
 * person per row and per column" — people → rows and people → columns are
 * both permutations. Everything below exploits that.
 *
 *  - `propagate`  : sound domain filtering — row/column exclusion (a person
 *                   confined to one row/column takes it away from everybody
 *                   else; a row/column only one person can reach must be
 *                   theirs), arc consistency over relational clues, and
 *                   room-occupancy reasoning. It never removes a cell that
 *                   belongs to a real solution.
 *  - `deduce`     : propagation + optional "what-if" probing on people with
 *                   few remaining cells. This models what a human can do and
 *                   is what the generator uses to certify a puzzle is
 *                   *deducible*, not merely unique.
 *  - `search`     : exhaustive backtracking over people (unary candidate
 *                   filtering, row/column exclusion, relational clues checked
 *                   once their people are placed, MRV ordering, row/column
 *                   coverage pruning) used to count solutions — the ground
 *                   truth for uniqueness.
 */
import type { Predicate } from '../types';
import type { PosFn, PuzzleCtx } from './predicates';
import { compilePredicate, isGlobalPredicate, predicatePeople } from './predicates';

/**
 * A global constraint that is not a clue predicate (variant rules such as
 * "exactly one person had a clear sight line to the victim"). `f` is
 * three-valued like a compiled predicate; `revise` (optional) is a sound
 * domain filter returning -1 contradiction, 0 unchanged, 1 changed.
 */
export interface CustomRule {
  f: PosFn;
  revise?: (D: Domains, setDom: (q: number, list: number[]) => void) => number;
}

/** One constraint of a problem: a predicate owned by a person, or a custom global rule. */
export type ProblemItem = { owner: number; pred: Predicate } | { owner: number; custom: CustomRule };

/** Always-true placeholder predicate (in a corner or not). */
const TAUTOLOGY: Predicate = { type: 'or', a: { type: 'corner', value: true }, b: { type: 'corner', value: false } };

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
  /** custom global rule (variant rules) */
  custom?: CustomRule;
}

export interface Problem {
  ctx: PuzzleCtx;
  n: number;
  clues: CClue[];
  /** cell → row / column */
  rowAt: Int8Array;
  colAt: Int8Array;
  /** every row (resp. column) must hold somebody: n === rows (resp. cols) */
  fullRows: boolean;
  fullCols: boolean;
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

export function compileItem(ctx: PuzzleCtx, it: ProblemItem): CClue {
  if ('custom' in it) {
    return { owner: it.owner, deps: [], global: true, unary: false, f: it.custom.f, pred: TAUTOLOGY, mask: null, custom: it.custom };
  }
  return compileClue(ctx, it.owner, it.pred);
}

export function makeProblem(ctx: PuzzleCtx, list: ProblemItem[]): Problem {
  const g = ctx.grid;
  const n = ctx.personIds.length;
  const rowAt = new Int8Array(g.size), colAt = new Int8Array(g.size);
  for (let c = 0; c < g.size; c++) { rowAt[c] = Math.floor(c / g.cols); colAt[c] = c % g.cols; }
  return {
    ctx, n, clues: list.map((x) => compileItem(ctx, x)), rowAt, colAt,
    fullRows: n === g.rows, fullCols: n === g.cols,
  };
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
 * Row/column exclusion to a fixpoint (the "one per row, one per column"
 * rule). -1 contradiction, 0 unchanged, 1 changed.
 */
function lineExclusion(prob: Problem, D: Domains, setDom: (q: number, list: number[]) => void): number {
  const n = prob.n;
  let changed = 0;
  const mask = new Int32Array(n);
  for (let axisNo = 0; axisNo < 2; axisNo++) {
    const axis = axisNo === 0 ? prob.rowAt : prob.colAt;
    const full = axisNo === 0 ? prob.fullRows : prob.fullCols;
    const L = axisNo === 0 ? prob.ctx.grid.rows : prob.ctx.grid.cols;
    let again = true;
    while (again) {
      again = false;
      for (let p = 0; p < n; p++) {
        let m = 0;
        for (const c of D[p] as number[]) m |= 1 << (axis[c] as number);
        if (m === 0) return -1;
        mask[p] = m;
      }
      // a person confined to one line owns it
      for (let p = 0; p < n; p++) {
        const m = mask[p] as number;
        if ((m & (m - 1)) !== 0) continue;
        for (let q = 0; q < n; q++) {
          if (q === p || ((mask[q] as number) & m) === 0) continue;
          const nd = (D[q] as number[]).filter((c) => ((1 << (axis[c] as number)) & m) === 0);
          if (!nd.length) return -1;
          setDom(q, nd);
          mask[q] = (mask[q] as number) & ~m;
          changed = 1;
          again = true;
        }
      }
      // a line only one person can reach is theirs
      if (full) {
        for (let l = 0; l < L; l++) {
          const bit = 1 << l;
          let who = -1, cnt = 0;
          for (let p = 0; p < n; p++) if ((mask[p] as number) & bit) { cnt++; who = p; }
          if (cnt === 0) return -1;
          if (cnt === 1 && mask[who] !== bit) {
            setDom(who, (D[who] as number[]).filter((c) => axis[c] === l));
            mask[who] = bit;
            changed = 1;
            again = true;
          }
        }
      }
    }
  }
  return changed;
}

/**
 * Bring D to a propagation fixpoint for the active clues. Returns false on
 * contradiction (some domain emptied). `dirty`: when D is already a fixpoint
 * for the active set except for changes to these people (or a newly added
 * clue touching them), only the affected clues are revisited.
 */
export function propagate(prob: Problem, act: Uint8Array, D: Domains, dirty?: number[]): boolean {
  const { n, clues, rowAt, colAt } = prob;
  const g = prob.ctx.grid;
  const pos = new Int16Array(n).fill(-1);
  let stamp = 1;
  const changedAt = new Int32Array(n);
  if (dirty) for (const p of dirty) changedAt[p] = 1;
  else changedAt.fill(1);
  const seenAt = new Int32Array(clues.length);

  const setDom = (q: number, list: number[]): void => {
    D[q] = list;
    changedAt[q] = ++stamp;
  };

  // ── support search: is there an assignment of `rest` (cells in distinct rows and columns) making f true?
  const supported = (cl: CClue, rest: number[], k: number): boolean => {
    if (k === rest.length) return cl.f(pos) === 1;
    const q = rest[k] as number;
    const deps = cl.deps;
    for (const c of D[q] as number[]) {
      let clash = false;
      // only the clue's own people are ever placed in pos here
      for (let jj = 0; jj < deps.length; jj++) {
        const j = deps[jj] as number;
        const pj = pos[j] as number;
        if (pj >= 0 && j !== q && (rowAt[pj] === rowAt[c] || colAt[pj] === colAt[c])) { clash = true; break; }
      }
      if (clash) continue;
      pos[q] = c;
      const ok = supported(cl, rest, k + 1);
      pos[q] = -1;
      if (ok) return true;
    }
    return false;
  };

  /** -1 contradiction, 0 unchanged, 1 changed */
  const reviseLocal = (cl: CClue, since: number): number => {
    let changed = 0;
    for (const v of cl.deps) {
      const rest = cl.deps.filter((x) => x !== v);
      // arc revision is directional: v only loses support when another person of the clue changed
      let otherChanged = false;
      for (const q of rest) if ((changedAt[q] as number) > since) { otherChanged = true; break; }
      if (!otherChanged) continue;
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
    if (cl.custom) {
      if (cl.custom.revise) {
        const r = cl.custom.revise(D, (q, list) => {
          if (list.length !== (D[q] as number[]).length) { setDom(q, list); changed = 1; }
        });
        if (r < 0) return -1;
      }
      // people pinned to one cell must not already violate the rule
      for (let q = 0; q < n; q++) pos[q] = (D[q] as number[]).length === 1 ? ((D[q] as number[])[0] as number) : -1;
      const v = cl.f(pos);
      pos.fill(-1);
      return v === 0 ? -1 : changed;
    }
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

  // active non-unary clues (unary ones live in the initial domains)
  const live: number[] = [];
  for (let ci = 0; ci < clues.length; ci++) if (act[ci] && !(clues[ci] as CClue).unary) live.push(ci);
  let progress = true;
  let leStamp = -1;
  while (progress) {
    progress = false;
    if (leStamp !== stamp) {
      const le = lineExclusion(prob, D, setDom);
      if (le < 0) return false;
      // the column pass can enable new row deductions (and vice versa): run to a joint fixpoint
      if (le > 0) progress = true;
      else leStamp = stamp;
    }
    for (const ci of live) {
      const cl = clues[ci] as CClue;
      let need = false;
      if (cl.global) need = stamp > (seenAt[ci] as number);
      else for (const d of cl.deps) if ((changedAt[d] as number) > (seenAt[ci] as number)) { need = true; break; }
      if (!need) continue;
      const since = seenAt[ci] as number;
      seenAt[ci] = stamp;
      const r = cl.global ? reviseGlobal(cl) : reviseLocal(cl, since);
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
      const len = (D[p] as number[]).length;
      if (len < 2 || len > probeMax) continue;
      let removed = false;
      for (const c of (D[p] as number[]).slice()) {
        const Dc = cloneDomains(D);
        Dc[p] = [c];
        if (!propagate(prob, act, Dc, [p])) {
          D[p] = (D[p] as number[]).filter((x) => x !== c);
          removed = true;
        }
      }
      if (removed) {
        progress = true;
        if (!propagate(prob, act, D, [p])) return false;
      }
    }
    if (!progress) return true;
  }
}

export type DeduceStatus = 'solved' | 'stuck' | 'contradiction';

/** From scratch: unary filtering → propagation (incl. row/column exclusion) → probing. */
export function deduce(prob: Problem, act: Uint8Array, probeMax: number): { status: DeduceStatus; D: Domains } {
  const D = initialDomains(prob, act);
  if (!propagate(prob, act, D)) return { status: 'contradiction', D };
  if (!probe(prob, act, D, probeMax)) return { status: 'contradiction', D };
  return { status: allSingle(D) ? 'solved' : 'stuck', D };
}

/**
 * Exhaustive backtracking over people. Returns up to `limit` solutions as
 * position arrays (person index → cell index).
 */
export function search(prob: Problem, act: Uint8Array, limit: number): Int16Array[] {
  const { n, clues, rowAt, colAt } = prob;
  const g = prob.ctx.grid;
  const D = initialDomains(prob, act);
  const results: Int16Array[] = [];
  if (!propagate(prob, act, D)) return results;
  const allRows = (1 << g.rows) - 1, allCols = (1 << g.cols) - 1;

  // non-unary clues to check whenever person p is (tentatively) placed
  const byPerson: number[][] = Array.from({ length: n }, () => []);
  const nonUnary: number[] = [];
  clues.forEach((cl, ci) => {
    if (!act[ci] || cl.unary) return;
    nonUnary.push(ci);
    if (cl.global) for (let p = 0; p < n; p++) (byPerson[p] as number[]).push(ci);
    else for (const p of cl.deps) (byPerson[p] as number[]).push(ci);
  });

  const pos = new Int16Array(n).fill(-1);
  let rowUsed = 0, colUsed = 0;

  const consistent = (p: number, c: number): boolean => {
    const list = byPerson[p] as number[];
    if (!list.length) return true;
    pos[p] = c;
    for (const ci of list) {
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
    // forward check every unplaced person; most-constrained first
    let best = -1;
    let bestList: number[] = [];
    let rowCover = rowUsed, colCover = colUsed;
    for (let p = 0; p < n; p++) {
      if (pos[p] !== -1) continue;
      const list: number[] = [];
      for (const c of D[p] as number[]) {
        const rb = 1 << (rowAt[c] as number), cb = 1 << (colAt[c] as number);
        if ((rowUsed & rb) || (colUsed & cb)) continue;
        if (!consistent(p, c)) continue;
        list.push(c);
        rowCover |= rb;
        colCover |= cb;
      }
      if (list.length === 0) return false;
      if (best < 0 || list.length < bestList.length) { best = p; bestList = list; }
    }
    // every free row / column must still be reachable by someone
    if (prob.fullRows && rowCover !== allRows) return false;
    if (prob.fullCols && colCover !== allCols) return false;
    for (const c of bestList) {
      const rb = 1 << (rowAt[c] as number), cb = 1 << (colAt[c] as number);
      pos[best] = c;
      rowUsed |= rb;
      colUsed |= cb;
      if (rec(placed + 1)) return true;
      rowUsed &= ~rb;
      colUsed &= ~cb;
      pos[best] = -1;
    }
    return false;
  };
  rec(0);
  return results;
}

/**
 * Ask Otto — the explained hint (docs/FLOORPLAN-DESIGN.md §5, §7).
 *
 * `nextDeduction(puzzle, { placements, crosses })` looks at the player's
 * current pins and red crosses and returns the *simplest* next logical step,
 * explained in one or two sentences in Otto's voice. It never reads
 * `puzzle.solution`: everything is reasoned from the clues, the board rules
 * (one person per row and per column, blocking furniture) and the marks.
 *
 * Order of business:
 *  0. mistakes — a pin that contradicts a solution-independent fact (blocking
 *     furniture, two pins in a row/column, the pinned person's own words, two
 *     pinned people's words, room counts), or marks that leave somebody / some
 *     row nowhere to go.
 *  a. single cell        — a person with exactly one candidate square → place
 *  b. row/column owner   — a line only one person can reach (→ place / cross
 *                          their other squares), or a person confined to one
 *                          line (→ cross that line for someone else)
 *  c. unary elimination  — squares the person's own sentence rules out → cross
 *  d. relational         — sentences about another person (same room,
 *                          diagonal, north of, distance, sight, either/or …)
 *  e. locked sets        — two/three people sharing two/three rows or columns
 *  f. room counts        — the killer rule and other "people in my room" rules
 *  g. what-if            — try a square, propagate a bounded number of rounds,
 *                          cross it when the plan falls apart
 * Liar variants: only liar-independent reasoning is used until the liar can
 * be named from the board (or by trying every suspect as the liar).
 */
import type { Cell, FurnitureKind, Person, Predicate, Puzzle, Variant } from '../types';
import { FURNITURE_LABEL } from '../types';
import type { GridCtx } from './geometry';
import { indexCell } from './geometry';
import type { PosFn, PuzzleCtx } from './predicates';
import { compilePredicate, isGlobalPredicate, makePuzzleCtx, predicatePeople } from './predicates';
import { hashSeed } from './rng';
import type { RuleSpec } from './rules';
import { baseRuleItems, hitFor, hypothesisItems } from './rules';
import type { CustomRule, ProblemItem } from './solver';
import { numberWord } from './text';

// ─────────────────────────── Public types ───────────────────────────

export type DeductionKind = 'place' | 'cross' | 'mistake';

export interface Deduction {
  kind: DeductionKind;
  /** the person to pin / whose squares to cross / who is wrongly pinned */
  personId: string;
  /** squares to place (1) or cross (≥ 1); for mistakes: the offending pin(s) */
  cells: Cell[];
  /** squares the UI should outline as "why" */
  reasonCells: Cell[];
  /** Otto's explanation (≤ 2 sentences after "Hm.") */
  text: string;
  /** technique id: single-cell, row-owner, line-confined, unary, relational, locked-set, room-count, what-if,
   *  liar-what-if, mistake-*; prefixed with "liar/" when the step relies on the liar having been named */
  rule: string;
}

export interface OttoState {
  placements: Record<string, Cell | null>;
  /** cellKey "r,c" → ids of the people ruled OUT on that square (CellMarks.crosses) */
  crosses: Record<string, string[]>;
}

/** What the UI shows when `nextDeduction` returns null. */
export const OTTO_STUCK_TEXT = "Hm. Even I'd have to guess here. Try a pencil mark.";

// ─────────────────────────── Tuning ───────────────────────────

/** relational support enumeration guard (product of the other people's candidate counts) */
const SUPPORT_LIMIT = 900;
/** what-if: probe people with at most this many candidate squares */
const PROBE_MAX = 6;
/** what-if: propagation rounds after the trial pin */
const PROBE_ROUNDS = 3;
/** liar hypotheses: propagation rounds per hypothesis */
const HYP_ROUNDS = 8;

const LIAR_VARIANTS = new Set<Variant>(['liar', 'liarDouble', 'accompliceLiar']);

// ─────────────────────────── Per-puzzle precomputation ───────────────────────────

interface CC {
  /** index in puzzle.clues; -1 for scenario rules (not a written sentence) */
  ci: number;
  owner: number;
  /** people the clue depends on (owner first); [] for global clues */
  deps: number[];
  global: boolean;
  unary: boolean;
  f: PosFn;
  /** the predicate as evaluated (wrapped in `not` for a liar's clue) */
  pred: Predicate;
  /** the clue as written */
  orig: Predicate;
  negated: boolean;
  /** the victim's killer-rule sentence */
  killer: boolean;
  mask: Uint8Array | null;
  /** scenario rule from rules.ts (variant rule or liar-hypothesis item) */
  rule: boolean;
  /** custom global rule (no predicate) */
  custom: CustomRule | null;
  /** how Otto words a scenario rule */
  desc: ((tk: TK) => string) | null;
}

interface Hyp {
  /** -2: everyone truthful, -1: liar unknown (liar-safe), s: suspect s is the liar */
  liar: number;
  unaryBy: CC[][];
  local: CC[];
  global: CC[];
  mask: Uint8Array[];
}

interface Pre {
  p: Puzzle;
  ctx: PuzzleCtx;
  g: GridCtx;
  n: number;
  rows: number;
  cols: number;
  rowAt: Int16Array;
  colAt: Int16Array;
  people: Person[];
  victim: boolean[];
  /** victim person indices, in RuleSpec order */
  victims: number[];
  variant: Variant;
  liarVariant: boolean;
  truth: CC[];
  neg: CC[];
  /** the variant's always-true rules (rules.ts baseRuleItems) */
  rules: CC[];
  /** liar variants: per suspect, what "this suspect is the liar" adds (rules.ts hypothesisItems) */
  hypItems: CC[][];
  trueMask: Uint8Array[];
  falseMask: Uint8Array[];
  hyps: Map<number, Hyp>;
  roomName: Map<string, string>;
  scratch: Int16Array;
  /** liar hypotheses refuted so far (valid for any board extending the proof) */
  dead: Map<number, Proof>;
}

const preCache = new WeakMap<Puzzle, Pre>();
const TAUTOLOGY: Predicate = { type: 'or', a: { type: 'corner', value: true }, b: { type: 'corner', value: false } };

function compileCC(ctx: PuzzleCtx, ci: number, owner: number, orig: Predicate, negated: boolean, killer: boolean): CC {
  const pred: Predicate = negated ? { type: 'not', p: orig } : orig;
  const f = compilePredicate(pred, owner, ctx);
  const global = isGlobalPredicate(pred);
  const others = [...new Set(predicatePeople(pred)
    .map((id) => ctx.personIndex.get(id) ?? -1)
    .filter((i) => i >= 0 && i !== owner))];
  const unary = !global && others.length === 0;
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
  return {
    ci, owner, deps: global ? [] : [owner, ...others], global, unary, f, pred, orig, negated, killer, mask,
    rule: false, custom: null, desc: null,
  };
}

/** A rules.ts item as a CC, with Otto's wording for it. */
function ruleCC(ctx: PuzzleCtx, it: ProblemItem, desc: (tk: TK) => string): CC {
  if ('custom' in it) {
    return {
      ci: -1, owner: it.owner, deps: [], global: true, unary: false, f: it.custom.f, pred: TAUTOLOGY, orig: TAUTOLOGY,
      negated: false, killer: false, mask: null, rule: true, custom: it.custom, desc,
    };
  }
  const cc = compileCC(ctx, -1, it.owner, it.pred, false, false);
  cc.rule = true;
  cc.desc = desc;
  return cc;
}

/** Otto's wording of a scenario rule item (base rule, or "L is the liar" item when `liar` ≥ 0). */
function describeItem(variant: Variant, victims: number[], poisonKind: FurnitureKind | undefined, it: ProblemItem, liar: number): (tk: TK) => string {
  const [v, w] = victims as [number, number | undefined];
  return (tk) => {
    const V = tk.name(v), P = tk.pr(v);
    if (liar >= 0) {
      const L = tk.name(liar), PL = tk.pr(liar);
      if ('custom' in it) return `${L} is the liar, so ${PL.he} was the accomplice — the one farther from ${V}`;
      if (variant === 'liarDouble' && w !== undefined) return `${L} is the liar, and the liar is a killer, so ${PL.he} was in ${V}'s or ${tk.name(w)}'s room`;
      const role = variant === 'accompliceLiar' ? 'the accomplice' : 'the killer';
      return `${L} is the liar, and the liar is ${role}, so ${PL.he} was in ${V}'s room`;
    }
    if ('custom' in it) {
      switch (variant) {
        case 'lockedRoom': return `only one person was in a room next to ${V}'s`;
        case 'poison': return poisonKind
          ? `the poison was in the ${tk.furnNoun(poisonKind)}, and only one person stood beside one`
          : 'only one person stood beside the poison';
        case 'sniper': return `only one person had a clear line of sight to ${V}`;
        case 'accomplice': case 'accompliceLiar': return `the two people with ${V} stood at different distances from ${P.him}`;
        default: return `the rule of this case says otherwise about ${V}`;
      }
    }
    const pr = it.pred;
    const owner = it.owner;
    const O = tk.name(owner), PO = tk.pr(owner);
    if (pr.type === 'roomCount' && pr.cmp === 'exactly' && pr.n === 2) return `${O} was alone with ${victims.length > 1 ? `${PO.his} killer` : 'the killer'}`;
    if (pr.type === 'roomCount' && pr.cmp === 'exactly') return `${O} shared ${PO.his} room with exactly ${numberWord(pr.n - 1)} others`;
    if (pr.type === 'aloneInRoom') return variant === 'lockedRoom' ? `${O} was alone behind a locked door` : `${O} was alone in ${PO.his} room`;
    if (pr.type === 'notBesideFurniture') return `the poison was in the ${tk.furnNoun(pr.kind)}, and ${O} wasn't beside one`;
    if (pr.type === 'differentRoomFrom') {
      const q = tk.pre.ctx.personIndex.get(pr.personId);
      return `${O} and ${q === undefined ? 'the other victim' : tk.name(q)} died in different rooms`;
    }
    return `${O} was ${tk.frag(pr, owner)}`;
  };
}

function getPre(p: Puzzle): Pre {
  const hit = preCache.get(p);
  if (hit) return hit;
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const n = ctx.personIds.length;
  const people = ctx.personIds.map((id) => p.people.find((x) => x.id === id) as Person);
  const victimIds = p.victimIds ?? [];
  const victim = people.map((x) => x.isVictim || victimIds.includes(x.id));
  const victims = victimIds.length
    ? victimIds.map((id) => ctx.personIndex.get(id) ?? -1).filter((q) => q >= 0)
    : people.map((_x, q) => q).filter((q) => victim[q]);
  const variant: Variant = p.variant ?? 'classic';
  const liarVariant = LIAR_VARIANTS.has(variant);
  const firstOf = new Map<string, number>();
  p.clues.forEach((cl, ci) => { if (!firstOf.has(cl.personId)) firstOf.set(cl.personId, ci); });
  const truth: CC[] = [];
  const neg: CC[] = [];
  p.clues.forEach((cl, ci) => {
    const owner = ctx.personIndex.get(cl.personId);
    if (owner === undefined) return;
    const killer = !!victim[owner] && firstOf.get(cl.personId) === ci;
    truth.push(compileCC(ctx, ci, owner, cl.predicate, false, killer));
    if (liarVariant) neg.push(compileCC(ctx, ci, owner, cl.predicate, true, killer));
  });
  // scenario rules (the victim sentence's real meaning, incl. custom "exactly one" rules)
  const spec: RuleSpec = { variant, victims, poisonKind: p.poisonKind };
  const rules = victims.length ? baseRuleItems(ctx, spec).map((it) => ruleCC(ctx, it, describeItem(variant, victims, p.poisonKind, it, -1))) : [];
  const hypItems: CC[][] = people.map((_x, q) => (liarVariant && victims.length && !victim[q]
    ? hypothesisItems(ctx, spec, q).map((it) => ruleCC(ctx, it, describeItem(variant, victims, p.poisonKind, it, q)))
    : []));

  const ones = (): Uint8Array => new Uint8Array(g.size).fill(1);
  const trueMask = people.map(() => ones());
  const falseMask = people.map(() => ones());
  for (const cc of truth) if (cc.mask) and(trueMask[cc.owner] as Uint8Array, cc.mask);
  for (const cc of neg) if (cc.mask) and(falseMask[cc.owner] as Uint8Array, cc.mask);
  for (const cc of rules) {
    if (!cc.mask) continue;
    and(trueMask[cc.owner] as Uint8Array, cc.mask);
    and(falseMask[cc.owner] as Uint8Array, cc.mask);
  }
  const rowAt = new Int16Array(g.size), colAt = new Int16Array(g.size);
  for (let c = 0; c < g.size; c++) { rowAt[c] = Math.floor(c / g.cols); colAt[c] = c % g.cols; }
  const pre: Pre = {
    p, ctx, g, n, rows: g.rows, cols: g.cols, rowAt, colAt, people, victim, victims, variant, liarVariant,
    truth, neg, rules, hypItems, trueMask, falseMask, hyps: new Map(),
    roomName: new Map(p.rooms.map((r) => [r.id, r.name])), scratch: new Int16Array(n).fill(-1), dead: new Map(),
  };
  preCache.set(p, pre);
  return pre;
}

function and(dst: Uint8Array, m: Uint8Array): void {
  for (let i = 0; i < dst.length; i++) dst[i] = (dst[i] as number) & (m[i] as number);
}

/** The clue set (and per-person unary masks) under a liar hypothesis. */
function getHyp(pre: Pre, liar: number): Hyp {
  const hit = pre.hyps.get(liar);
  if (hit) return hit;
  const n = pre.n;
  const unaryBy: CC[][] = Array.from({ length: n }, () => []);
  const local: CC[] = [];
  const global: CC[] = [];
  const mask: Uint8Array[] = [];
  const add = (cc: CC): void => {
    if (cc.unary) (unaryBy[cc.owner] as CC[]).push(cc);
    else if (cc.global) global.push(cc);
    else local.push(cc);
  };
  pre.truth.forEach((t, k) => {
    if (liar === -1 && !pre.victim[t.owner]) return;                  // suspects' words are unreliable
    add(liar >= 0 && t.owner === liar ? (pre.neg[k] as CC) : t);      // the liar: every sentence false
  });
  for (const cc of pre.rules) add(cc);
  if (liar >= 0) for (const cc of pre.hypItems[liar] ?? []) add(cc);
  for (let q = 0; q < n; q++) {
    const t = pre.trueMask[q] as Uint8Array, f = pre.falseMask[q] as Uint8Array;
    if (liar === -1 && !pre.victim[q]) {
      const m = new Uint8Array(t.length);
      for (let i = 0; i < m.length; i++) m[i] = (t[i] as number) | (f[i] as number);
      mask.push(m);
    } else mask.push(liar >= 0 && q === liar ? f : t);
  }
  const h: Hyp = { liar, unaryBy, local, global, mask };
  pre.hyps.set(liar, h);
  return h;
}

// ─────────────────────────── Board state ───────────────────────────

/** A refuted liar hypothesis and the marks that refuted it. */
interface Proof { pos: Int16Array; crossed: Uint8Array[] }

/** True when board b contains every pin and cross of the proof board. */
function extendsBoard(pr: Proof, b: Board): boolean {
  for (let q = 0; q < pr.pos.length; q++) {
    const c = pr.pos[q] as number;
    if (c >= 0 && b.pos[q] !== c) return false;
    const a = pr.crossed[q] as Uint8Array, bb = b.crossed[q] as Uint8Array;
    for (let i = 0; i < a.length; i++) if (a[i] && !bb[i]) return false;
  }
  return true;
}

interface Board {
  pos: Int16Array;
  crossed: Uint8Array[];
  rowUsed: number;
  colUsed: number;
  marks: number;
}

function readBoard(pre: Pre, s: OttoState): Board {
  const { n, g } = pre;
  const pos = new Int16Array(n).fill(-1);
  let marks = 0;
  pre.ctx.personIds.forEach((id, q) => {
    const c = s.placements[id];
    if (c && c.r >= 0 && c.c >= 0 && c.r < g.rows && c.c < g.cols) { pos[q] = c.r * g.cols + c.c; marks++; }
  });
  const crossed = Array.from({ length: n }, () => new Uint8Array(g.size));
  for (const key in s.crosses) {
    const ids = s.crosses[key];
    if (!ids || !ids.length) continue;
    const [rs, cs] = key.split(',');
    const r = Number(rs), c = Number(cs);
    if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 || r >= g.rows || c >= g.cols) continue;
    for (const id of ids) {
      const q = pre.ctx.personIndex.get(id);
      if (q !== undefined) { (crossed[q] as Uint8Array)[r * g.cols + c] = 1; marks++; }
    }
  }
  let rowUsed = 0, colUsed = 0;
  for (let q = 0; q < n; q++) {
    const c = pos[q] as number;
    if (c >= 0) { rowUsed |= 1 << (pre.rowAt[c] as number); colUsed |= 1 << (pre.colAt[c] as number); }
  }
  return { pos, crossed, rowUsed, colUsed, marks };
}

/** Candidate squares: placed → their pin; unplaced → free, uncrossed, row/col open, fits the unary masks. */
function domains(pre: Pre, b: Board, h: Hyp): number[][] {
  const D: number[][] = [];
  for (let q = 0; q < pre.n; q++) {
    const pq = b.pos[q] as number;
    if (pq >= 0) { D.push([pq]); continue; }
    const cr = b.crossed[q] as Uint8Array, m = h.mask[q] as Uint8Array;
    const d: number[] = [];
    for (const c of pre.g.free) {
      if (cr[c] || !m[c]) continue;
      if ((b.rowUsed >> (pre.rowAt[c] as number)) & 1 || (b.colUsed >> (pre.colAt[c] as number)) & 1) continue;
      d.push(c);
    }
    D.push(d);
  }
  return D;
}

const cloneD = (D: number[][]): number[][] => D.map((d) => d.slice());

// ─────────────────────────── Text kit ───────────────────────────

interface Pron { He: string; he: string; him: string; his: string; himself: string }
const pronOf = (x: Person): Pron => (x.pronoun === 'he'
  ? { He: 'He', he: 'he', him: 'him', his: 'his', himself: 'himself' }
  : { He: 'She', he: 'she', him: 'her', his: 'her', himself: 'herself' });

class TK {
  constructor(readonly pre: Pre, readonly b: Board, readonly h: Hyp) {}

  name(q: number): string { return (this.pre.people[q] as Person).name; }
  pr(q: number): Pron { return pronOf(this.pre.people[q] as Person); }
  cell(i: number): string { return `${String.fromCharCode(65 + (this.pre.colAt[i] as number))}${(this.pre.rowAt[i] as number) + 1}`; }
  line(axis: number, l: number): string { return axis === 0 ? `row ${l + 1}` : `column ${String.fromCharCode(65 + l)}`; }
  room(R: number): string { return (this.pre.p.rooms[R] as { name: string }).name; }
  roomById(id: string): string { return this.pre.roomName.get(id) ?? 'that room'; }

  /** "B2", "B2 and C4", "B2, C4 and D1", or "seven squares" */
  cells(list: number[], conj = 'and'): string {
    if (list.length > 4) return `${numberWord(list.length)} squares`;
    const names = list.map((c) => this.cell(c));
    if (names.length <= 1) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} ${conj} ${names[names.length - 1]}`;
  }
  isAre(list: number[]): string { return list.length === 1 ? 'is' : 'are'; }
  names(qs: number[]): string {
    const ns = qs.map((q) => this.name(q));
    if (ns.length <= 1) return ns[0] ?? 'nobody';
    return `${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`;
  }

  pick<T>(arr: readonly T[], ...keys: (string | number)[]): T {
    return arr[hashSeed(this.pre.p.seed, this.b.marks, ...keys) % arr.length] as T;
  }

  furnA(k: FurnitureKind): string { return FURNITURE_LABEL[k].a; }
  furnNoun(k: FurnitureKind): string { return FURNITURE_LABEL[k].a.replace(/^(a|an|some) /, ''); }

  /** the phrase after "was" */
  frag(pr: Predicate, owner: number): string {
    const N = (id: string): string => {
      const q = this.pre.ctx.personIndex.get(id);
      return q === undefined ? 'someone' : this.name(q);
    };
    const P = this.pr(owner);
    switch (pr.type) {
      case 'inRoom': return `in the ${this.roomById(pr.roomId)}`;
      case 'notInRoom': return `not in the ${this.roomById(pr.roomId)}`;
      case 'onFurniture': return pr.kind === 'bathtub' ? 'in a bathtub' : `on ${this.furnA(pr.kind)}`;
      case 'notOnFurniture': return pr.kind === 'bathtub' ? 'not in a bathtub' : `not on any ${this.furnNoun(pr.kind)}`;
      case 'onAnyFurniture': return 'on a piece of furniture';
      case 'onNoFurniture': return 'on the bare floor';
      case 'besideFurniture': return `beside ${this.furnA(pr.kind)}`;
      case 'notBesideFurniture': return `nowhere near a ${this.furnNoun(pr.kind)}`;
      case 'besideAnyFurniture': return 'beside some furniture';
      case 'notBesideAnyFurniture': return 'not beside any furniture';
      case 'row': return `in ${this.line(0, pr.index)}`;
      case 'notRow': return `not in ${this.line(0, pr.index)}`;
      case 'col': return `in ${this.line(1, pr.index)}`;
      case 'notCol': return `not in ${this.line(1, pr.index)}`;
      case 'corner': return pr.value ? 'in a corner' : 'not in a corner';
      case 'edge': return pr.value ? 'on the edge of the plan' : 'away from the edge of the plan';
      case 'sameRoomAs': return `in the same room as ${N(pr.personId)}`;
      case 'differentRoomFrom': return `not in ${N(pr.personId)}'s room`;
      case 'besidePerson': return `diagonally beside ${N(pr.personId)}`;
      case 'notBesidePerson': return `not touching ${N(pr.personId)}`;
      case 'sameRowAs': return `in ${N(pr.personId)}'s row`;
      case 'sameColAs': return `in ${N(pr.personId)}'s column`;
      case 'dirOf': return `somewhere ${pr.dir} of ${N(pr.personId)}`;
      case 'directlyDirOf': return `directly ${pr.dir} of ${N(pr.personId)}`;
      case 'distance': {
        const w = numberWord(pr.n), X = N(pr.personId);
        return pr.cmp === 'exactly' ? `exactly ${w} steps from ${X}`
          : pr.cmp === 'atMost' ? `within ${w} steps of ${X}` : `at least ${w} steps from ${X}`;
      }
      case 'lineOfSight': return pr.value ? `in plain view of ${N(pr.personId)}` : `out of ${N(pr.personId)}'s sight`;
      case 'between': return `between ${N(pr.a)} and ${N(pr.b)}`;
      case 'aloneInRoom': return `alone in ${P.his} room`;
      case 'roomCount': {
        const w = numberWord(pr.n);
        return pr.cmp === 'exactly' ? `one of exactly ${w} people in ${P.his} room`
          : pr.cmp === 'atLeast' ? `one of at least ${w} people in ${P.his} room` : `in a room of at most ${w} people`;
      }
      case 'roomHasFurniture':
        return pr.value ? `in a room with ${this.furnA(pr.kind)}` : `in a room without ${FURNITURE_LABEL[pr.kind].plural}`;
      case 'roomSizeCmp': {
        const w = numberWord(pr.n);
        return pr.cmp === 'exactly' ? `in a room of exactly ${w} squares`
          : pr.cmp === 'atLeast' ? `in a room of at least ${w} squares` : `in a room of at most ${w} squares`;
      }
      case 'or': return `either ${this.frag(pr.a, owner)} or ${this.frag(pr.b, owner)}`;
      case 'not': return this.negFrag(pr.p, owner);
      default: return 'where the plan says';
    }
  }

  /** the phrase after "was" for the opposite of `pr` */
  negFrag(pr: Predicate, owner: number): string {
    const flip = ((): Predicate | null => {
      switch (pr.type) {
        case 'inRoom': return { type: 'notInRoom', roomId: pr.roomId };
        case 'notInRoom': return { type: 'inRoom', roomId: pr.roomId };
        case 'onFurniture': return { type: 'notOnFurniture', kind: pr.kind };
        case 'notOnFurniture': return { type: 'onFurniture', kind: pr.kind };
        case 'onAnyFurniture': return { type: 'onNoFurniture' };
        case 'onNoFurniture': return { type: 'onAnyFurniture' };
        case 'besideFurniture': return { type: 'notBesideFurniture', kind: pr.kind };
        case 'notBesideFurniture': return { type: 'besideFurniture', kind: pr.kind };
        case 'besideAnyFurniture': return { type: 'notBesideAnyFurniture' };
        case 'notBesideAnyFurniture': return { type: 'besideAnyFurniture' };
        case 'row': return { type: 'notRow', index: pr.index };
        case 'notRow': return { type: 'row', index: pr.index };
        case 'col': return { type: 'notCol', index: pr.index };
        case 'notCol': return { type: 'col', index: pr.index };
        case 'corner': return { type: 'corner', value: !pr.value };
        case 'edge': return { type: 'edge', value: !pr.value };
        case 'sameRoomAs': return { type: 'differentRoomFrom', personId: pr.personId };
        case 'differentRoomFrom': return { type: 'sameRoomAs', personId: pr.personId };
        case 'besidePerson': return { type: 'notBesidePerson', personId: pr.personId };
        case 'notBesidePerson': return { type: 'besidePerson', personId: pr.personId };
        case 'lineOfSight': return { type: 'lineOfSight', personId: pr.personId, value: !pr.value };
        case 'roomHasFurniture': return { type: 'roomHasFurniture', kind: pr.kind, value: !pr.value };
        case 'not': return pr.p;
        default: return null;
      }
    })();
    return flip ? this.frag(flip, owner) : `not ${this.frag(pr, owner)}`;
  }

  /** "Margot said she was on a chair" / "Victor was alone with the killer" / "Felix lies, so he was not …" */
  said(cc: CC): string {
    const q = cc.owner, Nm = this.name(q), P = this.pr(q);
    if (cc.desc) return cap(cc.desc(this));
    if (this.pre.victim[q]) {
      if (cc.killer) {
        const k = cc.orig;
        if (k.type === 'roomCount' && k.cmp === 'exactly' && k.n === 2) return `${Nm} was alone with the killer`;
        if (k.type === 'roomCount' && k.cmp === 'exactly') return `${Nm} shared ${P.his} room with exactly ${numberWord(k.n - 1)} others`;
        if (k.type === 'aloneInRoom') return `${Nm} was alone in ${P.his} room`;
        return `${Nm} was ${this.frag(k, q)}`;
      }
      return `${Nm}'s body was found ${this.frag(cc.orig, q)}`;
    }
    if (cc.negated) return `${Nm} is the liar, so ${P.he} was ${this.negFrag(cc.orig, q)}`;
    const verb = this.pick(['said', 'told us', 'swore'], 'verb', q, cc.ci);
    return `${Nm} ${verb} ${P.he} was ${this.frag(cc.orig, q)}`;
  }

  /** What the square itself shows, for mistake messages ("on a chair at C5", "at C5 in the Kitchen"). */
  where(c: number, pr: Predicate): string {
    const g = this.pre.g;
    const base = pr.type === 'not' ? pr.p : pr;
    switch (base.type) {
      case 'inRoom': case 'notInRoom': case 'roomHasFurniture': case 'roomSizeCmp': case 'sameRoomAs': case 'differentRoomFrom':
        return `at ${this.cell(c)} in the ${this.room(g.roomOf[c] as number)}`;
      case 'onFurniture': case 'notOnFurniture': case 'onAnyFurniture': case 'onNoFurniture': {
        const k = g.kindAt[c];
        return k ? `${k === 'bathtub' ? 'in' : 'on'} ${this.furnA(k)} at ${this.cell(c)}` : `on the bare floor at ${this.cell(c)}`;
      }
      default: return `at ${this.cell(c)}`;
    }
  }
}

// ─────────────────────────── Findings ───────────────────────────

interface Finding {
  kind: DeductionKind;
  p: number;
  cells: number[];
  reason: number[];
  rule: string;
  /** core text, without the leading "Hm." */
  text: string;
}

const lc = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const bit = (x: number): number => 1 << x;
const popcount = (m: number): number => { let k = 0; while (m) { m &= m - 1; k++; } return k; };
const bitsOf = (m: number): number[] => { const out: number[] = []; for (let i = 0; m; i++, m >>= 1) if (m & 1) out.push(i); return out; };

/** Turn "remove these squares" into a cross, or into a mistake when it would leave the person nowhere. */
function elimFinding(tk: TK, D: number[][], q: number, cells: number[], reason: number[], rule: string, why: string, tail: string): Finding {
  const placed = (tk.b.pos[q] as number) >= 0;
  if (placed || cells.length >= (D[q] as number[]).length) {
    const text = placed
      ? `${why} So ${tk.name(q)} can't be at ${tk.cell(tk.b.pos[q] as number)} — one of your pins or crosses is wrong.`
      : `${why} That leaves ${tk.name(q)} nowhere to stand — one of your pins or crosses is wrong.`;
    return { kind: 'mistake', p: q, cells: placed ? [tk.b.pos[q] as number] : [], reason, rule: 'mistake-stuck', text };
  }
  return { kind: 'cross', p: q, cells, reason, rule, text: `${why} ${tail}`.trim() };
}

// ─────────────────────────── Mistakes ───────────────────────────

function structuralMistake(tk: TK): Finding | null {
  const { pre, b } = tk;
  const g = pre.g;
  for (let q = 0; q < pre.n; q++) {
    const c = b.pos[q] as number;
    if (c < 0 || !g.blocked[c]) continue;
    const k = g.kindAt[c] as FurnitureKind;
    return {
      kind: 'mistake', p: q, cells: [c], reason: [c], rule: 'mistake-blocked',
      text: `${tk.name(q)} is pinned on ${tk.furnA(k)} at ${tk.cell(c)}. Nobody stands on a ${tk.furnNoun(k)}.`,
    };
  }
  for (let axis = 0; axis < 2; axis++) {
    const at = axis === 0 ? pre.rowAt : pre.colAt;
    const seen = new Map<number, number>();
    for (let q = 0; q < pre.n; q++) {
      const c = b.pos[q] as number;
      if (c < 0) continue;
      const l = at[c] as number;
      const o = seen.get(l);
      if (o === undefined) { seen.set(l, q); continue; }
      const oc = b.pos[o] as number;
      const text = oc === c
        ? `${tk.name(o)} and ${tk.name(q)} are pinned on the same square, ${tk.cell(c)}. One each, Rookie.`
        : `${tk.name(o)} and ${tk.name(q)} are both in ${tk.line(axis, l)}. One person per ${axis === 0 ? 'row' : 'column'}, Rookie.`;
      return { kind: 'mistake', p: q, cells: [oc, c], reason: [oc, c], rule: 'mistake-line', text };
    }
  }
  return null;
}

/** A clue that is definitely false with the current pins. */
function clueViolationText(tk: TK, cc: CC): Finding {
  const { b } = tk;
  const q = cc.owner;
  const c = b.pos[q] as number;
  const P = tk.pr(q);
  if (cc.unary) {
    const said = tk.said(cc);
    const text = cc.desc
      ? `${tk.name(q)} is pinned ${tk.where(c, cc.orig)}, but ${soft(tk.pre, said)}.`
      : tk.pre.victim[q]
      ? `${tk.name(q)} is pinned ${tk.where(c, cc.orig)}, but ${lc(said.replace(`${tk.name(q)}'s body`, `${P.his} body`))}.`
      : cc.negated
        ? `${tk.name(q)} is pinned ${tk.where(c, cc.orig)}, but ${lc(said.replace(`${tk.name(q)} is the liar, so `, `as the liar `))}.`
        : `${tk.name(q)} is ${tk.where(c, cc.orig)}, but ${P.he} ${lc(said.slice(tk.name(q).length + 1))}.`;
    return { kind: 'mistake', p: q, cells: [c], reason: [c], rule: 'mistake-clue', text };
  }
  if (!cc.global) {
    const others = cc.deps.filter((x) => x !== q);
    const parts = [q, ...others].map((x) => `${tk.name(x)} is at ${tk.cell(b.pos[x] as number)}`);
    const placedTxt = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : (parts[0] as string);
    const text = `${placedTxt}, but ${soft(tk.pre, tk.said(cc))}.`;
    const cells = [q, ...others].map((x) => b.pos[x] as number);
    return { kind: 'mistake', p: q, cells, reason: cells, rule: 'mistake-clue', text };
  }
  // global (room counts, case rules)
  if (cc.custom) {
    const cells: number[] = [];
    for (let x = 0; x < tk.pre.n; x++) if ((b.pos[x] as number) >= 0) cells.push(b.pos[x] as number);
    return { kind: 'mistake', p: q, cells: [], reason: cells, rule: 'mistake-clue', text: `As pinned, the case rule breaks: ${tk.said(cc)}.` };
  }
  const g = tk.pre.g;
  if (c >= 0) {
    const R = g.roomOf[c] as number;
    let k = 0;
    const inRoom: number[] = [];
    for (let x = 0; x < tk.pre.n; x++) {
      const cx = b.pos[x] as number;
      if (cx >= 0 && g.roomOf[cx] === R) { k++; inRoom.push(cx); }
    }
    const text = `As pinned, the ${tk.room(R)} holds ${numberWord(k)} ${k === 1 ? 'person' : 'people'}, but ${soft(tk.pre, tk.said(cc))}.`;
    return { kind: 'mistake', p: q, cells: [c], reason: inRoom, rule: 'mistake-clue', text };
  }
  return { kind: 'mistake', p: q, cells: [], reason: [], rule: 'mistake-clue', text: `As pinned, this can't hold: ${tk.said(cc)}.` };
}

function clueMistake(tk: TK): Finding | null {
  const { b, h } = tk;
  const all: CC[] = [];
  for (const list of h.unaryBy) all.push(...list);
  all.push(...h.local, ...h.global);
  for (const cc of all) if (cc.f(b.pos) === 0) return clueViolationText(tk, cc);
  return null;
}

/** Liar variants: the suspects' words decide who may be the liar. */
function liarMistake(tk: TK): Finding | null {
  const { pre, b } = tk;
  const liars: number[] = [];
  for (let q = 0; q < pre.n; q++) {
    if (pre.victim[q]) continue;
    let tru: CC | null = null, fal: CC | null = null;
    for (const cc of pre.truth) {
      if (cc.owner !== q) continue;
      const v = cc.f(b.pos);
      if (v === 1) tru = tru ?? cc;
      else if (v === 0) fal = fal ?? cc;
    }
    if (tru && fal) {
      const c = b.pos[q] as number;
      return {
        kind: 'mistake', p: q, cells: c >= 0 ? [c] : [], reason: c >= 0 ? [c] : [], rule: 'mistake-liar',
        text: `As pinned, ${tk.name(q)} tells one truth and one lie. The liar lies every time; the rest never do.`,
      };
    }
    if (fal) liars.push(q);
  }
  if (liars.length >= 2) {
    const cells = liars.map((q) => b.pos[q] as number).filter((c) => c >= 0);
    return {
      kind: 'mistake', p: liars[1] as number, cells, reason: cells, rule: 'mistake-liar',
      text: `As pinned, ${tk.names(liars.slice(0, 2))} would both be lying. Only one suspect lies.`,
    };
  }
  return null;
}

/** Somebody with no square left, or a row/column nobody can reach. */
function stuckMistake(tk: TK, D: number[][]): Finding | null {
  const { pre, b } = tk;
  for (let q = 0; q < pre.n; q++) {
    if ((b.pos[q] as number) >= 0 || (D[q] as number[]).length) continue;
    return {
      kind: 'mistake', p: q, cells: [], reason: [], rule: 'mistake-stuck',
      text: `${tk.name(q)} has nowhere left to stand. One of your pins or crosses is wrong.`,
    };
  }
  for (let axis = 0; axis < 2; axis++) {
    const at = axis === 0 ? pre.rowAt : pre.colAt;
    const L = axis === 0 ? pre.rows : pre.cols;
    if (pre.n !== L) continue;
    let reach = 0;
    for (const d of D) for (const c of d) reach |= bit(at[c] as number);
    for (let l = 0; l < L; l++) {
      if (reach & bit(l)) continue;
      let who = -1;
      for (let q = 0; q < pre.n && who < 0; q++) {
        if ((b.pos[q] as number) >= 0) continue;
        const cr = b.crossed[q] as Uint8Array;
        for (let c = 0; c < cr.length; c++) if (cr[c] && at[c] === l) { who = q; break; }
      }
      if (who < 0) who = Math.max(0, Array.prototype.findIndex.call(b.pos, (x: number) => x < 0));
      const lineCells = pre.g.free.filter((c) => at[c] === l);
      return {
        kind: 'mistake', p: who, cells: [], reason: lineCells, rule: 'mistake-stuck',
        text: `Nobody can reach ${tk.line(axis, l)} any more, and every ${axis === 0 ? 'row' : 'column'} needs someone. Check your crosses.`,
      };
    }
  }
  return null;
}

// ─────────────────────────── a. single cell ───────────────────────────

function tSingle(tk: TK, D: number[][]): Finding | null {
  const { pre, b, h } = tk;
  for (let q = 0; q < pre.n; q++) {
    if ((b.pos[q] as number) >= 0 || (D[q] as number[]).length !== 1) continue;
    const c = (D[q] as number[])[0] as number;
    const m = h.mask[q] as Uint8Array;
    const region = pre.g.free.filter((x) => m[x]);
    const N = tk.name(q), P = tk.pr(q), C = tk.cell(c);
    let text: string;
    let reason: number[] = [c];
    if (region.length === 1 && h.unaryBy[q]?.length) {
      const said = tk.said(h.unaryBy[q]?.[0] as CC);
      text = tk.pick([
        `${said}, and only ${C} fits. Pin ${P.him} there.`,
        `${said}. One square on the whole plan does that: ${C}.`,
      ], 'single1', q);
    } else {
      // who took the other squares of this person's region
      const takers: number[] = [];
      for (let x = 0; x < pre.n; x++) {
        const cx = b.pos[x] as number;
        if (cx < 0 || x === q) continue;
        if (region.some((r) => r !== c && (pre.rowAt[r] === pre.rowAt[cx] || pre.colAt[r] === pre.colAt[cx]))) takers.push(cx);
      }
      reason = [c, ...takers.slice(0, 4)];
      text = tk.pick([
        `${N} has one square left: ${C}.`,
        `Every other square is crossed off or taken for ${N}. ${P.He} stands at ${C}.`,
        `Nowhere else for ${N} to go but ${C}.`,
      ], 'single2', q);
    }
    return { kind: 'place', p: q, cells: [c], reason, rule: 'single-cell', text };
  }
  return null;
}

// ─────────────────────────── b. row / column owner ───────────────────────────

function tLineOwner(tk: TK, D: number[][]): Finding | null {
  const { pre, b } = tk;
  const n = pre.n;
  // hidden single: a line only one person can still reach
  for (let axis = 0; axis < 2; axis++) {
    const at = axis === 0 ? pre.rowAt : pre.colAt;
    const L = axis === 0 ? pre.rows : pre.cols;
    const used = axis === 0 ? b.rowUsed : b.colUsed;
    if (n !== L) continue;
    for (let l = 0; l < L; l++) {
      if (used & bit(l)) continue;
      let who = -1, cnt = 0;
      for (let q = 0; q < n; q++) {
        if ((b.pos[q] as number) >= 0) continue;
        if ((D[q] as number[]).some((c) => at[c] === l)) { cnt++; who = q; }
      }
      if (cnt !== 1) continue;
      const d = D[who] as number[];
      const inside = d.filter((c) => at[c] === l);
      if (inside.length === d.length) continue;
      const lineCells = pre.g.free.filter((c) => at[c] === l);
      const N = tk.name(who), P = tk.pr(who), LN = tk.line(axis, l);
      if (inside.length === 1) {
        const C = tk.cell(inside[0] as number);
        return {
          kind: 'place', p: who, cells: inside, reason: lineCells, rule: 'row-owner',
          text: tk.pick([
            `${cap(LN)} needs somebody, and only ${N} can still get there — at ${C}.`,
            `Nobody but ${N} can reach ${LN}. ${P.He} goes at ${C}.`,
          ], 'owner1', who, l),
        };
      }
      const out = d.filter((c) => at[c] !== l);
      return {
        kind: 'cross', p: who, cells: out, reason: lineCells, rule: 'row-owner',
        text: tk.pick([
          `Only ${N} can still reach ${LN}, so that's where ${P.he} is. Cross ${P.his} other squares.`,
          `${cap(LN)} needs somebody and ${N} is the only one left who fits. Everything of ${P.his} outside it goes.`,
        ], 'owner2', who, l),
      };
    }
  }
  // naked: a person confined to one line takes it from everyone else
  for (let axis = 0; axis < 2; axis++) {
    const at = axis === 0 ? pre.rowAt : pre.colAt;
    for (let p = 0; p < n; p++) {
      if ((b.pos[p] as number) >= 0) continue;
      const d = D[p] as number[];
      if (!d.length) continue;
      const l = at[d[0] as number] as number;
      if (!d.every((c) => at[c] === l)) continue;
      let best = -1, bestCells: number[] = [];
      for (let q = 0; q < n; q++) {
        if (q === p || (b.pos[q] as number) >= 0) continue;
        const cells = (D[q] as number[]).filter((c) => at[c] === l);
        if (cells.length > bestCells.length) { best = q; bestCells = cells; }
      }
      if (best < 0) continue;
      const N = tk.name(p), P = tk.pr(p), LN = tk.line(axis, l), Q = tk.name(best);
      const why = tk.pick([
        `${N} can only be in ${LN}, so ${LN} is ${P.his}.`,
        `Every square ${N} has left is in ${LN}, so that line is ${P.his}.`,
      ], 'naked1', p, l);
      return elimFinding(tk, D, best, bestCells, d, 'line-confined', why, `Cross it out for ${Q}.`);
    }
  }
  return null;
}

// ─────────────────────────── c. unary elimination ───────────────────────────

function tUnary(tk: TK, D: number[][]): Finding | null {
  const { pre, b, h } = tk;
  let best: { q: number; cc: CC | null; cells: number[] } | null = null;
  const lineOpen = (c: number): boolean =>
    !((b.rowUsed >> (pre.rowAt[c] as number)) & 1) && !((b.colUsed >> (pre.colAt[c] as number)) & 1);
  for (let q = 0; q < pre.n; q++) {
    if ((b.pos[q] as number) >= 0) continue;
    const cr = b.crossed[q] as Uint8Array;
    const better = (cells: number[]): boolean => !best
      || (D[q] as number[]).length < (D[best.q] as number[]).length
      || ((D[q] as number[]).length === (D[best.q] as number[]).length && cells.length > best.cells.length);
    if (h.liar === -1 && !pre.victim[q]) {
      const m = h.mask[q] as Uint8Array;
      const cells = pre.g.free.filter((c) => !m[c] && !cr[c] && lineOpen(c));
      if (cells.length && better(cells)) best = { q, cc: null, cells };
      continue;
    }
    for (const cc of h.unaryBy[q] as CC[]) {
      const m = cc.mask as Uint8Array;
      const cells = pre.g.free.filter((c) => !m[c] && !cr[c] && lineOpen(c));
      if (cells.length && better(cells)) best = { q, cc, cells };
    }
  }
  if (!best) return null;
  const { q, cc, cells } = best;
  const N = tk.name(q), P = tk.pr(q);
  if (!cc) {
    return {
      kind: 'cross', p: q, cells, reason: [], rule: 'unary',
      text: tk.pick([
        `Liar or not, ${N} can't be at ${tk.cells(cells)}: neither ${P.his} story nor its opposite fits there.`,
        `Whether ${N} is lying or not, ${tk.cells(cells)} ${tk.isAre(cells)} out for ${P.him}.`,
      ], 'unarySafe', q),
    };
  }
  const m = cc.mask as Uint8Array;
  const fits = pre.g.free.filter((c) => m[c]);
  const said = tk.said(cc);
  const text = cells.length > 4
    ? tk.pick([
      `${said}. Cross out every square that doesn't fit ${P.him} — ${numberWord(cells.length)} of them.`,
      `${said}. That rules out ${numberWord(cells.length)} squares for ${P.him}.`,
    ], 'unary1', q, cc.ci)
    : tk.pick([
      `${said}, so ${tk.cells(cells)} ${tk.isAre(cells)} out for ${P.him}.`,
      `${said}. That rules out ${tk.cells(cells)}.`,
    ], 'unary2', q, cc.ci);
  return { kind: 'cross', p: q, cells, reason: fits.length <= 16 ? fits : [], rule: 'unary', text };
}

// ─────────────────────────── d. relational ───────────────────────────

/** Cells of D[v] for which no placement of the clue's other people (distinct rows/cols) makes it true; null = too costly. */
function unsupported(pre: Pre, cc: CC, v: number, D: number[][], limit: number): number[] | null {
  const rest = cc.deps.filter((x) => x !== v);
  let prod = 1;
  for (const q of rest) prod *= (D[q] as number[]).length;
  if (prod > limit) return null;
  const pos = pre.scratch;
  const { rowAt, colAt } = pre;
  const assigned: number[] = [];
  const support = (k: number): boolean => {
    if (k === rest.length) return cc.f(pos) === 1;
    const q = rest[k] as number;
    for (const c of D[q] as number[]) {
      let clash = false;
      for (const a of assigned) if (rowAt[a] === rowAt[c] || colAt[a] === colAt[c]) { clash = true; break; }
      if (clash) continue;
      pos[q] = c;
      assigned.push(c);
      const ok = support(k + 1);
      assigned.pop();
      pos[q] = -1;
      if (ok) return true;
    }
    return false;
  };
  const bad: number[] = [];
  for (const c of D[v] as number[]) {
    pos[v] = c;
    assigned.push(c);
    if (!support(0)) bad.push(c);
    assigned.pop();
    pos[v] = -1;
  }
  return bad;
}

function tRelational(tk: TK, D: number[][]): Finding | null {
  const { pre, h } = tk;
  const levels = [1, 4, SUPPORT_LIMIT];
  for (let li = 0; li < levels.length; li++) {
    const lim = levels[li] as number;
    const lower = li === 0 ? 0 : (levels[li - 1] as number);
    for (const cc of h.local) {
      for (const v of cc.deps) {
        const rest = cc.deps.filter((x) => x !== v);
        let prod = 1;
        for (const q of rest) prod *= (D[q] as number[]).length;
        if (prod > lim || prod <= lower) continue;
        const bad = unsupported(pre, cc, v, D, lim);
        if (!bad || !bad.length) continue;
        const reason = rest.flatMap((q) => D[q] as number[]);
        const said = tk.said(cc);
        const V = tk.name(v), PV = tk.pr(v);
        const placedRest = rest.filter((q) => (D[q] as number[]).length === 1);
        let why: string;
        if (prod === 1) {
          const where = placedRest.map((q) => `${tk.name(q)} is at ${tk.cell((D[q] as number[])[0] as number)}`).join(' and ');
          why = v === cc.owner
            ? tk.pick([`${cap(where)}, and ${said}.`, `${said}, and ${where}.`], 'rel1', cc.ci, v)
            : `${cap(where)}, and ${said}.`;
        } else if (prod <= 4) {
          const where = rest.map((q) => ((D[q] as number[]).length === 1
            ? `${tk.name(q)} is at ${tk.cell((D[q] as number[])[0] as number)}`
            : `${tk.name(q)} can only be at ${tk.cells(D[q] as number[], 'or')}`)).join(', ');
          why = `${cap(where)}, and ${said}.`;
        } else {
          const X = tk.names(rest);
          why = tk.pick([
            `${said}; wherever ${X} ends up, ${V} can't be at ${tk.cells(bad, 'or')}.`,
            `${said}, and no matter where ${X} stands, that rules out ${tk.cells(bad)} for ${V}.`,
          ], 'rel3', cc.ci, v);
          return elimFinding(tk, D, v, bad, reason.length <= 12 ? reason : [], 'relational', why, '');
        }
        const tail = tk.pick([
          `So ${tk.cells(bad)} ${tk.isAre(bad)} out for ${V}.`,
          `That rules out ${tk.cells(bad)} for ${PV.him}.`,
        ], 'relT', cc.ci, v);
        return elimFinding(tk, D, v, bad, reason.length <= 12 ? reason : [], 'relational', why, v === cc.owner ? tail : tail.replace(` for ${PV.him}.`, ` for ${V}.`));
      }
    }
  }
  return null;
}

// ─────────────────────────── e. locked sets ───────────────────────────

function combos(items: number[], k: number, fn: (set: number[]) => boolean): boolean {
  const cur: number[] = [];
  const rec = (start: number): boolean => {
    if (cur.length === k) return fn(cur);
    for (let i = start; i < items.length; i++) {
      cur.push(items[i] as number);
      if (rec(i + 1)) return true;
      cur.pop();
    }
    return false;
  };
  return rec(0);
}

function tLocked(tk: TK, D: number[][]): Finding | null {
  const { pre, b } = tk;
  const unplaced: number[] = [];
  for (let q = 0; q < pre.n; q++) if ((b.pos[q] as number) < 0) unplaced.push(q);
  let found: Finding | null = null;
  for (const k of [2, 3]) {
    if (unplaced.length <= k) break;
    for (let axis = 0; axis < 2 && !found; axis++) {
      const at = axis === 0 ? pre.rowAt : pre.colAt;
      const L = axis === 0 ? pre.rows : pre.cols;
      const word = axis === 0 ? 'rows' : 'columns';
      const mask = new Map<number, number>();
      for (const q of unplaced) { let m = 0; for (const c of D[q] as number[]) m |= bit(at[c] as number); mask.set(q, m); }
      const lineList = (m: number): string => {
        const ls = bitsOf(m).map((l) => (axis === 0 ? String(l + 1) : String.fromCharCode(65 + l)));
        return `${word} ${ls.slice(0, -1).join(', ')} and ${ls[ls.length - 1]}`;
      };
      // naked set: k people living in exactly k lines
      combos(unplaced, k, (set) => {
        let u = 0;
        for (const q of set) u |= mask.get(q) as number;
        if (popcount(u) !== k) return false;
        let best = -1, bestCells: number[] = [];
        for (const q of unplaced) {
          if (set.includes(q)) continue;
          const cells = (D[q] as number[]).filter((c) => bit(at[c] as number) & u);
          if (cells.length > bestCells.length) { best = q; bestCells = cells; }
        }
        if (best < 0) return false;
        const why = tk.pick([
          `${tk.names(set)} can only use ${lineList(u)} between them, so those ${word} are theirs.`,
          `${tk.names(set)} are boxed into ${lineList(u)}, so nobody else fits there.`,
        ], 'naked', k, axis, u);
        found = elimFinding(tk, D, best, bestCells, set.flatMap((q) => D[q] as number[]), 'locked-set', why,
          `Cross them out for ${tk.name(best)}.`);
        return true;
      });
      if (found || pre.n !== L) continue;
      // hidden set: k open lines only k people can reach
      const used = axis === 0 ? b.rowUsed : b.colUsed;
      const open: number[] = [];
      for (let l = 0; l < L; l++) if (!(used & bit(l))) open.push(l);
      combos(open, k, (lines) => {
        let u = 0;
        for (const l of lines) u |= bit(l);
        const who = unplaced.filter((q) => (mask.get(q) as number) & u);
        if (who.length !== k) return false;
        for (const q of who) {
          const extra = (D[q] as number[]).filter((c) => !(bit(at[c] as number) & u));
          if (!extra.length) continue;
          const lineCells = pre.g.free.filter((c) => bit(at[c] as number) & u);
          const why = tk.pick([
            `Only ${tk.names(who)} can still reach ${lineList(u)}, so those ${word} are theirs.`,
            `${cap(lineList(u))} need ${numberWord(k)} people, and only ${tk.names(who)} can get there.`,
          ], 'hidden', k, axis, u);
          found = elimFinding(tk, D, q, extra, lineCells, 'locked-set', why, `Cross ${tk.name(q)}'s other squares.`);
          return true;
        }
        return false;
      });
    }
    if (found) return found;
  }
  return found;
}

// ─────────────────────────── f. room counts ───────────────────────────

interface Elim { p: number; cells: number[]; reason: number[]; why: string; tail: string; contra?: boolean }

function normGlobal(pr: Predicate): { cmp: 'exactly' | 'atLeast' | 'atMost'; n: number } | null {
  if (pr.type === 'aloneInRoom') return { cmp: 'exactly', n: 1 };
  if (pr.type === 'roomCount') return { cmp: pr.cmp, n: pr.n };
  return null;
}

/**
 * Room-count reasoning for one global clue. `tk` null → no text (propagation).
 * Returns eliminations (possibly hitting placed people / emptying domains: the caller decides).
 */
function globalElims(pre: Pre, cc: CC, D: number[][], tk: TK | null): Elim[] {
  if (cc.custom) return customElims(pre, cc, D, tk);
  const s = cc.owner;
  const g = pre.g;
  const n = pre.n;
  const nc = normGlobal(cc.pred);
  const out: Elim[] = [];
  if (!nc) {
    const pos = pre.scratch;
    for (let q = 0; q < n; q++) pos[q] = q !== s && (D[q] as number[]).length === 1 ? ((D[q] as number[])[0] as number) : -1;
    const bad = (D[s] as number[]).filter((c) => { pos[s] = c; return cc.f(pos) === 0; });
    pos.fill(-1);
    if (bad.length) {
      out.push({
        p: s, cells: bad, reason: [],
        why: tk ? `${tk.said(cc)}; with everyone pinned down so far, that can't work from ${tk.cells(bad)}.` : '',
        tail: '',
      });
    }
    return out;
  }
  const nR = g.roomIds.length;
  const fixedRoom = new Int16Array(n);
  const canBe = new Uint8Array(n * nR);
  for (let q = 0; q < n; q++) {
    const d = D[q] as number[];
    let fr = d.length ? (g.roomOf[d[0] as number] as number) : -1;
    for (const c of d) {
      const R = g.roomOf[c] as number;
      canBe[q * nR + R] = 1;
      if (R !== fr) fr = -1;
    }
    fixedRoom[q] = fr;
  }
  const fixedIn = (R: number): number[] => { const o: number[] = []; for (let q = 0; q < n; q++) if (q !== s && fixedRoom[q] === R) o.push(q); return o; };
  const reachIn = (R: number): number[] => { const o: number[] = []; for (let q = 0; q < n; q++) if (q !== s && canBe[q * nR + R]) o.push(q); return o; };
  const N = nc.n;
  // f1: the owner can't be in a room whose count can't come out right
  const ownRooms = [...new Set((D[s] as number[]).map((c) => g.roomOf[c] as number))];
  const badRooms: { R: number; crowded: boolean }[] = [];
  for (const R of ownRooms) {
    const lo = 1 + fixedIn(R).length, hi = 1 + reachIn(R).length;
    const ok = nc.cmp === 'exactly' ? lo <= N && N <= hi : nc.cmp === 'atLeast' ? hi >= N : lo <= N;
    if (!ok) badRooms.push({ R, crowded: lo > N });
  }
  if (badRooms.length) {
    if (!tk) {
      const badSet = new Set(badRooms.map((x) => x.R));
      out.push({ p: s, cells: (D[s] as number[]).filter((c) => badSet.has(g.roomOf[c] as number)), reason: [], why: '', tail: '' });
      return out;
    }
    badRooms.sort((x, y) => (D[s] as number[]).filter((c) => g.roomOf[c] === y.R).length - (D[s] as number[]).filter((c) => g.roomOf[c] === x.R).length);
    const { R, crowded } = badRooms[0] as { R: number; crowded: boolean };
    const cells = (D[s] as number[]).filter((c) => g.roomOf[c] === R);
    const RN = tk.room(R), P = tk.pr(s);
    const said = tk.said(cc);
    let why: string;
    let reason: number[];
    if (crowded) {
      const f = fixedIn(R);
      reason = f.flatMap((q) => D[q] as number[]);
      why = `${said}, but ${tk.names(f)} ${f.length === 1 ? 'is' : 'are'} already bound for the ${RN}.`;
    } else {
      const r = reachIn(R);
      reason = g.roomCells[R] as number[];
      why = r.length === 0
        ? `${said}, but nobody else can still reach the ${RN}.`
        : `${said}, but only ${tk.names(r)} can still reach the ${RN} — not enough.`;
    }
    out.push({ p: s, cells, reason, why, tail: `So ${tk.cells(cells)} ${tk.isAre(cells)} out for ${P.him}.` });
    return out;
  }
  const R = fixedRoom[s] as number;
  if (R < 0) return out;
  const f = fixedIn(R), r = reachIn(R);
  const capReached = (nc.cmp === 'exactly' || nc.cmp === 'atMost') && 1 + f.length === N;
  const mustFill = (nc.cmp === 'exactly' || nc.cmp === 'atLeast') && 1 + r.length === N;
  for (let q = 0; q < n; q++) {
    if (q === s || fixedRoom[q] === R || !canBe[q * nR + R]) continue;
    if (capReached) {
      const cells = (D[q] as number[]).filter((c) => g.roomOf[c] === R);
      let why = '', tail = '';
      if (tk) {
        const RN = tk.room(R), S = tk.name(s);
        const company = f.length ? `${S} and ${tk.names(f)} already fill the ${RN}` : `${S} is in the ${RN}`;
        why = tk.pick([
          `${tk.said(cc)}, and ${company}.`,
        ], 'cap', cc.ci, q);
        tail = tk.pick([`Nobody else goes in there: cross it for ${tk.name(q)}.`, `${tk.name(q)} stays out of the ${RN}.`], 'capT', q);
      }
      out.push({ p: q, cells, reason: [s, ...f].flatMap((x) => D[x] as number[]), why, tail });
      if (tk) return out;
    } else if (mustFill) {
      const cells = (D[q] as number[]).filter((c) => g.roomOf[c] !== R);
      let why = '', tail = '';
      if (tk) {
        const RN = tk.room(R);
        why = `${tk.said(cc)}, and ${tk.name(s)} is in the ${RN}. Only ${tk.names(r)} can still get in there,`;
        tail = `so ${tk.name(q)} must be in the ${RN}.`;
      }
      out.push({ p: q, cells, reason: g.roomCells[R] as number[], why, tail });
      if (tk) return out;
    }
  }
  return out;
}

/** Scenario rules without a predicate (rules.ts custom: "exactly one person …", accomplice distances). */
function customElims(pre: Pre, cc: CC, D: number[][], tk: TK | null): Elim[] {
  const custom = cc.custom as CustomRule;
  const s = cc.owner;
  const out: Elim[] = [];
  if (!custom.revise) {
    const pos = pre.scratch;
    for (let q = 0; q < pre.n; q++) pos[q] = q !== s && (D[q] as number[]).length === 1 ? ((D[q] as number[])[0] as number) : -1;
    const bad = (D[s] as number[]).filter((c) => { pos[s] = c; return custom.f(pos) === 0; });
    pos.fill(-1);
    if (bad.length) {
      out.push({
        p: s, cells: bad, reason: [], tail: '',
        why: tk ? `${tk.said(cc)}, so ${tk.cells(bad)} ${tk.isAre(bad)} out for ${tk.name(s)}.` : '',
      });
    }
    return out;
  }
  const D2 = cloneD(D);
  const r = custom.revise(D2, (q, list) => { D2[q] = list; });
  if (r < 0) return [{ p: s, cells: [], reason: [], why: '', tail: '', contra: true }];
  if (r === 0) return out;
  const hit = tk ? hitFor(pre.g, { variant: pre.variant, victims: pre.victims, poisonKind: pre.p.poisonKind }) : null;
  for (let q = 0; q < pre.n; q++) {
    const keep = new Set(D2[q] as number[]);
    const removed = (D[q] as number[]).filter((c) => !keep.has(c));
    if (!removed.length) continue;
    let why = '', tail = '';
    if (tk) {
      const said = tk.said(cc), Q = tk.name(q);
      const vc = (D[s] as number[])[0] ?? -1;
      if (hit && q !== s && vc >= 0 && removed.every((c) => hit(c, vc))) {
        let forced = -1;
        for (let x = 0; x < pre.n && forced < 0; x++) {
          if (x === s || x === q || pre.victim[x]) continue;
          const d = D[x] as number[];
          if (d.length && d.every((c) => hit(c, vc))) forced = x;
        }
        why = `${said} — ${forced >= 0 ? `and that's already ${tk.name(forced)}` : 'and someone else already is that person'}.`;
        tail = `So ${tk.cells(removed)} ${tk.isAre(removed)} out for ${Q}.`;
      } else if (hit && q !== s && vc >= 0) {
        why = `${said} — only ${Q} still can.`;
        tail = `So ${Q} can't be at ${tk.cells(removed, 'or')}.`;
      } else {
        why = `${said}.`;
        tail = `So ${tk.cells(removed)} ${tk.isAre(removed)} out for ${Q}.`;
      }
    }
    out.push({ p: q, cells: removed, reason: tk ? (D2[q] as number[]).slice(0, 12) : [], why, tail });
    if (tk) return out;
  }
  return out;
}

function tRooms(tk: TK, D: number[][]): Finding | null {
  for (const cc of tk.h.global) {
    const es = globalElims(tk.pre, cc, D, tk);
    const e = es.find((x) => x.contra || x.cells.length);
    if (!e) continue;
    const rule = cc.custom ? 'case-rule' : 'room-count';
    if (e.contra) {
      return {
        kind: 'mistake', p: e.p, cells: [], reason: [], rule: 'mistake-stuck',
        text: `As marked, the case rule breaks: ${tk.said(cc)}. One of your pins or crosses is wrong.`,
      };
    }
    if (e.why.endsWith(',')) {
      // "…, so Q must be in the R." reads as one sentence
      const f = elimFinding(tk, D, e.p, e.cells, e.reason, rule, e.why.slice(0, -1) + '.', '');
      if (f.kind === 'cross') f.text = `${e.why} ${e.tail}`;
      return f;
    }
    return elimFinding(tk, D, e.p, e.cells, e.reason, rule, e.why, e.tail);
  }
  return null;
}

// ─────────────────────────── Propagation (what-if / liar hypotheses) ───────────────────────────

type Contra = { kind: 'person'; p: number } | { kind: 'line'; axis: number; l: number } | { kind: 'rule'; cc: CC };

function lineExclusion(pre: Pre, D: number[][]): { contra: Contra | null; changed: boolean } {
  const n = pre.n;
  let changed = false;
  const mask = new Int32Array(n);
  for (let axis = 0; axis < 2; axis++) {
    const at = axis === 0 ? pre.rowAt : pre.colAt;
    const L = axis === 0 ? pre.rows : pre.cols;
    const full = n === L;
    let again = true;
    while (again) {
      again = false;
      for (let p = 0; p < n; p++) {
        let m = 0;
        for (const c of D[p] as number[]) m |= bit(at[c] as number);
        if (!m) return { contra: { kind: 'person', p }, changed };
        mask[p] = m;
      }
      for (let p = 0; p < n; p++) {
        const m = mask[p] as number;
        if (m & (m - 1)) continue;
        for (let q = 0; q < n; q++) {
          if (q === p || !((mask[q] as number) & m)) continue;
          const nd = (D[q] as number[]).filter((c) => !(bit(at[c] as number) & m));
          if (!nd.length) return { contra: { kind: 'person', p: q }, changed };
          D[q] = nd;
          mask[q] = (mask[q] as number) & ~m;
          changed = again = true;
        }
      }
      if (!full) continue;
      for (let l = 0; l < L; l++) {
        let who = -1, cnt = 0;
        for (let p = 0; p < n; p++) if ((mask[p] as number) & bit(l)) { cnt++; who = p; }
        if (cnt === 0) return { contra: { kind: 'line', axis, l }, changed };
        if (cnt === 1 && mask[who] !== bit(l)) {
          D[who] = (D[who] as number[]).filter((c) => at[c] === l);
          mask[who] = bit(l);
          changed = again = true;
        }
      }
    }
  }
  return { contra: null, changed };
}

/** Sound filtering to a (bounded) fixpoint. Returns the first contradiction met, or null. */
function propagate(pre: Pre, h: Hyp, D: number[][], rounds: number): Contra | null {
  for (let it = 0; it < rounds; it++) {
    const le = lineExclusion(pre, D);
    if (le.contra) return le.contra;
    let changed = le.changed;
    for (const cc of h.local) {
      for (const v of cc.deps) {
        const bad = unsupported(pre, cc, v, D, SUPPORT_LIMIT);
        if (!bad || !bad.length) continue;
        const bs = new Set(bad);
        const nd = (D[v] as number[]).filter((c) => !bs.has(c));
        if (!nd.length) return { kind: 'person', p: v };
        D[v] = nd;
        changed = true;
      }
    }
    for (const cc of h.global) {
      for (const e of globalElims(pre, cc, D, null)) {
        if (e.contra) return { kind: 'rule', cc };
        if (!e.cells.length) continue;
        const bs = new Set(e.cells);
        const nd = (D[e.p] as number[]).filter((c) => !bs.has(c));
        if (!nd.length) return cc.custom ? { kind: 'rule', cc } : { kind: 'person', p: e.p };
        D[e.p] = nd;
        changed = true;
      }
    }
    if (!changed) return null;
  }
  return null;
}

// ─────────────────────────── g. what-if ───────────────────────────

function tWhatIf(tk: TK, D: number[][]): Finding | null {
  const { pre, b, h } = tk;
  const order: number[] = [];
  for (let q = 0; q < pre.n; q++) {
    const len = (D[q] as number[]).length;
    if ((b.pos[q] as number) < 0 && len >= 2 && len <= PROBE_MAX) order.push(q);
  }
  order.sort((x, y) => (D[x] as number[]).length - (D[y] as number[]).length || x - y);
  for (const q of order) {
    for (const c of D[q] as number[]) {
      const Dc = cloneD(D);
      Dc[q] = [c];
      const contra = propagate(pre, h, Dc, PROBE_ROUNDS);
      if (!contra) continue;
      const N = tk.name(q), C = tk.cell(c), P = tk.pr(q);
      let what: string;
      let reason: number[] = [c];
      if (contra.kind === 'person') {
        const X = contra.p === q ? P.he : tk.name(contra.p);
        what = contra.p === q ? `${P.he} would contradict ${P.himself}` : `${X} would have nowhere left to stand`;
        reason = [c, ...(D[contra.p] as number[]).slice(0, 8)];
      } else if (contra.kind === 'rule') {
        what = `there'd be no way that ${soft(pre, tk.said(contra.cc))}`;
      } else {
        what = `nobody could reach ${tk.line(contra.axis, contra.l)}`;
        const at = contra.axis === 0 ? pre.rowAt : pre.colAt;
        reason = [c, ...pre.g.free.filter((x) => at[x] === contra.l)];
      }
      const text = tk.pick([
        `If ${N} stood at ${C}, ${what}. Cross ${C} for ${N}.`,
        `Try ${N} at ${C}: ${what}. So not there.`,
      ], 'whatif', q, c);
      return { kind: 'cross', p: q, cells: [c], reason, rule: 'what-if', text };
    }
  }
  return null;
}

// ─────────────────────────── Runner ───────────────────────────

type Technique = (tk: TK, D: number[][]) => Finding | null;
const BASIC: Technique[] = [tSingle, tLineOwner, tUnary, tRelational, tLocked, tRooms];

function run(tk: TK, D: number[][], whatIf: boolean): Finding | null {
  for (const t of BASIC) {
    const f = t(tk, D);
    if (f) return f;
  }
  return whatIf ? tWhatIf(tk, D) : null;
}

/** Lower-case the first letter unless the sentence starts with a person's name. */
function soft(pre: Pre, s: string): string {
  const w = s.split(/[\s,']/)[0] ?? '';
  return pre.people.some((x) => x.name === w) ? s : lc(s);
}

/** Fold a two-sentence core into one ("…. Cross it" → "…; cross it") so a prefix keeps the hint at two sentences. */
function oneSentence(pre: Pre, text: string): string {
  const names = new Set(pre.people.map((x) => x.name));
  return text.replace(/\.\s+(\S+)/, (_m, w: string) => `; ${names.has(w.replace(/[^A-Za-z]/g, '')) ? w : lc(w)}`);
}

function toDeduction(pre: Pre, f: Finding, prefix = ''): Deduction {
  const cell = (i: number): Cell => indexCell(pre.cols, i);
  const uniq = [...new Set(f.reason)];
  return {
    kind: f.kind,
    personId: pre.ctx.personIds[f.p] ?? '',
    cells: f.cells.map(cell),
    reasonCells: uniq.map(cell),
    text: `Hm. ${prefix ? `${prefix} ${oneSentence(pre, f.text)}` : f.text}`,
    rule: prefix ? `liar/${f.rule}` : f.rule,
  };
}

/** Liar variants: who can still be the liar, from the board alone. */
function liarOptions(pre: Pre, b: Board, Dsafe: number[][]): { cands: number[]; forced: number[] } {
  const cands: number[] = [], forced: number[] = [];
  const pos = Int16Array.from(b.pos);
  for (let s = 0; s < pre.n; s++) {
    if (pre.victim[s]) continue;
    const mine = pre.truth.filter((cc) => cc.owner === s);
    const neg = pre.neg.filter((cc) => cc.owner === s);
    const items = pre.hypItems[s] ?? [];
    const cells = Dsafe[s] as number[];
    const saved = pos[s] as number;
    let canTrue = false, canLie = false;
    for (const c of cells) {
      pos[s] = c;
      if (!canTrue && mine.every((cc) => cc.f(pos) !== 0)) canTrue = true;
      if (!canLie && neg.every((cc) => cc.f(pos) !== 0) && items.every((cc) => cc.f(pos) !== 0)) canLie = true;
      if (canTrue && canLie) break;
    }
    pos[s] = saved;
    if (canLie) cands.push(s);
    if (!canTrue) forced.push(s);
  }
  return { cands, forced };
}

/**
 * Otto's next explained step from the player's current marks, or null when
 * nothing short of guessing applies (show {@link OTTO_STUCK_TEXT}).
 */
export function nextDeduction(p: Puzzle, state: OttoState): Deduction | null {
  const pre = getPre(p);
  const b = readBoard(pre, state);
  if (!pre.liarVariant) {
    const h = getHyp(pre, -2);
    const tk = new TK(pre, b, h);
    const m = structuralMistake(tk) ?? clueMistake(tk);
    if (m) return toDeduction(pre, m);
    const D = domains(pre, b, h);
    const st = stuckMistake(tk, D);
    if (st) return toDeduction(pre, st);
    const f = run(tk, D, true);
    return f ? toDeduction(pre, f) : null;
  }

  // ── liar variants
  const safe = getHyp(pre, -1);
  const tks = new TK(pre, b, safe);
  const m = structuralMistake(tks) ?? clueMistake(tks) ?? liarMistake(tks);
  if (m) return toDeduction(pre, m);
  const Dsafe = domains(pre, b, safe);
  const st = stuckMistake(tks, Dsafe);
  if (st) return toDeduction(pre, st);

  const opts = liarOptions(pre, b, Dsafe);
  const forced = opts.forced;
  // hypotheses already refuted on a board this one extends stay refuted
  const cands = opts.cands.filter((s) => { const pr = pre.dead.get(s); return !pr || !extendsBoard(pr, b); });
  const refuted = cands.length < opts.cands.length;
  let liar = -1;
  let why = '';
  const sentences = (s: number): string => {
    const k = pre.truth.filter((cc) => cc.owner === s).length;
    const P = tks.pr(s);
    return k === 2 ? `${P.his} two sentences can't both be true` : k === 1 ? `${P.his} story doesn't fit the board` : `${P.his} sentences can't all be true`;
  };
  if (forced.length === 1) { liar = forced[0] as number; why = sentences(liar); }
  else if (cands.length === 1) {
    liar = cands[0] as number;
    why = refuted ? 'with anyone else as the liar, the plan falls apart' : 'nobody else\'s story can be a lie';
  }
  else if (cands.length === 0 || forced.length > 1) {
    return toDeduction(pre, {
      kind: 'mistake', p: forced[1] ?? 0, cells: [], reason: [], rule: 'mistake-liar',
      text: 'As marked, nobody can be the one liar. One of your pins or crosses is wrong.',
    });
  }

  const identified = (s: number, reason: string, safeFirst: boolean): Deduction | null => {
    if (safeFirst) {
      const f0 = run(tks, Dsafe, false);
      if (f0) return toDeduction(pre, f0);
    }
    const h = getHyp(pre, s);
    const tk = new TK(pre, b, h);
    const D = domains(pre, b, h);
    const prefix = `Someone is lying, and it can only be ${tk.name(s)} — ${reason}.`;
    const mm = clueMistake(tk) ?? stuckMistake(tk, D);
    if (mm) return toDeduction(pre, mm, prefix);
    const f = run(tk, D, true);
    return f ? toDeduction(pre, f, prefix) : null;
  };
  if (liar >= 0) return identified(liar, why, true);

  // liar unknown: liar-independent reasoning first
  const f = run(tks, Dsafe, true);
  if (f) return toDeduction(pre, f);

  // try every candidate as the liar
  const survivors: { s: number; D: number[][] }[] = [];
  for (const s of cands) {
    const h = getHyp(pre, s);
    const D = domains(pre, b, h);
    if (D.some((d) => !d.length)) continue;
    if (propagate(pre, h, D, HYP_ROUNDS)) { pre.dead.set(s, { pos: b.pos, crossed: b.crossed }); continue; }
    survivors.push({ s, D });
  }
  if (survivors.length === 0) {
    return toDeduction(pre, {
      kind: 'mistake', p: cands[0] ?? 0, cells: [], reason: [], rule: 'mistake-liar',
      text: 'Whoever I take for the liar, the plan falls apart. One of your pins or crosses is wrong.',
    });
  }
  if (survivors.length === 1) {
    const s = (survivors[0] as { s: number }).s;
    return identified(s, 'with anyone else as the liar, the plan falls apart', false);
  }
  // cells ruled out under every surviving hypothesis; if none, sharpen each hypothesis with a what-if pass
  for (let stage = 0; stage < 2; stage++) {
    if (stage === 1) {
      for (let i = survivors.length - 1; i >= 0; i--) {
        const sv = survivors[i] as { s: number; D: number[][] };
        if (!probeRefine(pre, getHyp(pre, sv.s), sv.D)) {
          pre.dead.set(sv.s, { pos: b.pos, crossed: b.crossed });
          survivors.splice(i, 1);
        }
      }
      if (survivors.length === 0) return null;
      if (survivors.length === 1) {
        return identified((survivors[0] as { s: number }).s, 'with anyone else as the liar, the plan falls apart', false);
      }
    }
    let best: { q: number; cells: number[]; left: number } | null = null;
    for (let q = 0; q < pre.n; q++) {
      if ((b.pos[q] as number) >= 0) continue;
      const U = new Set<number>();
      for (const sv of survivors) for (const c of sv.D[q] as number[]) U.add(c);
      const cells = (Dsafe[q] as number[]).filter((c) => !U.has(c));
      if (!cells.length) continue;
      if (!best || U.size < best.left) best = { q, cells, left: U.size };
    }
    if (!best) continue;
    const N = tks.name(best.q);
    return toDeduction(pre, {
      kind: 'cross', p: best.q, cells: best.cells, reason: [], rule: 'liar-what-if',
      text: tks.pick([
        `Whoever turns out to be lying, ${N} can't be at ${tks.cells(best.cells, 'or')}.`,
        `Try each suspect as the liar — in every version, ${tks.cells(best.cells)} ${tks.isAre(best.cells)} out for ${N}.`,
      ], 'liarU', best.q),
    });
  }
  return null;
}

/**
 * One bounded what-if pass inside a hypothesis: drop squares whose trial pin
 * collapses the plan. Returns false when the hypothesis itself collapses.
 */
function probeRefine(pre: Pre, h: Hyp, D: number[][]): boolean {
  for (let q = 0; q < pre.n; q++) {
    const d = D[q] as number[];
    if (d.length < 2 || d.length > PROBE_MAX) continue;
    const keep = d.filter((c) => {
      const Dc = cloneD(D);
      Dc[q] = [c];
      return !propagate(pre, h, Dc, PROBE_ROUNDS);
    });
    if (!keep.length) return false;
    if (keep.length < d.length) {
      D[q] = keep;
      if (propagate(pre, h, D, HYP_ROUNDS)) return false;
    }
  }
  return true;
}

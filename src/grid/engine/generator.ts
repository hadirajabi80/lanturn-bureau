/**
 * Procedural case generator (docs/GRID-PLAN.md §3). Pure and deterministic:
 * `generatePuzzle(season, tier, index)` always returns the same case.
 *
 * Board rule: an N×N map holds exactly N people (N−1 suspects + the victim),
 * exactly one per row and one per column. The killer is the one other person
 * in the victim's room (the victim's room holds exactly two people).
 *
 * Pipeline: rooms (seeded region growth) → furniture (every row/column keeps
 * ≥ 2 free cells) → solution = random row→column permutation on free cells
 * with a two-person room for the victim → candidate clue enumeration →
 * greedy selection driven by a human-style deduction engine (unary filtering
 * + row/column exclusion + relational arc consistency + shallow what-if in
 * hard/extreme) until every person is pinned down → minimisation → top-up for
 * readability → verification with the exhaustive solver. Failed attempts
 * bump a retry counter into the seed.
 */
import type { Furniture, FurnitureKind, KillerRule, Person, Predicate, Puzzle, Room, Tier } from '../types';
import { OCCUPIABLE, TIERS } from '../types';
import type { GridCtx } from './geometry';
import { colOf, diagAdjacent, indexCell, isCorner, isEdge, lineHasBlocker, lineOfSight, manhattan, rowOf } from './geometry';
import { killerIndex } from './killer';
import { CAST } from './people';
import { killerRulePredicate } from './play';
import type { PuzzleCtx } from './predicates';
import { makePuzzleCtx } from './predicates';
import type { Rng } from './rng';
import { hashSeed, mulberry32, weightedIndex } from './rng';
import type { Domains } from './solver';
import { allSingle, cloneDomains, deduce, initialDomains, makeProblem, probe, propagate, search } from './solver';
import { clueText, killerRuleText } from './text';
import { DAILY_THEMES, SEASONS, THEMES } from './themes';

// ─────────────────────────── Tier configuration ───────────────────────────

type PType = Predicate['type'];
/** Clue categories drive selection weights and the order clues are shown in. */
type Cat = 'direct' | 'semi' | 'neg' | 'rel' | 'relNeg' | 'global' | 'or';

interface TierSpec {
  /** furniture pieces per N, at the start / end of the tier ramp */
  furnPerN: [number, number];
  types: ReadonlySet<PType>;
  /** negated forms (corner/edge false) allowed */
  negatives: boolean;
  maxClues: number;
  /** max clues per person that mention other people */
  relCap: number;
  /** what-if probing on people with ≤ N cells left, at the start / end of the tier ramp (0 = none) */
  probe: [number, number];
  /** chance that the top-up gives a person who needed one clue a second, weaker one */
  extraClue: number;
  par: number;
  refPeople: number;
  weights: Record<Cat, number>;
}

/**
 * Types that need two people in the same row or column can never be true
 * under the one-per-row/column rule, so they are never generated:
 * sameRowAs, sameColAs, directlyDirOf, between.
 */
const EASY_TYPES: PType[] = ['inRoom', 'onFurniture', 'besideFurniture', 'row', 'col', 'corner', 'notOnFurniture',
  'notBesideFurniture'];
const MEDIUM_TYPES: PType[] = [...EASY_TYPES, 'notInRoom', 'edge', 'onNoFurniture', 'onAnyFurniture', 'notRow', 'notCol',
  'besideAnyFurniture', 'notBesideAnyFurniture', 'sameRoomAs', 'dirOf'];
const HARD_TYPES: PType[] = [...MEDIUM_TYPES, 'differentRoomFrom', 'besidePerson', 'notBesidePerson', 'aloneInRoom',
  'roomCount', 'distance', 'roomHasFurniture'];
const EXTREME_TYPES: PType[] = [...HARD_TYPES, 'lineOfSight', 'or', 'roomSizeCmp'];

const TIER_SPEC: Record<Tier, TierSpec> = {
  easy: {
    furnPerN: [1.0, 1.3], types: new Set(EASY_TYPES), negatives: false, maxClues: 2, relCap: 0, probe: [0, 0],
    extraClue: 0.25, par: 90, refPeople: 4.5,
    weights: { direct: 3, semi: 2, neg: 0.8, rel: 0, relNeg: 0, global: 0, or: 0 },
  },
  medium: {
    furnPerN: [1.2, 1.5], types: new Set(MEDIUM_TYPES), negatives: false, maxClues: 2, relCap: 1, probe: [0, 0],
    extraClue: 0.35, par: 180, refPeople: 5.5,
    weights: { direct: 2.2, semi: 1.8, neg: 1.3, rel: 0.6, relNeg: 0, global: 0, or: 0 },
  },
  hard: {
    furnPerN: [1.4, 1.7], types: new Set(HARD_TYPES), negatives: true, maxClues: 3, relCap: 2, probe: [2, 3],
    extraClue: 0.5, par: 300, refPeople: 7,
    weights: { direct: 1.3, semi: 1.4, neg: 1.3, rel: 2, relNeg: 1.1, global: 1.2, or: 0 },
  },
  extreme: {
    furnPerN: [1.5, 1.9], types: new Set(EXTREME_TYPES), negatives: true, maxClues: 3, relCap: 2, probe: [3, 4],
    extraClue: 0.55, par: 480, refPeople: 10,
    weights: { direct: 0.8, semi: 1.1, neg: 1.2, rel: 2.6, relNeg: 1.5, global: 1.4, or: 0.7 },
  },
};

/**
 * Per-type flavour multipliers on top of the category weights. Geometric
 * relations (distance) prune very efficiently and would otherwise crowd out
 * the room-based reasoning that gives the game its character.
 */
const TYPE_BOOST: Partial<Record<PType, number>> = {
  distance: 0.35, dirOf: 0.9,
  sameRoomAs: 1.8, differentRoomFrom: 1.3, aloneInRoom: 1.6, roomCount: 1.4, besidePerson: 1.5,
  lineOfSight: 1.6, roomHasFurniture: 1.2, roomSizeCmp: 1.2, inRoom: 1.3, notInRoom: 1.1,
  onFurniture: 1.3, besideFurniture: 1.2, notOnFurniture: 0.8, notBesideFurniture: 1.0,
};

/** Selection: how many candidates are trial-propagated per step. */
const SAMPLE_K = 12;

const CAT_ORDER: Record<Cat, number> = { direct: 0, semi: 1, neg: 2, global: 3, rel: 4, relNeg: 5, or: 6 };

function catOf(p: Predicate): Cat {
  switch (p.type) {
    case 'inRoom': case 'row': case 'col': case 'onFurniture': return 'direct';
    case 'corner': return p.value ? 'direct' : 'neg';
    case 'edge': return p.value ? 'semi' : 'neg';
    case 'besideFurniture': case 'onAnyFurniture': case 'besideAnyFurniture': case 'roomSizeCmp': return 'semi';
    case 'roomHasFurniture': return p.value ? 'semi' : 'neg';
    case 'notInRoom': case 'notRow': case 'notCol': case 'notOnFurniture': case 'notBesideFurniture':
    case 'onNoFurniture': case 'notBesideAnyFurniture': case 'not': return 'neg';
    case 'differentRoomFrom': case 'notBesidePerson': return 'relNeg';
    case 'lineOfSight': return p.value ? 'rel' : 'relNeg';
    case 'aloneInRoom': case 'roomCount': return 'global';
    case 'or': return 'or';
    default: return 'rel';
  }
}

// ─────────────────────────── Seasons / sizes / ramp ───────────────────────────

function seasonInfo(seasonId: string, index: number): { themeId: string; casesPerTier: number } {
  if (seasonId === 'daily') return { themeId: DAILY_THEMES[Math.abs(index) % DAILY_THEMES.length] as string, casesPerTier: 40 };
  const s = SEASONS.find((x) => x.id === seasonId);
  return s ? { themeId: s.themeId, casesPerTier: s.casesPerTier } : { themeId: 'mansion', casesPerTier: 40 };
}

/** Grid size ladder per tier: [last case index (1-based, inclusive), N]. */
const SIZE_LADDER: Record<Tier, [number, number][]> = {
  easy: [[20, 4], [40, 5]],
  medium: [[20, 5], [40, 6]],
  hard: [[15, 6], [30, 7], [40, 8]],
  extreme: [[10, 8], [20, 9], [30, 10], [35, 11], [40, 12]],
};

/**
 * Board size N (the map is N×N and holds N people) for case `index` (1-based)
 * of a tier. Cheap — no generation. Indices past 40 use the largest size.
 */
export function gridSizeFor(tier: Tier, index: number): number {
  const ladder = SIZE_LADDER[tier];
  for (const [upTo, n] of ladder) if (index <= upTo) return n;
  return (ladder[ladder.length - 1] as [number, number])[1];
}

/** Daily cases: a stable pseudo index inside the 40-case ramp. */
const dailyVirtualIndex = (index: number): number => ((Math.abs(index) * 7) % 40) + 1;

function sizeFor(seasonId: string, tier: Tier, index: number): number {
  if (seasonId === 'daily') {
    if (tier === 'extreme') return 9 + (hashSeed('daily-size', index) % 4);
    return gridSizeFor(tier, dailyVirtualIndex(index));
  }
  return gridSizeFor(tier, index);
}

/** 0 → first case of a tier, 1 → last. Daily cases land somewhere along the ramp. */
function rampT(seasonId: string, index: number): number {
  if (seasonId === 'daily') return (dailyVirtualIndex(index) - 1) / 39;
  const { casesPerTier } = seasonInfo(seasonId, index);
  return Math.max(0, Math.min(1, (index - 1) / Math.max(1, casesPerTier - 1)));
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// ─────────────────────────── Title ───────────────────────────

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Cheap: only seed → title. Titles are distinct within a season (affine permutation of word pairs). */
export function puzzleTitle(seasonId: string, tier: Tier, index: number): string {
  const { themeId, casesPerTier } = seasonInfo(seasonId, index);
  const theme = THEMES[themeId] ?? (THEMES.mansion as NonNullable<(typeof THEMES)['mansion']>);
  const A = theme.titleWords.a.length, B = theme.titleWords.b.length, M = A * B;
  let k: number;
  if (seasonId === 'daily') {
    k = hashSeed('daily-title', index) % M;
  } else {
    let stride = (hashSeed(seasonId, 'stride') % (M - 1)) + 1;
    while (gcd(stride, M) !== 1) stride = (stride % (M - 1)) + 1;
    const offset = hashSeed(seasonId, 'offset') % M;
    const g = TIERS.indexOf(tier) * casesPerTier + (index - 1);
    k = (((g * stride) % M) + offset) % M;
  }
  return `The ${theme.titleWords.a[k % A]} ${theme.titleWords.b[Math.floor(k / A)]}`;
}

// ─────────────────────────── Rooms ───────────────────────────

/** Seeded region growth: k anchors spread out, then smallest-first random BFS growth. */
function growRooms(rng: Rng, rows: number, cols: number, k: number): Int16Array | null {
  const N = rows * cols;
  const dist = (a: number, b: number): number =>
    Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) + Math.abs((a % cols) - (b % cols));
  for (let attempt = 0; attempt < 40; attempt++) {
    const owner = new Int16Array(N).fill(-1);
    const sizes: number[] = new Array<number>(k).fill(0);
    const anchors: number[] = [];
    for (let i = 0; i < k; i++) {
      let best = -1, bestD = -1;
      for (let s = 0; s < 12; s++) {
        const c = rng.int(N);
        if (owner[c] !== -1) continue;
        let d = anchors.length ? Infinity : 0;
        for (const a of anchors) d = Math.min(d, dist(a, c));
        if (d > bestD) { bestD = d; best = c; }
      }
      if (best < 0) best = owner.indexOf(-1);
      owner[best] = i;
      sizes[i] = 1;
      anchors.push(best);
    }
    let assigned = k;
    while (assigned < N) {
      const fronts: number[][] = [];
      const weights: number[] = [];
      for (let r = 0; r < k; r++) {
        const seen = new Set<number>();
        for (let c = 0; c < N; c++) {
          if (owner[c] !== r) continue;
          const rr = Math.floor(c / cols), cc = c % cols;
          if (rr > 0 && owner[c - cols] === -1) seen.add(c - cols);
          if (rr < rows - 1 && owner[c + cols] === -1) seen.add(c + cols);
          if (cc > 0 && owner[c - 1] === -1) seen.add(c - 1);
          if (cc < cols - 1 && owner[c + 1] === -1) seen.add(c + 1);
        }
        const f = [...seen].sort((x, y) => x - y);
        fronts.push(f);
        weights.push(f.length ? 1 / Math.pow(sizes[r] as number, 1.6) : 0);
      }
      const r = weightedIndex(rng, weights);
      if (r < 0) break;
      const cell = rng.pick(fronts[r] as number[]);
      owner[cell] = r;
      sizes[r] = (sizes[r] as number) + 1;
      assigned++;
    }
    if (assigned < N) continue;
    const avg = N / k;
    if (sizes.some((s) => s < 3 || s > avg * 2.3)) continue;
    return owner;
  }
  return null;
}

// ─────────────────────────── Furniture ───────────────────────────

const TWO_ALWAYS = new Set<FurnitureKind>(['sofa', 'bed', 'bench', 'counter', 'coffin']);
const TWO_SOMETIMES = new Set<FurnitureKind>(['table', 'desk']);

/**
 * 1–3 pieces per room from the theme pool. Blocking pieces keep ≥ 2 open
 * cells in their room and ≥ 2 free cells in every row and column.
 */
function placeFurniture(
  rng: Rng, rows: number, cols: number, owner: Int16Array, k: number, count: number, pool: FurnitureKind[],
): Furniture[] | null {
  const N = rows * cols;
  const occPool = pool.filter((x) => OCCUPIABLE[x]);
  const blkPool = pool.filter((x) => !OCCUPIABLE[x]);
  const roomCells: number[][] = Array.from({ length: k }, () => []);
  for (let c = 0; c < N; c++) (roomCells[owner[c] as number] as number[]).push(c);
  const maxSame = Math.max(2, Math.ceil(count / 6));

  for (let attempt = 0; attempt < 20; attempt++) {
    const kindAt: (FurnitureKind | null)[] = new Array<FurnitureKind | null>(N).fill(null);
    const blocked = new Uint8Array(N);
    const rowFree = new Array<number>(rows).fill(cols);
    const colFree = new Array<number>(cols).fill(rows);
    // which room each piece goes to: every room gets one, extras weighted by room size (≤ 3 per room)
    const planned: number[] = new Array<number>(k).fill(0);
    const plan: number[] = [];
    for (const r of rng.shuffle([...Array(k).keys()]).slice(0, Math.min(k, count))) { plan.push(r); planned[r] = 1; }
    while (plan.length < count) {
      const w = roomCells.map((cells, r) =>
        (planned[r] as number) < 3 && cells.length >= (planned[r] as number) * 2 + 3 ? cells.length : 0);
      const r = weightedIndex(rng, w);
      if (r < 0) break;
      plan.push(r);
      planned[r] = (planned[r] as number) + 1;
    }
    const used = new Map<FurnitureKind, number>();
    const furniture: Furniture[] = [];
    for (const r of plan) {
      const cells = roomCells[r] as number[];
      for (let tries = 0; tries < 14; tries++) {
        const list = rng.chance(0.5) ? (occPool.length ? occPool : pool) : (blkPool.length ? blkPool : pool);
        const kind = rng.pick(list);
        if ((used.get(kind) ?? 0) >= maxSame) continue;
        const two = TWO_ALWAYS.has(kind) || (TWO_SOMETIMES.has(kind) && rng.chance(0.35));
        const spots: number[][] = [];
        for (const c of cells) {
          if (kindAt[c] !== null) continue;
          if (!two) { spots.push([c]); continue; }
          if (c % cols < cols - 1 && owner[c + 1] === r && kindAt[c + 1] === null) spots.push([c, c + 1]);
          if (c + cols < N && owner[c + cols] === r && kindAt[c + cols] === null) spots.push([c, c + cols]);
        }
        if (!spots.length) continue;
        const spot = rng.pick(spots);
        if (!OCCUPIABLE[kind]) {
          const open = cells.filter((c) => !blocked[c]).length;
          if (open - spot.length < 2) continue;
          let ok = true;
          for (const c of spot) {
            const rr = Math.floor(c / cols), cc = c % cols;
            const inRow = spot.filter((x) => Math.floor(x / cols) === rr).length;
            const inCol = spot.filter((x) => x % cols === cc).length;
            if ((rowFree[rr] as number) - inRow < 2 || (colFree[cc] as number) - inCol < 2) ok = false;
          }
          if (!ok) continue;
        }
        for (const c of spot) {
          kindAt[c] = kind;
          if (!OCCUPIABLE[kind]) {
            blocked[c] = 1;
            rowFree[Math.floor(c / cols)] = (rowFree[Math.floor(c / cols)] as number) - 1;
            colFree[c % cols] = (colFree[c % cols] as number) - 1;
          }
        }
        const piece: Furniture = { id: `f${furniture.length}`, kind, cells: spot.map((c) => indexCell(cols, c)) };
        if (spot.length === 2) piece.orient = (spot[1] as number) - (spot[0] as number) === 1 ? 'h' : 'v';
        furniture.push(piece);
        used.set(kind, (used.get(kind) ?? 0) + 1);
        break;
      }
    }
    if (furniture.length < Math.max(k, count - 2)) continue;
    return furniture;
  }
  return null;
}

// ─────────────────────────── Solution ───────────────────────────

/**
 * A random row → column permutation on free cells (people like to sit on
 * furniture), returned as one cell per row. null when none is found quickly.
 */
function randomPermutation(rng: Rng, g: GridCtx): number[] | null {
  const N = g.rows;
  const order = rng.shuffle([...Array(N).keys()]);
  const cellOfRow = new Array<number>(N).fill(-1);
  const colUsed = new Uint8Array(g.cols);
  let nodes = 0;
  const rec = (k: number): boolean => {
    if (k === N) return true;
    if (++nodes > 4000) return false;
    const r = order[k] as number;
    const opts: { c: number; key: number }[] = [];
    for (let c = 0; c < g.cols; c++) {
      const i = r * g.cols + c;
      if (colUsed[c] || g.blocked[i]) continue;
      const kind = g.kindAt[i];
      opts.push({ c: i, key: rng.next() * (kind && OCCUPIABLE[kind] ? 2.4 : 1) });
    }
    opts.sort((a, b) => b.key - a.key);
    for (const o of opts) {
      colUsed[o.c % g.cols] = 1;
      cellOfRow[r] = o.c;
      if (rec(k + 1)) return true;
      colUsed[o.c % g.cols] = 0;
    }
    cellOfRow[r] = -1;
    return false;
  };
  return rec(0) ? cellOfRow : null;
}

/**
 * Place everyone (one per row and column) so that the victim's room holds
 * exactly two people: the victim and the killer.
 */
function placePeople(rng: Rng, g: GridCtx, n: number, victim: number, killer: number): Int16Array | null {
  for (let attempt = 0; attempt < 40; attempt++) {
    const cells = randomPermutation(rng, g);
    if (!cells) continue;
    const byRoom = new Map<number, number[]>();
    for (const c of cells) {
      const R = g.roomOf[c] as number;
      const list = byRoom.get(R) ?? [];
      list.push(c);
      byRoom.set(R, list);
    }
    const pairs = [...byRoom.values()].filter((l) => l.length === 2);
    if (!pairs.length) continue;
    const pair = rng.shuffle(rng.pick(pairs));
    const pos = new Int16Array(n).fill(-1);
    pos[victim] = pair[0] as number;
    pos[killer] = pair[1] as number;
    const rest = rng.shuffle(cells.filter((c) => c !== pair[0] && c !== pair[1]));
    let k = 0;
    for (let p = 0; p < n; p++) if (pos[p] === -1) pos[p] = rest[k++] as number;
    if (killerIndex(g, { type: 'aloneWithVictim' }, pos, victim) === killer) return pos;
  }
  return null;
}

// ─────────────────────────── Clue candidates ───────────────────────────

interface Cand {
  owner: number;
  pred: Predicate;
  cat: Cat;
  /** canonical key — symmetric duplicates share it */
  key: string;
  /** unordered pair key for relational clues (variety penalty) */
  pair: string | null;
}

function clueKey(owner: number, p: Predicate, who: (id: string) => number): string {
  const sym = (t: string, a: number, b: number, extra = ''): string => `${t}|${Math.min(a, b)}|${Math.max(a, b)}|${extra}`;
  switch (p.type) {
    case 'sameRoomAs': case 'differentRoomFrom': case 'besidePerson': case 'notBesidePerson':
    case 'sameRowAs': case 'sameColAs':
      return sym(p.type, owner, who(p.personId));
    case 'distance': return sym('distance', owner, who(p.personId), `${p.cmp}${p.n}`);
    case 'lineOfSight': return sym('los', owner, who(p.personId), String(p.value));
    case 'dirOf': case 'directlyDirOf': {
      const o = who(p.personId);
      const axis = p.dir === 'north' || p.dir === 'south' ? 'ns' : 'ew';
      const first = p.dir === 'north' || p.dir === 'west' ? owner : o;
      return `${p.type}|${axis}|${first}|${first === owner ? o : owner}`;
    }
    case 'between': {
      const a = who(p.a), b = who(p.b);
      return `between|${owner}|${Math.min(a, b)}|${Math.max(a, b)}`;
    }
    default: return `${owner}|${JSON.stringify(p)}`;
  }
}

function enumerateCandidates(
  rng: Rng, spec: TierSpec, ctx: PuzzleCtx, sol: Int16Array, victim: number, killer: number,
): Cand[] {
  const g = ctx.grid;
  const n = sol.length;
  const ids = ctx.personIds;
  const out: Cand[] = [];
  const who = (id: string): number => ctx.personIndex.get(id) ?? -1;
  const allowed = (t: PType): boolean => spec.types.has(t);
  const add = (owner: number, pred: Predicate): void => {
    if (!allowed(pred.type)) return;
    const others = pred.type === 'between' ? [pred.a, pred.b]
      : 'personId' in pred ? [pred.personId] : [];
    // "X was (not) in the same room as the victim" would name the killer outright
    if (others.includes(ids[victim] as string) && (pred.type === 'sameRoomAs' || pred.type === 'differentRoomFrom')) return;
    const pair = others.length === 1 ? [owner, who(others[0] as string)].sort((x, y) => x - y).join('|') : null;
    out.push({ owner, pred, cat: catOf(pred), key: clueKey(owner, pred, who), pair });
  };
  const occKinds = [...g.kindsPresent].filter((k) => OCCUPIABLE[k]);
  const allKinds = [...g.kindsPresent];
  const roomSizes = g.roomSize;
  const maxSize = Math.max(...roomSizes), minSize = Math.min(...roomSizes);
  const uniqueMax = roomSizes.filter((s) => s === maxSize).length === 1;
  const uniqueMin = roomSizes.filter((s) => s === minSize).length === 1;

  /** Simple true/false unary atoms, used for `or`. */
  const atoms = (p: number, truth: boolean): Predicate[] => {
    const c = sol[p] as number, R = g.roomOf[c] as number, row = rowOf(g, c), col = colOf(g, c);
    const res: Predicate[] = [];
    g.roomIds.forEach((rid, ri) => { if ((ri === R) === truth) res.push({ type: 'inRoom', roomId: rid }); });
    for (let r = 0; r < g.rows; r++) if ((r === row) === truth) res.push({ type: 'row', index: r });
    for (let k = 0; k < g.cols; k++) if ((k === col) === truth) res.push({ type: 'col', index: k });
    for (const k of occKinds) if ((g.kindAt[c] === k) === truth) res.push({ type: 'onFurniture', kind: k });
    for (const k of allKinds) if ((g.adjKinds[c] as Set<FurnitureKind>).has(k) === truth) res.push({ type: 'besideFurniture', kind: k });
    return res;
  };

  for (let p = 0; p < n; p++) {
    const c = sol[p] as number;
    const R = g.roomOf[c] as number;
    const row = rowOf(g, c), col = colOf(g, c);
    const isVictim = p === victim;
    const kind = g.kindAt[c];
    const adj = g.adjKinds[c] as Set<FurnitureKind>;

    // ── unary
    add(p, { type: 'inRoom', roomId: g.roomIds[R] as string });
    if (kind && OCCUPIABLE[kind]) add(p, { type: 'onFurniture', kind });
    for (const k of adj) add(p, { type: 'besideFurniture', kind: k });
    add(p, { type: 'row', index: row });
    add(p, { type: 'col', index: col });
    if (isCorner(g, c)) add(p, { type: 'corner', value: true });
    if (isEdge(g, c)) add(p, { type: 'edge', value: true });
    g.roomIds.forEach((rid, ri) => { if (ri !== R) add(p, { type: 'notInRoom', roomId: rid }); });
    for (const r of rng.shuffle([...Array(g.rows).keys()].filter((x) => x !== row)).slice(0, 3)) add(p, { type: 'notRow', index: r });
    for (const k of rng.shuffle([...Array(g.cols).keys()].filter((x) => x !== col)).slice(0, 3)) add(p, { type: 'notCol', index: k });
    for (const k of occKinds) if (k !== kind) add(p, { type: 'notOnFurniture', kind: k });
    for (const k of allKinds) if (!adj.has(k)) add(p, { type: 'notBesideFurniture', kind: k });
    add(p, kind ? { type: 'onAnyFurniture' } : { type: 'onNoFurniture' });
    add(p, adj.size ? { type: 'besideAnyFurniture' } : { type: 'notBesideAnyFurniture' });
    if (spec.negatives) {
      if (!isCorner(g, c)) add(p, { type: 'corner', value: false });
      if (!isEdge(g, c)) add(p, { type: 'edge', value: false });
    }
    const rk = g.roomKinds[R] as Set<FurnitureKind>;
    for (const k of allKinds) {
      const everywhere = g.roomKinds.every((s) => s.has(k));
      if (rk.has(k) && !everywhere) add(p, { type: 'roomHasFurniture', kind: k, value: true });
      if (!rk.has(k)) add(p, { type: 'roomHasFurniture', kind: k, value: false });
    }
    if (uniqueMax && roomSizes[R] === maxSize) add(p, { type: 'roomSizeCmp', cmp: 'exactly', n: maxSize });
    if (uniqueMin && roomSizes[R] === minSize) add(p, { type: 'roomSizeCmp', cmp: 'exactly', n: minSize });

    if (isVictim) continue; // the victim only ever gets plain positional clues (and only as a last resort)

    // ── or (extreme): one true atom + one false atom, in random order
    if (allowed('or')) {
      const ts = rng.shuffle(atoms(p, true)), fs = rng.shuffle(atoms(p, false));
      for (let i = 0; i < Math.min(3, ts.length, fs.length); i++) {
        const a = ts[i] as Predicate, b = fs[i] as Predicate;
        add(p, rng.chance(0.5) ? { type: 'or', a, b } : { type: 'or', a: b, b: a });
      }
    }

    // ── room occupancy (never for the killer: "one of exactly two" would point straight at them)
    if (p !== killer) {
      let inRoom = 1;
      for (let q = 0; q < n; q++) if (q !== p && g.roomOf[sol[q] as number] === R) inRoom++;
      if (inRoom === 1) add(p, { type: 'aloneInRoom' });
      else {
        add(p, { type: 'roomCount', cmp: 'exactly', n: inRoom });
        add(p, rng.chance(0.5) ? { type: 'roomCount', cmp: 'atLeast', n: inRoom } : { type: 'roomCount', cmp: 'atMost', n: inRoom });
      }
    }

    // ── relational (rows and columns always differ between two people)
    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      const d = sol[q] as number;
      const X = ids[q] as string;
      if (g.roomOf[d] === R) add(p, { type: 'sameRoomAs', personId: X });
      else add(p, { type: 'differentRoomFrom', personId: X });
      if (diagAdjacent(g, c, d)) add(p, { type: 'besidePerson', personId: X });
      else if (manhattan(g, c, d) <= 4 && rng.chance(0.5)) add(p, { type: 'notBesidePerson', personId: X });
      const qr = rowOf(g, d), qc = colOf(g, d);
      add(p, { type: 'dirOf', personId: X, dir: row < qr ? 'north' : 'south' });
      add(p, { type: 'dirOf', personId: X, dir: col < qc ? 'west' : 'east' });
      // distances stay small: "exactly eleven steps" is a disguised corner pin, not a deduction
      const dist = manhattan(g, c, d);
      if (dist <= 4) add(p, { type: 'distance', personId: X, cmp: 'exactly', n: dist });
      if (rng.chance(0.5)) {
        if (dist <= 4) add(p, { type: 'distance', personId: X, cmp: 'atMost', n: dist + rng.int(2) });
      } else if (dist >= 3) add(p, { type: 'distance', personId: X, cmp: 'atLeast', n: Math.min(5, dist - rng.int(2)) });
      // sight lines between people run along diagonals; only interesting when furniture could cut them
      if (Math.abs(row - qr) === Math.abs(col - qc) && Math.abs(row - qr) >= 2 && lineHasBlocker(g, c, d)) {
        add(p, { type: 'lineOfSight', personId: X, value: lineOfSight(g, c, d) });
      }
    }
  }
  return out;
}

// ─────────────────────────── Clue selection ───────────────────────────

interface Selection { owner: number; pred: Predicate; cat: Cat }

function selectClues(
  rng: Rng, tier: Tier, t: number, spec: TierSpec, ctx: PuzzleCtx, sol: Int16Array, victim: number, killer: number,
): Selection[] | null {
  const g = ctx.grid;
  const n = sol.length;
  const cands = enumerateCandidates(rng, spec, ctx, sol, victim, killer);
  const C = cands.length;
  // index C: the victim's killer-rule sentence ("alone with the killer") — always active
  const prob = makeProblem(ctx, [
    ...cands.map((c) => ({ owner: c.owner, pred: c.pred })),
    { owner: victim, pred: killerRulePredicate({ type: 'aloneWithVictim' }) },
  ]);
  const clueOf = (i: number) => prob.clues[i] as (typeof prob.clues)[number];
  const candOf = (i: number): Cand => cands[i] as Cand;

  // unary candidates that rule out nothing are useless
  const dead = new Uint8Array(C);
  for (let i = 0; i < C; i++) {
    const m = clueOf(i).mask;
    if (m && g.free.every((x) => m[x] === 1)) dead[i] = 1;
  }

  const act = new Uint8Array(C + 1);
  act[C] = 1;
  const probeMax = Math.round(lerp(spec.probe[0], spec.probe[1], t));
  const everyone = [...Array(n).keys()];
  const maxFor = (p: number): number => (p === victim ? 2 : spec.maxClues);
  const counts = new Int32Array(n);
  const relCounts = new Int32Array(n);
  const usedKeys = new Set<string>();
  const pairUse = new Map<string, number>();
  const catCount: Record<Cat, number> = { direct: 0, semi: 0, neg: 0, rel: 0, relNeg: 0, global: 0, or: 0 };
  const rowColCount = new Int32Array(n);
  const orOwners = new Set<number>();
  const isRowCol = (i: number): boolean => candOf(i).pred.type === 'row' || candOf(i).pred.type === 'col';
  const directCap = Math.max(1, Math.ceil(n / 3));
  const W = spec.weights;

  /** intersection of each person's active unary masks (redundancy check) */
  const uDom: Uint8Array[] = [];
  const rebuildUDom = (): void => {
    uDom.length = 0;
    for (let p = 0; p < n; p++) {
      const u = new Uint8Array(g.size);
      for (const x of g.free) u[x] = 1;
      uDom.push(u);
    }
    for (let i = 0; i < C; i++) {
      const cl = clueOf(i);
      if (!act[i] || !cl.mask) continue;
      const u = uDom[cl.owner] as Uint8Array, m = cl.mask;
      for (let x = 0; x < g.size; x++) if (!m[x]) u[x] = 0;
    }
  };
  rebuildUDom();

  const addsInfo = (i: number): boolean => {
    const cl = clueOf(i);
    if (!cl.mask) return true;
    const u = uDom[cl.owner] as Uint8Array, m = cl.mask;
    for (const x of g.free) if (u[x] && !m[x]) return true;
    return false;
  };

  const baseEligible = (i: number, allowVictim: boolean): boolean => {
    if (act[i] || dead[i]) return false;
    const c = candOf(i), cl = clueOf(i);
    if (c.owner === victim && !allowVictim) return false;
    if ((counts[c.owner] as number) >= maxFor(c.owner)) return false;
    if (usedKeys.has(c.key)) return false;
    if (!cl.unary && (relCounts[c.owner] as number) >= spec.relCap) return false;
    if (c.cat === 'or' && (catCount.or >= 2 || orOwners.has(c.owner))) return false;
    // "row 2" + "column 3" is a bare coordinate, not a deduction
    if (isRowCol(i) && (rowColCount[c.owner] as number) > 0) return false;
    if (W[c.cat] <= 0) return false;
    return addsInfo(i);
  };

  /**
   * Is a two-person clue already implied by what the text says about that pair
   * (both people's own unary clues + every active clue about just the two of
   * them + the row/column rule)? Used so top-up clues never restate something obvious.
   */
  const impliedLocally = (i: number): boolean => {
    const cl = clueOf(i);
    if (cl.mask) return !addsInfo(i);
    if (cl.global || cl.deps.length !== 2) return false;
    const [a, b] = cl.deps as [number, number];
    const pairClues: number[] = [];
    for (let j = 0; j < C; j++) {
      const cj = clueOf(j);
      if (act[j] && !cj.global && cj.deps.length === 2 && cj.deps.includes(a) && cj.deps.includes(b)) pairClues.push(j);
    }
    const pos = new Int16Array(n).fill(-1);
    const ua = uDom[a] as Uint8Array, ub = uDom[b] as Uint8Array;
    for (const ca of g.free) {
      if (!ua[ca]) continue;
      for (const cb of g.free) {
        if (!ub[cb] || rowOf(g, ca) === rowOf(g, cb) || colOf(g, ca) === colOf(g, cb)) continue;
        pos[a] = ca; pos[b] = cb;
        if (pairClues.every((j) => clueOf(j).f(pos) === 1) && cl.f(pos) !== 1) return false;
      }
    }
    return true;
  };

  // how many candidates share (owner, type): weights are per *type*, so plentiful
  // weak families (notInRoom × every room, dirOf × every person) don't swamp the pool
  const groupSize = new Map<string, number>();
  const groupOf = (i: number): string => `${candOf(i).owner}|${candOf(i).pred.type}`;
  for (let i = 0; i < C; i++) groupSize.set(groupOf(i), (groupSize.get(groupOf(i)) ?? 0) + 1);

  const weightOf = (i: number): number => {
    const c = candOf(i);
    let w = (W[c.cat] * (TYPE_BOOST[c.pred.type] ?? 1)) / Math.sqrt(groupSize.get(groupOf(i)) ?? 1);
    if (c.cat === 'direct' && tier !== 'easy') w *= 1 - 0.4 * t;
    if (c.cat === 'direct' && tier === 'extreme' && catCount.direct >= directCap) w *= 0.15;
    if (c.pair && pairUse.get(c.pair)) w *= 0.3;
    return w;
  };

  const apply = (i: number, Dst: Domains): boolean => {
    const cl = clueOf(i);
    if (cl.mask) {
      const m = cl.mask;
      const nd = (Dst[cl.owner] as number[]).filter((x) => m[x] === 1);
      if (!nd.length) return false;
      Dst[cl.owner] = nd;
    }
    return propagate(prob, act, Dst, cl.global ? everyone : cl.deps);
  };
  const entropy = (Dx: Domains): number => Dx.reduce((s, d) => s + Math.log2(d.length), 0);

  const activate = (i: number): void => {
    const c = candOf(i);
    act[i] = 1;
    counts[c.owner] = (counts[c.owner] as number) + 1;
    if (!clueOf(i).unary) relCounts[c.owner] = (relCounts[c.owner] as number) + 1;
    usedKeys.add(c.key);
    if (c.pair) pairUse.set(c.pair, (pairUse.get(c.pair) ?? 0) + 1);
    catCount[c.cat]++;
    if (isRowCol(i)) rowColCount[c.owner] = (rowColCount[c.owner] as number) + 1;
    if (c.cat === 'or') orOwners.add(c.owner);
  };
  const deactivate = (i: number): void => {
    const c = candOf(i);
    act[i] = 0;
    counts[c.owner] = (counts[c.owner] as number) - 1;
    if (!clueOf(i).unary) relCounts[c.owner] = (relCounts[c.owner] as number) - 1;
    if (c.pair) pairUse.set(c.pair, (pairUse.get(c.pair) ?? 1) - 1);
    catCount[c.cat]--;
    if (isRowCol(i)) rowColCount[c.owner] = (rowColCount[c.owner] as number) - 1;
    if (c.cat === 'or') orOwners.delete(c.owner);
  };

  // ── 1. greedy selection, driven by the deduction engine
  let D = initialDomains(prob, act);
  if (!propagate(prob, act, D)) return null;
  let repairs = 0;
  for (let iter = 0; iter < 8 * n + 40 && !allSingle(D); iter++) {
    const base = entropy(D);
    const usefulNow = (i: number): boolean => {
      const cl = clueOf(i);
      if (cl.mask) {
        const m = cl.mask;
        return (D[cl.owner] as number[]).some((x) => !m[x]);
      }
      if (cl.global) return D.some((d) => d.length > 1);
      return cl.deps.some((p) => (D[p] as number[]).length > 1);
    };
    const tryPool = (pool: number[]): number => {
      if (!pool.length) return -1;
      const ws = pool.map(weightOf);
      const scored: { i: number; s: number }[] = [];
      for (let k = 0; k < SAMPLE_K; k++) {
        const j = weightedIndex(rng, ws);
        if (j < 0) break;
        const w = ws[j] as number;
        ws[j] = 0;
        const i = pool[j] as number;
        const Dc = cloneDomains(D);
        act[i] = 1;
        const ok = apply(i, Dc);
        act[i] = 0;
        if (!ok) continue;
        const gain = base - entropy(Dc);
        if (gain <= 1e-9) continue;
        // spending a person's last clue slot on something that leaves them
        // unresolved is a dead end more often than not
        const o = candOf(i).owner;
        const lastSlot = (counts[o] as number) + 1 >= maxFor(o);
        const pinned = (Dc[o] as number[]).length === 1;
        scored.push({ i, s: w * gain * (lastSlot && !pinned ? 0.03 : 1) });
      }
      if (!scored.length) return -1;
      return (scored[weightedIndex(rng, scored.map((x) => x.s))] as { i: number }).i;
    };
    const poolFor = (allowVictim: boolean): number[] => {
      const pool: number[] = [];
      for (let i = 0; i < C; i++) if (baseEligible(i, allowVictim) && usefulNow(i)) pool.push(i);
      return pool;
    };
    let pool = poolFor(false);
    let chosen = tryPool(pool);
    if (chosen < 0) chosen = tryPool(pool.filter((i) => clueOf(i).unary));
    if (chosen < 0) {
      pool = poolFor(true);
      chosen = tryPool(pool);
      if (chosen < 0) chosen = tryPool(pool.filter((i) => clueOf(i).unary));
    }
    if (chosen < 0) {
      // local repair: someone is unresolved but out of clue slots. Drop one of
      // their clues for good (its key stays banned), re-deduce, carry on.
      const stuck = everyone.filter((p) => (D[p] as number[]).length > 1 && (counts[p] as number) >= maxFor(p));
      if (!stuck.length || repairs++ >= 16) return null;
      const p = rng.pick(stuck);
      const mine: number[] = [];
      for (let i = 0; i < C; i++) if (act[i] && candOf(i).owner === p) mine.push(i);
      deactivate(rng.pick(mine));
      rebuildUDom();
      const r = deduce(prob, act, probeMax);
      if (r.status === 'contradiction') return null;
      D = r.D;
      continue;
    }
    activate(chosen);
    const cl = clueOf(chosen);
    if (cl.mask) {
      const u = uDom[cl.owner] as Uint8Array, m = cl.mask;
      for (let x = 0; x < g.size; x++) if (!m[x]) u[x] = 0;
    }
    if (!apply(chosen, D)) return null;
    if (!probe(prob, act, D, probeMax)) return null;
  }
  if (!allSingle(D)) return null;

  // ── 2. minimise: drop every clue the deduction no longer needs (victim clues first).
  // Harder tiers try to drop the direct clues first so the relational ones carry the case.
  const removalRank = (i: number): number => {
    if (candOf(i).owner === victim) return -1;
    if (tier === 'easy' || tier === 'medium') return 0;
    const cat = candOf(i).cat;
    return cat === 'direct' ? 0 : cat === 'semi' ? 1 : cat === 'neg' ? 2 : 3;
  };
  const order = rng.shuffle([...Array(C).keys()].filter((i) => act[i]))
    .map((i, k) => ({ i, k }))
    .sort((a, b) => removalRank(a.i) - removalRank(b.i) || a.k - b.k)
    .map((x) => x.i);
  for (const i of order) {
    const o = candOf(i).owner;
    if (o !== victim && (counts[o] as number) <= 1) continue;
    deactivate(i);
    if (deduce(prob, act, probeMax).status !== 'solved') activate(i);
  }

  // ── 3. top-up: every suspect gets ≥ 1 clue; some get a second, weaker one.
  rebuildUDom();
  for (let p = 0; p < n; p++) {
    if (p === victim) continue;
    const target = counts[p] === 0 ? 1
      : counts[p] === 1 && rng.chance(spec.extraClue) ? 2 : (counts[p] as number);
    while ((counts[p] as number) < target) {
      const pool: number[] = [];
      for (let i = 0; i < C; i++) if (candOf(i).owner === p && baseEligible(i, false)) pool.push(i);
      const ws = pool.map((i) => weightOf(i) * (candOf(i).cat === 'direct' ? 0.3 : 1));
      let picked = -1;
      for (let tries = 0; tries < 8 && picked < 0; tries++) {
        const j = weightedIndex(rng, ws);
        if (j < 0) break;
        ws[j] = 0;
        if (!impliedLocally(pool[j] as number)) picked = pool[j] as number;
      }
      if (picked < 0) break;
      activate(picked);
      const cl = clueOf(picked);
      if (cl.mask) {
        const u = uDom[p] as Uint8Array, m = cl.mask;
        for (let x = 0; x < g.size; x++) if (!m[x]) u[x] = 0;
      }
    }
    if (counts[p] === 0) return null;
  }

  // ── 4. verify with the exhaustive solver
  const sols = search(prob, act, 2);
  if (sols.length !== 1) return null;
  const only = sols[0] as Int16Array;
  for (let p = 0; p < n; p++) if (only[p] !== sol[p]) return null;

  const out: Selection[] = [];
  for (let i = 0; i < C; i++) if (act[i]) out.push({ owner: candOf(i).owner, pred: candOf(i).pred, cat: candOf(i).cat });
  return out;
}

// ─────────────────────────── Assembly ───────────────────────────

function tryGenerate(seasonId: string, tier: Tier, index: number, attempt: number): Puzzle | null {
  const seed = hashSeed(seasonId, tier, index, attempt);
  const rng = mulberry32(seed);
  const spec = TIER_SPEC[tier];
  const t = rampT(seasonId, index);
  const { themeId } = seasonInfo(seasonId, index);
  const theme = THEMES[themeId] ?? (THEMES.mansion as NonNullable<(typeof THEMES)['mansion']>);

  const N = sizeFor(seasonId, tier, index);
  const rows = N, cols = N;
  const nPeople = N;
  const nSuspects = N - 1;
  const roomCap = Math.min(theme.palette.length, theme.roomNames.length, Math.floor((N * N) / 4));
  const nRooms = Math.max(3, Math.min(roomCap, N - 1 + rng.int(3)));
  const nFurn = Math.round(N * lerp(spec.furnPerN[0], spec.furnPerN[1], t)) + rng.int(2);

  // rooms
  const owner = growRooms(rng, rows, cols, nRooms);
  if (!owner) return null;
  const names = rng.shuffle(theme.roomNames);
  const colors = rng.shuffle(theme.palette);
  const rooms: Room[] = [];
  for (let r = 0; r < nRooms; r++) {
    const cells = [];
    for (let c = 0; c < rows * cols; c++) if (owner[c] === r) cells.push(indexCell(cols, c));
    rooms.push({ id: `room${r}`, name: names[r] as string, floor: rng.pick(theme.floors), color: colors[r] as string, cells });
  }

  // furniture
  const furniture = placeFurniture(rng, rows, cols, owner, nRooms, nFurn, theme.furniture);
  if (!furniture) return null;

  // people (victim listed last)
  const cast = rng.shuffle(CAST).slice(0, nPeople);
  const victim = nPeople - 1;
  const people: Person[] = cast.map((c, i) => ({
    id: c.id, name: c.name, pronoun: c.pronoun, avatar: c.avatar, isVictim: i === victim,
  }));
  const draft = { rows, cols, rooms, furniture, people };
  const ctx = makePuzzleCtx(draft);

  // solution + killer
  const killer = rng.int(nSuspects);
  const sol = placePeople(rng, ctx.grid, nPeople, victim, killer);
  if (!sol) return null;
  const killerRule: KillerRule = { type: 'aloneWithVictim' };

  // clues
  // the victim is pinned through everybody else's clues; a victim clue of their own is a last resort
  let sel: Selection[] | null = null;
  for (let s = 0; s < 4; s++) {
    const cand = selectClues(rng, tier, t, spec, ctx, sol, victim, killer);
    if (!cand) { if (s >= 2 && !sel) break; continue; }
    if (!cand.some((x) => x.owner === victim)) { sel = cand; break; }
    sel ??= cand;
  }
  if (!sel) return null;
  const finalSel = sel;

  const title = puzzleTitle(seasonId, tier, index);
  const textCtx = { rows, cols, rooms, people, seed };
  const clues: Puzzle['clues'] = [];
  people.forEach((person, p) => {
    if (person.isVictim) {
      clues.push({ personId: person.id, text: killerRuleText(killerRule, person), predicate: killerRulePredicate(killerRule) });
    }
    finalSel.filter((s) => s.owner === p)
      .sort((a, b) => CAT_ORDER[a.cat] - CAT_ORDER[b.cat])
      .forEach((s, k) => clues.push({ personId: person.id, text: clueText(s.pred, person, textCtx, person.isVictim ? k : undefined), predicate: s.pred }));
  });

  const solution: Puzzle['solution'] = {};
  people.forEach((person, p) => { solution[person.id] = indexCell(cols, sol[p] as number); });

  return {
    id: `${seasonId}-${tier}-${index}`,
    seasonId,
    tier,
    index,
    seed,
    title,
    themeId: theme.id,
    rows,
    cols,
    rooms,
    furniture,
    people,
    clues,
    killerRule,
    solution,
    killerId: (people[killer] as Person).id,
    parSeconds: Math.max(30, Math.round((spec.par * nPeople) / spec.refPeople / 5) * 5),
  };
}

const memo = new Map<string, Puzzle>();

/** Uncached generation (tests use this to check determinism). */
export function generatePuzzleUncached(seasonId: string, tier: Tier, index: number): Puzzle {
  for (let attempt = 0; attempt < 80; attempt++) {
    const p = tryGenerate(seasonId, tier, index, attempt);
    if (p) return p;
  }
  throw new Error(`Crime Files: could not generate ${seasonId}-${tier}-${index}`);
}

/** Deterministic, memoised case generation. */
export function generatePuzzle(seasonId: string, tier: Tier, index: number): Puzzle {
  const id = `${seasonId}-${tier}-${index}`;
  const hit = memo.get(id);
  if (hit) return hit;
  const p = generatePuzzleUncached(seasonId, tier, index);
  memo.set(id, p);
  return p;
}

export function clearPuzzleCache(): void {
  memo.clear();
}

/** Weekday (0 = Sunday) → daily tier. */
const DAILY_TIERS: Tier[] = ['extreme', 'easy', 'medium', 'hard', 'medium', 'hard', 'extreme'];

/** Day number since 1970-01-01 (UTC) for an ISO date "YYYY-MM-DD". */
export function dayNumber(dateISO: string): number {
  const [y, m, d] = dateISO.slice(0, 10).split('-').map(Number);
  return Math.floor(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) / 86400000);
}

export function dailyTier(dateISO: string): Tier {
  const day = dayNumber(dateISO);
  return DAILY_TIERS[(((day + 4) % 7) + 7) % 7] as Tier;
}

/** The Daily Case: seasonId 'daily', tier by weekday, index = day number. */
export function dailyPuzzle(dateISO: string): Puzzle {
  return generatePuzzle('daily', dailyTier(dateISO), dayNumber(dateISO));
}

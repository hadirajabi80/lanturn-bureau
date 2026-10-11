/**
 * Procedural case generator (docs/GRID-PLAN.md §3). Pure and deterministic:
 * `generatePuzzle(district, tier, index)` always returns the same case.
 *
 * Board rule: an N×N map holds exactly N people (suspects + victim(s)),
 * exactly one per row and one per column. Who the killer is follows from the
 * scenario (`Variant`, rules.ts) applied to the unique placement.
 *
 * Pipeline: rooms (district layout carver) → furniture (every row/column keeps
 * ≥ 2 free cells) → solution = random row→column permutation on free cells
 * that realises the scenario → candidate clue enumeration → greedy selection
 * driven by a human-style deduction engine (unary filtering + row/column
 * exclusion + relational arc consistency + variant-rule propagation + shallow
 * what-if probing) until every person is pinned down → minimisation → top-up
 * → liar variants: every wrong "X is the liar" hypothesis must collapse into a
 * contradiction under the same deduction engine (clues are added until it
 * does) → verification with the exhaustive solver. Failed attempts bump a
 * retry counter into the seed.
 */
import type { District } from '../skins/types';
import { DISTRICTS, getDistrict } from '../skins/districts';
import type {
  Furniture, FurnitureKind, KillerRule, LayoutStyle, Person, Predicate, Puzzle, Room, Theme, Tier, Variant,
} from '../types';
import { OCCUPIABLE, TIERS } from '../types';
import type { GridCtx } from './geometry';
import { colOf, diagAdjacent, indexCell, isCorner, isEdge, lineHasBlocker, lineOfSight, manhattan, rowOf } from './geometry';
import { carveRooms } from './layouts';
import { CAST } from './people';
import { killerRulePredicate } from './play';
import type { PuzzleCtx } from './predicates';
import { makePuzzleCtx } from './predicates';
import type { Rng } from './rng';
import { hashSeed, mulberry32, weightedIndex } from './rng';
import type { RuleSpec } from './rules';
import {
  baseRuleItems, culpritsFromPos, hasPlainNegation, hitFor, hypothesisItems, isAccompliceVariant, isDoubleVariant, liarCandidates,
  negatePred,
} from './rules';
import type { CClue, Domains, Problem } from './solver';
import { allSingle, cloneDomains, compileItem, deduce, initialDomains, makeProblem, probe, propagate, search } from './solver';
import { clueText, victimRuleText } from './text';
import type { RoomRole } from './themes';
import { GENERIC_ROLE_NAMES, LEGACY_SEASON_IDS, ROLE_NAMES, THEMES } from './themes';
import {
  CASES_PER_TIER, VARIANT_MIN_SIZE, VARIANT_PAR, dailyTier, dayNumber, gridSizeFor, parseIsoWeek, rampFor, tierSizeRange,
  variantFor,
} from './variants';

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
    furnPerN: [1.2, 1.5], types: new Set(MEDIUM_TYPES), negatives: false, maxClues: 2, relCap: 1, probe: [0, 2],
    extraClue: 0.35, par: 180, refPeople: 6,
    weights: { direct: 2.2, semi: 1.8, neg: 1.3, rel: 0.6, relNeg: 0, global: 0, or: 0 },
  },
  hard: {
    furnPerN: [1.4, 1.7], types: new Set(HARD_TYPES), negatives: true, maxClues: 3, relCap: 2, probe: [2, 3],
    extraClue: 0.5, par: 330, refPeople: 8,
    weights: { direct: 1.3, semi: 1.4, neg: 1.3, rel: 2, relNeg: 1.1, global: 1.2, or: 0 },
  },
  extreme: {
    furnPerN: [1.5, 1.9], types: new Set(EXTREME_TYPES), negatives: true, maxClues: 3, relCap: 2, probe: [3, 4],
    extraClue: 0.55, par: 540, refPeople: 10.5,
    weights: { direct: 0.8, semi: 1.1, neg: 1.2, rel: 2.6, relNeg: 1.5, global: 1.4, or: 0.7 },
  },
  mastermind: {
    furnPerN: [1.6, 1.9], types: new Set(EXTREME_TYPES), negatives: true, maxClues: 3, relCap: 2, probe: [4, 4],
    extraClue: 0.55, par: 900, refPeople: 13,
    weights: { direct: 0.7, semi: 1.1, neg: 1.2, rel: 2.6, relNeg: 1.5, global: 1.4, or: 0.8 },
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
/** Probing inside the greedy loop: off — greedy runs on propagation alone (2× faster); minimisation then certifies with probing. */
let probeInGreedy = false;
export function setProbeInGreedy(v: boolean): void { probeInGreedy = v; }

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

/** Kinds a poison can plausibly be hidden in (never a seat). */
const POISON_OK = new Set<FurnitureKind>(['cabinet', 'fridge', 'barrel', 'bin', 'crate', 'counter', 'safe', 'plant',
  'trolley', 'suitcase', 'table', 'desk', 'bookshelf', 'bananas', 'globe', 'lamp', 'coffin']);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Generation diagnostics (tests / tuning): failure reasons and attempt counts. */
export const genStats = { fails: {} as Record<string, number>, ms: {} as Record<string, number>, attempts: 0, cases: 0 };
function fail(reason: string): null {
  genStats.fails[reason] = (genStats.fails[reason] ?? 0) + 1;
  return null;
}

// ─────────────────────────── Districts ───────────────────────────

/** Canonical district id for a district id or a legacy v1 season id (unknown → ashcombe). */
export function resolveDistrictId(id: string): string {
  if (getDistrict(id)) return id;
  const legacy = LEGACY_SEASON_IDS[id];
  if (legacy) return legacy;
  return (DISTRICTS[0] as District).id;
}

function districtOf(id: string): District {
  return getDistrict(resolveDistrictId(id)) as District;
}

const themeOf = (themeId: string): Theme => THEMES[themeId] ?? (THEMES.mansion as Theme);

// ─────────────────────────── Title ───────────────────────────

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function titleAt(theme: Theme, k: number): string {
  const A = theme.titleWords.a.length;
  return `The ${theme.titleWords.a[k % A]} ${theme.titleWords.b[Math.floor(k / A) % theme.titleWords.b.length]}`;
}

/** Cheap: only seed → title. Titles are distinct within a district (affine permutation of word pairs). */
export function puzzleTitle(districtId: string, tier: Tier, index: number): string {
  if (districtId === 'daily') {
    const d = DISTRICTS[((index % DISTRICTS.length) + DISTRICTS.length) % DISTRICTS.length] as District;
    const theme = themeOf(d.themeId);
    return titleAt(theme, hashSeed('daily-title', index) % (theme.titleWords.a.length * theme.titleWords.b.length));
  }
  const d = districtOf(districtId);
  const theme = themeOf(d.themeId);
  const M = theme.titleWords.a.length * theme.titleWords.b.length;
  let stride = (hashSeed(d.id, 'stride') % (M - 1)) + 1;
  while (gcd(stride, M) !== 1) stride = (stride % (M - 1)) + 1;
  const offset = hashSeed(d.id, 'offset') % M;
  let g = index - 1;
  for (const t of TIERS) {
    if (t === tier) break;
    g += CASES_PER_TIER[t];
  }
  return titleAt(theme, (((((g * stride) % M) + M) % M) + offset) % M);
}

// ─────────────────────────── Rooms ───────────────────────────

function nameRooms(rng: Rng, theme: Theme, roles: RoomRole[]): string[] {
  const used = new Set<string>();
  const names: string[] = new Array<string>(roles.length).fill('');
  const ordinary = rng.shuffle(theme.roomNames);
  const takeOrdinary = (): string => {
    const n = ordinary.find((x) => !used.has(x));
    return n ?? `Room ${used.size + 1}`;
  };
  roles.forEach((role, i) => {
    if (role === 'room') return;
    const pool = [...rng.shuffle(ROLE_NAMES[theme.id]?.[role] ?? []), ...rng.shuffle(GENERIC_ROLE_NAMES[role])];
    const n = pool.find((x) => !used.has(x) && !theme.roomNames.includes(x)) ?? takeOrdinary();
    used.add(n);
    names[i] = n;
  });
  roles.forEach((role, i) => {
    if (role !== 'room') return;
    const n = takeOrdinary();
    used.add(n);
    names[i] = n;
  });
  return names;
}

// ─────────────────────────── Furniture ───────────────────────────

const TWO_ALWAYS = new Set<FurnitureKind>(['sofa', 'bed', 'bench', 'counter', 'coffin']);
const TWO_SOMETIMES = new Set<FurnitureKind>(['table', 'desk']);

/**
 * 1–3 pieces per room from the theme pool. Blocking pieces keep ≥ 2 open
 * cells in their room and ≥ 2 free cells in every row and column.
 * `forced`: the first two pieces are of this kind (poison cases need a kind present twice).
 */
function placeFurniture(
  rng: Rng, rows: number, cols: number, owner: Int16Array, k: number, count: number, pool: FurnitureKind[],
  forced: FurnitureKind | null,
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
    plan.forEach((r, pi) => {
      const cells = roomCells[r] as number[];
      for (let tries = 0; tries < 14; tries++) {
        let kind: FurnitureKind;
        if (forced && pi < 2) kind = forced;
        else {
          const list = rng.chance(0.5) ? (occPool.length ? occPool : pool) : (blkPool.length ? blkPool : pool);
          kind = rng.pick(list);
          if ((used.get(kind) ?? 0) >= maxSame) continue;
        }
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
    });
    if (furniture.length < Math.max(k, count - 2)) continue;
    if (forced && (used.get(forced) ?? 0) < 2) continue;
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

/** Person-index roles of a case. Victims are the last people; killers[i] killed victims[i]. */
interface Roles {
  victims: number[];
  killers: number[];
  accomplice: number;
  liar: number;
  poisonKind?: FurnitureKind;
}

interface RoleCells { v: number[]; k: number[]; acc: number; poisonKind?: FurnitureKind }

/**
 * Place everyone (one per row and column) so that the scenario holds, and
 * assign the roles. Verified against rules.ts.
 */
function placeRoles(
  rng: Rng, ctx: PuzzleCtx, n: number, variant: Variant, pieceCount: Map<FurnitureKind, number>,
): { pos: Int16Array; roles: Roles } | null {
  const g = ctx.grid;
  const nv = isDoubleVariant(variant) ? 2 : 1;
  const victims = nv === 2 ? [n - 1, n - 2] : [n - 1];
  const suspects = [...Array(n - nv).keys()];
  const poisonKinds = [...pieceCount.entries()].filter(([, c]) => c >= 2).map(([k]) => k);
  const goodPoison = poisonKinds.filter((k) => POISON_OK.has(k));
  const adjHit = hitFor(g, { variant: 'lockedRoom', victims: [] }) as (c: number, v: number) => boolean;
  for (let attempt = 0; attempt < 60; attempt++) {
    const cells = randomPermutation(rng, g);
    if (!cells) continue;
    const byRoom = new Map<number, number[]>();
    for (const c of cells) {
      const R = g.roomOf[c] as number;
      const list = byRoom.get(R) ?? [];
      list.push(c);
      byRoom.set(R, list);
    }
    const groups = (size: number): number[][] => rng.shuffle([...byRoom.values()].filter((l) => l.length === size));
    let rc: RoleCells | null = null;
    switch (variant) {
      case 'classic': case 'liar': {
        const pairs = groups(2);
        if (pairs.length) { const [a, b] = rng.shuffle(pairs[0] as number[]) as [number, number]; rc = { v: [a], k: [b], acc: -1 }; }
        break;
      }
      case 'double': case 'liarDouble': {
        const pairs = groups(2);
        if (pairs.length >= 2) {
          const [a, b] = rng.shuffle(pairs[0] as number[]) as [number, number];
          const [c, d] = rng.shuffle(pairs[1] as number[]) as [number, number];
          rc = { v: [a, c], k: [b, d], acc: -1 };
        }
        break;
      }
      case 'accomplice': case 'accompliceLiar': {
        for (const tri of groups(3)) {
          for (const v of rng.shuffle(tri)) {
            const [x, y] = tri.filter((c) => c !== v) as [number, number];
            const dx = manhattan(g, x, v), dy = manhattan(g, y, v);
            if (dx === dy) continue;
            rc = dx < dy ? { v: [v], k: [x], acc: y } : { v: [v], k: [y], acc: x };
            break;
          }
          if (rc) break;
        }
        break;
      }
      case 'lockedRoom': {
        for (const v of rng.shuffle(cells)) {
          if ((byRoom.get(g.roomOf[v] as number) as number[]).length !== 1) continue;
          const hits = cells.filter((c) => c !== v && adjHit(c, v));
          if (hits.length === 1) { rc = { v: [v], k: [hits[0] as number], acc: -1 }; break; }
        }
        break;
      }
      case 'poison': {
        for (const kind of rng.shuffle(goodPoison)) {
          const beside = cells.filter((c) => (g.adjKinds[c] as Set<FurnitureKind>).has(kind));
          if (beside.length !== 1) continue;
          const others = cells.filter((c) => c !== beside[0]);
          rc = { v: [rng.pick(others)], k: [beside[0] as number], acc: -1, poisonKind: kind };
          break;
        }
        break;
      }
      case 'sniper': {
        for (const v of rng.shuffle(cells)) {
          const hits = cells.filter((c) => c !== v && lineOfSight(g, c, v));
          if (hits.length !== 1) continue;
          // more interesting when someone else stands on a blocked diagonal of the victim
          const blockedView = cells.some((c) => c !== v && c !== hits[0] && lineHasBlocker(g, c, v) && !lineOfSight(g, c, v)
            && Math.abs(rowOf(g, c) - rowOf(g, v)) === Math.abs(colOf(g, c) - colOf(g, v)));
          if (!blockedView && attempt < 30) continue;
          rc = { v: [v], k: [hits[0] as number], acc: -1 };
          break;
        }
        break;
      }
    }
    if (!rc) continue;
    const pos = new Int16Array(n).fill(-1);
    const RC: RoleCells = rc;
    const sh = rng.shuffle(suspects);
    const killers = RC.k.map((_, i) => sh[i] as number);
    const accomplice = RC.acc >= 0 ? (sh[RC.k.length] as number) : -1;
    victims.forEach((p, i) => { pos[p] = RC.v[i] as number; });
    killers.forEach((p, i) => { pos[p] = RC.k[i] as number; });
    if (accomplice >= 0) pos[accomplice] = RC.acc;
    const usedCells = new Set<number>([...RC.v, ...RC.k, ...(RC.acc >= 0 ? [RC.acc] : [])]);
    const rest = rng.shuffle(cells.filter((c) => !usedCells.has(c)));
    let j = 0;
    for (let p = 0; p < n; p++) if (pos[p] === -1) pos[p] = rest[j++] as number;
    let liar = -1;
    if (variant === 'liar') liar = killers[0] as number;
    else if (variant === 'liarDouble') liar = rng.pick(killers);
    else if (variant === 'accompliceLiar') liar = accomplice;
    const roles: Roles = { victims, killers, accomplice, liar, poisonKind: RC.poisonKind };
    // sanity: the rules name exactly these people
    const spec: RuleSpec = { variant, victims, poisonKind: RC.poisonKind };
    const cul = culpritsFromPos(ctx, spec, pos);
    if (!cul || cul.killers.join() !== killers.join() || cul.accomplice !== accomplice) continue;
    const prob = makeProblem(ctx, baseRuleItems(ctx, spec));
    if (prob.clues.some((cl) => cl.f(pos) !== 1)) continue;
    return { pos, roles };
  }
  return null;
}

// ─────────────────────────── Clue candidates ───────────────────────────

interface Cand {
  owner: number;
  /** the TRUE fact (for the liar, the statement shown is negatePred(pred)) */
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
  rng: Rng, spec: TierSpec, ctx: PuzzleCtx, sol: Int16Array, roles: Roles, variant: Variant,
): Cand[] {
  const g = ctx.grid;
  const n = sol.length;
  const ids = ctx.personIds;
  const out: Cand[] = [];
  const who = (id: string): number => ctx.personIndex.get(id) ?? -1;
  const allowed = (t: PType): boolean => spec.types.has(t);
  const victimIds = new Set(roles.victims.map((v) => ids[v] as string));
  const noOccupancy = new Set([...roles.victims, ...roles.killers, roles.accomplice].filter((x) => x >= 0));
  const add = (owner: number, pred: Predicate): void => {
    if (!allowed(pred.type)) return;
    const others = pred.type === 'between' ? [pred.a, pred.b]
      : 'personId' in pred ? [pred.personId] : [];
    const aboutVictim = others.some((o) => victimIds.has(o));
    // "X was (not) in the same room as the victim" would name the killer outright
    if (aboutVictim && (pred.type === 'sameRoomAs' || pred.type === 'differentRoomFrom')) return;
    // sniper: sight lines to the victim ARE the rule
    if (aboutVictim && variant === 'sniper' && pred.type === 'lineOfSight') return;
    // poison: "the killer was beside a {kind}" would name them outright
    if (variant === 'poison' && roles.killers.includes(owner) && pred.type === 'besideFurniture' && pred.kind === roles.poisonKind) return;
    // the liar needs statements whose negation reads naturally
    if (owner === roles.liar && !hasPlainNegation(pred)) return;
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
    const isVictim = roles.victims.includes(p);
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

    if (isVictim) continue; // victims only ever get plain positional clues (and only as a last resort)

    // ── or (extreme): one true atom + one false atom, in random order
    if (allowed('or')) {
      const ts = rng.shuffle(atoms(p, true)), fs = rng.shuffle(atoms(p, false));
      for (let i = 0; i < Math.min(3, ts.length, fs.length); i++) {
        const a = ts[i] as Predicate, b = fs[i] as Predicate;
        add(p, rng.chance(0.5) ? { type: 'or', a, b } : { type: 'or', a: b, b: a });
      }
    }

    // ── room occupancy (never for killers / accomplices: it would point straight at them)
    if (!noOccupancy.has(p)) {
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

/** A chosen clue: `pred` is the sentence as stated (false for the liar). */
interface Selection { owner: number; pred: Predicate; cat: Cat }

function selectClues(
  rng: Rng, tier: Tier, t: number, spec: TierSpec, ctx: PuzzleCtx, sol: Int16Array, roles: Roles, variant: Variant,
): Selection[] | null {
  const g = ctx.grid;
  const n = sol.length;
  const liar = roles.liar;
  const victimSet = new Set(roles.victims);
  let tPhase = performance.now();
  const phase = (name: string): void => { const now = performance.now(); genStats.ms[name] = (genStats.ms[name] ?? 0) + now - tPhase; tPhase = now; };
  const cands = enumerateCandidates(rng, spec, ctx, sol, roles, variant);
  const C = cands.length;
  const rspec: RuleSpec = { variant, victims: roles.victims, poisonKind: roles.poisonKind };
  // always-active rule items: the scenario + (liar variants) "the liar is the killer/accomplice"
  const ruleItems = [...baseRuleItems(ctx, rspec), ...(liar >= 0 ? hypothesisItems(ctx, rspec, liar) : [])];
  const nBase = baseRuleItems(ctx, rspec).length;
  const prob = makeProblem(ctx, [...cands.map((c) => ({ owner: c.owner, pred: c.pred })), ...ruleItems]);
  const clueOf = (i: number): CClue => prob.clues[i] as CClue;
  const candOf = (i: number): Cand => cands[i] as Cand;

  // unary candidates that rule out nothing are useless (and, for the liar, impossible to state)
  const dead = new Uint8Array(C);
  for (let i = 0; i < C; i++) {
    const m = clueOf(i).mask;
    if (m && g.free.every((x) => m[x] === 1)) dead[i] = 1;
  }

  const act = new Uint8Array(prob.clues.length);
  for (let i = C; i < act.length; i++) act[i] = 1;
  const probeMax = Math.round(lerp(spec.probe[0], spec.probe[1], t));
  const everyone = [...Array(n).keys()];
  const maxFor = (p: number): number => (victimSet.has(p) ? 2 : spec.maxClues);
  const minFor = (p: number): number => (victimSet.has(p) ? 0 : p === liar ? 2 : 1);
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
  /** the liar's STATED unary sentences must be satisfiable together (else the lie is self-evident) */
  let liarStated = new Uint8Array(g.size);
  const rebuildUDom = (): void => {
    uDom.length = 0;
    for (let p = 0; p < n; p++) {
      const u = new Uint8Array(g.size);
      for (const x of g.free) u[x] = 1;
      uDom.push(u);
    }
    liarStated = new Uint8Array(g.size);
    for (const x of g.free) liarStated[x] = 1;
    for (let i = 0; i < C; i++) {
      const cl = clueOf(i);
      if (!act[i] || !cl.mask) continue;
      const u = uDom[cl.owner] as Uint8Array, m = cl.mask;
      for (let x = 0; x < g.size; x++) if (!m[x]) u[x] = 0;
      if (cl.owner === liar) for (let x = 0; x < g.size; x++) if (m[x]) liarStated[x] = 0;
    }
  };
  rebuildUDom();
  const liarConsistent = (i: number): boolean => {
    const cl = clueOf(i);
    if (cl.owner !== liar || !cl.mask) return true;
    const m = cl.mask;
    let left = 0;
    for (const x of g.free) if (liarStated[x] && !m[x]) left++;
    return left >= 2;
  };
  const noteActive = (i: number): void => {
    const cl = clueOf(i);
    if (!cl.mask) return;
    const u = uDom[cl.owner] as Uint8Array, m = cl.mask;
    for (let x = 0; x < g.size; x++) if (!m[x]) u[x] = 0;
    if (cl.owner === liar) for (let x = 0; x < g.size; x++) if (m[x]) liarStated[x] = 0;
  };

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
    if (victimSet.has(c.owner) && !allowVictim) return false;
    if ((counts[c.owner] as number) >= maxFor(c.owner)) return false;
    if (usedKeys.has(c.key)) return false;
    if (!cl.unary && (relCounts[c.owner] as number) >= spec.relCap) return false;
    if (c.cat === 'or' && (catCount.or >= 2 || orOwners.has(c.owner))) return false;
    // "row 2" + "column 3" is a bare coordinate, not a deduction
    if (isRowCol(i) && (rowColCount[c.owner] as number) > 0) return false;
    if (W[c.cat] <= 0 && c.owner !== liar) return false;
    if (!liarConsistent(i)) return false;
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

  /** for the liar, the weight of the STATED sentence's category (a strong positive lie is the useful kind) */
  const LIAR_W: Record<Cat, number> = { direct: 0.3, semi: 0.6, neg: 2.4, rel: 0.5, relNeg: 2, global: 0, or: 0 };
  const weightOf = (i: number): number => {
    const c = candOf(i);
    if (c.owner === liar) return LIAR_W[c.cat] * (TYPE_BOOST[c.pred.type] ?? 1) / Math.sqrt(groupSize.get(groupOf(i)) ?? 1);
    let w = (W[c.cat] * (TYPE_BOOST[c.pred.type] ?? 1)) / Math.sqrt(groupSize.get(groupOf(i)) ?? 1);
    if (c.cat === 'direct' && tier !== 'easy') w *= 1 - 0.4 * t;
    if (c.cat === 'direct' && (tier === 'extreme' || tier === 'mastermind') && catCount.direct >= directCap) w *= 0.15;
    if (c.pair && pairUse.get(c.pair)) w *= 0.3;
    return w;
  };

  const applyIn = (P: Problem, i: number, Dst: Domains): boolean => {
    const cl = P.clues[i] as CClue;
    if (cl.mask) {
      const m = cl.mask;
      const nd = (Dst[cl.owner] as number[]).filter((x) => m[x] === 1);
      if (!nd.length) return false;
      Dst[cl.owner] = nd;
    }
    return propagate(P, act, Dst, cl.global ? everyone : cl.deps);
  };
  const entropy = (Dx: Domains): number => Dx.reduce((s, d) => s + Math.log2(Math.max(1, d.length)), 0);

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

  phase("setup");
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
      // the liar's own facts are only usable under the right hypothesis: lean on everybody else
      const ws = pool.map((i) => weightOf(i) * (candOf(i).owner === liar ? 0.2 : 1));
      const scored: { i: number; s: number }[] = [];
      for (let k = 0; k < SAMPLE_K; k++) {
        const j = weightedIndex(rng, ws);
        if (j < 0) break;
        const w = ws[j] as number;
        ws[j] = 0;
        const i = pool[j] as number;
        const Dc = cloneDomains(D);
        act[i] = 1;
        const ok = applyIn(prob, i, Dc);
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
      if (!stuck.length || repairs++ >= 16) return fail("repairs");
      const p = rng.pick(stuck);
      const mine: number[] = [];
      for (let i = 0; i < C; i++) if (act[i] && candOf(i).owner === p) mine.push(i);
      deactivate(rng.pick(mine));
      rebuildUDom();
      const r = deduce(prob, act, probeMax);
      if (r.status === 'contradiction') return fail("repairContra");
      D = r.D;
      continue;
    }
    activate(chosen);
    noteActive(chosen);
    if (!applyIn(prob, chosen, D)) return fail("apply");
    if (probeInGreedy && !probe(prob, act, D, probeMax)) return fail("probe");
  }
  if (!allSingle(D)) return fail("notSolved");

  phase("greedy");
  // ── 2. minimise: drop every clue the deduction no longer needs (victim clues first).
  // Harder tiers try to drop the direct clues first so the relational ones carry the case.
  const removalRank = (i: number): number => {
    if (victimSet.has(candOf(i).owner)) return -1;
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
    if ((counts[o] as number) <= Math.max(1, minFor(o)) && !victimSet.has(o)) continue;
    deactivate(i);
    if (deduce(prob, act, probeMax).status !== 'solved') activate(i);
  }

  phase("minimise");
  // ── 3. top-up: every suspect gets ≥ 1 clue (the liar ≥ 2); some get a second, weaker one.
  rebuildUDom();
  for (let p = 0; p < n; p++) {
    if (victimSet.has(p)) continue;
    const need = minFor(p);
    const target = (counts[p] as number) < need ? need
      : counts[p] === 1 && rng.chance(spec.extraClue) ? 2 : (counts[p] as number);
    while ((counts[p] as number) < target) {
      const pool: number[] = [];
      for (let i = 0; i < C; i++) if (candOf(i).owner === p && baseEligible(i, false)) pool.push(i);
      const ws = pool.map((i) => weightOf(i) * (candOf(i).cat === 'direct' && p !== liar ? 0.3 : 1));
      let picked = -1;
      for (let tries = 0; tries < 8 && picked < 0; tries++) {
        const j = weightedIndex(rng, ws);
        if (j < 0) break;
        ws[j] = 0;
        if (!impliedLocally(pool[j] as number)) picked = pool[j] as number;
      }
      if (picked < 0) break;
      activate(picked);
      noteActive(picked);
    }
    if ((counts[p] as number) < need) return fail("topup");
  }

  phase("topup");
  // ── 4. liar variants: every other "X is the liar" world must collapse by deduction
  if (liar >= 0) {
    const worlds = new Map<number, Problem>();
    const worldOf = (L: number): Problem => {
      const hit = worlds.get(L);
      if (hit) return hit;
      const hyp = hypothesisItems(ctx, rspec, L);
      const clues = prob.clues.map((cl, i) => {
        if (i < C) {
          const c = candOf(i);
          // L's true sentences are taken as lies; the real liar's (false) sentences are taken as true
          if (c.owner === L || c.owner === liar) return compileItem(ctx, { owner: c.owner, pred: negatePred(c.pred) });
          return cl;
        }
        if (i < C + nBase) return cl;
        return compileItem(ctx, hyp[i - C - nBase] as NonNullable<(typeof hyp)[number]>);
      });
      const P: Problem = { ...prob, clues };
      worlds.set(L, P);
      return P;
    };
    const pending = rng.shuffle(liarCandidates(n, rspec).filter((L) => L !== liar));
    let rounds = 0;
    while (pending.length) {
      const L = pending[0] as number;
      const W2 = worldOf(L);
      const r = deduce(W2, act, probeMax);
      if (r.status === 'contradiction') { pending.shift(); continue; }
      if (rounds++ > 3 * n) return fail("liarRounds");
      const base = entropy(r.D);
      const pool: number[] = [];
      for (let i = 0; i < C; i++) if (baseEligible(i, false)) pool.push(i);
      const ws = pool.map((i) => weightOf(i) + 0.05);
      let picked = -1, best = -1, bestGain = 0;
      for (let k = 0; k < 20; k++) {
        const j = weightedIndex(rng, ws);
        if (j < 0) break;
        ws[j] = 0;
        const i = pool[j] as number;
        const Dc = cloneDomains(r.D);
        act[i] = 1;
        let ok = applyIn(W2, i, Dc);
        if (ok) ok = probe(W2, act, Dc, probeMax);
        act[i] = 0;
        if (!ok) { picked = i; break; }
        const gain = base - entropy(Dc);
        if (gain > bestGain) { bestGain = gain; best = i; }
      }
      if (picked < 0) picked = best;
      if (picked < 0) return fail("liarNoPick");
      activate(picked);
      noteActive(picked);
    }
  }

  phase("liar");
  // ── 5. verify the true world with the exhaustive solver
  const sols = search(prob, act, 2);
  if (sols.length !== 1) return fail("notUnique");
  const only = sols[0] as Int16Array;
  for (let p = 0; p < n; p++) if (only[p] !== sol[p]) return fail("wrongSol");
  // the real world must still be deducible (top-up / liar clues only ever add facts)
  if (liar >= 0 && deduce(prob, act, probeMax).status !== 'solved') return fail("liarStarNotSolved");

  phase("verify");
  const out: Selection[] = [];
  for (let i = 0; i < C; i++) {
    if (!act[i]) continue;
    const c = candOf(i);
    const stated = c.owner === liar ? negatePred(c.pred) : c.pred;
    out.push({ owner: c.owner, pred: stated, cat: catOf(stated) });
  }
  return out;
}

// ─────────────────────────── Assembly ───────────────────────────

interface CaseSpec {
  id: string;
  seasonId: string;
  district: District;
  tier: Tier;
  index: number;
  size: number;
  variant: Variant;
  /** 0..1 difficulty ramp inside the tier */
  t: number;
  seedKey: (string | number)[];
  title: string;
}

function tryGenerate(cs: CaseSpec, attempt: number): Puzzle | null {
  const seed = hashSeed(...cs.seedKey, attempt);
  const rng = mulberry32(seed);
  const { tier, variant, t } = cs;
  const spec = TIER_SPEC[tier];
  const theme = themeOf(cs.district.themeId);
  const layout: LayoutStyle = cs.district.layout;

  const N = cs.size;
  const rows = N, cols = N;
  const nPeople = N;

  // rooms
  const maxRooms = Math.min(theme.palette.length, theme.roomNames.length, Math.floor((N * N) / 4));
  const lo = Math.max(3, Math.min(N - 1, maxRooms));
  const hi = Math.max(lo, Math.min(maxRooms, tier === 'mastermind' ? N + 3 : N + 2));
  const target = Math.max(lo, Math.min(hi, N - 1 + rng.int(tier === 'mastermind' ? 5 : 4)));
  const carving = carveRooms(rng, layout, N, target, lo, hi, { tall: isAccompliceVariant(variant) });
  if (!carving) return fail("carve");
  const owner = carving.owner;
  const nRooms = carving.roles.length;
  const names = nameRooms(rng, theme, carving.roles);
  const colors = rng.shuffle(theme.palette);
  const rooms: Room[] = [];
  for (let r = 0; r < nRooms; r++) {
    const cells = [];
    for (let c = 0; c < rows * cols; c++) if (owner[c] === r) cells.push(indexCell(cols, c));
    rooms.push({ id: `room${r}`, name: names[r] as string, floor: rng.pick(theme.floors), color: colors[r] as string, cells });
  }

  // furniture
  const nFurn = Math.round(N * lerp(spec.furnPerN[0], spec.furnPerN[1], t)) + rng.int(2);
  let forced: FurnitureKind | null = null;
  if (variant === 'poison') {
    const opts = theme.furniture.filter((k) => POISON_OK.has(k));
    const blk = opts.filter((k) => !OCCUPIABLE[k]);
    forced = rng.pick(blk.length ? blk : opts.length ? opts : theme.furniture);
  }
  const furniture = placeFurniture(rng, rows, cols, owner, nRooms, nFurn, theme.furniture, forced);
  if (!furniture) return fail("furniture");
  const pieceCount = new Map<FurnitureKind, number>();
  for (const f of furniture) pieceCount.set(f.kind, (pieceCount.get(f.kind) ?? 0) + 1);

  // people (victims listed last)
  const nv = isDoubleVariant(variant) ? 2 : 1;
  const cast = rng.shuffle(CAST).slice(0, nPeople);
  const people: Person[] = cast.map((c, i) => ({
    id: c.id, name: c.name, pronoun: c.pronoun, avatar: c.avatar, isVictim: i >= nPeople - nv,
  }));
  const draft = { rows, cols, rooms, furniture, people };
  const ctx = makePuzzleCtx(draft);

  // solution + roles
  const placed = placeRoles(rng, ctx, nPeople, variant, pieceCount);
  if (!placed) return fail("placeRoles");
  const { pos: sol, roles } = placed;

  // clues — victims are pinned through everybody else's clues; a victim clue of their own is a last resort
  let sel: Selection[] | null = null;
  for (let s = 0; s < 3; s++) {
    const cand = selectClues(rng, tier, t, spec, ctx, sol, roles, variant);
    if (!cand) { if (s >= 1 && !sel) break; continue; }
    if (!cand.some((x) => roles.victims.includes(x.owner))) { sel = cand; break; }
    sel ??= cand;
  }
  if (!sel) return fail("select");
  const finalSel = sel;

  const killerRule: KillerRule = variant === 'sniper' ? { type: 'lineOfSight' } : { type: 'aloneWithVictim' };
  const rulePred = (v: number): Predicate => {
    switch (variant) {
      case 'accomplice': case 'accompliceLiar': return { type: 'roomCount', cmp: 'exactly', n: 3 };
      case 'lockedRoom': return { type: 'aloneInRoom' };
      case 'poison': return { type: 'notBesideFurniture', kind: roles.poisonKind as FurnitureKind };
      case 'sniper': return killerRulePredicate({ type: 'lineOfSight' });
      default: return v >= 0 ? { type: 'roomCount', cmp: 'exactly', n: 2 } : killerRulePredicate(killerRule);
    }
  };
  const textCtx = { rows, cols, rooms, people, seed };
  const clues: Puzzle['clues'] = [];
  people.forEach((person, p) => {
    const vi = roles.victims.indexOf(p);
    if (vi >= 0) {
      clues.push({
        personId: person.id,
        text: victimRuleText(variant, person, { poisonKind: roles.poisonKind, first: vi === 0 }),
        predicate: rulePred(p),
      });
    }
    finalSel.filter((s) => s.owner === p)
      .sort((a, b) => CAT_ORDER[a.cat] - CAT_ORDER[b.cat])
      .forEach((s, k) => clues.push({ personId: person.id, text: clueText(s.pred, person, textCtx, vi >= 0 ? k : undefined), predicate: s.pred }));
  });

  const solution: Puzzle['solution'] = {};
  people.forEach((person, p) => { solution[person.id] = indexCell(cols, sol[p] as number); });
  const idOf = (p: number): string => (people[p] as Person).id;

  const puzzle: Puzzle = {
    id: cs.id,
    seasonId: cs.seasonId,
    tier,
    index: cs.index,
    seed,
    title: cs.title,
    themeId: theme.id,
    rows,
    cols,
    rooms,
    furniture,
    people,
    clues,
    killerRule,
    solution,
    killerId: idOf(roles.killers[0] as number),
    parSeconds: Math.max(30, Math.round((spec.par * nPeople * VARIANT_PAR[variant]) / spec.refPeople / 5) * 5),
    variant,
    killerIds: roles.killers.map(idOf),
    victimIds: roles.victims.map(idOf),
    layout: carving.style ?? layout,
    skinId: cs.district.id,
  };
  if (roles.liar >= 0) puzzle.liarId = idOf(roles.liar);
  if (roles.accomplice >= 0) puzzle.accompliceId = idOf(roles.accomplice);
  if (roles.poisonKind) puzzle.poisonKind = roles.poisonKind;
  return puzzle;
}

function buildCase(cs: CaseSpec): Puzzle {
  for (let attempt = 0; attempt < 80; attempt++) {
    genStats.attempts++;
    const p = tryGenerate(cs, attempt);
    if (p) { genStats.cases++; return p; }
  }
  throw new Error(`Floorplan Mysteries: could not generate ${cs.id}`);
}

const memo = new Map<string, Puzzle>();
function memoized(id: string, make: () => Puzzle): Puzzle {
  const hit = memo.get(id);
  if (hit) return hit;
  const p = make();
  memo.set(id, p);
  return p;
}

export function clearPuzzleCache(): void {
  memo.clear();
}

function caseSpec(districtId: string, tier: Tier, index: number): CaseSpec {
  const d = districtOf(districtId);
  return {
    id: `${d.id}-${tier}-${index}`,
    seasonId: d.id,
    district: d,
    tier,
    index,
    size: gridSizeFor(tier, index),
    variant: variantFor(tier, index),
    t: rampFor(tier, index),
    seedKey: [d.id, tier, index],
    title: puzzleTitle(d.id, tier, index),
  };
}

// ─────────────────────────── Daily / weekly / custom ───────────────────────────

function dailySpec(dateISO: string): CaseSpec {
  const day = dayNumber(dateISO);
  const tier = dailyTier(dateISO);
  const d = DISTRICTS[((day % DISTRICTS.length) + DISTRICTS.length) % DISTRICTS.length] as District;
  const [lo, hi] = tierSizeRange(tier);
  const vIndex = ((Math.abs(day) * 7) % CASES_PER_TIER[tier]) + 1;
  const date = new Date(day * 86400000).toISOString().slice(0, 10);
  const variant = variantFor(tier, vIndex, day);
  return {
    id: `daily-${date}`,
    seasonId: 'daily',
    district: d,
    tier,
    index: day,
    size: Math.max(VARIANT_MIN_SIZE[variant], lo + (hashSeed('daily-size', day) % (hi - lo + 1))),
    variant,
    t: rampFor(tier, vIndex),
    seedKey: ['daily', day],
    title: puzzleTitle('daily', tier, day),
  };
}

function weeklySpec(isoWeek: string): CaseSpec {
  const w = parseIsoWeek(isoWeek) ?? { year: 2026, week: 1 };
  const label = `${w.year}-W${String(w.week).padStart(2, '0')}`;
  const k = w.year * 100 + w.week;
  const d = DISTRICTS[(w.year * 53 + w.week) % DISTRICTS.length] as District;
  const theme = themeOf(d.themeId);
  return {
    id: `weekly-${label}`,
    seasonId: 'weekly',
    district: d,
    tier: 'mastermind',
    index: k,
    size: 14,
    variant: 'liarDouble',
    t: 1,
    seedKey: ['weekly', k],
    title: titleAt(theme, hashSeed('weekly-title', k) % (theme.titleWords.a.length * theme.titleWords.b.length)),
  };
}

export interface CustomOptions { districtId: string; tier: Tier; size: number; variant: Variant; seed: number }

/** Normalised custom options (size clamped to 4–14 and to the variant's minimum). */
export function normalizeCustom(o: CustomOptions): CustomOptions {
  const d = districtOf(o.districtId);
  const variant: Variant = o.variant in VARIANT_MIN_SIZE ? o.variant : 'classic';
  const size = Math.max(VARIANT_MIN_SIZE[variant], Math.min(14, Math.max(4, Math.round(o.size) || 4)));
  const tier: Tier = TIERS.includes(o.tier) ? o.tier : 'medium';
  return { districtId: d.id, tier, size, variant, seed: Math.abs(Math.floor(o.seed)) >>> 0 };
}

function customSpec(o: CustomOptions): CaseSpec {
  const c = normalizeCustom(o);
  const d = districtOf(c.districtId);
  const theme = themeOf(d.themeId);
  return {
    id: `custom-${d.id}-${c.tier}-${c.size}-${c.variant}-${c.seed}`,
    seasonId: 'custom',
    district: d,
    tier: c.tier,
    index: c.seed,
    size: c.size,
    variant: c.variant,
    t: 0.5,
    seedKey: ['custom', d.id, c.tier, c.size, c.variant, c.seed],
    title: titleAt(theme, hashSeed('custom-title', c.seed, c.variant) % (theme.titleWords.a.length * theme.titleWords.b.length)),
  };
}

// ─────────────────────────── Public API ───────────────────────────

/** Uncached generation (tests use this to check determinism). Also accepts 'daily' with index = day number. */
export function generatePuzzleUncached(districtId: string, tier: Tier, index: number): Puzzle {
  if (districtId === 'daily') return buildCase(dailySpec(new Date(index * 86400000).toISOString().slice(0, 10)));
  return buildCase(caseSpec(districtId, tier, index));
}

/** Deterministic, memoised case generation. `districtId` = a district id or a legacy season id. */
export function generatePuzzle(districtId: string, tier: Tier, index: number): Puzzle {
  if (districtId === 'daily') return dailyPuzzle(new Date(index * 86400000).toISOString().slice(0, 10));
  const cs = caseSpec(districtId, tier, index);
  return memoized(cs.id, () => buildCase(cs));
}

/** The Daily Case: district and tier rotate by day, size from the tier's range. */
export function dailyPuzzle(dateISO: string): Puzzle {
  const cs = dailySpec(dateISO);
  return memoized(cs.id, () => buildCase(cs));
}

/** Weekly Mastermind: one 14×14 liarDouble per ISO week ("2026-W41"). */
export function weeklyPuzzle(isoWeek: string): Puzzle {
  const cs = weeklySpec(isoWeek);
  return memoized(cs.id, () => buildCase(cs));
}

/** Custom case from the builder (any district, tier, size 4–14, variant, seed). */
export function generateCustom(opts: CustomOptions): Puzzle {
  const cs = customSpec(opts);
  return memoized(cs.id, () => buildCase(cs));
}

/** Uncached variants for tests. */
export const uncached = {
  daily: (dateISO: string): Puzzle => buildCase(dailySpec(dateISO)),
  weekly: (isoWeek: string): Puzzle => buildCase(weeklySpec(isoWeek)),
  custom: (opts: CustomOptions): Puzzle => buildCase(customSpec(opts)),
};

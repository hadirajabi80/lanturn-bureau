/**
 * Room carvers — one per `LayoutStyle` (docs/GRID-PLAN.md §3). Every carver is
 * deterministic from the rng, partitions the N×N grid into orthogonally
 * connected rooms of ≥ 3 cells, and tags structural rooms with a role
 * (corridor, hall, pier, alley, center) so they get fitting names.
 *
 *  organic   — free region growth
 *  corridor  — one 1-wide hallway through the middle, rooms on both sides
 *  carriages — horizontal bands 1–2 rows tall (one 3-row car for accomplice cases), split into compartments
 *  wings     — mirror-symmetric left/right wings around a central hall column
 *  courtyard — a central square room ringed by rooms
 *  docks     — one or two 1-wide piers along one edge + irregular warehouses
 *  blocks    — rectangular blocks separated by 1-wide alley rooms
 *  rings     — concentric square rings split into 2–4 arcs around a centre room
 */
import type { LayoutStyle } from '../types';
import type { Rng } from './rng';
import { weightedIndex } from './rng';
import type { RoomRole } from './themes';

export interface Carving {
  /** cell (r * N + c) → room index 0..roles.length-1 */
  owner: Int16Array;
  roles: RoomRole[];
  /** the style actually used (organic when the requested style could not carve this size) */
  style?: LayoutStyle;
}

interface Rect { r: number; c: number; h: number; w: number }

class Builder {
  owner: Int16Array;
  roles: RoomRole[] = [];
  constructor(public N: number) {
    this.owner = new Int16Array(N * N).fill(-1);
  }
  room(role: RoomRole): number {
    this.roles.push(role);
    return this.roles.length - 1;
  }
  rect(rect: Rect, role: RoomRole): number {
    const id = this.room(role);
    for (let r = rect.r; r < rect.r + rect.h; r++) for (let c = rect.c; c < rect.c + rect.w; c++) this.owner[r * this.N + c] = id;
    return id;
  }
  cells(cells: number[], role: RoomRole): number {
    const id = this.room(role);
    for (const i of cells) this.owner[i] = id;
    return id;
  }
  done(): Carving {
    return { owner: this.owner, roles: this.roles };
  }
}

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

/** Random composition of `total` into `parts` integers, each ≥ min. null when impossible. */
function composition(rng: Rng, total: number, parts: number, min: number): number[] | null {
  if (parts * min > total) return null;
  const out = new Array<number>(parts).fill(min);
  let rest = total - parts * min;
  while (rest > 0) {
    out[rng.int(parts)] += 1;
    rest--;
  }
  return out;
}

/**
 * Guillotine split of a rectangle into `parts` rectangles of area ≥ minArea.
 * `bias` 'h' prefers horizontal cut lines (splitting rows), 'v' vertical ones.
 */
function splitRect(rng: Rng, rect: Rect, parts: number, bias: 'h' | 'v' | null, minArea = 3): Rect[] | null {
  const area = rect.h * rect.w;
  if (parts <= 1) return area >= minArea ? [rect] : null;
  if (area < parts * minArea) return null;
  let first: 'h' | 'v';
  if (bias) first = rng.chance(0.85) ? bias : bias === 'h' ? 'v' : 'h';
  else {
    first = rect.h > rect.w ? 'h' : rect.w > rect.h ? 'v' : rng.chance(0.5) ? 'h' : 'v';
    if (rng.chance(0.2)) first = first === 'h' ? 'v' : 'h';
  }
  for (const o of [first, first === 'h' ? 'v' : 'h'] as const) {
    const L = o === 'h' ? rect.h : rect.w;
    const other = o === 'h' ? rect.w : rect.h;
    if (L < 2) continue;
    const p1 = parts === 2 ? 1 : clamp(Math.round(parts / 2 + (rng.next() - 0.5)), 1, parts - 1);
    const p2 = parts - p1;
    const ideal = (L * p1) / parts;
    const xs: { x: number; s: number }[] = [];
    for (let x = 1; x < L; x++) {
      if (x * other < p1 * minArea || (L - x) * other < p2 * minArea) continue;
      const thin = (p1 === 1 && x === 1 && other > 1) || (p2 === 1 && L - x === 1 && other > 1);
      xs.push({ x, s: Math.abs(x - ideal) + rng.next() * 1.3 + (thin ? 2.5 : 0) });
    }
    xs.sort((a, b) => a.s - b.s);
    for (const { x } of xs.slice(0, 3)) {
      const a: Rect = o === 'h' ? { r: rect.r, c: rect.c, h: x, w: rect.w } : { r: rect.r, c: rect.c, h: rect.h, w: x };
      const b: Rect = o === 'h' ? { r: rect.r + x, c: rect.c, h: rect.h - x, w: rect.w } : { r: rect.r, c: rect.c + x, h: rect.h, w: rect.w - x };
      const sa = splitRect(rng, a, p1, bias, minArea);
      if (!sa) continue;
      const sb = splitRect(rng, b, p2, bias, minArea);
      if (!sb) continue;
      return [...sa, ...sb];
    }
  }
  return null;
}

/** Split `total` rooms over pieces of the given areas (each ≥ 1, ≤ area/3), roughly proportional. */
function shareRooms(rng: Rng, areas: number[], total: number): number[] {
  const cap = areas.map((a) => Math.max(1, Math.floor(a / 3)));
  const out = areas.map(() => 1);
  let rest = total - out.length;
  while (rest > 0) {
    const w = areas.map((a, i) => (out[i] < cap[i] ? a / out[i] : 0));
    const i = weightedIndex(rng, w);
    if (i < 0) break;
    out[i]++;
    rest--;
  }
  return out;
}

/**
 * Seeded region growth inside `region` (cells with mask 1): k anchors spread
 * out, then smallest-first random BFS growth. Returns cell → local room index.
 */
function growRegion(rng: Rng, N: number, region: Uint8Array, k: number): Int16Array | null {
  const cells: number[] = [];
  for (let i = 0; i < N * N; i++) if (region[i]) cells.push(i);
  const total = cells.length;
  if (k < 1 || total < 3 * k) return null;
  const dist = (a: number, b: number): number => Math.abs(Math.floor(a / N) - Math.floor(b / N)) + Math.abs((a % N) - (b % N));
  for (let attempt = 0; attempt < 30; attempt++) {
    const owner = new Int16Array(N * N).fill(-1);
    const sizes = new Array<number>(k).fill(0);
    const anchors: number[] = [];
    for (let i = 0; i < k; i++) {
      let best = -1, bestD = -1;
      for (let s = 0; s < 12; s++) {
        const c = cells[rng.int(total)];
        if (owner[c] !== -1) continue;
        let d = anchors.length ? Infinity : 0;
        for (const a of anchors) d = Math.min(d, dist(a, c));
        if (d > bestD) { bestD = d; best = c; }
      }
      if (best < 0) best = cells.find((c) => owner[c] === -1) ?? -1;
      if (best < 0) return null;
      owner[best] = i;
      sizes[i] = 1;
      anchors.push(best);
    }
    let assigned = k;
    while (assigned < total) {
      const fronts: number[][] = [];
      const weights: number[] = [];
      for (let r = 0; r < k; r++) {
        const seen = new Set<number>();
        for (const c of cells) {
          if (owner[c] !== r) continue;
          const rr = Math.floor(c / N), cc = c % N;
          if (rr > 0 && region[c - N] && owner[c - N] === -1) seen.add(c - N);
          if (rr < N - 1 && region[c + N] && owner[c + N] === -1) seen.add(c + N);
          if (cc > 0 && region[c - 1] && owner[c - 1] === -1) seen.add(c - 1);
          if (cc < N - 1 && region[c + 1] && owner[c + 1] === -1) seen.add(c + 1);
        }
        const f = [...seen].sort((x, y) => x - y);
        fronts.push(f);
        weights.push(f.length ? 1 / Math.pow(sizes[r], 1.6) : 0);
      }
      const r = weightedIndex(rng, weights);
      if (r < 0) break;
      const cell = rng.pick(fronts[r]);
      owner[cell] = r;
      sizes[r]++;
      assigned++;
    }
    if (assigned < total) continue;
    const avg = total / k;
    if (sizes.some((s) => s < 3 || s > avg * 2.3)) continue;
    return owner;
  }
  return null;
}

function transpose(N: number, cv: Carving): Carving {
  const owner = new Int16Array(N * N);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) owner[c * N + r] = cv.owner[r * N + c];
  return { owner, roles: cv.roles };
}

function mirror(N: number, cv: Carving): Carving {
  const owner = new Int16Array(N * N);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) owner[r * N + (N - 1 - c)] = cv.owner[r * N + c];
  return { owner, roles: cv.roles };
}

// ─────────────────────────── carvers ───────────────────────────

function carveOrganic(rng: Rng, N: number, k: number): Carving | null {
  const region = new Uint8Array(N * N).fill(1);
  const o = growRegion(rng, N, region, k);
  if (!o) return null;
  return { owner: o, roles: new Array<RoomRole>(k).fill('room') };
}

function carveCorridor(rng: Rng, N: number, k: number): Carving | null {
  const b = new Builder(N);
  const m = Math.floor(N / 2) - (N % 2 === 0 && rng.chance(0.5) ? 1 : 0);
  b.rect({ r: m, c: 0, h: 1, w: N }, 'corridor');
  const top: Rect = { r: 0, c: 0, h: m, w: N };
  const bottom: Rect = { r: m + 1, c: 0, h: N - 1 - m, w: N };
  const [kT, kB] = shareRooms(rng, [top.h * top.w, bottom.h * bottom.w], Math.max(2, k - 1));
  for (const [rect, kk] of [[top, kT], [bottom, kB]] as const) {
    const parts = splitRect(rng, rect, kk, rect.h >= 5 ? null : 'v');
    if (!parts) return null;
    for (const p of parts) b.rect(p, 'room');
  }
  const cv = b.done();
  return rng.chance(0.7) ? cv : transpose(N, cv);
}

function carveCarriages(rng: Rng, N: number, k: number, tall = false): Carving | null {
  const heights: number[] = [];
  let sum = 0;
  // a three-row 'saloon car' when the scenario needs three people in one room
  if (tall && N >= 5) { heights.push(3); sum = 3; }
  while (sum < N) { heights.push(2); sum += 2; }
  if (sum > N) heights[heights.length - 1] = 1;
  const hs = rng.shuffle(heights);
  const minW = (h: number): number => (h >= 3 ? 3 : Math.ceil(3 / h));
  const maxC = (h: number): number => Math.max(1, Math.min(4, Math.floor(N / minW(h))));
  const cs = hs.map((h) => Math.min(2, maxC(h)));
  let extra = k - cs.reduce((a, x) => a + x, 0);
  while (extra > 0) {
    const w = hs.map((h, i) => (cs[i] < maxC(h) ? 1 : 0));
    const i = weightedIndex(rng, w);
    if (i < 0) break;
    cs[i]++;
    extra--;
  }
  const b = new Builder(N);
  let r = 0;
  hs.forEach((h, i) => {
    const widths = composition(rng, N, cs[i], minW(h)) ?? [N];
    let c = 0;
    for (const w of widths) {
      b.rect({ r, c, h, w }, 'room');
      c += w;
    }
    r += h;
  });
  return b.done();
}

function carveWings(rng: Rng, N: number, k: number): Carving | null {
  const hallW = N % 2 === 1 ? 1 : 2;
  const W = (N - hallW) / 2;
  let hallRooms = (k - 1) % 2 === 0 ? 1 : 2;
  if (hallRooms === 2 && (N * hallW) / 2 < 3) hallRooms = 1;
  const half = (k - hallRooms) / 2;
  const kw = clamp(rng.chance(0.5) ? Math.floor(half) : Math.ceil(half), 1, Math.floor((W * N) / 3));
  const left = splitRect(rng, { r: 0, c: 0, h: N, w: W }, kw, null);
  if (!left) return null;
  const b = new Builder(N);
  for (const p of left) b.rect(p, 'room');
  for (const p of left) b.rect({ r: p.r, c: N - p.c - p.w, h: p.h, w: p.w }, 'room');
  if (hallRooms === 1) b.rect({ r: 0, c: W, h: N, w: hallW }, 'hall');
  else {
    const minH = Math.ceil(3 / hallW);
    const cut = clamp(Math.floor(N / 2) + rng.int(3) - 1, minH, N - minH);
    b.rect({ r: 0, c: W, h: cut, w: hallW }, 'hall');
    b.rect({ r: cut, c: W, h: N - cut, w: hallW }, 'hall');
  }
  return b.done();
}

/** Four pinwheel sides of a square ring (outer offset o, width w, outer side S), in cyclic order. */
function pinwheel(o: number, w: number, S: number): Rect[] {
  return [
    { r: o, c: o, h: w, w: S - w },
    { r: o, c: o + S - w, h: S - w, w },
    { r: o + S - w, c: o + w, h: w, w: S - w },
    { r: o + w, c: o, h: S - w, w },
  ];
}

/** Group 4 cyclic sides into `a` (1..4) arcs of consecutive sides. */
function groupSides(rng: Rng, a: number): number[][] {
  const start = rng.int(4);
  const order = [0, 1, 2, 3].map((i) => (i + start) % 4);
  if (a >= 4) return order.map((i) => [i]);
  if (a === 3) return [[order[0], order[1]], [order[2]], [order[3]]];
  if (a === 2) return [[order[0], order[1]], [order[2], order[3]]];
  return [order];
}

const rectCells = (N: number, r: Rect): number[] => {
  const out: number[] = [];
  for (let y = r.r; y < r.r + r.h; y++) for (let x = r.c; x < r.c + r.w; x++) out.push(y * N + x);
  return out;
};

function carveCourtyard(rng: Rng, N: number, k: number): Carving | null {
  let s = Math.max(2, Math.round(N * 0.4));
  if ((N - s) % 2 !== 0) s = s - 1 >= 2 ? s - 1 : s + 1;
  const w = (N - s) / 2;
  if (w < 1) return null;
  const b = new Builder(N);
  b.rect({ r: w, c: w, h: s, w: s }, 'center');
  const caps = rng.chance(0.5);
  const sides: Rect[] = caps
    ? [{ r: 0, c: 0, h: w, w: N }, { r: w, c: N - w, h: s, w }, { r: N - w, c: 0, h: w, w: N }, { r: w, c: 0, h: s, w }]
    : pinwheel(0, w, N);
  const ring = Math.max(1, k - 1);
  if (ring < 4) {
    for (const g of groupSides(rng, ring)) b.cells(g.flatMap((i) => rectCells(N, sides[i])), 'room');
  } else {
    const share = shareRooms(rng, sides.map((r) => r.h * r.w), ring);
    for (let i = 0; i < 4; i++) {
      const rect = sides[i];
      const parts = splitRect(rng, rect, share[i], rect.w >= rect.h ? 'v' : 'h');
      if (!parts) return null;
      for (const p of parts) b.rect(p, 'room');
    }
  }
  const cv = b.done();
  return rng.chance(0.5) ? cv : mirror(N, cv);
}

function carveRings(rng: Rng, N: number, k: number): Carving | null {
  let sc = N % 2 === 0 ? 2 : 3;
  if (N % 2 === 0 && N >= 10 && rng.chance(0.25)) sc = 4;
  const sumW = (N - sc) / 2;
  if (sumW < 1) return null;
  const lo = Math.ceil(sumW / 2), hi = sumW;
  const feasible: number[] = [];
  for (let R = lo; R <= hi; R++) if (1 + 2 * R <= k && k <= 1 + 4 * R) feasible.push(R);
  let R: number;
  if (feasible.length) R = rng.pick(feasible);
  else R = clamp(Math.round((k - 1) / 3), lo, hi);
  const widths = rng.shuffle([...new Array<number>(sumW - R).fill(2), ...new Array<number>(2 * R - sumW).fill(1)]);
  const arcs = new Array<number>(R).fill(2);
  let extra = clamp(k - 1 - 2 * R, 0, 2 * R);
  while (extra > 0) {
    const i = rng.int(R);
    if (arcs[i] < 4) { arcs[i]++; extra--; }
  }
  const b = new Builder(N);
  let o = 0;
  widths.forEach((w, i) => {
    const S = N - 2 * o;
    const sides = pinwheel(o, w, S);
    const flip = rng.chance(0.5);
    for (const g of groupSides(rng, arcs[i])) {
      let cells = g.flatMap((j) => rectCells(N, sides[j]));
      if (flip) cells = cells.map((x) => Math.floor(x / N) * N + (N - 1 - (x % N)));
      b.cells(cells, 'room');
    }
    o += w;
  });
  b.rect({ r: o, c: o, h: sc, w: sc }, 'center');
  return b.done();
}

function carveDocks(rng: Rng, N: number, k: number): Carving | null {
  const piers = N >= 6 && k >= 5 && rng.chance(0.6) ? 2 : 1;
  const b = new Builder(N);
  const edge = N - 1;
  if (piers === 1) b.rect({ r: 0, c: edge, h: N, w: 1 }, 'pier');
  else {
    const cut = clamp(Math.floor(N / 2) + rng.int(3) - 1, 3, N - 3);
    b.rect({ r: 0, c: edge, h: cut, w: 1 }, 'pier');
    b.rect({ r: cut, c: edge, h: N - cut, w: 1 }, 'pier');
  }
  const region = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) if (b.owner[i] < 0) region[i] = 1;
  const kw = Math.max(1, k - piers);
  const local = growRegion(rng, N, region, kw);
  if (!local) return null;
  const base = b.roles.length;
  for (let r = 0; r < kw; r++) b.room('room');
  for (let i = 0; i < N * N; i++) if (region[i]) b.owner[i] = base + local[i];
  const cv = b.done();
  return rng.chance(0.5) ? cv : mirror(N, cv);
}

function carveBlocks(rng: Rng, N: number, k: number): Carving | null {
  let av = 1, ah = 0;
  if (N >= 6 && N <= 9) { av = 1; ah = 1; }
  else if (N >= 10) { av = rng.chance(0.5) ? 2 : 1; ah = 3 - av; }
  const minSeg = N < 5 ? 1 : 2;
  const colSegs = composition(rng, N - av, av + 1, minSeg);
  const rowSegs = composition(rng, N - ah, ah + 1, minSeg);
  if (!colSegs || !rowSegs) return null;
  const b = new Builder(N);
  // vertical alleys: full columns
  const alleyCols: number[] = [];
  let x = 0;
  for (let j = 0; j < av; j++) { x += colSegs[j]; alleyCols.push(x); x += 1; }
  const alleyRows: number[] = [];
  let y = 0;
  for (let i = 0; i < ah; i++) { y += rowSegs[i]; alleyRows.push(y); y += 1; }
  for (const c of alleyCols) b.rect({ r: 0, c, h: N, w: 1 }, 'alley');
  // column segment starts
  const colStart: number[] = [];
  x = 0;
  for (let j = 0; j <= av; j++) { colStart.push(x); x += colSegs[j] + 1; }
  const rowStart: number[] = [];
  y = 0;
  for (let i = 0; i <= ah; i++) { rowStart.push(y); y += rowSegs[i] + 1; }
  const smallPieces: number[][] = [];
  for (const ry of alleyRows) {
    for (let j = 0; j <= av; j++) {
      const cells: number[] = [];
      for (let c = colStart[j]; c < colStart[j] + colSegs[j]; c++) cells.push(ry * N + c);
      if (cells.length >= 3) b.cells(cells, 'alley');
      else smallPieces.push(cells);
    }
  }
  const blocks: Rect[] = [];
  for (let i = 0; i <= ah; i++) for (let j = 0; j <= av; j++) blocks.push({ r: rowStart[i], c: colStart[j], h: rowSegs[i], w: colSegs[j] });
  const target = Math.max(blocks.length, k - b.roles.length);
  const share = shareRooms(rng, blocks.map((r) => r.h * r.w), target);
  for (let i = 0; i < blocks.length; i++) {
    const parts = splitRect(rng, blocks[i], share[i], null);
    if (!parts) return null;
    for (const p of parts) b.rect(p, 'room');
  }
  // alley stubs shorter than 3 cells join a neighbouring block room
  for (const cells of smallPieces) {
    const c0 = cells[0];
    const above = c0 - N >= 0 ? b.owner[c0 - N] : -1;
    const below = c0 + N < N * N ? b.owner[c0 + N] : -1;
    const opts = [above, below].filter((r) => r >= 0 && b.roles[r] === 'room');
    if (!opts.length) return null;
    const id = rng.pick(opts);
    for (const c of cells) b.owner[c] = id;
  }
  const cv = b.done();
  return rng.chance(0.5) ? cv : transpose(N, cv);
}

// ─────────────────────────── validation & entry ───────────────────────────

/** Rooms partition the grid, are connected and hold ≥ 3 cells; count within [lo, hi]. */
export function validCarving(N: number, cv: Carving, lo: number, hi: number): boolean {
  const k = cv.roles.length;
  if (k < lo || k > hi) return false;
  const size = new Array<number>(k).fill(0);
  for (let i = 0; i < N * N; i++) {
    const r = cv.owner[i];
    if (r < 0 || r >= k) return false;
    size[r]++;
  }
  if (size.some((s) => s < 3)) return false;
  const seen = new Uint8Array(N * N);
  for (let r = 0; r < k; r++) {
    const start = cv.owner.indexOf(r);
    const stack = [start];
    seen[start] = 1;
    let count = 0;
    while (stack.length) {
      const c = stack.pop() as number;
      count++;
      const rr = Math.floor(c / N), cc = c % N;
      const nb = [rr > 0 ? c - N : -1, rr < N - 1 ? c + N : -1, cc > 0 ? c - 1 : -1, cc < N - 1 ? c + 1 : -1];
      for (const d of nb) if (d >= 0 && !seen[d] && cv.owner[d] === r) { seen[d] = 1; stack.push(d); }
    }
    if (count !== size[r]) return false;
  }
  return true;
}

const CARVERS: Record<LayoutStyle, (rng: Rng, N: number, k: number, tall: boolean) => Carving | null> = {
  organic: carveOrganic,
  corridor: carveCorridor,
  carriages: carveCarriages,
  wings: carveWings,
  courtyard: carveCourtyard,
  docks: carveDocks,
  blocks: carveBlocks,
  rings: carveRings,
};

/**
 * Carve an N×N plan in the given style aiming at `k` rooms; the result has
 * between `lo` and `hi` rooms. Falls back to organic growth when the style
 * cannot produce a valid plan for this size.
 */
export function carveRooms(
  rng: Rng, style: LayoutStyle, N: number, k: number, lo: number, hi: number, opts: { tall?: boolean } = {},
): Carving | null {
  for (let attempt = 0; attempt < 10; attempt++) {
    const cv = CARVERS[style](rng, N, k, !!opts.tall);
    if (cv && validCarving(N, cv, lo, hi)) return { ...cv, style };
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const cv = carveOrganic(rng, N, clamp(k, lo, hi));
    if (cv && validCarving(N, cv, lo, hi)) return { ...cv, style: 'organic' };
  }
  return null;
}

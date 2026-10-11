import type { Cell, Room } from '../../types';
import type { LabelSpot } from './types';

/** One straight interior wall run (merged across cells). */
export interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** horizontal run */
  h: boolean;
  /** length in cells */
  cells: number;
}

/** A grid vertex where walls meet or turn. */
export interface Junction {
  x: number;
  y: number;
  /** interior wall edges touching this vertex */
  inner: number;
  /** outer-border edges touching this vertex */
  outer: number;
  /** one of the four board corners */
  corner: boolean;
}

export interface WallGeo {
  segs: Seg[];
  /** all interior walls */
  d: string;
  /** horizontal / vertical interior walls only */
  dh: string;
  dv: string;
  /** outer border rectangle */
  border: string;
  junctions: Junction[];
  /** horizontal bands separated by full-width walls (train carriages): inclusive row ranges */
  bands: Array<{ r0: number; r1: number }>;
  roomPaths: string[];
  spots: LabelSpot[];
  /** the cell of each room closest to its centroid */
  centers: Cell[];
  /** roomIndex[r][c] */
  index: number[][];
}

/** roomIndex[r][c] -> index into rooms (or -1). */
export function buildRoomIndex(rows: number, cols: number, rooms: Room[]): number[][] {
  const grid: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(-1));
  rooms.forEach((room, i) => {
    for (const cell of room.cells) {
      const row = grid[cell.r];
      if (row && cell.c >= 0 && cell.c < cols) row[cell.c] = i;
    }
  });
  return grid;
}

/** Union of a room's cells as one path (one fill, no seams). */
export function squaresPath(cells: Cell[], U = 100): string {
  return cells.map((c) => `M${c.c * U},${c.r * U}h${U}v${U}h${-U}Z`).join('');
}

export function buildWallGeo(rows: number, cols: number, rooms: Room[], U = 100): WallGeo {
  const index = buildRoomIndex(rows, cols, rooms);
  const at = (r: number, c: number) => index[r]?.[c] ?? -1;
  const segs: Seg[] = [];
  // horizontal walls between row r-1 and r
  for (let r = 1; r < rows; r++) {
    let start = -1;
    for (let c = 0; c <= cols; c++) {
      const wall = c < cols && at(r - 1, c) !== at(r, c);
      if (wall && start < 0) start = c;
      if (!wall && start >= 0) {
        segs.push({ x1: start * U, y1: r * U, x2: c * U, y2: r * U, h: true, cells: c - start });
        start = -1;
      }
    }
  }
  // vertical walls between col c-1 and c
  for (let c = 1; c < cols; c++) {
    let start = -1;
    for (let r = 0; r <= rows; r++) {
      const wall = r < rows && at(r, c - 1) !== at(r, c);
      if (wall && start < 0) start = r;
      if (!wall && start >= 0) {
        segs.push({ x1: c * U, y1: start * U, x2: c * U, y2: r * U, h: false, cells: r - start });
        start = -1;
      }
    }
  }
  const segD = (s: Seg) => `M${s.x1},${s.y1}L${s.x2},${s.y2}`;
  const W = cols * U;
  const H = rows * U;

  // junctions
  const hWall = (r: number, c: number) => r > 0 && r < rows && c >= 0 && c < cols && at(r - 1, c) !== at(r, c);
  const vWall = (r: number, c: number) => c > 0 && c < cols && r >= 0 && r < rows && at(r, c - 1) !== at(r, c);
  const junctions: Junction[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const left = hWall(r, c - 1);
      const right = hWall(r, c);
      const up = vWall(r - 1, c);
      const down = vWall(r, c);
      const inner = +left + +right + +up + +down;
      const onH = r === 0 || r === rows;
      const onV = c === 0 || c === cols;
      const outer = (onH ? (c > 0 ? 1 : 0) + (c < cols ? 1 : 0) : 0) + (onV ? (r > 0 ? 1 : 0) + (r < rows ? 1 : 0) : 0);
      const corner = onH && onV;
      const straight = outer === 0 && inner === 2 && ((left && right) || (up && down));
      if (corner || (inner >= 1 && !straight)) junctions.push({ x: c * U, y: r * U, inner, outer, corner });
    }
  }

  // bands (full-width separators)
  const bands: Array<{ r0: number; r1: number }> = [];
  let r0 = 0;
  for (let r = 1; r <= rows; r++) {
    let full = r < rows;
    for (let c = 0; c < cols && full; c++) if (!hWall(r, c)) full = false;
    if (full || r === rows) {
      bands.push({ r0, r1: r - 1 });
      r0 = r;
    }
  }

  return {
    segs,
    d: segs.map(segD).join(''),
    dh: segs.filter((s) => s.h).map(segD).join(''),
    dv: segs.filter((s) => !s.h).map(segD).join(''),
    border: `M0,0H${W}V${H}H0Z`,
    junctions,
    bands,
    roomPaths: rooms.map((room) => squaresPath(room.cells, U)),
    spots: rooms.map((room, i) => labelSpot(room, i, U)),
    centers: rooms.map((room) => centerCell(room)),
    index,
  };
}

/** Label goes on the widest horizontal run of the room, preferring lower rows. */
function labelSpot(room: Room, index: number, U: number): LabelSpot {
  const byRow = new Map<number, number[]>();
  for (const c of room.cells) {
    const list = byRow.get(c.r) ?? [];
    list.push(c.c);
    byRow.set(c.r, list);
  }
  let best = { r: 0, c0: 0, len: 0 };
  for (const [r, list] of byRow) {
    list.sort((a, b) => a - b);
    let s = list[0] ?? 0;
    let prev = s;
    const flush = (end: number) => {
      const len = end - s + 1;
      if (len > best.len || (len === best.len && r > best.r)) best = { r, c0: s, len };
    };
    for (let i = 1; i < list.length; i++) {
      const v = list[i] ?? 0;
      if (v !== prev + 1) {
        flush(prev);
        s = v;
      }
      prev = v;
    }
    flush(prev);
  }
  return {
    room,
    index,
    name: room.name,
    x: (best.c0 + best.len / 2) * U,
    y: (best.r + 1) * U,
    maxW: best.len * U,
  };
}

function centerCell(room: Room): Cell {
  let sr = 0;
  let sc = 0;
  for (const c of room.cells) {
    sr += c.r;
    sc += c.c;
  }
  const n = Math.max(1, room.cells.length);
  const cr = sr / n;
  const cc = sc / n;
  let best = room.cells[0] ?? { r: 0, c: 0 };
  let bd = Infinity;
  for (const c of room.cells) {
    const d = (c.r - cr) ** 2 + (c.c - cc) ** 2;
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}

// ─────────────── small deterministic helpers ───────────────

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const r1 = (n: number) => Math.round(n * 10) / 10;

/** A wobbly hand-drawn line (quadratic chain with perpendicular jitter). */
export function wobble(x1: number, y1: number, x2: number, y2: number, seed: number, amp: number, step = 40): string {
  const rnd = rng(seed);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(1, Math.round(len / step));
  const nx = -(y2 - y1) / (len || 1);
  const ny = (x2 - x1) / (len || 1);
  let d = `M${r1(x1)},${r1(y1)}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const tm = (i - 0.5) / n;
    const j = (rnd() - 0.5) * 2 * amp;
    const mx = x1 + (x2 - x1) * tm + nx * j;
    const my = y1 + (y2 - y1) * tm + ny * j;
    d += `Q${r1(mx)},${r1(my)} ${r1(x1 + (x2 - x1) * t)},${r1(y1 + (y2 - y1) * t)}`;
  }
  return d;
}

/** Rough text-width estimate (avoids DOM measuring). `k` = average glyph width / font size. */
export const textWidth = (s: string, font: number, k = 0.56, spacing = 0) => s.length * (font * k + spacing);

/** Shorten long room names for narrow plates: "Grand Ballroom" -> "Ballroom" -> "Ballr." */
export function fitName(name: string, maxW: number, font: number, k = 0.56, spacing = 0): string {
  if (textWidth(name, font, k, spacing) <= maxW) return name;
  const words = name.split(/\s+/);
  const last = words[words.length - 1] ?? name;
  if (words.length > 1 && textWidth(last, font, k, spacing) <= maxW) return last;
  const fit = Math.max(3, Math.floor(maxW / (font * k + spacing)) - 1);
  return last.length > fit ? last.slice(0, fit) + '.' : last;
}

/** Path of a rounded rectangle. */
export function rrect(x: number, y: number, w: number, h: number, r: number): string {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + k},${y}H${x + w - k}A${k},${k} 0 0 1 ${x + w},${y + k}V${y + h - k}A${k},${k} 0 0 1 ${x + w - k},${y + h}H${x + k}A${k},${k} 0 0 1 ${x},${y + h - k}V${y + k}A${k},${k} 0 0 1 ${x + k},${y}Z`;
}

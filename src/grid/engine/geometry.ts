/**
 * Grid geometry for Crime Files. Cells are addressed internally by a flat
 * index `i = r * cols + c`; the public API (Cell) is converted at the edges.
 */
import type { Cell, Furniture, FurnitureKind, Room } from '../types';
import { OCCUPIABLE } from '../types';

/** The static part of a puzzle that geometry depends on. `Puzzle` satisfies it. */
export interface GridLike {
  rows: number;
  cols: number;
  rooms: Room[];
  furniture: Furniture[];
}

/** Precomputed lookup tables for one floor plan. Treat as immutable. */
export interface GridCtx {
  rows: number;
  cols: number;
  size: number;
  /** cell → room index (index into roomIds) */
  roomOf: Int16Array;
  roomIds: string[];
  roomIndex: Map<string, number>;
  roomCells: number[][];
  roomSize: number[];
  /** furniture kinds present in each room */
  roomKinds: Set<FurnitureKind>[];
  /** cell → furniture index (into the furniture array) or -1 */
  pieceAt: Int16Array;
  /** cell → furniture kind or null */
  kindAt: (FurnitureKind | null)[];
  /** 1 when a non-occupiable piece sits on the cell (nobody may stand there, blocks sight) */
  blocked: Uint8Array;
  /** kinds orthogonally adjacent to the cell, ignoring the piece the cell itself belongs to */
  adjKinds: Set<FurnitureKind>[];
  /** orthogonal neighbours */
  neighbors: number[][];
  /** all non-blocked cells, row-major */
  free: number[];
  /** every kind present on the map */
  kindsPresent: Set<FurnitureKind>;
}

export const cellIndex = (cols: number, cell: Cell): number => cell.r * cols + cell.c;
export const indexCell = (cols: number, i: number): Cell => ({ r: Math.floor(i / cols), c: i % cols });

export function rowOf(g: GridCtx, i: number): number {
  return Math.floor(i / g.cols);
}
export function colOf(g: GridCtx, i: number): number {
  return i % g.cols;
}

/** Manhattan distance ("steps"). */
export function manhattan(g: GridCtx, a: number, b: number): number {
  return Math.abs(rowOf(g, a) - rowOf(g, b)) + Math.abs(colOf(g, a) - colOf(g, b));
}

/** Orthogonal adjacency (4-neighbourhood). */
export function adjacent(g: GridCtx, a: number, b: number): boolean {
  return manhattan(g, a, b) === 1;
}

export function isCorner(g: GridCtx, i: number): boolean {
  const r = rowOf(g, i);
  const c = colOf(g, i);
  return (r === 0 || r === g.rows - 1) && (c === 0 || c === g.cols - 1);
}

export function isEdge(g: GridCtx, i: number): boolean {
  const r = rowOf(g, i);
  const c = colOf(g, i);
  return r === 0 || c === 0 || r === g.rows - 1 || c === g.cols - 1;
}

/**
 * Line of sight: same row or column, different cells, and no blocking
 * (non-occupiable) furniture strictly between them. People never block.
 */
export function lineOfSight(g: GridCtx, a: number, b: number): boolean {
  if (a === b) return false;
  const ra = rowOf(g, a), ca = colOf(g, a), rb = rowOf(g, b), cb = colOf(g, b);
  if (ra === rb) {
    const lo = Math.min(ca, cb), hi = Math.max(ca, cb);
    for (let c = lo + 1; c < hi; c++) if (g.blocked[ra * g.cols + c]) return false;
    return true;
  }
  if (ca === cb) {
    const lo = Math.min(ra, rb), hi = Math.max(ra, rb);
    for (let r = lo + 1; r < hi; r++) if (g.blocked[r * g.cols + ca]) return false;
    return true;
  }
  return false;
}

/** True when the straight segment between a and b (same row/col) has at least one blocking cell anywhere on its line. */
export function lineHasBlocker(g: GridCtx, a: number, b: number): boolean {
  const ra = rowOf(g, a), ca = colOf(g, a), rb = rowOf(g, b), cb = colOf(g, b);
  if (ra === rb) {
    for (let c = 0; c < g.cols; c++) if (g.blocked[ra * g.cols + c]) return true;
    return false;
  }
  if (ca === cb) {
    for (let r = 0; r < g.rows; r++) if (g.blocked[r * g.cols + ca]) return true;
    return false;
  }
  return false;
}

/** Strictly between a and b on a shared row or column. */
export function strictlyBetween(g: GridCtx, x: number, a: number, b: number): boolean {
  const rx = rowOf(g, x), cx = colOf(g, x);
  const ra = rowOf(g, a), ca = colOf(g, a), rb = rowOf(g, b), cb = colOf(g, b);
  if (rx === ra && rx === rb) return cx > Math.min(ca, cb) && cx < Math.max(ca, cb);
  if (cx === ca && cx === cb) return rx > Math.min(ra, rb) && rx < Math.max(ra, rb);
  return false;
}

const ctxCache = new WeakMap<object, GridCtx>();

/** Build (and cache per object) the lookup tables for a floor plan. */
export function buildGridCtx(g: GridLike): GridCtx {
  const hit = ctxCache.get(g);
  if (hit) return hit;
  const { rows, cols } = g;
  const size = rows * cols;
  const roomOf = new Int16Array(size).fill(-1);
  const roomIds: string[] = [];
  const roomIndex = new Map<string, number>();
  const roomCells: number[][] = [];
  g.rooms.forEach((room, ri) => {
    roomIds.push(room.id);
    roomIndex.set(room.id, ri);
    const cells: number[] = [];
    for (const cell of room.cells) {
      const i = cellIndex(cols, cell);
      roomOf[i] = ri;
      cells.push(i);
    }
    cells.sort((x, y) => x - y);
    roomCells.push(cells);
  });
  const roomSize = roomCells.map((c) => c.length);

  const pieceAt = new Int16Array(size).fill(-1);
  const kindAt: (FurnitureKind | null)[] = new Array<FurnitureKind | null>(size).fill(null);
  const blocked = new Uint8Array(size);
  const roomKinds: Set<FurnitureKind>[] = g.rooms.map(() => new Set<FurnitureKind>());
  const kindsPresent = new Set<FurnitureKind>();
  g.furniture.forEach((f, fi) => {
    kindsPresent.add(f.kind);
    for (const cell of f.cells) {
      const i = cellIndex(cols, cell);
      pieceAt[i] = fi;
      kindAt[i] = f.kind;
      if (!OCCUPIABLE[f.kind]) blocked[i] = 1;
      const ri = roomOf[i] as number;
      if (ri >= 0) roomKinds[ri]?.add(f.kind);
    }
  });

  const neighbors: number[][] = [];
  for (let i = 0; i < size; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const n: number[] = [];
    if (r > 0) n.push(i - cols);
    if (r < rows - 1) n.push(i + cols);
    if (c > 0) n.push(i - 1);
    if (c < cols - 1) n.push(i + 1);
    neighbors.push(n);
  }

  const adjKinds: Set<FurnitureKind>[] = [];
  for (let i = 0; i < size; i++) {
    const s = new Set<FurnitureKind>();
    const own = pieceAt[i] as number;
    for (const j of neighbors[i] as number[]) {
      const pj = pieceAt[j] as number;
      const kj = kindAt[j];
      if (pj >= 0 && pj !== own && kj) s.add(kj);
    }
    adjKinds.push(s);
  }

  const free: number[] = [];
  for (let i = 0; i < size; i++) if (!blocked[i]) free.push(i);

  const ctx: GridCtx = {
    rows, cols, size, roomOf, roomIds, roomIndex, roomCells, roomSize, roomKinds,
    pieceAt, kindAt, blocked, adjKinds, neighbors, free, kindsPresent,
  };
  ctxCache.set(g, ctx);
  return ctx;
}

import type { FloorStyle, Room } from '../types';

/** roomIndex[r][c] → index into rooms (or -1 if a cell is not covered). */
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

/** Path for every edge between two cells of different rooms, merging collinear runs. */
export function wallPath(roomIndex: number[][], rows: number, cols: number, U = 100): string {
  const parts: string[] = [];
  const at = (r: number, c: number) => roomIndex[r]?.[c] ?? -1;
  // horizontal walls (between row r-1 and r)
  for (let r = 1; r < rows; r++) {
    let start = -1;
    for (let c = 0; c <= cols; c++) {
      const isWall = c < cols && at(r - 1, c) !== at(r, c);
      if (isWall && start < 0) start = c;
      if (!isWall && start >= 0) {
        parts.push(`M${start * U},${r * U}H${c * U}`);
        start = -1;
      }
    }
  }
  // vertical walls (between col c-1 and c)
  for (let c = 1; c < cols; c++) {
    let start = -1;
    for (let r = 0; r <= rows; r++) {
      const isWall = r < rows && at(r, c - 1) !== at(r, c);
      if (isWall && start < 0) start = r;
      if (!isWall && start >= 0) {
        parts.push(`M${c * U},${start * U}V${r * U}`);
        start = -1;
      }
    }
  }
  return parts.join('');
}

/** Thin grid lines on every interior edge (walls are drawn on top of the room boundaries). */
export function gridPath(rows: number, cols: number, U = 100): string {
  const parts: string[] = [];
  for (let r = 1; r < rows; r++) parts.push(`M0,${r * U}H${cols * U}`);
  for (let c = 1; c < cols; c++) parts.push(`M${c * U},0V${rows * U}`);
  return parts.join('');
}

/** id of the <pattern> for a (floor style, colour) pair on one board. */
export function floorPatternId(prefix: string, style: FloorStyle, color: string): string {
  return `${prefix}-fl-${style}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
}

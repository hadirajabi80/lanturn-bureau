import { memo, type JSX } from 'react';
import type { Cell } from '../types';
const INK = '#2b2420';

export interface LineAssistProps {
  /** Unique prefix for SVG ids (one board per prefix). */
  idPrefix: string;
  rows: number;
  cols: number;
  /** Cell size in user units. */
  unit: number;
  /** Cells currently holding a person. Their whole row and column get shaded. */
  placed: Cell[];
  /** Clip path id (the board's rounded rectangle). */
  clipId: string;
}

/**
 * Row/column assist: softly hatches every row and column that already holds a person,
 * so the player can see at a glance which lines are "used" (one person per row and column).
 * Rows and columns are drawn as one path, so crossings are not darkened twice.
 */
export const LineAssist = memo(function LineAssist({ idPrefix, rows, cols, unit: U, placed, clipId }: LineAssistProps): JSX.Element | null {
  if (!placed.length) return null;
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  for (const c of placed) {
    if (c.r >= 0 && c.r < rows) usedRows.add(c.r);
    if (c.c >= 0 && c.c < cols) usedCols.add(c.c);
  }
  const W = cols * U;
  const H = rows * U;
  const d = [
    ...[...usedRows].map((r) => `M0,${r * U}h${W}v${U}h${-W}Z`),
    ...[...usedCols].map((c) => `M${c * U},0h${U}v${H}h${-U}Z`),
  ].join('');
  const patternId = `${idPrefix}-line-hatch`;

  return (
    <g pointerEvents="none" clipPath={`url(#${clipId})`} aria-hidden>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={14} height={14} patternTransform="rotate(45)">
          <rect width={14} height={14} fill={INK} fillOpacity={0.045} />
          <line x1={0} y1={0} x2={0} y2={14} stroke={INK} strokeOpacity={0.075} strokeWidth={4} />
        </pattern>
      </defs>
      <path d={d} fill={`url(#${patternId})`} />
    </g>
  );
});

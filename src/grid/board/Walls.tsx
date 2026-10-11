import { memo, useMemo, type JSX } from 'react';
import { wallPath } from './geometry';

const WALL_COLOR = '#3b332c';

export interface WallsProps {
  roomIndex: number[][];
  rows: number;
  cols: number;
  /** Interior wall stroke width in user units. */
  wall: number;
  /** Outer border stroke width in user units. */
  border: number;
  /** Corner radius of the board outline. */
  radius: number;
  /** id of a clipPath matching the board outline (keeps the wall shadow inside the board). */
  clipId?: string;
}

/** Interior walls (with a soft cast shadow) plus the outer board border. */
function WallsImpl({ roomIndex, rows, cols, wall, border, radius, clipId }: WallsProps): JSX.Element {
  const d = useMemo(() => wallPath(roomIndex, rows, cols), [roomIndex, rows, cols]);
  const W = cols * 100;
  const H = rows * 100;
  return (
    <g pointerEvents="none">
      {d && (
        <>
          <g clipPath={clipId ? `url(#${clipId})` : undefined}>
            <path
              d={d}
              transform={`translate(0 ${wall * 0.7})`}
              fill="none"
              stroke="#1e1712"
              strokeOpacity={0.16}
              strokeWidth={wall * 1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <path d={d} fill="none" stroke={WALL_COLOR} strokeWidth={wall} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {/* inner shadow along the outer wall */}
      <rect
        x={border / 2}
        y={border / 2}
        width={W - border}
        height={H - border}
        rx={Math.max(0, radius - border / 2)}
        fill="none"
        stroke="#1e1712"
        strokeOpacity={0.14}
        strokeWidth={border * 1.4}
      />
      <rect x={0} y={0} width={W} height={H} rx={radius} fill="none" stroke={WALL_COLOR} strokeWidth={border} strokeLinejoin="round" />
    </g>
  );
}

export const Walls = memo(WallsImpl);

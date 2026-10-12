/**
 * Small printed diagrams for the How to play page: a square grid in ink with optional room walls,
 * highlighted squares, blocked squares, pins (initials) and the two kinds of X.
 */
import type { JSX } from 'react';

export interface DiagramProps {
  n: number;
  /** room id per square, row-major (thick walls are drawn between different ids) */
  rooms?: string[];
  /** yellow highlighter squares */
  hl?: Array<[number, number]>;
  /** furniture that blocks the square */
  blocked?: Array<[number, number]>;
  /** furniture you can stand on */
  seat?: Array<[number, number]>;
  pins?: Array<{ at: [number, number]; label: string; red?: boolean }>;
  /** red X: crossed out for one person */
  cross?: Array<[number, number]>;
  /** grey hatch + ink X: nobody can be here */
  empty?: Array<[number, number]>;
  /** pixel size of one square */
  cell?: number;
  title: string;
}

const INK = '#141414';

export function Diagram({ n, rooms, hl = [], blocked = [], seat = [], pins = [], cross = [], empty = [], cell = 34, title }: DiagramProps): JSX.Element {
  const size = n * cell;
  const at = (r: number, c: number) => rooms?.[r * n + c];
  const walls: string[] = [];
  if (rooms) {
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (c < n - 1 && at(r, c) !== at(r, c + 1)) walls.push(`M${(c + 1) * cell},${r * cell}V${(r + 1) * cell}`);
        if (r < n - 1 && at(r, c) !== at(r + 1, c)) walls.push(`M${c * cell},${(r + 1) * cell}H${(c + 1) * cell}`);
      }
  }
  const x = (c: number) => c * cell;
  const y = (r: number) => r * cell;
  const pad = cell * 0.24;
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} width={size + 4} height={size + 4} role="img" aria-label={title} className="block max-w-full">
      <rect x={0} y={0} width={size} height={size} fill="#fff" />
      {hl.map(([r, c]) => (
        <rect key={`h${r}${c}`} x={x(c)} y={y(r)} width={cell} height={cell} fill="#FFD84D" />
      ))}
      {empty.map(([r, c]) => (
        <g key={`e${r}${c}`}>
          <rect x={x(c)} y={y(r)} width={cell} height={cell} fill="#E4E4DE" />
          <path
            d={`M${x(c) + pad},${y(r) + pad}L${x(c) + cell - pad},${y(r) + cell - pad}M${x(c) + cell - pad},${y(r) + pad}L${x(c) + pad},${y(r) + cell - pad}`}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </g>
      ))}
      {blocked.map(([r, c]) => (
        <rect key={`b${r}${c}`} x={x(c) + 5} y={y(r) + 5} width={cell - 10} height={cell - 10} rx={2} fill={INK} />
      ))}
      {seat.map(([r, c]) => (
        <rect key={`s${r}${c}`} x={x(c) + 6} y={y(r) + 6} width={cell - 12} height={cell - 12} rx={5} fill="#fff" stroke={INK} strokeWidth={1.6} />
      ))}
      {/* grid */}
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={`g${i}`} stroke="#B9B9B2" strokeWidth={1}>
          <line x1={x(i + 1)} y1={0} x2={x(i + 1)} y2={size} />
          <line x1={0} y1={y(i + 1)} x2={size} y2={y(i + 1)} />
        </g>
      ))}
      {walls.length > 0 && <path d={walls.join('')} stroke={INK} strokeWidth={3} strokeLinecap="square" fill="none" />}
      <rect x={0} y={0} width={size} height={size} fill="none" stroke={INK} strokeWidth={3} />
      {cross.map(([r, c]) => (
        <path
          key={`x${r}${c}`}
          d={`M${x(c) + pad},${y(r) + pad}L${x(c) + cell - pad},${y(r) + cell - pad}M${x(c) + cell - pad},${y(r) + pad}L${x(c) + pad},${y(r) + cell - pad}`}
          stroke="#D7261E"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      {pins.map(({ at: [r, c], label, red }) => (
        <g key={`p${r}${c}`}>
          <circle cx={x(c) + cell / 2} cy={y(r) + cell / 2} r={cell * 0.34} fill={red ? '#D7261E' : INK} />
          <text
            x={x(c) + cell / 2}
            y={y(r) + cell / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="IBM Plex Sans, sans-serif"
            fontWeight={700}
            fontSize={cell * 0.36}
            fill="#fff"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

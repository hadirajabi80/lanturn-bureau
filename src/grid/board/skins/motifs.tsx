import type { JSX } from 'react';
import type { FloorStyle, Room } from '../../types';
import { rng } from './geom';

/**
 * Floor motifs: medium-agnostic line work for every FloorStyle, tiled in board user space
 * (1 cell = 100). Each skin renders the same motif in its own medium (sepia ink, chalk,
 * gold hairline, white technical line...) on top of the room's palette colour.
 */
export interface Motif {
  w: number;
  h: number;
  /** stroked line work */
  lines?: string;
  /** filled shapes (specks, nail heads, checker squares) */
  fills?: string;
  /** secondary, lighter line work (highlights) */
  soft?: string;
}

const dot = (x: number, y: number, r: number) =>
  `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0`;

function specks(seed: number, n: number, size: number, rMin: number, rMax: number): string {
  const rnd = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) d += dot(rnd() * size, rnd() * size, rMin + rnd() * (rMax - rMin));
  return d;
}

export const MOTIFS: Record<FloorStyle, Motif> = {
  wood: {
    w: 200,
    h: 100,
    lines: 'M0,0H200M0,25H200M0,50H200M0,75H200M70,0V25M150,25V50M30,50V75M130,50V75M100,75V100',
    soft: 'M12,10Q30,7 48,11T86,10M110,35Q128,32 146,37T184,35M40,60Q60,57 80,61M140,85Q160,82 186,87M8,88Q22,85 34,89',
  },
  deck: {
    w: 100,
    h: 200,
    lines: 'M0,0V200M20,0V200M40,0V200M60,0V200M80,0V200M0,0H20M20,47H40M40,94H60M60,141H80M80,188H100',
    fills: [dot(5, 5, 1.6), dot(15, 5, 1.6), dot(25, 52, 1.6), dot(35, 52, 1.6), dot(45, 99, 1.6), dot(55, 99, 1.6), dot(65, 146, 1.6), dot(75, 146, 1.6), dot(85, 193, 1.6), dot(95, 193, 1.6)].join(''),
  },
  tile: {
    w: 50,
    h: 50,
    lines: 'M0,0H50M0,0V50',
    soft: 'M9,12l8,-4M34,39l6,-3',
  },
  stone: {
    w: 100,
    h: 100,
    lines: 'M0,34L40,30L46,0M40,30L60,58M78,0L82,30L100,34M82,30L60,58M0,72L28,74L60,58M60,58L80,80L100,72M80,80L78,100M28,74L46,100',
    fills: specks(17, 7, 100, 0.8, 1.8),
  },
  carpet: {
    w: 40,
    h: 40,
    lines: 'M0,20L20,0L40,20L20,40Z',
    fills: dot(20, 20, 1.8) + dot(0, 0, 1.2) + dot(40, 0, 1.2) + dot(0, 40, 1.2) + dot(40, 40, 1.2),
  },
  grass: {
    w: 50,
    h: 50,
    lines: 'M8,16l2,-6l2,6M10,16l4,-5M32,40l2,-6l2,6M30,40l-3,-4M36,12l2,-5l2,5M12,38l2,-4M22,28l1,-4l1,4',
  },
  marble: {
    w: 200,
    h: 200,
    lines: 'M-5,40C30,30 40,70 80,60S140,20 205,45M40,60C50,80 70,85 72,110M-5,150C40,140 60,170 110,160S170,120 205,140',
    soft: 'M120,0C125,30 150,50 145,90M20,100C40,110 30,130 50,140M150,150C160,170 150,185 165,200',
  },
  concrete: {
    w: 100,
    h: 100,
    lines: 'M0,0H100M0,0V100',
    fills: specks(23, 18, 100, 0.6, 1.5),
  },
  checker: {
    w: 100,
    h: 100,
    fills: 'M0,0h50v50h-50ZM50,50h50v50h-50Z',
  },
  sand: {
    w: 40,
    h: 40,
    lines: 'M4,22q8,-4 16,0t16,0',
    fills: specks(37, 9, 40, 0.5, 1.1),
  },
};

export interface MotifStyle {
  /** stroke colour of the line work */
  ink: string;
  /** user-unit width of lines (soft lines are 0.7x) */
  width: number;
  /** overall opacity of line work */
  opacity: number;
  /** filled shapes colour + opacity (defaults to ink / opacity) */
  fill?: string;
  fillOpacity?: number;
  /** checker squares are big fills: give them their own colour/opacity */
  checker?: { fill: string; opacity: number };
  dash?: string;
  /** optional filter id applied to every motif tile */
  filter?: string;
  overrides?: Partial<Record<FloorStyle, Motif>>;
}

export const motifId = (style: FloorStyle) => `motif-${style}`;

/** <pattern>s for each floor style used on this board. */
export function MotifPatterns({ id, rooms, s }: { id: (n: string) => string; rooms: Room[]; s: MotifStyle }): JSX.Element {
  const used = [...new Set(rooms.map((r) => r.floor))];
  return (
    <>
      {used.map((style) => {
        const m = s.overrides?.[style] ?? MOTIFS[style];
        const fill = style === 'checker' && s.checker ? s.checker.fill : (s.fill ?? s.ink);
        const fillOp = style === 'checker' && s.checker ? s.checker.opacity : (s.fillOpacity ?? s.opacity);
        return (
          <pattern key={style} id={id(motifId(style))} patternUnits="userSpaceOnUse" x={0} y={0} width={m.w} height={m.h}>
            <g filter={s.filter} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {m.fills && <path d={m.fills} fill={fill} fillOpacity={fillOp} stroke="none" />}
              {m.lines && <path d={m.lines} stroke={s.ink} strokeOpacity={s.opacity} strokeWidth={s.width} strokeDasharray={s.dash} />}
              {m.soft && <path d={m.soft} stroke={s.ink} strokeOpacity={s.opacity * 0.75} strokeWidth={s.width * 0.7} strokeDasharray={s.dash} />}
            </g>
          </pattern>
        );
      })}
    </>
  );
}

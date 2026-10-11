import { memo, type JSX } from 'react';
import { mix, shade } from '../../components/avatar/color';
import type { FloorStyle, Room } from '../types';
import { floorPatternId } from './geometry';
import { lcg } from './sprites/common';

/**
 * SVG <pattern> fills for room floors. Patterns live in board user space
 * (1 cell = 100 units, origin at the board's top-left) so textures line up with the grid.
 */

interface Speck {
  x: number;
  y: number;
  r: number;
  k: number;
}

function scatter(seed: number, n: number, size: number, rMin: number, rMax: number): Speck[] {
  const rnd = lcg(seed);
  return Array.from({ length: n }, () => ({
    x: rnd() * size,
    y: rnd() * size,
    r: rMin + rnd() * (rMax - rMin),
    k: rnd(),
  }));
}

const PEBBLES = scatter(11, 15, 100, 3, 8.5);
const SPECKS = scatter(23, 26, 60, 0.6, 1.6);
const SAND = scatter(37, 22, 40, 0.5, 1.2);

function Pattern({ id, style, color }: { id: string; style: FloorStyle; color: string }): JSX.Element {
  const dark = shade(color, -0.12);
  const darker = shade(color, -0.22);
  const light = shade(color, 0.22);
  const common = { id, patternUnits: 'userSpaceOnUse' as const, x: 0, y: 0 };

  switch (style) {
    case 'wood': {
      // 4 planks per cell, staggered butt joints, soft grain.
      const joints: Array<[number, number]> = [
        [0, 70],
        [1, 150],
        [2, 30],
        [2, 130],
        [3, 100],
      ];
      return (
        <pattern {...common} width={200} height={100}>
          <rect width={200} height={100} fill={color} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect y={i * 25} width={200} height={25} fill={i % 2 ? dark : color} opacity={i % 2 ? 0.35 : 0} />
              <path d={`M0,${i * 25 + 1.2} H200`} stroke={light} strokeWidth={1.4} opacity={0.6} />
              <path d={`M0,${i * 25 + 24.4} H200`} stroke={darker} strokeWidth={1.6} opacity={0.75} />
            </g>
          ))}
          {joints.map(([row, x]) => (
            <path key={`${row}-${x}`} d={`M${x},${row * 25 + 1} V${row * 25 + 24}`} stroke={darker} strokeWidth={1.6} opacity={0.75} />
          ))}
          <g fill="none" stroke={darker} strokeWidth={1} opacity={0.35} strokeLinecap="round">
            <path d="M12,8 Q30,5 48,9 T86,8" />
            <path d="M110,33 Q128,30 146,35 T184,33" />
            <path d="M40,58 Q60,55 80,59" />
            <path d="M140,83 Q160,80 186,85" />
            <path d="M8,87 Q22,84 34,88" />
          </g>
          <ellipse cx={156} cy={12} rx={4} ry={2} fill="none" stroke={darker} strokeWidth={1} opacity={0.4} />
          <ellipse cx={60} cy={62} rx={3.5} ry={1.8} fill="none" stroke={darker} strokeWidth={1} opacity={0.4} />
        </pattern>
      );
    }
    case 'deck': {
      // Vertical boards with nail heads.
      return (
        <pattern {...common} width={100} height={200}>
          <rect width={100} height={200} fill={color} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={i * 20} width={20} height={200} fill={dark} opacity={i % 2 ? 0.3 : 0} />
              <path d={`M${i * 20 + 19.2},0 V200`} stroke={darker} strokeWidth={1.6} opacity={0.8} />
              <path d={`M${i * 20 + 1.2},0 V200`} stroke={light} strokeWidth={1.2} opacity={0.5} />
              <path d={`M${i * 20},${(i * 47) % 200} h19`} stroke={darker} strokeWidth={1.6} opacity={0.7} />
              <circle cx={i * 20 + 5} cy={((i * 47) % 200) + 5} r={1.3} fill={darker} />
              <circle cx={i * 20 + 15} cy={((i * 47) % 200) + 5} r={1.3} fill={darker} />
            </g>
          ))}
        </pattern>
      );
    }
    case 'tile': {
      // 2×2 tiles per cell with light grout and a little shine dash.
      const grout = mix(color, '#ffffff', 0.5);
      return (
        <pattern {...common} width={50} height={50}>
          <rect width={50} height={50} fill={color} />
          <path d="M0,0.8 H50 M0.8,0 V50" stroke={grout} strokeWidth={2.4} />
          <path d="M0,49 H50 M49,0 V50" stroke={dark} strokeWidth={1} opacity={0.5} />
          <path d="M9,12 l8,-4" stroke={light} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
          <path d="M34,39 l6,-3" stroke={dark} strokeWidth={2} strokeLinecap="round" opacity={0.45} />
        </pattern>
      );
    }
    case 'stone': {
      return (
        <pattern {...common} width={100} height={100}>
          <rect width={100} height={100} fill={color} />
          {PEBBLES.map((p, i) => (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={p.r}
              ry={p.r * (0.6 + p.k * 0.3)}
              fill={p.k > 0.55 ? light : dark}
              opacity={p.k > 0.55 ? 0.75 : 0.6}
              transform={`rotate(${Math.round(p.k * 180)} ${p.x} ${p.y})`}
            />
          ))}
        </pattern>
      );
    }
    case 'carpet': {
      return (
        <pattern {...common} width={40} height={40}>
          <rect width={40} height={40} fill={color} />
          <g stroke={dark} strokeWidth={2.2} strokeLinecap="round" opacity={0.6}>
            <path d="M6,9 h8" />
            <path d="M26,29 h8" />
          </g>
          <g stroke={light} strokeWidth={2} strokeLinecap="round" opacity={0.6}>
            <path d="M27,10 h5" />
            <path d="M7,30 h5" />
          </g>
        </pattern>
      );
    }
    case 'grass': {
      const blade = shade(color, -0.2);
      return (
        <pattern {...common} width={50} height={50}>
          <rect width={50} height={50} fill={color} />
          <g fill="none" stroke={blade} strokeWidth={1.8} strokeLinecap="round" opacity={0.75}>
            <path d="M8,16 l2,-6 l2,6 M10,16 l4,-5" />
            <path d="M32,40 l2,-6 l2,6 M30,40 l-3,-4" />
          </g>
          <g fill="none" stroke={light} strokeWidth={1.6} strokeLinecap="round" opacity={0.7}>
            <path d="M36,12 l2,-5 l2,5" />
            <path d="M12,38 l2,-4" />
          </g>
          <circle cx={24} cy={25} r={1.4} fill={light} opacity={0.8} />
        </pattern>
      );
    }
    case 'marble': {
      return (
        <pattern {...common} width={200} height={200}>
          <rect width={200} height={200} fill={color} />
          <g fill="none" strokeLinecap="round">
            <path d="M-5,40 C30,30 40,70 80,60 S140,20 205,45" stroke={darker} strokeWidth={1.3} opacity={0.35} />
            <path d="M40,60 C50,80 70,85 72,110" stroke={darker} strokeWidth={0.9} opacity={0.3} />
            <path d="M-5,150 C40,140 60,170 110,160 S170,120 205,140" stroke={darker} strokeWidth={1.2} opacity={0.3} />
            <path d="M120,0 C125,30 150,50 145,90" stroke={light} strokeWidth={2.2} opacity={0.7} />
            <path d="M20,100 C40,110 30,130 50,140" stroke={light} strokeWidth={2} opacity={0.6} />
          </g>
        </pattern>
      );
    }
    case 'concrete': {
      return (
        <pattern {...common} width={60} height={60}>
          <rect width={60} height={60} fill={color} />
          {SPECKS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.k > 0.5 ? darker : light} opacity={p.k > 0.5 ? 0.45 : 0.6} />
          ))}
        </pattern>
      );
    }
    case 'checker': {
      const alt = mix(color, '#ffffff', 0.45);
      return (
        <pattern {...common} width={100} height={100}>
          <rect width={100} height={100} fill={color} />
          <rect width={50} height={50} fill={alt} />
          <rect x={50} y={50} width={50} height={50} fill={alt} />
          <path d="M8,10 l7,-3 M58,60 l7,-3" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        </pattern>
      );
    }
    case 'sand': {
      return (
        <pattern {...common} width={40} height={40}>
          <rect width={40} height={40} fill={color} />
          {SAND.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.k > 0.45 ? darker : light} opacity={0.6} />
          ))}
          <path d="M4,22 q8,-4 16,0 t16,0" fill="none" stroke={dark} strokeWidth={1} opacity={0.35} />
        </pattern>
      );
    }
    default: {
      return (
        <pattern {...common} width={100} height={100}>
          <rect width={100} height={100} fill={color} />
        </pattern>
      );
    }
  }
}

export interface FloorPatternsProps {
  /** Unique per-board prefix (from useId) so several boards can coexist on a page. */
  idPrefix: string;
  rooms: Room[];
}

/** `<defs>` holding one pattern per distinct (floor style, colour) used by the rooms. */
function FloorPatternsImpl({ idPrefix, rooms }: FloorPatternsProps): JSX.Element {
  const seen = new Set<string>();
  const items: Array<{ id: string; style: FloorStyle; color: string }> = [];
  for (const room of rooms) {
    const id = floorPatternId(idPrefix, room.floor, room.color);
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({ id, style: room.floor, color: room.color });
  }
  return (
    <defs>
      {items.map((it) => (
        <Pattern key={it.id} {...it} />
      ))}
    </defs>
  );
}

export const FloorPatterns = memo(FloorPatternsImpl);

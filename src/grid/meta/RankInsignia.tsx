import { useId, type JSX } from 'react';
import { shade } from '../../components/avatar';
import type { Rank, RankId } from './types';
import { RANKS, RANK_BY_ID } from './xp';

export interface RankInsigniaProps {
  /** Rank object, index (0–7) or id. */
  rank: Rank | number | RankId;
  size?: number;
  className?: string;
  /** Adds a soft glow behind the badge. */
  glow?: boolean;
  title?: string;
}

const resolve = (r: RankInsigniaProps['rank']): Rank =>
  typeof r === 'number' ? RANKS[Math.max(0, Math.min(RANKS.length - 1, r))] : typeof r === 'string' ? RANK_BY_ID[r] ?? RANKS[0] : r;

const SHIELD = 'M32 6 L52 13 V31 C52 44 43 53 32 58 C21 53 12 44 12 31 V13 Z';
const CROWN = 'M22 21 L23.5 11 L28.5 16 L32 8.5 L35.5 16 L40.5 11 L42 21 Z';

function starPath(cx: number, cy: number, r: number, inner = 0.45, points = 5, rot = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** Leaves along an arc on one side; `side` = -1 left, 1 right. */
function laurel(side: -1 | 1, from: number, to: number, r: number, cy: number, fill: string, count = 6): JSX.Element[] {
  const out: JSX.Element[] = [];
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * i) / (count - 1);
    const a = (t * Math.PI) / 180;
    const x = 32 - side * r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const rot = side === -1 ? t + 18 : -t - 18;
    out.push(<ellipse key={`${side}-${i}`} cx={x} cy={y} rx={2.1} ry={4.4} transform={`rotate(${rot} ${x} ${y})`} fill={fill} />);
  }
  return out;
}

/**
 * Procedural SVG insignia — one distinct emblem per rank, metal by rank band:
 * bronze (Constable, Sergeant), silver (Detective, Inspector), gold (Chief Inspector,
 * Superintendent), platinum (Commissioner) and lantern-gold (Legend).
 */
export function RankInsignia({ rank, size = 48, className, glow, title }: RankInsigniaProps) {
  const r = resolve(rank);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = `ri-${uid}`;
  const base = r.color;
  const light = shade(base, 0.55);
  const dark = shade(base, -0.55);
  const deep = shade(base, -0.78);
  const metal = `url(#${g}-m)`;
  const i = r.index;

  const engrave = { fill: deep, stroke: shade(base, 0.7), strokeWidth: 0.6, strokeOpacity: 0.5 } as const;

  let body: JSX.Element;
  switch (i) {
    case 0:
    case 1: {
      const chevrons = i === 0 ? [32] : [24, 32, 40];
      body = (
        <g>
          <circle cx={32} cy={32} r={24} fill={metal} stroke={dark} strokeWidth={2} />
          <circle cx={32} cy={32} r={19.5} fill="none" stroke={dark} strokeWidth={1} strokeDasharray="1.5 2.2" opacity={0.8} />
          {chevrons.map((y) => (
            <polyline key={y} points={`20,${y + 5} 32,${y - 4} 44,${y + 5}`} fill="none" stroke={deep} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>
      );
      break;
    }
    case 2:
      body = (
        <g>
          <path d={SHIELD} fill={metal} stroke={dark} strokeWidth={2} />
          <circle cx={29} cy={29} r={8.5} fill="none" stroke={deep} strokeWidth={3.4} />
          <line x1={35} y1={35.5} x2={42} y2={43} stroke={deep} strokeWidth={4.2} strokeLinecap="round" />
          <circle cx={26.5} cy={26.5} r={2.2} fill={light} opacity={0.7} />
        </g>
      );
      break;
    case 3:
      body = (
        <g>
          <path d={SHIELD} fill={metal} stroke={dark} strokeWidth={2} />
          <path d={starPath(32, 28, 10)} {...engrave} />
          <rect x={22} y={42} width={20} height={3.4} rx={1.2} fill={deep} />
        </g>
      );
      break;
    case 4:
      body = (
        <g>
          {laurel(-1, 105, 205, 25, 33, dark, 5)}
          {laurel(1, 105, 205, 25, 33, dark, 5)}
          <path d={SHIELD} fill={metal} stroke={dark} strokeWidth={2} transform="translate(32 32) scale(0.86) translate(-32 -32)" />
          <path d={starPath(25.5, 29, 6.4)} {...engrave} />
          <path d={starPath(38.5, 29, 6.4)} {...engrave} />
          <rect x={24} y={40} width={16} height={3} rx={1.2} fill={deep} />
        </g>
      );
      break;
    case 5:
      body = (
        <g>
          <path d={SHIELD} fill={metal} stroke={dark} strokeWidth={2} transform="translate(0 4) translate(32 32) scale(0.9) translate(-32 -32)" />
          <path d={CROWN} fill={metal} stroke={dark} strokeWidth={1.4} strokeLinejoin="round" />
          <path d={starPath(32, 38, 9.5)} {...engrave} />
          <circle cx={32} cy={8.6} r={1.6} fill={light} />
        </g>
      );
      break;
    case 6:
      body = (
        <g>
          {laurel(-1, 98, 235, 24, 33, metal, 8)}
          {laurel(1, 98, 235, 24, 33, metal, 8)}
          <g transform="rotate(-38 32 36)">
            <rect x={29.5} y={16} width={5} height={38} rx={2.5} fill={metal} stroke={dark} strokeWidth={1.2} />
            <rect x={28.5} y={16} width={7} height={5} rx={1.5} fill={dark} />
          </g>
          <g transform="rotate(38 32 36)">
            <rect x={29.5} y={16} width={5} height={38} rx={2.5} fill={metal} stroke={dark} strokeWidth={1.2} />
            <rect x={28.5} y={16} width={7} height={5} rx={1.5} fill={dark} />
          </g>
          <path d={CROWN} fill={metal} stroke={dark} strokeWidth={1.4} strokeLinejoin="round" transform="translate(0 -3)" />
        </g>
      );
      break;
    default:
      body = (
        <g>
          <path d={starPath(32, 32, 30, 0.62, 12, -90)} fill={`url(#${g}-r)`} opacity={0.95} />
          <path d={SHIELD} fill={metal} stroke={dark} strokeWidth={2} transform="translate(32 32) scale(0.78) translate(-32 -32)" />
          {/* lantern */}
          <g fill={deep}>
            <rect x={29} y={17} width={6} height={2.4} rx={1} />
            <path d="M25.5 21 H38.5 L37 41 H27 Z" fill="none" stroke={deep} strokeWidth={2.2} strokeLinejoin="round" />
            <rect x={26} y={41} width={12} height={2.6} rx={1} />
          </g>
          <ellipse cx={32} cy={31} rx={3.4} ry={5.6} fill="#FFE29A" />
          <ellipse cx={32} cy={32} rx={1.6} ry={3} fill="#FFFFFF" opacity={0.9} />
        </g>
      );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      style={glow ? { filter: `drop-shadow(0 0 ${size / 6}px ${base}88)`, overflow: 'visible' } : { overflow: 'visible' }}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${g}-m`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={base} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${g}-r`}>
          <stop offset="0.3" stopColor="#FFE29A" />
          <stop offset="1" stopColor={base} stopOpacity={0.15} />
        </radialGradient>
      </defs>
      {body}
      {/* specular sweep */}
      <path d="M18 14 Q32 8 46 14" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

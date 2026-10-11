import type { JSX } from 'react';
import { r1, rng } from './geom';

/** Shared bits for the light, cute skins (ribbon, lace, candy). */

export const heartPath = (x: number, y: number, s: number): string =>
  `M${r1(x)},${r1(y + s * 0.35)}C${r1(x - s * 0.1)},${r1(y + s * 0.2)} ${r1(x - s * 0.55)},${r1(y + s * 0.05)} ${r1(x - s * 0.5)},${r1(y - s * 0.25)}C${r1(x - s * 0.45)},${r1(y - s * 0.55)} ${r1(x - s * 0.05)},${r1(y - s * 0.5)} ${r1(x)},${r1(y - s * 0.2)}C${r1(x + s * 0.05)},${r1(y - s * 0.5)} ${r1(x + s * 0.45)},${r1(y - s * 0.55)} ${r1(x + s * 0.5)},${r1(y - s * 0.25)}C${r1(x + s * 0.55)},${r1(y + s * 0.05)} ${r1(x + s * 0.1)},${r1(y + s * 0.2)} ${r1(x)},${r1(y + s * 0.35)}Z`;

export interface Bit {
  x: number;
  y: number;
  a: number;
  s: number;
  c: string;
  k: number;
}

/** Deterministic scatter inside a rectangle. */
export function scatter(seed: number, n: number, box: { x: number; y: number; width: number; height: number }, colors: string[], sMin: number, sMax: number): Bit[] {
  const rnd = rng(seed);
  return Array.from({ length: n }, () => ({
    x: box.x + rnd() * box.width,
    y: box.y + rnd() * box.height,
    a: Math.round(rnd() * 180),
    s: sMin + rnd() * (sMax - sMin),
    c: colors[Math.floor(rnd() * colors.length)] ?? '#ffffff',
    k: rnd(),
  }));
}

/** Centres of evenly spaced scallops along the edges of a rectangle (clockwise). */
export function scallopCenters(x: number, y: number, w: number, h: number, step: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const nx = Math.max(2, Math.round(w / step));
  const ny = Math.max(2, Math.round(h / step));
  for (let i = 0; i < nx; i++) out.push([x + (i + 0.5) * (w / nx), y]);
  for (let i = 0; i < ny; i++) out.push([x + w, y + (i + 0.5) * (h / ny)]);
  for (let i = 0; i < nx; i++) out.push([x + w - (i + 0.5) * (w / nx), y + h]);
  for (let i = 0; i < ny; i++) out.push([x, y + h - (i + 0.5) * (h / ny)]);
  return out;
}

/** A little ribbon bow centred at (0,0), `s` ≈ half its width. */
export function Bow({ x, y, s, fill, edge, shine = '#ffffff' }: { x: number; y: number; s: number; fill: string; edge: string; shine?: string }): JSX.Element {
  const loop = (k: 1 | -1) =>
    `M0,0C${k * s * 0.35},${-s * 0.8} ${k * s * 1.2},${-s * 0.7} ${k * s * 1.05},${-s * 0.02}C${k * s * 1.2},${s * 0.62} ${k * s * 0.35},${s * 0.7} 0,0Z`;
  const tail = (k: 1 | -1) => `M${k * s * 0.08},${s * 0.1}L${k * s * 0.62},${s * 1.05}L${k * s * 0.42},${s * 0.92}L${k * s * 0.3},${s * 1.12}L${k * s * -0.08},${s * 0.18}Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={tail(1) + tail(-1)} fill={fill} stroke={edge} strokeWidth={s * 0.07} strokeLinejoin="round" />
      <path d={loop(1) + loop(-1)} fill={fill} stroke={edge} strokeWidth={s * 0.08} strokeLinejoin="round" />
      <path d={`M${s * 0.3},${-s * 0.32}Q${s * 0.7},${-s * 0.5} ${s * 0.86},${-s * 0.16}M${-s * 0.3},${-s * 0.32}Q${-s * 0.7},${-s * 0.5} ${-s * 0.86},${-s * 0.16}`} fill="none" stroke={shine} strokeOpacity={0.75} strokeWidth={s * 0.1} strokeLinecap="round" />
      <ellipse rx={s * 0.26} ry={s * 0.3} fill={fill} stroke={edge} strokeWidth={s * 0.08} />
      <ellipse cx={-s * 0.06} cy={-s * 0.1} rx={s * 0.09} ry={s * 0.06} fill={shine} opacity={0.8} />
    </g>
  );
}

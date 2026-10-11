import type { JSX, ReactNode } from 'react';
import { mix, shade } from '../../../components/avatar/color';

/** Shared outline ink for every sprite. */
export const INK = '#2b2420';
/** Main outline width (sprite units; a cell is 100 units). */
export const SW = 4.5;

/** Footprint of a sprite in sprite units: 100×100, 200×100 (h) or 100×200 (v). */
export interface SpriteProps {
  w: number;
  h: number;
}

export const ol = {
  stroke: INK,
  strokeWidth: SW,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

export const thin = {
  stroke: INK,
  strokeWidth: 2.6,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

/** A {base, dark, light} trio derived from one colour. */
export interface Tone {
  base: string;
  dark: string;
  deep: string;
  light: string;
}

export function tone(base: string): Tone {
  return { base, dark: shade(base, -0.2), deep: shade(base, -0.38), light: shade(base, 0.32) };
}

export { mix, shade };

/** Flat, hard-edged cartoon drop shadow as a rounded rect, offset downward. */
export function FootShadow({ x, y, w, h, rx = 12, dy = 6 }: { x: number; y: number; w: number; h: number; rx?: number; dy?: number }): JSX.Element {
  return <rect x={x} y={y + dy} width={w} height={h} rx={rx} fill={INK} opacity={0.2} />;
}

/** Flat elliptical contact shadow on the floor. */
export function GroundShadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }): JSX.Element {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} opacity={0.2} />;
}

/** A thick line with a dark outline (draws the ink stroke then the colour stroke on top). */
export function OLine({ d, color, width }: { d: string; color: string; width: number }): JSX.Element {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={width + SW * 1.6} />
      <path d={d} stroke={color} strokeWidth={width} />
    </g>
  );
}

/** Soft white highlight stroke. */
export function Shine({ d, width = 4, opacity = 0.45 }: { d: string; width?: number; opacity?: number }): JSX.Element {
  return <path d={d} fill="none" stroke="#ffffff" strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
}

/**
 * For top-down pieces that look right rotated: children draw in a horizontal L×100 frame
 * (L = long side). When the footprint is vertical the frame is rotated 90° clockwise.
 */
export function Oriented({ w, h, children }: SpriteProps & { children: (L: number) => ReactNode }): JSX.Element {
  if (h > w) return <g transform={`translate(${w} 0) rotate(90)`}>{children(h)}</g>;
  return <g>{children(w)}</g>;
}

/** Tiny deterministic PRNG so decorative scatter is stable between renders. */
export function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

import type { JSX } from 'react';
import { circ, leaf, ngon, poly, type Pt } from '../core/geom';
import type { Pen } from '../core/pen';

/** Small decorative helpers shared by the light districts (ribbon / lace / candy). */

/** A five-petal blossom. */
export function flower(pen: Pen, cx: number, cy: number, r: number, color: string, key?: string | number): JSX.Element {
  const petals: JSX.Element[] = [];
  for (let i = 0; i < 5; i++) {
    petals.push(<g key={i}>{pen.body(leaf(cx, cy, r, r * 0.9, -90 + i * 72), 'fabric', { fill: color, tex: false })}</g>);
  }
  return (
    <g key={key}>
      {petals}
      {pen.dot(cx, cy, r * 0.28, 'fruit', {})}
    </g>
  );
}

/** Disc split into alternating wedges (striped umbrella / popcorn tub / carousel canopy). */
export function wedges(pen: Pen, cx: number, cy: number, r: number, n: number, a: string, b: string): JSX.Element {
  const out: JSX.Element[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const pts: Pt[] = [[cx, cy]];
    for (let k = 0; k <= 6; k++) {
      const t = a0 + ((a1 - a0) * k) / 6;
      pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    out.push(<g key={i}>{pen.body(poly(pts), 'fabric', { fill: i % 2 ? b : a, tex: false })}</g>);
  }
  return <g>{out}</g>;
}

/** A ribbon bow (two loops and a knot). */
export function bow(pen: Pen, cx: number, cy: number, s: number, color: string): JSX.Element {
  return (
    <g>
      {pen.body(leaf(cx, cy, s, s * 0.8, 200), 'fabric', { fill: color, tex: false })}
      {pen.body(leaf(cx, cy, s, s * 0.8, -20), 'fabric', { fill: color, tex: false })}
      {pen.body(leaf(cx, cy, s * 0.8, s * 0.35, 110), 'fabric', { fill: color, tex: false })}
      {pen.body(leaf(cx, cy, s * 0.8, s * 0.35, 70), 'fabric', { fill: color, tex: false })}
      {pen.dot(cx, cy, s * 0.22, 'fabric', { fill: color })}
    </g>
  );
}

/** Foam bubbles. */
export function bubbles(pen: Pen, pts: [number, number, number][]): JSX.Element {
  return (
    <g>
      {pts.map(([x, y, r], i) => (
        <g key={i}>
          {pen.body(circ(x, y, r), 'paper', { alpha: 0.8, tex: false })}
          {pen.dot(x - r * 0.35, y - r * 0.35, Math.max(0.6, r * 0.22), 'paper', {})}
        </g>
      ))}
    </g>
  );
}

/** Ring of macarons (top view) - stack them with shrinking radii for a tower. */
export function macarons(pen: Pen, cx: number, cy: number, ring: number, n: number, size: number, offset = 0): JSX.Element {
  const out: JSX.Element[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + offset;
    out.push(<g key={i}>{pen.dot(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring, size, 'fabric', { fill: pen.tint(i + n) })}</g>);
  }
  return <g>{out}</g>;
}

/** Five-point star. */
export const star = (cx: number, cy: number, r: number) => ngon(cx, cy, r, 5, -90, r * 0.45);

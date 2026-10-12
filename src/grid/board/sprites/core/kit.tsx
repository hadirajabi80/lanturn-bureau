import type { JSX } from 'react';
import type { Material } from '../styles/types';
import { arcPts, cylSide, ell, poly, rect, seg, topFace, type Pt, type Shape } from './geom';
import type { BodyOpts, Pen } from './pen';

/**
 * Three-quarter view building blocks. Pieces stand on the floor and are seen from the front
 * and a little above: upward faces are lit (`pen.lit`), the front face carries the material,
 * recesses and undersides are shaded (`pen.shade`). Everything is plain geometry on the Pen,
 * so every district style renders it its own way.
 */

export interface BoxOpts extends BodyOpts {
  /** corner radius of the front face. */
  r?: number;
  /** the top face's back edge is narrower by this much on each side (a hint of perspective). */
  taper?: number;
  /** material of the top face (default: same). */
  topMat?: Material;
  /** fill override for the top face only. */
  topFill?: string;
}

/** A box standing on the floor: lit top face (`d` deep) above a front face, together filling x,y,w,h. */
export function box(pen: Pen, x: number, y: number, w: number, h: number, d: number, m: Material, o: BoxOpts = {}): JSX.Element {
  const { r = 2, taper = 0, topMat, topFill, ...b } = o;
  const top = topFace(x, y, w, d, taper);
  return (
    <g>
      {pen.body(rect(x, y + d, w, h - d, r), m, b)}
      {d > 0.5 && pen.body(top, topMat ?? m, { open: b.open, fill: topFill ?? b.fill, tex: false, gloss: false, glow: false, sw: 0.85 })}
      {d > 0.5 && pen.lit(top)}
    </g>
  );
}

/** An upright cylinder (or tapered tub) with its top ellipse; `h` is the height of the side. */
export function cyl(
  pen: Pen, cx: number, y: number, rx: number, ry: number, h: number, m: Material,
  o: BodyOpts & { rxB?: number; topMat?: Material; topFill?: string; noTop?: boolean } = {},
): JSX.Element {
  const { rxB, topMat, topFill, noTop, ...b } = o;
  const top = ell(cx, y, rx, ry);
  return (
    <g>
      {pen.body(cylSide(cx, y, rx, ry, h, rxB ?? rx, ry), m, b)}
      {!noTop && pen.body(top, topMat ?? m, { open: b.open, fill: topFill ?? b.fill, tex: false, gloss: false, glow: false, sw: 0.85 })}
      {!noTop && pen.lit(top)}
    </g>
  );
}

/** A straight leg (rounded foot), drawn as a body so it gets a proper outline. */
export function leg(pen: Pen, x: number, y0: number, y1: number, w: number, m: Material, o: BodyOpts & { back?: boolean } = {}): JSX.Element {
  const { back, ...b } = o;
  const s = rect(x - w / 2, y0, w, y1 - y0, Math.min(w * 0.45, 2.5));
  return (
    <g>
      {pen.body(s, m, { tex: false, gloss: false, glow: false, sw: 0.75, ...b })}
      {back && pen.shade(s, 0.8)}
    </g>
  );
}

/** A slanted leg from (x0,y0) to (x1,y1) - stools, easels, splayed tables. */
export function strut(pen: Pen, x0: number, y0: number, x1: number, y1: number, w: number, m: Material, o: { open?: boolean; back?: boolean } = {}): JSX.Element {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (w / 2);
  const ny = (dx / l) * (w / 2);
  const s = poly([[x0 + nx, y0 + ny], [x1 + nx * 0.8, y1 + ny * 0.8], [x1 - nx * 0.8, y1 - ny * 0.8], [x0 - nx, y0 - ny]]);
  return (
    <g>
      {pen.body(s, m, { open: o.open, tex: false, gloss: false, glow: false, sw: 0.75 })}
      {o.back && pen.shade(s, 0.8)}
    </g>
  );
}

/** Front half of an ellipse as an open shape (hoops, rims, seams that wrap around a cylinder). */
export function wrap(cx: number, cy: number, rx: number, ry: number): Shape {
  return poly(arcPts(cx, cy, rx, ry, 0, 180, 20), false);
}

/** Back half of an ellipse as an open shape. */
export function wrapBack(cx: number, cy: number, rx: number, ry: number): Shape {
  return poly(arcPts(cx, cy, rx, ry, 180, 360, 20), false);
}

/** A wheel seen from the side: tyre, hub and a few spokes. */
export function wheel(pen: Pen, cx: number, cy: number, r: number, m: Material = 'darkwood'): JSX.Element {
  const spokes: [Pt, Pt][] = [0, 60, 120].map((a) => {
    const t = (a * Math.PI) / 180;
    return [[cx + Math.cos(t) * r * 0.75, cy + Math.sin(t) * r * 0.75], [cx - Math.cos(t) * r * 0.75, cy - Math.sin(t) * r * 0.75]];
  });
  return (
    <g>
      {pen.body(ell(cx, cy, r, r), m, { tex: false, gloss: false, glow: true, sw: 0.85 })}
      {r > 4 && pen.lines(spokes, { fine: true })}
      {pen.stud(cx, cy, Math.max(1.2, r * 0.3))}
    </g>
  );
}

/** A little bottle (body + neck + cork) standing at (cx, base). */
export function bottle(pen: Pen, cx: number, base: number, hgt: number, wid: number, fill: string, o: { glass?: boolean } = {}): JSX.Element {
  const neck = wid * 0.38;
  const shoulder = base - hgt * 0.62;
  const body: Pt[] = [
    [cx - wid / 2, base], [cx - wid / 2, shoulder + wid * 0.3], [cx - neck / 2, shoulder - wid * 0.1],
    [cx - neck / 2, base - hgt], [cx + neck / 2, base - hgt], [cx + neck / 2, shoulder - wid * 0.1],
    [cx + wid / 2, shoulder + wid * 0.3], [cx + wid / 2, base],
  ];
  return (
    <g>
      {pen.body(poly(body), 'glass', { fill: o.glass ? undefined : fill, tex: false, gloss: false, glow: true, sw: 0.7 })}
      {pen.body(rect(cx - neck / 2 - 0.4, base - hgt - 2.2, neck + 0.8, 3, 0.8), 'darkwood', { tex: false, sw: 0.6 })}
      {wid > 5 && pen.line(seg(cx - wid / 2 + 1.6, shoulder + wid * 0.5, cx - wid / 2 + 1.6, base - 2), { color: '#ffffff', opacity: 0.55, sw: 1 })}
    </g>
  );
}

/** A candle with a flame (glows in neon, haloed elsewhere). */
export function candle(pen: Pen, cx: number, base: number, hgt: number, wid = 3.4): JSX.Element {
  return (
    <g>
      {pen.body(rect(cx - wid / 2, base - hgt, wid, hgt, 0.8), 'paper', { tex: false, sw: 0.6 })}
      {pen.body(poly([[cx, base - hgt - 6.5], [cx + 2, base - hgt - 2], [cx, base - hgt - 0.6], [cx - 2, base - hgt - 2]]), 'fire', { glow: true, tex: false, sw: 0.5 })}
    </g>
  );
}

/**
 * A long top receding from the viewer (vertical 2-cell tables, desks, counters): the far edge
 * spans `far` at y0, the near edge spans `near` at y1, with a front edge `th` thick and a sliver
 * of the right side. `at(f, t)` maps (across 0..1, depth 0 far..1 near) to a point on the top.
 */
export function recede(
  pen: Pen, far: [number, number], near: [number, number], y0: number, y1: number, th: number, m: Material, o: BodyOpts = {},
): { el: JSX.Element; at: (f: number, t: number) => Pt; top: Shape } {
  const at = (f: number, t: number): Pt => {
    const xl = far[0] + (near[0] - far[0]) * t;
    const xr = far[1] + (near[1] - far[1]) * t;
    return [xl + (xr - xl) * f, y0 + (y1 - y0) * t];
  };
  const top = poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)]);
  const side = poly([at(1, 0), [far[1] + 2, y0 + 3], [near[1] + 3, y1 + th - 2], [near[1], y1 + th], at(1, 1)]);
  const el = (
    <g>
      {pen.body(side, m, { open: o.open, fill: o.fill, tex: false, sw: 0.8 })}
      {pen.shade(side, 0.6)}
      {pen.body(rect(near[0], y1, near[1] - near[0], th, 1.5), m, { open: o.open, fill: o.fill, tex: false })}
      {pen.body(top, m, { main: true, ...o })}
      {pen.lit(top)}
    </g>
  );
  return { el, at, top };
}

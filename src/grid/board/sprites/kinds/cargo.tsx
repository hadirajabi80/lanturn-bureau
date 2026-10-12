import type { JSX } from 'react';
import { arcPts, ell, ngon, poly, rect, rotPts, rr, seg, topFace, type Pt, type Shape } from '../core/geom';
import { box, cyl, wheel, wrap } from '../core/kit';
import type { Pen } from '../core/pen';
import { bow, star } from './ornaments';

/** Cargo & travel (all blocking): crate, barrel, anchor, suitcase, trolley. */
const M = { main: true } as const;

const STENCILS = ['HPD', 'No.7', 'TEA', 'RUM', 'G&W', 'XXX', 'H.P.'];

// ───────────── crate ─────────────

export function Crate(pen: Pen): JSX.Element {
  const stencil = STENCILS[Math.floor(pen.rand() * STENCILS.length)];
  if (pen.style === 'neon') return PlasticCrates(pen);
  const x0 = 12;
  const x1 = 88;
  const top = 18;
  const d = 15;
  const y0 = top + d;
  const y1 = 88;
  const planks: [Pt, Pt][] = [1, 2, 3].map((i) => [[x0 + 1, y0 + ((y1 - y0) * i) / 4], [x1 - 1, y0 + ((y1 - y0) * i) / 4]]);
  pen.ground(50, 89, 42, 4.5);
  const frame = (
    <g>
      {pen.body(rect(x0, y0, 9, y1 - y0, 0.5), 'wood', { tex: false, sw: 0.8 })}
      {pen.body(rect(x1 - 9, y0, 9, y1 - y0, 0.5), 'wood', { tex: false, sw: 0.8 })}
      {pen.body(rect(x0, y0, x1 - x0, 8, 0.5), 'wood', { tex: false, sw: 0.8 })}
      {pen.body(rect(x0, y1 - 8, x1 - x0, 8, 0.5), 'wood', { tex: false, sw: 0.8 })}
    </g>
  );
  const nails = [[x0 + 4.5, y0 + 4], [x1 - 4.5, y0 + 4], [x0 + 4.5, y1 - 4], [x1 - 4.5, y1 - 4]].map(([x, y], i) => <g key={i}>{pen.stud(x, y, 1.4)}</g>);
  const lid = (
    <g>
      {pen.body(topFace(x0, top, x1 - x0, d, 6), 'wood', { tex: false, sw: 0.85 })}
      {pen.lit(topFace(x0, top, x1 - x0, d, 6))}
      {pen.lines([[[x0 + 3, top + d * 0.5], [x1 - 3, top + d * 0.5]]], { fine: true })}
    </g>
  );
  if (pen.style === 'rope') {
    return (
      <g>
        {pen.body(rect(x0, y0, x1 - x0, y1 - y0, 1), 'wood', M)}
        {pen.lines(planks, { fine: true })}
        {frame}
        {pen.text(50, 61, stencil, stencil.length > 3 ? 10 : 14, { opacity: 0.6, spacing: 1 })}
        {lid}
        {pen.bar(poly([[30, y1], [30, y0], [34, top]], false), 3.2, 'rope')}
        {pen.bar(poly([[x0 - 1, 70], [x1 + 1, 70]], false), 3.2, 'rope')}
        {nails}
      </g>
    );
  }
  if (pen.style === 'candy') {
    return (
      <g>
        {pen.body(rect(x0, y0, x1 - x0, y1 - y0, 3), 'wood', M)}
        {pen.lines(planks, { fine: true })}
        {pen.body(star(50, 58, 17), 'brass', { gloss: false })}
        {pen.dot(46, 54, 2, 'paper', {})}
        {pen.body(star(24, 46, 5), 'fabric', { fill: pen.tint(1) })}
        {pen.body(star(76, 76, 5), 'fabric', { fill: pen.tint(0) })}
        {pen.text(50, 81, 'PRIZE', 7.5, { color: pen.p.accent })}
        {lid}
      </g>
    );
  }
  // planked crate with an X brace
  return (
    <g>
      {pen.body(rect(x0, y0, x1 - x0, y1 - y0, 1), 'wood', M)}
      {pen.lines(planks, { fine: true })}
      {pen.bar(seg(x0 + 9, y0 + 8, x1 - 9, y1 - 8), 5, 'wood')}
      {pen.bar(seg(x1 - 9, y0 + 8, x0 + 9, y1 - 8), 5, 'wood')}
      {frame}
      {lid}
      {nails}
    </g>
  );
}

/** Neon Quarter: two stacked plastic crates with hand-holes. */
function PlasticCrates(pen: Pen): JSX.Element {
  pen.ground(50, 89, 42, 4.5);
  const crate = (y: number, k: number) => (
    <g key={k}>
      {pen.body(rect(12, y, 76, 32, 4), 'metal', M)}
      {pen.lines([1, 2, 3, 4, 5].map((i) => [[12 + i * 12.6, y + 12], [12 + i * 12.6, y + 29]] as [Pt, Pt]), { fine: true })}
      {pen.accent(rr(40, y + 3.5, 20, 5.5, 2.7), { fill: false, glow: true, sw: 1.4 })}
    </g>
  );
  return (
    <g>
      {crate(56, 0)}
      {crate(24, 1)}
      {pen.body(topFace(12, 14, 76, 10, 5), 'metal', { tex: false, sw: 0.85 })}
      {pen.shade(topFace(16, 16, 68, 7, 4), 1)}
    </g>
  );
}

// ───────────── barrel ─────────────

/** Bulging barrel side outline (top ellipse at y0, bottom at y1). */
function barrelSide(cx: number, y0: number, y1: number, r: number, bulge: number, ry: number): Shape {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const y = y0 + (y1 - y0) * t;
    const rr2 = r + bulge * Math.sin(Math.PI * t);
    left.push([cx - rr2, y]);
    right.push([cx + rr2, y]);
  }
  return poly([...left, ...arcPts(cx, y1, r, ry, 180, 0, 14).slice(1, -1), ...right.reverse(), ...arcPts(cx, y0, r, ry, 0, 180, 14).slice(1, -1)]);
}

export function Barrel(pen: Pen): JSX.Element {
  if (pen.style === 'candy') return PopcornTub(pen);
  const cx = 50;
  const y0 = 18;
  const y1 = 84;
  const r = 24;
  const bulge = 7;
  const ry = 7;
  const at = (t: number) => r + bulge * Math.sin(Math.PI * t);
  pen.ground(50, 88, 30, 5);
  if (pen.style === 'neon') {
    // oil drum
    return (
      <g>
        {cyl(pen, cx, y0, 27, ry, y1 - y0, 'metal', M)}
        {[0.33, 0.66].map((t) => <g key={t}>{pen.accent(wrap(cx, y0 + (y1 - y0) * t, 27, ry), { fill: false, sw: 2.2, glow: true })}</g>)}
        {pen.dot(cx + 12, y0, 2.6, 'metal', {})}
        {pen.text(cx, 56, 'OIL', 9, {})}
      </g>
    );
  }
  const staves: Shape[] = [-0.62, -0.3, 0, 0.3, 0.62].map((f) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push([cx + f * at(t), y0 + (y1 - y0) * t + Math.sqrt(1 - f * f) * ry * 0.95]);
    }
    return poly(pts, false);
  });
  return (
    <g>
      {pen.body(barrelSide(cx, y0, y1, r, bulge, ry), 'wood', M)}
      {staves.map((s, i) => <g key={i}>{pen.line(s, { fine: true })}</g>)}
      {[0.12, 0.36, 0.64, 0.88].map((t) => <g key={t}>{pen.accent(wrap(cx, y0 + (y1 - y0) * t, at(t) + 0.6, ry), { fill: false, sw: 2.6 })}</g>)}
      {pen.body(ell(cx, y0, r, ry), 'wood', { tex: false, sw: 0.9 })}
      {pen.lit(ell(cx, y0, r, ry))}
      {pen.lines([[[cx - 18, y0 - 2.5], [cx + 18, y0 - 2.5]], [[cx - 20, y0 + 2.5], [cx + 20, y0 + 2.5]]], { fine: true })}
      {pen.dot(cx + 8, y0, 2.6, 'darkwood', {})}
      {pen.body(rect(cx - 5, 52, 10, 7, 1.5), 'darkwood', { tex: false, sw: 0.7 })}
      {pen.style === 'rope' && pen.text(cx, 68, 'XO', 8, { opacity: 0.55 })}
    </g>
  );
}

/** Cotton Candy Pier: striped popcorn tub heaped with popcorn. */
function PopcornTub(pen: Pen): JSX.Element {
  const cx = 50;
  const y0 = 34;
  const y1 = 86;
  pen.ground(50, 88, 26, 4.5);
  const side = poly([...arcPts(cx, y1, 19, 5, 180, 0, 14), ...arcPts(cx, y0, 27, 7, 0, 180, 14)]);
  const stripes: JSX.Element[] = [];
  for (let i = -2; i <= 2; i++) {
    const tx = i / 3;
    stripes.push(<g key={i}>{pen.body(poly([[cx + tx * 27 - 3.6, y0 + 6], [cx + tx * 27 + 3.6, y0 + 6], [cx + tx * 19 + 2.6, y1 + 4], [cx + tx * 19 - 2.6, y1 + 4]]), 'fabric', { fill: pen.p.danger, tex: false, sw: 0.01, alpha: 0.95 })}</g>);
  }
  const corn: JSX.Element[] = [];
  for (let i = 0; i < 18; i++) {
    const a = Math.PI + pen.rand() * Math.PI;
    const r = Math.sqrt(pen.rand());
    const x = cx + Math.cos(a) * 24 * r;
    const y = y0 + Math.sin(a) * 18 * r;
    corn.push(<g key={i}>{pen.body(ngon(x, y, 4.4, 6, pen.rand() * 60, 3.2), 'fruit', { fill: i % 3 ? '#fff6dc' : '#ffe08a', tex: false, sw: 0.7 })}</g>);
  }
  return (
    <g>
      {pen.body(side, 'linen', { ...M, tex: false })}
      {stripes}
      {pen.body(side, 'linen', { alpha: 0, tex: false })}
      {pen.body(ell(cx, y0, 27, 7), 'fruit', { fill: '#fff1c8', tex: false })}
      {corn}
      {pen.text(cx, 62, 'POP', 9, { color: '#ffffff' })}
    </g>
  );
}

// ───────────── anchor ─────────────

export function Anchor(pen: Pen): JSX.Element {
  const coil = pen.style === 'rope';
  const cx = coil ? 42 : 50;
  const arm = poly(arcPts(cx, 50, 28, 30, 25, 155, 18), false);
  const fluke = (sx: number): Pt[] => {
    const [x, y] = arcPts(cx, 50, 28, 30, sx > 0 ? 25 : 155, sx > 0 ? 25 : 155, 1)[0];
    return [[x - sx * 3, y + 4], [x + sx * 9, y - 12], [x + sx * 4, y + 2], [x + sx * 1, y + 6]];
  };
  pen.ground(cx, 88, 30, 4);
  return (
    <g>
      {coil && (
        <g>
          {[0, 1, 2].map((i) => <g key={i}>{pen.bar(poly(arcPts(76, 84 - i * 5, 18 - i * 2.5, 6 - i * 0.6, 0, 360, 24)), 4, 'rope')}</g>)}
        </g>
      )}
      {pen.bar(seg(cx, 20, cx, 78), 7, 'metal', { main: true })}
      {pen.bar(arm, 6.5, 'metal', { main: true })}
      {pen.body(poly(fluke(1)), 'metal', { tex: false })}
      {pen.body(poly(fluke(-1)), 'metal', { tex: false })}
      {pen.body(ell(cx, 80, 5.5, 4.5), 'metal', { tex: false })}
      {pen.bar(seg(cx - 22, 26, cx + 22, 26), 4.6, 'darkwood', { main: true })}
      {pen.dot(cx - 23, 26, 3.6, 'darkwood', {})}
      {pen.dot(cx + 23, 26, 3.6, 'darkwood', {})}
      {pen.bar(ell(cx, 13, 6.5, 6.5), 3, 'metal')}
      {coil && pen.bar(poly([[cx + 5, 12], [62, 30], [70, 62], [64, 78]], false), 2.6, 'rope')}
    </g>
  );
}

// ───────────── suitcase ─────────────

export function Suitcase(pen: Pen): JSX.Element {
  if (pen.style === 'lace') return Hatboxes(pen);
  const mat = pen.style === 'neon' ? 'metal' : 'leather';
  const x0 = 16;
  const x1 = 84;
  const top = 32;
  const bottom = 86;
  pen.ground(50, 89, 38, 4.5);
  return (
    <g>
      {pen.bar(poly([[40, top], [40, top - 10], [60, top - 10], [60, top]], false), 3.4, 'leather')}
      {box(pen, x0, top - 6, x1 - x0, bottom - top + 6, 6, mat, { ...M, r: 6, taper: 2 })}
      {pen.line(seg(x0 + 1, top + 8, x1 - 1, top + 8), { fine: true })}
      {[34, 66].map((x) => (
        <g key={x}>
          {pen.accent(seg(x, top - 5, x, bottom), { fill: false, sw: 3.2 })}
          {pen.accent(rect(x - 3, top + 14, 6, 5, 1))}
        </g>
      ))}
      {[[x0 + 4, top + 2], [x1 - 4, top + 2], [x0 + 4, bottom - 4], [x1 - 4, bottom - 4]].map(([x, y], i) => <g key={i}>{pen.stud(x, y, 2.2)}</g>)}
      {/* travel stickers + a luggage tag */}
      {pen.body(ell(50, 58, 8, 6), 'paper', { fill: pen.tint(2), tex: false, sw: 0.7 })}
      {pen.body(rr(41, 68, 14, 9, 1.5), 'paper', { fill: pen.tint(4), tex: false, sw: 0.7 })}
      {pen.line(poly([[58, top - 6], [70, top + 6]], false), { fine: true })}
      {pen.body(poly(rotPts([[68, top + 4], [78, top + 4], [78, top + 18], [68, top + 18]] as Pt[], 73, top + 11, 14)), 'paper', { tex: false, sw: 0.7 })}
    </g>
  );
}

/** Boutique: stacked hatboxes tied with a ribbon bow. */
function Hatboxes(pen: Pen): JSX.Element {
  pen.ground(50, 89, 34, 4.5);
  return (
    <g>
      {cyl(pen, 50, 52, 32, 9, 32, 'leather', { ...M, tex: false })}
      {pen.pattern(rect(18, 54, 64, 32), { kind: 'lines', angle: 90, spacing: 9, sw: 3.2, color: '#ffffff', opacity: 0.45 })}
      {pen.line(wrap(50, 58, 32, 9), { fine: true })}
      {cyl(pen, 48, 30, 21, 6, 20, 'fabric', { fill: pen.tint(0) })}
      {pen.line(wrap(48, 35, 21, 6), { fine: true })}
      {pen.accent(seg(48, 30, 48, 56), { fill: false, sw: 2.6 })}
      {bow(pen, 48, 26, 9, pen.p.accent2)}
    </g>
  );
}

// ───────────── trolley ─────────────

export function Trolley(pen: Pen): JSX.Element {
  if (pen.style === 'candy') return FlossCart(pen);
  const frame = pen.style === 'deco' || pen.style === 'marble' || pen.style === 'steel' || pen.style === 'lace' || pen.style === 'ribbon' ? 'brass' : 'metal';
  pen.ground(50, 89, 40, 4.5);
  return (
    <g>
      {/* bellhop cart: arched rail over a carpeted deck */}
      {pen.bar(poly([[14, 72], [14, 20], ...arcPts(50, 20, 36, 12, 180, 360, 14).slice(1, -1), [86, 20], [86, 72]], false), 3.4, frame, { main: true })}
      {pen.bar(seg(14, 32, 86, 32), 2.2, frame)}
      {/* luggage */}
      {pen.body(rr(20, 42, 36, 30, 3), 'leather', { fill: pen.tint(0), sw: 0.9 })}
      {pen.accent(seg(30, 42, 30, 72), { fill: false, sw: 2 })}
      {pen.accent(seg(46, 42, 46, 72), { fill: false, sw: 2 })}
      {pen.bar(poly([[32, 42], [32, 38], [44, 38], [44, 42]], false), 2, 'leather')}
      {cyl(pen, 68, 52, 13, 4, 18, 'fabric', { fill: pen.tint(1), tex: false })}
      {pen.body(rr(56, 34, 22, 14, 3), 'leather', { fill: pen.tint(3), sw: 0.8 })}
      {pen.accent(rect(64, 31, 6, 3, 1))}
      {box(pen, 8, 68, 84, 14, 6, 'fabric', { r: 1.5, taper: 2, fill: pen.style === 'blueprint' ? undefined : pen.style === 'neon' ? undefined : pen.tint(pen.style === 'ink' ? 0 : 5), tex: false })}
      {pen.accent(rect(8, 76, 84, 3, 1))}
      {wheel(pen, 18, 84, 5)}
      {wheel(pen, 82, 84, 5)}
    </g>
  );
}

/** Cotton Candy Pier: candy-floss cart under a striped parasol. */
function FlossCart(pen: Pen): JSX.Element {
  pen.ground(50, 89, 38, 4.5);
  const wedgePts = (i: number, n: number): Pt[] => {
    const a0 = 180 + (180 / n) * i;
    const a1 = 180 + (180 / n) * (i + 1);
    return [[50, 6], ...arcPts(50, 28, 40, 9, a0, a1, 4).map(([x, y]) => [x, y + 0] as Pt)];
  };
  const n = 8;
  return (
    <g>
      {pen.bar(seg(50, 6, 50, 52), 2.6, 'metal')}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{pen.body(poly(wedgePts(i, n)), 'fabric', { fill: i % 2 ? '#ffffff' : pen.p.accent, tex: false, sw: 0.8, main: i === 0 })}</g>
      ))}
      {pen.body(poly(arcPts(50, 28, 40, 9, 0, 180, 16)), 'fabric', { fill: pen.p.accent, tex: false, sw: 0.8 })}
      {[[30, 48, 8], [42, 44, 7], [70, 47, 8]].map(([x, y, r], i) => (
        <g key={i}>
          {pen.bar(seg(x, y, x, 56), 1.6, 'paper')}
          {pen.body(ngon(x, y, r, 7, i * 20, r * 0.8), 'fabric', { fill: i === 1 ? pen.tint(1) : pen.tint(4), tex: false, sw: 0.8 })}
        </g>
      ))}
      {box(pen, 14, 52, 72, 30, 8, 'wood', { r: 3, taper: 2 })}
      {pen.text(50, 70, 'FLOSS', 8, { color: pen.p.accent })}
      {wheel(pen, 24, 83, 6)}
      {wheel(pen, 76, 83, 6)}
    </g>
  );
}


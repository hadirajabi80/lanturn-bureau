import type { JSX } from 'react';
import { ell, inset, leaf, ngon, poly, rect, seg, type Pt, type Shape } from '../core/geom';
import type { Pen } from '../core/pen';
import { bubbles, flower } from './ornaments';
import { fan } from './seating';

/** Things you lie on or in: rug, bed, bathtub (occupiable) and the coffin (blocking). */
const O = { open: true } as const;
const M = { open: true, main: true } as const;

export function Rug(pen: Pen, L: number): JSX.Element {
  const fr: [Pt, Pt][] = [];
  for (let y = 16; y <= 84; y += 6) {
    fr.push([[10, y], [4, y]]);
    fr.push([[L - 10, y], [L - 4, y]]);
  }
  const cx = L / 2;
  const rx = Math.min(L * 0.2, 34);
  const floral = pen.style === 'ribbon' || pen.style === 'lace';
  const med: Shape =
    pen.style === 'deco' || pen.style === 'neon'
      ? poly([[cx - rx, 50], [cx, 28], [cx + rx, 50], [cx, 72]])
      : ell(cx, 50, rx, 18);
  return (
    <g>
      {pen.lines(fr, { fine: true })}
      {pen.body(rect(10, 10, L - 20, 80, 3), 'fabric', { ...M, fill: pen.tint(0), alpha: 0.85, tex: pen.style !== 'lace' })}
      {pen.line(rect(17, 17, L - 34, 66, 2), { fine: true })}
      {pen.line(rect(21, 21, L - 42, 58, 1), { fine: true, dash: '1.5 3' })}
      {floral ? floralField(pen, L) : pen.line(med, { fine: true })}
      {!floral && pen.line(inset(med, 7), { fine: true, dash: '2 2.5' })}
      {pen.style === 'deco' && pen.lines(fan(cx, 50, 16, 5), { fine: true })}
    </g>
  );
}

/** Rosewater / boutique rug: a little garden of blossoms and leaves. */
function floralField(pen: Pen, L: number): JSX.Element {
  const cx = L / 2;
  const spots: [number, number, number][] =
    L >= 200
      ? [[cx, 50, 10], [cx - 52, 33, 7], [cx + 52, 67, 7], [cx - 50, 68, 6], [cx + 50, 32, 6], [cx - 24, 30, 4.5], [cx + 26, 70, 4.5]]
      : [[50, 50, 10], [30, 32, 5], [70, 68, 5], [30, 68, 4.5], [70, 32, 4.5]];
  return (
    <g>
      {spots.map(([x, y, r], i) => (
        <g key={`l${i}`}>
          {pen.body(leaf(x, y, r * 1.9, r * 0.9, 30 + i * 70), 'leaf', { tex: false })}
          {pen.body(leaf(x, y, r * 1.7, r * 0.8, 200 + i * 70), 'leaf', { tex: false })}
        </g>
      ))}
      {spots.map(([x, y, r], i) => flower(pen, x, y, r, pen.tint(i % 2 ? 3 : 0 + i), `f${i}`))}
    </g>
  );
}

export function Bed(pen: Pen, L: number): JSX.Element {
  const dbl = L >= 200;
  const x0 = dbl ? 64 : 44;
  const wood = pen.style === 'steel' ? 'darkwood' : 'wood';
  return (
    <g>
      {/* headboard + frame */}
      {pen.body(rect(4, 6, 12, 88, 4), wood, O)}
      {pen.style === 'deco' && pen.lines([[[10, 14], [10, 86]]], { fine: true })}
      {pen.body(rect(12, 8, L - 18, 84, 6), wood, O)}
      {/* mattress */}
      {pen.body(rect(15, 11, L - 24, 78, 5), 'linen', M)}
      {/* pillows */}
      {dbl ? (
        <g>
          {pen.body(rect(20, 15, 32, 33, 9), 'linen', O)}
          {pen.body(rect(20, 52, 32, 33, 9), 'linen', O)}
        </g>
      ) : (
        pen.body(rect(18, 20, 22, 60, 8), 'linen', O)
      )}
      {/* blanket with turned-down sheet */}
      {pen.body(rect(x0, 11, L - 9 - x0, 78, 4), 'fabric', { ...O, fill: pen.style === 'blueprint' ? undefined : pen.tint(pen.style === 'deco' ? 1 : 0), alpha: 0.9 })}
      {pen.body(rect(x0, 11, 11, 78, 2), 'linen', O)}
      {pen.line(seg(x0 + 20, 16, x0 + 20, 84), { fine: true, dash: '2 3' })}
      {pen.line(seg(L - 18, 16, L - 18, 84), { fine: true, dash: '2 3' })}
    </g>
  );
}

export function Bathtub(pen: Pen, L: number): JSX.Element {
  const big = L >= 200;
  const outer = big ? rect(6, 12, L - 12, 76, 30) : rect(8, 12, 84, 76, 26);
  const inner = big ? rect(15, 21, L - 32, 58, 24) : rect(16, 20, 64, 60, 20);
  const tx = big ? L - 14 : 86;
  const sweet = pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';
  if (sweet) {
    // clawfoot tub with foam bubbles
    const x0 = big ? 12 : 12;
    const x1 = big ? L - 12 : 88;
    const feet: Pt[] = [[x0 + 8, 20], [x1 - 8, 20], [x0 + 8, 80], [x1 - 8, 80]];
    const bub: [number, number, number][] = big
      ? [[60, 40, 6], [70, 52, 4.5], [86, 44, 5], [104, 58, 6.5], [118, 42, 4], [96, 62, 3.5], [130, 56, 5], [76, 64, 3.2]]
      : [[40, 42, 5.5], [52, 54, 4], [62, 42, 3.5], [36, 58, 3.5], [58, 64, 4.5]];
    return (
      <g>
        {feet.map(([x, y], i) => (
          <g key={i}>{pen.accent(leaf(x, y, 10, 7, [225, 315, 135, 45][i]))}</g>
        ))}
        {pen.body(rect(x0, 16, x1 - x0, 68, 34), 'ceramic', M)}
        {pen.body(rect(x0 + 8, 24, x1 - x0 - 16, 52, 26), 'water', { open: true, alpha: 0.9 })}
        {bubbles(pen, bub)}
        {pen.accent(rect(x1 - 12, 46, 8, 8, 2))}
        {pen.stud(x1 - 8, 39, 2.6)}
        {pen.stud(x1 - 8, 61, 2.6)}
      </g>
    );
  }
  return (
    <g>
      {pen.body(outer, 'ceramic', M)}
      {pen.body(inner, 'water', { open: true, alpha: 0.85 })}
      {pen.line(inset(inner, 6), { fine: true, opacity: 0.35 })}
      {pen.dot(big ? L - 34 : 64, 50, 2.6, 'metal', O)}
      {pen.accent(rect(tx - 4, 46, 8, 8, 2))}
      {pen.stud(tx, 38, 3)}
      {pen.stud(tx, 62, 3)}
    </g>
  );
}

export function Coffin(pen: Pen, L: number): JSX.Element {
  const sx = L * 0.28;
  const outline: Pt[] = [[6, 50], [sx, 10], [L - 8, 24], [L - 8, 76], [sx, 90]];
  const lid: Pt[] = [[14, 50], [sx, 18], [L - 15, 29], [L - 15, 71], [sx, 82]];
  const yTop = (x: number) => 10 + ((x - sx) * 14) / (L - 8 - sx);
  const handles = [0.5, 0.75].map((t) => sx + (L - 8 - sx) * t);
  const cross = L >= 200;
  return (
    <g>
      {pen.body(poly(outline), 'darkwood', { main: true })}
      {pen.body(poly(lid), 'wood', { alpha: 0.85 })}
      {pen.shade(poly([[6, 50], [sx, 90], [L - 8, 76], [L - 8, 72], [sx, 84], [12, 50]]), 0.9)}
      {handles.map((x, i) => (
        <g key={i}>
          {pen.accent(rect(x - 6, yTop(x) - 3, 12, 4, 1.5))}
          {pen.accent(rect(x - 6, 100 - yTop(x) - 1, 12, 4, 1.5))}
        </g>
      ))}
      {cross ? (
        <g>
          {pen.accent(rect(L * 0.3, 47, L * 0.36, 6, 1))}
          {pen.accent(rect(L * 0.4, 36, 6, 28, 1))}
        </g>
      ) : (
        pen.accent(ngon(L * 0.52, 50, 7, 4, 0))
      )}
    </g>
  );
}

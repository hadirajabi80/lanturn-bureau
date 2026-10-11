import type { JSX } from 'react';
import { arc, circ, ell, poly, rect, rotPts, seg, type Pt } from '../core/geom';
import type { Pen } from '../core/pen';
import type { Material } from '../styles/types';

/**
 * Seating - every piece here is OCCUPIABLE, so all parts are drawn `open`
 * (light, airy, no cast shadow) and the seat itself is left clear for a pin.
 */
const O = { open: true } as const;
const M = { open: true, main: true } as const;

/** Upholstery material per style (wood slats in the docks, plush on the train...). */
function seatMat(pen: Pen): Material {
  if (pen.style === 'rope' || pen.style === 'ink') return 'wood';
  if (pen.style === 'neon') return 'metal';
  return 'fabric';
}

export function Chair(pen: Pen): JSX.Element {
  if (pen.style === 'ribbon' || pen.style === 'candy') {
    // striped cafe chair: bentwood hoop back, round striped cushion
    const stripe = pen.style === 'ribbon' ? pen.p.accent : pen.tint(1);
    return (
      <g>
        {pen.bar(arc(50, 54, 30, 198, 342), 4, 'wood', { open: true })}
        {pen.body(circ(50, 54, 24), 'fabric', { ...M, fill: '#ffffff', tex: false })}
        {pen.pattern(circ(50, 54, 21), { kind: 'lines', angle: 90, spacing: 8, sw: 3.6, color: stripe, opacity: 0.5 })}
        {pen.line(circ(50, 54, 15), { fine: true, dash: '2 2' })}
      </g>
    );
  }
  if (pen.style === 'neon') {
    // chrome bar stool with a low curved back
    return (
      <g>
        {pen.body(circ(50, 54, 24), 'metal', M)}
        {pen.line(circ(50, 54, 16), { fine: true })}
        {pen.accent(arc(50, 54, 30, 205, 335), { fill: false, sw: 3, glow: true })}
        {pen.dot(50, 54, 3, 'metal', O)}
      </g>
    );
  }
  if (pen.style === 'steel') {
    // dining-car chair: upholstered wing back, lace antimacassar
    return (
      <g>
        {pen.body(rect(20, 12, 60, 20, 8), 'fabric', O)}
        {pen.body(rect(36, 15, 28, 10, 2), 'linen', { open: true, alpha: 1.1 })}
        {pen.body(rect(23, 28, 54, 54, 10), 'fabric', M)}
      </g>
    );
  }
  const mat = seatMat(pen);
  return (
    <g>
      {/* back rail with two posts */}
      {pen.body(rect(22, 14, 56, 12, 5), mat === 'fabric' ? 'wood' : mat, O)}
      {pen.dot(26, 20, 4.5, 'wood', O)}
      {pen.dot(74, 20, 4.5, 'wood', O)}
      {/* seat */}
      {pen.body(rect(25, 28, 50, 52, 9), mat, M)}
      {pen.line(rect(31, 34, 38, 40, 6), { fine: true, dash: mat === 'fabric' ? '2 2.5' : undefined })}
      {mat === 'wood' && pen.lines([[[34, 44], [66, 44]], [[34, 54], [66, 54]], [[34, 64], [66, 64]]], { fine: true, opacity: 0.35 })}
    </g>
  );
}

export function Armchair(pen: Pen): JSX.Element {
  const mat: Material = pen.style === 'rope' ? 'leather' : 'fabric';
  return (
    <g>
      {pen.body(rect(14, 12, 72, 24, 10), mat, O)}
      {pen.style === 'deco' && pen.lines(fan(50, 34, 20, 7), { fine: true })}
      {pen.style === 'steel' && pen.body(rect(36, 15, 28, 11, 2), 'linen', O)}
      {pen.body(rect(12, 26, 18, 60, 8), mat, O)}
      {pen.body(rect(70, 26, 18, 60, 8), mat, O)}
      {pen.body(rect(28, 32, 44, 52, 8), mat, M)}
      {pen.line(seg(32, 76, 68, 76), { fine: true })}
      {pen.style === 'rope' && [pen.stud(17, 30, 1.5), pen.stud(83, 30, 1.5)].map((e, i) => <g key={i}>{e}</g>)}
    </g>
  );
}

/** Deco sunburst rays inside a half-disc (used on backs, headboards, mantels). */
export function fan(cx: number, cy: number, r: number, n: number): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  for (let i = 0; i < n; i++) {
    const a = ((180 + (180 / (n - 1)) * i) * Math.PI) / 180;
    out.push([[cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.25], [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]]);
  }
  return out;
}

export function Sofa(pen: Pen, L: number): JSX.Element {
  if (pen.style === 'lace' && L >= 200) {
    // tufted velvet chaise longue: scrolled head end, back along part of the length, bolster
    return (
      <g>
        {pen.body(rect(8, 10, L * 0.68, 22, 11), 'fabric', O)}
        {pen.body(rect(6, 14, 30, 74, 15), 'fabric', O)}
        {pen.body(rect(22, 28, L - 30, 58, 18), 'fabric', M)}
        {pen.body(ell(32, 57, 8, 22), 'fabric', { open: true, fill: pen.tint(1) })}
        {pen.lines([[[26, 45], [38, 45]], [[25, 57], [39, 57]], [[26, 69], [38, 69]]], { fine: true })}
      </g>
    );
  }
  const mat: Material = pen.style === 'rope' ? 'leather' : 'fabric';
  const n = L >= 200 ? 3 : 2;
  const x0 = 24;
  const cw = (L - 48) / n;
  const pillow = poly(rotPts([[x0 + 4, 34], [x0 + 22, 32], [x0 + 24, 50], [x0 + 6, 52]] as Pt[], x0 + 14, 42, -12));
  return (
    <g>
      {pen.body(rect(8, 10, L - 16, 24, 10), mat, O)}
      {pen.style === 'steel' && Array.from({ length: n }, (_, i) => (
        <g key={i}>{pen.body(rect(x0 + i * cw + cw / 2 - 12, 13, 24, 10, 2), 'linen', O)}</g>
      ))}
      {pen.body(rect(6, 22, 20, 66, 9), mat, O)}
      {pen.body(rect(L - 26, 22, 20, 66, 9), mat, O)}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{pen.body(rect(x0 + i * cw + 1, 30, cw - 2, 56, 7), mat, M)}</g>
      ))}
      {pen.body(pillow, 'fabric', { open: true, fill: pen.tint(1), alpha: 0.8 })}
    </g>
  );
}

export function Stool(pen: Pen): JSX.Element {
  const soft = pen.style === 'steel' || pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';
  const mat: Material = pen.style === 'neon' ? 'metal' : soft ? 'fabric' : pen.style === 'deco' ? 'leather' : 'wood';
  const legs: Pt[] = [-90, 30, 150].map((a) => [50 + Math.cos((a * Math.PI) / 180) * 29, 50 + Math.sin((a * Math.PI) / 180) * 29]);
  return (
    <g>
      {legs.map(([x, y], i) => (
        <g key={i}>{pen.dot(x, y, 3.6, pen.style === 'neon' ? 'metal' : 'wood', O)}</g>
      ))}
      {pen.body(circ(50, 50, 24), mat, M)}
      {pen.line(circ(50, 50, 15), { fine: true, dash: mat === 'fabric' ? '2 2' : undefined })}
      {pen.style === 'neon' && pen.accent(circ(50, 50, 28), { fill: false, sw: 1.2, glow: true })}
    </g>
  );
}

export function Bench(pen: Pen, L: number): JSX.Element {
  if (pen.style === 'steel') {
    // compartment bench: plush seat + back, brass luggage rail above, antimacassars
    const n = L >= 200 ? 3 : 2;
    const cw = (L - 12) / n;
    return (
      <g>
        {pen.bar(seg(10, 7, L - 10, 7), 2.4, 'brass')}
        {pen.body(rect(6, 10, L - 12, 24, 8), 'fabric', O)}
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>{pen.body(rect(6 + i * cw + cw / 2 - 11, 13, 22, 11, 2), 'linen', O)}</g>
        ))}
        {pen.body(rect(6, 30, L - 12, 56, 8), 'fabric', M)}
        {pen.lines(Array.from({ length: n - 1 }, (_, i) => [[6 + (i + 1) * cw, 33], [6 + (i + 1) * cw, 83]] as [Pt, Pt]), { fine: true })}
      </g>
    );
  }
  if (pen.style === 'marble' || pen.style === 'deco' || pen.style === 'ribbon' || pen.style === 'lace') {
    // gallery ottoman: buttoned leather on a slim frame
    return (
      <g>
        {pen.body(rect(6, 24, L - 12, 52, 6), 'wood', O)}
        {pen.body(rect(10, 28, L - 20, 44, 5), pen.style === 'marble' ? 'leather' : 'fabric', M)}
        {pen.lines(Array.from({ length: Math.round(L / 25) - 1 }, (_, i) => [[10 + ((i + 1) * (L - 20)) / Math.round(L / 25), 30], [10 + ((i + 1) * (L - 20)) / Math.round(L / 25), 70]] as [Pt, Pt]), { fine: true, dash: '2 3' })}
      </g>
    );
  }
  // slatted bench with a back rail and iron ends
  const mat: Material = pen.style === 'neon' ? 'metal' : pen.style === 'candy' ? 'fabric' : 'wood';
  return (
    <g>
      {pen.body(rect(8, 16, L - 16, 11, 3), mat, O)}
      {pen.body(rect(8, 32, L - 16, 48, 4), mat, M)}
      {pen.lines([[[10, 44], [L - 10, 44]], [[10, 56], [L - 10, 56]], [[10, 68], [L - 10, 68]]], { fine: true })}
      {pen.accent(rect(14, 26, 6, 58, 2), { sw: 0.8 })}
      {pen.accent(rect(L - 20, 26, 6, 58, 2), { sw: 0.8 })}
      {L >= 200 && pen.accent(rect(L / 2 - 3, 26, 6, 58, 2), { sw: 0.8 })}
    </g>
  );
}


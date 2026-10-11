import type { JSX } from 'react';
import { circ, ell, heart, ngon, poly, rect, seg, type Pt } from '../core/geom';
import type { Pen } from '../core/pen';

/** Storage (all blocking): bookshelf, cabinet, fridge, safe, bin. */
const M = { main: true } as const;

/** A run of book tops between x0..x1, spines against `wallY`, growing towards `dir`. */
function books(pen: Pen, x0: number, x1: number, wallY: number, dir: 1 | -1): JSX.Element[] {
  const out: JSX.Element[] = [];
  let x = x0;
  let i = 0;
  while (x < x1 - 4) {
    const w = Math.min(x1 - x, 4 + pen.rand() * 5);
    const depth = 17 + pen.rand() * 7;
    const y = dir === 1 ? wallY : wallY - depth;
    const tilt = pen.rand() < 0.08;
    out.push(<g key={i}>{pen.body(rect(x, y, w - 0.8, depth, 0.6), 'paper', { fill: pen.tint(i + Math.floor(pen.rand() * 3)), alpha: tilt ? 0.6 : 1 })}</g>);
    x += w + (pen.rand() < 0.12 ? 3 : 0);
    i++;
  }
  return out;
}

export function Bookshelf(pen: Pen, L: number): JSX.Element {
  if (pen.style === 'steel') {
    // luggage rack: brass rails with suitcases
    const cases: JSX.Element[] = [];
    let x = 12;
    let i = 0;
    while (x < L - 30) {
      const w = 26 + pen.rand() * 16;
      if (x + w > L - 10) break;
      cases.push(
        <g key={i}>
          {pen.body(rect(x, 22 + pen.rand() * 6, w, 50, 5), 'leather', { fill: pen.tint(i * 3) })}
          {pen.accent(rect(x + w / 2 - 5, 18 + 2, 10, 4, 1.5))}
          {pen.line(seg(x + 6, 26, x + 6, 70), { fine: true })}
          {pen.line(seg(x + w - 6, 26, x + w - 6, 70), { fine: true })}
        </g>,
      );
      x += w + 6;
      i++;
    }
    return (
      <g>
        {pen.body(rect(4, 12, L - 8, 76, 3), 'metal', { ...M, alpha: 0.55 })}
        {pen.lines([0, 1, 2, 3, 4, 5].map((k) => [[8, 20 + k * 12], [L - 8, 20 + k * 12]] as [Pt, Pt]), { sw: 2 })}
        {cases}
        {pen.bar(seg(6, 14, L - 6, 14), 3, 'brass')}
        {pen.bar(seg(6, 86, L - 6, 86), 3, 'brass')}
      </g>
    );
  }
  // free-standing double-sided bookcase: books seen from above on both faces
  const n = Math.max(1, Math.round((L - 8) / 48));
  const bay = (L - 8) / n;
  const bays: JSX.Element[] = [];
  for (let b = 0; b < n; b++) {
    const x0 = 4 + b * bay + 4;
    const x1 = 4 + (b + 1) * bay - 4;
    bays.push(<g key={`t${b}`}>{books(pen, x0, x1, 49, -1)}</g>);
    bays.push(<g key={`b${b}`}>{books(pen, x0, x1, 51, 1)}</g>);
  }
  const uprights: JSX.Element[] = [];
  for (let b = 0; b <= n; b++) uprights.push(<g key={b}>{pen.body(rect(4 + b * bay - (b === 0 ? 0 : b === n ? 4 : 2), 20, 4, 60, 0.5), 'wood', {})}</g>);
  return (
    <g>
      {pen.body(rect(4, 20, L - 8, 60, 2), 'wood', M)}
      {pen.shade(rect(6, 22, L - 12, 56, 0), 0.6)}
      {bays}
      {pen.body(rect(4, 48.5, L - 8, 3, 0), 'darkwood', {})}
      {uprights}
    </g>
  );
}

export function Cabinet(pen: Pen, L: number): JSX.Element {
  if (pen.style === 'lace') {
    // gilded vanity: dressing table with an oval mirror against the wall, perfume & pearls
    const cx = L / 2;
    const mw = Math.min(L * 0.32, 44);
    const bottles: [number, number, number][] = L >= 200 ? [[cx - 60, 52, 0], [cx - 48, 60, 1], [cx + 52, 50, 2]] : [[22, 54, 0], [80, 56, 2]];
    const pearls: JSX.Element[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = ((200 - i * 22) * Math.PI) / 180;
      pearls.push(<g key={i}>{pen.dot(cx + 10 + Math.cos(a) * 14, 62 - Math.sin(a) * 8, 1.7, 'paper', {})}</g>);
    }
    return (
      <g>
        {pen.body(rect(6, 26, L - 12, 54, 8), 'wood', M)}
        {pen.accent(ell(cx, 22, mw + 5, 15))}
        {pen.glass(ell(cx, 22, mw, 11))}
        {pen.accent(ngon(cx, 7, 5, 4, 0))}
        {bottles.map(([x, y, t], i) => (
          <g key={i}>
            {pen.body(circ(x, y, 6), 'glass', { gloss: true })}
            {pen.dot(x, y, 2.6, 'fabric', { fill: pen.tint(t) })}
          </g>
        ))}
        {pen.body(circ(L >= 200 ? cx - 22 : 36, 66, 6.5), 'fabric', { fill: pen.tint(1) })}
        {pearls}
      </g>
    );
  }
  if (pen.style === 'marble' || pen.style === 'deco' || pen.style === 'ribbon' || pen.style === 'candy') {
    // display vitrine: frame, exhibits under glass
    const n = L >= 200 ? 3 : 1;
    return (
      <g>
        {pen.body(rect(6, 14, L - 12, 72, 3), pen.style === 'deco' ? 'darkwood' : 'wood', M)}
        {Array.from({ length: n }, (_, i) => {
          const cx = 6 + ((L - 12) * (i + 0.5)) / n;
          return (
            <g key={i}>
              {i % 3 === 0 && pen.body(ell(cx, 50, 9, 9), 'ceramic', {})}
              {i % 3 === 0 && pen.line(circ(cx, 50, 4), { fine: true })}
              {i % 3 === 1 && pen.body(ngon(cx, 50, 10, 6, 0), 'brass', {})}
              {i % 3 === 2 && pen.body(rect(cx - 12, 42, 24, 16, 1), 'paper', {})}
            </g>
          );
        })}
        {pen.glass(rect(12, 20, L - 24, 60, 1.5))}
        {pen.lines(Array.from({ length: n - 1 }, (_, i) => [[6 + ((L - 12) * (i + 1)) / n, 20], [6 + ((L - 12) * (i + 1)) / n, 80]] as [Pt, Pt]), {})}
        {pen.accent(rect(L / 2 - 8, 82, 16, 4, 1))}
      </g>
    );
  }
  // tall cabinet in plan convention: carcass with a diagonal cross, doors along the front
  const doors = L >= 200 ? 4 : 2;
  const dw = (L - 12) / doors;
  const yF = 76;
  return (
    <g>
      {pen.body(rect(6, 12, L - 12, yF - 12, 2), pen.style === 'steel' ? 'darkwood' : 'wood', M)}
      {pen.lines([[[10, 16], [L - 10, yF - 4]], [[L - 10, 16], [10, yF - 4]]], { fine: true, opacity: 0.55 })}
      {pen.body(rect(6, yF - 4, L - 12, 10, 1), 'wood', {})}
      {pen.lines(Array.from({ length: doors - 1 }, (_, i) => [[6 + dw * (i + 1), yF - 4], [6 + dw * (i + 1), yF + 6]] as [Pt, Pt]), {})}
      {Array.from({ length: doors / 2 }, (_, i) => {
        const x = 6 + dw * (i * 2 + 1);
        return (
          <g key={i}>
            {pen.stud(x - 4, yF + 1, 1.8)}
            {pen.stud(x + 4, yF + 1, 1.8)}
          </g>
        );
      })}
    </g>
  );
}

export function Fridge(pen: Pen, L: number): JSX.Element {
  const big = L >= 200;
  const mat = pen.style === 'ink' || pen.style === 'rope' ? 'ceramic' : 'metal';
  const pink = pen.style === 'ribbon' ? '#ffb3cf' : undefined;
  return (
    <g>
      {pen.body(rect(8, 10, L - 16, 74, 7), mat, { ...M, fill: pink })}
      {pink && pen.body(heart(big ? L / 2 + 30 : 66, 50, 12), 'fabric', { fill: pen.p.accent, gloss: false })}
      {/* compressor grille at the back */}
      {pen.lines(Array.from({ length: big ? 9 : 4 }, (_, i) => [[18 + i * 9, 16], [18 + i * 9, 26]] as [Pt, Pt]), { fine: true })}
      {big && pen.line(seg(L / 2, 30, L / 2, 84), {})}
      {pen.body(rect(8, 80, L - 16, 8, 2), mat, { alpha: 0.9 })}
      {big ? (
        <g>
          {pen.accent(rect(L / 2 - 14, 86, 10, 4, 1.5), { glow: pen.style === 'neon' })}
          {pen.accent(rect(L / 2 + 4, 86, 10, 4, 1.5), { glow: pen.style === 'neon' })}
        </g>
      ) : (
        pen.accent(rect(62, 86, 18, 4, 1.5), { glow: pen.style === 'neon' })
      )}
      {pen.body(rect(big ? 30 : 30, 40, 18, 12, 1), 'paper', { fill: pen.tint(2), alpha: 0.9 })}
    </g>
  );
}

export function Safe(pen: Pen): JSX.Element {
  if (pen.style === 'marble') {
    // jewel strongbox under glass
    return (
      <g>
        {pen.body(rect(14, 14, 72, 72, 4), 'metal', M)}
        {pen.body(rect(22, 22, 56, 56, 2), 'fabric', { alpha: 0.9 })}
        {pen.body(ngon(50, 50, 10, 8, 0, 6), 'glass', {})}
        {pen.accent(ngon(50, 50, 4, 4, 0))}
        {pen.glass(rect(22, 22, 56, 56, 2))}
        {pen.stud(18, 18, 2)}
        {pen.stud(82, 18, 2)}
        {pen.stud(18, 82, 2)}
        {pen.stud(82, 82, 2)}
      </g>
    );
  }
  const ticks: [Pt, Pt][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return [[40 + Math.cos(a) * 10, 50 + Math.sin(a) * 10], [40 + Math.cos(a) * 13, 50 + Math.sin(a) * 13]];
  });
  const spokes: [Pt, Pt][] = [0, 120, 240].map((d) => {
    const a = (d * Math.PI) / 180;
    return [[68, 50], [68 + Math.cos(a) * 10, 50 + Math.sin(a) * 10]];
  });
  return (
    <g>
      {pen.body(rect(14, 14, 72, 72, 5), 'metal', M)}
      {pen.line(rect(20, 20, 60, 60, 3), {})}
      {pen.accent(rect(12, 26, 5, 12, 1))}
      {pen.accent(rect(12, 62, 5, 12, 1))}
      {pen.body(circ(40, 50, 13), 'metal', { gloss: true })}
      {pen.lines(ticks, { fine: true })}
      {pen.accent(circ(40, 50, 6))}
      {pen.lines(spokes, { sw: 2.6 })}
      {pen.accent(circ(68, 50, 3.5))}
    </g>
  );
}

export function Bin(pen: Pen): JSX.Element {
  const mat = pen.style === 'rope' ? 'wood' : 'metal';
  return (
    <g>
      {pen.body(circ(50, 52, 25), mat, M)}
      {pen.line(circ(50, 52, 20.5), { fine: true })}
      {pen.shade(circ(50, 52, 20), 1.1)}
      {pen.body(ngon(45, 49, 8, 7, 10, 5.5), 'paper', {})}
      {pen.body(ngon(57, 58, 6, 6, 30, 4), 'paper', {})}
      {pen.body(poly([[52, 40], [62, 42], [60, 48], [50, 46]]), 'paper', { fill: pen.tint(4) })}
    </g>
  );
}

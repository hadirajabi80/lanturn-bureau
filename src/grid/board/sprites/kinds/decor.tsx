import type { JSX } from 'react';
import { arc, circ, ell, leaf, ngon, poly, rect, seg, type Pt, type Shape } from '../core/geom';
import type { Pen } from '../core/pen';
import { flower } from './ornaments';
import { fan } from './seating';

/** Decor & curiosities (all blocking): plant, bananas, lamp, statue, globe, easel, fireplace. */
const M = { main: true } as const;

export function Plant(pen: Pen): JSX.Element {
  const n = 7;
  const leaves: JSX.Element[] = [];
  const ribs: [Pt, Pt][] = [];
  const a0 = pen.rand() * 360;
  for (let i = 0; i < n; i++) {
    const a = a0 + (360 / n) * i + pen.rand() * 18;
    const len = 30 + pen.rand() * 7;
    const rad = (a * Math.PI) / 180;
    leaves.push(<g key={i}>{pen.body(leaf(50, 50, len, 14, a), 'leaf', { tex: false, glow: true })}</g>);
    ribs.push([[50 + Math.cos(rad) * 6, 50 + Math.sin(rad) * 6], [50 + Math.cos(rad) * len * 0.8, 50 + Math.sin(rad) * len * 0.8]]);
  }
  return (
    <g>
      {pen.body(circ(50, 50, 21), 'ceramic', M)}
      {pen.body(circ(50, 50, 16.5), 'soil', {})}
      {leaves}
      {pen.lines(ribs, { fine: true })}
      {pen.body(leaf(50, 50, 14, 8, a0 + 25), 'leaf', {})}
      {(pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy') &&
        [0, 2, 4].map((i) => {
          const a = ((a0 + (360 / n) * i + 10) * Math.PI) / 180;
          return flower(pen, 50 + Math.cos(a) * 24, 50 + Math.sin(a) * 24, 6, pen.tint(i), i);
        })}
    </g>
  );
}

function banana(s: Pt, t: Pt, bend: number, thick: number): Shape {
  const mx = (s[0] + t[0]) / 2;
  const my = (s[1] + t[1]) / 2;
  const dx = t[0] - s[0];
  const dy = t[1] - s[1];
  const len = Math.hypot(dx, dy) || 1;
  const q: Pt = [mx - (dy / len) * bend, my + (dx / len) * bend];
  const side = (sign: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const x = (1 - u) * (1 - u) * s[0] + 2 * u * (1 - u) * q[0] + u * u * t[0];
      const y = (1 - u) * (1 - u) * s[1] + 2 * u * (1 - u) * q[1] + u * u * t[1];
      const tx = 2 * (1 - u) * (q[0] - s[0]) + 2 * u * (t[0] - q[0]);
      const ty = 2 * (1 - u) * (q[1] - s[1]) + 2 * u * (t[1] - q[1]);
      const tl = Math.hypot(tx, ty) || 1;
      const h = (thick / 2) * Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * u)), 0.7);
      pts.push([x + (-ty / tl) * h * sign, y + (tx / tl) * h * sign]);
    }
    return pts;
  };
  return poly([...side(1), ...side(-1).reverse()]);
}

export function Bananas(pen: Pen): JSX.Element {
  const stem: Pt = [30, 36];
  const tips: Pt[] = [[78, 30], [82, 46], [78, 62], [68, 74], [54, 80]];
  return (
    <g>
      {pen.body(ell(52, 54, 38, 34), pen.style === 'neon' ? 'metal' : 'wood', { ...M, alpha: 0.9 })}
      {pen.line(ell(52, 54, 31, 27), { fine: true, dash: '3 2' })}
      {tips.map((t, i) => (
        <g key={i}>{pen.body(banana(stem, t, -8 - i * 1.5, 11), 'fruit', { glow: true })}</g>
      ))}
      {pen.lines(tips.map((t) => [[stem[0] + (t[0] - stem[0]) * 0.2, stem[1] + (t[1] - stem[1]) * 0.2], [stem[0] + (t[0] - stem[0]) * 0.75, stem[1] + (t[1] - stem[1]) * 0.75]] as [Pt, Pt]), { fine: true, opacity: 0.4 })}
      {tips.map(([x, y], i) => (
        <g key={`t${i}`}>{pen.dot(x, y, 1.6, 'soil', {})}</g>
      ))}
      {pen.body(ngon(stem[0], stem[1], 5, 6), 'darkwood', {})}
    </g>
  );
}

export function Lamp(pen: Pen): JSX.Element {
  if (pen.style === 'candy') {
    // a bunch of balloons tied to a weight
    const balloons: [number, number, number][] = [[34, 30, 13], [62, 26, 12], [74, 50, 11.5], [44, 54, 12.5], [26, 58, 10]];
    return (
      <g>
        {pen.lines(balloons.map(([x, y, r]) => [[x + r * 0.2, y + r * 0.95], [56, 80]] as [Pt, Pt]), { fine: true })}
        {balloons.map(([x, y, r], i) => (
          <g key={i}>
            {pen.body(ell(x, y, r * 0.9, r), 'fabric', { main: i === 0, fill: pen.tint(i), tex: false, gloss: true, cast: true })}
            {pen.body(poly([[x - 2, y + r + 2.5], [x + 2, y + r + 2.5], [x, y + r - 0.5]]), 'fabric', { fill: pen.tint(i) })}
            {pen.dot(x - r * 0.35, y - r * 0.4, r * 0.16, 'paper', {})}
          </g>
        ))}
        {pen.body(rect(50, 78, 12, 9, 3), 'metal', {})}
      </g>
    );
  }
  if (pen.style === 'rope') {
    // hurricane lantern: brass hexagon cage, glass chimney, flame
    return (
      <g>
        {pen.halo(50, 50, 44)}
        {pen.body(ngon(50, 50, 22, 6, 0), 'brass', M)}
        {pen.glass(ngon(50, 50, 15, 6, 0))}
        {pen.dot(50, 50, 4.5, 'fire', {})}
        {pen.accent(seg(50, 28, 50, 72), { fill: false, sw: 1.6 })}
        {pen.accent(circ(50, 50, 26), { fill: false, sw: 1.4 })}
      </g>
    );
  }
  const pleats: [Pt, Pt][] = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return [[50 + Math.cos(a) * 9, 50 + Math.sin(a) * 9], [50 + Math.cos(a) * 21, 50 + Math.sin(a) * 21]];
  });
  return (
    <g>
      {pen.halo(50, 50, 46)}
      {pen.body(circ(50, 50, 23), pen.style === 'steel' ? 'fabric' : 'linen', { ...M, gloss: false })}
      {pen.style === 'blueprint'
        ? pen.lines([[[36, 36], [64, 64]], [[64, 36], [36, 64]]], { fine: true })
        : pen.lines(pleats, { fine: true, opacity: 0.4 })}
      {pen.line(circ(50, 50, 9), { fine: true })}
      {pen.dot(50, 50, 5, 'fire', { glow: true })}
      {pen.stud(50, 50, 2)}
    </g>
  );
}

export function Statue(pen: Pen): JSX.Element {
  if (pen.style === 'lace') {
    // dress-form mannequin on a tripod, tape measure draped, pin cushion
    const legs: Pt[][] = [-90, 30, 150].map((d) => {
      const a = (d * Math.PI) / 180;
      return [[50, 52], [50 + Math.cos(a) * 34, 52 + Math.sin(a) * 34]];
    });
    return (
      <g>
        {legs.map((l, i) => (
          <g key={i}>{pen.bar(poly(l, false), 3.4, 'darkwood', { main: true })}</g>
        ))}
        {pen.body(ell(50, 52, 24, 15), 'linen', M)}
        {pen.line(seg(50, 38, 50, 66), { fine: true, dash: '2 2' })}
        {pen.line(ell(50, 52, 16, 9), { fine: true, opacity: 0.3 })}
        {pen.accent(arc(50, 52, 19, 200, 330), { fill: false, sw: 2.2 })}
        {pen.dot(50, 52, 4.5, 'darkwood', {})}
        {pen.accent(ngon(50, 52, 2, 4, 0))}
        {pen.body(circ(70, 44, 6), 'fabric', { fill: pen.p.accent2 })}
        {pen.lines([[[67, 42], [65, 39]], [[71, 41], [72, 37]], [[73, 46], [77, 45]]], { fine: true, opacity: 0.7 })}
      </g>
    );
  }
  if (pen.style === 'candy') {
    // carousel horse on its brass pole, on a striped platform
    return (
      <g>
        {pen.body(circ(50, 50, 38), 'fabric', M)}
        {([[38, 44, -30], [62, 44, 30], [38, 72, 30], [62, 72, -30]] as const).map(([x, y, a], i) => (
          <g key={i}>{pen.body(leaf(x, y, 12, 6, (x < 50 ? 180 : 0) + a), 'linen', {})}</g>
        ))}
        {pen.body(leaf(49, 14, 8, 4.5, -115), 'linen', {})}
        {pen.body(leaf(56, 14, 8, 4.5, -65), 'linen', {})}
        {pen.body(ell(50, 58, 12, 22), 'linen', { gloss: true })}
        {pen.body(poly([[44, 40], [50, 18], [57, 22], [56, 40]]), 'linen', {})}
        {pen.body(ell(53, 16, 6, 8), 'linen', {})}
        {pen.lines([[[48, 26], [45, 25]], [[47, 31], [44, 30]], [[46, 36], [43, 35]]], { color: pen.p.accent, sw: 2.4, opacity: 1 })}
        {pen.body(rect(40, 50, 20, 14, 5), 'fabric', { fill: pen.p.accent2 })}
        {pen.bar(poly([[50, 80], [46, 88], [52, 92]], false), 3, 'fabric', { fill: pen.p.accent })}
        {pen.accent(circ(50, 57, 4.5))}
        {pen.dot(50, 57, 1.6, 'paper', {})}
      </g>
    );
  }
  const museum = pen.style === 'marble';
  const plinth = museum ? rect(8, 8, 84, 84, 1.5) : rect(14, 14, 72, 72, 2);
  return (
    <g>
      {pen.body(plinth, 'stone', M)}
      {museum && pen.line(rect(15, 15, 70, 70, 1), { fine: true })}
      {museum && pen.accent(rect(38, 84, 24, 5, 1))}
      {/* figure seen from above: base, shoulders, raised arm, head */}
      {pen.body(circ(50, 52, 22), 'stone', { alpha: 0.9 })}
      {pen.body(ell(50, 52, 19, 10), 'stone', { gloss: museum })}
      {pen.shade(ell(53, 55, 15, 6), 0.9)}
      {pen.bar(poly([[64, 50], [72, 40], [74, 28]], false), 5.5, 'stone')}
      {pen.body(circ(50, 48, 8.5), 'stone', { gloss: true })}
      {pen.lines([[[44, 44], [56, 44]]], { fine: true, opacity: 0.5 })}
    </g>
  );
}

export function Globe(pen: Pen): JSX.Element {
  const ticks: [Pt, Pt][] = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return [[50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30], [50 + Math.cos(a) * (i % 2 ? 32 : 33.5), 50 + Math.sin(a) * (i % 2 ? 32 : 33.5)]];
  });
  const blob = (cx: number, cy: number, r: number): Shape => {
    const pts: Pt[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const rr = r * (0.7 + pen.rand() * 0.5);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return poly(pts);
  };
  return (
    <g>
      {pen.body(circ(50, 50, 36), pen.style === 'neon' ? 'metal' : 'wood', M)}
      {pen.lines(ticks, { fine: true })}
      {pen.body(circ(50, 50, 27), 'water', { gloss: true, glow: true })}
      {pen.body(blob(41, 42, 9), 'leaf', { alpha: 0.85 })}
      {pen.body(blob(59, 58, 10), 'leaf', { alpha: 0.85 })}
      {pen.body(blob(62, 38, 5), 'leaf', { alpha: 0.85 })}
      {pen.line(ell(50, 50, 27, 9), { fine: true, opacity: 0.5 })}
      {pen.line(ell(50, 50, 11, 27), { fine: true, opacity: 0.5 })}
      {pen.accent(seg(50, 20, 50, 80), { fill: false, sw: 2.6 })}
      {pen.stud(50, 50, 2.4)}
    </g>
  );
}

export function Easel(pen: Pen): JSX.Element {
  const dabs: Pt[] = [[68, 74], [74, 70], [80, 73], [79, 80]];
  return (
    <g>
      {pen.bar(seg(50, 44, 20, 80), 4, 'wood', { main: true })}
      {pen.bar(seg(50, 44, 80, 80), 4, 'wood', { main: true })}
      {pen.bar(seg(50, 44, 50, 12), 4, 'wood', { main: true })}
      {pen.body(rect(14, 36, 72, 13, 1.5), 'linen', M)}
      {pen.lines([[[22, 42.5], [78, 42.5]]], { fine: true, opacity: 0.4 })}
      {pen.bar(seg(18, 52, 82, 52), 3, 'wood')}
      {pen.body(ell(74, 76, 13, 9.5), 'wood', {})}
      {pen.dot(69, 80, 2.2, 'soil', {})}
      {dabs.map(([x, y], i) => (
        <g key={i}>{pen.dot(x, y, 2.3, 'paper', { fill: pen.tint(i) })}</g>
      ))}
      {pen.line(seg(30, 66, 44, 84), { sw: 1.6 })}
      {pen.dot(30, 66, 1.8, 'fire', {})}
    </g>
  );
}

export function Fireplace(pen: Pen, L: number): JSX.Element {
  const cx = L / 2;
  const fw = L >= 200 ? 40 : 24;
  const box: Pt[] = [[cx - fw, 30], [cx + fw, 30], [cx + fw - 8, 52], [cx - fw + 8, 52]];
  const flames: Shape[] = [leaf(cx - 8, 48, 14, 9, -115), leaf(cx + 6, 48, 15, 9, -70), leaf(cx, 50, 19, 11, -90)];
  return (
    <g>
      {/* mantel against the wall */}
      {pen.body(rect(4, 6, L - 8, 26, 2), 'stone', M)}
      {pen.style === 'deco' && pen.lines(fan(cx, 30, 22, 9), { fine: true })}
      {pen.line(rect(9, 10, L - 18, 18, 1), { fine: true })}
      {/* hearth slab */}
      {pen.body(rect(cx - fw - 12, 30, (fw + 12) * 2, 34, 2), 'stone', { alpha: 0.8 })}
      {/* firebox */}
      {pen.body(poly(box), 'soil', {})}
      {pen.shade(poly(box), 1.2)}
      {pen.bar(seg(cx - fw + 12, 46, cx + fw - 14, 40), 5, 'wood')}
      {pen.bar(seg(cx - fw + 14, 40, cx + fw - 12, 47), 5, 'darkwood')}
      {flames.map((f, i) => (
        <g key={i}>{pen.body(f, 'fire', { glow: true, alpha: 0.95 })}</g>
      ))}
      {pen.halo(cx, 50, fw + 8)}
      {/* brass fender */}
      {pen.accent(poly([[cx - fw - 8, 60], [cx - fw - 8, 66], [cx + fw + 8, 66], [cx + fw + 8, 60]], false), { fill: false, sw: 2.4 })}
    </g>
  );
}

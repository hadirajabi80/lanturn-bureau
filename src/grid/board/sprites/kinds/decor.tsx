import type { JSX } from 'react';
import { arcPts, ell, leaf, ngon, poly, rect, rotPts, rr, seg, smooth, topFace, type Pt, type Shape } from '../core/geom';
import { box, candle, cyl, strut } from '../core/kit';
import type { Pen } from '../core/pen';
import { flower } from './ornaments';
import { fan } from './seating';

/** Decor & curiosities (all blocking): plant, bananas, lamp, statue, globe, easel, fireplace. */
const M = { main: true } as const;

const sweetStyle = (pen: Pen) => pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';

// ───────────── plant ─────────────

export function Plant(pen: Pen): JSX.Element {
  const potTop = 60;
  const back: JSX.Element[] = [];
  const front: JSX.Element[] = [];
  const ribs: [Pt, Pt][] = [];
  const angles = [-155, -128, -104, -80, -56, -28, -170, -10];
  angles.forEach((a0, i) => {
    const a = a0 + (pen.rand() - 0.5) * 10;
    const len = (i >= 6 ? 26 : 34) + pen.rand() * 8;
    const wid = i >= 6 ? 11 : 14;
    const x = 50 + Math.cos((a * Math.PI) / 180) * 3;
    const y = potTop - 2;
    const el = <g key={i}>{pen.body(leaf(x, y, len, wid, a), 'leaf', { tex: false, glow: true, sw: 0.85 })}</g>;
    (i >= 6 ? front : back).push(el);
    const rad = (a * Math.PI) / 180;
    ribs.push([[x + Math.cos(rad) * 4, y + Math.sin(rad) * 4], [x + Math.cos(rad) * len * 0.82, y + Math.sin(rad) * len * 0.82]]);
  });
  pen.ground(50, 89, 22, 4.5);
  return (
    <g>
      {back}
      {pen.lines(ribs.slice(0, 6), { fine: true })}
      {cyl(pen, 50, potTop + 4, 18, 5, 24, 'ceramic', { ...M, rxB: 13, topMat: 'soil' })}
      {pen.body(rr(29, potTop - 1, 42, 9, 2), 'ceramic', { tex: false, sw: 0.9 })}
      {pen.lit(rr(30, potTop, 40, 3, 1.5))}
      {front}
      {pen.lines(ribs.slice(6), { fine: true })}
      {sweetStyle(pen) && [[34, 34, 0], [62, 28, 2], [48, 22, 4]].map(([x, y, t], i) => flower(pen, x, y, 6, pen.tint(t), i))}
    </g>
  );
}

// ───────────── bananas ─────────────

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
      // stem neck, a full body, then a blunt rounded tip
      const rise = Math.min(1, 0.32 + Math.pow(u / 0.22, 0.8) * 0.68);
      const tip = u > 0.84 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.84) / 0.16, 2))) : 1;
      const h = (thick / 2) * rise * Math.max(0.18, tip);
      pts.push([x + (-ty / tl) * h * sign, y + (tx / tl) * h * sign]);
    }
    return pts;
  };
  return poly([...side(1), ...side(-1).reverse()]);
}

/** A hand of bananas curving up from a stem at `s`. */
function hand(pen: Pen, s: Pt, tips: Pt[], bend: number, key: string): JSX.Element {
  return (
    <g key={key}>
      {tips.map((t, i) => (
        <g key={i}>
          {pen.body(banana(s, t, bend, 13), 'fruit', { glow: true, tex: false, sw: 0.9 })}
          {pen.line(banana(s, t, bend * 0.9, 3), { fine: true, opacity: 0.35 })}
          {pen.dot(t[0], t[1], 2, 'soil', { sw: 0.4 })}
        </g>
      ))}
      {pen.body(ngon(s[0], s[1], 4.4, 6), 'leaf', { tex: false, sw: 0.7 })}
    </g>
  );
}

export function Bananas(pen: Pen): JSX.Element {
  const mat = pen.style === 'neon' ? 'metal' : 'wood';
  pen.ground(50, 89, 42, 4.5);
  return (
    <g>
      {/* open crate: back rim, fruit, front */}
      {pen.body(topFace(10, 48, 80, 10, 5), mat, { tex: false, sw: 0.85 })}
      {pen.shade(topFace(14, 50, 72, 7, 4), 1.1)}
      {hand(pen, [34, 60], [[10, 36], [20, 24], [34, 18]], 9, 'a')}
      {hand(pen, [64, 60], [[60, 16], [76, 20], [90, 32]], -9, 'b')}
      {hand(pen, [44, 62], [[38, 30], [52, 28], [66, 36]], -5, 'c')}
      {pen.body(rect(10, 58, 80, 30, 1.5), mat, M)}
      {pen.lines([[[11, 68], [89, 68]], [[11, 78], [89, 78]]], { fine: true })}
      {[14, 86].map((x) => <g key={x}>{pen.body(rect(x - 3, 58, 6, 30, 0.5), mat, { tex: false, sw: 0.7 })}</g>)}
      {pen.style !== 'blueprint' && pen.body(rr(36, 64, 28, 14, 2), 'paper', { fill: pen.tint(2), tex: false, sw: 0.7 })}
      {pen.text(50, 71, pen.style === 'candy' ? 'YUM' : 'No.1', 7, { opacity: 0.85 })}
    </g>
  );
}

// ───────────── lamp ─────────────

export function Lamp(pen: Pen): JSX.Element {
  if (pen.style === 'candy') return Balloons(pen);
  if (pen.style === 'rope') return Lantern(pen);
  const shadeMat = pen.style === 'steel' ? 'fabric' : 'linen';
  pen.halo(50, 40, 44);
  pen.ground(50, 89, 18, 4);
  const shadePts: Pt[] = [[36, 8], [64, 8], [76, 38], [24, 38]];
  return (
    <g>
      {cyl(pen, 50, 84, 15, 4.5, 3, 'brass', { tex: false })}
      {pen.bar(seg(50, 38, 50, 84), 3.2, 'brass', { main: true })}
      {pen.accent(ell(50, 60, 3.6, 2.2))}
      {/* warm light under the shade */}
      {pen.body(poly([[28, 38], [72, 38], [60, 46], [40, 46]]), 'fire', { alpha: 0.35, tex: false, sw: 0.01, glow: true })}
      {pen.body(poly(shadePts), shadeMat, { ...M, gloss: false })}
      {pen.lit(poly([[38, 10], [50, 10], [46, 36], [28, 36]]), 0.8)}
      {pen.style === 'blueprint'
        ? pen.lines([[[36, 8], [76, 38]], [[64, 8], [24, 38]]], { fine: true })
        : pen.lines([[[44, 9], [40, 37]], [[56, 9], [60, 37]]], { fine: true, opacity: 0.4 })}
      {pen.body(ell(50, 38, 26, 4.5), shadeMat, { tex: false, sw: 0.9 })}
      {pen.style === 'steel' && pen.line(seg(24, 41, 76, 41), { dash: '1 2', sw: 2.4 })}
      {pen.dot(50, 40, 3.2, 'fire', { glow: true, sw: 0.5 })}
      {pen.line(seg(60, 39, 60, 50), { fine: true })}
      {pen.stud(60, 51, 1.4)}
    </g>
  );
}

/** Harrow Point Docks: hurricane lantern on the floor. */
function Lantern(pen: Pen): JSX.Element {
  pen.halo(50, 54, 42);
  pen.ground(50, 89, 22, 4);
  return (
    <g>
      {pen.bar(poly(arcPts(50, 22, 14, 14, 180, 360, 14), false), 2.4, 'brass')}
      {cyl(pen, 50, 80, 20, 5, 6, 'brass', { ...M, gloss: false })}
      {pen.glass(smooth([[40, 34], [60, 34], [68, 56], [62, 78], [38, 78], [32, 56]], true, 4))}
      {pen.body(poly([[50, 48], [54, 60], [50, 70], [46, 60]]), 'fire', { glow: true, tex: false, sw: 0.6 })}
      {pen.lines([[[36, 40], [34, 76]], [[64, 40], [66, 76]], [[50, 34], [50, 46]]], { sw: 2 })}
      {pen.body(poly([[36, 34], [64, 34], [58, 24], [42, 24]]), 'brass', { tex: false, sw: 0.8 })}
      {pen.accent(ell(50, 22, 5, 2.2))}
    </g>
  );
}

/** Cotton Candy Pier: a bunch of balloons tied to a weight. */
function Balloons(pen: Pen): JSX.Element {
  const balloons: [number, number, number][] = [[32, 22, 13], [60, 16, 12.5], [74, 40, 11.5], [46, 42, 12.5], [24, 48, 10]];
  pen.ground(56, 89, 14, 3.5);
  return (
    <g>
      {pen.lines(balloons.map(([x, y, r]) => [[x, y + r + 2], [56, 80]] as [Pt, Pt]), { fine: true })}
      {balloons.map(([x, y, r], i) => (
        <g key={i}>
          {pen.body(ell(x, y, r * 0.9, r), 'fabric', { main: i === 0, fill: pen.tint(i), tex: false, gloss: true })}
          {pen.body(poly([[x - 2, y + r + 2.5], [x + 2, y + r + 2.5], [x, y + r - 0.5]]), 'fabric', { fill: pen.tint(i), sw: 0.6 })}
          {pen.dot(x - r * 0.35, y - r * 0.4, r * 0.16, 'paper', { sw: 0.3 })}
        </g>
      ))}
      {box(pen, 49, 78, 14, 10, 3, 'metal', { r: 2 })}
    </g>
  );
}

// ───────────── statue ─────────────

/** Classical bust (head, neck, shoulders) on top of a plinth at y. */
function bust(pen: Pen, cx: number, y: number, s: number, m: 'stone' | 'brass' = 'stone'): JSX.Element {
  const shoulders = smooth([
    [cx - 20 * s, y], [cx - 18 * s, y - 10 * s], [cx - 9 * s, y - 15 * s], [cx + 9 * s, y - 15 * s], [cx + 18 * s, y - 10 * s], [cx + 20 * s, y],
  ], true, 5);
  const head = smooth([
    [cx - 8 * s, y - 28 * s], [cx - 7 * s, y - 38 * s], [cx, y - 42 * s], [cx + 7 * s, y - 38 * s], [cx + 10 * s, y - 31 * s],
    [cx + 8 * s, y - 27 * s], [cx + 6 * s, y - 21 * s], [cx, y - 19 * s], [cx - 6 * s, y - 22 * s],
  ], true, 4);
  return (
    <g>
      {pen.body(rect(cx - 5 * s, y - 24 * s, 10 * s, 12 * s, 2), m, { tex: false, sw: 0.8 })}
      {pen.body(shoulders, m, { tex: true, gloss: true, sw: 0.9 })}
      {pen.shade(poly([[cx - 5 * s, y - 13 * s], [cx + 5 * s, y - 13 * s], [cx + 3 * s, y - 8 * s], [cx - 3 * s, y - 8 * s]]), 0.6)}
      {pen.body(head, m, { tex: false, gloss: true, sw: 0.9 })}
      {pen.line(poly([[cx - 8 * s, y - 32 * s], [cx - 2 * s, y - 37 * s], [cx + 6 * s, y - 36 * s]], false), { fine: true })}
      {pen.line(poly([[cx + 4 * s, y - 31 * s], [cx + 7 * s, y - 29 * s]], false), { fine: true })}
    </g>
  );
}

export function Statue(pen: Pen): JSX.Element {
  if (pen.style === 'lace') return DressForm(pen);
  if (pen.style === 'candy') return CarouselHorse(pen);
  const museum = pen.style === 'marble';
  pen.ground(50, 89, 30, 4.5);
  return (
    <g>
      {/* plinth: base, shaft, capital */}
      {box(pen, 26, 78, 48, 11, 4, 'stone', { r: 1 })}
      {pen.body(rect(31, 58, 38, 20, 1), 'stone', M)}
      {museum && pen.accent(rect(39, 64, 22, 7, 1))}
      {!museum && pen.lines([[[38, 60], [38, 76]], [[50, 60], [50, 76]], [[62, 60], [62, 76]]], { fine: true, opacity: 0.5 })}
      {box(pen, 25, 50, 50, 10, 4, 'stone', { r: 1 })}
      {bust(pen, 50, 52, 1.18)}
    </g>
  );
}

/** Boutique: dress-form mannequin on a tripod, tape measure draped over the shoulder. */
function DressForm(pen: Pen): JSX.Element {
  const torso = smooth([[34, 18], [50, 14], [66, 18], [64, 32], [58, 44], [66, 60], [50, 64], [34, 60], [42, 44], [36, 32]], true, 5);
  pen.ground(50, 89, 24, 4);
  return (
    <g>
      {strut(pen, 50, 70, 30, 88, 3.4, 'darkwood')}
      {strut(pen, 50, 70, 70, 88, 3.4, 'darkwood')}
      {strut(pen, 50, 70, 50, 84, 3.4, 'darkwood', { back: true })}
      {pen.bar(seg(50, 62, 50, 72), 3.6, 'darkwood')}
      {pen.body(torso, 'linen', M)}
      {pen.line(poly([[50, 16], [50, 62]], false), { fine: true, dash: '2 2' })}
      {pen.accent(poly([[38, 20], [44, 30], [48, 44], [46, 58], [50, 66]], false), { fill: false, sw: 2 })}
      {pen.body(rect(46, 8, 8, 7, 2), 'darkwood', { tex: false })}
      {pen.accent(ngon(50, 7, 2.6, 4, 0))}
      {pen.body(ell(70, 54, 6, 4.5), 'fabric', { fill: pen.p.accent2 })}
      {pen.lines([[[68, 52], [66, 47]], [[71, 51], [72, 46]], [[73, 54], [77, 51]]], { fine: true, opacity: 0.7 })}
    </g>
  );
}

/** Cotton Candy Pier: a carousel horse on its brass pole. */
function CarouselHorse(pen: Pen): JSX.Element {
  const body = smooth([[36, 46], [48, 42], [64, 44], [72, 50], [68, 58], [52, 60], [38, 58]], true, 5);
  const neck = poly([[36, 50], [30, 30], [38, 24], [44, 46]]);
  const head = poly(rotPts(arcPts(28, 26, 10, 5.5, 0, 360, 20), 28, 26, 30));
  pen.ground(50, 89, 30, 5);
  return (
    <g>
      {cyl(pen, 50, 84, 30, 6, 4, 'fabric', { fill: pen.p.accent, tex: true })}
      {pen.bar(seg(50, 4, 50, 82), 3, 'brass', { main: true })}
      {pen.bar(poly([[40, 56], [34, 66], [38, 74]], false), 3.6, 'linen')}
      {pen.bar(poly([[46, 58], [44, 72]], false), 3.6, 'linen')}
      {pen.bar(poly([[64, 56], [70, 66], [74, 74]], false), 3.6, 'linen')}
      {pen.bar(poly([[60, 58], [62, 74]], false), 3.6, 'linen')}
      {pen.body(leaf(70, 48, 16, 7, 40), 'fabric', { fill: pen.tint(4), tex: false })}
      {pen.body(body, 'linen', { ...M, gloss: true })}
      {pen.body(neck, 'linen', {})}
      {pen.body(head, 'linen', {})}
      {pen.body(leaf(33, 22, 8, 4, -110), 'linen', { tex: false, sw: 0.7 })}
      {pen.lines([[[38, 26], [41, 24]], [[40, 32], [43, 30]], [[41, 38], [44, 36]]], { color: pen.p.accent, sw: 2.6, opacity: 1 })}
      {pen.body(rr(44, 40, 16, 10, 3), 'fabric', { fill: pen.p.accent2, tex: false })}
      {pen.dot(24, 24, 1.2, 'soil', { sw: 0.3 })}
      {pen.accent(ell(50, 4, 3, 2))}
    </g>
  );
}

// ───────────── globe ─────────────

export function Globe(pen: Pen): JSX.Element {
  const cx = 50;
  const cy = 38;
  const r = 25;
  const blob = (bx: number, by: number, br: number): Shape => {
    const pts: Pt[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const rr2 = br * (0.7 + pen.rand() * 0.5);
      pts.push([bx + Math.cos(a) * rr2, by + Math.sin(a) * rr2 * 0.9]);
    }
    return smooth(pts, true, 3);
  };
  const standMat = pen.style === 'neon' ? 'metal' : 'wood';
  pen.ground(50, 89, 24, 4);
  return (
    <g>
      {strut(pen, 50, 68, 30, 88, 4.4, standMat)}
      {strut(pen, 50, 68, 70, 88, 4.4, standMat)}
      {strut(pen, 50, 68, 50, 84, 4.4, standMat, { back: true })}
      {cyl(pen, 50, 66, 8, 2.5, 6, standMat, {})}
      {pen.bar(seg(50, cy + r, 50, 66), 3.6, standMat)}
      {pen.body(ell(cx, cy, r, r), 'water', { ...M, gloss: true })}
      {pen.body(blob(41, 30, 10), 'leaf', { alpha: 0.9, tex: false, sw: 0.7 })}
      {pen.body(blob(58, 46, 9), 'leaf', { alpha: 0.9, tex: false, sw: 0.7 })}
      {pen.body(blob(62, 26, 5), 'leaf', { alpha: 0.9, tex: false, sw: 0.7 })}
      {pen.line(ell(cx, cy, r, 7), { fine: true, opacity: 0.5 })}
      {pen.line(ell(cx, cy, 10, r), { fine: true, opacity: 0.5 })}
      {/* brass meridian ring, tilted */}
      {pen.accent(poly(rotPts(arcPts(cx, cy, r + 4, r + 4, 100, 280, 20), cx, cy, 20), false), { fill: false, sw: 3 })}
      {pen.stud(cx + Math.sin((20 * Math.PI) / 180) * (r + 4), cy - Math.cos((20 * Math.PI) / 180) * (r + 4), 2.2)}
    </g>
  );
}

// ───────────── easel ─────────────

export function Easel(pen: Pen): JSX.Element {
  const wood = 'wood';
  pen.ground(50, 89, 30, 4);
  return (
    <g>
      {strut(pen, 50, 8, 64, 86, 4, wood, { back: true })}
      {strut(pen, 46, 6, 24, 89, 4.6, wood)}
      {strut(pen, 54, 6, 76, 89, 4.6, wood)}
      {/* canvas with a little landscape */}
      {pen.body(rect(20, 14, 60, 46, 1), 'linen', M)}
      {pen.body(rect(23, 17, 54, 22, 0.5), 'water', { alpha: 0.55, tex: false, sw: 0.4 })}
      {pen.body(smooth([[23, 44], [36, 32], [48, 40], [62, 28], [77, 38], [77, 57], [23, 57]], true, 4), 'leaf', { tex: false, sw: 0.6 })}
      {pen.dot(66, 23, 4, 'fire', { glow: true, sw: 0.5 })}
      {pen.body(rect(47, 8, 6, 8, 1), wood, { tex: false, sw: 0.7 })}
      {box(pen, 16, 58, 68, 7, 3, wood, { r: 1 })}
      {/* palette leaning on a leg */}
      {pen.body(smooth([[60, 72], [76, 68], [84, 76], [76, 86], [62, 84]], true, 4), 'wood', { tex: false, sw: 0.8 })}
      {[[66, 75, 0], [72, 72, 1], [78, 76, 2], [71, 81, 3]].map(([x, y, t], i) => <g key={i}>{pen.dot(x, y, 2.2, 'paper', { fill: pen.tint(t), sw: 0.4 })}</g>)}
    </g>
  );
}

// ───────────── fireplace ─────────────

export function Fireplace(pen: Pen, w: number, h: number): JSX.Element {
  const cx = w / 2;
  const tall = h > w;
  const base = h - 8;
  const mantel = tall ? h - 76 : 16;
  const fw = w >= 200 ? 34 : 22;
  const openTop = mantel + 26;
  const opening = rr(cx - fw, openTop, fw * 2, base - 8 - openTop, fw * 0.8, fw * 0.8, 0, 0);
  const flames: Shape[] = [leaf(cx - 7, base - 14, 14, 9, -112), leaf(cx + 7, base - 14, 15, 9, -68), leaf(cx, base - 12, 20, 11, -90)];
  pen.ground(cx, base, w / 2 - 4, 3);
  pen.halo(cx, base - 16, fw + 18);
  return (
    <g>
      {/* over-mantel portrait on a tall chimney breast */}
      {tall && pen.body(rect(14, 8, 72, mantel - 6, 1), 'stone', { tex: true })}
      {tall && pen.accent(rr(24, 20, 52, mantel - 40, 2))}
      {tall && pen.body(rr(29, 25, 42, mantel - 50, 1), 'linen', { tex: false })}
      {tall && pen.body(smooth([[42, mantel - 25], [44, 46], [50, 40], [56, 46], [58, mantel - 25]], true, 4), 'fabric', { fill: pen.tint(1), tex: false, sw: 0.7 })}
      {tall && pen.body(ell(50, 38, 5.5, 6.5), 'paper', { fill: pen.tint(4), tex: false, sw: 0.7 })}
      {/* surround */}
      {pen.body(rect(8, mantel + 8, w - 16, base - 6 - mantel - 8, 1), 'stone', M)}
      {pen.style === 'deco' && pen.lines(fan(cx, openTop - 2, 18, 9), { fine: true })}
      {pen.body(opening, 'soil', { tex: false })}
      {pen.shade(opening, 1.2)}
      {/* logs + flames */}
      {pen.bar(seg(cx - fw + 6, base - 10, cx + fw - 8, base - 13), 5, 'wood')}
      {pen.bar(seg(cx - fw + 8, base - 13, cx + fw - 6, base - 9), 5, 'darkwood')}
      {flames.map((f, i) => <g key={i}>{pen.body(f, 'fire', { glow: true, alpha: 0.95, tex: false, sw: 0.8 })}</g>)}
      {/* mantel shelf with a clock and candles */}
      {box(pen, 2, mantel, w - 4, 10, 5, 'stone', { r: 1, taper: 2, topMat: pen.style === 'steel' || pen.style === 'rope' ? 'wood' : 'stone' })}
      {pen.body(rr(cx - 6, mantel - 12, 12, 14, 5, 5, 1, 1), 'brass', { tex: false, sw: 0.8 })}
      {pen.body(ell(cx, mantel - 6, 3.6, 3.6), 'paper', { tex: false, sw: 0.5 })}
      {candle(pen, 14, mantel + 2, 8, 3)}
      {candle(pen, w - 14, mantel + 2, 8, 3)}
      {/* hearth + fender */}
      {box(pen, 4, base - 6, w - 8, 6, 3, 'stone', { r: 0.5 })}
      {pen.accent(poly([[cx - fw - 3, base - 2], [cx - fw - 3, base - 8], [cx + fw + 3, base - 8], [cx + fw + 3, base - 2]], false), { fill: false, sw: 2.2 })}
    </g>
  );
}


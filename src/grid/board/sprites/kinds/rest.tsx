import type { JSX } from 'react';
import { ell, inset, leaf, poly, rect, rr, seg, smooth, topFace, type Pt, type Shape } from '../core/geom';
import { box, leg, strut } from '../core/kit';
import type { Pen } from '../core/pen';
import { bubbles, flower } from './ornaments';
import { fan } from './seating';

/** Things you lie on or in: rug, bed, bathtub (occupiable) and the coffin (blocking). */
const O = { open: true } as const;
const M = { open: true, main: true } as const;

// ───────────── rug ─────────────

export function Rug(pen: Pen, w: number, h: number): JSX.Element {
  const tall = h > w;
  const x0 = tall ? 12 : 9;
  const x1 = w - x0;
  const y0 = tall ? 12 : 18;
  const y1 = h - (tall ? 14 : 16);
  const tp = tall ? 3 : 5;
  const shape = topFace(x0, y0, x1 - x0, y1 - y0, tp);
  // fringe on the short ends
  const fr: [Pt, Pt][] = [];
  if (tall) {
    for (let x = x0 + tp + 3; x <= x1 - tp - 2; x += 5) fr.push([[x, y0], [x, y0 - 5]]);
    for (let x = x0 + 3; x <= x1 - 2; x += 5) fr.push([[x, y1 + 2], [x, y1 + 8]]);
  } else {
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      const yy = y0 + 3 + (y1 - y0 - 4) * t;
      const xl = x0 + tp * (1 - t) - 1;
      const xr = x1 - tp * (1 - t) + 1;
      fr.push([[xl, yy], [xl - 6, yy + 0.5]]);
      fr.push([[xr, yy], [xr + 6, yy + 0.5]]);
    }
  }
  const cx = w / 2;
  const cy = (y0 + y1) / 2;
  const rx = tall ? 22 : Math.min(w * 0.2, 32);
  const ry = tall ? Math.min(h * 0.2, 34) : 15;
  const floral = pen.style === 'ribbon' || pen.style === 'lace';
  const med: Shape =
    pen.style === 'deco' || pen.style === 'neon'
      ? poly([[cx - rx, cy], [cx, cy - ry], [cx + rx, cy], [cx, cy + ry]])
      : ell(cx, cy, rx, ry);
  return (
    <g>
      {pen.lines(fr, { fine: true, sw: 1.2, opacity: 0.8 })}
      {pen.body(rect(x0, y1 - 1, x1 - x0, 4, 1), 'fabric', { ...O, fill: pen.tint(0), tex: false })}
      {pen.body(shape, 'fabric', { ...M, fill: pen.tint(0), alpha: 0.9, tex: pen.style !== 'lace' })}
      {pen.line(inset(shape, 6), { sw: 1.4 })}
      {pen.line(inset(shape, 10), { fine: true, dash: '1.5 3' })}
      {floral ? floralField(pen, cx, cy, tall, w) : pen.body(med, 'fabric', { ...O, fill: pen.tint(2), tex: false })}
      {!floral && pen.line(inset(med, 5), { fine: true, dash: '2 2.5' })}
      {!floral && pen.body(inset(med, Math.min(rx, ry) * 0.62), 'fabric', { ...O, fill: pen.tint(4), tex: false })}
      {pen.style === 'deco' && pen.lines(fan(cx, cy, 12, 5), { fine: true })}
    </g>
  );
}

/** Rosewater / boutique rug: a little garden of blossoms and leaves. */
function floralField(pen: Pen, cx: number, cy: number, tall: boolean, w: number): JSX.Element {
  const spots: [number, number, number][] = tall
    ? [[cx, cy, 10], [cx - 18, cy - 50, 7], [cx + 18, cy + 50, 7], [cx + 16, cy - 40, 5], [cx - 16, cy + 40, 5]]
    : w >= 200
      ? [[cx, cy, 10], [cx - 52, cy - 10, 7], [cx + 52, cy + 10, 7], [cx - 30, cy + 12, 5], [cx + 30, cy - 12, 5]]
      : [[cx, cy, 9], [cx - 25, cy, 5.5], [cx + 25, cy, 5.5]];
  return (
    <g>
      {spots.map(([x, y, r], i) => (
        <g key={`l${i}`}>
          {pen.body(leaf(x, y, r * 1.9, r * 0.9, 30 + i * 70), 'leaf', { tex: false })}
          {pen.body(leaf(x, y, r * 1.7, r * 0.8, 200 + i * 70), 'leaf', { tex: false })}
        </g>
      ))}
      {spots.map(([x, y, r], i) => flower(pen, x, y, r, pen.tint(i % 2 ? 3 : i), `f${i}`))}
    </g>
  );
}

// ───────────── bed ─────────────

export function Bed(pen: Pen, w: number, h: number): JSX.Element {
  return w > h ? BedSide(pen, w) : BedFront(pen, h);
}

function bedWood(pen: Pen) {
  return pen.style === 'steel' || pen.style === 'deco' ? ('darkwood' as const) : ('wood' as const);
}

function blanketFill(pen: Pen): string | undefined {
  return pen.style === 'blueprint' ? undefined : pen.tint(pen.style === 'deco' ? 1 : 0);
}

/** Bed seen from its foot end: headboard at the back, blanket towards us, footboard in front. */
function BedFront(pen: Pen, h: number): JSX.Element {
  const wood = bedWood(pen);
  const yb = h >= 200 ? 84 : 52;
  const front = h - 26;
  pen.ground(50, h - 9, 46, 6);
  return (
    <g>
      {/* headboard */}
      {pen.body(rr(8, 4, 84, 40, 16, 16, 2, 2), wood, O)}
      {pen.line(rr(15, 10, 70, 28, 11, 11, 1, 1), { fine: true })}
      {pen.style === 'deco' && pen.lines(fan(50, 38, 22, 7), { fine: true })}
      {pen.style === 'lace' && pen.body(ell(50, 14, 9, 6), 'brass', { ...O, tex: false })}
      {/* mattress */}
      {pen.body(rect(12, 28, 76, front - 28), 'linen', M)}
      {pen.lit(rect(13, 29, 74, front - 30))}
      {/* pillow(s) */}
      {h >= 200 ? (
        <g>
          {pen.body(rr(16, 30, 33, 22, 9), 'linen', O)}
          {pen.body(rr(51, 30, 33, 22, 9), 'linen', O)}
        </g>
      ) : (
        pen.body(rr(22, 30, 56, 17, 8), 'linen', O)
      )}
      {/* blanket with a turned-down sheet, hanging over the front */}
      {pen.body(rect(10, yb, 80, front - yb + 12, 3), 'fabric', { ...O, fill: blanketFill(pen) })}
      {pen.body(rect(10, yb, 80, 8, 2), 'linen', O)}
      {pen.line(seg(14, front + 1, 86, front + 1), { fine: true, dash: '2 2' })}
      {h >= 200 && pen.lines([[[30, yb + 22], [70, yb + 22]], [[30, yb + 50], [70, yb + 50]]], { fine: true, dash: '2 3' })}
      {/* footboard */}
      {pen.body(rr(6, front + 4, 88, 12, 3), wood, O)}
      {leg(pen, 10, front - 2, h - 8, 6, wood, O)}
      {leg(pen, 90, front - 2, h - 8, 6, wood, O)}
      {pen.body(ell(10, front - 3, 4.5, 2.6), wood, { ...O, tex: false })}
      {pen.body(ell(90, front - 3, 4.5, 2.6), wood, { ...O, tex: false })}
    </g>
  );
}

/** Bed along a horizontal footprint, seen side-on: headboard left, footboard right. */
function BedSide(pen: Pen, w: number): JSX.Element {
  const wood = bedWood(pen);
  const xb = Math.max(64, w * 0.38);
  pen.ground(w / 2, 89, w / 2 - 6, 5);
  return (
    <g>
      {/* headboard */}
      {pen.body(rr(6, 6, 24, 82, 10, 10, 2, 2), wood, O)}
      {pen.line(rr(11, 12, 14, 66, 6, 6, 1, 1), { fine: true })}
      {pen.style === 'deco' && pen.lines([[[18, 16], [18, 74]]], { fine: true })}
      {/* mattress: top and side */}
      {box(pen, 24, 30, w - 40, 46, 30, 'linen', { ...M, r: 3 })}
      {/* pillow */}
      {pen.body(rr(30, 26, 30, 26, 11), 'linen', O)}
      {pen.lit(rr(32, 28, 20, 10, 5))}
      {/* blanket */}
      {pen.body(rr(xb, 30, w - 16 - xb, 30, 3), 'fabric', { ...O, fill: blanketFill(pen) })}
      {pen.body(rr(xb, 60, w - 16 - xb, 20, 3), 'fabric', { ...O, fill: blanketFill(pen) })}
      {pen.shade(rect(xb + 1, 61, w - 18 - xb, 18), 0.35)}
      {pen.body(rect(xb, 30, 9, 50, 2), 'linen', O)}
      {/* low footboard */}
      {pen.body(rr(w - 20, 36, 14, 52, 6, 6, 2, 2), wood, O)}
      {leg(pen, 28, 74, 89, 6, wood, O)}
    </g>
  );
}

// ───────────── bathtub ─────────────

export function Bathtub(pen: Pen, w: number, h: number): JSX.Element {
  if (h > w) return TubLong(pen, h);
  const sweet = pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';
  const x0 = 8;
  const x1 = w - 8;
  const top = 32;
  const body = smooth([
    [x0, top], [x1, top], [x1 - 3, top + 22], [x1 - 16, top + 44], [w / 2, top + 48], [x0 + 16, top + 44], [x0 + 3, top + 22],
  ], true, 5);
  const feet: number[] = [x0 + 18, x1 - 18];
  const bub: [number, number, number][] = w >= 200
    ? [[50, 30, 6], [62, 26, 4.5], [86, 28, 5], [110, 25, 6.5], [128, 29, 4], [96, 22, 3.5], [140, 26, 5]]
    : [[34, 30, 5.5], [46, 25, 4], [58, 29, 4.5], [68, 26, 3.5]];
  pen.ground(w / 2, 89, w / 2 - 14, 5);
  return (
    <g>
      {feet.map((x) => <g key={x}>{clawFoot(pen, x)}</g>)}
      {pen.body(body, 'ceramic', M)}
      {pen.shade(poly([[x0 + 10, top + 34], [x1 - 10, top + 34], [x1 - 18, top + 44], [w / 2, top + 47], [x0 + 18, top + 44]]), 0.35)}
      {/* rolled rim + water */}
      {pen.body(rr(x0 - 2, top - 12, x1 - x0 + 4, 18, 9), 'ceramic', { ...O, tex: false })}
      {pen.lit(rr(x0, top - 10, x1 - x0, 6, 3))}
      {pen.body(rr(x0 + 6, top - 8, x1 - x0 - 12, 10, 5), 'water', { ...O, alpha: 0.9 })}
      {sweet && bubbles(pen, bub)}
      {/* taps */}
      {pen.bar(poly([[x1 - 6, top - 10], [x1 - 6, top - 22], [x1 - 14, top - 22], [x1 - 14, top - 18]], false), 2.6, 'brass', O)}
      {pen.stud(x1 - 2, top - 16, 2.4)}
      {pen.stud(x1 - 10, top - 26, 2.4)}
    </g>
  );
}

function clawFoot(pen: Pen, x: number): JSX.Element {
  return (
    <g>
      {pen.accent(poly([[x - 4, 72], [x + 4, 72], [x + 5, 82], [x + 7, 86], [x - 7, 86], [x - 5, 82]]))}
      {pen.accent(ell(x, 86, 6, 2.6))}
    </g>
  );
}

/** Bathtub along a vertical footprint: long basin seen from above, near end towards us. */
function TubLong(pen: Pen, h: number): JSX.Element {
  const sweet = pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';
  pen.ground(50, h - 10, 40, 6);
  const end = h - 46;
  return (
    <g>
      {[24, 76].map((x) => <g key={x}>{pen.accent(poly([[x - 4, h - 26], [x + 4, h - 26], [x + 6, h - 12], [x - 6, h - 12]]))}</g>)}
      {pen.body(smooth([[8, end - 20], [92, end - 20], [90, end + 12], [76, end + 30], [50, end + 34], [24, end + 30], [10, end + 12]], true, 5), 'ceramic', M)}
      {pen.body(rr(8, 14, 84, end - 4, 40), 'ceramic', { ...O, tex: false })}
      {pen.lit(rr(11, 17, 78, end - 10, 37))}
      {pen.body(rr(17, 24, 66, end - 24, 32), 'water', { ...O, alpha: 0.9 })}
      {sweet && bubbles(pen, [[38, 60, 6], [56, 74, 4.5], [44, 96, 5], [62, 112, 6], [40, 128, 4]])}
      {pen.bar(poly([[50, 18], [50, 6], [42, 6], [42, 12]], false), 2.6, 'brass', O)}
      {pen.stud(36, 10, 2.4)}
      {pen.stud(64, 10, 2.4)}
    </g>
  );
}

// ───────────── coffin ─────────────

export function Coffin(pen: Pen, w: number, h: number): JSX.Element {
  if (w > h) return CoffinLying(pen, w);
  if (h > w) return CoffinLong(pen, h);
  return CoffinUpright(pen);
}

const crossOn = (pen: Pen, cx: number, cy: number, s: number): JSX.Element => (
  <g>
    {pen.accent(rect(cx - s * 0.12, cy - s * 0.5, s * 0.24, s, 0.8))}
    {pen.accent(rect(cx - s * 0.36, cy - s * 0.24, s * 0.72, s * 0.22, 0.8))}
  </g>
);

/** Standing coffin, lid slid aside a little. */
function CoffinUpright(pen: Pen): JSX.Element {
  const hex = (dx: number): Pt[] => [[38 + dx, 5], [62 + dx, 5], [74 + dx, 28], [66 + dx, 88], [34 + dx, 88], [26 + dx, 28]];
  const lidPts = hex(7).map(([x, y]) => [x + (y - 46) * 0.06, y] as Pt);
  pen.ground(50, 90, 30, 4.5);
  return (
    <g>
      {pen.body(poly(hex(0)), 'darkwood', { main: true })}
      {pen.body(poly([[40, 11], [60, 11], [69, 29], [62, 83], [38, 83], [31, 29]]), 'fabric', { fill: pen.style === 'blueprint' ? undefined : pen.style === 'neon' ? '#3a1030' : '#8c2a3a', tex: false })}
      {pen.shade(poly([[40, 11], [60, 11], [69, 29], [62, 83], [38, 83], [31, 29]]), 1)}
      {pen.body(poly(lidPts), 'wood', { tex: true })}
      {pen.line(inset(poly(lidPts), 5), { fine: true })}
      {crossOn(pen, 58, 34, 20)}
      {pen.stud(78, 50, 1.6)}
      {pen.stud(76, 72, 1.6)}
    </g>
  );
}

/** Coffin lying on two trestles, head to the left. */
function CoffinLying(pen: Pen, w: number): JSX.Element {
  const sx = w * 0.3;
  const cy = 38;
  const lid: Pt[] = [[8, cy - 8], [sx, cy - 17], [w - 8, cy - 10], [w - 8, cy + 10], [sx, cy + 17], [8, cy + 8]];
  const side: Pt[] = [[8, cy + 8], [sx, cy + 17], [w - 8, cy + 10], [w - 8, cy + 28], [sx, cy + 36], [8, cy + 26]];
  pen.ground(w / 2, 89, w / 2 - 10, 5);
  const trestle = (x: number) => (
    <g key={x}>
      {strut(pen, x, 62, x - 12, 88, 4, 'wood')}
      {strut(pen, x, 62, x + 12, 88, 4, 'wood')}
      {pen.bar(seg(x - 14, 64, x + 14, 64), 3, 'wood')}
    </g>
  );
  const handles = [0.45, 0.65, 0.85].map((t) => sx + (w - 8 - sx) * t);
  return (
    <g>
      {trestle(w * 0.28)}
      {trestle(w * 0.75)}
      {pen.body(poly(side), 'darkwood', { main: true })}
      {pen.line(poly([[sx, cy + 17], [sx, cy + 36]], false), { fine: true })}
      {handles.map((x) => <g key={x}>{pen.accent(rect(x - 5, cy + 20 - ((x - sx) / (w - 8 - sx)) * 7, 10, 3.4, 1.4))}</g>)}
      {pen.body(poly(lid), 'wood', { tex: true })}
      {pen.lit(poly(lid))}
      {pen.line(inset(poly(lid), 4), { fine: true })}
      {crossOn(pen, w * 0.48, cy, 18)}
    </g>
  );
}

/** Coffin lying along a vertical footprint, head away from us, foot end towards us. */
function CoffinLong(pen: Pen, h: number): JSX.Element {
  const foot = h - 38;
  const lid: Pt[] = [[36, 10], [64, 10], [80, 56], [68, foot], [32, foot], [20, 56]];
  const side: Pt[] = [[20, 56], [32, foot], [68, foot], [80, 56], [80, 72], [68, foot + 18], [32, foot + 18], [20, 72]];
  pen.ground(50, h - 12, 34, 6);
  return (
    <g>
      {leg(pen, 34, foot + 14, h - 12, 6, 'darkwood')}
      {leg(pen, 66, foot + 14, h - 12, 6, 'darkwood')}
      {pen.body(poly(side), 'darkwood', { main: true })}
      {pen.lines([[[32, foot], [32, foot + 18]], [[68, foot], [68, foot + 18]]], { fine: true })}
      {pen.accent(rect(44, foot + 6, 12, 3.4, 1.4))}
      {pen.body(poly(lid), 'wood', { tex: true })}
      {pen.lit(poly(lid))}
      {pen.line(inset(poly(lid), 5), { fine: true })}
      {crossOn(pen, 50, 70, 30)}
    </g>
  );
}

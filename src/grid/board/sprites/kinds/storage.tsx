import type { JSX } from 'react';
import { arcPts, ell, heart, ngon, poly, rect, rotPts, rr, seg, smooth, type Pt } from '../core/geom';
import { bottle, box, cyl, leg, wrap } from '../core/kit';
import type { Pen } from '../core/pen';
import type { Material } from '../styles/types';

/** Storage (all blocking): bookshelf, cabinet, fridge, safe, bin. */
const M = { main: true } as const;

function caseWood(pen: Pen): Material {
  return pen.style === 'steel' || pen.style === 'deco' ? 'darkwood' : 'wood';
}

// ───────────── bookshelf ─────────────

/** A row of book spines standing on a shelf at `base`, between x0 and x1, at most `maxH` tall. */
function books(pen: Pen, x0: number, x1: number, base: number, maxH: number): JSX.Element[] {
  const out: JSX.Element[] = [];
  let x = x0;
  let i = 0;
  while (x < x1 - 3) {
    const bw = Math.min(x1 - x, 3.6 + pen.rand() * 3.6);
    const bh = maxH * (0.68 + pen.rand() * 0.32);
    const fill = pen.tint(i + Math.floor(pen.rand() * 3));
    if (pen.rand() < 0.09 && x1 - x > 14) {
      // a leaning book
      const pts = rotPts([[x, base], [x + bw, base], [x + bw, base - bh], [x, base - bh]] as Pt[], x + bw, base, 18);
      out.push(<g key={i}>{pen.body(poly(pts), 'paper', { fill, tex: false, sw: 0.6 })}</g>);
      x += bw + bh * 0.32;
    } else {
      out.push(
        <g key={i}>
          {pen.body(rect(x, base - bh, bw - 0.5, bh, 0.5), 'paper', { fill, tex: false, sw: 0.6 })}
          {bw > 4.4 && pen.line(seg(x + 0.8, base - bh * 0.72, x + bw - 1.3, base - bh * 0.72), { fine: true, color: '#ffffff', opacity: 0.6 })}
        </g>,
      );
      x += bw + (pen.rand() < 0.1 ? 2.5 : 0);
    }
    i++;
  }
  return out;
}

export function Bookshelf(pen: Pen, w: number, h: number): JSX.Element {
  if (pen.style === 'steel') return LuggageRack(pen, w, h);
  const wood = caseWood(pen);
  const shelves = Math.max(3, Math.round((h - 16) / 26));
  const x0 = 8;
  const x1 = w - 8;
  const y0 = 10;
  const y1 = h - 10;
  const rowH = (y1 - y0 - 4) / shelves;
  const bays = Math.max(1, Math.round((x1 - x0) / 90));
  const bw = (x1 - x0 - 8) / bays;
  pen.ground(w / 2, h - 8, w / 2 - 6, 4);
  const rows: JSX.Element[] = [];
  for (let s = 0; s < shelves; s++) {
    const top = y0 + 4 + s * rowH;
    const base = top + rowH - 3;
    for (let b = 0; b < bays; b++) {
      const bx0 = x0 + 4 + b * bw + 2;
      const bx1 = x0 + 4 + (b + 1) * bw - 2;
      rows.push(
        <g key={`${s}-${b}`}>
          {pen.body(rect(bx0 - 1, top, bx1 - bx0 + 2, rowH - 3, 0), wood, { tex: false, sw: 0.6 })}
          {pen.shade(rect(bx0 - 1, top, bx1 - bx0 + 2, rowH - 3), 0.9)}
          {books(pen, bx0, s === 1 && bays === 1 ? bx1 - 14 : bx1, base, rowH - 6)}
          {s === 1 && bays === 1 && pen.body(ell(bx1 - 7, base - 3.5, 5, 4), 'ceramic', { tex: false, sw: 0.6 })}
        </g>,
      );
    }
  }
  return (
    <g>
      {box(pen, x0 - 2, 2, x1 - x0 + 4, y0, 6, wood, { r: 1, taper: 2 })}
      {pen.body(rect(x0, y0, x1 - x0, y1 - y0, 1), wood, M)}
      {rows}
      {Array.from({ length: shelves + 1 }, (_, s) => (
        <g key={s}>{pen.body(rect(x0 + 2, y0 + 1 + s * rowH, x1 - x0 - 4, 3.2, 0.5), wood, { tex: false, sw: 0.7 })}</g>
      ))}
      {Array.from({ length: bays - 1 }, (_, b) => (
        <g key={`u${b}`}>{pen.body(rect(x0 + 4 + (b + 1) * bw - 2, y0 + 2, 4, y1 - y0 - 4, 0.5), wood, { tex: false, sw: 0.7 })}</g>
      ))}
      {pen.body(rect(x0 - 2, y1 - 2, x1 - x0 + 4, 6, 1), wood, { tex: false })}
    </g>
  );
}

/** Midnight Express luggage rack: brass rails holding suitcases. */
function LuggageRack(pen: Pen, w: number, h: number): JSX.Element {
  const tiers = h > w ? 3 : 2;
  const y0 = 10;
  const y1 = h - 10;
  const th = (y1 - y0) / tiers;
  pen.ground(w / 2, h - 8, w / 2 - 6, 4);
  const cases: JSX.Element[] = [];
  for (let t = 0; t < tiers; t++) {
    const base = y0 + th * (t + 1) - 3;
    let x = 12;
    let i = 0;
    while (x < w - 24) {
      const cw = 22 + pen.rand() * 16;
      if (x + cw > w - 10) break;
      const ch = th * (0.55 + pen.rand() * 0.3);
      cases.push(
        <g key={`${t}-${i}`}>
          {pen.body(rr(x, base - ch, cw, ch, 3), 'leather', { fill: pen.tint(t * 3 + i), sw: 0.8 })}
          {pen.accent(rect(x + cw / 2 - 5, base - ch - 3, 10, 3.4, 1.5))}
          {pen.lines([[[x + 5, base - ch + 1], [x + 5, base - 1]], [[x + cw - 5, base - ch + 1], [x + cw - 5, base - 1]]], { fine: true })}
        </g>,
      );
      x += cw + 4;
      i++;
    }
  }
  return (
    <g>
      {pen.body(rect(6, y0, w - 12, y1 - y0, 2), 'darkwood', { ...M, alpha: 0.9 })}
      {pen.shade(rect(8, y0 + 2, w - 16, y1 - y0 - 4), 0.6)}
      {cases}
      {Array.from({ length: tiers + 1 }, (_, t) => <g key={t}>{pen.bar(seg(6, y0 + th * t, w - 6, y0 + th * t), 2.6, 'brass')}</g>)}
      {[8, w - 8].map((x) => <g key={x}>{pen.bar(seg(x, y0, x, y1), 2.6, 'brass')}</g>)}
    </g>
  );
}

// ───────────── cabinet ─────────────

export function Cabinet(pen: Pen, w: number, h: number): JSX.Element {
  if (pen.style === 'lace') return Vanity(pen, w, h);
  if (pen.style === 'marble' || pen.style === 'deco' || pen.style === 'ribbon' || pen.style === 'candy') return Vitrine(pen, w, h);
  const wood = caseWood(pen);
  const x0 = 10;
  const x1 = w - 10;
  const top = 12;
  const bottom = h - 12;
  const doors = w >= 200 ? 4 : 2;
  const dw = (x1 - x0 - 8) / doors;
  const glassBottom = top + (bottom - top) * 0.5;
  pen.ground(w / 2, h - 9, w / 2 - 8, 4);
  const shelves: JSX.Element[] = [];
  for (let d = 0; d < doors; d++) {
    const gx = x0 + 4 + d * dw + 3;
    const gw = dw - 6;
    const mid = (top + 8 + glassBottom) / 2;
    shelves.push(
      <g key={d}>
        {pen.body(rect(gx, top + 8, gw, glassBottom - top - 10, 0.5), wood, { tex: false, sw: 0.6 })}
        {pen.shade(rect(gx, top + 8, gw, glassBottom - top - 10), 0.8)}
        {bottle(pen, gx + gw * 0.3, mid - 1, 13, 6, pen.tint(d * 2))}
        {bottle(pen, gx + gw * 0.68, mid - 1, 10, 5.4, pen.tint(d * 2 + 3))}
        {pen.line(seg(gx, mid, gx + gw, mid), {})}
        {pen.body(rr(gx + gw * 0.2, glassBottom - 10, gw * 0.3, 7.5, 1.5), 'ceramic', { tex: false, sw: 0.6 })}
        {bottle(pen, gx + gw * 0.72, glassBottom - 2.5, 10, 5.6, pen.tint(d + 1))}
        {pen.glass(rect(gx, top + 8, gw, glassBottom - top - 10), 0.5)}
      </g>,
    );
  }
  return (
    <g>
      {[x0 + 4, x1 - 4].map((x) => <g key={x}>{pen.body(rr(x - 4, bottom - 2, 8, 7, 1, 1, 3, 3), wood, { tex: false, sw: 0.7 })}</g>)}
      {pen.body(rect(x0, top + 4, x1 - x0, bottom - top - 4, 1), wood, M)}
      {shelves}
      {/* lower solid doors */}
      {Array.from({ length: doors }, (_, d) => (
        <g key={d}>{pen.line(rect(x0 + 4 + d * dw + 3, glassBottom + 4, dw - 6, bottom - glassBottom - 10, 1.5), { fine: true })}</g>
      ))}
      {pen.lines(Array.from({ length: doors - 1 }, (_, d) => [[x0 + 4 + (d + 1) * dw, top + 6], [x0 + 4 + (d + 1) * dw, bottom - 3]] as [Pt, Pt]))}
      {Array.from({ length: doors / 2 }, (_, i) => {
        const x = x0 + 4 + dw * (i * 2 + 1);
        return (
          <g key={i}>
            {pen.stud(x - 3, glassBottom - 4, 1.7)}
            {pen.stud(x + 3, glassBottom - 4, 1.7)}
            {pen.stud(x - 3, glassBottom + 10, 1.7)}
            {pen.stud(x + 3, glassBottom + 10, 1.7)}
          </g>
        );
      })}
      {/* cornice */}
      {box(pen, x0 - 4, top - 6, x1 - x0 + 8, 12, 5, wood, { r: 1, taper: 2 })}
    </g>
  );
}

/** Museum / gallery vitrine: glass display case on slim legs with exhibits inside. */
function Vitrine(pen: Pen, w: number, h: number): JSX.Element {
  const frame: Material = pen.style === 'deco' ? 'darkwood' : pen.style === 'marble' ? 'brass' : 'wood';
  const x0 = 10;
  const x1 = w - 10;
  const top = 10;
  const bottom = h - 26;
  const shelves = h > w ? 3 : 2;
  const sh = (bottom - top - 10) / shelves;
  pen.ground(w / 2, h - 9, w / 2 - 8, 4);
  const items: JSX.Element[] = [];
  const n = Math.max(2, Math.round((x1 - x0) / 40));
  for (let s = 0; s < shelves; s++) {
    const base = top + 8 + sh * (s + 1) - 1;
    for (let i = 0; i < n; i++) {
      const cx = x0 + ((x1 - x0) * (i + 0.5)) / n;
      const k = (s * n + i) % 3;
      items.push(
        <g key={`${s}-${i}`}>
          {k === 0 && pen.body(smooth([[cx - 3, base - sh * 0.62], [cx + 3, base - sh * 0.62], [cx + 7, base - sh * 0.3], [cx + 4, base], [cx - 4, base], [cx - 7, base - sh * 0.3]]), 'ceramic', { tex: false, gloss: true, sw: 0.7 })}
          {k === 1 && pen.body(ngon(cx, base - sh * 0.32, sh * 0.3, 6, 0), 'brass', { tex: false, sw: 0.7 })}
          {k === 2 && pen.body(ell(cx, base - sh * 0.36, sh * 0.3, sh * 0.34), 'ceramic', { fill: pen.tint(i + s), tex: false, sw: 0.7 })}
        </g>,
      );
    }
  }
  return (
    <g>
      {[x0 + 4, x1 - 4].map((x) => <g key={x}>{leg(pen, x, bottom, h - 9, 4, frame)}</g>)}
      {pen.body(rect(x0, top, x1 - x0, bottom - top, 1.5), frame, M)}
      {pen.body(rect(x0 + 4, top + 8, x1 - x0 - 8, bottom - top - 12, 0.5), 'fabric', { tex: false, alpha: 0.9, sw: 0.6 })}
      {Array.from({ length: shelves }, (_, s) => <g key={s}>{pen.line(seg(x0 + 4, top + 8 + sh * (s + 1), x1 - 4, top + 8 + sh * (s + 1)), {})}</g>)}
      {items}
      {pen.glass(rect(x0 + 4, top + 8, x1 - x0 - 8, bottom - top - 12), 0.35)}
      {box(pen, x0 - 3, top - 4, x1 - x0 + 6, 10, 5, frame, { r: 1, taper: 2 })}
      {pen.accent(rect(w / 2 - 8, bottom - 3, 16, 3, 1))}
    </g>
  );
}

/** Boutique vanity: dressing table with an oval mirror, perfume bottles and pearls. */
function Vanity(pen: Pen, w: number, h: number): JSX.Element {
  const cx = w / 2;
  const top = h - 46;
  const mw = Math.min(w * 0.3, 30);
  const mh = Math.min(top - 16, h > w ? 110 : 46) / 2;
  pen.ground(cx, h - 9, w / 2 - 8, 4);
  const pearls: JSX.Element[] = [];
  for (let i = 0; i <= 8; i++) {
    const [x, y] = arcPts(cx + 12, top + 2, 12, 6, 180, 0, 8)[i];
    pearls.push(<g key={i}>{pen.dot(x, y - 2, 1.6, 'paper', { sw: 0.5 })}</g>);
  }
  return (
    <g>
      {/* mirror */}
      {pen.bar(seg(cx - mw - 2, top, cx - mw - 2, top - mh), 2.6, 'brass')}
      {pen.bar(seg(cx + mw + 2, top, cx + mw + 2, top - mh), 2.6, 'brass')}
      {pen.accent(ell(cx, top - mh - 2, mw + 4, mh + 4))}
      {pen.glass(ell(cx, top - mh - 2, mw, mh))}
      {pen.accent(ngon(cx, top - mh * 2 - 7, 4.4, 4, 0))}
      {/* table */}
      {[16, w - 16].map((x, i) => <g key={x}>{pen.bar(poly([[x, top + 22], [x + (i ? 3 : -3), top + 32], [x + (i ? -1 : 1), h - 9]], false), 3.4, 'wood')}</g>)}
      {box(pen, 8, top, w - 16, 26, 7, 'wood', { ...M, r: 4, taper: 3 })}
      {pen.line(rect(cx - 16, top + 12, 32, 9, 2), { fine: true })}
      {pen.stud(cx, top + 16.5, 1.6)}
      {bottle(pen, 18, top + 4, 12, 7, pen.tint(0))}
      {bottle(pen, w - 20, top + 4, 10, 8, pen.tint(2))}
      {pearls}
    </g>
  );
}

// ───────────── fridge ─────────────

export function Fridge(pen: Pen, w: number, h: number): JSX.Element {
  const mat: Material = pen.style === 'ink' || pen.style === 'rope' ? 'ceramic' : 'metal';
  const pink = pen.style === 'ribbon' ? '#ffb3cf' : undefined;
  const wide = w >= 200;
  const x0 = wide ? 10 : 16;
  const x1 = w - x0;
  const top = 6;
  const bottom = h - 12;
  const split = top + (bottom - top) * 0.32;
  const neon = pen.style === 'neon';
  pen.ground(w / 2, h - 9, (x1 - x0) / 2 + 4, 4.5);
  const handle = (x: number, y0: number, y1: number) => (
    <g>
      {pen.accent(rect(x - 1.8, y0, 3.6, y1 - y0, 1.6), { glow: neon })}
    </g>
  );
  return (
    <g>
      {[x0 + 6, x1 - 6].map((x) => <g key={x}>{pen.body(rect(x - 3.5, bottom - 2, 7, 6, 1), 'darkwood', { tex: false, sw: 0.7 })}</g>)}
      {pen.body(rr(x0, top, x1 - x0, bottom - top, 14, 14, 4, 4), mat, { ...M, fill: pink })}
      {pen.lit(rr(x0 + 3, top + 2, x1 - x0 - 6, 8, 6, 6, 1, 1), 1.4)}
      {wide ? (
        <g>
          {pen.line(seg(w / 2, top + 10, w / 2, bottom - 2), {})}
          {handle(w / 2 - 6, top + 26, top + 66)}
          {handle(w / 2 + 6, top + 26, top + 66)}
        </g>
      ) : (
        <g>
          {pen.line(seg(x0 + 1, split, x1 - 1, split), {})}
          {handle(x1 - 8, top + 12, split - 6)}
          {handle(x1 - 8, split + 6, split + 30)}
        </g>
      )}
      {pen.line(seg(x0 + 4, bottom - 8, x1 - 4, bottom - 8), { fine: true })}
      {pen.accent(rect(w / 2 - 7, top + 4, 14, 3.2, 1.2))}
      {/* a note under a magnet */}
      {pen.body(poly(rotPts([[x0 + 10, split + 10], [x0 + 26, split + 10], [x0 + 26, split + 28], [x0 + 10, split + 28]] as Pt[], x0 + 18, split + 19, -6)), 'paper', { fill: pen.tint(2), tex: false, sw: 0.7 })}
      {pen.dot(x0 + 18, split + 11, 2.2, 'fruit', { fill: pen.p.danger, sw: 0.5 })}
      {pink && pen.body(heart(wide ? w / 2 + 34 : x0 + 22, top + 18, 12), 'fabric', { fill: pen.p.accent, gloss: false })}
    </g>
  );
}

// ───────────── safe ─────────────

export function Safe(pen: Pen): JSX.Element {
  if (pen.style === 'marble') return JewelCase(pen);
  const ticks: [Pt, Pt][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return [[42 + Math.cos(a) * 9, 54 + Math.sin(a) * 9], [42 + Math.cos(a) * 11.5, 54 + Math.sin(a) * 11.5]];
  });
  const spokes: [Pt, Pt][] = [0, 120, 240].map((d) => {
    const a = ((d + 30) * Math.PI) / 180;
    return [[68, 56], [68 + Math.cos(a) * 9, 56 + Math.sin(a) * 9]];
  });
  pen.ground(50, 89, 38, 5);
  return (
    <g>
      {[20, 80].map((x) => <g key={x}>{pen.body(rect(x - 5, 82, 10, 6, 1), 'darkwood', { tex: false, sw: 0.7 })}</g>)}
      {box(pen, 12, 14, 76, 70, 10, 'metal', { ...M, r: 4, taper: 3 })}
      {pen.line(rr(18, 30, 64, 48, 3), {})}
      {pen.accent(rect(15, 36, 5, 10, 1))}
      {pen.accent(rect(15, 62, 5, 10, 1))}
      {pen.body(ell(42, 54, 13, 13), 'metal', { gloss: true, tex: false })}
      {pen.lines(ticks, { fine: true })}
      {pen.accent(ell(42, 54, 6, 6))}
      {pen.accent(poly([[42, 41], [44, 37], [40, 37]]))}
      {pen.lines(spokes, { sw: 2.6 })}
      {spokes.map(([, [x, y]], i) => <g key={i}>{pen.stud(x, y, 1.8)}</g>)}
      {pen.accent(ell(68, 56, 3.4, 3.4))}
      {pen.accent(rect(38, 33, 24, 4, 1))}
    </g>
  );
}

/** Museum jewel strongbox: velvet cushion and gem under a glass case on a plinth. */
function JewelCase(pen: Pen): JSX.Element {
  pen.ground(50, 89, 34, 4.5);
  return (
    <g>
      {box(pen, 18, 54, 64, 34, 8, 'stone', { ...M, r: 1.5, taper: 2 })}
      {pen.accent(rect(40, 72, 20, 5, 1))}
      {pen.body(rr(30, 44, 40, 14, 4), 'fabric', { tex: false })}
      {pen.body(ngon(50, 38, 9, 8, 0, 6.5), 'glass', { fill: pen.tint(1), tex: false, gloss: true })}
      {pen.accent(ngon(50, 38, 3.5, 4, 0))}
      {pen.glass(rect(24, 16, 52, 40, 1), 0.45)}
      {pen.glass(poly([[24, 16], [30, 10], [70, 10], [76, 16]]))}
      {pen.lines([[[24, 16], [24, 56]], [[76, 16], [76, 56]]], {})}
    </g>
  );
}

// ───────────── bin ─────────────

export function Bin(pen: Pen): JSX.Element {
  const wood = pen.style === 'rope';
  const mat: Material = wood ? 'wood' : 'metal';
  const top = 38;
  const bh = 46;
  // lid lifted and tipped back a little, crumpled paper peeking out
  const lid = poly(rotPts(arcPts(50, top - 6, 24, 7, 0, 360, 28), 50, top - 6, -9));
  pen.ground(50, 89, 24, 4.5);
  return (
    <g>
      {cyl(pen, 50, top, 22, 6.5, bh, mat, { ...M, rxB: 18, topMat: 'soil' })}
      {pen.shade(ell(50, top, 19, 4.6), 1.2)}
      {wood
        ? pen.lines([-12, -4, 4, 12].map((dx) => [[50 + dx, top + 7], [50 + dx * 0.85, top + bh + 5]] as [Pt, Pt]), { fine: true })
        : [top + 14, top + 26, top + 38].map((y, i) => <g key={y}>{pen.line(wrap(50, y, 22 - (i + 1) * 1.1, 6), { fine: i !== 1 })}</g>)}
      {wood && pen.accent(wrap(50, top + 10, 21.4, 6.4), { fill: false, sw: 2.6 })}
      {wood && pen.accent(wrap(50, top + bh - 8, 19, 6), { fill: false, sw: 2.6 })}
      {pen.body(ngon(38, top - 4, 7, 7, 10, 5), 'paper', { tex: false, sw: 0.7 })}
      {pen.body(ngon(60, top - 3, 6, 6, 30, 4.4), 'paper', { fill: pen.tint(4), tex: false, sw: 0.7 })}
      {!wood && pen.body(lid, 'metal', { tex: false, gloss: true, sw: 0.9 })}
      {!wood && pen.bar(poly(arcPts(52, top - 9, 6, 4, 180, 360, 8), false), 2.4, 'metal')}
      {!wood && pen.lit(lid, 1)}
      {[27, 73].map((x) => <g key={x}>{pen.accent(rect(x - 2.5, top + 6, 5, 3, 1))}</g>)}
    </g>
  );
}

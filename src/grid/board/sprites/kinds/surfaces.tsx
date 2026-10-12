import type { JSX } from 'react';
import { bez, ell, leaf, poly, rect, rr, seg, smooth, spiral, topFace, type Pt } from '../core/geom';
import { bottle, box, candle, cyl, leg, recede, wrap } from '../core/kit';
import type { Pen } from '../core/pen';
import type { Material } from '../styles/types';
import { star } from './ornaments';

/** Work & dining surfaces (all blocking): table, desk, counter, piano. */
const M = { main: true } as const;

function topWood(pen: Pen): Material {
  return pen.style === 'steel' || pen.style === 'deco' ? 'darkwood' : 'wood';
}

// ───────────── table-top props ─────────────

/** Vase with a few blooms, standing at (cx, base). */
function vase(pen: Pen, cx: number, base: number, s = 1): JSX.Element {
  const bodyPts = smooth([[cx - 3 * s, base - 16 * s], [cx + 3 * s, base - 16 * s], [cx + 6 * s, base - 6 * s], [cx + 3.5 * s, base], [cx - 3.5 * s, base], [cx - 6 * s, base - 6 * s]], true, 4);
  return (
    <g>
      {pen.body(leaf(cx, base - 15 * s, 13 * s, 6 * s, -130), 'leaf', { tex: false, sw: 0.7, glow: true })}
      {pen.body(leaf(cx, base - 15 * s, 13 * s, 6 * s, -50), 'leaf', { tex: false, sw: 0.7, glow: true })}
      {[[-5, -27, 1], [5, -26, 3], [0, -31, 4]].map(([dx, dy, t], i) => (
        <g key={i}>{pen.dot(cx + dx * s, base + dy * s, 3.8 * s, 'fruit', { fill: pen.tint(t), sw: 0.7 })}</g>
      ))}
      {pen.body(bodyPts, 'ceramic', { tex: false, gloss: true, sw: 0.8 })}
    </g>
  );
}

/** Candlestick: brass foot, stem, candle and flame. */
function candlestick(pen: Pen, cx: number, base: number, s = 1): JSX.Element {
  return (
    <g>
      {pen.accent(ell(cx, base, 5 * s, 1.8 * s))}
      {pen.bar(seg(cx, base - 1, cx, base - 9 * s), 2 * s, 'brass')}
      {candle(pen, cx, base - 9 * s, 10 * s, 3.2 * s)}
    </g>
  );
}

/** Fruit bowl seen from the side. */
function fruitBowl(pen: Pen, cx: number, base: number): JSX.Element {
  return (
    <g>
      {[[-6, -9, 0], [5, -10, 1], [0, -13, 2]].map(([dx, dy, t], i) => (
        <g key={i}>{pen.dot(cx + dx, base + dy, 5, 'fruit', { fill: pen.tint(t), sw: 0.8 })}</g>
      ))}
      {pen.body(poly([[cx - 12, base - 8], [cx + 12, base - 8], [cx + 8, base - 2], [cx + 3, base], [cx - 3, base], [cx - 8, base - 2]]), 'ceramic', { tex: false, gloss: true, sw: 0.8 })}
    </g>
  );
}

/** Tiered cake stand with a frosted cake and a cherry (side view). */
function cakeStand(pen: Pen, cx: number, base: number, s = 1): JSX.Element {
  return (
    <g>
      {pen.accent(ell(cx, base, 7 * s, 2 * s))}
      {pen.bar(seg(cx, base, cx, base - 7 * s), 2.2 * s, 'brass')}
      {pen.body(ell(cx, base - 8 * s, 15 * s, 3.4 * s), 'ceramic', { tex: false, sw: 0.8 })}
      {cyl(pen, cx, base - 20 * s, 11 * s, 3 * s, 11 * s, 'fabric', { fill: pen.tint(0), topFill: '#fffaf2' })}
      {pen.line(wrap(cx, base - 15 * s, 11 * s, 3 * s), { fine: true, dash: '1 1.6' })}
      {pen.dot(cx, base - 23 * s, 3 * s, 'fruit', { fill: pen.p.danger, sw: 0.7 })}
    </g>
  );
}

/** Macaron tower: a cone of little macarons (side view). */
function macaronTower(pen: Pen, cx: number, base: number, s = 1): JSX.Element {
  const out: JSX.Element[] = [];
  let k = 0;
  for (let row = 0; row < 4; row++) {
    const n = 4 - row;
    const y = base - 5 * s - row * 6.4 * s;
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * 7 * s;
      out.push(<g key={k}>{pen.body(rr(x - 3.4 * s, y - 2.6 * s, 6.8 * s, 5.2 * s, 2.4 * s), 'fabric', { fill: pen.tint(k + row), tex: false, sw: 0.6 })}</g>);
      k++;
    }
  }
  return (
    <g>
      {pen.body(ell(cx, base, 15 * s, 3 * s), 'ceramic', { tex: false, sw: 0.8 })}
      {out}
    </g>
  );
}

// ───────────── table ─────────────

export function Table(pen: Pen, w: number, h: number): JSX.Element {
  if (h > w) return TableLong(pen, h);
  const wood = topWood(pen);
  const ribbon = pen.style === 'ribbon';
  if (w < 200) {
    // round table with a lace doily and a vase
    pen.ground(50, 89, 36, 5);
    return (
      <g>
        {leg(pen, 50, 52, 82, 5.5, wood, { back: true })}
        {leg(pen, 22, 50, 88, 5.5, wood)}
        {leg(pen, 78, 50, 88, 5.5, wood)}
        {pen.bar(wrap(50, 72, 26, 6), 2.2, wood)}
        {cyl(pen, 50, 46, 42, 15, 6, wood, M)}
        {pen.body(ell(50, 46, 22, 7.5), 'linen', { tex: false, alpha: 0.95, sw: 0.8 })}
        {pen.line(ell(50, 46, 17, 5.5), { fine: true, dash: '1.5 2' })}
        {ribbon ? cakeStand(pen, 50, 47, 1.1) : vase(pen, 50, 48, 1.15)}
      </g>
    );
  }
  // long dining table: runner, candlesticks, a fruit bowl
  pen.ground(w / 2, 89, w / 2 - 8, 5);
  const top = 36;
  return (
    <g>
      {leg(pen, 22, 62, 82, 5, wood, { back: true })}
      {leg(pen, w - 22, 62, 82, 5, wood, { back: true })}
      {box(pen, 6, top, w - 12, 34, 24, wood, { ...M, r: 2, taper: 6 })}
      {pen.line(seg(9, top + 28, w - 9, top + 28), { fine: true })}
      {leg(pen, 14, top + 32, 90, 6, wood)}
      {leg(pen, w - 14, top + 32, 90, 6, wood)}
      {/* runner hanging over the front edge */}
      {pen.body(topFace(w * 0.3, top, w * 0.4, 24, 2), 'linen', { tex: false, sw: 0.8 })}
      {pen.body(rect(w * 0.3, top + 24, w * 0.4, 12, 1), 'linen', { tex: false, sw: 0.8 })}
      {pen.line(seg(w * 0.3 + 2, top + 33, w * 0.7 - 2, top + 33), { fine: true, dash: '1.5 2' })}
      {ribbon ? (
        <g>
          {cakeStand(pen, w / 2 - 30, top + 16, 1)}
          {macaronTower(pen, w / 2 + 30, top + 16, 1)}
        </g>
      ) : (
        <g>
          {fruitBowl(pen, w / 2, top + 16)}
          {candlestick(pen, w / 2 - 34, top + 14)}
          {candlestick(pen, w / 2 + 34, top + 14)}
        </g>
      )}
      {[w * 0.14, w * 0.86].map((x) => <g key={x}>{pen.body(ell(x, top + 13, 8, 3), 'ceramic', { tex: false, sw: 0.7 })}</g>)}
    </g>
  );
}

/** Dining table along a vertical footprint: long top receding from us, legs at the near end. */
function TableLong(pen: Pen, h: number): JSX.Element {
  const wood = topWood(pen);
  const ribbon = pen.style === 'ribbon';
  const y1 = h - 52;
  pen.ground(50, h - 10, 44, 6);
  const t = recede(pen, [24, 76], [8, 92], 12, y1, 8, wood, M);
  const plate = (f: number, d: number) => {
    const [x, y] = t.at(f, d);
    const k = 0.7 + 0.3 * d;
    return <g key={`${f}-${d}`}>{pen.body(ell(x, y, 8 * k, 4 * k), 'ceramic', { tex: false, sw: 0.7 })}</g>;
  };
  const runner = poly([t.at(0.36, 0.02), t.at(0.64, 0.02), t.at(0.64, 1), t.at(0.36, 1)]);
  const [rl] = t.at(0.36, 1);
  const [rr2] = t.at(0.64, 1);
  return (
    <g>
      {leg(pen, 13, y1 + 6, h - 10, 6, wood)}
      {leg(pen, 87, y1 + 6, h - 10, 6, wood)}
      {t.el}
      {pen.body(runner, 'linen', { tex: false, sw: 0.8 })}
      {pen.body(rect(rl, y1, rr2 - rl, 14, 1), 'linen', { tex: false, sw: 0.8 })}
      {[0.2, 0.75].flatMap((d) => [plate(0.17, d), plate(0.83, d)])}
      {ribbon ? cakeStand(pen, 50, h / 2 - 6, 0.9) : fruitBowl(pen, 50, h / 2 - 8)}
      {ribbon ? macaronTower(pen, 50, y1 - 14, 1) : candlestick(pen, 50, y1 - 12, 1.1)}
      {!ribbon && candlestick(pen, 50, 36, 0.8)}
    </g>
  );
}

// ───────────── desk ─────────────

/** Banker's lamp standing at (cx, base). */
function deskLamp(pen: Pen, cx: number, base: number): JSX.Element {
  pen.halo(cx, base - 6, 20);
  return (
    <g>
      {pen.accent(ell(cx, base, 7, 2.2))}
      {pen.bar(seg(cx, base - 1, cx, base - 12), 2, 'brass')}
      {pen.body(poly([[cx - 11, base - 12], [cx - 7, base - 20], [cx + 7, base - 20], [cx + 11, base - 12]]), 'glass', {
        fill: pen.style === 'blueprint' ? undefined : pen.style === 'neon' ? '#0f3a2a' : '#2f6a4a', tex: false, gloss: true, glow: true, sw: 0.8,
      })}
      {pen.dot(cx, base - 11, 2.2, 'fire', { glow: true, sw: 0.5 })}
    </g>
  );
}

function papers(pen: Pen, x: number, y: number): JSX.Element {
  return (
    <g>
      {pen.body(topFace(x + 2, y - 1, 20, 7, -1), 'paper', { tex: false, sw: 0.7 })}
      {pen.body(topFace(x, y, 20, 7, -1), 'paper', { tex: false, sw: 0.7 })}
      {pen.lines([[[x + 4, y + 2.5], [x + 15, y + 2.5]], [[x + 3, y + 4.6], [x + 17, y + 4.6]]], { fine: true })}
    </g>
  );
}

function inkwell(pen: Pen, cx: number, base: number): JSX.Element {
  return (
    <g>
      {pen.body(rr(cx - 4, base - 6, 8, 6, 1.5), 'glass', { fill: pen.style === 'blueprint' ? undefined : '#2a2440', tex: false, sw: 0.7 })}
      {pen.line(poly([[cx + 1, base - 6], [cx + 6, base - 17], [cx + 9, base - 20]], false), { sw: 1.4 })}
      {pen.body(leaf(cx + 5, base - 15, 9, 4, -60), 'paper', { tex: false, sw: 0.6 })}
    </g>
  );
}

function drawers(pen: Pen, x: number, y: number, w: number, h: number, n: number): JSX.Element {
  const dh = h / n;
  return (
    <g>
      {pen.lines(Array.from({ length: n - 1 }, (_, i) => [[x + 1, y + dh * (i + 1)], [x + w - 1, y + dh * (i + 1)]] as [Pt, Pt]))}
      {Array.from({ length: n }, (_, i) => <g key={i}>{pen.accent(rect(x + w / 2 - 4, y + dh * i + dh / 2 - 1.3, 8, 2.6, 1))}</g>)}
    </g>
  );
}

export function Desk(pen: Pen, w: number, h: number): JSX.Element {
  const wood = topWood(pen);
  if (h > w) {
    // writing desk along a vertical footprint: top receding from us, pedestals at the near end
    const y1 = h - 58;
    pen.ground(50, h - 10, 44, 6);
    const t = recede(pen, [24, 76], [6, 94], 14, y1, 7, wood, M);
    const pad = poly([t.at(0.22, 0.35), t.at(0.78, 0.35), t.at(0.78, 0.8), t.at(0.22, 0.8)]);
    return (
      <g>
        {pen.body(rect(8, y1 + 7, 30, h - 10 - y1 - 7, 1.5), wood, { tex: true })}
        {drawers(pen, 8, y1 + 7, 30, h - 10 - y1 - 7, 3)}
        {pen.body(rect(h > 0 ? 62 : 0, y1 + 7, 30, h - 10 - y1 - 7, 1.5), wood, { tex: true })}
        {drawers(pen, 62, y1 + 7, 30, h - 10 - y1 - 7, 3)}
        {pen.shade(rect(39, y1 + 8, 22, 14), 0.9)}
        {t.el}
        {pen.body(pad, 'leather', { tex: false, sw: 0.8 })}
        {papers(pen, 40, y1 - 26)}
        {inkwell(pen, 18, y1 - 6)}
        {deskLamp(pen, 66, 40)}
        {pen.body(rr(28, 30, 18, 8, 1), 'paper', { fill: pen.tint(1), tex: false, sw: 0.7 })}
        {pen.body(rr(30, 25, 15, 6, 1), 'paper', { fill: pen.tint(3), tex: false, sw: 0.7 })}
      </g>
    );
  }
  const big = w >= 200;
  const top = big ? 42 : 44;
  pen.ground(w / 2, 89, w / 2 - 6, 5);
  return (
    <g>
      {box(pen, 4, top, w - 8, 14, 10, wood, { ...M, r: 1.5, taper: 4 })}
      {/* pedestals + kneehole */}
      {pen.body(rect(8, top + 14, 30, 74 - top + 14 - 14, 1.5), wood, { tex: true })}
      {drawers(pen, 8, top + 14, 30, 88 - top - 14, 3)}
      {big ? (
        <g>
          {pen.body(rect(w - 38, top + 14, 30, 88 - top - 14, 1.5), wood, { tex: true })}
          {drawers(pen, w - 38, top + 14, 30, 88 - top - 14, 3)}
        </g>
      ) : (
        pen.body(rect(w - 16, top + 14, 9, 88 - top - 14, 1.5), wood, {})
      )}
      {pen.shade(rect(40, top + 15, (big ? w - 40 : w - 16) - 40, 14), 0.9)}
      {pen.lines([[[40, top + 14], [big ? w - 40 : w - 18, top + 14]]], { fine: true })}
      {/* on the desk */}
      {papers(pen, big ? 58 : 32, top + 2)}
      {inkwell(pen, big ? 30 : 16, top + 7)}
      {deskLamp(pen, w - (big ? 30 : 20), top + 6)}
      {big && pen.body(rr(96, top - 8, 22, 12, 1), 'paper', { fill: pen.tint(1), tex: false, sw: 0.7 })}
      {big && pen.body(rr(100, top - 13, 18, 6, 1), 'paper', { fill: pen.tint(3), tex: false, sw: 0.7 })}
    </g>
  );
}

// ───────────── counter ─────────────

/** Cash register (front view) standing at (x, base). */
function till(pen: Pen, x: number, base: number): JSX.Element {
  return (
    <g>
      {pen.body(poly([[x, base], [x, base - 12], [x + 6, base - 20], [x + 24, base - 20], [x + 26, base - 12], [x + 26, base]]), 'metal', { tex: false, gloss: true, sw: 0.85 })}
      {pen.body(rr(x + 7, base - 28, 15, 8, 1.5), 'paper', { tex: false, sw: 0.7 })}
      {pen.lines([0, 1, 2, 3].map((c) => [[x + 6 + c * 4.6, base - 15], [x + 7.6 + c * 4.6, base - 15]] as [Pt, Pt]), { sw: 2 })}
      {pen.lines([0, 1, 2, 3].map((c) => [[x + 5 + c * 5, base - 9], [x + 7 + c * 5, base - 9]] as [Pt, Pt]), { sw: 2 })}
      {pen.line(seg(x + 2, base - 4, x + 24, base - 4), { fine: true })}
    </g>
  );
}

function bell(pen: Pen, cx: number, base: number): JSX.Element {
  return (
    <g>
      {pen.accent(ell(cx, base, 6, 1.8))}
      {pen.accent(poly([...Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (Math.PI * i) / 8;
        return [cx + Math.cos(a) * 5, base - 1 + Math.sin(a) * 5] as Pt;
      })]))}
      {pen.accent(ell(cx, base - 7, 1.4, 1.4))}
    </g>
  );
}

function glassCup(pen: Pen, cx: number, base: number): JSX.Element {
  return pen.glass(poly([[cx - 3.4, base - 9], [cx + 3.4, base - 9], [cx + 2.6, base], [cx - 2.6, base]]));
}

export function Counter(pen: Pen, w: number, h: number): JSX.Element {
  const tall = h > w;
  const mat: Material = pen.style === 'neon' ? 'metal' : pen.style === 'ribbon' ? 'stone' : 'stone';
  if (pen.style === 'candy') return TicketBooth(pen, w, h);
  if (pen.style === 'ribbon') return Patisserie(pen, w, h);
  if (tall) {
    const y1 = h - 56;
    pen.ground(50, h - 9, 46, 6);
    const t = recede(pen, [22, 78], [4, 96], 12, y1, 8, mat, { tex: true });
    return (
      <g>
        {pen.body(rect(8, y1 + 8, 84, h - 10 - y1 - 8, 2), pen.style === 'neon' ? 'metal' : 'wood', M)}
        {pen.lines([[[36, y1 + 10], [36, h - 14]], [[64, y1 + 10], [64, h - 14]]])}
        {pen.shade(rect(10, h - 18, 80, 5), 0.7)}
        {t.el}
        {bell(pen, 40, 34)}
        {glassCup(pen, 60, 40)}
        {bottle(pen, 44, 82, 24, 7.5, pen.tint(1))}
        {glassCup(pen, 58, 80)}
        {glassCup(pen, 66, 84)}
        {till(pen, 14, y1 - 8)}
        {pen.body(rr(56, y1 - 22, 22, 12, 1.5), 'paper', { fill: pen.tint(2), tex: false, sw: 0.7 })}
      </g>
    );
  }
  const big = w >= 200;
  const top = 40;
  pen.ground(w / 2, 89, w / 2 - 4, 5);
  const panels = big ? 4 : 2;
  const pw = (w - 16) / panels;
  return (
    <g>
      {pen.body(rect(8, top + 14, w - 16, 88 - top - 14, 2), pen.style === 'neon' ? 'metal' : 'wood', M)}
      {Array.from({ length: panels }, (_, i) => <g key={i}>{pen.line(rect(12 + i * pw, top + 19, pw - 8, 88 - top - 30, 1.5), { fine: true })}</g>)}
      {pen.shade(rect(10, 84, w - 20, 4), 0.8)}
      {box(pen, 2, top, w - 4, 15, 9, mat, { r: 1.5, taper: 3, tex: true })}
      {till(pen, big ? 14 : 8, top + 6)}
      {glassCup(pen, big ? 56 : 46, top + 7)}
      {glassCup(pen, big ? 66 : 56, top + 8)}
      {bottle(pen, big ? 84 : 72, top + 7, 26, 8, pen.tint(1))}
      {big && bottle(pen, 96, top + 6, 22, 7, pen.tint(3))}
      {big && bell(pen, w - 50, top + 7)}
      {big && pen.body(rr(w - 34, top - 3, 22, 9, 1.5), 'paper', { fill: pen.tint(2), tex: false, sw: 0.7 })}
      {!big && bell(pen, 88, top + 7)}
    </g>
  );
}

/** Pier ticket booth: candy-striped awning, little window, TICKETS sign. */
function TicketBooth(pen: Pen, w: number, h: number): JSX.Element {
  const tall = h > w;
  const W = w;
  const top = tall ? h - 96 : 8;
  pen.ground(W / 2, h - 10, W / 2 - 4, 5);
  let longTop: JSX.Element | null = null;
  if (tall) {
    const t = recede(pen, [24, 76], [8, 92], 10, top + 6, 4, 'wood', { tex: false });
    longTop = (
      <g>
        {t.el}
        {pen.pattern(t.top, { kind: 'lines', angle: 90, spacing: 12, sw: 5, color: pen.p.accent, opacity: 0.45 })}
        {pen.body(star(50, 40, 10), 'brass', { gloss: false })}
      </g>
    );
  }
  const scal: JSX.Element[] = [];
  for (let x = 8, i = 0; x <= W - 8; x += 9, i++) {
    scal.push(<g key={i}>{pen.dot(x, top + 22, 4.6, 'fabric', { fill: i % 2 ? '#ffffff' : pen.p.accent, sw: 0.8 })}</g>);
  }
  return (
    <g>
      {tall && longTop}
      {pen.body(rect(6, top + 18, W - 12, h - 10 - top - 18, 4), 'wood', M)}
      {pen.glass(rr(W / 2 - 18, top + 32, 36, 22, 3))}
      {pen.text(W / 2, top + 64, 'TICKETS', 8.5, { color: pen.p.accent, spacing: 0.5 })}
      {pen.body(ell(18, top + 64, 7, 7), 'paper', { tex: false, sw: 0.8 })}
      {pen.line(spiral(18, top + 64, 1, 5.5, 2.2), { fine: true })}
      {W >= 200 && pen.body(star(W - 22, top + 56, 9), 'brass', { gloss: false })}
      {pen.body(topFace(2, top, W - 4, 20, 6), 'linen', { tex: false })}
      {pen.pattern(topFace(2, top, W - 4, 20, 6), { kind: 'lines', angle: 90, spacing: 9, sw: 4.5, color: pen.p.accent, opacity: 0.85 })}
      {scal}
    </g>
  );
}

/** Patisserie counter: glass case of macarons and a cake stand on top. */
function Patisserie(pen: Pen, w: number, h: number): JSX.Element {
  const tall = h > w;
  const top = tall ? h - 74 : 30;
  pen.ground(w / 2, h - 10, w / 2 - 4, 5);
  const rows: JSX.Element[] = [];
  const cols = Math.floor((w - 24) / 8);
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < cols; k++) {
      rows.push(<g key={`${r}-${k}`}>{pen.body(rr(14 + k * 8, top + 22 + r * 14, 6.4, 5, 2.4), 'fabric', { fill: pen.tint(r * 2 + (k % 3)), tex: false, sw: 0.6 })}</g>);
    }
  }
  return (
    <g>
      {tall && recede(pen, [22, 78], [4, 96], 10, top + 2, 8, 'stone', { tex: true }).el}
      {tall && macaronTower(pen, 50, 52, 0.9)}
      {tall && cakeStand(pen, 50, top - 6, 1.1)}
      {pen.body(rect(4, top + 10, w - 8, h - 10 - top - 10, 5), 'stone', M)}
      {rows}
      {pen.lines([[[10, top + 30], [w - 10, top + 30]], [[10, top + 44], [w - 10, top + 44]]], { fine: true })}
      {pen.glass(rr(8, top + 14, w - 16, 36, 3), 0.4)}
      {box(pen, 2, top, w - 4, 12, 8, 'linen', { r: 2, tex: false })}
      {!tall && cakeStand(pen, w >= 200 ? w - 40 : 70, top + 4, w >= 200 ? 1 : 0.85)}
      {!tall && w >= 200 && macaronTower(pen, 44, top + 4, 0.9)}
    </g>
  );
}

// ───────────── piano ─────────────

/** White keys with black keys in the 2-3 pattern on a key bed (x0..x1, y..y+d). */
function keyboard(pen: Pen, x0: number, x1: number, y: number, d: number): JSX.Element {
  const n = Math.max(8, Math.round((x1 - x0) / 4.4));
  const kw = (x1 - x0) / n;
  const segs: [Pt, Pt][] = [];
  const blacks: JSX.Element[] = [];
  for (let i = 1; i < n; i++) {
    const x = x0 + kw * i;
    segs.push([[x, y + 1], [x, y + d]]);
    const k = i % 7;
    if (k === 1 || k === 2 || k === 4 || k === 5 || k === 6) {
      blacks.push(<g key={i}>{pen.body(rect(x - kw * 0.32, y, kw * 0.64, d * 0.58, 0.4), 'darkwood', { tex: false, sw: 0.4 })}</g>);
    }
  }
  return (
    <g>
      {pen.body(rect(x0, y, x1 - x0, d, 0.5), 'ceramic', { tex: false, gloss: false, sw: 0.8 })}
      {pen.lines(segs, { fine: true })}
      {blacks}
    </g>
  );
}

export function Piano(pen: Pen, w: number, h: number): JSX.Element {
  if (h > w) return GrandPiano(pen, h);
  pen.ground(w / 2, 89, w / 2 - 4, 5);
  const x0 = 6;
  const x1 = w - 6;
  return (
    <g>
      {/* case + lid */}
      {box(pen, x0 - 2, 6, x1 - x0 + 4, 42, 7, 'darkwood', { ...M, r: 1.5, taper: 2 })}
      {pen.line(rr(x0 + 6, 18, x1 - x0 - 12, 24, 3), { fine: true })}
      {/* sheet music on the desk */}
      {pen.body(poly([[w / 2 - 13, 21], [w / 2, 23], [w / 2 + 13, 21], [w / 2 + 13, 37], [w / 2, 39], [w / 2 - 13, 37]]), 'paper', { tex: false, sw: 0.7 })}
      {pen.lines([25, 29, 33].flatMap((y) => [[[w / 2 - 11, y], [w / 2 - 2, y + 1]], [[w / 2 + 2, y + 1], [w / 2 + 11, y]]] as [Pt, Pt][]), { fine: true })}
      {/* sconces */}
      {candle(pen, x0 + 8, 20, 7, 3)}
      {candle(pen, x1 - 8, 20, 7, 3)}
      {pen.accent(rect(x0 + 3, 20, 10, 2.4, 1))}
      {pen.accent(rect(x1 - 13, 20, 10, 2.4, 1))}
      {/* keyboard shelf */}
      {pen.body(rect(x0 - 3, 46, x1 - x0 + 6, 4, 1), 'darkwood', {})}
      {keyboard(pen, x0, x1, 48, 9)}
      {pen.body(rect(x0 - 3, 57, x1 - x0 + 6, 5, 1), 'darkwood', {})}
      {/* lower case */}
      {pen.body(rect(x0, 62, x1 - x0, 22, 1), 'darkwood', { tex: true })}
      {pen.line(rr(x0 + 8, 65, x1 - x0 - 16, 15, 2), { fine: true })}
      {[w / 2 - 6, w / 2, w / 2 + 6].map((x) => <g key={x}>{pen.accent(rect(x - 1.6, 80, 3.2, 5, 1))}</g>)}
      {pen.body(rect(x0 - 2, 84, 10, 5, 1), 'darkwood', { tex: false })}
      {pen.body(rect(x1 - 8, 84, 10, 5, 1), 'darkwood', { tex: false })}
    </g>
  );
}

/** Grand piano along a vertical footprint: tail away from us, keyboard towards us. */
function GrandPiano(pen: Pen, h: number): JSX.Element {
  const kb = h - 54;
  const outline: Pt[] = [
    [8, kb],
    [8, 40],
    ...bez([8, 40], [8, 10], [40, 4], [56, 18]).slice(1),
    ...bez([56, 18], [70, 30], [92, 50], [92, 90]).slice(1),
    [92, kb],
  ];
  pen.ground(50, h - 10, 46, 6);
  return (
    <g>
      {leg(pen, 14, kb + 18, h - 10, 6, 'darkwood')}
      {leg(pen, 86, kb + 18, h - 10, 6, 'darkwood')}
      {leg(pen, 70, 80, 110, 6, 'darkwood', { back: true })}
      {pen.body(poly(outline), 'darkwood', M)}
      {pen.lit(poly(outline.map(([x, y]) => [x + (50 - x) * 0.1, y + 4] as Pt)), 0.6)}
      {pen.body(poly([[12, kb - 6], [12, 44], [60, 34], [86, 60], [88, kb - 6]]), 'brass', { alpha: 0.35, tex: false, sw: 0.6 })}
      {pen.lines([0, 1, 2, 3, 4].map((i) => [[18 + i * 14, kb - 10], [24 + i * 13, 50 + i * 4]] as [Pt, Pt]), { fine: true, opacity: 0.5 })}
      {/* music desk */}
      {pen.body(rect(20, kb - 16, 60, 10, 1), 'darkwood', {})}
      {pen.body(rect(36, kb - 15, 28, 8, 0.5), 'paper', { tex: false, sw: 0.6 })}
      {/* keyboard */}
      {pen.body(rect(4, kb - 2, 92, 4, 1), 'darkwood', {})}
      {keyboard(pen, 6, 94, kb + 2, 10)}
      {pen.body(rect(4, kb + 12, 92, 8, 1), 'darkwood', { tex: true })}
      {[44, 50, 56].map((x) => <g key={x}>{pen.accent(rect(x - 1.6, h - 22, 3.2, 6, 1))}</g>)}
    </g>
  );
}


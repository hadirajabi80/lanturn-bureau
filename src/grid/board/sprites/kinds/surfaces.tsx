import type { JSX } from 'react';
import { bez, circ, ell, leaf, poly, rect, rotPts, seg, spiral, type Pt } from '../core/geom';
import { macarons, star } from './ornaments';
import type { Pen } from '../core/pen';

/** Work & dining surfaces (all blocking): table, desk, counter, piano. */
const M = { main: true } as const;

/** Tiered cake stand with a frosted cake (top view). */
function cakeStand(pen: Pen, x: number, y: number, r: number): JSX.Element {
  return (
    <g>
      {pen.body(circ(x, y, r), 'ceramic', { gloss: true })}
      {pen.line(circ(x, y, r - 2.5), { fine: true, dash: '1 2' })}
      {pen.body(circ(x, y, r * 0.74), 'fabric', { fill: pen.tint(0) })}
      {macarons(pen, x, y, r * 0.52, 8, r * 0.1)}
      {pen.dot(x, y, r * 0.16, 'fruit', { fill: pen.p.danger })}
    </g>
  );
}

/** Macaron tower: three shrinking rings on a plate. */
function macaronTower(pen: Pen, x: number, y: number, r: number): JSX.Element {
  return (
    <g>
      {pen.body(circ(x, y, r), 'ceramic', { gloss: true })}
      {macarons(pen, x, y, r * 0.7, 9, r * 0.24)}
      {macarons(pen, x, y, r * 0.38, 5, r * 0.22, 0.5)}
      {pen.dot(x, y, r * 0.22, 'fabric', { fill: pen.tint(4) })}
    </g>
  );
}

export function Table(pen: Pen, L: number): JSX.Element {
  if (pen.style === 'ribbon') {
    if (L < 200) {
      return (
        <g>
          {pen.body(circ(50, 50, 37), 'wood', M)}
          {pen.body(circ(50, 50, 22), 'linen', { alpha: 0.95 })}
          {cakeStand(pen, 50, 50, 17)}
        </g>
      );
    }
    const cx = L / 2;
    return (
      <g>
        {pen.body(rect(10, 14, L - 20, 72, 14), 'wood', M)}
        {pen.body(rect(L * 0.16, 30, L * 0.68, 40, 6), 'linen', { alpha: 0.95 })}
        {cakeStand(pen, cx - 36, 50, 18)}
        {macaronTower(pen, cx + 36, 50, 16)}
        {[cx - 70, cx + 70].map((x, i) => (
          <g key={i}>
            {pen.body(circ(x, 50, 7), 'ceramic', { gloss: true })}
            {pen.dot(x, 50, 4, 'fire', { fill: '#e8b98a' })}
          </g>
        ))}
      </g>
    );
  }
  if (L < 200) {
    return (
      <g>
        {pen.body(circ(50, 50, 37), 'wood', M)}
        {pen.line(circ(50, 50, 31), { fine: true, opacity: 0.4 })}
        {pen.body(circ(50, 50, 17), 'linen', { alpha: 0.9 })}
        {pen.line(circ(50, 50, 13), { fine: true, dash: '1.5 2.5' })}
        {pen.body(circ(50, 50, 6.5), 'ceramic', {})}
        {pen.dot(50, 50, 2.6, 'fire', { glow: true })}
      </g>
    );
  }
  const cx = L / 2;
  return (
    <g>
      {pen.body(rect(10, 14, L - 20, 72, 8), 'wood', M)}
      {pen.body(rect(L * 0.18, 40, L * 0.64, 20, 1), 'linen', { alpha: 0.9 })}
      {pen.line(rect(L * 0.18 + 3, 43, L * 0.64 - 6, 14, 0), { fine: true, dash: '2 2' })}
      {pen.body(circ(cx, 50, 10), 'ceramic', {})}
      {pen.dot(cx - 3, 48, 3.2, 'fruit', { fill: pen.tint(0) })}
      {pen.dot(cx + 3.5, 51, 3.2, 'fruit', {})}
      {pen.stud(cx - 30, 50, 3.4)}
      {pen.stud(cx + 30, 50, 3.4)}
      {pen.dot(cx - 30, 50, 1.4, 'fire', { glow: true })}
      {pen.dot(cx + 30, 50, 1.4, 'fire', { glow: true })}
      {/* place settings */}
      {[cx - 52, cx + 52].map((x, i) => (
        <g key={i}>
          {pen.line(circ(x, 27, 7), { fine: true })}
          {pen.line(circ(x, 73, 7), { fine: true })}
        </g>
      ))}
    </g>
  );
}

export function Desk(pen: Pen, L: number): JSX.Element {
  const big = L >= 200;
  const padX = big ? L * 0.3 : 22;
  const padW = big ? L * 0.36 : 40;
  const paper = poly(rotPts([[0, 0], [20, 0], [20, 26], [0, 26]].map(([x, y]) => [x + (big ? L * 0.72 : 66), y + 36] as Pt), big ? L * 0.72 + 10 : 76, 49, -9));
  return (
    <g>
      {pen.body(rect(8, 16, L - 16, 68, 4), pen.style === 'steel' ? 'darkwood' : 'wood', M)}
      {pen.body(rect(padX, 30, padW, 42, 2), 'leather', { alpha: 0.95 })}
      {pen.line(rect(padX + 3, 33, padW - 6, 36, 1), { fine: true, dash: '1.5 2' })}
      {pen.body(paper, 'paper', {})}
      {pen.lines([0, 1, 2].map((i) => [[(big ? L * 0.72 : 66) + 4, 42 + i * 5], [(big ? L * 0.72 : 66) + 15, 41 + i * 5]] as [Pt, Pt]), { fine: true })}
      {/* inkwell & pen */}
      {pen.body(circ(big ? 26 : 16, 30, 5), 'glass', {})}
      {pen.dot(big ? 26 : 16, 30, 2.4, 'soil', {})}
      {pen.line(seg(big ? 22 : 14, 44, big ? 34 : 18, 64), { sw: 1.6 })}
      {/* desk lamp */}
      {big && pen.halo(L - 26, 30, 18)}
      {big && pen.body(circ(L - 26, 30, 9), 'brass', { gloss: true })}
      {big && pen.dot(L - 26, 30, 3, 'fire', { glow: true })}
    </g>
  );
}

export function Counter(pen: Pen, L: number): JSX.Element {
  const big = L >= 200;
  if (pen.style === 'candy') {
    // ticket booth: striped awning with scalloped edge, window, ticket roll
    const scal: JSX.Element[] = [];
    for (let x = 8, i = 0; x <= L - 8; x += 9, i++) {
      scal.push(<g key={i}>{pen.dot(x, 78, 4.4, 'fabric', { fill: i % 2 ? '#ffffff' : pen.p.accent })}</g>);
    }
    return (
      <g>
        {pen.body(rect(6, 8, L - 12, 66, 5), 'wood', M)}
        {pen.glass(rect(L / 2 - 18, 18, 36, 24, 3))}
        {pen.text(L / 2, 51, 'TICKETS', 8.5, { color: pen.p.accent, spacing: 0.5 })}
        {pen.body(circ(20, 24, 7.5), 'paper', {})}
        {pen.line(spiral(20, 24, 1, 6, 2.2), { fine: true })}
        {pen.body(star(L - 20, 24, 8), 'brass', { gloss: false })}
        {scal}
        {pen.body(rect(4, 62, L - 8, 16, 2), 'linen', { tex: false })}
        {pen.pattern(rect(4, 62, L - 8, 16, 2), { kind: 'lines', angle: 90, spacing: 9, sw: 4.5, color: pen.p.accent, opacity: 0.85 })}
      </g>
    );
  }
  if (pen.style === 'ribbon') {
    // patisserie counter: glass display of macaron rows + a cake stand
    const dw = big ? L * 0.55 : 52;
    const rows: JSX.Element[] = [];
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < Math.floor((dw - 8) / 8); k++) {
        rows.push(<g key={`${r}-${k}`}>{pen.dot(14 + k * 8, 32 + r * 11, 3.2, 'fabric', { fill: pen.tint(r * 2 + (k % 2)) })}</g>);
      }
    }
    return (
      <g>
        {pen.body(rect(4, 18, L - 8, 64, 6), 'stone', M)}
        {rows}
        {pen.glass(rect(8, 24, dw, 42, 3))}
        {cakeStand(pen, big ? L - 36 : 78, 42, big ? 18 : 13)}
        {big && pen.body(rect(L * 0.66, 58, 20, 16, 3), 'metal', {})}
      </g>
    );
  }
  return (
    <g>
      {pen.body(rect(4, 18, L - 8, 64, 3), pen.style === 'neon' ? 'metal' : 'stone', M)}
      {pen.shade(rect(4, 70, L - 8, 12, 0), 0.9)}
      {pen.line(seg(6, 70, L - 6, 70), { fine: true })}
      {/* register / till */}
      {pen.body(rect(big ? 18 : 12, 26, 26, 22, 3), 'metal', {})}
      {pen.body(rect(big ? 21 : 15, 29, 20, 8, 1), 'glass', {})}
      {pen.lines([0, 1, 2].map((i) => [[(big ? 22 : 16) + i * 6, 42], [(big ? 24 : 18) + i * 6, 42]] as [Pt, Pt]), { sw: 2.2 })}
      {/* glasses & a bottle */}
      {pen.glass(circ(big ? 70 : 62, 40, 6))}
      {pen.glass(circ(big ? 86 : 78, 44, 6))}
      {big && pen.body(circ(L - 40, 42, 7), 'glass', {})}
      {big && pen.dot(L - 40, 42, 2.4, 'darkwood', {})}
      {big && pen.body(ell(L - 70, 48, 12, 9), 'ceramic', {})}
      {big && pen.dot(L - 70, 48, 4, 'fruit', {})}
    </g>
  );
}

export function Piano(pen: Pen, L: number): JSX.Element {
  const keys = (x0: number, y0: number, w: number, h: number, vertical: boolean): JSX.Element => {
    // white keys as lines, black keys in the 2-3 pattern
    const n = vertical ? Math.round(h / 5) : Math.round(w / 5);
    const segs: [Pt, Pt][] = [];
    const blacks: JSX.Element[] = [];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (vertical) segs.push([[x0, y0 + h * t], [x0 + w, y0 + h * t]]);
      else segs.push([[x0 + w * t, y0], [x0 + w * t, y0 + h]]);
      const k = i % 7;
      if (k === 1 || k === 2 || k === 4 || k === 5 || k === 6) {
        blacks.push(
          <g key={i}>
            {vertical
              ? pen.body(rect(x0 + w * 0.42, y0 + h * t - 1.4, w * 0.58, 2.8, 0.5), 'darkwood', {})
              : pen.body(rect(x0 + w * t - 1.4, y0, 2.8, h * 0.58, 0.5), 'darkwood', {})}
          </g>,
        );
      }
    }
    return (
      <g>
        {pen.body(rect(x0, y0, w, h, 1), 'ceramic', {})}
        {pen.lines(segs, { fine: true })}
        {blacks}
      </g>
    );
  };

  if (L < 200) {
    // upright piano against the wall
    return (
      <g>
        {pen.body(rect(6, 10, 88, 44, 3), 'darkwood', M)}
        {pen.line(rect(12, 16, 76, 32, 2), { fine: true })}
        {pen.stud(16, 22, 3)}
        {pen.stud(84, 22, 3)}
        {keys(10, 54, 80, 18, false)}
        {pen.line(seg(8, 74, 92, 74), {})}
      </g>
    );
  }
  // grand piano: straight bass side, curved tail, S-curved treble side
  const outline: Pt[] = [
    [24, 10],
    [L - 46, 10],
    ...bez([L - 46, 10], [L - 2, 10], [L - 2, 66], [L - 36, 68]).slice(1),
    ...bez([L - 36, 68], [L * 0.62, 70], [L * 0.52, 90], [L * 0.34, 90]).slice(1),
    [24, 90],
  ];
  return (
    <g>
      {pen.body(poly(outline), 'darkwood', M)}
      {pen.line(poly(outline.map(([x, y]) => [x + (x - L / 2) * -0.06, y + (y - 50) * -0.12] as Pt)), { fine: true, opacity: 0.5 })}
      {/* lid hinge & music desk */}
      {pen.line(seg(28, 16, L - 50, 16), { fine: true })}
      {pen.body(rect(30, 26, 8, 48, 1.5), 'wood', {})}
      {/* strings fan */}
      {pen.lines([0, 1, 2, 3, 4].map((i) => [[44, 22 + i * 12], [L * 0.62 - i * 10, 18 + i * 9]] as [Pt, Pt]), { fine: true, opacity: 0.35 })}
      {pen.body(leaf(L * 0.56, 34, 22, 12, 20), 'brass', { alpha: 0.6 })}
      {keys(8, 12, 16, 76, true)}
    </g>
  );
}

import type { JSX } from 'react';
import { arc, circ, ngon, poly, rect, seg, spiral, type Pt } from '../core/geom';
import { bow, star, wedges } from './ornaments';
import type { Pen } from '../core/pen';

/** Cargo & travel (all blocking): crate, barrel, anchor, suitcase, trolley. */
const M = { main: true } as const;

const STENCILS = ['HPD', 'No.7', 'TEA', 'FRAGILE', 'RUM', 'G&W', 'XXX', 'H.P.'];

export function Crate(pen: Pen): JSX.Element {
  const stencil = STENCILS[Math.floor(pen.rand() * STENCILS.length)];
  const planks: [Pt, Pt][] = [[[16, 32], [84, 32]], [[16, 50], [84, 50]], [[16, 68], [84, 68]]];
  if (pen.style === 'rope') {
    return (
      <g>
        {pen.body(rect(13, 13, 74, 74, 2), 'wood', M)}
        {pen.lines(planks, { fine: true })}
        {pen.bar(seg(24, 10, 24, 90), 3.2, 'rope')}
        {pen.bar(seg(10, 76, 90, 76), 3.2, 'rope')}
        {pen.text(55, 44, stencil, stencil.length > 4 ? 10 : 15, { opacity: 0.6, spacing: 1 })}
        {pen.stud(18, 18, 1.6)}
        {pen.stud(82, 18, 1.6)}
        {pen.stud(18, 82, 1.6)}
        {pen.stud(82, 82, 1.6)}
      </g>
    );
  }
  if (pen.style === 'candy') {
    // prize crate: candy-striped planks, a big star and two little ones
    return (
      <g>
        {pen.body(rect(13, 13, 74, 74, 4), 'wood', M)}
        {pen.lines(planks, { fine: true })}
        {pen.body(star(50, 46, 20), 'brass', { gloss: false })}
        {pen.dot(46, 42, 2, 'paper', {})}
        {pen.body(star(24, 76, 6), 'fabric', { fill: pen.tint(1) })}
        {pen.body(star(77, 23, 6), 'fabric', { fill: pen.tint(0) })}
        {pen.text(52, 76, 'PRIZE', 7.5, { color: pen.p.accent })}
      </g>
    );
  }
  if (pen.style === 'neon') {
    // stacked plastic crates with a grid of hand-holes
    return (
      <g>
        {pen.body(rect(13, 13, 74, 74, 6), 'metal', M)}
        {pen.lines([[[25, 18], [25, 82]], [[37.5, 18], [37.5, 82]], [[50, 18], [50, 82]], [[62.5, 18], [62.5, 82]], [[75, 18], [75, 82]], [[18, 30], [82, 30]], [[18, 50], [82, 50]], [[18, 70], [82, 70]]], { fine: true })}
        {pen.accent(rect(38, 15, 24, 5, 2.5), { fill: false, glow: true, sw: 1.4 })}
      </g>
    );
  }
  return (
    <g>
      {pen.body(rect(13, 13, 74, 74, 2), 'wood', M)}
      {pen.line(rect(21, 21, 58, 58, 0), {})}
      {pen.lines(planks.map(([a, b]) => [[a[0] + 6, a[1]], [b[0] - 6, b[1]]] as [Pt, Pt]), { fine: true })}
      {pen.bar(seg(24, 24, 76, 76), 5, 'wood')}
      {pen.stud(17, 17, 1.6)}
      {pen.stud(83, 17, 1.6)}
      {pen.stud(17, 83, 1.6)}
      {pen.stud(83, 83, 1.6)}
    </g>
  );
}

export function Barrel(pen: Pen): JSX.Element {
  if (pen.style === 'candy') {
    // popcorn barrel: red & white striped tub heaped with popcorn
    const corn: JSX.Element[] = [];
    for (let i = 0; i < 22; i++) {
      const a = pen.rand() * Math.PI * 2;
      const r = Math.sqrt(pen.rand()) * 19;
      corn.push(<g key={i}>{pen.body(ngon(50 + Math.cos(a) * r, 50 + Math.sin(a) * r, 4.2, 6, pen.rand() * 60, 3), 'fruit', { fill: i % 3 ? '#fff6dc' : '#ffe08a' })}</g>);
    }
    return (
      <g>
        {pen.body(circ(50, 50, 34), 'fabric', { ...M, tex: false })}
        {wedges(pen, 50, 50, 33, 16, pen.p.danger, '#ffffff')}
        {pen.body(circ(50, 50, 24), 'fruit', { fill: '#fff1c8' })}
        {corn}
      </g>
    );
  }
  const staves: [Pt, Pt][] = [-14, -7, 0, 7, 14].map((dx) => {
    const h = Math.sqrt(21 * 21 - dx * dx);
    return [[50 + dx, 50 - h], [50 + dx, 50 + h]];
  });
  return (
    <g>
      {pen.body(circ(50, 50, 34), pen.style === 'neon' ? 'metal' : 'wood', M)}
      {pen.accent(circ(50, 50, 31.5), { fill: false, sw: 3 })}
      {pen.body(circ(50, 50, 23), 'wood', { alpha: 0.9 })}
      {pen.accent(circ(50, 50, 23), { fill: false, sw: 2 })}
      {pen.lines(staves, { fine: true })}
      {pen.dot(61, 50, 3.4, 'darkwood', {})}
      {pen.style === 'rope' && pen.text(42, 44, 'XO', 7, { opacity: 0.5 })}
    </g>
  );
}

export function Anchor(pen: Pen): JSX.Element {
  const coil = pen.style === 'rope';
  const cx = coil ? 40 : 50;
  const flA = arc(cx, 56, 24, 30, 150);
  const fluke = (sx: number): Pt[] => {
    const x = cx + sx * 20.8;
    return [[x, 68], [x + sx * 10, 58], [x + sx * 2, 74]];
  };
  return (
    <g>
      {coil && pen.bar(spiral(74, 72, 3, 18, 3), 3.4, 'rope', { main: true })}
      {pen.bar(seg(cx, 22, cx, 80), 7, 'metal', { main: true })}
      {pen.bar(seg(cx - 18, 30, cx + 18, 30), 4.5, 'darkwood', { main: true })}
      {pen.dot(cx - 19, 30, 3.4, 'darkwood', {})}
      {pen.dot(cx + 19, 30, 3.4, 'darkwood', {})}
      {pen.bar(flA, 6.5, 'metal', { main: true })}
      {pen.body(poly(fluke(1)), 'metal', {})}
      {pen.body(poly(fluke(-1)), 'metal', {})}
      {pen.bar(circ(cx, 14, 6.5), 3, 'metal')}
      {coil && pen.bar(poly([[cx + 5, 12], [60, 22], [70, 52]], false), 2.4, 'rope')}
    </g>
  );
}

export function Suitcase(pen: Pen): JSX.Element {
  if (pen.style === 'lace') {
    // stacked hatboxes tied with a ribbon bow
    return (
      <g>
        {pen.body(circ(56, 56, 30), 'leather', { ...M, tex: false })}
        {pen.pattern(circ(56, 56, 28), { kind: 'lines', angle: 90, spacing: 8, sw: 3, color: '#ffffff', opacity: 0.55 })}
        {pen.line(circ(56, 56, 25), { fine: true })}
        {pen.body(circ(38, 38, 18), 'fabric', { fill: pen.tint(0), cast: true })}
        {pen.line(circ(38, 38, 14.5), { fine: true })}
        {pen.accent(seg(38, 20, 38, 56), { fill: false, sw: 2.4 })}
        {bow(pen, 38, 38, 9, pen.p.accent2)}
      </g>
    );
  }
  const mat = pen.style === 'neon' ? 'metal' : 'leather';
  return (
    <g>
      {pen.body(rect(18, 26, 64, 52, 6), mat, M)}
      {pen.line(rect(22, 30, 56, 44, 4), { fine: true, dash: '2 2' })}
      {pen.accent(seg(36, 26, 36, 78), { fill: false, sw: 3 })}
      {pen.accent(seg(64, 26, 64, 78), { fill: false, sw: 3 })}
      {pen.body(rect(42, 18, 16, 9, 4), mat, {})}
      {pen.stud(22, 30, 2.2)}
      {pen.stud(78, 30, 2.2)}
      {pen.stud(22, 74, 2.2)}
      {pen.stud(78, 74, 2.2)}
      {pen.body(rect(44, 54, 13, 9, 1), 'paper', { fill: pen.tint(2) })}
    </g>
  );
}

export function Trolley(pen: Pen): JSX.Element {
  if (pen.style === 'candy') {
    // candy-floss cart under a striped parasol, with floss clouds peeking out
    const puffs: [number, number, number][] = [[22, 82, 7], [33, 87, 6], [78, 83, 7]];
    const wheels: Pt[] = [[16, 16], [84, 16], [16, 84], [84, 84]];
    return (
      <g>
        {wheels.map(([x, y], i) => (
          <g key={i}>{pen.dot(x, y, 5, 'darkwood', {})}</g>
        ))}
        {pen.body(rect(12, 18, 76, 64, 6), 'metal', { ...M, alpha: 0.9 })}
        {puffs.map(([x, y, r], i) => (
          <g key={'c' + i}>{pen.body(ngon(x, y, r, 7, i * 20, r * 0.8), 'fabric', { fill: i === 1 ? pen.tint(1) : pen.tint(4) })}</g>
        ))}
        {wedges(pen, 50, 46, 30, 10, pen.p.accent, '#ffffff')}
        {pen.accent(circ(50, 46, 4))}
      </g>
    );
  }
  const wheels: Pt[] = [[18, 18], [82, 18], [18, 82], [82, 82]];
  const cart = pen.style === 'deco' || pen.style === 'marble' || pen.style === 'steel' ? 'brass' : 'metal';
  return (
    <g>
      {wheels.map(([x, y], i) => (
        <g key={i}>{pen.dot(x, y, 5, 'darkwood', {})}</g>
      ))}
      {pen.body(rect(14, 20, 72, 60, 4), cart, { ...M, alpha: 0.75 })}
      {pen.lines([[[16, 35], [84, 35]], [[16, 50], [84, 50]], [[16, 65], [84, 65]]], { fine: true })}
      {pen.bar(seg(9, 22, 9, 78), 4, cart)}
      {/* luggage */}
      {pen.body(rect(24, 26, 40, 30, 4), 'leather', { fill: pen.tint(0) })}
      {pen.accent(seg(34, 26, 34, 56), { fill: false, sw: 2 })}
      {pen.accent(seg(54, 26, 54, 56), { fill: false, sw: 2 })}
      {pen.body(rect(46, 52, 30, 22, 2), 'wood', {})}
      {pen.lines([[[46, 63], [76, 63]]], { fine: true })}
    </g>
  );
}

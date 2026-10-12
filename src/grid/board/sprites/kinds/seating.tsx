import type { JSX } from 'react';
import { arcPts, ell, poly, rect, rotPts, rr, seg, smooth, spiral, topFace, type Pt } from '../core/geom';
import { box, cyl, leg, strut, wrap } from '../core/kit';
import type { Pen } from '../core/pen';
import type { Material } from '../styles/types';

/**
 * Seating - every piece here is OCCUPIABLE, so all parts are drawn `open` (lighter, airier)
 * and the seat itself stays clear for a suspect pin. Three-quarter view: backrest behind,
 * seat facing the viewer, legs down to a soft contact shadow.
 */
const O = { open: true } as const;
const M = { open: true, main: true } as const;

/** Upholstery material per style (wood slats in the docks, plush on the train...). */
function seatMat(pen: Pen): Material {
  if (pen.style === 'rope' || pen.style === 'ink') return 'wood';
  if (pen.style === 'neon') return 'metal';
  return 'fabric';
}

/** Frame material (legs, rails). */
function frameMat(pen: Pen): Material {
  if (pen.style === 'neon') return 'metal';
  if (pen.style === 'steel' || pen.style === 'deco') return 'darkwood';
  return 'wood';
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

/** A plush cushion box: lit top, rounded front, optional button tufts. */
function cushion(pen: Pen, x: number, y: number, w: number, h: number, d: number, m: Material, o: { main?: boolean; fill?: string } = {}): JSX.Element {
  return box(pen, x, y, w, h, d, m, { ...O, main: o.main, fill: o.fill, r: Math.min(5, (h - d) / 2), taper: 1.5 });
}

// ───────────── chair ─────────────

export function Chair(pen: Pen): JSX.Element {
  const fm = frameMat(pen);
  if (pen.style === 'ribbon' || pen.style === 'candy') {
    // bentwood cafe chair: hoop back, round striped cushion, curly legs
    const stripe = pen.style === 'ribbon' ? pen.p.accent : pen.tint(1);
    pen.ground(50, 89, 28, 5);
    return (
      <g>
        {strut(pen, 40, 62, 36, 84, 3.6, fm, { open: true, back: true })}
        {strut(pen, 60, 62, 64, 84, 3.6, fm, { open: true, back: true })}
        {pen.bar(poly(arcPts(50, 52, 22, 42, 180, 360, 20), false), 4.2, fm, O)}
        {pen.bar(poly(arcPts(50, 50, 13, 28, 190, 350, 16), false), 2.6, fm, O)}
        {cyl(pen, 50, 56, 29, 10, 6, 'fabric', { ...M, tex: false, topFill: '#ffffff' })}
        {pen.pattern(ell(50, 56, 26, 8.5), { kind: 'lines', angle: 90, spacing: 8, sw: 3.6, color: stripe, opacity: 0.5 })}
        {pen.bar(poly([[28, 64], [24, 78], [20, 90]], false), 3.8, fm, O)}
        {pen.bar(poly([[72, 64], [76, 78], [80, 90]], false), 3.8, fm, O)}
        {pen.line(wrap(50, 76, 20, 5), { fine: true })}
      </g>
    );
  }
  if (pen.style === 'neon') {
    // chrome diner chair: tubular frame, padded vinyl back and seat
    pen.ground(50, 89, 30, 5);
    return (
      <g>
        {pen.bar(poly([[32, 60], [30, 84]], false), 3, 'metal', O)}
        {pen.bar(poly([[68, 60], [70, 84]], false), 3, 'metal', O)}
        {pen.bar(poly([[28, 58], [28, 12], [72, 12], [72, 58]], false), 3.2, 'metal', { ...O, main: true })}
        {pen.body(rr(31, 15, 38, 28, 7), 'fabric', { ...O, fill: pen.p.accent, alpha: 0.5 })}
        {pen.line(seg(36, 29, 64, 29), { fine: true })}
        {box(pen, 20, 50, 60, 20, 12, 'fabric', { ...M, r: 4, taper: 4, fill: pen.p.accent, alpha: 0.5 })}
        {pen.accent(rect(20, 66, 60, 3, 1.4), { glow: true })}
        {pen.bar(poly([[24, 70], [22, 90]], false), 3.4, 'metal', O)}
        {pen.bar(poly([[76, 70], [78, 90]], false), 3.4, 'metal', O)}
      </g>
    );
  }
  if (pen.style === 'steel') {
    // dining-car chair: upholstered wing back with a lace antimacassar
    pen.ground(50, 90, 32, 5);
    return (
      <g>
        {leg(pen, 32, 62, 84, 4.6, 'darkwood', { ...O, back: true })}
        {leg(pen, 68, 62, 84, 4.6, 'darkwood', { ...O, back: true })}
        {leg(pen, 31, 30, 56, 5, 'darkwood', O)}
        {leg(pen, 69, 30, 56, 5, 'darkwood', O)}
        {pen.body(rr(28, 6, 44, 42, 14, 14, 4, 4), 'fabric', M)}
        {pen.body(rr(36, 8, 28, 12, 3, 3, 6, 6), 'linen', { ...O, alpha: 1.1 })}
        {pen.line(seg(38, 17, 62, 17), { fine: true, dash: '1 2' })}
        {cushion(pen, 22, 50, 56, 20, 12, 'fabric')}
        {leg(pen, 26, 70, 90, 5.5, 'darkwood', O)}
        {leg(pen, 74, 70, 90, 5.5, 'darkwood', O)}
      </g>
    );
  }
  const mat = seatMat(pen);
  const wood = mat !== 'fabric';
  pen.ground(50, 89, 30, 5);
  return (
    <g>
      {/* back legs (behind the seat) */}
      {leg(pen, 31, 62, 84, 4.6, fm, { ...O, back: true })}
      {leg(pen, 69, 62, 84, 4.6, fm, { ...O, back: true })}
      {/* backrest: two posts, a curved top rail, spindles or an upholstered pad */}
      {leg(pen, 30, 10, 58, 5, fm, O)}
      {leg(pen, 70, 10, 58, 5, fm, O)}
      {wood
        ? pen.lines([[[40, 22], [40, 52]], [[50, 22], [50, 52]], [[60, 22], [60, 52]]], { sw: 2.2 })
        : pen.body(rr(33, 18, 34, 30, 8), 'fabric', { ...O, fill: pen.style === 'blueprint' ? undefined : pen.tint(0) })}
      {pen.body(rr(24, 7, 52, 13, 6, 6, 3, 3), fm, M)}
      {pen.style === 'deco' && pen.lines(fan(50, 48, 16, 5), { fine: true })}
      {/* seat */}
      {box(pen, 20, 50, 60, 22, 14, mat, { ...O, r: 2.5, taper: 4, fill: wood ? undefined : pen.style === 'blueprint' ? undefined : pen.tint(0) })}
      {wood && pen.lines([[[27, 56], [73, 56]], [[25, 61], [75, 61]]], { fine: true, opacity: 0.45 })}
      {!wood && pen.line(topFace(27, 53, 46, 8, 3), { fine: true, dash: '2 2' })}
      {/* front legs */}
      {leg(pen, 24, 72, 90, 5.5, fm, O)}
      {leg(pen, 76, 72, 90, 5.5, fm, O)}
    </g>
  );
}

// ───────────── armchair ─────────────

export function Armchair(pen: Pen): JSX.Element {
  const mat: Material = pen.style === 'rope' ? 'leather' : 'fabric';
  const fill = pen.style === 'blueprint' || pen.style === 'neon' ? undefined : pen.tint(pen.style === 'ink' ? 0 : 2);
  const tinted = pen.style === 'ink' || pen.style === 'chalk' ? fill : undefined;
  const fm = frameMat(pen);
  pen.ground(50, 89, 40, 5.5);
  const arm = (x: number) => (
    <g>
      {pen.body(rr(x, 42, 20, 42, 6, 6, 3, 3), mat, { ...O, fill: tinted })}
      {pen.body(ell(x + 10, 43, 10.5, 7), mat, { ...O, fill: tinted, tex: false })}
      {pen.lit(ell(x + 10, 43, 10.5, 7))}
      {pen.line(ell(x + 10, 44, 4.5, 3.6), { fine: true })}
    </g>
  );
  return (
    <g>
      {/* rounded wing back */}
      {pen.body(rr(16, 6, 68, 52, 24, 24, 4, 4), mat, { ...M, fill: tinted })}
      {pen.line(rr(24, 13, 52, 38, 18, 18, 2, 2), { fine: true, dash: mat === 'fabric' ? '2 2.5' : undefined })}
      {pen.style === 'deco' && pen.lines(fan(50, 50, 24, 7), { fine: true })}
      {pen.style === 'steel' && pen.body(rr(36, 9, 28, 12, 3, 3, 6, 6), 'linen', O)}
      {/* seat cushion + skirt */}
      {pen.body(rect(24, 70, 52, 12, 2), mat, { ...O, fill: tinted })}
      {pen.shade(rect(25, 77, 50, 4), 0.5)}
      {cushion(pen, 24, 52, 52, 22, 11, mat, { fill: tinted })}
      {arm(6)}
      {arm(74)}
      {pen.style === 'rope' && [14, 22, 30].map((y) => <g key={y}>{pen.stud(10, 46 + y, 1.4)}{pen.stud(90, 46 + y, 1.4)}</g>)}
      {/* bun feet */}
      {[12, 88].map((x) => <g key={x}>{pen.body(rr(x - 4, 83, 8, 6, 1, 1, 3, 3), fm, { ...O, tex: false, sw: 0.7 })}</g>)}
    </g>
  );
}

// ───────────── sofa ─────────────

export function Sofa(pen: Pen, w: number, h: number): JSX.Element {
  if (h > w) return SofaSide(pen, h);
  const mat: Material = pen.style === 'rope' ? 'leather' : 'fabric';
  const tinted = pen.style === 'ink' || pen.style === 'chalk' ? pen.tint(1) : undefined;
  const fm = frameMat(pen);
  if (pen.style === 'lace' && w >= 200) return Chaise(pen, w);
  const n = w >= 200 ? 3 : 2;
  const x0 = 22;
  const cw = (w - 44) / n;
  pen.ground(w / 2, 89, w / 2 - 6, 5.5);
  const arm = (x: number) => (
    <g>
      {pen.body(rr(x, 40, 20, 44, 6, 6, 3, 3), mat, { ...O, fill: tinted })}
      {pen.body(ell(x + 10, 41, 10.5, 7), mat, { ...O, fill: tinted, tex: false })}
      {pen.lit(ell(x + 10, 41, 10.5, 7))}
      {pen.line(ell(x + 10, 42, 4.5, 3.6), { fine: true })}
    </g>
  );
  const pillow = poly(rotPts([[x0 + 3, 32], [x0 + 22, 30], [x0 + 24, 50], [x0 + 5, 52]] as Pt[], x0 + 14, 41, -12));
  return (
    <g>
      {/* back with one cushion per seat */}
      {pen.body(rr(10, 10, w - 20, 48, 14, 14, 3, 3), mat, { ...M, fill: tinted })}
      {Array.from({ length: n }, (_, i) => (
        <g key={`b${i}`}>{pen.body(rr(x0 + i * cw + 1.5, 18, cw - 3, 34, 9, 9, 3, 3), mat, { ...O, fill: tinted, tex: false })}</g>
      ))}
      {pen.style === 'steel' && Array.from({ length: n }, (_, i) => (
        <g key={`a${i}`}>{pen.body(rr(x0 + i * cw + cw / 2 - 12, 13, 24, 11, 2, 2, 5, 5), 'linen', O)}</g>
      ))}
      {pen.style === 'deco' && pen.lines(fan(w / 2, 52, 26, 9), { fine: true })}
      {/* base + seat cushions */}
      {pen.body(rect(18, 70, w - 36, 13, 2), mat, { ...O, fill: tinted })}
      {pen.shade(rect(19, 77, w - 38, 5), 0.5)}
      {Array.from({ length: n }, (_, i) => (
        <g key={`s${i}`}>{cushion(pen, x0 + i * cw + 0.5, 50, cw - 1, 24, 11, mat, { fill: tinted })}</g>
      ))}
      {pen.body(pillow, 'fabric', { ...O, fill: pen.tint(pen.style === 'ink' ? 3 : 1) })}
      {arm(4)}
      {arm(w - 24)}
      {[10, w - 10].map((x) => <g key={x}>{pen.body(rr(x - 4, 83, 8, 6, 1, 1, 3, 3), fm, { ...O, tex: false, sw: 0.7 })}</g>)}
    </g>
  );
}

/** A sofa along a vertical footprint, seen side-on: back on the left, arms at both ends. */
function SofaSide(pen: Pen, h: number): JSX.Element {
  const mat: Material = pen.style === 'rope' ? 'leather' : 'fabric';
  const tinted = pen.style === 'ink' || pen.style === 'chalk' ? pen.tint(1) : undefined;
  const fm = frameMat(pen);
  const n = 3;
  const y0 = 40;
  const y1 = h - 50;
  const ch = (y1 - y0) / n;
  pen.ground(50, h - 10, 46, 7);
  return (
    <g>
      {/* far arm */}
      {box(pen, 8, 8, 86, 36, 16, mat, { ...O, fill: tinted, r: 6, taper: 3 })}
      {/* back along the left */}
      {pen.body(rr(6, 22, 26, h - 52, 12, 6, 6, 12), mat, { ...M, fill: tinted })}
      {pen.lit(rr(8, 24, 10, h - 56, 6))}
      {pen.style === 'steel' && pen.body(rr(9, 70, 14, 34, 3), 'linen', O)}
      {/* seat cushions from the back to the front */}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{cushion(pen, 30, y0 + i * ch, 60, ch + 8, ch - 2, mat, { fill: tinted, main: i === 1 })}</g>
      ))}
      {pen.body(rotPillow(46, y0 + 14), 'fabric', { ...O, fill: pen.tint(pen.style === 'ink' ? 3 : 1) })}
      {/* near arm with a rolled front */}
      {box(pen, 6, h - 52, 88, 40, 14, mat, { ...O, fill: tinted, r: 7, taper: 2 })}
      {pen.line(rr(12, h - 34, 76, 16, 6), { fine: true, dash: '2 2' })}
      {[12, 88].map((x) => <g key={x}>{pen.body(rr(x - 4, h - 13, 8, 6, 1, 1, 3, 3), fm, { ...O, tex: false, sw: 0.7 })}</g>)}
    </g>
  );
}

function rotPillow(cx: number, cy: number) {
  return poly(rotPts([[cx - 10, cy - 9], [cx + 10, cy - 10], [cx + 11, cy + 9], [cx - 9, cy + 10]] as Pt[], cx, cy, 14));
}

/** Boutique chaise longue: scrolled high head end, low back, bolster, cabriole legs. */
function Chaise(pen: Pen, w: number): JSX.Element {
  pen.ground(w / 2, 89, w / 2 - 8, 5.5);
  const head = smooth([[8, 86], [6, 40], [10, 14], [24, 8], [36, 16], [34, 30], [28, 34], [30, 86]]);
  return (
    <g>
      {pen.body(rr(20, 26, w * 0.62, 34, 16, 16, 3, 3), 'fabric', M)}
      {pen.body(rect(26, 70, w - 40, 12, 3), 'fabric', O)}
      {cushion(pen, 24, 50, w - 36, 26, 12, 'fabric')}
      {pen.body(head, 'fabric', O)}
      {pen.line(spiral(23, 20, 1, 7, 1.6), { fine: true })}
      {pen.body(rr(34, 44, 30, 14, 7), 'fabric', { ...O, fill: pen.tint(1) })}
      {pen.lines([[[40, 45], [40, 57]], [[58, 45], [58, 57]]], { fine: true })}
      {[[16, 82], [w - 18, 82]].map(([x, y]) => <g key={x}>{pen.bar(poly([[x, y], [x - 3, y + 4], [x + 1, y + 8]], false), 3, 'brass', O)}</g>)}
    </g>
  );
}

// ───────────── stool ─────────────

export function Stool(pen: Pen): JSX.Element {
  const soft = pen.style === 'steel' || pen.style === 'ribbon' || pen.style === 'lace' || pen.style === 'candy';
  const mat: Material = pen.style === 'neon' ? 'metal' : soft ? 'fabric' : pen.style === 'deco' ? 'leather' : 'wood';
  const fm: Material = pen.style === 'neon' ? 'metal' : frameMat(pen);
  pen.ground(50, 89, 27, 5);
  return (
    <g>
      {strut(pen, 50, 46, 50, 82, 4.8, fm, { open: true, back: true })}
      {strut(pen, 34, 46, 22, 90, 5.2, fm, O)}
      {strut(pen, 66, 46, 78, 90, 5.2, fm, O)}
      {pen.bar(seg(28, 72, 72, 72), 2.6, fm, O)}
      {cyl(pen, 50, 40, 29, 10.5, 8, mat, { ...M, fill: soft && pen.style !== 'steel' ? pen.tint(0) : undefined })}
      {soft && pen.stud(50, 40, 1.8)}
      {!soft && pen.line(ell(50, 40, 19, 6.5), { fine: true, opacity: 0.45 })}
      {pen.style === 'neon' && pen.accent(wrap(50, 48, 29, 10.5), { fill: false, sw: 1.6, glow: true })}
    </g>
  );
}

// ───────────── bench ─────────────

export function Bench(pen: Pen, w: number, h: number): JSX.Element {
  const tall = h > w;
  if (pen.style === 'steel') return tall ? PlushSide(pen, h) : Plush(pen, w);
  if (pen.style === 'marble' || pen.style === 'deco' || pen.style === 'ribbon' || pen.style === 'lace') return Ottoman(pen, w, h);
  return tall ? ParkSide(pen, h) : Park(pen, w);
}

/** Slatted park bench with a back and cast-iron ends. */
function Park(pen: Pen, w: number): JSX.Element {
  const mat: Material = pen.style === 'neon' ? 'metal' : pen.style === 'candy' ? 'fabric' : 'wood';
  const fill = pen.style === 'candy' ? pen.tint(0) : undefined;
  const ends = w >= 200 ? [14, w / 2, w - 14] : [14, w - 14];
  pen.ground(w / 2, 89, w / 2 - 8, 5);
  return (
    <g>
      {ends.map((x) => <g key={`r${x}`}>{pen.bar(poly([[x - 2, 12], [x, 40], [x - 3, 86]], false), 3.6, 'metal', O)}</g>)}
      {pen.body(rect(6, 14, w - 12, 10, 2.5), mat, { ...O, fill })}
      {pen.body(rect(6, 28, w - 12, 10, 2.5), mat, { ...O, fill })}
      {box(pen, 4, 48, w - 8, 22, 15, mat, { ...M, r: 2, taper: 3, fill })}
      {pen.lines([[[9, 53], [w - 9, 53]], [[7, 58], [w - 7, 58]]], { fine: true })}
      {ends.map((x) => (
        <g key={`f${x}`}>
          {pen.bar(poly([[x + 1, 66], [x + 4, 78], [x + 2, 89]], false), 3.8, 'metal', O)}
          {pen.bar(poly([[x - 1, 40], [x + 6, 42], [x + 7, 50]], false), 2.8, 'metal', O)}
        </g>
      ))}
    </g>
  );
}

/** Park bench along a vertical footprint: back rail on the left, seat running away from us. */
function ParkSide(pen: Pen, h: number): JSX.Element {
  const mat: Material = pen.style === 'neon' ? 'metal' : pen.style === 'candy' ? 'fabric' : 'wood';
  return longSeat(pen, h, mat, 'slats', pen.style === 'candy' ? pen.tint(0) : undefined, 'metal');
}

/**
 * A long backless seat along a vertical footprint, in perspective: it narrows away from us,
 * its right side and the legs along it show, the near legs stand in front.
 * Slatted (park bench) or buttoned (ottoman).
 */
function longSeat(pen: Pen, h: number, mat: Material, top: 'slats' | 'tufts', fill: string | undefined, legMat: Material): JSX.Element {
  const s0 = 12;
  const s1 = h - 52;
  const th = 10;
  const far: [number, number] = [32, 68];
  const near: [number, number] = [18, 82];
  const at = (f: number, t: number): Pt => {
    const xl = far[0] + (near[0] - far[0]) * t;
    const xr = far[1] + (near[1] - far[1]) * t;
    return [xl + (xr - xl) * f, s0 + (s1 - s0) * t];
  };
  pen.ground(52, h - 10, 36, 6);
  const seat = poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)]);
  const side = poly([at(1, 0), [far[1] + 3, s0 + 4], [near[1] + 4, s1 + th - 2], [near[1], s1 + th], at(1, 1)]);
  const sideLegs = [0.22, 0.6].map((t) => {
    const [x, y] = at(1, t);
    return <g key={t}>{leg(pen, x + 2.5, y + 2, y + 18 + 20 * t, 3.4 + 2 * t, legMat, { ...O, back: true })}</g>;
  });
  const marks: JSX.Element[] = [];
  if (top === 'tufts') {
    let k = 0;
    for (let t = 0.1; t < 0.95; t += 0.14, k++) {
      for (const f of k % 2 ? [0.5] : [0.25, 0.75]) {
        const [x, y] = at(f, t);
        marks.push(<g key={`${t}-${f}`}>{pen.stud(x, y, 1 + 0.7 * t)}</g>);
      }
    }
  }
  const slats: [Pt, Pt][] = [0.25, 0.5, 0.75].map((f) => [at(f, 0.02), at(f, 0.99)]);
  return (
    <g>
      {sideLegs}
      {pen.body(side, mat, { ...O, fill, tex: false })}
      {pen.shade(side, 0.6)}
      {pen.body(rect(near[0], s1, near[1] - near[0], th, 2), mat, { ...O, fill })}
      {pen.body(seat, mat, { ...M, fill })}
      {pen.lit(seat)}
      {top === 'slats' && pen.lines(slats, { fine: true })}
      {top === 'slats' && pen.lines([0.25, 0.5, 0.75].map((f) => [[near[0] + (near[1] - near[0]) * f, s1 + 1], [near[0] + (near[1] - near[0]) * f, s1 + th - 1]] as [Pt, Pt]), { fine: true })}
      {marks}
      {leg(pen, near[0] + 6, s1 + th, h - 10, 5.5, legMat, O)}
      {leg(pen, near[1] - 6, s1 + th, h - 10, 5.5, legMat, O)}
      {legMat === 'metal' && pen.bar(seg(near[0] + 6, h - 26, near[1] - 6, h - 26), 2.4, 'metal', O)}
    </g>
  );
}

/** Railway compartment bench: plush back with antimacassars, brass luggage rail above. */
function Plush(pen: Pen, w: number): JSX.Element {
  const n = w >= 200 ? 3 : 2;
  const cw = (w - 12) / n;
  pen.ground(w / 2, 89, w / 2 - 6, 5);
  return (
    <g>
      {pen.bar(seg(8, 6, w - 8, 6), 2.6, 'brass', O)}
      {[12, w - 12].map((x) => <g key={x}>{pen.bar(seg(x, 6, x, 12), 2, 'brass', O)}</g>)}
      {pen.body(rr(6, 12, w - 12, 46, 8, 8, 2, 2), 'fabric', M)}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{pen.body(rr(6 + i * cw + cw / 2 - 12, 15, 24, 11, 2, 2, 5, 5), 'linen', O)}</g>
      ))}
      {pen.lines(Array.from({ length: n - 1 }, (_, i) => [[6 + (i + 1) * cw, 30], [6 + (i + 1) * cw, 56]] as [Pt, Pt]), { fine: true })}
      {pen.body(rect(8, 72, w - 16, 12, 2), 'darkwood', O)}
      {cushion(pen, 4, 50, w - 8, 26, 12, 'fabric')}
    </g>
  );
}

function PlushSide(pen: Pen, h: number): JSX.Element {
  pen.ground(50, h - 10, 44, 6);
  return (
    <g>
      {pen.bar(seg(4, 10, 4, h - 30), 2.4, 'brass', O)}
      {pen.body(rr(8, 8, 26, h - 30, 8), 'fabric', M)}
      {[40, 110].map((y) => <g key={y}>{pen.body(rr(11, y, 14, 30, 3), 'linen', O)}</g>)}
      {cushion(pen, 34, 14, 58, h - 30, h - 46, 'fabric')}
      {pen.line(seg(36, h / 2 - 8, 90, h / 2 - 8), { fine: true })}
    </g>
  );
}

/** Gallery ottoman: buttoned top on slim turned legs. */
function Ottoman(pen: Pen, w: number, h: number): JSX.Element {
  const mat: Material = pen.style === 'marble' ? 'leather' : 'fabric';
  const tall = h > w;
  if (tall) return longSeat(pen, h, mat, 'tufts', undefined, pen.style === 'marble' ? 'brass' : frameMat(pen));
  const top = tall ? 22 : 40;
  const d = tall ? h - 78 : 16;
  const x = tall ? 16 : 8;
  const bw = tall ? 68 : w - 16;
  const legY = top + d + 12;
  const legs = tall ? [x + 6, x + bw - 6] : w >= 200 ? [x + 8, w / 2, x + bw - 8] : [x + 8, x + bw - 8];
  pen.ground(w / 2, h - 10, bw / 2 + 4, 5);
  const tufts: Pt[] = [];
  const cols = Math.max(2, Math.round(bw / 22));
  const rows = Math.max(1, Math.round(d / 20));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tufts.push([x + 6 + ((bw - 12) * (c + (r % 2 ? 0.5 : 0.25))) / cols + 2, top + 5 + ((d - 8) * (r + 0.5)) / rows]);
  return (
    <g>
      {legs.map((lx) => <g key={lx}>{leg(pen, lx, legY - 4, h - 10, 5.5, pen.style === 'marble' ? 'brass' : frameMat(pen), O)}</g>)}
      {box(pen, x, top, bw, d + 14, d, mat, { ...M, r: 5, taper: 3, topMat: mat })}
      {tufts.map(([tx, ty], i) => <g key={i}>{pen.stud(tx, ty, 1.5)}</g>)}
      {pen.line(rect(x + 3, top + d + 3, bw - 6, 8, 3), { fine: true, dash: '1.5 2' })}
    </g>
  );
}

/**
 * Plain-number geometry for the furniture sprites. Every sprite is described as a list of
 * `Shape`s in a 100-unit-per-cell space; the Pen turns them into SVG in the active style.
 * Shapes are data (not paths) so they can be roughened for hand-drawn styles and hatched
 * by scanline without clipPath ids.
 */
export type Pt = [number, number];

export type Shape =
  | { t: 'rect'; x: number; y: number; w: number; h: number; r: number }
  | { t: 'ell'; cx: number; cy: number; rx: number; ry: number }
  | { t: 'poly'; pts: Pt[]; closed: boolean }
  | { t: 'arc'; cx: number; cy: number; r: number; a0: number; a1: number };

export const rect = (x: number, y: number, w: number, h: number, r = 0): Shape => ({
  t: 'rect', x, y, w, h, r: Math.max(0, Math.min(r, w / 2, h / 2)),
});
export const ell = (cx: number, cy: number, rx: number, ry = rx): Shape => ({ t: 'ell', cx, cy, rx, ry });
export const circ = (cx: number, cy: number, r: number): Shape => ell(cx, cy, r, r);
export const poly = (pts: Pt[], closed = true): Shape => ({ t: 'poly', pts, closed });
export const seg = (x1: number, y1: number, x2: number, y2: number): Shape => poly([[x1, y1], [x2, y2]], false);
/** Open arc, angles in degrees measured clockwise from +x (SVG convention). */
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number): Shape => ({ t: 'arc', cx, cy, r, a0, a1 });

const RAD = Math.PI / 180;

/** Cubic Bezier sampled to points (includes both ends). */
export function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

export function rotPts(pts: Pt[], cx: number, cy: number, deg: number): Pt[] {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}

/** A pointed leaf / petal from (x,y) pointing `deg`, `len` long and `wid` wide. */
export function leaf(x: number, y: number, len: number, wid: number, deg: number): Shape {
  const pts: Pt[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x + t * len, y - Math.sin(t * Math.PI) * (wid / 2) * (1 - 0.25 * t)]);
  }
  for (let i = n - 1; i >= 1; i--) {
    const t = i / n;
    pts.push([x + t * len, y + Math.sin(t * Math.PI) * (wid / 2) * (1 - 0.25 * t)]);
  }
  return poly(rotPts(pts, x, y, deg));
}

/** Regular polygon, or a star when `r2` is given. */
export function ngon(cx: number, cy: number, r: number, n: number, deg = -90, r2?: number): Shape {
  const pts: Pt[] = [];
  const m = r2 === undefined ? n : n * 2;
  for (let i = 0; i < m; i++) {
    const rr = r2 !== undefined && i % 2 === 1 ? r2 : r;
    const a = (deg + (360 / m) * i) * RAD;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return poly(pts);
}

/** Archimedean spiral (a coil of rope seen from above). */
export function spiral(cx: number, cy: number, r0: number, r1: number, turns: number): Shape {
  const pts: Pt[] = [];
  const n = Math.round(turns * 28);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * 360 * RAD;
    const r = r0 + (r1 - r0) * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts, false);
}

export function translate(s: Shape, dx: number, dy: number): Shape {
  switch (s.t) {
    case 'rect':
      return { ...s, x: s.x + dx, y: s.y + dy };
    case 'ell':
      return { ...s, cx: s.cx + dx, cy: s.cy + dy };
    case 'arc':
      return { ...s, cx: s.cx + dx, cy: s.cy + dy };
    case 'poly':
      return { ...s, pts: s.pts.map(([x, y]) => [x + dx, y + dy] as Pt) };
  }
}

/** Shrink a closed shape by d (polys are scaled about their bbox centre - fine for convex-ish parts). */
export function inset(s: Shape, d: number): Shape {
  switch (s.t) {
    case 'rect':
      return rect(s.x + d, s.y + d, Math.max(1, s.w - 2 * d), Math.max(1, s.h - 2 * d), Math.max(0, s.r - d * 0.6));
    case 'ell':
      return ell(s.cx, s.cy, Math.max(1, s.rx - d), Math.max(1, s.ry - d));
    case 'arc':
      return { ...s, r: Math.max(1, s.r - d) };
    case 'poly': {
      const b = bbox(s.pts);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const kx = b.w > 2 * d ? (b.w - 2 * d) / b.w : 0.5;
      const ky = b.h > 2 * d ? (b.h - 2 * d) / b.h : 0.5;
      return { ...s, pts: s.pts.map(([x, y]) => [cx + (x - cx) * kx, cy + (y - cy) * ky] as Pt) };
    }
  }
}

/** Points along the outline (corners/curves sampled; straight edges kept as end points). */
export function sample(s: Shape): { pts: Pt[]; closed: boolean } {
  switch (s.t) {
    case 'rect': {
      const { x, y, w, h, r } = s;
      if (r <= 0.5) return { pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed: true };
      const pts: Pt[] = [];
      const corner = (cx: number, cy: number, a0: number) => {
        for (let i = 0; i <= 4; i++) {
          const a = (a0 + i * 22.5) * RAD;
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
      };
      corner(x + w - r, y + r, -90);
      corner(x + w - r, y + h - r, 0);
      corner(x + r, y + h - r, 90);
      corner(x + r, y + r, 180);
      return { pts, closed: true };
    }
    case 'ell': {
      const n = Math.max(16, Math.min(64, Math.round((Math.PI * (s.rx + s.ry)) / 6)));
      const pts: Pt[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        pts.push([s.cx + Math.cos(a) * s.rx, s.cy + Math.sin(a) * s.ry]);
      }
      return { pts, closed: true };
    }
    case 'arc': {
      const span = s.a1 - s.a0;
      const n = Math.max(4, Math.round(Math.abs(span) / 8));
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const a = (s.a0 + (span * i) / n) * RAD;
        pts.push([s.cx + Math.cos(a) * s.r, s.cy + Math.sin(a) * s.r]);
      }
      return { pts, closed: false };
    }
    case 'poly':
      return { pts: s.pts, closed: s.closed };
  }
}

const f = (n: number) => (Math.round(n * 10) / 10).toString();

export function ptsD(pts: Pt[], closed: boolean): string {
  if (pts.length === 0) return '';
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${f(pts[i][0])} ${f(pts[i][1])}`;
  return closed ? d + 'Z' : d;
}

/** Exact SVG path for a shape (crisp styles). */
export function toD(s: Shape): string {
  switch (s.t) {
    case 'rect': {
      const { x, y, w, h, r } = s;
      if (r <= 0.5) return `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
      return (
        `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}` +
        `V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}` +
        `H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}` +
        `V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`
      );
    }
    case 'ell':
      return (
        `M${f(s.cx - s.rx)} ${f(s.cy)}A${f(s.rx)} ${f(s.ry)} 0 1 0 ${f(s.cx + s.rx)} ${f(s.cy)}` +
        `A${f(s.rx)} ${f(s.ry)} 0 1 0 ${f(s.cx - s.rx)} ${f(s.cy)}Z`
      );
    case 'arc': {
      const p0: Pt = [s.cx + Math.cos(s.a0 * RAD) * s.r, s.cy + Math.sin(s.a0 * RAD) * s.r];
      const p1: Pt = [s.cx + Math.cos(s.a1 * RAD) * s.r, s.cy + Math.sin(s.a1 * RAD) * s.r];
      const large = Math.abs(s.a1 - s.a0) > 180 ? 1 : 0;
      const sweep = s.a1 > s.a0 ? 1 : 0;
      return `M${f(p0[0])} ${f(p0[1])}A${f(s.r)} ${f(s.r)} 0 ${large} ${sweep} ${f(p1[0])} ${f(p1[1])}`;
    }
    case 'poly':
      return ptsD(s.pts, s.closed);
  }
}

/** Hand-drawn path: subdivide and displace with smooth noise. */
export function roughD(pts: Pt[], closed: boolean, amp: number, rnd: () => number, step = 9): string {
  if (pts.length < 2) return ptsD(pts, closed);
  const ring = closed ? [...pts, pts[0]] : pts;
  const dense: Pt[] = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 0; k < n; k++) dense.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  if (!closed) dense.push(ring[ring.length - 1]);
  let nx = (rnd() - 0.5) * 2;
  let ny = (rnd() - 0.5) * 2;
  const out: Pt[] = dense.map(([x, y]) => {
    nx = nx * 0.55 + (rnd() - 0.5) * 2 * 0.45;
    ny = ny * 0.55 + (rnd() - 0.5) * 2 * 0.45;
    return [x + nx * amp, y + ny * amp];
  });
  // a hand-drawn closed outline rarely meets itself exactly: overshoot the start a little
  if (closed && out.length > 2) {
    const [ax, ay] = out[0];
    const [bx, by] = out[1];
    return ptsD(out, false) + `L${f(ax + (rnd() - 0.5) * amp)} ${f(ay + (rnd() - 0.5) * amp)}L${f(ax + (bx - ax) * 0.35)} ${f(ay + (by - ay) * 0.35)}`;
  }
  return ptsD(out, false);
}

/** Parallel hatch segments clipped to a closed polygon (scanline). */
export function hatchSegs(pts: Pt[], deg: number, spacing: number, phase = 0): [Pt, Pt][] {
  if (pts.length < 3) return [];
  const c = Math.cos(-deg * RAD);
  const s = Math.sin(-deg * RAD);
  const rp = pts.map(([x, y]) => [x * c - y * s, x * s + y * c] as Pt);
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of rp) {
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  }
  const out: [Pt, Pt][] = [];
  const ic = Math.cos(deg * RAD);
  const is = Math.sin(deg * RAD);
  const back = ([x, y]: Pt): Pt => [x * ic - y * is, x * is + y * ic];
  const start = Math.ceil((minY - phase) / spacing) * spacing + phase;
  for (let y = start; y <= maxY; y += spacing) {
    const xs: number[] = [];
    for (let i = 0; i < rp.length; i++) {
      const [x0, y0] = rp[i];
      const [x1, y1] = rp[(i + 1) % rp.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (xs[i + 1] - xs[i] < 0.8) continue;
      out.push([back([xs[i], y]), back([xs[i + 1], y])]);
    }
  }
  return out;
}

export function inside(pts: Pt[], [px, py]: Pt): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export interface Box { x: number; y: number; w: number; h: number }

export function bbox(pts: Pt[]): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function shapeBox(s: Shape): Box {
  if (s.t === 'rect') return { x: s.x, y: s.y, w: s.w, h: s.h };
  if (s.t === 'ell') return { x: s.cx - s.rx, y: s.cy - s.ry, w: s.rx * 2, h: s.ry * 2 };
  return bbox(sample(s).pts);
}

/** Tiny deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0 || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A small heart centred on (cx, cy), roughly `s` wide. */
export function heart(cx: number, cy: number, s: number): Shape {
  const pts: Pt[] = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + (x / 34) * s, cy - (y / 34) * s - s * 0.05]);
  }
  return poly(pts);
}

/** Signed area (positive = clockwise on screen, y down). */
export function signedArea(pts: Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
}

/** Evenly resample a closed outline to n points (clockwise). */
export function resampleClosed(pts: Pt[], n: number): Pt[] {
  const ring = signedArea(pts) < 0 ? [...pts].reverse() : pts;
  const segs: number[] = [];
  let per = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    const l = Math.hypot(x1 - x0, y1 - y0);
    segs.push(l);
    per += l;
  }
  const out: Pt[] = [];
  let i = 0;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (per * k) / n;
    while (i < segs.length - 1 && acc + segs[i] < target) {
      acc += segs[i];
      i++;
    }
    const t = segs[i] > 0 ? (target - acc) / segs[i] : 0;
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
  }
  return out;
}

export function perimeter(pts: Pt[]): number {
  let per = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    per += Math.hypot(x1 - x0, y1 - y0);
  }
  return per;
}

/** Closed outline with a semicircular bump (outward) every `size` units: scallops / frills. */
export function scallopD(pts: Pt[], size: number): string {
  const n = Math.max(6, Math.round(perimeter(pts) / size));
  const ring = resampleClosed(pts, n);
  const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
  let d = `M${f1(ring[0][0])} ${f1(ring[0][1])}`;
  for (let k = 1; k <= n; k++) {
    const [x0, y0] = ring[k - 1];
    const [x1, y1] = ring[k % n];
    const r = Math.max(0.5, Math.hypot(x1 - x0, y1 - y0) / 2);
    d += `A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1)} ${f1(y1)}`;
  }
  return d + 'Z';
}

// ───────────── three-quarter view helpers ─────────────

/** Points along an elliptical arc (degrees, clockwise from +x, y down). Includes both ends. */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Rectangle with a separate radius per corner (top-left, top-right, bottom-right, bottom-left). */
export function rr(x: number, y: number, w: number, h: number, tl: number, tr = tl, br = tl, bl = tl): Shape {
  const lim = (r: number) => Math.max(0, Math.min(r, w / 2, h / 2));
  const [a, b, c, d] = [lim(tl), lim(tr), lim(br), lim(bl)];
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, r: number, a0: number, px: number, py: number) => {
    if (r < 0.5) pts.push([px, py]);
    else pts.push(...arcPts(cx, cy, r, r, a0, a0 + 90, 5));
  };
  corner(x + a, y + a, a, 180, x, y);
  corner(x + w - b, y + b, b, 270, x + w, y);
  corner(x + w - c, y + h - c, c, 0, x + w, y + h);
  corner(x + d, y + h - d, d, 90, x, y + h);
  return poly(pts);
}

/** Quadrilateral top face of a box seen from the front and above: back edge narrower by `taper` each side. */
export function topFace(x: number, y: number, w: number, d: number, taper = 0): Shape {
  return poly([[x + taper, y], [x + w - taper, y], [x + w, y + d], [x, y + d]]);
}

/**
 * Side of an upright cylinder (or a tapered tub when rxB differs): top ellipse centred (cx, y),
 * bottom ellipse centred (cx, y + h). Draw the top ellipse over it.
 */
export function cylSide(cx: number, y: number, rx: number, ry: number, h: number, rxB = rx, ryB = ry): Shape {
  return poly([...arcPts(cx, y + h, rxB, ryB, 180, 0, 18), ...arcPts(cx, y, rx, ry, 0, 180, 18)]);
}

/** A closed outline through points with smooth (Catmull-Rom) curves. */
export function smooth(pts: Pt[], closed = true, n = 6): Shape {
  const out: Pt[] = [];
  const m = pts.length;
  const at = (i: number): Pt => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
  const last = closed ? m : m - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[m - 1]);
  return poly(out, closed);
}

import type { JSX } from 'react';
import { mix } from '../../../../components/avatar/color';
import type { SkinPalette, WallStyle } from '../../../skins/types';
import type { Hatch, Material, StyleDef } from '../styles/types';
import {
  circ, hatchSegs, inset, inside, perimeter, resampleClosed, rot90, rotPt, roughD, rng, sample, scallopD, shapeBox, toD, translate,
  type Pt, type Shape,
} from './geom';

export interface BodyOpts {
  /** occupiable part: lighter, airier, never casts a shadow. */
  open?: boolean;
  /** principal body of the piece: casts the shadow, gets texture, rule, gloss and glow. */
  main?: boolean;
  /** force texture on/off (default: main). */
  tex?: boolean;
  /** force gloss on/off (default: main && !open). */
  gloss?: boolean;
  /** fill opacity multiplier. */
  alpha?: number;
  /** override fill colour (book spines, paint dabs) - use pen.tint(i). */
  fill?: string;
  /** force the cast shadow on/off (default: main && !open). */
  cast?: boolean;
  /** force the glow rim on/off (default: main). */
  glow?: boolean;
}

export interface LineOpts {
  fine?: boolean;
  dash?: string;
  opacity?: number;
  color?: string;
  sw?: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * The Pen draws shapes in one style. Kinds describe a piece in a horizontal L x 100 frame;
 * for vertical 2-cell footprints the Pen rotates every shape by 90 deg (exactly, without
 * an SVG transform) so hatching angles, shadows and wobble stay consistent on the board.
 */
export class Pen {
  readonly style: WallStyle;
  readonly p: SkinPalette;
  readonly def: StyleDef;
  readonly rot: boolean;
  readonly L: number;
  readonly shadows: JSX.Element[] = [];
  readonly glows: JSX.Element[] = [];
  /** main blocking bodies in final (board-local) coordinates, for style overlays. */
  readonly solids: { s: Shape; m: Material }[] = [];
  private readonly jit: () => number;
  private readonly vary: () => number;
  private k = 0;

  constructor(o: { def: StyleDef; palette: SkinPalette; rot: boolean; L: number; seed: number }) {
    this.def = o.def;
    this.style = o.def.id;
    this.p = o.palette;
    this.rot = o.rot;
    this.L = o.L;
    this.jit = rng(o.seed ^ 0x5bd1e995);
    this.vary = rng(o.seed);
  }

  /** Deterministic variation for kinds (same across styles for the same seed). */
  rand(): number {
    return this.vary();
  }

  tint(i: number): string {
    const t = this.def.tints(this.p);
    return t[((i % t.length) + t.length) % t.length];
  }

  private key(): string {
    return `p${this.k++}`;
  }

  private X(s: Shape): Shape {
    return this.rot ? rot90(s) : s;
  }

  private d(S: Shape, ampK = 1): string {
    const amp = this.def.rough * ampK;
    if (amp <= 0) return toD(S);
    const { pts, closed } = sample(S);
    return roughD(pts, closed, amp, this.jit);
  }

  private closed(S: Shape): boolean {
    return S.t === 'rect' || S.t === 'ell' || (S.t === 'poly' && S.closed);
  }

  /** A filled part with outline in the current style. */
  body(s: Shape, m: Material, o: BodyOpts = {}): JSX.Element {
    const S = this.X(s);
    const def = this.def;
    const open = !!o.open;
    const main = !!o.main;
    const look = def.body(m, open, this.p);
    if (main && !open) this.solids.push({ s: S, m });
    if (o.cast ?? (main && !open)) this.castShadow(S);
    if (o.glow ?? main) this.addGlow(S, m, open);
    const trim = main && this.closed(S) && def.trim ? def.trim(open, this.p) : null;
    const scallop = trim?.kind === 'scallop' ? scallopD(sample(S).pts, trim.size) : null;
    const outline = scallop ?? this.d(S);
    const fillD = scallop ?? (def.rough > 0 ? this.d(S, 0.4) : outline);
    const fillColor = o.fill ? (open ? mix(o.fill, look.fill, 0.4) : o.fill) : look.fill;
    const stroke = o.fill && def.edge ? def.edge(fillColor) : look.stroke;
    const frill = trim?.kind === 'frill' ? this.frillEl(S, trim.size, trim.color, stroke) : null;
    const tex = (o.tex ?? main) ? def.texture(m, open, this.p) : null;
    const rule = main ? def.rule(open, this.p) : null;
    const gloss = (o.gloss ?? (main && !open)) ? this.glintEl(S) : null;
    return (
      <g>
        {frill}
        <path d={fillD} fill={fillColor} fillOpacity={look.fillOpacity * (o.alpha ?? 1)} stroke="none" />
        {tex && this.hatchEl(S, tex)}
        {rule && S.t !== 'arc' && (
          <path
            d={this.d(inset(S, rule.inset), 0.6)}
            fill="none"
            stroke={rule.stroke}
            strokeWidth={rule.sw}
            strokeOpacity={rule.opacity}
            strokeDasharray={rule.dash}
            strokeLinecap="round"
          />
        )}
        {gloss}
        <path
          d={outline}
          fill="none"
          stroke={stroke}
          strokeWidth={look.sw}
          strokeOpacity={look.strokeOpacity}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {def.pass2 && (
          <path
            d={this.d(S, 1.3)}
            fill="none"
            stroke={look.stroke}
            strokeWidth={look.sw * def.pass2.swK}
            strokeOpacity={look.strokeOpacity * def.pass2.opacity}
            strokeDasharray={def.pass2.dash}
            strokeLinecap="round"
          />
        )}
      </g>
    );
  }

  /** A detail line (seams, slats, piping). */
  line(s: Shape, o: LineOpts = {}): JSX.Element {
    const S = this.X(s);
    const l = this.def.line(!!o.fine, this.p);
    return (
      <path
        d={this.d(S, 0.7)}
        fill="none"
        stroke={o.color ?? l.stroke}
        strokeWidth={o.sw ?? l.sw}
        strokeOpacity={o.opacity ?? l.opacity}
        strokeDasharray={o.dash}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  /** Several straight detail lines merged into one path (cheap). */
  lines(segs: [Pt, Pt][], o: LineOpts = {}): JSX.Element {
    const l = this.def.line(!!o.fine, this.p);
    const amp = this.def.rough * 0.5;
    let d = '';
    for (const [a0, b0] of segs) {
      const a = this.rot ? rotPt(a0) : a0;
      const b = this.rot ? rotPt(b0) : b0;
      const ja = amp > 0 ? (this.jit() - 0.5) * amp : 0;
      const jb = amp > 0 ? (this.jit() - 0.5) * amp : 0;
      d += `M${r1(a[0] + ja)} ${r1(a[1] - jb)}L${r1(b[0] + jb)} ${r1(b[1] + ja)}`;
    }
    return (
      <path
        d={d}
        fill="none"
        stroke={o.color ?? l.stroke}
        strokeWidth={o.sw ?? l.sw}
        strokeOpacity={o.opacity ?? l.opacity}
        strokeDasharray={o.dash}
        strokeLinecap="round"
      />
    );
  }

  /** Trim and fittings: filled (closed shapes) or a stroked line (`fill: false` or open shapes). */
  accent(s: Shape, o: { fill?: boolean; sw?: number; glow?: boolean } = {}): JSX.Element {
    const S = this.X(s);
    const a = this.def.accent(this.p);
    const filled = (o.fill ?? true) && this.closed(S);
    if (o.glow) this.addGlow(S, 'brass', false, a.line);
    if (filled) {
      return (
        <path
          d={this.d(S, 0.6)}
          fill={a.fill}
          fillOpacity={a.fillOpacity}
          stroke={a.stroke}
          strokeWidth={o.sw ?? a.sw}
          strokeOpacity={a.strokeOpacity}
          strokeLinejoin="round"
        />
      );
    }
    return (
      <path
        d={this.d(S, 0.6)}
        fill="none"
        stroke={a.line}
        strokeWidth={o.sw ?? a.sw * 1.4}
        strokeOpacity={a.strokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  /** A thick bar along a path (anchor shank, rails, legs) in a material. */
  bar(s: Shape, width: number, m: Material, o: { open?: boolean; main?: boolean; fill?: string } = {}): JSX.Element {
    const S = this.X(s);
    const look = this.def.body(m, !!o.open, this.p);
    const d = this.d(S, 0.6);
    if (o.main) {
      const sh = this.def.shadow(this.p);
      if (sh) {
        this.shadows.push(
          <path
            key={this.key()}
            d={toD(translate(S, sh.dx, sh.dy))}
            fill="none"
            stroke={sh.color}
            strokeOpacity={sh.hatch ? 0.32 : sh.opacity}
            strokeWidth={width + look.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />,
        );
      }
      const g = this.def.glow(m, !!o.open, this.p);
      if (g) {
        this.glows.push(
          <path key={this.key()} d={toD(S)} fill="none" stroke={g.stroke} strokeWidth={width + g.sw} strokeOpacity={g.opacity} strokeLinecap="round" strokeLinejoin="round" />,
        );
      }
    }
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke={look.stroke} strokeOpacity={look.strokeOpacity} strokeWidth={width + look.sw * 2} />
        <path d={d} stroke={this.def.barInner(this.p)} strokeWidth={width} />
        <path d={d} stroke={o.fill ?? look.fill} strokeOpacity={look.fillOpacity} strokeWidth={width} />
      </g>
    );
  }

  /** Any hatch / stripes / sprinkles inside a region. */
  pattern(s: Shape, h: Hatch): JSX.Element | null {
    return this.hatchEl(this.X(s), h);
  }

  /** Style shading inside a region (sides, recesses). */
  shade(s: Shape, k = 1): JSX.Element | null {
    const S = this.X(s);
    const h = this.def.shade(this.p);
    return this.hatchEl(S, { ...h, opacity: Math.min(1, h.opacity * k) });
  }

  /** Glass pane with reflections. */
  glass(s: Shape): JSX.Element {
    const S = this.X(s);
    const g = this.def.glass(this.p);
    const { pts } = sample(S);
    const b = shapeBox(S);
    const spacing = Math.max(8, (b.w + b.h) * 0.16);
    const segs = hatchSegs(pts, -52, spacing, 0);
    const pick = segs.slice(1, 3);
    let d1 = '';
    pick.forEach(([a, c], i) => {
      const t = i === 0 ? 0.12 : 0.28;
      d1 += `M${r1(a[0] + (c[0] - a[0]) * t)} ${r1(a[1] + (c[1] - a[1]) * t)}L${r1(c[0] - (c[0] - a[0]) * t)} ${r1(c[1] - (c[1] - a[1]) * t)}`;
    });
    const l = this.def.line(true, this.p);
    return (
      <g>
        <path d={toD(S)} fill={g.fill} fillOpacity={g.opacity} stroke={l.stroke} strokeWidth={l.sw} strokeOpacity={l.opacity} />
        <path d={d1} stroke={g.streak} strokeOpacity={g.streakOpacity} strokeWidth={Math.max(1.6, Math.min(b.w, b.h) * 0.06)} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  /** Small knob / bulb / wheel. */
  dot(x: number, y: number, r: number, m: Material, o: BodyOpts = {}): JSX.Element {
    return this.body(circ(x, y, r), m, { tex: false, gloss: false, ...o });
  }

  /** Small brass dot (rivet, nail, button). */
  stud(x: number, y: number, r: number): JSX.Element {
    return this.accent(circ(x, y, r), { sw: Math.min(0.9, r * 0.45) });
  }

  text(x: number, y: number, str: string, size: number, o: { color?: string; opacity?: number; weight?: number; spacing?: number; font?: string } = {}): JSX.Element {
    const [X, Y] = this.rot ? rotPt([x, y]) : [x, y];
    return (
      <text
        x={r1(X)}
        y={r1(Y)}
        fontSize={size}
        fontFamily={o.font ?? this.def.font}
        fontWeight={o.weight ?? 700}
        letterSpacing={o.spacing ?? 0}
        fill={o.color ?? this.def.text(this.p)}
        fillOpacity={o.opacity ?? 1}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {str}
      </text>
    );
  }

  /** Pool of light around a lamp (drawn under the piece). */
  halo(cx: number, cy: number, r: number): JSX.Element {
    const [X, Y] = this.rot ? rotPt([cx, cy]) : [cx, cy];
    const p = this.p;
    if (this.style === 'blueprint' || this.style === 'chalk') {
      const c = this.style === 'chalk' ? p.accent : p.wall;
      return <circle cx={X} cy={Y} r={r} fill="none" stroke={c} strokeWidth={0.8} strokeOpacity={0.6} strokeDasharray="3 3" />;
    }
    const k = this.style === 'neon' ? 1.6 : this.style === 'ink' ? 0.8 : 1;
    return (
      <g fill={p.glow}>
        <circle cx={X} cy={Y} r={r} fillOpacity={0.08 * k} />
        <circle cx={X} cy={Y} r={r * 0.78} fillOpacity={0.09 * k} />
        <circle cx={X} cy={Y} r={r * 0.56} fillOpacity={0.12 * k} />
      </g>
    );
  }

  // ───────────── internals ─────────────

  private castShadow(S: Shape): void {
    const sh = this.def.shadow(this.p);
    if (!sh) return;
    const off = translate(S, sh.dx, sh.dy);
    if (sh.hatch) {
      const el = this.hatchEl(off, sh.hatch);
      if (el) this.shadows.push(<g key={this.key()}>{el}</g>);
      return;
    }
    this.shadows.push(<path key={this.key()} d={toD(off)} fill={sh.color} fillOpacity={sh.opacity} />);
    if (sh.soft) {
      this.shadows.push(
        <path key={this.key()} d={toD(translate(S, sh.dx * 1.9, sh.dy * 1.9))} fill={sh.color} fillOpacity={sh.opacity * 0.55} />,
      );
    }
  }

  private addGlow(S: Shape, m: Material, open: boolean, color?: string): void {
    const g = this.def.glow(m, open, this.p);
    if (!g) return;
    this.glows.push(
      <path key={this.key()} d={toD(S)} fill="none" stroke={color ?? g.stroke} strokeWidth={g.sw} strokeOpacity={g.opacity} strokeLinejoin="round" strokeLinecap="round" />,
    );
  }

  private frillEl(S: Shape, size: number, color: string, stroke: string): JSX.Element {
    const { pts } = sample(S);
    const n = Math.max(6, Math.round(perimeter(pts) / size));
    const ring = resampleClosed(pts, n);
    let eye = '';
    const r = Math.max(0.5, size * 0.13);
    for (let k = 0; k < n; k++) {
      const [x0, y0] = ring[k];
      const [x1, y1] = ring[(k + 1) % n];
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const l = Math.hypot(x1 - x0, y1 - y0) || 1;
      // outward normal of a clockwise ring is (dy, -dx)
      const ex = mx + ((y1 - y0) / l) * size * 0.28;
      const ey = my - ((x1 - x0) / l) * size * 0.28;
      eye += `M${r1(ex - r)} ${r1(ey)}a${r} ${r} 0 1 0 ${r1(r * 2)} 0a${r} ${r} 0 1 0 ${r1(-r * 2)} 0`;
    }
    return (
      <g>
        <path d={scallopD(pts, size)} fill={color} stroke={stroke} strokeWidth={0.7} strokeOpacity={0.55} />
        <path d={eye} fill={stroke} fillOpacity={0.35} />
      </g>
    );
  }

  private glintEl(S: Shape): JSX.Element | null {
    const g = this.def.glint(this.p);
    if (!g) return null;
    let d = '';
    if (S.t === 'rect') {
      const m = Math.min(5, S.h * 0.18, S.w * 0.18);
      const x0 = S.x + Math.max(S.r * 0.7, m);
      d = `M${r1(x0 + Math.min(S.w * 0.45, 40))} ${r1(S.y + m)}L${r1(x0)} ${r1(S.y + m)}`;
      if (S.h > 24) d += `L${r1(S.x + m)} ${r1(S.y + Math.max(S.r * 0.7, m) + 2)}L${r1(S.x + m)} ${r1(S.y + Math.min(S.h * 0.4, 30))}`;
    } else if (S.t === 'ell') {
      const rx = S.rx * 0.74;
      const ry = S.ry * 0.74;
      const a0 = (200 * Math.PI) / 180;
      const a1 = (255 * Math.PI) / 180;
      d = `M${r1(S.cx + Math.cos(a0) * rx)} ${r1(S.cy + Math.sin(a0) * ry)}A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(S.cx + Math.cos(a1) * rx)} ${r1(S.cy + Math.sin(a1) * ry)}`;
    } else {
      return null;
    }
    return <path d={d} fill="none" stroke={g.stroke} strokeWidth={g.sw} strokeOpacity={g.opacity} strokeLinecap="round" strokeLinejoin="round" />;
  }

  /** Renders a hatch spec clipped (by scanline) to a closed shape in final coordinates. */
  private hatchEl(S: Shape, h: Hatch): JSX.Element | null {
    if (!this.closed(S)) return null;
    const { pts } = sample(S);
    const phase = this.jit() * h.spacing;
    const amp = this.def.rough * 0.45;
    const j = () => (amp > 0 ? (this.jit() - 0.5) * 2 * amp : 0);
    const keep = () => !h.gaps || this.jit() >= h.gaps;
    let d = '';
    const common = { fill: 'none', stroke: h.color, strokeOpacity: h.opacity, strokeWidth: h.sw, strokeLinecap: 'round' as const };

    switch (h.kind) {
      case 'lines':
      case 'cross': {
        const sets = h.kind === 'cross' ? [h.angle, h.angle + 90] : [h.angle];
        for (const ang of sets) {
          for (const [a, b] of hatchSegs(pts, ang, h.spacing, phase)) {
            if (!keep()) continue;
            d += `M${r1(a[0] + j())} ${r1(a[1] + j())}L${r1(b[0] + j())} ${r1(b[1] + j())}`;
          }
        }
        break;
      }
      case 'scribble': {
        const segs = hatchSegs(pts, h.angle, h.spacing, phase);
        let open = false;
        segs.forEach(([a, b], i) => {
          if (!keep()) {
            open = false;
            return;
          }
          const [p, q] = i % 2 === 0 ? [a, b] : [b, a];
          d += open ? `L${r1(p[0] + j())} ${r1(p[1] + j())}` : `M${r1(p[0] + j())} ${r1(p[1] + j())}`;
          d += `L${r1(q[0] + j())} ${r1(q[1] + j())}`;
          open = true;
        });
        if (!d) return null;
        return <path d={d} {...common} strokeLinejoin="round" />;
      }
      case 'grain':
      case 'veins': {
        const segs = hatchSegs(pts, h.angle + (h.kind === 'veins' ? this.jit() * 50 - 25 : 0), h.spacing, phase);
        const wav = h.kind === 'veins' ? 2.6 : 1.1;
        for (const [a, b] of segs) {
          if (!keep()) continue;
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const n = Math.max(2, Math.round(len / 7));
          const nx = -(b[1] - a[1]) / (len || 1);
          const ny = (b[0] - a[0]) / (len || 1);
          const ph = this.jit() * 6;
          for (let i = 0; i <= n; i++) {
            const t = 0.04 + (i / n) * 0.92;
            const w = Math.sin(t * 7 + ph) * wav;
            d += `${i === 0 ? 'M' : 'L'}${r1(a[0] + (b[0] - a[0]) * t + nx * w)} ${r1(a[1] + (b[1] - a[1]) * t + ny * w)}`;
          }
        }
        break;
      }
      case 'sprinkles': {
        const b = shapeBox(S);
        const cols = h.colors && h.colors.length ? h.colors : [h.color];
        const ds: string[] = cols.map(() => '');
        let k = 0;
        for (let y = b.y + h.spacing * 0.6; y < b.y + b.h; y += h.spacing) {
          for (let x = b.x + h.spacing * 0.6; x < b.x + b.w; x += h.spacing) {
            const px = x + (this.jit() - 0.5) * h.spacing * 0.8;
            const py = y + (this.jit() - 0.5) * h.spacing * 0.8;
            const a = this.jit() * Math.PI;
            if (!keep() || !inside(pts, [px, py])) continue;
            const dx = Math.cos(a) * 1.6;
            const dy = Math.sin(a) * 1.6;
            if (!inside(pts, [px + dx * 2, py + dy * 2]) || !inside(pts, [px - dx * 2, py - dy * 2])) continue;
            ds[k % cols.length] += `M${r1(px - dx)} ${r1(py - dy)}L${r1(px + dx)} ${r1(py + dy)}`;
            k++;
          }
        }
        return (
          <g strokeLinecap="round" strokeWidth={h.sw} strokeOpacity={h.opacity} fill="none">
            {ds.map((d2, i) => (d2 ? <path key={i} d={d2} stroke={cols[i]} /> : null))}
          </g>
        );
      }
      case 'tuft': {
        const b = shapeBox(S);
        const s = h.spacing;
        const r = h.sw;
        let row = 0;
        for (let y = b.y + s * 0.75; y < b.y + b.h - s * 0.5; y += s * 0.75, row++) {
          for (let x = b.x + s * (row % 2 ? 1 : 0.5); x < b.x + b.w - s * 0.4; x += s) {
            const m = s * 0.4;
            if (!inside(pts, [x - m, y]) || !inside(pts, [x + m, y]) || !inside(pts, [x, y - m]) || !inside(pts, [x, y + m])) continue;
            d += `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
          }
        }
        if (!d) return null;
        return <path d={d} fill={h.color} fillOpacity={h.opacity} />;
      }
    }
    if (!d) return null;
    return <path d={d} {...common} />;
  }
}

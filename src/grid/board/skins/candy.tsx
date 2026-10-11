import { shade } from '../../../components/avatar/color';
import { FONT, LabelText, plate, sheetRect } from './common';
import { hash, type Seg } from './geom';
import { MotifPatterns, motifId } from './motifs';
import { scatter } from './pastel';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * COTTON CANDY PIER — a mint sheet full of confetti; walls are candy-cane stripes (pink/white or
 * blue/white, alternating per room) with round gumdrop caps where they meet; room names on carnival
 * ticket stubs; bunting along the top and fairy lights along the bottom.
 */
const INK = '#23395B';
const PINK = '#FF7EB6';
const BLUE = '#4DB8F0';
const CONFETTI = ['#FF7EB6', '#4DB8F0', '#FFD43B', '#B197FC', '#69DB7C', '#FFA94D'];
const GUMDROPS = ['#FF7EB6', '#FFD43B', '#69DB7C', '#B197FC', '#4DABF7', '#FFA94D'];
const TICKETS = ['#FFF3B0', '#FFD3E8', '#C9F2FF', '#D7FFD9'];

const segD = (s: Seg) => `M${s.x1},${s.y1}L${s.x2},${s.y2}`;

/** Point on a quadratic Bézier. */
const quad = (t: number, a: number, c: number, b: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

export const candySkin: SkinRenderer = {
  id: 'candy',
  margins: { t: 72, r: 54, b: 60, l: 54 },
  tokens: (pal) => ({
    cross: '#E03170',
    note: INK,
    noteBg: '#FFFFFF',
    hover: pal.accent2,
    highlight: '#FFE066',
    reason: '#F59F00',
    string: '#E03170',
    select: pal.accent,
    shadow: '#8CC9B8',
    grid: { color: '#6E86A8', opacity: 0.14, dash: '2 4' },
    lamp: { blend: 'soft-light', color: '#FFF6D6', strength: 0.7 },
    ui: { bg: 'rgba(255,255,255,0.94)', fg: INK, ring: pal.accent },
  }),
  defs: (ctx) => {
    const sp = Math.max(ctx.wall * 1.5, ctx.px(7));
    const stripes = (name: string, color: string) => (
      <pattern id={ctx.id(name)} patternUnits="userSpaceOnUse" width={sp} height={sp} patternTransform="rotate(45)">
        <rect width={sp} height={sp} fill="#FFFFFF" />
        <rect width={sp * 0.5} height={sp} fill={color} />
      </pattern>
    );
    return (
      <>
        {stripes('cane-pink', PINK)}
        {stripes('cane-blue', BLUE)}
        <radialGradient id={ctx.id('bulb')}>
          <stop offset="0" stopColor="#FFF7C2" />
          <stop offset="0.4" stopColor="#FFE066" stopOpacity={0.8} />
          <stop offset="1" stopColor="#FFE066" stopOpacity={0} />
        </radialGradient>
        <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#6E86A8', width: ctx.px(0.8), opacity: 0.2, checker: { fill: '#FFFFFF', opacity: 0.5 } }} />
      </>
    );
  },
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const bits = scatter(hash(ctx.puzzle.id) ^ 0xc0f, 50 + ctx.rows * ctx.cols, s, CONFETTI, 4, 8);
    return (
      <g>
        <rect {...s} rx={14} fill={ctx.pal.sheet} />
        <rect x={s.x + 6} y={s.y + 6} width={s.width - 12} height={s.height - 12} rx={10} fill="none" stroke="#9BE7D0" strokeWidth={ctx.px(1.5)} strokeDasharray={`${ctx.px(6)} ${ctx.px(4)}`} />
        {bits.map((b, i) =>
          b.k < 0.45 ? (
            <rect key={i} x={b.x - b.s / 2} y={b.y - b.s * 0.3} width={b.s} height={b.s * 0.6} rx={1} fill={b.c} opacity={0.85} transform={`rotate(${b.a} ${b.x} ${b.y})`} />
          ) : b.k < 0.8 ? (
            <circle key={i} cx={b.x} cy={b.y} r={b.s * 0.38} fill={b.c} opacity={0.85} />
          ) : (
            <path key={i} d={`M${b.x - b.s},${b.y}q${b.s / 2},${-b.s / 2} ${b.s},0t${b.s},0`} fill="none" stroke={b.c} strokeWidth={1.8} strokeLinecap="round" transform={`rotate(${b.a} ${b.x} ${b.y})`} />
          ),
        )}
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.95} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 1.7;
    const bw = w * 1.2;
    const U = ctx.U;
    const roomOf = (s: Seg) => (s.h ? ctx.geo.index[s.y1 / U - 1]?.[s.x1 / U] : ctx.geo.index[s.y1 / U]?.[s.x1 / U - 1]) ?? 0;
    const pink = ctx.geo.segs.filter((s) => roomOf(s) % 2 === 0);
    const blue = ctx.geo.segs.filter((s) => roomOf(s) % 2 === 1);
    const cane = (segs: Seg[] | string, pattern: string, edge: string, width: number) => {
      const d = typeof segs === 'string' ? segs : segs.map(segD).join('');
      if (!d) return null;
      const dh = typeof segs === 'string' ? '' : segs.filter((s) => s.h).map(segD).join('');
      const dv = typeof segs === 'string' ? '' : segs.filter((s) => !s.h).map(segD).join('');
      return (
        <>
          <path d={d} stroke={edge} strokeWidth={width + ctx.px(1.8)} />
          <path d={d} stroke={ctx.url(pattern)} strokeWidth={width} />
          {dh && <path d={dh} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={width * 0.14} transform={`translate(0 ${-width * 0.24})`} />}
          {dv && <path d={dv} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={width * 0.14} transform={`translate(${-width * 0.24} 0)`} />}
        </>
      );
    };
    const W = ctx.W;
    const H = ctx.H;
    const gum = ctx.geo.junctions.filter((j) => j.corner || j.inner + j.outer >= 3);
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={ctx.geo.d + ctx.geo.border} stroke="#8CC9B8" strokeOpacity={0.35} strokeWidth={w * 1.5} transform={`translate(0 ${w * 0.45})`} />
        {cane(ctx.geo.border, 'cane-pink', '#E8679F', bw)}
        <path d={`M0,0H${W}M0,${H}H${W}`} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={bw * 0.14} transform={`translate(0 ${-bw * 0.24})`} />
        {cane(pink, 'cane-pink', '#E8679F', w)}
        {cane(blue, 'cane-blue', '#3A9BD0', w)}
        {gum.map((j, k) => {
          const r = Math.max(w * (j.corner ? 1.35 : 1.05), ctx.px(4.5));
          const c = GUMDROPS[(hash(`${j.x},${j.y}`) >>> 3) % GUMDROPS.length] ?? PINK;
          return (
            <g key={k} transform={`translate(${j.x} ${j.y})`}>
              <circle cy={r * 0.3} r={r} fill="#8CC9B8" opacity={0.35} />
              <circle r={r} fill={c} stroke={shade(c, -0.18)} strokeWidth={ctx.px(0.9)} />
              <path d={`M${-r * 0.8},${r * 0.3}A${r},${r} 0 0 0 ${r * 0.8},${r * 0.3}`} fill="none" stroke={shade(c, -0.15)} strokeOpacity={0.6} strokeWidth={r * 0.25} />
              <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.32} ry={r * 0.2} fill="#FFFFFF" opacity={0.75} />
              <circle cx={r * 0.35} cy={-r * 0.1} r={r * 0.08} fill="#FFFFFF" opacity={0.8} />
              <circle cx={r * 0.05} cy={r * 0.35} r={r * 0.07} fill="#FFFFFF" opacity={0.8} />
            </g>
          );
        })}
      </g>
    );
  },
  label: (ctx, spot) => {
    const spacing = ctx.font * 0.06;
    const p = plate(ctx, spot, { font: ctx.font * 0.88, k: 0.66, spacing, padX: ctx.font * 1.25, h: ctx.font * 1.75, upper: true });
    const n = p.h * 0.22;
    const fill = TICKETS[hash(spot.room.id) % TICKETS.length] ?? TICKETS[0];
    const d = `M${p.x},${p.y}H${p.x + p.w}V${p.cy - n}A${n},${n} 0 0 0 ${p.x + p.w},${p.cy + n}V${p.y + p.h}H${p.x}V${p.cy + n}A${n},${n} 0 0 0 ${p.x},${p.cy - n}Z`;
    const perf = p.x + p.h * 0.62;
    return (
      <g>
        <path d={d} fill="#8CC9B8" opacity={0.4} transform={`translate(0 ${ctx.px(2)})`} />
        <path d={d} fill={fill} stroke={shade(fill ?? '#FFF3B0', -0.28)} strokeWidth={ctx.px(1)} />
        <path d={`M${perf},${p.y + 2}V${p.y + p.h - 2}`} stroke={shade(fill ?? '#FFF3B0', -0.3)} strokeWidth={ctx.px(1)} strokeDasharray={`${ctx.px(2)} ${ctx.px(2)}`} />
        <path d={`M${p.x + p.h * 0.3},${p.cy}l${-p.h * 0.1},${p.h * 0.14}l${p.h * 0.03},${-p.h * 0.17}l${-p.h * 0.12},${-p.h * 0.1}l${p.h * 0.16},${-p.h * 0.01}l${p.h * 0.05},${-p.h * 0.15}l${p.h * 0.05},${p.h * 0.15}l${p.h * 0.16},${p.h * 0.01}l${-p.h * 0.12},${p.h * 0.1}l${p.h * 0.03},${p.h * 0.17}Z`} fill="#FF7EB6" />
        <LabelText x={p.cx + p.h * 0.28} y={p.cy + p.font * 0.04} font={p.font} family={FONT.body} weight={700} spacing={spacing} fill={INK}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx: SkinCtx) => {
    const x0 = -ctx.m.l * 0.7;
    const x1 = ctx.W + ctx.m.r * 0.7;
    const y0 = -ctx.m.t * 0.78;
    const sag = ctx.m.t * 0.32;
    const cx = (x0 + x1) / 2;
    const cy = y0 + sag * 2;
    const flags = Math.max(6, Math.round((x1 - x0) / 34));
    const fs = Math.min(15, ctx.m.t * 0.22);
    const ly = ctx.H + ctx.m.b * 0.5;
    const bulbs = Math.max(6, Math.round((x1 - x0) / 30));
    let wire = `M${x0},${ly}`;
    for (let i = 1; i <= bulbs; i++) {
      const xa = x0 + ((i - 0.5) * (x1 - x0)) / bulbs;
      const xb = x0 + (i * (x1 - x0)) / bulbs;
      wire += `Q${xa},${ly + (i % 2 ? 8 : -6)} ${xb},${ly}`;
    }
    return (
      <g pointerEvents="none">
        <path d={`M${x0},${y0}Q${cx},${cy} ${x1},${y0}`} fill="none" stroke="#6E86A8" strokeWidth={ctx.px(1.2)} />
        {Array.from({ length: flags }, (_, i) => {
          const t = (i + 0.5) / flags;
          const x = quad(t, x0, cx, x1);
          const y = quad(t, y0, cy, y0);
          const c = CONFETTI[i % CONFETTI.length] ?? PINK;
          return <path key={i} d={`M${x - fs * 0.62},${y}H${x + fs * 0.62}L${x},${y + fs * 1.25}Z`} fill={c} stroke={shade(c, -0.18)} strokeWidth={ctx.px(0.8)} strokeLinejoin="round" />;
        })}
        <path d={wire} fill="none" stroke="#6E86A8" strokeWidth={ctx.px(1)} />
        {Array.from({ length: bulbs }, (_, i) => {
          const x = x0 + ((i + 0.5) * (x1 - x0)) / bulbs;
          const y = ly + (i % 2 ? 4.5 : -3);
          return (
            <g key={i}>
              <circle cx={x} cy={y + 3} r={9} fill={ctx.url('bulb')} />
              <circle cx={x} cy={y + 3} r={3.2} fill={CONFETTI[(i + 2) % CONFETTI.length]} stroke="#FFFFFF" strokeWidth={ctx.px(0.8)} />
            </g>
          );
        })}
      </g>
    );
  },
};

import { mix, shade } from '../../../components/avatar/color';
import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { hash } from './geom';
import { MotifPatterns, motifId } from './motifs';
import { Bow, heartPath, scallopCenters, scatter } from './pastel';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * ROSEWATER PATISSERIE — a pink gingham tablecloth with sprinkles and tiny hearts, edged with a
 * lace doily; walls of glossy satin ribbon with a pearly highlight and little bows where they meet;
 * room names on scalloped cake-tag plates.
 */
const INK = '#4A2433';
const PINK = '#F78FB3';
const PINK_EDGE = '#D9668F';
const SOFT_SHADOW = '#E7A3BC';
const SPRINKLES = ['#FF8FB8', '#FFD166', '#8FD3FF', '#B79CFF', '#7EE0B5', '#FFFFFF'];

export const ribbonSkin: SkinRenderer = {
  id: 'ribbon',
  margins: { t: 58, r: 58, b: 58, l: 58 },
  tokens: (pal) => ({
    cross: '#D6336C',
    note: INK,
    noteBg: '#FFFFFF',
    hover: pal.accent,
    highlight: '#FFC857',
    reason: '#F59F00',
    string: '#E64980',
    select: pal.accent,
    shadow: '#C9798F',
    grid: { color: '#C46A8A', opacity: 0.14, dash: '2 4' },
    lamp: { blend: 'soft-light', color: '#FFF1D6', strength: 0.7 },
    ui: { bg: 'rgba(255,255,255,0.94)', fg: INK, ring: pal.accent },
  }),
  defs: (ctx) => {
    const g = 26;
    return (
      <>
        <pattern id={ctx.id('gingham')} patternUnits="userSpaceOnUse" width={g} height={g}>
          <rect width={g} height={g} fill="#FFF7FA" />
          <rect width={g} height={g / 2} fill="#F9A8C6" opacity={0.3} />
          <rect width={g / 2} height={g} fill="#F9A8C6" opacity={0.3} />
        </pattern>
        <NoiseFilter id={ctx.id('weave')} freq={0.9} octaves={2} seed={4} color="#FFFFFF" slope={1.1} intercept={-0.55} />
        <linearGradient id={ctx.id('tag')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFF1F6" />
        </linearGradient>
        <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#C46A8A', width: ctx.px(0.8), opacity: 0.22, checker: { fill: '#FFFFFF', opacity: 0.45 } }} />
      </>
    );
  },
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const inset = 12;
    const cloth = { x: s.x + inset, y: s.y + inset, width: s.width - inset * 2, height: s.height - inset * 2 };
    const scallops = scallopCenters(cloth.x, cloth.y, cloth.width, cloth.height, 16);
    const bits = scatter(hash(ctx.puzzle.id) ^ 0x5eed, 30 + Math.round((ctx.rows * ctx.cols) / 2), cloth, SPRINKLES, 4, 8);
    return (
      <g>
        {/* lace doily edge */}
        <g fill="#FFFFFF" stroke="#F3C3D4" strokeWidth={ctx.px(0.8)}>
          {scallops.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={10} />
          ))}
        </g>
        <rect {...cloth} fill="#FFFFFF" />
        <g fill="#F7D3E0">
          {scallops.map(([x, y], i) => {
            const dx = x <= cloth.x + 0.1 ? -4 : x >= cloth.x + cloth.width - 0.1 ? 4 : 0;
            const dy = y <= cloth.y + 0.1 ? -4 : y >= cloth.y + cloth.height - 0.1 ? 4 : 0;
            return <circle key={i} cx={x + dx} cy={y + dy} r={2} />;
          })}
        </g>
        {/* gingham cloth */}
        <rect x={cloth.x + 5} y={cloth.y + 5} width={cloth.width - 10} height={cloth.height - 10} rx={4} fill={ctx.url('gingham')} />
        <rect x={cloth.x + 5} y={cloth.y + 5} width={cloth.width - 10} height={cloth.height - 10} fill="#FFFFFF" filter={ctx.url('weave')} opacity={0.35} />
        <rect x={cloth.x + 2} y={cloth.y + 2} width={cloth.width - 4} height={cloth.height - 4} rx={5} fill="none" stroke="#F3C3D4" strokeWidth={ctx.px(1)} strokeDasharray={`${ctx.px(2)} ${ctx.px(3)}`} />
        {/* sprinkles + hearts */}
        {bits.map((b, i) =>
          b.k > 0.82 ? (
            <path key={i} d={heartPath(b.x, b.y, b.s * 1.3)} fill={b.k > 0.91 ? '#FF8FB8' : '#FFB3CF'} opacity={0.9} />
          ) : (
            <rect key={i} x={b.x - b.s / 2} y={b.y - 1.2} width={b.s} height={2.4} rx={1.2} fill={b.c} transform={`rotate(${b.a} ${b.x} ${b.y})`} opacity={0.9} />
          ),
        )}
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.94} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 1.75;
    const bw = w * 1.2;
    const all = ctx.geo.d + ctx.geo.border;
    const W = ctx.W;
    const H = ctx.H;
    const bh = `M0,0H${W}M0,${H}H${W}`;
    const bv = `M0,0V${H}M${W},0V${H}`;
    const bows = ctx.geo.junctions.filter((j) => j.corner || (!ctx.dense && j.inner + j.outer >= 3));
    const satin = (dh: string, dv: string, width: number) => (
      <>
        <path d={dh + dv} stroke={PINK_EDGE} strokeWidth={width + ctx.px(1.6)} />
        <path d={dh + dv} stroke={PINK} strokeWidth={width} />
        <path d={dh + dv} stroke={mix(PINK, '#ffffff', 0.25)} strokeWidth={width * 0.45} />
        {/* pearly highlight along the upper / left edge */}
        <path d={dh} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={width * 0.14} transform={`translate(0 ${-width * 0.24})`} />
        <path d={dv} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={width * 0.14} transform={`translate(${-width * 0.24} 0)`} />
        <path d={dh} stroke={shade(PINK, -0.12)} strokeOpacity={0.5} strokeWidth={width * 0.12} transform={`translate(0 ${width * 0.3})`} />
        <path d={dv} stroke={shade(PINK, -0.12)} strokeOpacity={0.5} strokeWidth={width * 0.12} transform={`translate(${width * 0.3} 0)`} />
      </>
    );
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={all} stroke={SOFT_SHADOW} strokeOpacity={0.35} strokeWidth={w * 1.6} transform={`translate(0 ${w * 0.45})`} />
        {satin(bh, bv, bw)}
        {satin(ctx.geo.dh, ctx.geo.dv, w)}
        {bows.map((j, k) => (
          <Bow key={k} x={j.x} y={j.y} s={Math.max(w * (j.corner ? 2.2 : 1.7), ctx.px(7))} fill={k % 3 === 2 ? '#FFC857' : '#FF6FA3'} edge={k % 3 === 2 ? '#D99A1E' : PINK_EDGE} />
        ))}
      </g>
    );
  },
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font * 1.02, k: 0.5, padX: ctx.font * 1.1, h: ctx.font * 1.6 });
    const n = Math.max(3, Math.round(p.w / (p.h * 0.45)));
    const rr = p.w / n / 2;
    const bumps = Array.from({ length: n }, (_, i) => p.x + rr + i * rr * 2);
    const shapes = (
      <>
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={rr * 0.6} />
        {bumps.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={p.y} r={rr} />
            <circle cx={x} cy={p.y + p.h} r={rr} />
          </g>
        ))}
      </>
    );
    return (
      <g>
        <g fill={SOFT_SHADOW} opacity={0.45} transform={`translate(0 ${ctx.px(2)})`}>
          {shapes}
        </g>
        <g fill="#F4A9C3" stroke="#F4A9C3" strokeWidth={ctx.px(2.4)}>
          {shapes}
        </g>
        <g fill={ctx.url('tag')}>{shapes}</g>
        <circle cx={p.x + p.h * 0.32} cy={p.cy} r={p.h * 0.1} fill="#FFFFFF" stroke="#F4A9C3" strokeWidth={ctx.px(1)} />
        <LabelText x={p.cx + p.h * 0.1} y={p.cy + p.font * 0.04} font={p.font} family={FONT.display} italic weight={700} fill={INK}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx: SkinCtx) => (
    <g pointerEvents="none">
      <text x={ctx.W / 2} y={-ctx.m.t * 0.48} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(24, ctx.m.t * 0.4)} fontFamily={FONT.script} fill="#D9668F" stroke="#FFFFFF" strokeWidth={ctx.px(3)} paintOrder="stroke">
        {ctx.district.name}
      </text>
    </g>
  ),
};

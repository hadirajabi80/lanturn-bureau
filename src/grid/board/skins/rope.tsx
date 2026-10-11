import { mix, shade } from '../../../components/avatar/color';
import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { hash, r1, rng } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * HARROW POINT DOCKS — a nautical chart: faint depth contours and soundings, a chart neatline
 * with a latitude scale, a water band along the quay, walls of thick twisted rope with iron
 * bollards where they meet, room names on nailed wooden planks.
 */
const CHART_INK = '#1F3B3E';
const HEMP = '#B99257';
const HEMP_DARK = '#6B4A24';
const HEMP_LIGHT = '#E8CD95';
const WATER = '#6E9AA3';

function contours(ctx: SkinCtx): string[] {
  const s = sheetRect(ctx);
  const cx = s.x + s.width * 1.05;
  const cy = s.y + s.height * 0.75;
  const out: string[] = [];
  const step = Math.max(60, Math.min(s.width, s.height) / 9);
  for (let i = 1; i <= 16; i++) {
    const R = i * step;
    let d = '';
    for (let k = 0; k <= 96; k++) {
      const t = (k / 96) * Math.PI * 2;
      const rr = R + 16 * Math.sin(3 * t + i * 0.9) + 9 * Math.sin(7 * t + i * 1.7) + 5 * Math.sin(11 * t + i);
      d += `${k ? 'L' : 'M'}${r1(cx + Math.cos(t) * rr)},${r1(cy + Math.sin(t) * rr * 0.8)}`;
    }
    out.push(d + 'Z');
  }
  return out;
}

function soundings(ctx: SkinCtx) {
  const rnd = rng(hash(ctx.puzzle.id) ^ 0xa11);
  const s = sheetRect(ctx);
  const out: Array<{ x: number; y: number; n: string }> = [];
  const tries = 60;
  for (let i = 0; i < tries && out.length < 26; i++) {
    const x = s.x + 8 + rnd() * (s.width - 16);
    const y = s.y + 12 + rnd() * (s.height - 20);
    const inside = x > -6 && x < ctx.W + 6 && y > -6 && y < ctx.H + 6;
    if (inside) continue;
    const n = Math.round(3 + rnd() * 38);
    out.push({ x, y, n: rnd() > 0.7 ? `${n}${String.fromCharCode(0x2080 + Math.floor(rnd() * 9))}` : `${n}` });
  }
  return out;
}

export const ropeSkin: SkinRenderer = {
  id: 'rope',
  margins: { t: 52, r: 92, b: 52, l: 52 },
  tokens: (pal) => ({
    cross: '#C2332A',
    note: CHART_INK,
    noteBg: '#E6EEE9',
    hover: '#1E7F86',
    highlight: '#E0A93A',
    reason: '#C77D1A',
    string: '#B3261E',
    select: pal.accent,
    grid: { color: CHART_INK, opacity: 0.16, dash: '1 4' },
    lamp: { blend: 'soft-light', color: '#FFE2A8', strength: 0.9 },
    ui: { bg: 'rgba(14,33,41,0.88)', fg: pal.ink, ring: pal.accent },
  }),
  defs: (ctx) => {
    const w = ctx.wall * 1.7;
    const sp = Math.max(w * 0.62, ctx.px(4));
    return (
      <>
        <NoiseFilter id={ctx.id('grain')} freq={0.75} octaves={2} seed={6} color="#244446" slope={1.5} intercept={-0.66} />
        <NoiseFilter id={ctx.id('foxing')} freq={0.008} octaves={3} seed={2} color="#7A6A3A" slope={2.4} intercept={-1.3} />
        <pattern id={ctx.id('rope')} patternUnits="userSpaceOnUse" width={sp} height={sp} patternTransform="rotate(38)">
          <rect width={sp} height={sp} fill={HEMP} />
          <rect width={sp * 0.42} height={sp} fill={HEMP_DARK} opacity={0.75} />
          <rect x={sp * 0.5} width={sp * 0.14} height={sp} fill={HEMP_LIGHT} opacity={0.8} />
        </pattern>
        <radialGradient id={ctx.id('iron')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#8A9AA0" />
          <stop offset="0.4" stopColor="#3C4A50" />
          <stop offset="1" stopColor="#141C20" />
        </radialGradient>
        <linearGradient id={ctx.id('water')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(WATER, '#ffffff', 0.25)} />
          <stop offset="1" stopColor={shade(WATER, -0.25)} />
        </linearGradient>
        <linearGradient id={ctx.id('plank')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B68653" />
          <stop offset="0.5" stopColor="#94673A" />
          <stop offset="1" stopColor="#6E4825" />
        </linearGradient>
        <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: CHART_INK, width: ctx.px(0.8), opacity: 0.3, checker: { fill: CHART_INK, opacity: 0.09 } }} />
      </>
    );
  },
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const rule = 22;
    const nx = ctx.W + rule + 10;
    const tick = 25;
    const segsH = Math.ceil((ctx.W + rule * 2) / tick);
    const segsV = Math.ceil((ctx.H + rule * 2) / tick);
    const waveX = ctx.W + ctx.m.r * 0.42;
    let shore = `M${s.x + s.width},${s.y}L${waveX},${s.y}`;
    for (let y = s.y; y <= s.y + s.height; y += 20) shore += `L${r1(waveX + Math.sin(y / 23) * 5 + Math.sin(y / 7) * 2)},${y}`;
    shore += `L${waveX},${s.y + s.height}L${s.x + s.width},${s.y + s.height}Z`;
    const waves: string[] = [];
    for (let y = s.y + 14; y < s.y + s.height; y += 26) {
      const x0 = waveX + 12 + ((y * 7) % 18);
      waves.push(`M${x0},${y}q6,-5 12,0t12,0`);
    }
    return (
      <g>
        <rect {...s} rx={4} fill={ctx.pal.sheet} />
        <rect {...s} fill={ctx.pal.sheet} filter={ctx.url('foxing')} opacity={0.5} />
        <rect {...s} fill={ctx.pal.sheet} filter={ctx.url('grain')} opacity={0.45} />
        {/* depth contours */}
        <g fill="none" stroke="#2C6A72" strokeOpacity={0.28} strokeWidth={ctx.px(0.9)}>
          {contours(ctx).map((d, i) => (
            <path key={i} d={d} strokeDasharray={i % 3 === 2 ? `${ctx.px(5)} ${ctx.px(3)}` : undefined} />
          ))}
        </g>
        {/* water along the quay */}
        <path d={shore} fill={ctx.url('water')} opacity={0.85} />
        <g fill="none" stroke="#EAF4F4" strokeOpacity={0.55} strokeWidth={ctx.px(1)} strokeLinecap="round">
          {waves.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {Array.from({ length: Math.max(2, Math.round(ctx.rows / 2)) }, (_, i) => (
          <circle key={i} cx={waveX + 2} cy={((i + 0.5) * ctx.H) / Math.max(2, Math.round(ctx.rows / 2))} r={5} fill="#3B2C1E" stroke="#1A120A" strokeWidth={ctx.px(1)} />
        ))}
        {/* soundings */}
        <g fontFamily={FONT.display} fontStyle="italic" fontSize={Math.min(13, ctx.m.t * 0.22)} fill={CHART_INK} opacity={0.55} textAnchor="middle">
          {soundings(ctx).map((p, i) =>
            p.x < nx ? (
              <text key={i} x={p.x} y={p.y}>
                {p.n}
              </text>
            ) : null,
          )}
        </g>
        {/* chart neatline with latitude scale */}
        <g fill="none" stroke={CHART_INK}>
          <rect x={-rule} y={-rule} width={ctx.W + rule * 2} height={ctx.H + rule * 2} strokeWidth={ctx.px(1.1)} />
          <rect x={-rule - 7} y={-rule - 7} width={ctx.W + rule * 2 + 14} height={ctx.H + rule * 2 + 14} strokeWidth={ctx.px(0.8)} />
        </g>
        <g fill={CHART_INK}>
          {Array.from({ length: segsH }, (_, i) =>
            i % 2 ? null : (
              <g key={`h${i}`}>
                <rect x={-rule + i * tick} y={-rule - 7} width={Math.min(tick, ctx.W + rule * 2 - i * tick)} height={7} />
                <rect x={-rule + i * tick} y={ctx.H + rule} width={Math.min(tick, ctx.W + rule * 2 - i * tick)} height={7} />
              </g>
            ),
          )}
          {Array.from({ length: segsV }, (_, i) =>
            i % 2 ? null : (
              <g key={`v${i}`}>
                <rect x={-rule - 7} y={-rule + i * tick} width={7} height={Math.min(tick, ctx.H + rule * 2 - i * tick)} />
                <rect x={ctx.W + rule} y={-rule + i * tick} width={7} height={Math.min(tick, ctx.H + rule * 2 - i * tick)} />
              </g>
            ),
          )}
        </g>
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.88} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 1.7;
    const bw = w * 1.25;
    const W = ctx.W;
    const H = ctx.H;
    const bh = `M0,0H${W}M0,${H}H${W}`;
    const bv = `M0,0V${H}M${W},0V${H}`;
    const rope = (dh: string, dv: string, width: number) => (
      <>
        <path d={dh + dv} stroke="#2E1F10" strokeWidth={width + ctx.px(2)} />
        <path d={dh + dv} stroke={ctx.url('rope')} strokeWidth={width} />
        <path d={dh} stroke={HEMP_LIGHT} strokeOpacity={0.45} strokeWidth={width * 0.16} transform={`translate(0 ${-width * 0.24})`} />
        <path d={dv} stroke={HEMP_LIGHT} strokeOpacity={0.45} strokeWidth={width * 0.16} transform={`translate(${-width * 0.24} 0)`} />
        <path d={dh} stroke="#2E1F10" strokeOpacity={0.35} strokeWidth={width * 0.2} transform={`translate(0 ${width * 0.26})`} />
        <path d={dv} stroke="#2E1F10" strokeOpacity={0.35} strokeWidth={width * 0.2} transform={`translate(${width * 0.26} 0)`} />
      </>
    );
    const posts = ctx.geo.junctions.filter((j) => j.corner || j.inner + j.outer >= 3);
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* rope shadow on the chart */}
        <path d={ctx.geo.d + ctx.geo.border} stroke="#0B1A1C" strokeOpacity={0.18} strokeWidth={w * 1.6} transform={`translate(${w * 0.3} ${w * 0.45})`} />
        {rope(bh, bv, bw)}
        {rope(ctx.geo.dh, ctx.geo.dv, w)}
        {posts.map((j, k) => {
          const r = (j.corner ? bw : w) * 0.95;
          return (
            <g key={k} transform={`translate(${j.x} ${j.y})`}>
              <circle cy={r * 0.25} r={r * 1.05} fill="#000" opacity={0.25} />
              <circle r={r} fill={ctx.url('iron')} stroke="#0E1416" strokeWidth={ctx.px(1)} />
              <circle r={r * 0.62} fill="none" stroke="#9FB0B5" strokeOpacity={0.5} strokeWidth={ctx.px(0.8)} />
            </g>
          );
        })}
      </g>
    );
  },
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font * 0.98, k: 0.58, padX: ctx.font * 1.1, h: ctx.font * 1.7, upper: true, spacing: ctx.font * 0.06 });
    const tilt = ((hash(spot.room.id) % 100) / 100 - 0.5) * 4;
    const nail = p.h * 0.11;
    return (
      <g transform={`rotate(${tilt.toFixed(2)} ${p.cx} ${p.cy})`}>
        <rect x={p.x + ctx.px(1)} y={p.y + ctx.px(2)} width={p.w} height={p.h} rx={p.h * 0.12} fill="#000" opacity={0.28} />
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h * 0.12} fill={ctx.url('plank')} stroke="#4A2F15" strokeWidth={ctx.px(0.9)} />
        <path
          d={`M${p.x + p.h * 0.4},${p.y + p.h * 0.28}q${p.w * 0.2},${-p.h * 0.06} ${p.w * 0.4},0t${p.w * 0.35},0M${p.x + p.h * 0.3},${p.y + p.h * 0.78}q${p.w * 0.25},${p.h * 0.05} ${p.w * 0.5},0`}
          fill="none"
          stroke="#4A2F15"
          strokeOpacity={0.45}
          strokeWidth={ctx.px(0.7)}
        />
        <circle cx={p.x + p.h * 0.28} cy={p.cy} r={nail} fill="#2A2018" />
        <circle cx={p.x + p.w - p.h * 0.28} cy={p.cy} r={nail} fill="#2A2018" />
        <LabelText x={p.cx} y={p.cy + p.font * 0.05} font={p.font} family={FONT.display} weight={700} spacing={p.font * 0.06} fill="#F7E8C6" stroke="#3A230E" strokeWidth={ctx.px(1.6)}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx) => (
    <g pointerEvents="none" fill={CHART_INK}>
      <text x={-22} y={-ctx.m.t * 0.66} fontSize={Math.min(20, ctx.m.t * 0.3)} fontFamily={FONT.display} fontStyle="italic" fontWeight={700}>
        {ctx.district.name}
      </text>
      <text x={ctx.W + 22} y={-ctx.m.t * 0.66} textAnchor="end" fontSize={Math.min(13, ctx.m.t * 0.22)} fontFamily={FONT.display} fontStyle="italic" opacity={0.75}>
        Soundings in fathoms · {ctx.caseCode}
      </text>
    </g>
  ),
};

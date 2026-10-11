import { mix } from '../../../components/avatar/color';
import type { FloorStyle } from '../../types';
import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { r1 } from './geom';
import { MotifPatterns, motifId, type Motif } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * THE GILDED MERIDIAN — black lacquer, gold double-rule walls with stepped Deco corners,
 * geometric sunburst inlays in the floors, spaced capitals in gold frames.
 */
const GOLD = '#D4AF37';
const GOLD_HI = '#F6E3A1';
const LACQUER = '#121116';

const DECO_MOTIFS: Partial<Record<FloorStyle, Motif>> = {
  // lozenges instead of squares
  checker: { w: 50, h: 50, lines: 'M25,0L50,25L25,50L0,25Z', fills: 'M25,10L40,25L25,40L10,25Z' },
  // Deco fan scallops
  carpet: { w: 50, h: 25, lines: 'M0,25A25,25 0 0 1 50,25M5,25A20,20 0 0 1 45,25M12,25A13,13 0 0 1 38,25M25,25V0' },
  // diamond lattice
  tile: { w: 50, h: 50, lines: 'M0,0L50,50M50,0L0,50' },
  // herringbone parquet
  wood: { w: 40, h: 40, lines: 'M0,10L10,0M0,30L30,0M10,40L40,10M30,40L40,30M10,0L40,30M0,10L30,40' },
};

/** Stepped (ziggurat) corner frame path: rectangle with notched corners. */
function steppedRect(x: number, y: number, w: number, h: number, s: number): string {
  return [
    `M${x + s * 2},${y}H${x + w - s * 2}V${y + s}H${x + w - s}V${y + s * 2}H${x + w}`,
    `V${y + h - s * 2}H${x + w - s}V${y + h - s}H${x + w - s * 2}V${y + h}`,
    `H${x + s * 2}V${y + h - s}H${x + s}V${y + h - s * 2}H${x}`,
    `V${y + s * 2}H${x + s}V${y + s}H${x + s * 2}Z`,
  ].join('');
}

function sunburst(cx: number, cy: number, r: number, n: number, a0 = 0, a1 = 360): string {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    d += `M${r1(cx + Math.cos(a) * r * 0.22)},${r1(cy + Math.sin(a) * r * 0.22)}L${r1(cx + Math.cos(a) * r)},${r1(cy + Math.sin(a) * r)}`;
  }
  return d;
}

export const decoSkin: SkinRenderer = {
  id: 'deco',
  margins: { t: 54, r: 54, b: 54, l: 54 },
  tokens: (pal) => ({
    cross: '#E0424F',
    note: GOLD_HI,
    noteBg: '#1C1A21',
    hover: GOLD_HI,
    highlight: '#F2C14E',
    reason: '#F2A93B',
    string: '#E0424F',
    select: pal.accent2,
    grid: { color: GOLD, opacity: 0.12 },
    lamp: { blend: 'screen', color: '#FFD98A', strength: 0.22 },
    ui: { bg: 'rgba(16,15,20,0.92)', fg: GOLD_HI, ring: GOLD },
  }),
  defs: (ctx) => (
    <>
      <linearGradient id={ctx.id('gold')} gradientUnits="userSpaceOnUse" x1={-ctx.m.l} y1={-ctx.m.t} x2={ctx.W + ctx.m.r} y2={ctx.H + ctx.m.b}>
        <stop offset="0" stopColor="#8C6A1F" />
        <stop offset="0.18" stopColor={GOLD_HI} />
        <stop offset="0.36" stopColor="#B8902F" />
        <stop offset="0.55" stopColor="#FBE7A1" />
        <stop offset="0.75" stopColor="#9A7424" />
        <stop offset="1" stopColor="#E9C86A" />
      </linearGradient>
      <linearGradient id={ctx.id('sheen')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.25" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="0.42" stopColor="#ffffff" stopOpacity={0.07} />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.015} />
        <stop offset="0.62" stopColor="#ffffff" stopOpacity={0.05} />
        <stop offset="0.75" stopColor="#ffffff" stopOpacity={0} />
      </linearGradient>
      <NoiseFilter id={ctx.id('grain')} freq={0.9} octaves={2} seed={3} color="#ffffff" slope={0.5} intercept={-0.32} />
      <MotifPatterns
        id={ctx.id}
        rooms={ctx.puzzle.rooms}
        s={{ ink: GOLD, width: ctx.px(0.75), opacity: 0.26, fill: GOLD, fillOpacity: 0.08, overrides: DECO_MOTIFS }}
      />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const fans = [
      { x: s.x, y: s.y, a0: 0, a1: 90 },
      { x: s.x + s.width, y: s.y, a0: 90, a1: 180 },
      { x: s.x + s.width, y: s.y + s.height, a0: 180, a1: 270 },
      { x: s.x, y: s.y + s.height, a0: 270, a1: 360 },
    ];
    const fr = Math.min(ctx.m.l, ctx.m.t) * 1.3;
    return (
      <g>
        <rect {...s} rx={6} fill={LACQUER} />
        <rect {...s} fill={LACQUER} filter={ctx.url('grain')} opacity={0.5} />
        <rect {...s} rx={6} fill={ctx.url('sheen')} />
        <g stroke={ctx.url('gold')} fill="none" strokeWidth={ctx.px(0.9)} opacity={0.75}>
          {fans.map((f, i) => (
            <g key={i}>
              <path d={sunburst(f.x, f.y, fr, 9, f.a0, f.a1)} />
              <path d={`M${f.x + Math.cos((f.a0 * Math.PI) / 180) * fr * 0.22},${f.y + Math.sin((f.a0 * Math.PI) / 180) * fr * 0.22}A${fr * 0.22},${fr * 0.22} 0 0 1 ${f.x + Math.cos((f.a1 * Math.PI) / 180) * fr * 0.22},${f.y + Math.sin((f.a1 * Math.PI) / 180) * fr * 0.22}`} />
            </g>
          ))}
        </g>
      </g>
    );
  },
  floor: (ctx, room, i, d) => {
    const c = ctx.roomColor(i);
    return (
      <g>
        <path d={d} fill={c} />
        <path d={d} fill={ctx.url(motifId(room.floor))} />
      </g>
    );
  },
  floorOverlay: (ctx) => (
    <g fill="none" stroke={GOLD} strokeLinecap="round">
      {ctx.geo.centers.map((c, i) => {
        const room = ctx.puzzle.rooms[i];
        if (!room || room.cells.length < 3) return null;
        const cx = c.c * 100 + 50;
        const cy = c.r * 100 + 50;
        return (
          <g key={i} opacity={0.32}>
            <circle cx={cx} cy={cy} r={34} fill={mix(ctx.roomColor(i), '#000000', 0.25)} fillOpacity={0.7} strokeWidth={ctx.px(1)} />
            <path d={sunburst(cx, cy, 34, 24)} strokeWidth={ctx.px(0.8)} />
            <circle cx={cx} cy={cy} r={8} strokeWidth={ctx.px(1)} />
            <circle cx={cx} cy={cy} r={42} strokeWidth={ctx.px(0.6)} strokeDasharray={`${ctx.px(1)} ${ctx.px(3)}`} />
          </g>
        );
      })}
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 1.55;
    const bw = w * 1.35;
    const posts = ctx.geo.junctions.filter((j) => !j.corner && j.inner + j.outer >= 3);
    const s = w * 0.95;
    return (
      <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <path d={ctx.geo.d + ctx.geo.border} stroke="#000" strokeOpacity={0.45} strokeWidth={w * 1.8} transform={`translate(0 ${w * 0.4})`} />
        <path d={ctx.geo.border} stroke={ctx.url('gold')} strokeWidth={bw} />
        <path d={ctx.geo.d} stroke={ctx.url('gold')} strokeWidth={w} />
        <path d={ctx.geo.border} stroke={LACQUER} strokeWidth={bw * 0.42} />
        <path d={ctx.geo.d} stroke={LACQUER} strokeWidth={w * 0.36} />
        {posts.map((j, k) => (
          <g key={k} transform={`translate(${j.x} ${j.y})`}>
            <path d={steppedRect(-s, -s, s * 2, s * 2, s * 0.34)} fill={ctx.url('gold')} />
            <rect x={-s * 0.38} y={-s * 0.38} width={s * 0.76} height={s * 0.76} fill={LACQUER} transform="rotate(45)" />
          </g>
        ))}
        {/* stepped corners on the outer frame */}
        {[
          [0, 0, 1, 1],
          [ctx.W, 0, -1, 1],
          [ctx.W, ctx.H, -1, -1],
          [0, ctx.H, 1, -1],
        ].map(([x, y, sx, sy], k) => (
          <g key={`c${k}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
            <path d={`M${-bw * 0.5},${-bw * 0.5}h${bw * 2.6}v${bw}h${-bw * 1.3}v${bw * 0.9}h${-bw * 0.9}v${bw * 0.7}h${-bw * 0.4}Z`} fill={ctx.url('gold')} />
          </g>
        ))}
      </g>
    );
  },
  label: (ctx, spot) => {
    const spacing = ctx.font * 0.22;
    const p = plate(ctx, spot, { font: ctx.font * 0.86, k: 0.64, spacing, padX: ctx.font * 1.0, h: ctx.font * 1.75, upper: true });
    const n = p.h * 0.28;
    return (
      <g>
        <path
          d={`M${p.x + n},${p.y}H${p.x + p.w - n}L${p.x + p.w},${p.y + n}V${p.y + p.h - n}L${p.x + p.w - n},${p.y + p.h}H${p.x + n}L${p.x},${p.y + p.h - n}V${p.y + n}Z`}
          fill={LACQUER}
          fillOpacity={0.92}
          stroke={ctx.url('gold')}
          strokeWidth={ctx.px(1.3)}
        />
        <rect x={p.x + ctx.px(3)} y={p.y + ctx.px(3)} width={p.w - ctx.px(6)} height={p.h - ctx.px(6)} fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={ctx.px(0.6)} />
        <LabelText x={p.cx + spacing / 2} y={p.cy + p.font * 0.05} font={p.font} family={FONT.body} weight={600} spacing={spacing} fill={GOLD_HI}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx: SkinCtx) => {
    const g = ctx.m.l * 0.42;
    const step = Math.min(10, g * 0.5);
    return (
      <g fill="none" stroke={ctx.url('gold')} pointerEvents="none">
        <path d={steppedRect(-g, -g, ctx.W + g * 2, ctx.H + g * 2, step)} strokeWidth={ctx.px(1.6)} />
        <path d={steppedRect(-g - 6, -g - 6, ctx.W + g * 2 + 12, ctx.H + g * 2 + 12, step)} strokeWidth={ctx.px(0.7)} />
        <text
          x={ctx.W / 2}
          y={-g - 6 - ctx.m.t * 0.17}
          textAnchor="middle"
          fontSize={Math.min(14, ctx.m.t * 0.24)}
          letterSpacing={Math.min(14, ctx.m.t * 0.24) * 0.45}
          fontFamily={FONT.body}
          fontWeight={600}
          fill={GOLD}
          stroke="none"
        >
          {ctx.district.name.toUpperCase()}
        </text>
      </g>
    );
  },
};

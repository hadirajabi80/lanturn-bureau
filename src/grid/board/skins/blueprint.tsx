import { FONT, NoiseFilter, plate, sheetRect } from './common';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * FROSTMERE OBSERVATORY — a blueprint: Prussian blue with a fine drafting grid, crisp white
 * walls, dimension lines with architectural ticks along the outer walls, technical lettering,
 * and a title block with the case title and number.
 */
const LINE = '#EAF3FF';
const SHEET = '#123A7A';

const feet = (units: number, U: number) => `${Math.round((units / U) * 4)}'-0"`;

function DimH({ ctx, xs, y, ext, f }: { ctx: SkinCtx; xs: number[]; y: number; ext: number; f: number }) {
  const t = Math.min(6, f * 0.5);
  return (
    <g>
      <path d={`M${(xs[0] ?? 0) - t * 1.5},${y}H${(xs[xs.length - 1] ?? 0) + t * 1.5}`} />
      {xs.map((x, i) => (
        <g key={i}>
          <path d={`M${x},${ext}V${y - t * 1.4}`} strokeOpacity={0.55} />
          <path d={`M${x - t},${y + t}L${x + t},${y - t}`} strokeWidth={ctx.px(1.6)} />
        </g>
      ))}
      {xs.slice(1).map((x, i) => {
        const x0 = xs[i] ?? 0;
        return (
          <text key={`t${i}`} x={(x0 + x) / 2} y={y - f * 0.45} textAnchor="middle" fontSize={f} fontFamily={FONT.mono} fill={LINE} stroke="none">
            {feet(x - x0, ctx.U)}
          </text>
        );
      })}
    </g>
  );
}

function DimV({ ctx, ys, x, ext, f }: { ctx: SkinCtx; ys: number[]; x: number; ext: number; f: number }) {
  const t = Math.min(6, f * 0.5);
  return (
    <g>
      <path d={`M${x},${(ys[0] ?? 0) - t * 1.5}V${(ys[ys.length - 1] ?? 0) + t * 1.5}`} />
      {ys.map((y, i) => (
        <g key={i}>
          <path d={`M${ext},${y}H${x - t * 1.4}`} strokeOpacity={0.55} />
          <path d={`M${x - t},${y + t}L${x + t},${y - t}`} strokeWidth={ctx.px(1.6)} />
        </g>
      ))}
      {ys.slice(1).map((y, i) => {
        const y0 = ys[i] ?? 0;
        const cy = (y0 + y) / 2;
        return (
          <text key={`t${i}`} x={x - f * 0.45} y={cy} transform={`rotate(-90 ${x - f * 0.45} ${cy})`} textAnchor="middle" fontSize={f} fontFamily={FONT.mono} fill={LINE} stroke="none">
            {feet(y - y0, ctx.U)}
          </text>
        );
      })}
    </g>
  );
}

export const blueprintSkin: SkinRenderer = {
  id: 'blueprint',
  margins: { t: 70, r: 44, b: 104, l: 70 },
  tokens: (pal) => ({
    cross: '#FF6B6B',
    note: LINE,
    noteBg: '#1A4C96',
    hover: '#9FD0FF',
    highlight: '#FFD166',
    reason: '#FFC24B',
    string: '#FF5C5C',
    select: pal.glow,
    grid: { color: LINE, opacity: 0.0 },
    lamp: { blend: 'screen', color: '#BFE0FF', strength: 0.16 },
    ui: { bg: 'rgba(12,23,48,0.92)', fg: pal.ink, ring: pal.accent },
  }),
  defs: (ctx) => (
    <>
      <pattern id={ctx.id('grid')} patternUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
        <path d="M20,0V100M40,0V100M60,0V100M80,0V100M0,20H100M0,40H100M0,60H100M0,80H100" stroke={LINE} strokeOpacity={0.07} strokeWidth={ctx.px(0.6)} fill="none" />
        <path d="M0,0V100M0,0H100" stroke={LINE} strokeOpacity={0.17} strokeWidth={ctx.px(0.8)} fill="none" />
      </pattern>
      <NoiseFilter id={ctx.id('mottle')} freq={0.01} octaves={3} seed={6} color="#061B42" slope={1.6} intercept={-0.62} />
      <NoiseFilter id={ctx.id('grain')} freq={0.9} octaves={2} seed={2} color="#BFD8FF" slope={1.2} intercept={-0.8} />
      <radialGradient id={ctx.id('vig')} cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#020C22" stopOpacity={0.45} />
      </radialGradient>
      <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: LINE, width: ctx.px(0.7), opacity: 0.2, checker: { fill: LINE, opacity: 0.06 } }} />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    return (
      <g>
        <rect {...s} fill={SHEET} />
        <rect {...s} fill={SHEET} filter={ctx.url('mottle')} opacity={0.6} />
        <rect {...s} fill={ctx.url('grid')} />
        <rect {...s} fill={SHEET} filter={ctx.url('grain')} opacity={0.25} />
        <rect {...s} fill={ctx.url('vig')} />
        <rect x={s.x + 10} y={s.y + 10} width={s.width - 20} height={s.height - 20} fill="none" stroke={LINE} strokeOpacity={0.75} strokeWidth={ctx.px(1.2)} />
        <rect x={s.x + 14} y={s.y + 14} width={s.width - 28} height={s.height - 28} fill="none" stroke={LINE} strokeOpacity={0.4} strokeWidth={ctx.px(0.6)} />
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.55} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 0.85;
    const bw = w * 2.1;
    return (
      <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <path d={ctx.geo.border} stroke={LINE} strokeWidth={bw} />
        <path d={ctx.geo.border} stroke={SHEET} strokeWidth={bw - ctx.px(2.6)} />
        <path d={ctx.geo.d} stroke={LINE} strokeWidth={w} />
        {/* poché at the wall junctions */}
        {ctx.geo.junctions
          .filter((j) => j.inner > 0 && j.outer > 0)
          .map((j, k) => (
            <rect key={k} x={j.x - bw / 2} y={j.y - bw / 2} width={bw} height={bw} fill={LINE} />
          ))}
      </g>
    );
  },
  label: (ctx, spot) => {
    const spacing = ctx.font * 0.14;
    const area = !ctx.dense && spot.room.cells.length >= 2;
    const p = plate(ctx, spot, { font: ctx.font * 0.82, k: 0.62, spacing, padX: ctx.font * 0.4, h: ctx.font * (area ? 2.4 : 1.5), upper: true });
    const nameY = p.y + p.font * 0.75;
    const tw = Math.min(p.w, p.text.length * (p.font * 0.62 + spacing));
    return (
      <g fill={LINE} fontFamily={FONT.mono}>
        <text x={p.cx + spacing / 2} y={nameY} textAnchor="middle" dominantBaseline="central" fontSize={p.font} letterSpacing={spacing} fontWeight={600}>
          {p.text}
        </text>
        <path d={`M${p.cx - tw / 2},${nameY + p.font * 0.72}H${p.cx + tw / 2}`} stroke={LINE} strokeWidth={ctx.px(0.8)} />
        {area && (
          <text x={p.cx} y={nameY + p.font * 1.35} textAnchor="middle" dominantBaseline="central" fontSize={p.font * 0.78} opacity={0.75}>
            {`${spot.room.cells.length * 16} SQ FT`}
          </text>
        )}
      </g>
    );
  },
  frame: (ctx) => {
    const f = Math.min(13, ctx.m.t * 0.17);
    const top = [...new Set([0, ctx.W, ...ctx.geo.junctions.filter((j) => j.y === 0 && j.inner > 0).map((j) => j.x)])].sort((a, b) => a - b);
    const left = [...new Set([0, ctx.H, ...ctx.geo.junctions.filter((j) => j.x === 0 && j.inner > 0).map((j) => j.y)])].sort((a, b) => a - b);
    const ext = -ctx.wall * 2;
    const tbW = Math.min(ctx.W + ctx.m.r - 20, Math.max(300, ctx.W * 0.72));
    const tbH = ctx.m.b - 34;
    const tbX = ctx.W + ctx.m.r - 20 - tbW;
    const tbY = ctx.H + 18;
    const col = tbW * 0.6;
    const tf = Math.min(15, tbH * 0.2);
    return (
      <g pointerEvents="none" fill="none" stroke={LINE} strokeWidth={ctx.px(0.9)}>
        <DimH ctx={ctx} xs={top} y={-ctx.m.t * 0.4} ext={ext} f={f} />
        <DimH ctx={ctx} xs={[0, ctx.W]} y={-ctx.m.t * 0.74} ext={-ctx.m.t * 0.5} f={f} />
        <DimV ctx={ctx} ys={left} x={-ctx.m.l * 0.4} ext={ext} f={f} />
        {/* north arrow */}
        <g transform={`translate(${ctx.W + ctx.m.r * 0.5} ${-ctx.m.t * 0.55})`}>
          <circle r={Math.min(13, ctx.m.r * 0.3)} />
          <path d={`M0,${-Math.min(13, ctx.m.r * 0.3)}L${Math.min(13, ctx.m.r * 0.3) * 0.45},${Math.min(13, ctx.m.r * 0.3) * 0.6}L0,${Math.min(13, ctx.m.r * 0.3) * 0.25}Z`} fill={LINE} />
        </g>
        {/* title block */}
        <g>
          <rect x={tbX} y={tbY} width={tbW} height={tbH} strokeWidth={ctx.px(1.3)} />
          <path d={`M${tbX + col},${tbY}V${tbY + tbH}M${tbX},${tbY + tbH / 2}H${tbX + tbW}`} />
          <g fill={LINE} stroke="none" fontFamily={FONT.mono}>
            <text x={tbX + 8} y={tbY + tbH * 0.17} fontSize={tf * 0.55} opacity={0.7} dominantBaseline="central">
              PROJECT
            </text>
            <text x={tbX + 8} y={tbY + tbH * 0.34} fontSize={tf * 0.85} fontWeight={600} dominantBaseline="central">
              {ctx.district.name.toUpperCase().slice(0, Math.max(8, Math.floor((col - 16) / (tf * 0.55))))}
            </text>
            <text x={tbX + 8} y={tbY + tbH * 0.67} fontSize={tf * 0.55} opacity={0.7} dominantBaseline="central">
              DRAWING
            </text>
            <text x={tbX + 8} y={tbY + tbH * 0.84} fontSize={tf * 0.85} fontWeight={600} dominantBaseline="central">
              {ctx.title.toUpperCase().slice(0, Math.max(8, Math.floor((col - 16) / (tf * 0.55))))}
            </text>
            <text x={tbX + col + 8} y={tbY + tbH * 0.17} fontSize={tf * 0.55} opacity={0.7} dominantBaseline="central">
              CASE No.
            </text>
            <text x={tbX + col + 8} y={tbY + tbH * 0.34} fontSize={tf * 0.85} fontWeight={600} dominantBaseline="central">
              {ctx.caseCode}
            </text>
            <text x={tbX + col + 8} y={tbY + tbH * 0.67} fontSize={tf * 0.55} opacity={0.7} dominantBaseline="central">
              SHEET · SCALE
            </text>
            <text x={tbX + col + 8} y={tbY + tbH * 0.84} fontSize={tf * 0.85} fontWeight={600} dominantBaseline="central">
              {`A-${ctx.puzzle.index} · 1:50`}
            </text>
          </g>
        </g>
      </g>
    );
  },
};


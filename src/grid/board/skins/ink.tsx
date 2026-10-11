import { mix, shade } from '../../../components/avatar/color';
import { Compass, FONT, LabelText, NoiseFilter, WobbleFilter, plate, sheetRect } from './common';
import { hash, rng, wobble } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * ASHCOMBE MANOR — aged parchment, hand-inked double walls with hatching between the lines,
 * sepia watercolour washes, copperplate italic labels on little cartouches, a compass rose.
 */
const SEPIA = '#3B2A1C';

function foxing(ctx: SkinCtx) {
  const rnd = rng(hash(ctx.puzzle.id) ^ 0x51ed);
  const s = sheetRect(ctx);
  const out: Array<{ x: number; y: number; r: number; o: number }> = [];
  const n = 10 + Math.round((ctx.rows * ctx.cols) / 12);
  for (let i = 0; i < n; i++) {
    out.push({ x: s.x + rnd() * s.width, y: s.y + rnd() * s.height, r: 3 + rnd() * 9, o: 0.05 + rnd() * 0.12 });
  }
  return out;
}

export const inkSkin: SkinRenderer = {
  id: 'ink',
  margins: { t: 58, r: 58, b: 58, l: 58 },
  tokens: (pal) => ({
    cross: '#B3261E',
    note: SEPIA,
    noteBg: '#F4EAD3',
    hover: shade(pal.accent, -0.25),
    highlight: '#D98E2B',
    reason: '#B8711A',
    string: '#A3191C',
    select: pal.accent,
    grid: { color: SEPIA, opacity: 0.16, dash: '1.5 5' },
    lamp: { blend: 'soft-light', color: '#FFD49A', strength: 0.95 },
    ui: { bg: 'rgba(30,24,19,0.85)', fg: pal.ink, ring: pal.accent },
  }),
  defs: (ctx) => {
    const hs = ctx.px(3.4);
    return (
      <>
        <NoiseFilter id={ctx.id('grain')} freq={0.8} octaves={2} seed={4} color="#6B4A26" slope={1.6} intercept={-0.62} />
        <NoiseFilter id={ctx.id('stain')} freq={0.006} octaves={4} seed={9} color="#8A5A24" slope={3.2} intercept={-1.72} />
        <NoiseFilter id={ctx.id('mottle')} freq={0.02} octaves={3} seed={2} color="#7A4E22" slope={1.2} intercept={-0.45} />
        <WobbleFilter id={ctx.id('wob')} freq={0.035} scale={ctx.px(1.6)} seed={11} />
        <radialGradient id={ctx.id('vig')} cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor="#5A3A16" stopOpacity={0} />
          <stop offset="100%" stopColor="#5A3A16" stopOpacity={0.42} />
        </radialGradient>
        <pattern id={ctx.id('hatch')} patternUnits="userSpaceOnUse" width={hs} height={hs} patternTransform="rotate(45)">
          <rect width={hs} height={hs} fill={ctx.pal.sheet} />
          <line x1={0} y1={0} x2={0} y2={hs} stroke={SEPIA} strokeWidth={ctx.px(1)} />
        </pattern>
        <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: SEPIA, width: ctx.px(0.85), opacity: 0.38, checker: { fill: SEPIA, opacity: 0.1 } }} />
      </>
    );
  },
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const edge = wobble(s.x + 4, s.y + 4, s.x + s.width - 4, s.y + 4, 3, 2.5, 30)
      + wobble(s.x + s.width - 4, s.y + 4, s.x + s.width - 4, s.y + s.height - 4, 4, 2.5, 30).replace(/^M[^Q]+/, '')
      + wobble(s.x + s.width - 4, s.y + s.height - 4, s.x + 4, s.y + s.height - 4, 5, 2.5, 30).replace(/^M[^Q]+/, '')
      + wobble(s.x + 4, s.y + s.height - 4, s.x + 4, s.y + 4, 6, 2.5, 30).replace(/^M[^Q]+/, '') + 'Z';
    const rule = ctx.m.l * 0.42;
    return (
      <g>
        <path d={edge} fill={ctx.pal.sheet} />
        <path d={edge} fill={ctx.pal.sheet} filter={ctx.url('stain')} opacity={0.55} />
        <path d={edge} fill={ctx.pal.sheet} filter={ctx.url('grain')} opacity={0.5} />
        {foxing(ctx).map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#8A5A24" opacity={f.o} />
        ))}
        <path d={edge} fill={ctx.url('vig')} />
        <path d={edge} fill="none" stroke="#6B4A26" strokeOpacity={0.45} strokeWidth={ctx.px(1.4)} />
        {/* ruled double frame */}
        <g fill="none" stroke={SEPIA} strokeOpacity={0.55}>
          <rect x={-rule} y={-rule} width={ctx.W + rule * 2} height={ctx.H + rule * 2} strokeWidth={ctx.px(1.2)} />
          <rect x={-rule - 6} y={-rule - 6} width={ctx.W + rule * 2 + 12} height={ctx.H + rule * 2 + 12} strokeWidth={ctx.px(0.6)} />
        </g>
      </g>
    );
  },
  floor: (ctx, room, i, d) => {
    const c = ctx.roomColor(i);
    return (
      <g key={room.id}>
        <path d={d} fill={c} fillOpacity={0.62} />
        <path d={d} fill={ctx.url(motifId(room.floor))} />
        <path d={d} fill="none" stroke={shade(c, -0.35)} strokeOpacity={0.22} strokeWidth={ctx.wall * 3.2} />
      </g>
    );
  },
  floorOverlay: (ctx) => <rect x={0} y={0} width={ctx.W} height={ctx.H} fill={ctx.pal.sheet} filter={ctx.url('mottle')} opacity={0.35} />,
  walls: (ctx) => {
    const w = ctx.wall * 1.35;
    const bw = w * 1.35;
    const lw = ctx.px(1.15);
    const posts = ctx.geo.junctions.filter((j) => j.inner + j.outer >= 3 || j.corner);
    return (
      <g filter={ctx.url('wob')} fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <path d={ctx.geo.border} stroke={SEPIA} strokeWidth={bw + lw * 2} />
        <path d={ctx.geo.d} stroke={SEPIA} strokeWidth={w + lw * 2} />
        <path d={ctx.geo.border} stroke={ctx.url('hatch')} strokeWidth={bw} />
        <path d={ctx.geo.d} stroke={ctx.url('hatch')} strokeWidth={w} />
        {posts.map((j, k) => {
          const s = (j.corner ? bw : w) + lw * 2;
          return <rect key={k} x={j.x - s / 2} y={j.y - s / 2} width={s} height={s} fill={SEPIA} stroke="none" />;
        })}
      </g>
    );
  },
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font * 1.08, k: 0.5, padX: ctx.font * 0.95, h: ctx.font * 1.55 });
    const curl = p.h * 0.32;
    const paper = mix(ctx.pal.sheet, '#ffffff', 0.45);
    return (
      <g key={spot.room.id}>
        {/* scroll curls */}
        <g fill={paper} stroke={SEPIA} strokeWidth={ctx.px(0.9)}>
          <path d={`M${p.x + curl},${p.y}c${-curl * 1.6},0 ${-curl * 1.6},${p.h} 0,${p.h}`} />
          <path d={`M${p.x + p.w - curl},${p.y}c${curl * 1.6},0 ${curl * 1.6},${p.h} 0,${p.h}`} />
          <rect x={p.x + curl} y={p.y} width={p.w - curl * 2} height={p.h} stroke="none" />
          <path d={`M${p.x + curl},${p.y}H${p.x + p.w - curl}M${p.x + curl},${p.y + p.h}H${p.x + p.w - curl}`} fill="none" />
          <path d={`M${p.x + curl},${p.y + p.h * 0.5}m${-curl * 0.5},0a${curl * 0.5},${curl * 0.5} 0 1,0 ${curl * 0.5},${-curl * 0.5}`} fill="none" />
          <path d={`M${p.x + p.w - curl},${p.y + p.h * 0.5}m${curl * 0.5},0a${curl * 0.5},${curl * 0.5} 0 1,1 ${-curl * 0.5},${-curl * 0.5}`} fill="none" />
        </g>
        <LabelText x={p.cx} y={p.cy + p.font * 0.04} font={p.font} family={FONT.display} italic weight={500} fill={SEPIA}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx) => {
    const r = Math.min(ctx.m.r, ctx.m.t) * 0.42;
    const by = ctx.H + ctx.m.b * 0.48;
    const seg = Math.min(40, ctx.W / 10);
    return (
      <g pointerEvents="none">
        <Compass cx={ctx.W + ctx.m.r * 0.5} cy={-ctx.m.t * 0.42} r={r} ink={SEPIA} paper={mix(ctx.pal.sheet, '#ffffff', 0.4)} accent="#9E3B26" />
        {/* scale bar */}
        <g transform={`translate(0 ${by})`}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * seg} y={-3} width={seg} height={6} fill={i % 2 ? 'none' : SEPIA} stroke={SEPIA} strokeWidth={ctx.px(0.8)} />
          ))}
          <text x={seg * 4 + 8} y={0} dominantBaseline="central" fontSize={Math.min(16, ctx.m.b * 0.24)} fontFamily={FONT.display} fontStyle="italic" fill={SEPIA}>
            feet
          </text>
        </g>
        <text x={ctx.W / 2} y={-ctx.m.t * 0.5} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(26, ctx.m.t * 0.36)} fontFamily={FONT.display} fontStyle="italic" fontWeight={500} fill={SEPIA} opacity={0.85}>
          {ctx.district.name} — {ctx.title}
        </text>
      </g>
    );
  },
};

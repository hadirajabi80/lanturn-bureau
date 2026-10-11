import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { hash } from './geom';
import { MotifPatterns, motifId } from './motifs';
import { scatter } from './pastel';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * LAVENDER & LACE BOUTIQUE — soft watercolour paper with lilac and pink blooms and drifting petals;
 * walls are a lilac line edged with scalloped white lace, pearl studs where they meet; room names in
 * script on little ribbon banners; a perfume bottle and a rose in the corners.
 */
const INK = '#3B2A55';
const LILAC = '#B48CFF';
const LILAC_SOFT = '#D9C2FF';
const BLOOMS = ['#D9C2FF', '#FFC2DD', '#C9B3FF', '#FFD6E8', '#E6D4FF'];
const PETALS = ['#FFB3D1', '#D9C2FF', '#F7C6DE', '#C9A8FF'];

function Perfume({ x, y, s, id }: { x: number; y: number; s: number; id: (n: string) => string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 40})`}>
      <ellipse cx={2} cy={21} rx={16} ry={3.5} fill="#C9A8FF" opacity={0.35} />
      {/* atomiser tube + bulb */}
      <path d="M9,-14C18,-16 22,-10 24,-2" fill="none" stroke="#B48CFF" strokeWidth={1.4} />
      <circle cx={25} cy={2} r={5.5} fill="#FF9EC7" stroke="#E07AAA" strokeWidth={1} />
      <path d="M25,7.5l-2,7M25,7.5l0,8M25,7.5l2,7" stroke="#E07AAA" strokeWidth={0.9} strokeLinecap="round" />
      {/* bottle */}
      <rect x={-4} y={-17} width={8} height={7} rx={1.5} fill="#F2E3B3" stroke="#C9A85A" strokeWidth={0.9} />
      <rect x={-2.5} y={-11} width={5} height={4} fill="#E9DDFF" stroke="#B48CFF" strokeWidth={0.8} />
      <path d="M-14,-6Q-15,-8 -12,-8H12Q15,-8 14,-6L16,14Q16,20 10,20H-10Q-16,20 -16,14Z" fill={`url(#${id('bottle')})`} stroke="#9A72E8" strokeWidth={1} />
      <path d="M-10,-3Q-12,6 -10,15" fill="none" stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={2} strokeLinecap="round" />
      <path d="M-6,5h12M-4,9h8" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

function Rose({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 40})`}>
      <path d="M-6,4C-22,0 -26,14 -16,18C-10,20 -6,12 -6,4Z" fill="#9ED9B0" stroke="#6FB487" strokeWidth={0.9} />
      <path d="M8,6C22,4 24,18 14,20C8,21 6,14 8,6Z" fill="#9ED9B0" stroke="#6FB487" strokeWidth={0.9} />
      <circle r={13} fill="#FF9EC7" stroke="#E07AAA" strokeWidth={1} />
      <path d="M-9,2C-9,-8 6,-11 9,-2C11,5 2,9 -3,6C-7,3 -4,-4 1,-3C4,-2 3,2 0,2" fill="none" stroke="#E07AAA" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M-11,-4C-8,-13 6,-14 11,-6" fill="none" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.3} strokeLinecap="round" />
    </g>
  );
}

export const laceSkin: SkinRenderer = {
  id: 'lace',
  margins: { t: 60, r: 60, b: 60, l: 60 },
  tokens: (pal) => ({
    cross: '#D6336C',
    note: INK,
    noteBg: '#FFFFFF',
    hover: pal.accent,
    highlight: '#FFC857',
    reason: '#F08C00',
    string: '#D6336C',
    select: pal.accent,
    shadow: '#A58BC9',
    grid: { color: '#8E7FAE', opacity: 0.14, dash: '2 4' },
    lamp: { blend: 'soft-light', color: '#FFF4E0', strength: 0.7 },
    ui: { bg: 'rgba(255,255,255,0.94)', fg: INK, ring: pal.accent },
  }),
  defs: (ctx) => (
    <>
      <filter id={ctx.id('wc')} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency={0.035} numOctaves={3} seed={7} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale={22} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={2.2} />
      </filter>
      <clipPath id={ctx.id('sheetclip')}>
        <rect {...sheetRect(ctx)} rx={6} />
      </clipPath>
      <NoiseFilter id={ctx.id('paper')} freq={0.55} octaves={3} seed={12} color="#B9A5D6" slope={1.3} intercept={-0.7} />
      <linearGradient id={ctx.id('bottle')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F1E6FF" />
        <stop offset="0.5" stopColor="#D2B8FF" />
        <stop offset="1" stopColor="#B48CFF" />
      </linearGradient>
      <radialGradient id={ctx.id('pearl')} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#F4EDF9" />
        <stop offset="1" stopColor="#D8CBE6" />
      </radialGradient>
      <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#8E7FAE', width: ctx.px(0.8), opacity: 0.22, checker: { fill: '#FFFFFF', opacity: 0.45 } }} />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const seed = hash(ctx.puzzle.id) ^ 0x1ace;
    const blooms = scatter(seed, 9 + Math.round(ctx.cols / 2), s, BLOOMS, 40, 110);
    const petals = scatter(seed ^ 0x77, 22 + ctx.cols * 2, s, PETALS, 5, 9);
    return (
      <g>
        <rect {...s} rx={6} fill={ctx.pal.sheet} />
        <g clipPath={ctx.url('sheetclip')}>
          <g filter={ctx.url('wc')}>
          {blooms.map((b, i) => (
            <g key={i} opacity={0.4 + b.k * 0.22}>
              <circle cx={b.x} cy={b.y} r={b.s} fill={b.c} />
              <circle cx={b.x + b.s * 0.25} cy={b.y - b.s * 0.15} r={b.s * 0.55} fill={b.c} opacity={0.8} />
            </g>
          ))}
          </g>
        </g>
        <rect {...s} fill={ctx.pal.sheet} filter={ctx.url('paper')} opacity={0.35} />
        {petals.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={p.s} ry={p.s * 0.5} fill={p.c} opacity={0.75} transform={`rotate(${p.a} ${p.x} ${p.y})`} />
        ))}
        <rect x={s.x + 9} y={s.y + 9} width={s.width - 18} height={s.height - 18} rx={8} fill="none" stroke={LILAC_SOFT} strokeWidth={ctx.px(1.2)} strokeDasharray={`${ctx.px(1)} ${ctx.px(4)}`} strokeLinecap="round" />
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.86} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
      <path d={d} fill="none" stroke="#B48CFF" strokeOpacity={0.14} strokeWidth={ctx.wall * 3.4} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 0.95;
    const lace = (d: string, width: number) => {
      const dot = width * 2.9;
      const sp = dot * 0.72;
      return (
        <>
          <path d={d} stroke={LILAC_SOFT} strokeWidth={dot + ctx.px(1.6)} strokeDasharray={`0 ${sp}`} />
          <path d={d} stroke="#FFFFFF" strokeWidth={dot} strokeDasharray={`0 ${sp}`} />
          <path d={d} stroke="#EFE6FF" strokeWidth={dot * 0.26} strokeDasharray={`0 ${sp}`} transform={`translate(0 0)`} />
          <path d={d} stroke={LILAC} strokeWidth={width} strokeLinecap="square" />
          <path d={d} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={width * 0.25} strokeLinecap="square" />
        </>
      );
    };
    const pearls = ctx.geo.junctions.filter((j) => j.corner || j.inner + j.outer >= 3);
    return (
      <g fill="none" strokeLinecap="round">
        <path d={ctx.geo.d + ctx.geo.border} stroke="#C9B3E6" strokeOpacity={0.3} strokeWidth={w * 3.6} transform={`translate(0 ${w * 0.6})`} />
        {lace(ctx.geo.border, w * 1.25)}
        {lace(ctx.geo.d, w)}
        {pearls.map((j, k) => {
          const r = Math.max(w * (j.corner ? 1.9 : 1.45), ctx.px(4));
          return (
            <g key={k}>
              <circle cx={j.x} cy={j.y + r * 0.25} r={r} fill="#B9A0DA" opacity={0.35} />
              <circle cx={j.x} cy={j.y} r={r} fill={ctx.url('pearl')} stroke="#CDBCE3" strokeWidth={ctx.px(0.7)} />
              <circle cx={j.x - r * 0.3} cy={j.y - r * 0.35} r={r * 0.25} fill="#FFFFFF" />
            </g>
          );
        })}
      </g>
    );
  },
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font * 1.3, k: 0.42, padX: ctx.font * 0.9, h: ctx.font * 1.55 });
    const t = p.h * 0.55;
    const tailL = `M${p.x + t * 0.4},${p.y + p.h * 0.25}H${p.x - t}L${p.x - t * 0.45},${p.y + p.h * 0.72}L${p.x - t},${p.y + p.h * 1.18}H${p.x + t * 0.4}Z`;
    const tailR = `M${p.x + p.w - t * 0.4},${p.y + p.h * 0.25}H${p.x + p.w + t}L${p.x + p.w + t * 0.45},${p.y + p.h * 0.72}L${p.x + p.w + t},${p.y + p.h * 1.18}H${p.x + p.w - t * 0.4}Z`;
    return (
      <g>
        <path d={tailL + tailR} fill="#F4BCD7" stroke="#E39CC0" strokeWidth={ctx.px(0.8)} strokeLinejoin="round" />
        <path d={`M${p.x},${p.y + p.h}l${t * 0.4},${p.h * 0.18}v${-p.h * 0.18}ZM${p.x + p.w},${p.y + p.h}l${-t * 0.4},${p.h * 0.18}v${-p.h * 0.18}Z`} fill="#D98AB1" />
        <rect x={p.x} y={p.y + ctx.px(1.5)} width={p.w} height={p.h} fill="#C9A0C0" opacity={0.3} />
        <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#FFE8F3" stroke="#E39CC0" strokeWidth={ctx.px(0.9)} />
        <path d={`M${p.x + 2},${p.y + p.h * 0.18}H${p.x + p.w - 2}M${p.x + 2},${p.y + p.h * 0.82}H${p.x + p.w - 2}`} stroke="#FFFFFF" strokeWidth={ctx.px(0.8)} strokeDasharray={`${ctx.px(2)} ${ctx.px(2)}`} />
        <LabelText x={p.cx} y={p.cy + p.font * 0.02} font={p.font} family={FONT.script} weight={700} fill={INK}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx: SkinCtx) => {
    const sz = Math.min(ctx.m.r, ctx.m.t) * 0.95;
    return (
      <g pointerEvents="none">
        <Perfume x={ctx.W + ctx.m.r * 0.5} y={-ctx.m.t * 0.5} s={sz} id={ctx.id} />
        <Rose x={-ctx.m.l * 0.5} y={ctx.H + ctx.m.b * 0.5} s={sz * 0.85} />
        <text x={ctx.W / 2} y={-ctx.m.t * 0.48} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(26, ctx.m.t * 0.42)} fontFamily={FONT.script} fontWeight={700} fill="#9A72E8">
          {ctx.district.name}
        </text>
      </g>
    );
  },
};

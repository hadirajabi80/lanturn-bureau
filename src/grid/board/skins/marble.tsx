import { shade } from '../../../components/avatar/color';
import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import type { Seg } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * MUSEUM OF CURIOSITIES — gallery plaster, thick veined marble walls with a soft drop shadow,
 * square marble pillars, velvet ropes on brass stanchions across the doorways, brass placards.
 */
const STONE_EDGE = '#8C8478';
const VELVET = '#8E1B2C';

interface Doorway {
  x: number;
  y: number;
  h: boolean;
}

/** Interior walls with a doorway gap in the middle cell of every run of 2+ cells. */
function wallsWithDoors(ctx: SkinCtx, w: number): { d: string; doors: Doorway[] } {
  const half = ctx.U * 0.2 + w / 2;
  let d = '';
  const doors: Doorway[] = [];
  const line = (s: Seg, a: number, b: number) => (s.h ? `M${a},${s.y1}L${b},${s.y1}` : `M${s.x1},${a}L${s.x1},${b}`);
  for (const s of ctx.geo.segs) {
    const a0 = s.h ? s.x1 : s.y1;
    const a1 = s.h ? s.x2 : s.y2;
    if (s.cells < 2) {
      d += line(s, a0, a1);
      continue;
    }
    const mid = a0 + (Math.floor((s.cells - 1) / 2) + 0.5) * ctx.U;
    d += line(s, a0, mid - half) + line(s, mid + half, a1);
    doors.push(s.h ? { x: mid, y: s.y1, h: true } : { x: s.x1, y: mid, h: false });
  }
  return { d, doors };
}

export const marbleSkin: SkinRenderer = {
  id: 'marble',
  margins: { t: 52, r: 52, b: 52, l: 52 },
  tokens: (pal) => ({
    cross: '#B8283A',
    note: '#3A3A44',
    noteBg: '#F7F5F0',
    hover: shade(pal.accent, -0.15),
    highlight: '#E3A53A',
    reason: '#C27A12',
    string: '#A3182C',
    select: pal.accent,
    grid: { color: '#5D5A55', opacity: 0.14 },
    lamp: { blend: 'soft-light', color: '#FFE6B8', strength: 0.85 },
    ui: { bg: 'rgba(22,27,39,0.9)', fg: pal.ink, ring: pal.accent2 },
  }),
  defs: (ctx) => {
    const w = ctx.wall * 2;
    return (
      <>
        <NoiseFilter id={ctx.id('grain')} freq={0.85} octaves={2} seed={12} color="#5E5A52" slope={1.2} intercept={-0.62} />
        <NoiseFilter id={ctx.id('mottle')} freq={0.012} octaves={3} seed={4} color="#A39B8C" slope={1.4} intercept={-0.62} />
        <pattern id={ctx.id('marble')} patternUnits="userSpaceOnUse" width={72} height={72} patternTransform="rotate(-28)">
          <rect width={72} height={72} fill="#EFE9DD" />
          <rect width={72} height={24} y={30} fill="#E4DCCB" opacity={0.7} />
          <g fill="none" strokeLinecap="round">
            <path d="M-2,14C14,8 22,22 38,17S60,6 74,12" stroke="#7E7466" strokeWidth={1.3} opacity={0.75} />
            <path d="M20,19C24,30 34,33 33,46" stroke="#8E8576" strokeWidth={0.8} opacity={0.7} />
            <path d="M-2,52C16,46 28,60 46,55S62,44 74,50" stroke="#6E6457" strokeWidth={1.6} opacity={0.6} />
            <path d="M50,0C52,10 62,18 60,32" stroke="#FFFFFF" strokeWidth={2.4} opacity={0.75} />
            <path d="M8,62C12,66 10,70 14,72" stroke="#9A9184" strokeWidth={0.7} opacity={0.8} />
          </g>
        </pattern>
        <radialGradient id={ctx.id('brass')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFF0BE" />
          <stop offset="0.5" stopColor="#D2A445" />
          <stop offset="1" stopColor="#7A5416" />
        </radialGradient>
        <linearGradient id={ctx.id('placard')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5DC98" />
          <stop offset="0.45" stopColor="#D1A54C" />
          <stop offset="0.55" stopColor="#C29236" />
          <stop offset="1" stopColor="#E8C779" />
        </linearGradient>
        <radialGradient id={ctx.id('vig')} cx="50%" cy="45%" r="75%">
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#3B342A" stopOpacity={0.22} />
        </radialGradient>
        <filter id={ctx.id('shadow')} x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx={0} dy={Math.max(w * 0.35, ctx.px(2))} stdDeviation={Math.max(w * 0.45, ctx.px(2.4))} floodColor="#2D261C" floodOpacity={0.38} />
        </filter>
        <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#5D5A55', width: ctx.px(0.8), opacity: 0.26, checker: { fill: '#5D5A55', opacity: 0.1 } }} />
      </>
    );
  },
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const g = ctx.m.l * 0.45;
    return (
      <g>
        <rect {...s} rx={3} fill={ctx.pal.sheet} />
        <rect {...s} fill={ctx.pal.sheet} filter={ctx.url('mottle')} opacity={0.5} />
        <rect {...s} fill={ctx.pal.sheet} filter={ctx.url('grain')} opacity={0.35} />
        <rect {...s} fill={ctx.url('vig')} />
        {/* raised plaster moulding */}
        <g fill="none">
          <rect x={-g} y={-g} width={ctx.W + g * 2} height={ctx.H + g * 2} stroke="#ffffff" strokeOpacity={0.85} strokeWidth={ctx.px(2)} transform={`translate(${-ctx.px(1)} ${-ctx.px(1)})`} />
          <rect x={-g} y={-g} width={ctx.W + g * 2} height={ctx.H + g * 2} stroke="#9C9486" strokeOpacity={0.7} strokeWidth={ctx.px(1.2)} />
          <rect x={-g - 8} y={-g - 8} width={ctx.W + g * 2 + 16} height={ctx.H + g * 2 + 16} stroke="#9C9486" strokeOpacity={0.4} strokeWidth={ctx.px(0.8)} />
        </g>
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 2;
    const bw = w * 1.3;
    const { d, doors } = wallsWithDoors(ctx, w);
    const posts = ctx.geo.junctions.filter((j) => j.corner || j.inner + j.outer >= 3);
    const half = ctx.U * 0.2 + w / 2;
    const pr = Math.max(w * 0.5, ctx.px(3));
    return (
      <g>
        <g filter={ctx.url('shadow')} fill="none" strokeLinecap="square">
          <path d={ctx.geo.border + d} stroke={STONE_EDGE} strokeWidth={w + ctx.px(2)} />
          <path d={ctx.geo.border} stroke={STONE_EDGE} strokeWidth={bw + ctx.px(2)} />
          <path d={ctx.geo.border} stroke={ctx.url('marble')} strokeWidth={bw} />
          <path d={d} stroke={ctx.url('marble')} strokeWidth={w} />
          {posts.map((j, k) => {
            const s = (j.corner ? bw : w) * 1.45;
            return <rect key={k} x={j.x - s / 2} y={j.y - s / 2} width={s} height={s} fill={ctx.url('marble')} stroke={STONE_EDGE} strokeWidth={ctx.px(1)} />;
          })}
        </g>
        {/* velvet ropes across doorways */}
        {doors.map((dw, k) => {
          const ax = dw.h ? dw.x - half + w * 0.15 : dw.x;
          const ay = dw.h ? dw.y : dw.y - half + w * 0.15;
          const bx = dw.h ? dw.x + half - w * 0.15 : dw.x;
          const by = dw.h ? dw.y : dw.y + half - w * 0.15;
          const bow = ctx.U * 0.06;
          const mx = dw.h ? dw.x : dw.x + bow;
          const my = dw.h ? dw.y + bow : dw.y;
          const rope = `M${ax},${ay}Q${mx},${my} ${bx},${by}`;
          return (
            <g key={`d${k}`}>
              <path d={rope} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={pr * 0.9} transform={`translate(0 ${pr * 0.5})`} strokeLinecap="round" />
              <path d={rope} fill="none" stroke={VELVET} strokeWidth={pr * 0.85} strokeLinecap="round" />
              <path d={rope} fill="none" stroke="#E2667A" strokeOpacity={0.55} strokeWidth={pr * 0.25} strokeLinecap="round" transform={`translate(${-pr * 0.12} ${-pr * 0.12})`} />
              {[
                [ax, ay],
                [bx, by],
              ].map(([x, y], q) => (
                <g key={q}>
                  <circle cx={x} cy={(y ?? 0) + pr * 0.3} r={pr * 1.05} fill="#000" opacity={0.25} />
                  <circle cx={x} cy={y} r={pr} fill={ctx.url('brass')} stroke="#6B4A12" strokeWidth={ctx.px(0.8)} />
                </g>
              ))}
            </g>
          );
        })}
      </g>
    );
  },
  label: (ctx, spot) => {
    const spacing = ctx.font * 0.1;
    const p = plate(ctx, spot, { font: ctx.font * 0.86, k: 0.66, spacing, padX: ctx.font * 1.15, h: ctx.font * 1.7, upper: true });
    const screw = p.h * 0.1;
    return (
      <g>
        <rect x={p.x} y={p.y + ctx.px(1.6)} width={p.w} height={p.h} rx={ctx.px(1.5)} fill="#2D261C" opacity={0.3} />
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={ctx.px(1.5)} fill={ctx.url('placard')} stroke="#7A5A1E" strokeWidth={ctx.px(0.8)} />
        <rect x={p.x + ctx.px(2)} y={p.y + ctx.px(2)} width={p.w - ctx.px(4)} height={p.h - ctx.px(4)} rx={ctx.px(1)} fill="none" stroke="#FFF3C9" strokeOpacity={0.6} strokeWidth={ctx.px(0.6)} />
        <circle cx={p.x + p.h * 0.3} cy={p.cy} r={screw} fill="#8A6420" />
        <circle cx={p.x + p.w - p.h * 0.3} cy={p.cy} r={screw} fill="#8A6420" />
        <LabelText x={p.cx + spacing / 2} y={p.cy + p.font * 0.06} font={p.font} family={FONT.display} weight={700} spacing={spacing} fill="#3B2A0E">
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx) => (
    <g pointerEvents="none">
      <text
        x={ctx.W / 2}
        y={-ctx.m.t * 0.62}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.min(13, ctx.m.t * 0.22)}
        letterSpacing={Math.min(13, ctx.m.t * 0.22) * 0.35}
        fontFamily={FONT.display}
        fontWeight={700}
        fill="#6F685D"
      >
        {ctx.district.name.toUpperCase()} · GROUND PLAN
      </text>
    </g>
  ),
};

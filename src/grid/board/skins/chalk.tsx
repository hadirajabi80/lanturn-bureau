import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { hash, rng, wobble } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * HOLLOWMERE ACADEMY — a green chalkboard in a wooden frame with a chalk tray, eraser smudges,
 * walls as rough chalk strokes (displaced + grain-eroded, one filter on the whole group),
 * room names handwritten in chalk.
 */
const CHALK = '#F1F1E6';
const CHALK_YELLOW = '#F3D77A';
const BOARD = '#24392E';
const FRAME = 20;

function chalkLines(ctx: SkinCtx, w: number): { a: string; b: string; ba: string; bb: string } {
  const amp = Math.max(0.8, w * 0.22);
  let a = '';
  let b = '';
  ctx.geo.segs.forEach((s, i) => {
    a += wobble(s.x1, s.y1, s.x2, s.y2, 100 + i * 7, amp, 34);
    b += wobble(s.x1 + amp * 0.4, s.y1 + amp * 0.4, s.x2 - amp * 0.3, s.y2 + amp * 0.3, 900 + i * 13, amp * 1.4, 26);
  });
  const W = ctx.W;
  const H = ctx.H;
  const e = w * 0.6;
  const ba = wobble(-e, 0, W + e, 0, 1, amp, 40) + wobble(W, -e, W, H + e, 2, amp, 40) + wobble(W + e, H, -e, H, 3, amp, 40) + wobble(0, H + e, 0, -e, 4, amp, 40);
  const bb = wobble(0, amp, W, -amp * 0.5, 5, amp * 1.6, 30) + wobble(W - amp, 0, W + amp * 0.4, H, 6, amp * 1.6, 30) + wobble(W, H - amp * 0.6, 0, H + amp * 0.3, 7, amp * 1.6, 30) + wobble(amp * 0.5, H, -amp * 0.3, 0, 8, amp * 1.6, 30);
  return { a, b, ba, bb };
}

export const chalkSkin: SkinRenderer = {
  id: 'chalk',
  margins: { t: 60, r: 48, b: 72, l: 48 },
  tokens: (pal) => ({
    cross: '#FF7A6B',
    note: CHALK,
    noteBg: '#2B4436',
    hover: CHALK_YELLOW,
    highlight: '#F3C94E',
    reason: '#F3B84E',
    string: '#FF5A4A',
    select: pal.accent,
    grid: { color: CHALK, opacity: 0.09, dash: '2 5' },
    lamp: { blend: 'screen', color: '#FFE7A8', strength: 0.18 },
    ui: { bg: 'rgba(20,32,26,0.92)', fg: pal.ink, ring: pal.accent },
  }),
  defs: (ctx) => (
    <>
      <filter id={ctx.id('chalk')} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency={0.05} numOctaves={2} seed={3} result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale={Math.max(ctx.px(2.2), 2)} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency={Math.min(0.7, Math.max(0.2, 0.32 / Math.max(0.2, ctx.ppu)))} numOctaves={2} seed={9} result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.12" result="mask" />
        <feComposite in="rough" in2="mask" operator="in" />
      </filter>
      <filter id={ctx.id('smudge')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={ctx.U * 0.18} />
      </filter>
      <NoiseFilter id={ctx.id('dust')} freq={0.6} octaves={2} seed={5} color="#DDE8D8" slope={1.4} intercept={-0.75} />
      <NoiseFilter id={ctx.id('cloud')} freq={0.007} octaves={3} seed={8} color="#C9D9C4" slope={1.5} intercept={-0.62} />
      <linearGradient id={ctx.id('wood')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6E4526" />
        <stop offset="0.5" stopColor="#4F2F18" />
        <stop offset="1" stopColor="#6A4022" />
      </linearGradient>
      <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: CHALK, width: ctx.px(0.9), opacity: 0.14, dash: '6 4', checker: { fill: CHALK, opacity: 0.05 } }} />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const inner = { x: s.x + FRAME, y: s.y + FRAME, width: s.width - FRAME * 2, height: s.height - FRAME * 2 - 10 };
    const rnd = rng(hash(ctx.puzzle.id) ^ 0xc4a1);
    const smudges = Array.from({ length: 6 }, () => ({
      cx: inner.x + rnd() * inner.width,
      cy: inner.y + rnd() * inner.height,
      rx: 60 + rnd() * 160,
      ry: 25 + rnd() * 60,
      a: rnd() * 180,
      o: 0.05 + rnd() * 0.06,
    }));
    const swirls = Array.from({ length: 4 }, () => {
      const cx = inner.x + rnd() * inner.width;
      const cy = inner.y + rnd() * inner.height;
      const r = 50 + rnd() * 120;
      return `M${cx - r},${cy}a${r},${r * 0.6} 0 1,1 ${r * 1.6},${r * 0.4}`;
    });
    const trayY = s.y + s.height - FRAME - 10;
    const grain = Array.from({ length: 9 }, (_, i) => `M${s.x + 4},${s.y + 3 + i * 2.1}Q${s.x + s.width / 2},${s.y + 5 + i * 2.1 + (i % 2 ? 2 : -2)} ${s.x + s.width - 4},${s.y + 3 + i * 2.1}`);
    return (
      <g>
        {/* wooden frame */}
        <rect {...s} rx={6} fill={ctx.url('wood')} />
        <g stroke="#2E1B0D" strokeOpacity={0.35} strokeWidth={ctx.px(0.8)} fill="none">
          {grain.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {grain.map((d, i) => (
            <path key={`b${i}`} d={d} transform={`translate(0 ${s.height - 24})`} />
          ))}
        </g>
        <rect x={inner.x - 2} y={inner.y - 2} width={inner.width + 4} height={inner.height + 4} fill="none" stroke="#1E120A" strokeWidth={4} />
        {/* the board */}
        <rect {...inner} fill={BOARD} />
        <rect {...inner} fill={BOARD} filter={ctx.url('cloud')} opacity={0.45} />
        <g filter={ctx.url('smudge')}>
          {smudges.map((m, i) => (
            <ellipse key={i} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} transform={`rotate(${m.a.toFixed(1)} ${m.cx} ${m.cy})`} fill="#E9F2E4" opacity={m.o} />
          ))}
          {swirls.map((d, i) => (
            <path key={`s${i}`} d={d} fill="none" stroke="#E9F2E4" strokeOpacity={0.07} strokeWidth={26} />
          ))}
        </g>
        <rect {...inner} fill={BOARD} filter={ctx.url('dust')} opacity={0.35} />
        {/* chalk tray */}
        <rect x={s.x + 6} y={trayY} width={s.width - 12} height={14} rx={3} fill="#3D2412" />
        <rect x={s.x + 6} y={trayY} width={s.width - 12} height={3} fill="#7A5232" />
        <g>
          <rect x={s.x + s.width * 0.18} y={trayY + 3.5} width={34} height={7} rx={3.5} fill={CHALK} />
          <rect x={s.x + s.width * 0.18 + 42} y={trayY + 4} width={22} height={6.5} rx={3} fill={CHALK_YELLOW} transform={`rotate(-4 ${s.x + s.width * 0.18 + 53} ${trayY + 7})`} />
          <rect x={s.x + s.width * 0.18 + 70} y={trayY + 4} width={14} height={6} rx={3} fill="#F2A0A0" />
          <g transform={`translate(${s.x + s.width * 0.68} ${trayY - 4})`}>
            <rect width={58} height={14} rx={3} fill="#5A3B22" />
            <rect y={9} width={58} height={6} rx={2} fill="#C8C6BC" />
          </g>
        </g>
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.75} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  walls: (ctx) => {
    const w = ctx.wall * 1.15;
    const { a, b, ba, bb } = chalkLines(ctx, w);
    return (
      <g filter={ctx.url('chalk')} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={ba} stroke={CHALK} strokeWidth={w * 1.3} strokeOpacity={0.95} />
        <path d={bb} stroke={CHALK} strokeWidth={w * 0.6} strokeOpacity={0.6} />
        <path d={a} stroke={CHALK} strokeWidth={w} strokeOpacity={0.92} />
        <path d={b} stroke={CHALK} strokeWidth={w * 0.5} strokeOpacity={0.55} />
      </g>
    );
  },
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font * 1.55, k: 0.42, padX: ctx.font * 0.4, h: ctx.font * 1.7 });
    const yellow = hash(spot.room.id) % 3 === 0;
    const tilt = ((hash(spot.room.id) % 100) / 100 - 0.5) * 5;
    const uw = Math.min(p.w * 0.9, p.text.length * p.font * 0.44);
    return (
      <g filter={ctx.url('chalk')} transform={`rotate(${tilt.toFixed(2)} ${p.cx} ${p.cy})`}>
        <LabelText x={p.cx} y={p.cy - p.font * 0.08} font={p.font} family={FONT.hand} weight={700} fill={yellow ? CHALK_YELLOW : CHALK}>
          {p.text}
        </LabelText>
        <path
          d={wobble(p.cx - uw / 2, p.cy + p.font * 0.55, p.cx + uw / 2, p.cy + p.font * 0.5, hash(spot.room.id), p.font * 0.08, p.font * 1.2)}
          fill="none"
          stroke={yellow ? CHALK_YELLOW : CHALK}
          strokeOpacity={0.75}
          strokeWidth={Math.max(ctx.px(1.2), p.font * 0.08)}
          strokeLinecap="round"
        />
      </g>
    );
  },
  frame: (ctx) => {
    const y = -ctx.m.t + FRAME + (ctx.m.t - FRAME) * 0.45;
    const f = Math.min(22, (ctx.m.t - FRAME) * 0.55);
    return (
      <g filter={ctx.url('chalk')} pointerEvents="none" fontFamily={FONT.hand} fontWeight={700}>
        <text x={0} y={y} dominantBaseline="central" fontSize={f} fill={CHALK}>
          {ctx.title}
        </text>
        <text x={ctx.W} y={y} textAnchor="end" dominantBaseline="central" fontSize={f * 0.75} fill={CHALK_YELLOW}>
          Michaelmas term · {ctx.caseCode}
        </text>
      </g>
    );
  },
};

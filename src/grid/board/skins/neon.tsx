import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { hash, rng, type Seg } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * THE NEON QUARTER — wet asphalt with blurred colour reflections and rain, walls as glowing neon
 * tubes (bloom drawn once in its own layer, gently flickering; static with reduced motion),
 * room names as small neon signs.
 */
const PINK = '#FF3EA5';
const CYAN = '#2CF5E6';
const ASPHALT = '#0D0B15';

const FLICKER_CSS = `
@keyframes fmNeonFlicker {
  0%, 100% { opacity: 1 } 41% { opacity: 1 } 42% { opacity: .55 } 43% { opacity: 1 } 44.5% { opacity: .7 } 45.5% { opacity: 1 }
  78% { opacity: .96 } 79% { opacity: .78 } 80% { opacity: .98 }
}
.fm-neon-glow { animation: fmNeonFlicker 7s linear infinite; will-change: opacity }
@media (prefers-reduced-motion: reduce) { .fm-neon-glow { animation: none } }
`;

/** Tube segments are shortened at both ends: real neon has small gaps at the electrodes. */
function tubes(segs: Seg[], gap: number): string {
  return segs
    .map((s) => {
      const len = s.h ? s.x2 - s.x1 : s.y2 - s.y1;
      const g = Math.min(gap, len * 0.2);
      return s.h ? `M${s.x1 + g},${s.y1}L${s.x2 - g},${s.y2}` : `M${s.x1},${s.y1 + g}L${s.x2},${s.y2 - g}`;
    })
    .join('');
}

function borderTubes(W: number, H: number, gap: number): string {
  return `M${gap},0H${W - gap}M${W},${gap}V${H - gap}M${W - gap},${H}H${gap}M0,${H - gap}V${gap}`;
}

const signColor = (id: string) => (hash(id) % 3 === 0 ? CYAN : hash(id) % 3 === 1 ? PINK : '#FFB13B');

function geometry(ctx: SkinCtx) {
  const w = ctx.wall * 0.9;
  const gap = Math.max(ctx.wall * 1.6, ctx.px(4));
  return { w, gap, inner: tubes(ctx.geo.segs, gap), outer: borderTubes(ctx.W, ctx.H, gap) };
}

export const neonSkin: SkinRenderer = {
  id: 'neon',
  margins: { t: 46, r: 46, b: 46, l: 46 },
  tokens: (pal) => ({
    cross: '#FF4D3A',
    note: '#F2ECFF',
    noteBg: '#1A1430',
    hover: CYAN,
    highlight: '#FFC23B',
    reason: '#FFB13B',
    string: '#FF3B5C',
    select: pal.accent,
    grid: { color: '#8E82B3', opacity: 0.12 },
    lamp: { blend: 'screen', color: '#FF8AD0', strength: 0.16 },
    ui: { bg: 'rgba(16,11,30,0.92)', fg: pal.ink, ring: PINK },
  }),
  defs: (ctx) => (
    <>
      <NoiseFilter id={ctx.id('grit')} freq={0.95} octaves={2} seed={21} color="#B8B0D8" slope={2.2} intercept={-1.3} />
      <NoiseFilter id={ctx.id('wet')} freq={0.01} octaves={3} seed={13} color="#000000" slope={2.6} intercept={-1.15} />
      <filter id={ctx.id('reflect')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={`${ctx.U * 0.12} ${ctx.U * 0.4}`} />
      </filter>
      <clipPath id={ctx.id('sheetclip')}>
        <rect {...sheetRect(ctx)} rx={10} />
      </clipPath>
      <pattern id={ctx.id('rain')} patternUnits="userSpaceOnUse" width={60} height={90}>
        <path d="M8,4l-4,16M38,40l-4,16M24,70l-3,12M52,18l-3,11" stroke="#CFC8FF" strokeOpacity={0.09} strokeWidth={ctx.px(0.8)} strokeLinecap="round" />
      </pattern>
      <linearGradient id={ctx.id('sheen')} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.05} />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0.03} />
      </linearGradient>
      <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#9C8CFF', width: ctx.px(0.7), opacity: 0.18, checker: { fill: '#000000', opacity: 0.28 } }} />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const rnd = rng(hash(ctx.puzzle.id) ^ 0x7e0);
    // coloured reflections smeared vertically, as on a wet street
    const blobs = Array.from({ length: 7 + Math.round(ctx.cols / 2) }, () => ({
      x: s.x + rnd() * s.width,
      y: s.y + rnd() * s.height,
      w: 20 + rnd() * 60,
      h: 30 + rnd() * 90,
      c: rnd() > 0.5 ? PINK : rnd() > 0.4 ? CYAN : '#FFB13B',
      o: 0.18 + rnd() * 0.22,
    }));
    return (
      <g>
        <rect {...s} rx={10} fill={ASPHALT} />
        <g filter={ctx.url('reflect')} clipPath={ctx.url('sheetclip')}>
          {blobs.map((b, i) => (
            <rect key={i} x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={b.w / 2} fill={b.c} opacity={b.o} />
          ))}
        </g>
        <rect {...s} fill={ASPHALT} filter={ctx.url('wet')} opacity={0.55} />
        <rect {...s} fill={ASPHALT} filter={ctx.url('grit')} opacity={0.6} />
        <rect {...s} fill={ctx.url('rain')} />
        <rect {...s} rx={10} fill="none" stroke="#2A2340" strokeWidth={ctx.px(1.5)} />
      </g>
    );
  },
  floor: (ctx, room, i, d) => (
    <g>
      <path d={d} fill={ctx.roomColor(i)} fillOpacity={0.9} />
      <path d={d} fill={ctx.url(motifId(room.floor))} />
    </g>
  ),
  floorOverlay: (ctx) => (
    <g>
      {/* reflections of the tubes on the wet floor */}
      <path d={ctx.geo.d} fill="none" stroke={CYAN} strokeOpacity={0.22} strokeWidth={ctx.wall * 3} filter={ctx.url('reflect')} transform={`translate(0 ${ctx.U * 0.12})`} />
      <rect x={0} y={0} width={ctx.W} height={ctx.H} fill={ctx.url('sheen')} />
    </g>
  ),
  walls: (ctx) => {
    const { w, inner, outer } = geometry(ctx);
    const bw = w * 1.15;
    const ends = ctx.geo.junctions;
    return (
      <g fill="none" strokeLinecap="round">
        {/* dark mounting rail under the glass */}
        <path d={ctx.geo.d + ctx.geo.border} stroke="#06050B" strokeOpacity={0.85} strokeWidth={w * 2.6} strokeLinecap="square" />
        <path d={outer} stroke={PINK} strokeWidth={bw} />
        <path d={inner} stroke={CYAN} strokeWidth={w} />
        <path d={outer} stroke="#FFE3F2" strokeWidth={bw * 0.38} />
        <path d={inner} stroke="#E8FFFD" strokeWidth={w * 0.38} />
        {/* electrode caps */}
        {ends.map((j, k) => (
          <rect key={k} x={j.x - w * 0.7} y={j.y - w * 0.7} width={w * 1.4} height={w * 1.4} rx={w * 0.3} fill="#2A2638" stroke="#4A4560" strokeWidth={ctx.px(0.6)} />
        ))}
      </g>
    );
  },
  glow: (ctx) => {
    const { w, inner, outer } = geometry(ctx);
    return (
      <>
        <defs>
          <style>{FLICKER_CSS}</style>
          <filter id={ctx.id('bloom')} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(w * 1.6, ctx.px(4))} result="a" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(w * 4.5, ctx.px(10))} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="a" />
            </feMerge>
          </filter>
        </defs>
        <g filter={ctx.url('bloom')} fill="none" strokeLinecap="round" opacity={0.95}>
          <path d={outer} stroke={PINK} strokeWidth={w * 2.4} />
          <path d={inner} stroke={CYAN} strokeWidth={w * 2.2} />
          {ctx.geo.spots.map((s) => {
            const p = plate(ctx, s, { font: ctx.font, k: 0.6, spacing: ctx.font * 0.08, padX: ctx.font * 0.9, h: ctx.font * 1.75, upper: true });
            const c = signColor(s.room.id);
            return (
              <text key={s.room.id} x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central" fontSize={p.font} fontFamily={FONT.body} fontWeight={700} letterSpacing={p.font * 0.08} fill={c} stroke={c} strokeWidth={p.font * 0.18}>
                {p.text}
              </text>
            );
          })}
        </g>
      </>
    );
  },
  glowStyle: { mixBlendMode: 'screen' },
  glowClassName: 'fm-neon-glow',
  label: (ctx, spot) => {
    const p = plate(ctx, spot, { font: ctx.font, k: 0.6, spacing: ctx.font * 0.08, padX: ctx.font * 0.9, h: ctx.font * 1.75, upper: true });
    const c = signColor(spot.room.id);
    return (
      <g>
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h * 0.3} fill="#07060C" fillOpacity={0.88} stroke={c} strokeOpacity={0.35} strokeWidth={ctx.px(1)} />
        <LabelText x={p.cx} y={p.cy} font={p.font} family={FONT.body} weight={700} spacing={p.font * 0.08} fill="#FFFFFF" stroke={c} strokeWidth={p.font * 0.14}>
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx) => (
    <g pointerEvents="none">
      <text
        x={ctx.W}
        y={ctx.H + ctx.m.b * 0.58}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={Math.min(12, ctx.m.b * 0.24)}
        letterSpacing={Math.min(12, ctx.m.b * 0.24) * 0.3}
        fontFamily={FONT.mono}
        fill={PINK}
        opacity={0.75}
      >
        {`BLOCK ${ctx.district.number} · AFTER MIDNIGHT · ${ctx.caseCode}`}
      </text>
    </g>
  ),
};

import { FONT, LabelText, NoiseFilter, plate, sheetRect } from './common';
import { rrect } from './geom';
import { MotifPatterns, motifId } from './motifs';
import type { SkinCtx, SkinRenderer } from './types';

/**
 * THE MIDNIGHT EXPRESS — brushed steel; every band of rooms is a carriage with rounded ends
 * (the coachwork shows in the side margins), riveted steel-plate walls, lit window slits along
 * each carriage side, bellows couplings between cars, room names on enamel plates.
 */
const PLATE = '#8D8580';
const PLATE_DARK = '#2E2A28';
const PLATE_HI = '#D6CFC8';
const LIVERY = '#4A1712';
const BRASS = '#E6B972';

/** One rect per carriage. Interior separators are inset so neighbouring cars leave a coupling gap. */
function bandRects(ctx: SkinCtx, inset: number) {
  const n = ctx.geo.bands.length;
  return ctx.geo.bands.map((b, i) => {
    const top = i === 0 ? 0 : inset;
    const bottom = i === n - 1 ? 0 : inset;
    const y = b.r0 * ctx.U + top;
    const h = (b.r1 - b.r0 + 1) * ctx.U - top - bottom;
    return { i, y, h, r: Math.min(ctx.U * 0.32, h * 0.25) };
  });
}

export const steelSkin: SkinRenderer = {
  id: 'steel',
  margins: { t: 46, r: 72, b: 46, l: 72 },
  tokens: (pal) => ({
    cross: '#FF4A3D',
    note: '#F4E9E1',
    noteBg: '#2A2321',
    hover: BRASS,
    highlight: '#F0B54A',
    reason: '#F2A33B',
    string: '#E23B3B',
    select: pal.accent2,
    grid: { color: '#000000', opacity: 0.22 },
    lamp: { blend: 'screen', color: '#FFC77A', strength: 0.2 },
    ui: { bg: 'rgba(28,22,20,0.92)', fg: pal.ink, ring: pal.accent2 },
  }),
  defs: (ctx) => (
    <>
      <filter id={ctx.id('brush')} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.42" numOctaves={2} seed={4} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.83  0 0 0 0 0.8  1.6 0 0 0 -0.62" result="c" />
        <feComposite in="c" in2="SourceGraphic" operator="in" />
      </filter>
      <NoiseFilter id={ctx.id('grime')} freq={0.012} octaves={3} seed={7} color="#120C08" slope={1.8} intercept={-0.8} />
      <linearGradient id={ctx.id('sheen')} x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.0} />
        <stop offset="0.35" stopColor="#ffffff" stopOpacity={0.09} />
        <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.0} />
        <stop offset="0.85" stopColor="#ffffff" stopOpacity={0.06} />
      </linearGradient>
      <linearGradient id={ctx.id('livery')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7A2B20" />
        <stop offset="0.45" stopColor={LIVERY} />
        <stop offset="1" stopColor="#2A0C09" />
      </linearGradient>
      <linearGradient id={ctx.id('glass')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE7A6" />
        <stop offset="1" stopColor="#E08A2E" />
      </linearGradient>
      <linearGradient id={ctx.id('enamel')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B4C77" />
        <stop offset="1" stopColor="#152B49" />
      </linearGradient>
      <MotifPatterns id={ctx.id} rooms={ctx.puzzle.rooms} s={{ ink: '#120D0B', width: ctx.px(0.9), opacity: 0.32, checker: { fill: '#000000', opacity: 0.18 } }} />
    </>
  ),
  sheet: (ctx) => {
    const s = sheetRect(ctx);
    const bands = bandRects(ctx, 4);
    const ext = ctx.m.l * 0.86;
    const screws = [
      [s.x + 12, s.y + 12],
      [s.x + s.width - 12, s.y + 12],
      [s.x + s.width - 12, s.y + s.height - 12],
      [s.x + 12, s.y + s.height - 12],
    ];
    return (
      <g>
        <rect {...s} rx={12} fill="#45403D" />
        <rect {...s} rx={12} fill="#45403D" filter={ctx.url('brush')} opacity={0.38} />
        <rect {...s} rx={12} fill="#45403D" filter={ctx.url('grime')} opacity={0.4} />
        <rect {...s} rx={12} fill={ctx.url('sheen')} />
        {/* rails */}
        <g stroke="#1C1918" strokeWidth={ctx.px(2)} opacity={0.6}>
          <path d={`M${s.x},${-ctx.m.t * 0.35}H${s.x + s.width}M${s.x},${ctx.H + ctx.m.b * 0.35}H${s.x + s.width}`} />
        </g>
        {screws.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={5} fill="#7E7672" stroke="#24201E" strokeWidth={ctx.px(0.8)} />
            <path d="M-3.4,-1.2L3.4,1.2" stroke="#24201E" strokeWidth={1.4} />
          </g>
        ))}
        {/* coachwork: capsules that show at both ends of every carriage */}
        {bands.map((b) => (
          <g key={b.i}>
            <path d={rrect(-ext, b.y, ctx.W + ext * 2, b.h, Math.min(ext * 0.85, b.h / 2))} fill={ctx.url('livery')} stroke="#1A0705" strokeWidth={ctx.px(1.2)} />
            <path d={rrect(-ext + 4, b.y + 4, ctx.W + ext * 2 - 8, b.h - 8, Math.min(ext * 0.85, b.h / 2) - 4)} fill="none" stroke={BRASS} strokeOpacity={0.7} strokeWidth={ctx.px(0.9)} />
            {[-ext * 0.55, ctx.W + ext * 0.55].map((x, k) => (
              <g key={k}>
                <circle cx={x} cy={b.y + b.h / 2} r={Math.min(9, b.h * 0.12)} fill={ctx.url('glass')} stroke="#2A0C09" strokeWidth={ctx.px(1)} />
              </g>
            ))}
            <text
              x={-ext * 0.22}
              y={b.y + b.h / 2}
              transform={`rotate(-90 ${-ext * 0.22} ${b.y + b.h / 2})`}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.min(11, ext * 0.18)}
              letterSpacing={2}
              fontFamily={FONT.mono}
              fill={BRASS}
              opacity={0.9}
            >
              {`CAR ${b.i + 1}`}
            </text>
          </g>
        ))}
        {/* bellows couplings between cars */}
        {bands.slice(1).map((b) => (
          <g key={`c${b.i}`}>
            {[-ext * 0.6, ctx.W + ext * 0.2].map((x, k) => (
              <g key={k} transform={`translate(${x} ${b.y - 9})`}>
                <rect width={ext * 0.4} height={10} fill="#141110" />
                <path d={Array.from({ length: 6 }, (_, q) => `M${(q + 0.5) * (ext * 0.4) / 6},0v10`).join('')} stroke="#4A4442" strokeWidth={1.2} />
              </g>
            ))}
          </g>
        ))}
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
    const w = ctx.wall * 1.35;
    const bw = w * 1.45;
    const gapHalf = Math.max(ctx.px(1.5), w * 0.3);
    const inset = bw / 2 + gapHalf;
    const bands = bandRects(ctx, inset);
    const inner = ctx.geo.segs.filter((s) => !(s.h && s.x1 === 0 && s.x2 === ctx.W));
    const dh = inner.filter((s) => s.h).map((s) => `M${s.x1},${s.y1}L${s.x2},${s.y2}`).join('');
    const dv = inner.filter((s) => !s.h).map((s) => `M${s.x1},${s.y1}L${s.x2},${s.y2}`).join('');
    const rivet = Math.max(ctx.px(4.5), w * 0.9);
    const outlines = bands.map((b) => rrect(0, b.y, ctx.W, b.h, b.r)).join('');
    // fill the square corners outside each rounded carriage end with coachwork colour
    const cornerFill = bands
      .map((b) => {
        const r = b.r;
        const t = b.y;
        const btm = b.y + b.h;
        const W = ctx.W;
        return [
          `M0,${t}H${r}A${r},${r} 0 0 0 0,${t + r}Z`,
          `M${W},${t}H${W - r}A${r},${r} 0 0 1 ${W},${t + r}Z`,
          `M0,${btm}H${r}A${r},${r} 0 0 1 0,${btm - r}Z`,
          `M${W},${btm}H${W - r}A${r},${r} 0 0 0 ${W},${btm - r}Z`,
        ].join('');
      })
      .join('');
    const slits = bands.flatMap((b) =>
      Array.from({ length: ctx.cols }, (_, c) => [
        { x: c * ctx.U + 50, y: b.y },
        { x: c * ctx.U + 50, y: b.y + b.h },
      ]).flat(),
    );
    const sl = ctx.U * 0.4;
    const st = Math.max(bw * 0.42, ctx.px(2));
    return (
      <g fill="none">
        <path d={cornerFill} fill="#3A1410" stroke="none" />
        {/* coupling gaps */}
        {bands.slice(1).map((b) => (
          <rect key={b.i} x={-bw} y={b.y - inset - gapHalf} width={ctx.W + bw * 2} height={gapHalf * 2} fill="#0E0B0A" />
        ))}
        {/* interior plates */}
        <g strokeLinecap="square">
          <path d={dh + dv} stroke={PLATE_DARK} strokeWidth={w + ctx.px(2)} />
          <path d={dh + dv} stroke={PLATE} strokeWidth={w} />
          <path d={dh} stroke={PLATE_HI} strokeOpacity={0.55} strokeWidth={w * 0.18} transform={`translate(0 ${-w * 0.3})`} />
          <path d={dv} stroke={PLATE_HI} strokeOpacity={0.55} strokeWidth={w * 0.18} transform={`translate(${-w * 0.3} 0)`} />
        </g>
        {/* carriage shells */}
        <path d={outlines} stroke={PLATE_DARK} strokeWidth={bw + ctx.px(2)} />
        <path d={outlines} stroke={PLATE} strokeWidth={bw} />
        <path d={outlines} stroke={PLATE_HI} strokeOpacity={0.4} strokeWidth={bw * 0.14} />
        {/* rivets */}
        <g strokeLinecap="round">
          <path d={outlines} stroke="#3A3532" strokeWidth={rivet * 0.62} strokeDasharray={`0 ${rivet * 2.6}`} transform={`translate(${ctx.px(0.6)} ${ctx.px(0.6)})`} />
          <path d={outlines} stroke="#D9D2CB" strokeWidth={rivet * 0.5} strokeDasharray={`0 ${rivet * 2.6}`} />
          <path d={dh + dv} stroke="#D9D2CB" strokeWidth={rivet * 0.4} strokeDasharray={`0 ${rivet * 3}`} />
        </g>
        {/* lit window slits along every carriage side */}
        {slits.map((s, k) => (
          <rect key={k} x={s.x - sl / 2} y={s.y - st / 2} width={sl} height={st} rx={st / 2} fill={ctx.url('glass')} stroke="#2A1A10" strokeWidth={ctx.px(0.7)} />
        ))}
      </g>
    );
  },
  label: (ctx, spot) => {
    const spacing = ctx.font * 0.08;
    const p = plate(ctx, spot, { font: ctx.font * 0.82, k: 0.66, spacing, padX: ctx.font * 1.05, h: ctx.font * 1.7, upper: true, inset: ctx.wall * 1.4 + ctx.px(3) });
    return (
      <g>
        <rect x={p.x} y={p.y + ctx.px(1.5)} width={p.w} height={p.h} rx={p.h * 0.28} fill="#000" opacity={0.35} />
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h * 0.28} fill={ctx.url('enamel')} stroke="#0B1626" strokeWidth={ctx.px(0.8)} />
        <rect x={p.x + ctx.px(2)} y={p.y + ctx.px(2)} width={p.w - ctx.px(4)} height={p.h - ctx.px(4)} rx={p.h * 0.22} fill="none" stroke="#F2EEE4" strokeOpacity={0.85} strokeWidth={ctx.px(0.8)} />
        <path d={`M${p.x + p.h * 0.3},${p.y + p.h * 0.25}h${p.w * 0.5}`} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={p.h * 0.12} strokeLinecap="round" />
        <LabelText x={p.cx + spacing / 2} y={p.cy + p.font * 0.04} font={p.font} family={FONT.body} weight={700} spacing={spacing} fill="#F7F3EA">
          {p.text}
        </LabelText>
      </g>
    );
  },
  frame: (ctx) => (
    <g pointerEvents="none">
      <text
        x={ctx.W / 2}
        y={-ctx.m.t * 0.66}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.min(12, ctx.m.t * 0.24)}
        letterSpacing={Math.min(12, ctx.m.t * 0.24) * 0.4}
        fontFamily={FONT.mono}
        fill={BRASS}
        opacity={0.85}
      >
        {`${ctx.district.name.toUpperCase()} · ${ctx.caseCode}`}
      </text>
    </g>
  ),
};

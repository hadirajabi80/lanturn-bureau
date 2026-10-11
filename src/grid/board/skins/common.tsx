import type { JSX, ReactNode } from 'react';
import { parseHex } from '../../../components/avatar/color';
import type { SkinCtx } from './types';
import { fitName, textWidth } from './geom';

/**
 * Colourised fractal noise, clipped to the element it is applied to.
 * Apply to a rect: the result is a texture of `color` whose alpha follows the noise.
 */
export function NoiseFilter(props: {
  id: string;
  freq: number | string;
  octaves?: number;
  seed?: number;
  color: string;
  /** alpha = slope * noise + intercept */
  slope: number;
  intercept: number;
  type?: 'fractalNoise' | 'turbulence';
}): JSX.Element {
  const [r, g, b] = parseHex(props.color).map((v) => v / 255) as [number, number, number];
  return (
    <filter id={props.id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
      <feTurbulence type={props.type ?? 'fractalNoise'} baseFrequency={props.freq} numOctaves={props.octaves ?? 3} seed={props.seed ?? 3} stitchTiles="stitch" result="n" />
      <feColorMatrix
        in="n"
        type="matrix"
        values={`0 0 0 0 ${r.toFixed(3)}  0 0 0 0 ${g.toFixed(3)}  0 0 0 0 ${b.toFixed(3)}  ${props.slope} 0 0 0 ${props.intercept}`}
        result="c"
      />
      <feComposite in="c" in2="SourceGraphic" operator="in" />
    </filter>
  );
}

/** Wobble whatever it is applied to (hand-drawn / chalky edges). Scale in user units. */
export function WobbleFilter({ id, freq, scale, octaves = 2, seed = 7 }: { id: string; freq: number; scale: number; octaves?: number; seed?: number }): JSX.Element {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={octaves} seed={seed} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

/** Whole-sheet rectangle (covers margins). */
export function sheetRect(ctx: SkinCtx, inset = 0): { x: number; y: number; width: number; height: number } {
  return {
    x: -ctx.m.l + inset,
    y: -ctx.m.t + inset,
    width: ctx.W + ctx.m.l + ctx.m.r - inset * 2,
    height: ctx.H + ctx.m.t + ctx.m.b - inset * 2,
  };
}

/** Plate geometry shared by all label styles. */
export function plate(
  ctx: SkinCtx,
  spot: { x: number; y: number; maxW: number; name: string },
  opts: { font?: number; k?: number; spacing?: number; padX?: number; h?: number; upper?: boolean; inset?: number } = {},
): { text: string; font: number; x: number; y: number; w: number; h: number; cx: number; cy: number; fits: boolean } {
  const font = opts.font ?? ctx.font;
  const k = opts.k ?? 0.56;
  const spacing = opts.spacing ?? 0;
  const padX = opts.padX ?? font * 0.7;
  const h = opts.h ?? font * 1.6;
  const inset = opts.inset ?? ctx.wall * 0.75 + ctx.px(3);
  const maxW = Math.max(font * 3, spot.maxW - inset * 2);
  const raw = opts.upper ? spot.name.toUpperCase() : spot.name;
  const text = fitName(raw, maxW - padX * 2, font, k, spacing);
  const tw = textWidth(text, font, k, spacing);
  const w = Math.min(maxW, tw + padX * 2);
  const x = spot.x - w / 2;
  const y = spot.y - inset - h;
  return { text, font, x, y, w, h, cx: spot.x, cy: y + h / 2, fits: tw + padX * 2 <= maxW + 0.5 };
}

/** <text> with the shared label attributes (no pointer events, central baseline). */
export function LabelText(props: {
  x: number;
  y: number;
  font: number;
  family: string;
  fill: string;
  weight?: number;
  italic?: boolean;
  spacing?: number;
  maxW?: number;
  stroke?: string;
  strokeWidth?: number;
  filter?: string;
  opacity?: number;
  children: ReactNode;
}): JSX.Element {
  return (
    <text
      x={props.x}
      y={props.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={props.font}
      fontFamily={props.family}
      fontWeight={props.weight ?? 600}
      fontStyle={props.italic ? 'italic' : undefined}
      letterSpacing={props.spacing}
      fill={props.fill}
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
      paintOrder="stroke"
      filter={props.filter}
      opacity={props.opacity}
      style={{ userSelect: 'none' }}
    >
      {props.children}
    </text>
  );
}

export const FONT = {
  display: '"Playfair Display", Georgia, "Times New Roman", serif',
  body: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace',
  hand: '"Caveat", "Segoe Print", "Bradley Hand", "Chalkboard SE", "Comic Neue", cursive',
  script: '"Dancing Script", "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive',
  cute: '"Pacifico", "Dancing Script", "Segoe Script", cursive',
} as const;

/** Classic 8-point compass rose. */
export function Compass({ cx, cy, r, ink, paper, accent }: { cx: number; cy: number; r: number; ink: string; paper: string; accent: string }): JSX.Element {
  const pts = (ang: number, long: number, wide: number) => {
    const a = (ang * Math.PI) / 180;
    const tip = [Math.sin(a) * long, -Math.cos(a) * long];
    const l = [Math.sin(a - Math.PI / 2) * wide, -Math.cos(a - Math.PI / 2) * wide];
    const rr = [Math.sin(a + Math.PI / 2) * wide, -Math.cos(a + Math.PI / 2) * wide];
    return { tip, l, rr };
  };
  const star = [0, 90, 180, 270].map((a) => pts(a, r, r * 0.17));
  const small = [45, 135, 225, 315].map((a) => pts(a, r * 0.6, r * 0.12));
  const half = (p: ReturnType<typeof pts>, side: 'l' | 'rr') => `M0,0L${p[side][0]},${p[side][1]}L${p.tip[0]},${p.tip[1]}Z`;
  return (
    <g transform={`translate(${cx} ${cy})`} strokeLinejoin="round">
      <circle r={r * 0.78} fill="none" stroke={ink} strokeWidth={r * 0.025} />
      <circle r={r * 0.7} fill="none" stroke={ink} strokeWidth={r * 0.012} strokeDasharray={`${r * 0.04} ${r * 0.04}`} />
      {small.map((p, i) => (
        <g key={`s${i}`}>
          <path d={half(p, 'l')} fill={paper} stroke={ink} strokeWidth={r * 0.02} />
          <path d={half(p, 'rr')} fill={ink} stroke={ink} strokeWidth={r * 0.02} />
        </g>
      ))}
      {star.map((p, i) => (
        <g key={`m${i}`}>
          <path d={half(p, 'l')} fill={i === 0 ? accent : paper} stroke={ink} strokeWidth={r * 0.025} />
          <path d={half(p, 'rr')} fill={ink} stroke={ink} strokeWidth={r * 0.025} />
        </g>
      ))}
      <circle r={r * 0.07} fill={paper} stroke={ink} strokeWidth={r * 0.02} />
      <text y={-r * 1.12} textAnchor="middle" fontSize={r * 0.38} fontFamily={FONT.display} fontStyle="italic" fontWeight={700} fill={ink}>
        N
      </text>
    </g>
  );
}

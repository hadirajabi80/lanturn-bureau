import type { ReactNode } from 'react';
import type { Brows, Eyes, FacialHair, Mouth } from '../../data/types';
import type { AvatarPalette } from './palette';

/** Feature anchors (viewBox 0..100). */
export const EYE_Y = 47.5;
export const EYE_L = 42;
export const EYE_R = 58;
export const BROW_Y = 40.5;
export const MOUTH_X = 50;
export const MOUTH_Y = 59.5;

// ─────────────────────────── Eyes ───────────────────────────

interface EyeOpts {
  cat?: boolean;
  old?: boolean;
}

/** One eye, drawn in local coords around (0,0) for the RIGHT side (outer corner at +x). */
function eyeShape(kind: Eyes, p: AvatarPalette, o: EyeOpts): ReactNode {
  const lid = { fill: 'none', stroke: p.ink, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const irisFill = o.cat ? p.catIris : p.iris;
  const scleraFill = o.cat ? p.catIris : p.sclera;
  const pupil = (cx: number, cy: number, r: number) =>
    o.cat ? (
      <ellipse cx={cx} cy={cy} rx={r * 0.42} ry={r * 1.25} fill={p.ink} />
    ) : (
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#140d10" />
    );
  const glint = (cx: number, cy: number, r = 0.75) => <circle cx={cx} cy={cy} r={r} fill="#ffffff" />;
  const bags = o.old ? (
    <path d="M-2.8,3.4 Q0,4.8 2.8,3.4" fill="none" stroke={p.skinLine} strokeWidth={0.6} opacity={0.45} strokeLinecap="round" />
  ) : null;

  switch (kind) {
    case 'round':
      return (
        <g>
          <ellipse rx={3.3} ry={3.5} fill={scleraFill} />
          {!o.cat && <circle cx={0} cy={0.3} r={2.35} fill={irisFill} />}
          {pupil(0, 0.3, 2.3)}
          {glint(-0.8, -0.7)}
          <path {...lid} strokeWidth={1.3} d="M-3.7,-0.9 Q0,-4.6 3.7,-0.9" />
          {bags}
        </g>
      );
    case 'wide':
      return (
        <g>
          <ellipse rx={3.8} ry={4.3} fill={scleraFill} stroke={p.ink} strokeWidth={0.5} />
          {!o.cat && <circle cx={0} cy={0.4} r={2.2} fill={irisFill} />}
          {o.cat ? <circle cx={0} cy={0.3} r={2.3} fill={p.ink} /> : pupil(0, 0.4, 2.2)}
          {glint(-0.9, -0.9, 0.85)}
          <path {...lid} strokeWidth={1.3} d="M-4.1,-1.2 Q0,-5.6 4.1,-1.2" />
          <path {...lid} strokeWidth={0.7} d="M3.9,-2.6 L5,-3.6" />
          {bags}
        </g>
      );
    case 'narrow':
      return (
        <g>
          <ellipse cy={0.3} rx={3.6} ry={1.75} fill={scleraFill} />
          {!o.cat && <ellipse cx={0} cy={0.3} rx={1.9} ry={1.65} fill={irisFill} />}
          {o.cat ? <ellipse cx={0} cy={0.3} rx={0.6} ry={1.6} fill={p.ink} /> : <circle cx={0} cy={0.3} r={0.85} fill="#140d10" />}
          {glint(-0.6, -0.2, 0.5)}
          <path {...lid} strokeWidth={1.6} d="M-4,-0.4 Q0,-2.6 4,-0.6" />
          <path {...lid} strokeWidth={0.6} opacity={0.6} d="M-2.8,2 Q0,2.6 2.8,1.9" />
          {bags}
        </g>
      );
    case 'sleepy':
      return (
        <g>
          <path d="M-3.4,0 Q0,3.8 3.4,0 Z" fill={scleraFill} />
          {!o.cat && <path d="M-2.1,0 A2.1,2.1 0 0 0 2.1,0 Z" fill={irisFill} />}
          {o.cat ? <ellipse cx={0} cy={1.1} rx={0.6} ry={1.1} fill={p.ink} /> : <path d="M-1,0 A1,1 0 0 0 1,0 Z" fill="#140d10" />}
          <path d="M-3.7,0.2 Q0,-3.4 3.7,0.2 Z" fill={o.cat ? p.hairShadow : p.skinShadow} opacity={0.75} />
          <path {...lid} strokeWidth={1.5} d="M-3.9,0.2 Q0,-0.6 3.9,0.2" />
          {bags}
        </g>
      );
    case 'sharp':
      return (
        <g>
          <path d="M-3.6,0.8 Q-0.5,-3 3.9,-1.6 Q1.2,2.6 -3.6,0.8 Z" fill={scleraFill} />
          {!o.cat && <circle cx={0.1} cy={-0.1} r={1.95} fill={irisFill} />}
          {o.cat ? <ellipse cx={0.1} cy={-0.1} rx={0.6} ry={1.9} fill={p.ink} /> : <circle cx={0.1} cy={-0.1} r={0.9} fill="#140d10" />}
          {glint(-0.6, -0.8, 0.6)}
          <path {...lid} strokeWidth={1.5} d="M-3.9,0.7 Q-0.5,-3.5 4.4,-1.9" />
          {bags}
        </g>
      );
    case 'closed':
      return (
        <g>
          <path {...lid} strokeWidth={1.5} d="M-3.5,-0.4 Q0,2.8 3.5,-0.4" />
          <path {...lid} strokeWidth={0.7} d="M3.4,-0.4 L4.5,-1.3" />
          {bags}
        </g>
      );
    case 'dot':
    default:
      return (
        <g>
          <ellipse rx={1.9} ry={2.2} fill={o.cat ? p.ink : '#1b1216'} />
          {glint(-0.6, -0.8, 0.6)}
          {bags}
        </g>
      );
  }
}

export function renderEyes(kind: Eyes, p: AvatarPalette, o: EyeOpts & { scale?: number; hideRight?: boolean }): ReactNode {
  const s = o.scale ?? 1;
  return (
    <g>
      <g transform={`translate(${EYE_L} ${EYE_Y}) scale(${-s} ${s})`}>{eyeShape(kind, p, o)}</g>
      {!o.hideRight && <g transform={`translate(${EYE_R} ${EYE_Y}) scale(${s} ${s})`}>{eyeShape(kind, p, o)}</g>}
    </g>
  );
}

// ─────────────────────────── Brows ───────────────────────────

function browShape(kind: Brows, color: string, weight: number): ReactNode {
  const st = { fill: 'none', stroke: color, strokeLinecap: 'round' as const, strokeWidth: 1.7 * weight };
  switch (kind) {
    case 'flat':
      return <path {...st} d="M-3.8,0.2 Q0,-0.5 3.8,0" />;
    case 'arched':
      return <path {...st} d="M-4,0.8 Q-0.5,-2.8 4,0.2" />;
    case 'angry':
      return <path {...st} strokeWidth={1.95 * weight} d="M-4,1.6 Q0,0.2 4,-1.5" />;
    case 'worried':
      return <path {...st} d="M-4,-1.8 Q0,-0.8 4,1.3" />;
    case 'raised':
      return <path {...st} d="M-4,-1.6 Q-0.5,-5 4,-2.2" />;
    case 'thick':
    default:
      return <path fill={color} stroke={color} strokeWidth={0.4} strokeLinejoin="round" d="M-4.6,1.1 Q-1,-2.7 4.7,-0.5 L4.5,1.5 Q-0.6,-0.3 -4.4,2.7 Z" />;
  }
}

export function renderBrows(kind: Brows, color: string, o: { y?: number; weight?: number } = {}): ReactNode {
  const y = o.y ?? BROW_Y;
  const w = o.weight ?? 1;
  return (
    <g>
      <g transform={`translate(${EYE_L} ${y}) scale(-1 1)`}>{browShape(kind, color, w)}</g>
      {/* an eyepatch still shows the brow over it */}
      <g transform={`translate(${EYE_R} ${y})`}>{browShape(kind, color, w)}</g>
    </g>
  );
}

// ─────────────────────────── Mouth ───────────────────────────

/** True for mouths that are already "open" shapes (no extra jaw overlay needed when speaking). */
export const OPEN_MOUTHS: ReadonlySet<Mouth> = new Set<Mouth>(['grin', 'o', 'teeth']);

export function mouthShape(kind: Mouth, p: AvatarPalette): ReactNode {
  const line = { fill: 'none', stroke: p.mouthLine, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.5 };
  switch (kind) {
    case 'smile':
      return (
        <g>
          <path {...line} d="M-5,-1.2 Q0,3.8 5,-1.2" />
          <path {...line} strokeWidth={0.8} opacity={0.6} d="M-5.6,-1.9 L-4.9,-0.8 M5.6,-1.9 L4.9,-0.8" />
        </g>
      );
    case 'smirk':
      return (
        <g>
          <path {...line} d="M-4.4,0.4 Q1,1.6 4.8,-1.9" />
          <path {...line} strokeWidth={0.8} opacity={0.7} d="M4.6,-2.5 L5.3,-1.3" />
        </g>
      );
    case 'frown':
      return <path {...line} d="M-4.5,1.8 Q0,-1.8 4.5,1.8" />;
    case 'neutral':
      return <path {...line} d="M-4,0 Q0,0.6 4,0" />;
    case 'grin':
      return (
        <g>
          <path fill={p.mouthDark} stroke={p.mouthLine} strokeWidth={1.1} strokeLinejoin="round" d="M-5.6,-1.6 Q0,-0.4 5.6,-1.6 Q4.6,5.2 0,5.2 Q-4.6,5.2 -5.6,-1.6 Z" />
          <path fill="#ffffff" d="M-4.7,-1.05 Q0,-0.2 4.7,-1.05 L4.3,0.7 Q0,1.4 -4.3,0.7 Z" />
          <ellipse cx={0} cy={3.5} rx={2.5} ry={1.15} fill={p.tongue} />
        </g>
      );
    case 'o':
      return (
        <g>
          <ellipse rx={2.3} ry={2.9} cy={0.4} fill={p.mouthDark} stroke={p.mouthLine} strokeWidth={0.9} />
          <ellipse cx={0} cy={2} rx={1.2} ry={0.7} fill={p.tongue} opacity={0.85} />
        </g>
      );
    case 'pout':
      return (
        <g>
          <path fill={p.lip} stroke={p.mouthLine} strokeWidth={1} strokeLinejoin="round" d="M-2.7,0.2 Q-1.3,-1.6 0,-0.7 Q1.3,-1.6 2.7,0.2 Q0,2.4 -2.7,0.2 Z" />
          <path {...line} strokeWidth={0.6} d="M-2,0.3 L2,0.3" />
        </g>
      );
    case 'teeth':
    default:
      return (
        <g>
          <rect x={-5} y={-2} width={10} height={4.3} rx={1.7} fill="#fffaf0" stroke={p.mouthLine} strokeWidth={1.1} />
          <path stroke={p.mouthLine} strokeWidth={0.55} d="M-5,0.15 L5,0.15 M-2.5,-2 L-2.5,2.3 M0,-2 L0,2.3 M2.5,-2 L2.5,2.3" />
        </g>
      );
  }
}

// ─────────────────────────── Nose / cheeks / age ───────────────────────────

export function renderNose(p: AvatarPalette, age: 'young' | 'adult' | 'old'): ReactNode {
  const s = age === 'young' ? 0.8 : age === 'old' ? 1.12 : 1;
  return (
    <g transform={`translate(50 51.5) scale(${s})`}>
      <ellipse cx={0.2} cy={2.4} rx={2.4} ry={1.3} fill={p.skinShadow} opacity={0.55} />
      <path d="M0.6,-3.4 Q-1.9,1.8 0.2,2.6 Q1.5,3 2.4,2.2" fill="none" stroke={p.skinLine} strokeWidth={1} strokeLinecap="round" opacity={0.75} />
      <ellipse cx={-0.8} cy={-0.2} rx={0.6} ry={1.6} fill="#ffffff" opacity={0.18} />
    </g>
  );
}

export function renderWrinkles(p: AvatarPalette): ReactNode {
  const st = { fill: 'none', stroke: p.skinLine, strokeLinecap: 'round' as const, strokeWidth: 0.7, opacity: 0.5 };
  return (
    <g>
      <path {...st} d="M62.8,46.4 L65,45.6 M62.9,48.4 L65,49.2" />
      <path {...st} d="M37.2,46.4 L35,45.6 M37.1,48.4 L35,49.2" />
      <path {...st} d="M45.2,54.6 Q43.2,57.6 44.4,61" />
      <path {...st} d="M54.8,54.6 Q56.8,57.6 55.6,61" />
      <path {...st} opacity={0.3} d="M47,65.2 Q50,66.2 53,65.2" />
    </g>
  );
}

// ─────────────────────────── Facial hair ───────────────────────────

const JAW_INNER = 'C67,53 63.5,57 59,58.6 C56,62.5 53,64 50,64 C47,64 44,62.5 41,58.6 C36.5,57 33,53 31.2,46 Z';

export function renderMustache(kind: FacialHair, p: AvatarPalette): ReactNode {
  const base = { fill: p.hair, stroke: p.hairLine, strokeWidth: 0.8, strokeLinejoin: 'round' as const };
  if (kind === 'mustache' || kind === 'beard' || kind === 'bigBeard') {
    return (
      <g>
        <path {...base} d="M43.4,58.2 Q46.5,54.4 50,55.9 Q53.5,54.4 56.6,58.2 Q53.5,58.4 50,57.7 Q46.5,58.4 43.4,58.2 Z" />
        <path fill="none" stroke={p.hairLight} strokeWidth={0.6} opacity={0.5} strokeLinecap="round" d="M45.5,56.6 Q47.5,55.6 49.2,56.4" />
      </g>
    );
  }
  if (kind === 'goatee') {
    return <path {...base} d="M45.4,56.6 Q48,54.6 50,55.5 Q52,54.6 54.6,56.6 Q52,57.2 50,56.8 Q48,57.2 45.4,56.6 Z" />;
  }
  return null;
}

/** Jaw / chin hair, drawn under the mouth. Mustaches come from renderMustache (drawn over the mouth). */
export function renderBeard(kind: FacialHair, p: AvatarPalette): ReactNode {
  const base = { fill: p.hair, stroke: p.hairLine, strokeWidth: 0.9, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'beard':
      return (
        <g>
          <path {...base} d={`M31.2,46 C31.5,60 39,70.6 50,70.6 C61,70.6 68.5,60 68.8,46 ${JAW_INNER}`} />
          <path fill="none" stroke={p.hairShadow} strokeWidth={0.6} strokeLinecap="round" d="M38,62 L39,65 M44,66 L44.6,68.6 M56,66 L55.4,68.6 M62,62 L61,65" />
        </g>
      );
    case 'stubble':
      return (
        <g opacity={0.3}>
          <path fill={p.hair} d={`M31.6,49 C32,61 39.5,69 50,69 C60.5,69 68,61 68.4,49 ${JAW_INNER.replace('31.2,46', '31.6,49')}`} />
          <path fill={p.hair} d="M44.6,57.4 Q50,55 55.4,57.4 Q50,57.6 44.6,57.4 Z" />
        </g>
      );
    case 'goatee':
      return (
        <g>
          <path {...base} d="M46,63.6 Q50,62.4 54,63.6 Q54.6,67.6 50,69.4 Q45.4,67.6 46,63.6 Z" />
          <path fill="none" stroke={p.hairLight} strokeWidth={0.5} opacity={0.5} d="M48.6,64.6 L49,67.4" />
        </g>
      );
    case 'bigBeard':
      return (
        <g>
          <path {...base} d={`M29.5,44 C29,60 33.5,76 41,83 Q44,86.4 47,84.6 Q50,87.4 53,84.6 Q56,86.4 59,83 C66.5,76 71,60 70.5,44 C68.5,53 64,57.5 59,58.6 C56,62.5 53,64 50,64 C47,64 44,62.5 41,58.6 C36,57.5 31.5,53 29.5,44 Z`} />
          <path fill="none" stroke={p.hairShadow} strokeWidth={0.7} strokeLinecap="round" d="M37,64 Q39,70 38.5,75 M44,68 Q45,74 44.5,80 M56,68 Q55,74 55.5,80 M63,64 Q61,70 61.5,75 M50,67 L50,82" />
          <path fill="none" stroke={p.hairLight} strokeWidth={0.6} opacity={0.4} strokeLinecap="round" d="M41,66 Q42,71 41.5,76 M59,66 Q58,71 58.5,76" />
        </g>
      );
    default:
      return null;
  }
}

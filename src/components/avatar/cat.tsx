import type { ReactNode } from 'react';
import type { Mouth } from '../../data/types';
import type { AvatarPalette } from './palette';
import { shade } from './color';

/**
 * Cat parts. Fur colours: `hairColor` is the main coat (head, ears, shoulders, tabby marks darker),
 * `skin` is the light fur (muzzle, chin, chest bib). Collar uses `outfit`.
 * Eyes/brows/accessories reuse the human anchors (eyes at y 47.5, x 42/58).
 */

export const CAT_HEAD = 'M26,51 C26,36 37,28.6 50,28.6 C63,28.6 74,36 74,51 C74,62 64,69 50,69 C36,69 26,62 26,51 Z';

export function catBody(p: AvatarPalette): ReactNode {
  const fur = p.hair;
  return (
    <g>
      <path d="M16,100 C16,84 31,70 50,70 C69,70 84,84 84,100 Z" fill={fur} stroke={p.hairLine} strokeWidth={1} strokeLinejoin="round" />
      <path d="M37,100 C36.4,88 41,75.4 50,75.4 C59,75.4 63.6,88 63,100 Z" fill={p.skin} />
      <path d="M41,82 L43,86 L45,82.6 M55,82.6 L57,86 L59,82" fill="none" stroke={shade(p.skin, -0.18)} strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22,92 C23,86 26,82 30,79 M78,92 C77,86 74,82 70,79" fill="none" stroke={p.furMarks} strokeWidth={1.2} opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

export function catCollar(p: AvatarPalette): ReactNode {
  const c = p.outfit;
  return (
    <g>
      <path d="M36.6,66.6 C43,71 57,71 63.4,66.6 L64.4,70.8 C57.4,75.6 42.6,75.6 35.6,70.8 Z" fill={c} stroke={shade(c, -0.45)} strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M38.4,69 C44,72 56,72 61.6,69" fill="none" stroke={shade(c, 0.35)} strokeWidth={0.6} opacity={0.6} strokeLinecap="round" />
      <circle cx={50} cy={75.6} r={2.8} fill={p.brass} stroke={p.brassDark} strokeWidth={0.7} />
      <path d="M48.2,76.4 L51.8,76.4 M50,76.4 L50,78" stroke={p.brassDark} strokeWidth={0.6} strokeLinecap="round" />
      <circle cx={49.1} cy={74.6} r={0.7} fill="#fff6d8" />
    </g>
  );
}

/** Ears + cheek ruff: drawn behind the head shape. */
export function catBackHead(p: AvatarPalette): ReactNode {
  const fur = p.hair;
  const line = p.hairLine;
  return (
    <g>
      {/* cheek ruff */}
      <path d="M28,54 L21.6,58.6 L27.4,59.4 L23.6,63.6 L31,62.6 Z" fill={fur} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M72,54 L78.4,58.6 L72.6,59.4 L76.4,63.6 L69,62.6 Z" fill={fur} stroke={line} strokeWidth={0.9} strokeLinejoin="round" />
      {/* ears */}
      <path d="M28.4,44 C27.4,34 28,24 31,15.6 C36.4,18.6 42.4,24 46.4,30.4 Z" fill={fur} stroke={line} strokeWidth={1} strokeLinejoin="round" />
      <path d="M71.6,44 C72.6,34 72,24 69,15.6 C63.6,18.6 57.6,24 53.6,30.4 Z" fill={fur} stroke={line} strokeWidth={1} strokeLinejoin="round" />
      <path d="M31.4,37 C31.2,30.6 31.8,25 33.2,20.8 C36.8,23.4 40,26.6 42.4,30.4 Z" fill={p.innerEar} />
      <path d="M68.6,37 C68.8,30.6 68.2,25 66.8,20.8 C63.2,23.4 60,26.6 57.6,30.4 Z" fill={p.innerEar} />
      <path d="M33.6,25 L36.4,28.6 M66.4,25 L63.6,28.6" stroke={p.skin} strokeWidth={0.7} strokeLinecap="round" opacity={0.8} />
    </g>
  );
}

/** Tabby marks + muzzle, drawn over the head shape (before eyes). */
export function catFace(p: AvatarPalette): ReactNode {
  const marks = { fill: 'none', stroke: p.furMarks, strokeLinecap: 'round' as const, strokeWidth: 1.5 };
  return (
    <g>
      <path {...marks} d="M50,30 L50,36.4 M45.4,30.8 L46.6,35.6 M54.6,30.8 L53.4,35.6" />
      <path {...marks} strokeWidth={1.2} d="M26.8,49 L31.6,50 M27.2,53.6 L31.8,53.6 M73.2,49 L68.4,50 M72.8,53.6 L68.2,53.6" />
      <ellipse cx={50} cy={62.8} rx={4} ry={2.8} fill={p.skin} />
      <ellipse cx={46.1} cy={58} rx={4.9} ry={3.9} fill={p.skin} />
      <ellipse cx={53.9} cy={58} rx={4.9} ry={3.9} fill={p.skin} />
      {[44, 46, 43.6].map((x, i) => (
        <circle key={`l${i}`} cx={x} cy={[57.4, 59, 60.2][i]} r={0.35} fill={shade(p.skin, -0.4)} />
      ))}
      {[56, 54, 56.4].map((x, i) => (
        <circle key={`r${i}`} cx={x} cy={[57.4, 59, 60.2][i]} r={0.35} fill={shade(p.skin, -0.4)} />
      ))}
    </g>
  );
}

export function catNose(p: AvatarPalette): ReactNode {
  return (
    <g>
      <path d="M47.6,53.4 L52.4,53.4 Q51.4,55.6 50,56 Q48.6,55.6 47.6,53.4 Z" fill={shade(p.innerEar, -0.12)} stroke={shade(p.innerEar, -0.5)} strokeWidth={0.6} strokeLinejoin="round" />
      <ellipse cx={49.2} cy={54} rx={0.8} ry={0.4} fill="#ffffff" opacity={0.5} />
    </g>
  );
}

/** Cat mouth (local coords around 0,0 = just below the nose at 50,57). */
export function catMouth(kind: Mouth, p: AvatarPalette): ReactNode {
  const line = { fill: 'none', stroke: p.mouthLine, strokeWidth: 1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const ink = shade(p.skin, -0.6);
  switch (kind) {
    case 'o':
      return (
        <g>
          <path {...line} stroke={ink} d="M0,-1 L0,0" />
          <ellipse cx={0} cy={2.2} rx={1.8} ry={2.2} fill="#5a2028" stroke={ink} strokeWidth={0.7} />
        </g>
      );
    case 'grin':
    case 'teeth':
      return (
        <g>
          <path d="M-3.6,0 Q0,1 3.6,0 Q2.6,4.6 0,4.6 Q-2.6,4.6 -3.6,0 Z" fill="#5a2028" stroke={ink} strokeWidth={0.7} strokeLinejoin="round" />
          <path d="M-2.6,0.4 L-2,1.8 L-1.4,0.5 M2.6,0.4 L2,1.8 L1.4,0.5" fill="#ffffff" />
          <ellipse cx={0} cy={3.4} rx={1.5} ry={0.8} fill="#e07a86" />
        </g>
      );
    case 'frown':
    case 'pout':
      return <path {...line} stroke={ink} d="M0,-1 L0,0.4 M-3,2.2 Q-1.6,0.2 0,0.4 Q1.6,0.2 3,2.2" />;
    case 'neutral':
      return <path {...line} stroke={ink} d="M0,-1 L0,0.6 M-2.6,1.2 Q-1.2,1.4 0,0.6 Q1.2,1.4 2.6,1.2" />;
    case 'smirk':
      return <path {...line} stroke={ink} d="M0,-1 L0,0.6 M-2.4,1.2 Q-1.2,1.6 0,0.6 Q1.6,1.8 3.4,-0.4" />;
    case 'smile':
    default:
      return <path {...line} stroke={ink} d="M0,-1 L0,0.6 M-3.2,0.2 Q-1.6,2.6 0,0.6 Q1.6,2.6 3.2,0.2" />;
  }
}

export function catWhiskers(p: AvatarPalette): ReactNode {
  const st = { fill: 'none', stroke: p.whisker, strokeWidth: 0.55, strokeLinecap: 'round' as const };
  return (
    <g>
      <path {...st} d="M43,57.4 Q32,54.6 20,55.6 M43,59.2 Q32,58.6 19.6,61 M43.6,60.8 Q34,62.4 22.4,66.6" />
      <path {...st} d="M57,57.4 Q68,54.6 80,55.6 M57,59.2 Q68,58.6 80.4,61 M56.4,60.8 Q66,62.4 77.6,66.6" />
    </g>
  );
}

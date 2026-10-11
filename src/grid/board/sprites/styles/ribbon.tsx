import type { JSX } from 'react';
import type { Pen } from '../core/pen';
import { biggestSolid, heartEl, sweetStyle } from './sweet';
import type { Material } from './types';

/** Rosewater Patisserie: pastel pink, cream and mint, scalloped edges, sprinkles and tiny hearts. */
const MAT: Record<Material, string> = {
  wood: '#f6dcbc', darkwood: '#e3b391', fabric: '#ffc2d6', leather: '#f7b6a4', linen: '#fffaf2', metal: '#cdeee1',
  brass: '#ffd27a', stone: '#fff3e6', glass: '#d8f1ff', paper: '#ffffff', leaf: '#9ddbb0', water: '#bfe6ff',
  fire: '#ffb37a', fruit: '#ffd36e', rope: '#f6dcbc', ceramic: '#fffdf8', soil: '#d4a587',
};
const TINTS = ['#ffb3cf', '#b9ead4', '#ffe3a3', '#d9c8ff', '#ffc9a8', '#b8e2ff'];
const SPRINKLES = ['#ff6fa3', '#5fcf9a', '#ffc857', '#9b7bff', '#5ab8f0'];

function hearts(pen: Pen): JSX.Element | null {
  const b = biggestSolid(pen);
  if (!b || b.w < 36 || b.h < 30) return null;
  return heartEl(b.x + b.w - 9, b.y + 9, 8, pen.p.accent);
}

export const ribbon = sweetStyle({
  id: 'ribbon',
  mat: MAT,
  deep: '#b8507e',
  shadow: '#e07aa3',
  accent: { fill: '#ffd27a', line: '#ff8fb8' },
  tints: TINTS,
  font: "'Playfair Display', Georgia, serif",
  texture: (m, open) => {
    if (!open && (m === 'wood' || m === 'stone' || m === 'ceramic' || m === 'linen')) {
      return { kind: 'sprinkles', angle: 0, spacing: 9, sw: 1.5, color: SPRINKLES[0], colors: SPRINKLES, opacity: 0.95, gaps: 0.35 };
    }
    return null;
  },
  rule: () => ({ stroke: '#ffffff', sw: 1.7, opacity: 0.95, inset: 3.4, dash: '0.1 3.6' }),
  trim: () => ({ kind: 'scallop', size: 7, color: '#ffffff' }),
  decorate: hearts,
});

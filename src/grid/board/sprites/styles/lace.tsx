import type { JSX } from 'react';
import type { Pen } from '../core/pen';
import { rectSolids, sweetStyle } from './sweet';
import type { Material } from './types';

/** Lavender & Lace Boutique: lilac and blush velvet, white lace frills, pearl details, gilt. */
const MAT: Record<Material, string> = {
  wood: '#f4eaf4', darkwood: '#d6bfe3', fabric: '#cfb0ff', leather: '#f2bcd8', linen: '#fffaff', metal: '#e8e2f2',
  brass: '#ecc97f', stone: '#faf5ff', glass: '#e6f3ff', paper: '#ffffff', leaf: '#a8d8b9', water: '#cfe9ff',
  fire: '#ffbf8a', fruit: '#ffe08a', rope: '#ecdcc8', ceramic: '#ffffff', soil: '#c9aab4',
};
const TINTS = ['#d9c2ff', '#ffc2dc', '#c8eee6', '#ffe6c2', '#e6d0ff', '#ffd6e8'];

function pearls(pen: Pen): JSX.Element | null {
  let d = '';
  let hl = '';
  const r = 1.9;
  const dot = (x: number, y: number) => {
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
    hl += `M${(x - 0.9).toFixed(1)} ${(y - 0.6).toFixed(1)}a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0`;
  };
  for (const b of rectSolids(pen)) {
    const i = 4.5;
    dot(b.x + i, b.y + i);
    dot(b.x + b.w - i, b.y + i);
    dot(b.x + i, b.y + b.h - i);
    dot(b.x + b.w - i, b.y + b.h - i);
  }
  if (!d) return null;
  return (
    <g>
      <path d={d} fill="#fffaf5" stroke="#b9a3d9" strokeWidth={0.6} />
      <path d={hl} fill="#ffffff" />
    </g>
  );
}

export const lace = sweetStyle({
  id: 'lace',
  mat: MAT,
  deep: '#6a4fae',
  shadow: '#8e6fd1',
  accent: { fill: '#ecc97f', line: '#ff9ec7' },
  tints: TINTS,
  font: "'Playfair Display', Georgia, serif",
  texture: (m) => (m === 'fabric' || m === 'leather' ? { kind: 'tuft', angle: 0, spacing: 10, sw: 1.25, color: '#ffffff', opacity: 0.95 } : null),
  rule: () => ({ stroke: '#ffffff', sw: 1.1, opacity: 0.95, inset: 3, dash: '0.1 2.6' }),
  trim: () => ({ kind: 'frill', size: 6, color: '#ffffff' }),
  decorate: pearls,
});

import type { JSX } from 'react';
import type { Pen } from '../core/pen';
import { rectSolids, sweetStyle } from './sweet';
import type { Material } from './types';

/** Cotton Candy Pier: bright candy colours, candy-cane stripes, gumdrops on the corners. */
const MAT: Record<Material, string> = {
  wood: '#ffcf8a', darkwood: '#f0a066', fabric: '#ff7eb6', leather: '#ff9a6b', linen: '#fffaf0', metal: '#7fd8ff',
  brass: '#ffe066', stone: '#fff1d6', glass: '#c9f0ff', paper: '#ffffff', leaf: '#6fdc8c', water: '#7fd8ff',
  fire: '#ff9a52', fruit: '#ffe066', rope: '#ffcf8a', ceramic: '#ffffff', soil: '#d99a72',
};
const TINTS = ['#ff5da2', '#3ec6ff', '#ffe066', '#7be07b', '#b98bff', '#ff9a52'];

function gumdrops(pen: Pen): JSX.Element | null {
  const out: JSX.Element[] = [];
  let k = 0;
  for (const b of rectSolids(pen, 24)) {
    const i = 4.5;
    for (const [x, y] of [[b.x + i, b.y + i], [b.x + b.w - i, b.y + i], [b.x + i, b.y + b.h - i], [b.x + b.w - i, b.y + b.h - i]]) {
      const c = TINTS[k % TINTS.length];
      out.push(
        <g key={k++}>
          <circle cx={x} cy={y} r={3.2} fill={c} stroke="#ffffff" strokeWidth={0.8} />
          <circle cx={x - 1} cy={y - 1} r={0.9} fill="#ffffff" fillOpacity={0.9} />
        </g>,
      );
    }
  }
  return out.length ? <g>{out}</g> : null;
}

export const candy = sweetStyle({
  id: 'candy',
  mat: MAT,
  deep: '#3a3f8f',
  shadow: '#5a7fd1',
  accent: { fill: '#ffe066', line: '#ff5da2' },
  tints: TINTS,
  font: "'Baloo 2', 'Trebuchet MS', 'Segoe UI', sans-serif",
  texture: (m, open) => {
    if (m === 'fabric' || m === 'metal' || (!open && m === 'wood')) {
      return { kind: 'lines', angle: 45, spacing: 10, sw: 3.6, color: '#ffffff', opacity: open ? 0.4 : 0.5 };
    }
    return null;
  },
  rule: () => ({ stroke: '#ffffff', sw: 1.2, opacity: 0.7, inset: 3 }),
  glint: 0.9,
  decorate: gumdrops,
});

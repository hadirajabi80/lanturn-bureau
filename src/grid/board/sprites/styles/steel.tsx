import type { JSX } from 'react';
import { mix } from '../../../../components/avatar/color';
import type { Pen } from '../core/pen';
import type { Material, StyleDef } from './types';

/** The Midnight Express — burgundy plush, mahogany, brushed steel, brass piping and rivets. */
const OUT = '#140d0b';

const MAT: Record<Material, string> = {
  fabric: '#7a1f2b', leather: '#5a2a1a', wood: '#6b3b22', darkwood: '#3e2015', metal: '#8f8a86', brass: '#c9a24f',
  stone: '#8c8580', glass: '#9fb4b8', linen: '#efe4d6', paper: '#efe6d6', ceramic: '#e8e2da', leaf: '#4f6b44',
  water: '#5c8a95', fire: '#e0823a', fruit: '#e0b84a', rope: '#a68a5c', soil: '#3b2a20',
};
const RIVETED = new Set<Material>(['metal', 'darkwood', 'wood', 'brass']);

function rivets(pen: Pen): JSX.Element | null {
  let d = '';
  const r = 1.5;
  const dot = (x: number, y: number) => {
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  };
  for (const { s, m } of pen.solids) {
    if (s.t !== 'rect' || !RIVETED.has(m) || s.w < 16 || s.h < 16) continue;
    const i = 4.2;
    const x0 = s.x + i;
    const x1 = s.x + s.w - i;
    const y0 = s.y + i;
    const y1 = s.y + s.h - i;
    dot(x0, y0);
    dot(x1, y0);
    dot(x0, y1);
    dot(x1, y1);
    if (m === 'metal') {
      const nx = Math.floor((x1 - x0) / 15);
      for (let k = 1; k < nx; k++) {
        const x = x0 + ((x1 - x0) * k) / nx;
        dot(x, y0);
        dot(x, y1);
      }
      const ny = Math.floor((y1 - y0) / 15);
      for (let k = 1; k < ny; k++) {
        const y = y0 + ((y1 - y0) * k) / ny;
        dot(x0, y);
        dot(x1, y);
      }
    }
  }
  if (!d) return null;
  return <path d={d} fill={pen.p.accent2} stroke={OUT} strokeWidth={0.5} />;
}

export const steel: StyleDef = {
  id: 'steel',
  rough: 0,
  body: (m, open) =>
    open
      ? { fill: mix(MAT[m], '#ffffff', 0.14), fillOpacity: 0.9, stroke: OUT, sw: 1.9, strokeOpacity: 0.9 }
      : { fill: MAT[m], fillOpacity: 1, stroke: OUT, sw: 2.4, strokeOpacity: 1 },
  line: (fine) => (fine ? { stroke: OUT, sw: 0.9, opacity: 0.6 } : { stroke: OUT, sw: 1.5, opacity: 0.85 }),
  accent: (p) => ({ fill: '#c9a24f', fillOpacity: 1, stroke: OUT, sw: 0.9, strokeOpacity: 1, line: p.accent2 }),
  texture: (m, open) => {
    if (m === 'metal') return { kind: 'lines', angle: 0, spacing: 2.5, sw: 0.5, color: '#ffffff', opacity: 0.18 };
    if (m === 'fabric') return { kind: 'tuft', angle: 0, spacing: 10, sw: 1.15, color: '#2a0a10', opacity: open ? 0.55 : 0.65 };
    if (!open && (m === 'wood' || m === 'darkwood')) return { kind: 'grain', angle: 0, spacing: 6, sw: 0.6, color: '#000000', opacity: 0.28 };
    return null;
  },
  shade: () => ({ kind: 'cross', angle: 45, spacing: 3, sw: 0.6, color: '#000000', opacity: 0.35 }),
  shadow: () => ({ color: '#000000', opacity: 0.38, dx: 3, dy: 4 }),
  rule: (open, p) => (open ? { stroke: p.accent2, sw: 1, opacity: 0.9, inset: 3 } : null),
  glint: () => ({ stroke: '#fff4e0', sw: 1.6, opacity: 0.35 }),
  glass: () => ({ fill: '#a9c3c8', opacity: 0.55, streak: '#ffffff', streakOpacity: 0.75 }),
  glow: () => null,
  barInner: () => '#2a201c',
  tints: () => ['#7a1f2b', '#2f4a3a', '#c9a24f', '#3a3a5a', '#6b3b22', '#8a6a4a'],
  font: "'JetBrains Mono', ui-monospace, monospace",
  text: (p) => p.accent2,
  decorate: rivets,
};

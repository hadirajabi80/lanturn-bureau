import { mix } from '../../../../components/avatar/color';
import type { Material, StyleDef } from './types';

/** Harrow Point Docks — weathered planks, galvanised iron, brass fittings and stitched sailcloth. */
const OUT = '#2a1d12';
const BRASS = '#c39a45';

const MAT: Record<Material, string> = {
  wood: '#8d7255', darkwood: '#5c4632', fabric: '#c8b892', leather: '#7d5233', linen: '#e6dfcc', metal: '#6f7b7d',
  brass: BRASS, stone: '#a3a69c', glass: '#a9cfcb', paper: '#efe7d0', leaf: '#5e7d4c', water: '#4d8b93',
  fire: '#e07b39', fruit: '#e2c044', rope: '#c9ab72', ceramic: '#d3c8b0', soil: '#5a4532',
};

export const rope: StyleDef = {
  id: 'rope',
  rough: 0.25,
  body: (m, open) =>
    open
      ? { fill: mix(MAT[m], '#f5eedc', 0.45), fillOpacity: 0.86, stroke: OUT, sw: 2.1, strokeOpacity: 0.9 }
      : { fill: MAT[m], fillOpacity: 1, stroke: OUT, sw: 2.9, strokeOpacity: 1 },
  line: (fine) => (fine ? { stroke: OUT, sw: 1.05, opacity: 0.6 } : { stroke: OUT, sw: 1.8, opacity: 0.85 }),
  accent: () => ({ fill: BRASS, fillOpacity: 1, stroke: OUT, sw: 1.3, strokeOpacity: 1, line: '#b08a3c' }),
  texture: (m, open) => {
    if (open) return null;
    if (m === 'wood' || m === 'darkwood') return { kind: 'grain', angle: 0, spacing: 6.5, sw: 0.85, color: OUT, opacity: 0.38 };
    if (m === 'rope') return { kind: 'lines', angle: 60, spacing: 3.4, sw: 0.8, color: OUT, opacity: 0.4 };
    if (m === 'metal') return { kind: 'veins', angle: 20, spacing: 14, sw: 1.6, color: '#8a5a32', opacity: 0.35, gaps: 0.4 }; // rust streaks
    return null;
  },
  shade: () => ({ kind: 'cross', angle: 45, spacing: 3.4, sw: 0.9, color: OUT, opacity: 0.38 }),
  shadow: () => ({ color: '#06161a', opacity: 0.3, dx: 4, dy: 5 }),
  rule: (open) => (open ? { stroke: OUT, sw: 0.9, opacity: 0.55, inset: 4, dash: '3 2.6' } : null),
  glint: () => ({ stroke: '#fff6dc', sw: 1.5, opacity: 0.3 }),
  glass: () => ({ fill: '#bfe0dc', opacity: 0.55, streak: '#ffffff', streakOpacity: 0.7 }),
  glow: () => null,
  barInner: () => '#d9cdb0',
  tints: () => ['#8a3a2a', '#2f5a6a', '#6a7a3a', '#a8823a', '#4a4a5a', '#7a5a3a'],
  font: "'JetBrains Mono', ui-monospace, monospace",
  text: () => OUT,
};

import type { Material, StyleDef } from './types';

/** Hollowmere Academy — rough chalk outlines on board-green, partial pastel scribble fills. */
const PASTEL: Record<Material, string> = {
  wood: '#e8c27a', darkwood: '#c99a6a', fabric: '#f08c8c', leather: '#e0946e', linen: '#ffffff', metal: '#a8c4d4',
  brass: '#E8C25B', stone: '#d8d8d0', glass: '#8fd0f0', paper: '#ffffff', leaf: '#9fe07a', water: '#7cc4ec',
  fire: '#f59a4a', fruit: '#f5d94a', rope: '#e8c27a', ceramic: '#ffffff', soil: '#c9a88a',
};

export const chalk: StyleDef = {
  id: 'chalk',
  rough: 1.5,
  pass2: { swK: 0.6, opacity: 0.55, dash: '14 4 22 3' },
  body: (m, open, p) =>
    open
      ? { fill: PASTEL[m], fillOpacity: 0.06, stroke: p.wall, sw: 1.8, strokeOpacity: 0.72 }
      : { fill: PASTEL[m], fillOpacity: 0.26, stroke: p.wall, sw: 2.4, strokeOpacity: 0.92 },
  line: (fine, p) => (fine ? { stroke: p.wall, sw: 1.05, opacity: 0.58 } : { stroke: p.wall, sw: 1.6, opacity: 0.8 }),
  accent: (p) => ({ fill: p.accent, fillOpacity: 0.32, stroke: p.accent, sw: 1.5, strokeOpacity: 0.95, line: p.accent }),
  texture: (m, open) =>
    open
      ? { kind: 'scribble', angle: 62, spacing: 8, sw: 1.1, color: PASTEL[m], opacity: 0.17, gaps: 0.45 }
      : { kind: 'scribble', angle: 62, spacing: 4.2, sw: 1.6, color: PASTEL[m], opacity: 0.42, gaps: 0.22 },
  shade: (p) => ({ kind: 'lines', angle: -30, spacing: 3.2, sw: 1.1, color: p.wall, opacity: 0.35, gaps: 0.15 }),
  shadow: () => null,
  rule: () => null,
  glint: () => null,
  glass: (p) => ({ fill: '#bfe3f2', opacity: 0.12, streak: p.wall, streakOpacity: 0.6 }),
  glow: () => null,
  barInner: (p) => p.rooms[0] ?? '#2e4a3b',
  tints: (p) => ['#f2b5b0', '#a8d8f0', p.accent, p.accent2, '#d9b8f0', '#f5a35b'],
  font: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive",
  text: (p) => p.wall,
};

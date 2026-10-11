import { mix } from '../../../../components/avatar/color';
import type { Material, StyleDef } from './types';

/** Museum of Curiosities — white stone with veins, brass fittings, soft gallery shadows, vitrine glass. */
const OUT = '#7a7368';
const BRASS = '#b8955a';

const MAT: Record<Material, string> = {
  stone: '#f2f0eb', wood: '#c4a582', darkwood: '#7a5c43', fabric: '#8e2f37', leather: '#7a4b2f', linen: '#f7f4ee',
  metal: '#a3a8ae', brass: BRASS, glass: '#d4e5ea', paper: '#faf7f0', leaf: '#6b8d58', water: '#9cc6d4',
  fire: '#e08a4a', fruit: '#e6c35a', rope: '#b8a074', ceramic: '#f8f7f3', soil: '#6b5a48',
};

export const marble: StyleDef = {
  id: 'marble',
  rough: 0,
  body: (m, open) =>
    open
      ? { fill: mix(MAT[m], '#ffffff', 0.22), fillOpacity: 0.66, stroke: OUT, sw: 1.8, strokeOpacity: 0.9 }
      : { fill: MAT[m], fillOpacity: 1, stroke: OUT, sw: 2.1, strokeOpacity: 1 },
  line: (fine) => (fine ? { stroke: OUT, sw: 0.9, opacity: 0.7 } : { stroke: OUT, sw: 1.5, opacity: 0.9 }),
  accent: () => ({ fill: BRASS, fillOpacity: 1, stroke: '#6e5426', sw: 0.9, strokeOpacity: 1, line: BRASS }),
  texture: (m, open) => {
    if (open) return null;
    if (m === 'stone' || m === 'ceramic') return { kind: 'veins', angle: 30, spacing: 18, sw: 0.7, color: '#9a948a', opacity: 0.6, gaps: 0.25 };
    return null;
  },
  shade: () => ({ kind: 'lines', angle: 45, spacing: 3, sw: 0.6, color: OUT, opacity: 0.35 }),
  shadow: () => ({ color: '#3d3a44', opacity: 0.14, dx: 3, dy: 4, soft: true }),
  rule: (open) => (open ? null : { stroke: '#ffffff', sw: 1.3, opacity: 0.75, inset: 2.6 }),
  glint: () => ({ stroke: '#ffffff', sw: 2, opacity: 0.8 }),
  glass: () => ({ fill: '#cfe4ec', opacity: 0.55, streak: '#ffffff', streakOpacity: 0.95 }),
  glow: () => null,
  barInner: () => '#ece9e2',
  tints: () => ['#8e2f37', '#3a5a7a', '#6b8d58', BRASS, '#5a4a6a', '#a0703a'],
  font: "'Playfair Display', Georgia, serif",
  text: () => '#5a544a',
};

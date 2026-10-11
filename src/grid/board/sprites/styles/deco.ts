import type { Material, StyleDef } from './types';

/** The Gilded Meridian — black lacquer, gold double rules, emerald velvet, glossy sheen. */
const LACQ = '#0e0d11';

const MAT: Record<Material, string> = {
  wood: '#1a1418', darkwood: LACQ, fabric: '#1f5a4c', leather: '#4a1c26', linen: '#efe6d0', metal: '#26262c',
  brass: '#D4AF37', stone: '#2b2a2f', glass: '#1d2a33', paper: '#efe6cf', leaf: '#24563c', water: '#1c4a5c',
  fire: '#f0a040', fruit: '#e8c24a', rope: '#b8962e', ceramic: '#f1ece0', soil: '#1c1612',
};

export const deco: StyleDef = {
  id: 'deco',
  rough: 0,
  body: (m, open, p) =>
    open
      ? { fill: MAT[m], fillOpacity: 0.62, stroke: p.accent, sw: 1.5, strokeOpacity: 0.95 }
      : { fill: MAT[m], fillOpacity: 1, stroke: p.accent, sw: 2, strokeOpacity: 1 },
  line: (fine, p) => (fine ? { stroke: p.accent, sw: 0.75, opacity: 0.7 } : { stroke: p.accent, sw: 1.3, opacity: 0.95 }),
  accent: (p) => ({ fill: p.accent, fillOpacity: 1, stroke: '#6e5517', sw: 0.8, strokeOpacity: 1, line: p.accent2 }),
  texture: (m, open, p) => {
    if (open) return null;
    if (m === 'fabric' || m === 'leather') return { kind: 'lines', angle: 90, spacing: 6, sw: 0.55, color: p.accent, opacity: 0.22 };
    if (m === 'stone') return { kind: 'veins', angle: 35, spacing: 20, sw: 0.6, color: p.accent, opacity: 0.45, gaps: 0.3 };
    return null;
  },
  shade: (p) => ({ kind: 'lines', angle: 90, spacing: 2.8, sw: 0.65, color: p.accent, opacity: 0.4 }),
  shadow: () => ({ color: '#000000', opacity: 0.5, dx: 3, dy: 5 }),
  rule: (open, p) =>
    open
      ? { stroke: p.accent2, sw: 0.6, opacity: 0.55, inset: 3.4, dash: '1 3' }
      : { stroke: p.accent, sw: 0.7, opacity: 0.85, inset: 3.4 },
  glint: () => ({ stroke: '#ffffff', sw: 2.4, opacity: 0.24 }),
  glass: () => ({ fill: '#2a3a46', opacity: 0.8, streak: '#ffffff', streakOpacity: 0.35 }),
  glow: () => null,
  barInner: () => LACQ,
  tints: (p) => [p.accent, '#7a2234', '#1f5a4c', '#24305a', p.accent2, '#4a2050'],
  font: "'Playfair Display', Georgia, serif",
  text: (p) => p.accent,
};

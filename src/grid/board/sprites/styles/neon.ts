import type { SkinPalette } from '../../../skins/types';
import type { Material, StyleDef } from './types';

/** The Neon Quarter — dark silhouettes with glowing tube rims (accent / accent2) and scanlines. */
const MAT: Record<Material, string> = {
  wood: '#1a1220', darkwood: '#110c18', fabric: '#1d1030', leather: '#1a0f20', linen: '#1b1830', metal: '#161a26',
  brass: '#241c0c', stone: '#17141f', glass: '#0f1e2a', paper: '#1b1830', leaf: '#0f2418', water: '#0c2230',
  fire: '#2a1408', fruit: '#2a2408', rope: '#1f1810', ceramic: '#1a1a2c', soil: '#120c0c',
};
const LIME = '#7CFF6B';
const AMBER = '#FFD23F';

function rim(m: Material, p: SkinPalette): string {
  if (m === 'leaf') return LIME;
  if (m === 'fire' || m === 'fruit' || m === 'brass') return AMBER;
  if (m === 'glass' || m === 'water' || m === 'metal' || m === 'ceramic') return p.accent2;
  return p.accent;
}

export const neon: StyleDef = {
  id: 'neon',
  rough: 0,
  body: (m, open, p) =>
    open
      ? { fill: '#0a0714', fillOpacity: 0.42, stroke: p.accent2, sw: 1.6, strokeOpacity: 1 }
      : { fill: MAT[m], fillOpacity: 0.95, stroke: rim(m, p), sw: 1.9, strokeOpacity: 1 },
  line: (fine, p) => (fine ? { stroke: '#d9d0ff', sw: 0.75, opacity: 0.45 } : { stroke: p.accent, sw: 1.2, opacity: 0.85 }),
  accent: (p) => ({ fill: p.accent2, fillOpacity: 0.85, stroke: p.accent2, sw: 1, strokeOpacity: 1, line: p.accent2 }),
  texture: (_m, open, p) => (open ? null : { kind: 'lines', angle: 0, spacing: 3.6, sw: 0.5, color: p.accent, opacity: 0.12 }),
  shade: (p) => ({ kind: 'lines', angle: 0, spacing: 2.4, sw: 0.6, color: p.accent, opacity: 0.28 }),
  shadow: () => ({ color: '#000000', opacity: 0.45, dx: 2, dy: 3 }),
  rule: (open, p) => (open ? null : { stroke: p.accent, sw: 0.55, opacity: 0.35, inset: 3 }),
  glint: () => ({ stroke: '#ffffff', sw: 1.3, opacity: 0.55 }),
  glass: (p) => ({ fill: '#13324a', opacity: 0.7, streak: p.accent2, streakOpacity: 0.6 }),
  glow: (m, open, p) => (open ? { stroke: p.accent2, sw: 6, opacity: 0.38 } : { stroke: rim(m, p), sw: 7, opacity: 0.42 }),
  barInner: () => '#0b0816',
  tints: (p) => ['#3a1030', '#0f3a3a', '#2a1a4a', '#3a2a08', p.accent, p.accent2],
  font: "'JetBrains Mono', ui-monospace, monospace",
  text: (p) => p.accent2,
};

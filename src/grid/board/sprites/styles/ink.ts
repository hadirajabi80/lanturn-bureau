import { mix } from '../../../../components/avatar/color';
import type { Hatch, Material, StyleDef } from './types';

/** Ashcombe Manor — sepia pen-and-ink on parchment: washes, cross-hatching, a wobbly double pass. */
const SEPIA = '#3a2716';
const PAPER = '#f3e8cf';

const MAT: Record<Material, string> = {
  wood: '#8b5a2b', darkwood: '#4a2c17', fabric: '#8c3b2e', leather: '#6b3a1f', linen: '#d8c8a8', metal: '#5d5a55',
  brass: '#a87b2c', stone: '#9b8f7d', glass: '#8fa9a6', paper: '#f6eedb', leaf: '#4f6b33', water: '#5f7f87',
  fire: '#c0602a', fruit: '#c9a22b', rope: '#9a7a48', ceramic: '#b5a58a', soil: '#5b4330',
};
const DARK = new Set<Material>(['darkwood', 'metal', 'leather', 'soil']);
const MID = new Set<Material>(['wood', 'fabric', 'stone', 'brass', 'water', 'leaf', 'rope']);

const hatch = (spacing: number, opacity: number, kind: Hatch['kind'] = 'lines', angle = 45): Hatch => ({
  kind, angle, spacing, sw: 0.7, color: SEPIA, opacity,
});

export const ink: StyleDef = {
  id: 'ink',
  rough: 0.85,
  pass2: { swK: 0.42, opacity: 0.7 },
  body: (m, open) => ({
    fill: mix(PAPER, MAT[m], open ? 0.16 : 0.42),
    fillOpacity: open ? 0.62 : 0.97,
    stroke: SEPIA,
    sw: open ? 2 : 2.8,
    strokeOpacity: open ? 0.85 : 1,
  }),
  line: (fine) => ({ stroke: SEPIA, sw: fine ? 1 : 1.7, opacity: fine ? 0.72 : 0.95 }),
  accent: () => ({ fill: mix(PAPER, '#a87b2c', 0.55), fillOpacity: 1, stroke: SEPIA, sw: 1.5, strokeOpacity: 1, line: SEPIA }),
  texture: (m, open) => {
    if (open) return m === 'fabric' || m === 'linen' ? { ...hatch(9, 0.18), angle: -40 } : null;
    if (DARK.has(m)) return hatch(5, 0.5, 'cross');
    if (MID.has(m)) return hatch(6.5, 0.36);
    return null;
  },
  shade: () => hatch(3.8, 0.7, 'cross'),
  shadow: () => ({ color: SEPIA, opacity: 0.6, dx: 4, dy: 5, hatch: hatch(3.4, 0.62, 'lines', -45) }),
  rule: () => null,
  glint: () => null,
  glass: () => ({ fill: '#c9d3c9', opacity: 0.35, streak: SEPIA, streakOpacity: 0.45 }),
  glow: () => null,
  barInner: () => PAPER,
  tints: () => ['#b98a6e', '#9aa27f', '#c4a473', '#8f9aa6', '#a88aa0', '#cfb07a'],
  font: "'Playfair Display', Georgia, serif",
  text: () => SEPIA,
};

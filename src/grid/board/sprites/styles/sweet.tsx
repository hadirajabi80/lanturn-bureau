import type { JSX } from 'react';
import { mix } from '../../../../components/avatar/color';
import type { SkinPalette } from '../../../skins/types';
import { heart, shapeBox, toD, type Box } from '../core/geom';
import type { Pen } from '../core/pen';
import type { Hatch, LineLook, Material, StyleDef } from './types';

/**
 * Shared base for the light, "sweet" districts (ribbon / lace / candy):
 * pastel fills, outlines in a deeper shade of each fill (never black), soft tinted shadows,
 * glossy highlights. Each style file supplies its palette and personality.
 */
export interface SweetSpec {
  id: StyleDef['id'];
  mat: Record<Material, string>;
  /** hue the outlines are deepened towards. */
  deep: string;
  shadow: string;
  accent: { fill: string; line: string };
  tints: string[];
  font: string;
  texture: (m: Material, open: boolean, p: SkinPalette) => Hatch | null;
  rule: StyleDef['rule'];
  trim?: StyleDef['trim'];
  glint?: number;
  decorate?: (pen: Pen) => JSX.Element | null;
}

export function sweetStyle(s: SweetSpec): StyleDef {
  const edge = (fill: string) => mix(fill, s.deep, 0.62);
  return {
    id: s.id,
    rough: 0,
    body: (m, open) => {
      const f = s.mat[m];
      return open
        ? { fill: mix(f, '#ffffff', 0.35), fillOpacity: 0.86, stroke: edge(f), sw: 2.3, strokeOpacity: 1 }
        : { fill: f, fillOpacity: 1, stroke: edge(f), sw: 2.5, strokeOpacity: 1 };
    },
    edge,
    line: (fine) => (fine ? { stroke: s.deep, sw: 0.85, opacity: 0.4 } : { stroke: s.deep, sw: 1.3, opacity: 0.6 }),
    accent: () => ({ fill: s.accent.fill, fillOpacity: 1, stroke: edge(s.accent.fill), sw: 0.9, strokeOpacity: 1, line: s.accent.line }),
    texture: s.texture,
    shade: () => ({ kind: 'lines', angle: 45, spacing: 3.4, sw: 0.8, color: s.deep, opacity: 0.22 }),
    shadow: () => ({ color: s.shadow, opacity: 0.2, dx: 3, dy: 4, soft: true }),
    rule: s.rule,
    trim: s.trim,
    glint: (): LineLook => ({ stroke: '#ffffff', sw: 2.2, opacity: s.glint ?? 0.75 }),
    glass: () => ({ fill: '#e6f6ff', opacity: 0.6, streak: '#ffffff', streakOpacity: 0.95 }),
    glow: () => null,
    barInner: () => '#ffffff',
    tints: () => s.tints,
    font: s.font,
    text: () => s.deep,
    decorate: s.decorate,
  };
}

/** Bounding boxes of the main rectangular solids (for corner ornaments). */
export function rectSolids(pen: Pen, min = 18): Box[] {
  return pen.solids.filter(({ s }) => s.t === 'rect').map(({ s }) => shapeBox(s)).filter((b) => b.w >= min && b.h >= min);
}

/** Largest main solid (any shape). */
export function biggestSolid(pen: Pen): Box | null {
  let best: Box | null = null;
  for (const { s } of pen.solids) {
    const b = shapeBox(s);
    if (!best || b.w * b.h > best.w * best.h) best = b;
  }
  return best;
}

/** A tiny glossy heart (drawn in final coordinates). */
export function heartEl(x: number, y: number, size: number, fill: string, key?: string): JSX.Element {
  return (
    <g key={key}>
      <path d={toD(heart(x, y, size))} fill={fill} stroke={mix(fill, '#7a2048', 0.45)} strokeWidth={0.7} />
      <circle cx={x - size * 0.18} cy={y - size * 0.12} r={size * 0.1} fill="#ffffff" fillOpacity={0.85} />
    </g>
  );
}

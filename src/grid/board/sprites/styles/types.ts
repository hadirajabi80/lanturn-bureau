import type { JSX } from 'react';
import type { SkinPalette, WallStyle } from '../../../skins/types';
import type { Pen } from '../core/pen';

/** What a part of a piece is made of. Each style maps materials to its own colours & textures. */
export type Material =
  | 'wood' | 'darkwood' | 'fabric' | 'leather' | 'linen' | 'metal' | 'brass' | 'stone' | 'glass'
  | 'paper' | 'leaf' | 'water' | 'fire' | 'fruit' | 'rope' | 'ceramic' | 'soil';

export interface Look {
  fill: string;
  fillOpacity: number;
  stroke: string;
  sw: number;
  strokeOpacity: number;
}

export interface AccentLook extends Look {
  /** colour for open trim lines (handles, hoops, straps). */
  line: string;
}

export type HatchKind = 'lines' | 'cross' | 'grain' | 'tuft' | 'veins' | 'scribble' | 'sprinkles';

export interface Hatch {
  kind: HatchKind;
  angle: number;
  spacing: number;
  sw: number;
  color: string;
  opacity: number;
  /** several colours cycled per stroke (sprinkles). */
  colors?: string[];
  /** fraction of strokes randomly dropped (chalk: partial fills). */
  gaps?: number;
}

export interface LineLook {
  stroke: string;
  sw: number;
  opacity: number;
}

/**
 * A rendering style for furniture, one per WallStyle. Pure data + a few hooks:
 * the Pen (core/pen.tsx) does the drawing, kinds (kinds/*) only describe geometry.
 */
export interface StyleDef {
  id: WallStyle;
  /** outline wobble amplitude in cell units (0 = crisp). */
  rough: number;
  /** second, looser outline pass (hand-drawn styles). */
  pass2?: { swK: number; opacity: number; dash?: string };
  /** body of a part. `open` = occupiable piece (lighter, airier). */
  body(m: Material, open: boolean, p: SkinPalette): Look;
  /** plain detail line. */
  line(fine: boolean, p: SkinPalette): LineLook;
  /** trim / fittings (brass, gold, neon second colour…). */
  accent(p: SkinPalette): AccentLook;
  /** automatic surface texture of main bodies. */
  texture(m: Material, open: boolean, p: SkinPalette): Hatch | null;
  /** explicit shading inside a piece (sides, recesses). */
  shade(p: SkinPalette): Hatch;
  /** cast shadow of blocking pieces. */
  shadow(p: SkinPalette): { color: string; opacity: number; dx: number; dy: number; hatch?: Hatch; soft?: boolean } | null;
  /** inner second rule on main bodies (deco double rule, stitched sailcloth, brass piping…). */
  rule(open: boolean, p: SkinPalette): { stroke: string; sw: number; opacity: number; inset: number; dash?: string } | null;
  /**
   * Edge treatment of main bodies: 'scallop' turns the outline itself into scallops (patisserie),
   * 'frill' draws a white lace frill peeking out under the body (boutique).
   */
  trim?(open: boolean, p: SkinPalette): { kind: 'scallop' | 'frill'; size: number; color: string } | null;
  /** outline colour for a part whose fill was overridden (light styles: a darker shade of that fill). */
  edge?(fill: string): string;
  /** glossy highlight. */
  glint(p: SkinPalette): LineLook | null;
  glass(p: SkinPalette): { fill: string; opacity: number; streak: string; streakOpacity: number };
  /** bloom rim drawn in the glow layer (neon). */
  glow(m: Material, open: boolean, p: SkinPalette): LineLook | null;
  /** opaque colour under thick bars (anchor shank, rails) so outlines read. */
  barInner(p: SkinPalette): string;
  /** varied colours (book spines, fruit, paint dabs). */
  tints(p: SkinPalette): string[];
  font: string;
  text(p: SkinPalette): string;
  /** style overlay drawn above the piece (blueprint dimensions, steel rivets). */
  decorate?(pen: Pen): JSX.Element | null;
}

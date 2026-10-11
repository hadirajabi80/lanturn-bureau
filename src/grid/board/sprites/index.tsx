/**
 * Furniture sprites - top-down architectural-plan furniture, restyled per district.
 *
 *   FurnitureSprite({ piece, cellSize, skin?, glowFilterId? })   positioned on the board grid
 *   SPRITES[kind]({ w, h, style, palette, seed?, glowId? })      raw drawing in a w x h box (100 = one cell)
 *   furnitureTitle(kind)                                          "Armchair", "Bananas"...
 *   SpriteGallery                                                 dev: every kind x every style
 *
 * Layout: core/ (geometry + Pen), styles/ (one StyleDef per WallStyle), kinds/ (one file per family).
 */
import { memo, type JSX } from 'react';
import { FURNITURE_LABEL, type Furniture, type FurnitureKind } from '../../types';
import { hash } from './core/geom';
import { KINDS, KIND_ORDER } from './kinds';
import { drawSprite, skinFor, type SpriteProps } from './render';

export { INK } from './common';
export { STYLE_DEFS, WALL_STYLES } from './styles';
export type { Material, StyleDef } from './styles';
export { KINDS, KIND_ORDER } from './kinds';
export { drawSprite, skinFor } from './render';
export type { SpriteProps } from './render';
export { SpriteGallery } from './SpriteGallery';

/** One drawing function per kind (style-aware). */
export const SPRITES = Object.fromEntries(
  KIND_ORDER.map((k) => [k, (p: SpriteProps): JSX.Element => drawSprite(k, p)]),
) as Record<FurnitureKind, (p: SpriteProps) => JSX.Element>;

/** Display name of a kind ("Armchair", "Bananas"). */
export function furnitureTitle(kind: FurnitureKind): string {
  const a = FURNITURE_LABEL[kind]?.a ?? kind;
  const noun = a.replace(/^(an?|some)\s+/i, '');
  return noun.charAt(0).toUpperCase() + noun.slice(1);
}

export interface FurnitureSpriteProps {
  piece: Furniture;
  /** Size of one grid cell in the parent SVG's user units (the Board uses 100). */
  cellSize: number;
  /** District id (e.g. 'neon'); a bare WallStyle also works. Default: Ashcombe (ink). */
  skin?: string;
  /** Optional SVG filter id (soft blur) for the neon bloom layer; only the 'neon' style emits glow. */
  glowFilterId?: string;
}

/**
 * Draws a furniture piece positioned on the grid. Must be rendered inside an `<svg>`
 * whose user space has cells of `cellSize` units starting at (0,0).
 */
function FurnitureSpriteImpl({ piece, cellSize, skin, glowFilterId }: FurnitureSpriteProps): JSX.Element | null {
  if (!KINDS[piece.kind] || piece.cells.length === 0) return null;
  let minR = Infinity;
  let minC = Infinity;
  let maxR = -Infinity;
  let maxC = -Infinity;
  for (const cell of piece.cells) {
    minR = Math.min(minR, cell.r);
    minC = Math.min(minC, cell.c);
    maxR = Math.max(maxR, cell.r);
    maxC = Math.max(maxC, cell.c);
  }
  let w = (maxC - minC + 1) * 100;
  let h = (maxR - minR + 1) * 100;
  if (piece.cells.length === 2 && piece.orient) {
    w = piece.orient === 'h' ? 200 : 100;
    h = piece.orient === 'v' ? 200 : 100;
  }
  const { style, palette } = skinFor(skin);
  const s = cellSize / 100;
  return (
    <g transform={`translate(${minC * cellSize} ${minR * cellSize}) scale(${s})`} pointerEvents="none">
      {drawSprite(piece.kind, { w, h, style, palette, seed: hash(piece.id), glowId: glowFilterId })}
    </g>
  );
}

export const FurnitureSprite = memo(FurnitureSpriteImpl);

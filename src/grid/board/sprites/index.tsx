import { memo, type ComponentType, type JSX } from 'react';
import type { Furniture, FurnitureKind } from '../../types';
import type { SpriteProps } from './common';
import { Anchor, Bananas, Barrel, Bin, Coffin, Crate, Easel, Globe, Lamp, Plant, Safe, Statue, Suitcase, Trolley } from './props';
import { Armchair, Bathtub, Bed, Bench, Chair, Rug, Sofa, Stool } from './seating';
import { Bookshelf, Cabinet, Counter, Desk, Fireplace, Fridge, Piano, Table } from './tables';

export type { SpriteProps } from './common';
export { INK } from './common';

interface SpriteDef {
  C: ComponentType<SpriteProps>;
  /** true: one drawing stretched over the whole multi-cell footprint; false: one copy per cell. */
  stretch: boolean;
}

/** One sprite component per FurnitureKind. */
export const SPRITES: Record<FurnitureKind, SpriteDef> = {
  chair: { C: Chair, stretch: false },
  armchair: { C: Armchair, stretch: false },
  sofa: { C: Sofa, stretch: true },
  rug: { C: Rug, stretch: true },
  bed: { C: Bed, stretch: true },
  stool: { C: Stool, stretch: false },
  bench: { C: Bench, stretch: true },
  table: { C: Table, stretch: true },
  desk: { C: Desk, stretch: true },
  crate: { C: Crate, stretch: false },
  barrel: { C: Barrel, stretch: false },
  bin: { C: Bin, stretch: false },
  plant: { C: Plant, stretch: false },
  bananas: { C: Bananas, stretch: false },
  piano: { C: Piano, stretch: true },
  bookshelf: { C: Bookshelf, stretch: true },
  fireplace: { C: Fireplace, stretch: true },
  bathtub: { C: Bathtub, stretch: true },
  lamp: { C: Lamp, stretch: false },
  safe: { C: Safe, stretch: false },
  statue: { C: Statue, stretch: false },
  cabinet: { C: Cabinet, stretch: true },
  fridge: { C: Fridge, stretch: true },
  counter: { C: Counter, stretch: true },
  trolley: { C: Trolley, stretch: false },
  suitcase: { C: Suitcase, stretch: false },
  anchor: { C: Anchor, stretch: false },
  globe: { C: Globe, stretch: false },
  easel: { C: Easel, stretch: false },
  coffin: { C: Coffin, stretch: true },
};

export interface FurnitureSpriteProps {
  piece: Furniture;
  /** Size of one grid cell in the parent SVG's user units (the Board uses 100). */
  cellSize: number;
}

/**
 * Draws a furniture piece positioned on the grid. Must be rendered inside an `<svg>`
 * whose user space has cells of `cellSize` units starting at (0,0).
 */
function FurnitureSpriteImpl({ piece, cellSize }: FurnitureSpriteProps): JSX.Element | null {
  const def = SPRITES[piece.kind];
  if (!def || piece.cells.length === 0) return null;
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
  // Respect an explicit orientation for 2-cell pieces even if cells were listed oddly.
  if (piece.cells.length === 2 && piece.orient) {
    w = piece.orient === 'h' ? 200 : 100;
    h = piece.orient === 'v' ? 200 : 100;
  }
  const s = cellSize / 100;
  const { C } = def;
  return (
    <g transform={`translate(${minC * cellSize} ${minR * cellSize}) scale(${s})`} pointerEvents="none">
      {def.stretch || piece.cells.length === 1 ? (
        <C w={w} h={h} />
      ) : (
        piece.cells.map((cell) => (
          <g key={`${cell.r},${cell.c}`} transform={`translate(${(cell.c - minC) * 100} ${(cell.r - minR) * 100})`}>
            <C w={100} h={100} />
          </g>
        ))
      )}
    </g>
  );
}

export const FurnitureSprite = memo(FurnitureSpriteImpl);

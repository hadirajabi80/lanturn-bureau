import type { JSX } from 'react';
import type { Pen } from '../core/pen';

/**
 * Draws one piece in three-quarter view inside its w x h frame (100 units per cell):
 * 100 x 100 for one cell, 200 x 100 for a horizontal 2-cell piece, 100 x 200 for a
 * vertical one. Pieces stand on the floor at the bottom of the frame, seen from the front.
 */
export type Draw = (pen: Pen, w: number, h: number) => JSX.Element;

export interface KindDef {
  draw: Draw;
  /** true: one drawing over the whole footprint; false: one copy per cell. */
  stretch: boolean;
}

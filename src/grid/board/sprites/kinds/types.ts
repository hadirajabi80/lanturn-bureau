import type { JSX } from 'react';
import type { Pen } from '../core/pen';

/**
 * Draws one piece seen from above in a horizontal L x 100 frame (L = 100 for one cell,
 * 200 for a 2-cell piece). Vertical footprints are rotated by the Pen, so draws never
 * need to care about orientation.
 */
export type Draw = (pen: Pen, L: number) => JSX.Element;

export interface KindDef {
  draw: Draw;
  /** true: one drawing over the whole footprint; false: one copy per cell. */
  stretch: boolean;
}

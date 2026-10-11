// Board geometry (1 unit ≈ one checker diameter) and mapping from game locations to 3D positions.
import { BAR, OFF, type Player } from '../engine/rules';

export const R = 0.5; // checker radius
export const CH = 0.26; // checker height
export const PW = 1.08; // point width
export const HW = PW * 6; // half (one quadrant row) width
export const BAR_W = 1.36;
export const HALF_D = 5.8; // half depth of playing field (z extent)
export const POINT_LEN = 4.85;
export const RIM_H = 0.55; // frame height above the field
export const FRAME_W = 0.8;
export const TRAY_GAP = 0.36; // wood between right field and tray
export const TRAY_W = 1.36;
export const TRAY_FLOOR = 0.1;
export const DIE = 0.62;

export const FIELD_L = -BAR_W / 2 - HW; // left edge of playing field
export const FIELD_R = BAR_W / 2 + HW; // right edge of playing field
export const TRAY_L = FIELD_R + TRAY_GAP;
export const TRAY_R = TRAY_L + TRAY_W;
export const OUTER_L = FIELD_L - FRAME_W;
export const OUTER_R = TRAY_R + FRAME_W;
export const OUTER_D = HALF_D + FRAME_W;
export const BOARD_CX = (OUTER_L + OUTER_R) / 2;

/** x of a point's centerline (absolute index 0..23). */
export function pointX(i: number): number {
  if (i < 6) return FIELD_R - (i + 0.5) * PW;
  if (i < 12) return -BAR_W / 2 - (i - 6 + 0.5) * PW;
  if (i < 18) return FIELD_L + (i - 12 + 0.5) * PW;
  return BAR_W / 2 + (i - 18 + 0.5) * PW;
}

/** +1 for bottom row (indices 0..11, near White), -1 for top row. */
export const pointSide = (i: number) => (i < 12 ? 1 : -1);

export type Vec3 = [number, number, number];

/** Resting transform of a checker. Returns position and whether it stands on edge (in the tray). */
export function checkerRest(owner: Player, loc: number, slot: number): { pos: Vec3; onEdge: boolean } {
  if (loc === BAR) {
    // White on the bar's near half, Black on the far half, stacking away from the center.
    const dir = owner === 0 ? 1 : -1;
    const layer = Math.floor(slot / 4);
    const k = slot % 4;
    return { pos: [0, RIM_H + CH / 2 + layer * CH, dir * (1.05 + k * 2 * R)], onEdge: false };
  }
  if (loc === OFF) {
    const dir = owner === 0 ? 1 : -1;
    const x = (TRAY_L + TRAY_R) / 2;
    const z = dir * (HALF_D - 0.25 - slot * (CH + 0.012));
    return { pos: [x, TRAY_FLOOR + R, z], onEdge: true };
  }
  const side = pointSide(loc);
  const layer = Math.floor(slot / 5);
  const k = slot % 5;
  const z = side * (HALF_D - R - 0.04 - (k + layer * 0.5) * 2 * R);
  return { pos: [pointX(loc), CH / 2 + layer * CH, z], onEdge: false };
}

/** Where a new checker would land at a location (for destination markers). */
export const landingSpot = (owner: Player, loc: number, count: number) => checkerRest(owner, loc, count).pos;

/** Dice rest area per throwing side: White throws to the right half, Black to the left half (each player's right). */
export function diceHalf(side: Player) {
  const xMin = side === 0 ? BAR_W / 2 : FIELD_L;
  const xMax = side === 0 ? FIELD_R : -BAR_W / 2;
  return { xMin, xMax, cx: (xMin + xMax) / 2 };
}

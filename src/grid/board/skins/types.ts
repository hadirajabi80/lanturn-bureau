import type { CSSProperties, ReactNode } from 'react';
import type { District, SkinPalette, WallStyle } from '../../skins/types';
import type { Puzzle, Room } from '../../types';
import type { WallGeo } from './geom';

/** Extra sheet around the grid (user units; one cell = 100). Frames, rulers, title blocks live here. */
export interface Margins {
  t: number;
  r: number;
  b: number;
  l: number;
}

/** Where a room's name plate goes: centred on `x`, bottom edge at `y`, at most `maxW` wide. */
export interface LabelSpot {
  room: Room;
  index: number;
  name: string;
  x: number;
  y: number;
  maxW: number;
}

/**
 * Everything a skin needs to draw one board. Built once per board render by `Board`
 * (cheap: geometry is memoised). Every length is in board user units (1 cell = `U` = 100).
 */
export interface SkinCtx {
  /** Unique, CSS-safe prefix for this board's <defs> ids. */
  uid: string;
  /** `${uid}-${name}` — use for every id a skin defines. */
  id: (name: string) => string;
  /** `url(#${uid}-${name})`. */
  url: (name: string) => string;
  district: District;
  pal: SkinPalette;
  puzzle: Puzzle;
  rows: number;
  cols: number;
  U: number;
  W: number;
  H: number;
  m: Margins;
  /** CSS px per user unit at the current zoom. */
  ppu: number;
  /** n CSS pixels expressed in user units (for hairlines that must stay crisp). */
  px: (n: number) => number;
  /** Base wall thickness (user units), already clamped to a sensible pixel size. */
  wall: number;
  /** Base label font size (user units). */
  font: number;
  /** Cells are small on screen (< 40 px): skins should simplify ornaments. */
  dense: boolean;
  reduceMotion: boolean;
  geo: WallGeo;
  /** Floor colour of room i (district palette, cycled). */
  roomColor: (i: number) => string;
  /** Case code for title blocks etc. ("ASH-H-12"). */
  caseCode: string;
  title: string;
}

/** Colours the board's interactive layer uses so marks sit well on each medium. */
export interface SkinTokens {
  /** grease-pencil cross colour. */
  cross: string;
  /** pencil-note ink + the disc behind initials. */
  note: string;
  noteBg: string;
  /** hover outline (accent) */
  hover: string;
  /** Otto / hint highlight fill + stroke. */
  highlight: string;
  /** dashed outline for reason cells. */
  reason: string;
  /** accusation string. */
  string: string;
  /** soft shadow colour under photos / strings (default black; pastel on light skins). */
  shadow?: string;
  /** selected-person glow. */
  select: string;
  /** faint cell grid drawn over the floors. */
  grid: { color: string; opacity: number; dash?: string };
  /** how the desk-lamp pool blends with this medium. */
  lamp: { blend: CSSProperties['mixBlendMode']; color: string; strength: number };
  /** zoom control colours. */
  ui: { bg: string; fg: string; ring: string };
}

/**
 * A district's drawing medium. `Board` composes the pieces in this order (base layer, static):
 *   defs → sheet → floor(room)… → floorOverlay → [grid] → furniture → walls → label(spot)… → frame
 * then an optional `glow` layer (its own <svg>, so CSS animation on it stays compositor-only),
 * then the live layer (marks, tokens, strings, hover), the lamp and the burn.
 */
export interface SkinRenderer {
  id: WallStyle;
  margins: Margins;
  tokens: (pal: SkinPalette) => SkinTokens;
  /** <defs> content: patterns, gradients, filters (ids via ctx.id). */
  defs: (ctx: SkinCtx) => ReactNode;
  /** The whole sheet (covers the margins too). */
  sheet: (ctx: SkinCtx) => ReactNode;
  /** One room's floor. `d` is the room's outline path. */
  floor: (ctx: SkinCtx, room: Room, index: number, d: string) => ReactNode;
  /** Optional decoration over all floors, under furniture (inlays, reflections). */
  floorOverlay?: (ctx: SkinCtx) => ReactNode;
  /** Interior walls + outer border. */
  walls: (ctx: SkinCtx) => ReactNode;
  /** One room name plate. */
  label: (ctx: SkinCtx, spot: LabelSpot) => ReactNode;
  /** Margin ornaments drawn last in the base layer (compass, rulers, title block…). */
  frame?: (ctx: SkinCtx) => ReactNode;
  /** Optional additive light layer rendered in its own <svg> (e.g. neon bloom). */
  glow?: (ctx: SkinCtx) => ReactNode;
  /** CSS for the glow <svg> (blend mode, animation class). */
  glowStyle?: CSSProperties;
  glowClassName?: string;
}

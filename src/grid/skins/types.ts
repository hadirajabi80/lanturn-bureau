/**
 * SKINS — every district (season) is a different building with its own art direction.
 * Shared contract between: board renderer (src/grid/board), hub screens (src/grid/screens),
 * case screen, ambience audio. Data lives in ./districts.ts. Brief: docs/FLOORPLAN-DESIGN.md §3.
 */
import type { FloorStyle, FurnitureKind, LayoutStyle } from '../types';

/** How the board draws walls for this building. */
export type WallStyle =
  | 'ink'        // hand-inked double line with hatch (manor)
  | 'rope'       // thick rope + bollards at corners (docks)
  | 'deco'       // gold double rule with stepped corners (hotel)
  | 'marble'     // thick pale stone with soft shadow (museum)
  | 'neon'       // glowing tube with bloom (neon quarter)
  | 'chalk'      // dusty chalk stroke on board-green (academy)
  | 'steel'      // riveted steel plate (train)
  | 'blueprint'  // crisp white technical line with dimension ticks (observatory)
  | 'ribbon'     // pastel satin ribbon with little bows at corners (patisserie)
  | 'lace'       // scalloped white lace trim over a lilac line, pearl studs at corners (boutique)
  | 'candy';     // candy-cane stripes with gumdrop corners (carnival)

/** The paper/surface the floor plan is drawn on, around and under the rooms. */
export type SheetStyle = 'parchment' | 'nautical' | 'lacquer' | 'gallery' | 'wet-asphalt' | 'chalkboard' | 'brushed-steel' | 'blueprint' | 'gingham' | 'watercolor' | 'confetti';

export interface SkinPalette {
  /** page background behind everything (dark — the Bureau is a night-time office). */
  bg: string;
  /** surface of panels/cards. */
  panel: string;
  /** main text on panels. */
  ink: string;
  /** muted text. */
  muted: string;
  /** primary accent (buttons, selection). */
  accent: string;
  /** secondary accent (highlights, stars). */
  accent2: string;
  /** danger / victim colour. */
  danger: string;
  /** board sheet base colour. */
  sheet: string;
  /** wall colour. */
  wall: string;
  /** room floor tints (cycled per room). */
  rooms: string[];
  /** glow used by neon/lamp effects. */
  glow: string;
}

export interface District {
  /** 'light' districts use a bright daytime palette (dark ink on light panels); UI must read palette.bg luminance or this flag. */
  mood?: 'night' | 'light';
  /** also the seasonId used by the engine & progress keys. */
  id: string;
  number: number;           // 1..8 display order
  name: string;             // "Ashcombe Manor"
  kicker: string;           // "District I · The Old Quarter"
  blurb: string;            // one evocative sentence
  themeId: string;          // engine theme (room names, furniture pool, titles)
  layout: LayoutStyle;      // engine room-carving style
  wall: WallStyle;
  sheet: SheetStyle;
  floors: FloorStyle[];     // preferred floor styles
  furniture: FurnitureKind[]; // signature furniture (engine draws from theme pool; board may restyle these)
  palette: SkinPalette;
  /** facade silhouette description used by the hub's procedural building illustration. */
  facade: {
    shape: 'manor' | 'lighthouse' | 'tower' | 'museum' | 'skyline' | 'gothic' | 'train' | 'dome' | 'cottage' | 'boutique' | 'carnival';
    floors: number;         // window rows
    windowsPerFloor: number;
  };
  ambience: 'clock' | 'waves' | 'jazz' | 'hush' | 'rain' | 'bells' | 'rails' | 'wind' | 'musicbox' | 'harp' | 'calliope';
  icon: string;             // lucide icon name
  /** cases per tier for this district (mastermind has fewer). */
  casesPerTier: Record<'easy' | 'medium' | 'hard' | 'extreme' | 'mastermind', number>;
}

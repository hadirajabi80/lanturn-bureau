/**
 * FLOORPLAN MYSTERIES (Lantern Bureau) — grid-placement logic puzzles.
 * Design brief: docs/FLOORPLAN-DESIGN.md (v2). Engine rules: docs/GRID-PLAN.md.
 * Shared contract between the generator/solver (engine), the board UI and the screens.
 * Do not change shapes without updating docs/GRID-PLAN.md.
 */
import type { AvatarSpec } from '../data/types';

/** Internal ids stay easy…extreme; display names are Rookie / Detective / Inspector / Chief / Mastermind (see TIER_INFO in docs). */
export type Tier = 'easy' | 'medium' | 'hard' | 'extreme' | 'mastermind';
export const TIERS: Tier[] = ['easy', 'medium', 'hard', 'extreme', 'mastermind'];

export interface Cell { r: number; c: number }
export const cellKey = (c: Cell) => `${c.r},${c.c}`;

// ─────────────────────────── Furniture ───────────────────────────
/** `occupiable`: a person can stand/sit ON it (chair, armchair, sofa, rug, bed, stool, bench).
 *  Non-occupiable furniture blocks the cell (table, crate, barrel, bin, plant, piano, bookshelf…). */
export type FurnitureKind =
  | 'chair' | 'armchair' | 'sofa' | 'rug' | 'bed' | 'stool' | 'bench'
  | 'table' | 'desk' | 'crate' | 'barrel' | 'bin' | 'plant' | 'bananas' | 'piano'
  | 'bookshelf' | 'fireplace' | 'bathtub' | 'lamp' | 'safe' | 'statue' | 'cabinet'
  | 'fridge' | 'counter' | 'trolley' | 'suitcase' | 'anchor' | 'globe' | 'easel' | 'coffin';

export const OCCUPIABLE: Record<FurnitureKind, boolean> = {
  chair: true, armchair: true, sofa: true, rug: true, bed: true, stool: true, bench: true,
  table: false, desk: false, crate: false, barrel: false, bin: false, plant: false, bananas: false,
  piano: false, bookshelf: false, fireplace: false, bathtub: true, lamp: false, safe: false,
  statue: false, cabinet: false, fridge: false, counter: false, trolley: false, suitcase: false,
  anchor: false, globe: false, easel: false, coffin: false,
};

/** Human-readable noun phrases used in clue text. */
export const FURNITURE_LABEL: Record<FurnitureKind, { a: string; plural: string }> = {
  chair: { a: 'a chair', plural: 'chairs' }, armchair: { a: 'an armchair', plural: 'armchairs' },
  sofa: { a: 'a sofa', plural: 'sofas' }, rug: { a: 'a rug', plural: 'rugs' }, bed: { a: 'a bed', plural: 'beds' },
  stool: { a: 'a stool', plural: 'stools' }, bench: { a: 'a bench', plural: 'benches' },
  table: { a: 'a table', plural: 'tables' }, desk: { a: 'a desk', plural: 'desks' }, crate: { a: 'a crate', plural: 'crates' },
  barrel: { a: 'a barrel', plural: 'barrels' }, bin: { a: 'a bin', plural: 'bins' }, plant: { a: 'a plant', plural: 'plants' },
  bananas: { a: 'some bananas', plural: 'bananas' }, piano: { a: 'a piano', plural: 'pianos' },
  bookshelf: { a: 'a bookshelf', plural: 'bookshelves' }, fireplace: { a: 'a fireplace', plural: 'fireplaces' },
  bathtub: { a: 'a bathtub', plural: 'bathtubs' }, lamp: { a: 'a lamp', plural: 'lamps' }, safe: { a: 'a safe', plural: 'safes' },
  statue: { a: 'a statue', plural: 'statues' }, cabinet: { a: 'a cabinet', plural: 'cabinets' }, fridge: { a: 'a fridge', plural: 'fridges' },
  counter: { a: 'a counter', plural: 'counters' }, trolley: { a: 'a trolley', plural: 'trolleys' }, suitcase: { a: 'a suitcase', plural: 'suitcases' },
  anchor: { a: 'an anchor', plural: 'anchors' }, globe: { a: 'a globe', plural: 'globes' }, easel: { a: 'an easel', plural: 'easels' },
  coffin: { a: 'a coffin', plural: 'coffins' },
};

export interface Furniture {
  id: string;
  kind: FurnitureKind;
  /** 1 cell, or 2 cells in a straight line (sofa, bed, bench, long table, counter). */
  cells: Cell[];
  /** 'h' | 'v' for 2-cell pieces, undefined for single. */
  orient?: 'h' | 'v';
}

// ─────────────────────────── Rooms & theme ───────────────────────────
export type FloorStyle = 'wood' | 'tile' | 'stone' | 'carpet' | 'grass' | 'marble' | 'concrete' | 'deck' | 'checker' | 'sand';

export interface Room {
  id: string;
  name: string;        // "Library"
  floor: FloorStyle;
  color: string;       // hex base colour of the floor
  cells: Cell[];       // orthogonally connected region; rooms partition the whole grid
}

export interface Theme {
  id: string;                      // 'mansion' | 'market' | 'ship' | 'museum' | 'hotel' | 'academy'
  name: string;                    // "Crime Files"
  roomNames: string[];             // pool of room names
  furniture: FurnitureKind[];      // pool used by this theme
  floors: FloorStyle[];
  palette: string[];               // room colours
  titleWords: { a: string[]; b: string[] }; // "The {a} {b}" → "The Torn Receipt"
}

// ─────────────────────────── People ───────────────────────────
export interface Person {
  id: string;
  name: string;
  pronoun: 'he' | 'she';
  avatar: AvatarSpec;
  isVictim: boolean;
}

// ─────────────────────────── Clues (typed predicates) ───────────────────────────
export type Dir = 'north' | 'south' | 'east' | 'west';
export type Cmp = 'exactly' | 'atLeast' | 'atMost';

export type Predicate =
  | { type: 'inRoom'; roomId: string }
  | { type: 'notInRoom'; roomId: string }
  | { type: 'onFurniture'; kind: FurnitureKind }                 // standing/sitting on that kind
  | { type: 'onAnyFurniture' }                                  // on some occupiable piece
  | { type: 'onNoFurniture' }                                   // on a bare floor cell
  | { type: 'notOnFurniture'; kind: FurnitureKind }
  | { type: 'besideFurniture'; kind: FurnitureKind }            // orthogonally adjacent to a cell of that kind
  | { type: 'notBesideFurniture'; kind: FurnitureKind }
  | { type: 'besideAnyFurniture' }
  | { type: 'notBesideAnyFurniture' }
  | { type: 'row'; index: number }                              // 0-based; text uses "top row"/"bottom row"/"row 3"
  | { type: 'notRow'; index: number }
  | { type: 'col'; index: number }
  | { type: 'notCol'; index: number }
  | { type: 'corner'; value: boolean }
  | { type: 'edge'; value: boolean }                            // on the outer border of the grid
  | { type: 'sameRoomAs'; personId: string }
  | { type: 'differentRoomFrom'; personId: string }
  | { type: 'besidePerson'; personId: string }               // diagonal neighbours (people never share a row/column)
  | { type: 'notBesidePerson'; personId: string }
  | { type: 'sameRowAs'; personId: string }
  | { type: 'sameColAs'; personId: string }
  | { type: 'dirOf'; personId: string; dir: Dir }               // strictly north/south (row) or east/west (col) of that person, any offset
  | { type: 'directlyDirOf'; personId: string; dir: Dir }       // same column (north/south) or same row (east/west)
  | { type: 'distance'; personId: string; cmp: Cmp; n: number } // Manhattan distance
  | { type: 'aloneInRoom' }
  | { type: 'roomCount'; cmp: Cmp; n: number }                  // number of people in own room (including self)
  | { type: 'roomHasFurniture'; kind: FurnitureKind; value: boolean }
  | { type: 'roomSizeCmp'; cmp: Cmp; n: number }                // room cell count
  | { type: 'lineOfSight'; personId: string; value: boolean }   // same row/col/diagonal, no blocking (non-occupiable) furniture between
  | { type: 'between'; a: string; b: string }                   // strictly between two people in the same row or column
  | { type: 'or'; a: Predicate; b: Predicate }
  | { type: 'not'; p: Predicate };

export interface Clue {
  personId: string;
  text: string;            // "He was not beside any table."
  predicate: Predicate;
}

// ─────────────────────────── Killer rule ───────────────────────────
export type KillerRule =
  | { type: 'aloneWithVictim' }        // the only other person in the victim's room
  | { type: 'besideVictim' }           // the only person orthogonally adjacent to the victim
  | { type: 'lineOfSight' }            // the only person with line of sight to the victim
  | { type: 'closest' }                // the unique person at minimum Manhattan distance
  | { type: 'sameRowOrCol' };          // the only person sharing the victim's row or column

export const KILLER_RULE_TEXT: Record<KillerRule['type'], string> = {
  aloneWithVictim: 'The victim. {He} was alone with the killer.',
  besideVictim: 'The victim. The killer was right beside {him}.',
  lineOfSight: 'The victim. Only the killer could see {him}.',
  closest: 'The victim. The killer was the closest person to {him}.',
  sameRowOrCol: 'The victim. The killer shared {his} row or column — nobody else did.',
};

// ─────────────────────────── Puzzle ───────────────────────────
export interface Puzzle {
  id: string;             // `${seasonId}-${tier}-${index}`
  seasonId: string;
  tier: Tier;
  index: number;          // 1-based within tier
  seed: number;
  title: string;
  themeId: string;
  rows: number;
  cols: number;
  rooms: Room[];
  furniture: Furniture[];
  people: Person[];       // includes exactly one victim
  clues: Clue[];          // grouped per person in UI; one or more per person; victim's clue is the killer rule text
  killerRule: KillerRule;
  solution: Record<string, Cell>; // personId -> cell (unique)
  killerId: string;
  parSeconds: number;     // for 3-star timing
  /** v2 rule variant. Absent = 'classic'. */
  variant?: Variant;
  /** 'liar' / 'liarDouble': the person whose every sentence is FALSE (always one of the killers). */
  liarId?: string;
  /** 'accomplice': the second person (besides the killer) who shares the victim's room. */
  accompliceId?: string;
  /** 'poison': the furniture kind the poison was in (killer = the only person beside one of those pieces). */
  poisonKind?: FurnitureKind;
  /** 'double' / 'liarDouble': two victims, two killers (each killer is alone with one victim). killerId = killerIds[0]. */
  killerIds?: string[];
  victimIds?: string[];
  /** building layout style used to grow the rooms (see LayoutStyle). */
  layout?: LayoutStyle;
  /** skin id used by the board renderer (defaults to the district skin). */
  skinId?: string;
}

// ─────────────────────────── v2: variants, layouts, modes ───────────────────────────
/**
 * Scenario variants. All keep the core rule: one person per row and per column, N people on an N×N plan.
 * classic     — the killer is the only other person in the victim's room (room holds exactly 2).
 * accomplice  — the victim's room holds exactly 3 people: victim, killer, accomplice. The killer is the one
 *               CLOSER to the victim (Manhattan distance, always distinct); the other is the accomplice. Name both.
 * lockedRoom  — the victim was alone in a room. The killer is the only person in a room that shares a wall
 *               (orthogonally adjacent cells) with the victim's room.
 * poison      — the poison was in the {poisonKind}. The killer is the only person beside (orthogonally) a piece of that kind.
 *               The victim may be anywhere.
 * sniper      — the killer is the only person with a clear sight line (row, column or diagonal, not blocked by
 *               blocking furniture) to the victim. With one person per row/column this is always a diagonal.
 * liar        — classic + exactly one suspect lies (ALL their sentences are false). The liar is the killer.
 * double      — two victims, two killers; each victim's room holds exactly that victim and their killer.
 * liarDouble  — double + one of the two killers is a liar (Mastermind).
 * accompliceLiar — accomplice + the accomplice lies (Mastermind).
 */
export type Variant = 'classic' | 'accomplice' | 'lockedRoom' | 'poison' | 'sniper' | 'liar' | 'double' | 'liarDouble' | 'accompliceLiar';

/** Tier → which variants the generator may pick (index-driven, deterministic). Display names in skins/districts.ts TIER_INFO. */
export const VARIANTS_BY_TIER: Record<Tier, Variant[]> = {
  easy: ['classic'],
  medium: ['classic', 'lockedRoom', 'poison'],
  hard: ['classic', 'accomplice', 'sniper', 'lockedRoom', 'poison', 'liar'],
  extreme: ['accomplice', 'liar', 'double', 'sniper', 'poison'],
  mastermind: ['liarDouble', 'accompliceLiar', 'double', 'liar'],
};

/** How the generator carves rooms for a building. */
export type LayoutStyle =
  | 'organic'    // free region growth (manor)
  | 'corridor'   // a long hallway room with rooms on both sides (hotel)
  | 'carriages'  // horizontal bands of 1–2 rows split into compartments (train)
  | 'wings'      // mirrored left/right wings around a central hall (museum)
  | 'courtyard'  // a central courtyard ring of rooms (academy)
  | 'docks'      // irregular piers: a water-edge column of thin rooms (lighthouse & docks)
  | 'blocks'     // rectangular city blocks separated by alley rooms (neon quarter)
  | 'rings';     // concentric rings (observatory)

/** Play modes (routing level, not puzzle variants). */
export type PlayMode = 'case' | 'daily' | 'blitz' | 'gauntlet' | 'weekly' | 'custom' | 'zen';

/** Player cell marks in v2: pencil notes per person + hard X eliminations per person. */
export interface CellMarks {
  notes: Record<string, string[]>;   // cellKey -> personIds pencilled in
  crosses: Record<string, string[]>; // cellKey -> personIds ruled OUT here
}

// ─────────────────────────── Player state ───────────────────────────
export interface PlacementState {
  placements: Record<string, Cell | null>;   // personId -> cell
  notes: Record<string, string[]>;           // cellKey -> personIds pencil-marked
  hintsUsed: number;
  elapsedMs: number;
  undoStack: Array<{ placements: Record<string, Cell | null>; notes: Record<string, string[]> }>;
  phase: 'placing' | 'killer' | 'solved';
  killerGuess?: string;
}

export interface CaseResult {
  solved: boolean;
  stars: 0 | 1 | 2 | 3;
  timeMs: number;
  hintsUsed: number;
  bestTimeMs?: number;
}

export interface Season {
  id: string;
  name: string;
  subtitle: string;
  themeId: string;
  casesPerTier: number;   // 40
  accent: string;         // hex
  icon: string;           // lucide icon name
}

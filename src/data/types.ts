/**
 * LANTERN BUREAU — shared content schema.
 * Every case file, the bureau cast and the game engine depend on these types.
 * Do not change shapes without updating docs/PLAN.md.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

// ─────────────────────────── Avatars ───────────────────────────
export type HairStyle =
  | 'short' | 'long' | 'bun' | 'bald' | 'curly' | 'bob' | 'ponytail'
  | 'afro' | 'slick' | 'mohawk' | 'braids' | 'buzz' | 'wavy' | 'pixie';
export type Accessory =
  | 'none' | 'glasses' | 'roundGlasses' | 'monocle' | 'hat' | 'beret' | 'headphones'
  | 'scarf' | 'earring' | 'bowtie' | 'cap' | 'bandana' | 'flower' | 'goggles'
  | 'pearls' | 'headscarf' | 'eyepatch' | 'headset' | 'tie' | 'collar' | 'hood';
export type FacialHair = 'none' | 'beard' | 'mustache' | 'stubble' | 'goatee' | 'bigBeard';
export type Eyes = 'round' | 'narrow' | 'wide' | 'sleepy' | 'sharp' | 'closed' | 'dot';
export type Brows = 'flat' | 'arched' | 'angry' | 'worried' | 'raised' | 'thick';
export type Mouth = 'smile' | 'smirk' | 'frown' | 'neutral' | 'grin' | 'o' | 'pout' | 'teeth';

export interface AvatarSpec {
  kind?: 'human' | 'cat';
  skin: string;        // hex
  hair: HairStyle;
  hairColor: string;   // hex
  eyes: Eyes;
  brows: Brows;
  mouth: Mouth;
  accessory: Accessory;
  facial: FacialHair;
  outfit: string;      // hex, main clothing colour
  accent: string;      // hex, aura / background glow colour
  age?: 'young' | 'adult' | 'old'; // affects wrinkles / proportions
}

export interface Character {
  id: string;           // kebab-case, globally unique across ALL cases
  name: string;
  role: string;         // "Food critic", "Night custodian"...
  age: number;
  tagline: string;      // one punchy line shown under the name
  personality: string;  // one sentence
  quirk: string;        // a visible habit used in animation/dialogue
  voice: string;        // how they talk — guides statement writing
  avatar: AvatarSpec;
}

// ─────────────────────────── Dialogue ───────────────────────────
export type Mood = 'neutral' | 'happy' | 'angry' | 'surprised' | 'smug' | 'sad' | 'thinking';

export interface Line {
  speaker: string;  // characterId, or 'you' for the player (Rookie)
  text: string;
  mood?: Mood;
}

// ─────────────────────────── Evidence ───────────────────────────
export type ClueKind = 'physical' | 'document' | 'testimony' | 'digital' | 'photo' | 'forensic';

export interface Clue {
  id: string;             // unique within the case
  name: string;
  kind: ClueKind;
  description: string;    // what the player reads in the evidence drawer
  detail?: string;        // extra text shown on "examine" (zoom view)
  initial?: boolean;      // known from the start (in the briefing)
  icon?: string;          // lucide-react icon name, e.g. 'Fingerprint'
}

export interface Hotspot {
  id: string;
  x: number;              // 0-100 (% of scene width)
  y: number;              // 0-100 (% of scene height)
  label: string;          // tooltip, e.g. "Walk-in fridge handle"
  clueId?: string;        // clue revealed when examined
  flavor?: string;        // text shown when there is no clue ("Just a mop.")
}

export interface Scene {
  id: string;
  name: string;
  description: string;    // one or two atmospheric sentences
  palette: [string, string, string]; // gradient stops for the illustrated backdrop
  props: string[];        // lucide icon names scattered as silhouettes, e.g. ['Refrigerator','ChefHat']
  hotspots: Hotspot[];
}

// ─────────────────────────── Suspects ───────────────────────────
export interface Statement {
  id: string;
  text: string;
  /** Clue id that exposes this statement as a lie. Undefined = truthful / not contradictable. */
  contradictedBy?: string;
  /** What the suspect says when the correct clue is presented. */
  pressReply?: string;
  /** Clue unlocked when the contradiction lands (or when the statement is simply read, if `revealOnRead`). */
  revealClueId?: string;
  revealOnRead?: boolean;
  /** Reply when a wrong clue is presented (default generic). */
  wrongPressReply?: string;
}

export interface Suspect {
  character: Character;
  relation: string;       // relation to the crime/victim
  alibi: string;          // one-line claimed alibi
  motive?: string;        // only if they have one (red herrings may too)
  greeting: string;       // first thing they say when interviewed
  statements: Statement[];
  accusedWrong: string;   // reply when wrongly accused
  accusedRight?: string;  // confession / reaction when correctly accused
}

// ─────────────────────────── Mini-puzzles ───────────────────────────
export interface CodePuzzle {
  type: 'code';
  id: string;
  title: string;
  prompt: string;          // markdown-ish text; may include the cipher/table
  inputLabel: string;      // "Decoded location"
  answers: string[];       // accepted answers, compared case/space-insensitively
  hint: string;
  explanation: string;
  revealClueId?: string;
}

export interface OrderPuzzle {
  type: 'order';
  id: string;
  title: string;
  prompt: string;
  items: { id: string; text: string }[];
  correctOrder: string[];  // item ids, first → last
  hint: string;
  explanation: string;
  revealClueId?: string;
}

export interface GridPuzzle {
  type: 'grid';
  id: string;
  title: string;
  prompt: string;
  rows: string[];                   // e.g. suspect names
  cols: string[];                   // e.g. room numbers
  clues: string[];                  // the logic statements
  solution: Record<string, string>; // row -> col
  hint: string;
  explanation: string;
  revealClueId?: string;
}

export type MiniPuzzle = CodePuzzle | OrderPuzzle | GridPuzzle;

// ─────────────────────────── Deduction ───────────────────────────
export interface DeductionQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
}

// ─────────────────────────── Case ───────────────────────────
export interface CaseFile {
  id: string;             // 'case-01'
  number: number;         // 1..20
  title: string;
  difficulty: Difficulty;
  tagline: string;        // card subtitle
  location: string;
  time: string;           // "7:00 – 7:30 AM"
  crime: string;          // one sentence
  palette: { from: string; to: string; glow: string };
  briefing: string[];     // narrative paragraphs
  openingDialogue: Line[];
  scenes: Scene[];
  clues: Clue[];
  suspects: Suspect[];
  puzzles: MiniPuzzle[];  // must all be solved before the accusation unlocks
  hints: string[];        // 3 progressive hints
  culpritId: string;      // character id
  proveIt: DeductionQuestion[];
  solution: string[];     // full explanation paragraphs
  closingDialogue: Line[];
}

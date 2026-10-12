/**
 * The practice case used by the interactive tutorial (src/grid/guide/PracticeCase.tsx).
 * Hand-made 4×4 classic case so every tutorial step has one clear, teachable move:
 *
 *   Study   Study    Kitchen  Kitchen      Nora   → the armchair (only one on the plan)
 *   Study   Study    Hall     Kitchen      Oliver → the Kitchen; its top square is in Nora's row
 *   Lounge  Lounge   Hall     Hall         Grace  → beside the bookshelf; the top two rows are taken
 *   Lounge  Lounge   Lounge   Hall         Henry  → the victim takes the last free row and column
 *
 * Solution: Nora (0,1) · Oliver (1,3) · Grace (2,0) · Henry (3,2). Henry was alone with Grace: Grace did it.
 * Uniqueness is checked by src/grid/guide/__tests__/practice.ts.
 */
import { CAST } from '../engine';
import type { Cell, Puzzle } from '../types';

const cells = (...rc: Array<[number, number]>): Cell[] => rc.map(([r, c]) => ({ r, c }));
const cast = (id: string) => {
  const m = CAST.find((x) => x.id === id);
  if (!m) throw new Error(`practice case: no cast member ${id}`);
  return m;
};

const NORA = cast('nora');
const OLIVER = cast('oliver');
const GRACE = cast('grace');
const HENRY = cast('henry');

export const PRACTICE_IDS = { nora: NORA.id, oliver: OLIVER.id, grace: GRACE.id, henry: HENRY.id } as const;

export const PRACTICE_ROOMS = { study: 'study', kitchen: 'kitchen', hall: 'hall', lounge: 'lounge' } as const;

export const PRACTICE: Puzzle = {
  id: 'practice',
  seasonId: 'ashcombe',
  tier: 'easy',
  index: 0,
  seed: 1,
  title: 'The Practice File',
  themeId: 'mansion',
  rows: 4,
  cols: 4,
  rooms: [
    { id: 'study', name: 'Study', floor: 'wood', color: '#E3C7A3', cells: cells([0, 0], [0, 1], [1, 0], [1, 1]) },
    { id: 'kitchen', name: 'Kitchen', floor: 'checker', color: '#CCD0DD', cells: cells([0, 2], [0, 3], [1, 3]) },
    { id: 'hall', name: 'Hall', floor: 'carpet', color: '#D9D4CC', cells: cells([1, 2], [2, 2], [2, 3], [3, 3]) },
    { id: 'lounge', name: 'Lounge', floor: 'carpet', color: '#CDE5D3', cells: cells([2, 0], [2, 1], [3, 0], [3, 1], [3, 2]) },
  ],
  furniture: [
    { id: 'f0', kind: 'armchair', cells: cells([0, 1]) },
    { id: 'f1', kind: 'bookshelf', cells: cells([1, 0]) },
    { id: 'f2', kind: 'table', cells: cells([0, 3]) },
    { id: 'f3', kind: 'plant', cells: cells([2, 3]) },
    { id: 'f4', kind: 'sofa', cells: cells([3, 0], [3, 1]), orient: 'h' },
  ],
  people: [
    { id: NORA.id, name: NORA.name, pronoun: NORA.pronoun, avatar: NORA.avatar, isVictim: false },
    { id: OLIVER.id, name: OLIVER.name, pronoun: OLIVER.pronoun, avatar: OLIVER.avatar, isVictim: false },
    { id: GRACE.id, name: GRACE.name, pronoun: GRACE.pronoun, avatar: GRACE.avatar, isVictim: false },
    { id: HENRY.id, name: HENRY.name, pronoun: HENRY.pronoun, avatar: HENRY.avatar, isVictim: true },
  ],
  clues: [
    { personId: NORA.id, text: 'She was sitting in the armchair.', predicate: { type: 'onFurniture', kind: 'armchair' } },
    { personId: OLIVER.id, text: 'He was in the Kitchen.', predicate: { type: 'inRoom', roomId: 'kitchen' } },
    { personId: GRACE.id, text: 'She was right next to the bookshelf.', predicate: { type: 'besideFurniture', kind: 'bookshelf' } },
    { personId: HENRY.id, text: 'The victim. He was alone with the killer.', predicate: { type: 'roomCount', cmp: 'exactly', n: 2 } },
  ],
  killerRule: { type: 'aloneWithVictim' },
  solution: {
    [NORA.id]: { r: 0, c: 1 },
    [OLIVER.id]: { r: 1, c: 3 },
    [GRACE.id]: { r: 2, c: 0 },
    [HENRY.id]: { r: 3, c: 2 },
  },
  killerId: GRACE.id,
  parSeconds: 90,
  variant: 'classic',
  killerIds: [GRACE.id],
  victimIds: [HENRY.id],
  layout: 'organic',
  skinId: 'ashcombe',
};

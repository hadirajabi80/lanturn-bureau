/**
 * CRIME FILES — player store (zustand + persist, key `crime-files-v1`).
 *
 * - `progress[puzzleId]` is persisted: solved flag, best stars, best time and the in-progress
 *   PlacementState (so a refresh never loses a half-solved board).
 * - The live board lives in `active` (mirrored into `progress[activeId].inProgress` on every change).
 * - `selectedPersonId`, `tool` and `paused` are UI-session state and are NOT persisted.
 *
 * Pure state logic only — no React components here. See docs/GRID-PLAN.md §5.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { checkPlacement } from '@/grid/engine';
import { OCCUPIABLE, TIERS, cellKey, type Cell, type PlacementState, type Puzzle, type Season, type Tier } from './types';

export type Tool = 'notes' | 'place' | 'erase';

export interface PuzzleProgress {
  solved: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTimeMs?: number;
  inProgress: PlacementState | null;
}

export interface GridSettings {
  /** Highlight cells consistent with the selected person's clues. Off by default. */
  assist: boolean;
  sound: boolean;
}

export type TapResult =
  | 'placed'
  | 'moved'
  | 'removed'
  | 'noted'
  | 'unnoted'
  | 'erased'
  | 'selected'
  | 'reject'
  /** Placement refused because the row or column already holds a different person. */
  | 'reject-line'
  | 'noop';

export interface SubmitResult {
  ok: boolean;
  /** Person ids whose clues are violated (deduplicated, in order). */
  violations: string[];
  /** True when not everybody has been placed yet (nothing was checked). */
  incomplete?: boolean;
}

export interface GuessResult {
  correct: boolean;
  stars: 0 | 1 | 2 | 3;
  timeMs: number;
  hintsUsed: number;
  bestTimeMs?: number;
  newBest: boolean;
}

export const MAX_HINTS = 5;
const MAX_UNDO = 100;

export interface GridState {
  progress: Record<string, PuzzleProgress>;
  settings: GridSettings;

  // ── session (not persisted) ──
  activeId: string | null;
  active: PlacementState | null;
  selectedPersonId: string | null;
  tool: Tool;
  paused: boolean;

  /** Restore (or create) the PlacementState for a puzzle and make it the active board. */
  load: (puzzleId: string, puzzle?: Puzzle) => PlacementState;
  select: (personId: string | null) => void;
  setTool: (tool: Tool) => void;
  tapCell: (puzzle: Puzzle, cell: Cell) => TapResult;
  undo: () => boolean;
  /** Reveals one unplaced-or-wrong person's correct cell; returns that person's id (null when none/limit). */
  useHint: (puzzle: Puzzle) => string | null;
  tick: (ms: number) => void;
  setPaused: (paused: boolean) => void;
  submit: (puzzle: Puzzle) => SubmitResult;
  /** Back from the killer sheet to editing the board (phase 'killer' → 'placing'). */
  backToPlacing: () => void;
  guessKiller: (puzzle: Puzzle, personId: string) => GuessResult;
  reset: (puzzleId: string, puzzle?: Puzzle) => void;
  setAssist: (on: boolean) => void;
  setSound: (on: boolean) => void;
}

// ─────────────────────────── helpers ───────────────────────────

export const puzzleIdOf = (seasonId: string, tier: Tier, index: number) => `${seasonId}-${tier}-${index}`;

function freshState(puzzle?: Puzzle): PlacementState {
  const placements: Record<string, Cell | null> = {};
  for (const p of puzzle?.people ?? []) placements[p.id] = null;
  return { placements, notes: {}, hintsUsed: 0, elapsedMs: 0, undoStack: [], phase: 'placing' };
}

const sameCell = (a: Cell | null | undefined, b: Cell | null | undefined) =>
  !!a && !!b && a.r === b.r && a.c === b.c;

/** True when the cell holds a non-occupiable (blocking) piece of furniture. */
export function isBlocked(puzzle: Puzzle, cell: Cell): boolean {
  return puzzle.furniture.some((f) => !OCCUPIABLE[f.kind] && f.cells.some((c) => sameCell(c, cell)));
}

export function personAt(placements: Record<string, Cell | null>, cell: Cell): string | null {
  for (const [id, c] of Object.entries(placements)) if (sameCell(c, cell)) return id;
  return null;
}

/** Id of a person other than `personId` already in the cell's row or column (one person per row and column). */
export function lineConflict(
  placements: Record<string, Cell | null>,
  cell: Cell,
  personId: string | null,
): string | null {
  for (const [id, c] of Object.entries(placements)) {
    if (!c || id === personId) continue;
    if (c.r === cell.r || c.c === cell.c) return id;
  }
  return null;
}

export function allPlaced(puzzle: Puzzle, placements: Record<string, Cell | null>): boolean {
  return puzzle.people.every((p) => !!placements[p.id]);
}

/** Stars per GRID-PLAN §5: solve → 1; ≤1 hint & < 2×par → 2; 0 hints & < par → 3. */
export function starsFor(timeMs: number, hintsUsed: number, parSeconds: number): 1 | 2 | 3 {
  const par = parSeconds * 1000;
  if (hintsUsed === 0 && timeMs < par) return 3;
  if (hintsUsed <= 1 && timeMs < 2 * par) return 2;
  return 1;
}

function snapshot(s: PlacementState) {
  return { placements: { ...s.placements }, notes: { ...s.notes } };
}

function pushUndo(s: PlacementState): PlacementState['undoStack'] {
  const stack = [...s.undoStack, snapshot(s)];
  return stack.length > MAX_UNDO ? stack.slice(stack.length - MAX_UNDO) : stack;
}

function withoutCellNotes(notes: Record<string, string[]>, key: string): Record<string, string[]> {
  if (!(key in notes)) return notes;
  const next = { ...notes };
  delete next[key];
  return next;
}

// ─────────────────────────── store ───────────────────────────

export const useFiles = create<GridState>()(
  persist(
    (set, get) => {
      /** Write the live state + mirror it into progress. */
      const commit = (next: PlacementState) => {
        const id = get().activeId;
        if (!id) return;
        set((s) => {
          const prev: PuzzleProgress = s.progress[id] ?? { solved: false, stars: 0, inProgress: null };
          return {
            active: next,
            progress: {
              ...s.progress,
              [id]: { ...prev, inProgress: next.phase === 'solved' ? null : next },
            },
          };
        });
      };

      return {
        progress: {},
        settings: { assist: false, sound: true },
        activeId: null,
        active: null,
        selectedPersonId: null,
        tool: 'place',
        paused: false,

        load: (puzzleId, puzzle) => {
          const s = get();
          if (s.activeId === puzzleId && s.active && s.active.phase !== 'solved') return s.active;
          const saved = s.progress[puzzleId]?.inProgress;
          const base = freshState(puzzle);
          const state: PlacementState = saved
            ? { ...base, ...saved, placements: { ...base.placements, ...saved.placements } }
            : base;
          const firstUnplaced =
            puzzle?.people.find((p) => !state.placements[p.id])?.id ?? puzzle?.people[0]?.id ?? null;
          set({ activeId: puzzleId, active: state, selectedPersonId: firstUnplaced, tool: 'place', paused: false });
          return state;
        },

        select: (personId) => set({ selectedPersonId: personId }),
        setTool: (tool) => set({ tool }),

        tapCell: (puzzle, cell) => {
          const { active, tool, selectedPersonId, paused } = get();
          if (!active || active.phase !== 'placing' || paused) return 'noop';
          const key = cellKey(cell);
          const occupant = personAt(active.placements, cell);

          if (tool === 'erase') {
            if (occupant) {
              commit({
                ...active,
                undoStack: pushUndo(active),
                placements: { ...active.placements, [occupant]: null },
              });
              return 'erased';
            }
            if (active.notes[key]?.length) {
              commit({ ...active, undoStack: pushUndo(active), notes: withoutCellNotes(active.notes, key) });
              return 'erased';
            }
            return 'noop';
          }

          // Notes / Place need a selected person; with nobody selected, tapping a placed person selects them.
          if (!selectedPersonId) {
            if (occupant) {
              set({ selectedPersonId: occupant });
              return 'selected';
            }
            return 'reject';
          }

          if (isBlocked(puzzle, cell)) return 'reject';

          if (tool === 'notes') {
            if (occupant) return 'reject';
            const list = active.notes[key] ?? [];
            const has = list.includes(selectedPersonId);
            const nextList = has ? list.filter((id) => id !== selectedPersonId) : [...list, selectedPersonId];
            const notes = { ...active.notes };
            if (nextList.length) notes[key] = nextList;
            else delete notes[key];
            commit({ ...active, undoStack: pushUndo(active), notes });
            return has ? 'unnoted' : 'noted';
          }

          // place
          if (occupant && occupant !== selectedPersonId) return 'reject';
          if (occupant === selectedPersonId) {
            // Tapping the selected person's own cell picks them back up.
            commit({
              ...active,
              undoStack: pushUndo(active),
              placements: { ...active.placements, [selectedPersonId]: null },
            });
            return 'removed';
          }
          if (lineConflict(active.placements, cell, selectedPersonId)) return 'reject-line';
          const wasPlaced = !!active.placements[selectedPersonId];
          commit({
            ...active,
            undoStack: pushUndo(active),
            placements: { ...active.placements, [selectedPersonId]: { r: cell.r, c: cell.c } },
            notes: withoutCellNotes(active.notes, key),
          });
          return wasPlaced ? 'moved' : 'placed';
        },

        undo: () => {
          const { active, paused } = get();
          if (!active || active.phase !== 'placing' || paused || active.undoStack.length === 0) return false;
          const last = active.undoStack[active.undoStack.length - 1]!;
          commit({ ...active, placements: last.placements, notes: last.notes, undoStack: active.undoStack.slice(0, -1) });
          return true;
        },

        useHint: (puzzle) => {
          const { active, selectedPersonId, paused } = get();
          if (!active || active.phase !== 'placing' || paused || active.hintsUsed >= MAX_HINTS) return null;
          const wrong = (id: string) => !sameCell(active.placements[id], puzzle.solution[id]);
          const order = [
            ...(selectedPersonId ? [selectedPersonId] : []),
            ...puzzle.people.map((p) => p.id).filter((id) => id !== selectedPersonId),
          ];
          // Prefer unplaced people (least disruptive), then wrongly placed ones; selected person first.
          const target =
            order.find((id) => !active.placements[id] && puzzle.solution[id]) ??
            order.find((id) => wrong(id) && puzzle.solution[id]);
          if (!target) return null;
          const cell = puzzle.solution[target]!;
          const placements = { ...active.placements };
          const squatter = personAt(placements, cell);
          if (squatter && squatter !== target) placements[squatter] = null;
          // One person per row and column: anyone wrongly sharing the revealed cell's row/column is picked up.
          for (const [id, c] of Object.entries(placements)) {
            if (!c || id === target || sameCell(c, puzzle.solution[id])) continue;
            if (c.r === cell.r || c.c === cell.c) placements[id] = null;
          }
          placements[target] = { r: cell.r, c: cell.c };
          commit({
            ...active,
            undoStack: pushUndo(active),
            placements,
            notes: withoutCellNotes(active.notes, cellKey(cell)),
            hintsUsed: active.hintsUsed + 1,
          });
          set({ selectedPersonId: target });
          return target;
        },

        tick: (ms) => {
          const { active, paused } = get();
          if (!active || paused || active.phase === 'solved' || ms <= 0) return;
          if (typeof document !== 'undefined' && document.hidden) return;
          commit({ ...active, elapsedMs: active.elapsedMs + ms });
        },

        setPaused: (paused) => set({ paused }),

        submit: (puzzle) => {
          const { active } = get();
          if (!active || active.phase !== 'placing') return { ok: false, violations: [] };
          if (!allPlaced(puzzle, active.placements)) return { ok: false, violations: [], incomplete: true };
          const res = checkPlacement(puzzle, active.placements);
          const violations: string[] = [...new Set<string>(res.violations.map((v: { personId: string }) => v.personId))];
          if (res.ok) commit({ ...active, phase: 'killer' });
          return { ok: res.ok, violations };
        },

        backToPlacing: () => {
          const { active } = get();
          if (active?.phase === 'killer') commit({ ...active, phase: 'placing' });
        },

        guessKiller: (puzzle, personId) => {
          const { active, activeId, progress } = get();
          const miss: GuessResult = {
            correct: false,
            stars: 0,
            timeMs: active?.elapsedMs ?? 0,
            hintsUsed: active?.hintsUsed ?? 0,
            newBest: false,
          };
          if (!active || !activeId || active.phase !== 'killer') return miss;
          if (personId !== puzzle.killerId) return miss;

          const timeMs = active.elapsedMs;
          const stars = starsFor(timeMs, active.hintsUsed, puzzle.parSeconds);
          const prev = progress[activeId];
          const newBest = prev?.bestTimeMs === undefined || timeMs < prev.bestTimeMs;
          const bestTimeMs = newBest ? timeMs : prev?.bestTimeMs;
          const solvedState: PlacementState = { ...active, phase: 'solved', killerGuess: personId, undoStack: [] };
          set((s) => ({
            active: solvedState,
            progress: {
              ...s.progress,
              [activeId]: {
                solved: true,
                stars: Math.max(prev?.stars ?? 0, stars) as 0 | 1 | 2 | 3,
                bestTimeMs,
                inProgress: null,
              },
            },
          }));
          return { correct: true, stars, timeMs, hintsUsed: active.hintsUsed, bestTimeMs, newBest };
        },

        reset: (puzzleId, puzzle) => {
          set((s) => {
            const prev = s.progress[puzzleId];
            const progress = prev ? { ...s.progress, [puzzleId]: { ...prev, inProgress: null } } : s.progress;
            if (s.activeId !== puzzleId) return { progress };
            return {
              progress,
              active: freshState(puzzle),
              paused: false,
              tool: 'place' as Tool,
              selectedPersonId: puzzle?.people[0]?.id ?? null,
            };
          });
        },

        setAssist: (assist) => set((s) => ({ settings: { ...s.settings, assist } })),
        setSound: (sound) => set((s) => ({ settings: { ...s.settings, sound } })),
      };
    },
    {
      name: 'crime-files-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ progress: s.progress, settings: s.settings }),
    },
  ),
);

// ─────────────────────────── selectors ───────────────────────────

export interface ProgressCount {
  solved: number;
  total: number;
  stars: number;
  inProgress: number;
}

export function tierProgress(
  progress: Record<string, PuzzleProgress>,
  seasonId: string,
  tier: Tier,
  casesPerTier = 40,
): ProgressCount {
  let solved = 0;
  let stars = 0;
  let inProgress = 0;
  for (let i = 1; i <= casesPerTier; i++) {
    const p = progress[puzzleIdOf(seasonId, tier, i)];
    if (!p) continue;
    if (p.solved) solved++;
    stars += p.stars;
    if (p.inProgress) inProgress++;
  }
  return { solved, total: casesPerTier, stars, inProgress };
}

export function seasonProgress(
  progress: Record<string, PuzzleProgress>,
  season: Pick<Season, 'id' | 'casesPerTier'>,
): ProgressCount {
  return TIERS.reduce<ProgressCount>(
    (acc, t) => {
      const p = tierProgress(progress, season.id, t, season.casesPerTier);
      return {
        solved: acc.solved + p.solved,
        total: acc.total + p.total,
        stars: acc.stars + p.stars,
        inProgress: acc.inProgress + p.inProgress,
      };
    },
    { solved: 0, total: 0, stars: 0, inProgress: 0 },
  );
}

export type CaseStatus = 'new' | 'progress' | 'solved';

export function caseStatus(p: PuzzleProgress | undefined): CaseStatus {
  if (p?.solved) return 'solved';
  if (p?.inProgress) return 'progress';
  return 'new';
}

/** Hook: solved/total for a tier. */
export function useTierProgress(seasonId: string, tier: Tier, casesPerTier = 40): ProgressCount {
  const progress = useFiles((s) => s.progress);
  return tierProgress(progress, seasonId, tier, casesPerTier);
}

/** Hook: solved/total for a whole season. */
export function useSeasonProgress(season: Pick<Season, 'id' | 'casesPerTier'>): ProgressCount {
  const progress = useFiles((s) => s.progress);
  return seasonProgress(progress, season);
}

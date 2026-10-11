/**
 * FLOORPLAN MYSTERIES — player store v2 (zustand + persist, key `floorplan-v2`).
 * Brief: docs/FLOORPLAN-DESIGN.md §5 (desk, freedom & burning), §6 (stars), §7 (contracts).
 *
 * Persisted: `progress[puzzleId]` (solved, best stars/time, burns, attempts, the in-progress desk),
 * `settings`, `seenVariants` (scenario explainers already shown) and mode `records`.
 * Session only: the live desk (`active`), selection, tool, the pending Otto hint.
 *
 * USER RULE — the desk NEVER blocks a move. Pins may share rows/columns and sit on crossed squares;
 * the only refusals are blocking furniture and (for a pin) a square that already holds somebody else —
 * tapping such a square selects that person instead. Mistakes are judged only by the lever /
 * the accusation: a wrong plan or a wrong accusation BURNS the case (unless burning is disabled, Zen).
 *
 * Saves from the old v1 store (`crime-files-v1`) are migrated into v2 once (season ids mapped, indices > 30 dropped).
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  checkAccusation,
  checkPlacement,
  nextDeduction,
  recordBurn,
  recordSolve,
  setDeskSound,
  variantOf,
  type Accusation,
  type Deduction,
  metaRecordBlitz,
  metaRecordGauntlet,
  type RecordOutcome,
  type Violation,
} from '@/grid/screens/desk/bridge';
import { DISTRICTS, getDistrict } from '@/grid/skins/districts';
import {
  OCCUPIABLE,
  TIERS,
  cellKey,
  type Cell,
  type CellMarks,
  type PlayMode,
  type Puzzle,
  type Tier,
  type Variant,
} from './types';

export type { Accusation, Deduction, RecordOutcome, Violation } from '@/grid/screens/desk/bridge';

// ─────────────────────────── types ───────────────────────────

export type DeskTool = 'pin' | 'pencil' | 'cross' | 'erase';
export type DeskPhase = 'placing' | 'accusing' | 'solved' | 'burned';

export interface DeskSnapshot {
  placements: Record<string, Cell | null>;
  marks: CellMarks;
}

/** One pin event, recorded for the 6-second Replay. `cell: null` = pin removed. */
export interface PinEvent {
  personId: string;
  cell: Cell | null;
  /** elapsedMs when it happened */
  t: number;
}

export interface BurnInfo {
  reason: 'incomplete' | 'placement' | 'accusation';
  violations: Violation[];
  /** people still unpinned when the lever was pulled */
  missing: string[];
}

export interface DeskState {
  placements: Record<string, Cell | null>;
  marks: CellMarks;
  elapsedMs: number;
  /** Ask Otto uses */
  otto: number;
  /** Reveal uses */
  reveals: number;
  undo: DeskSnapshot[];
  redo: DeskSnapshot[];
  phase: DeskPhase;
  accusation?: Accusation;
  /** pin history for Replay */
  history: PinEvent[];
  /** suspects the player marked as cleared on the Dossier (red X on the polaroid) */
  cleared: string[];
  /** testimony tick-boxes: clue indices the player ticked off */
  ticks: number[];
  pencilUsed: boolean;
  burn?: BurnInfo;
}

export interface CaseProgress {
  solved: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTimeMs?: number;
  burns: number;
  attempts: number;
  inProgress: DeskState | null;
  /** outcome of the latest finished attempt (drives the scorch mark on key tags) */
  lastOutcome?: 'solved' | 'burned';
}

export interface FloorplanSettings {
  autoCross: boolean;
  sound: boolean;
  music: boolean;
  lampFollow: boolean;
  showTimer: boolean;
  confirmLever: boolean;
}

export interface ModeRecords {
  blitzBest: number;
  blitzRuns: number;
  /** best Gauntlet stage reached (0–7; 7 = survived) */
  gauntletBest: number;
  gauntletRuns: number;
  /** ISO week → best time (ms) on the Weekly Mastermind */
  weeklyBest: Record<string, number>;
  zenSolved: number;
}

export type CaseStatus = 'new' | 'progress' | 'solved' | 'burned';

export type TapResult =
  | 'placed' | 'moved' | 'removed' | 'selected'
  | 'noted' | 'unnoted' | 'crossed' | 'uncrossed' | 'erased'
  | 'blocked' | 'need-select' | 'noop';

export interface LeverResult {
  /** 'accusing' = plan correct, line-up opens; 'burned' = case burned; 'violations' = no-burn mode (Zen) */
  outcome: 'accusing' | 'burned' | 'violations';
  violations: Violation[];
  missing: string[];
}

export interface AccuseResult {
  correct: boolean;
  burned: boolean;
  stars: 0 | 1 | 2 | 3;
  timeMs: number;
  newBest: boolean;
  bestTimeMs?: number;
  reward: RecordOutcome | null;
}

export interface OpenOptions {
  mode?: PlayMode;
  /** wrong lever / accusation burns the case (default true; Zen = false) */
  burnEnabled?: boolean;
  /** write per-case progress (default true; Blitz/Gauntlet/Zen = false) */
  record?: boolean;
  /** ignore any saved desk and start fresh */
  fresh?: boolean;
}

export interface ProgressCount {
  solved: number;
  total: number;
  stars: number;
  inProgress: number;
  burned: number;
}

export interface FloorplanState {
  progress: Record<string, CaseProgress>;
  settings: FloorplanSettings;
  seenVariants: Variant[];
  records: ModeRecords;
  migratedV1: boolean;

  // ── session (not persisted) ──
  activeId: string | null;
  active: DeskState | null;
  mode: PlayMode;
  burnEnabled: boolean;
  record: boolean;
  selectedPersonId: string | null;
  tool: DeskTool;
  /** Otto's pending deduction (shown in the Otto panel until applied / dismissed) */
  ottoHint: Deduction | null;
  lastResult: AccuseResult | null;

  open: (puzzle: Puzzle, opts?: OpenOptions) => DeskState;
  select: (personId: string | null) => void;
  setTool: (tool: DeskTool) => void;
  tap: (puzzle: Puzzle, cell: Cell, opts?: { all?: boolean; tool?: DeskTool }) => TapResult;
  /** long-press = cross that square for everyone (toggle) */
  longPress: (puzzle: Puzzle, cell: Cell) => TapResult;
  toggleTick: (clueIndex: number) => void;
  toggleCleared: (personId: string) => void;
  askOtto: (puzzle: Puzzle) => Deduction | null;
  applyOtto: () => boolean;
  dismissOtto: () => void;
  reveal: (puzzle: Puzzle) => string | null;
  undo: () => boolean;
  redo: () => boolean;
  tick: (ms: number) => void;
  pullLever: (puzzle: Puzzle) => LeverResult;
  accuse: (puzzle: Puzzle, accusation: Accusation) => AccuseResult;
  reopen: (puzzleId: string, puzzle?: Puzzle) => void;
  markVariantSeen: (v: Variant) => void;
  setSetting: <K extends keyof FloorplanSettings>(key: K, value: FloorplanSettings[K]) => void;
  /** end of a Blitz run (score = cases closed); also records it in the profile */
  recordBlitz: (score: number) => { newBest: boolean; outcome: RecordOutcome | null };
  /** end of a Gauntlet run (stage = floors cleared 0–7) */
  recordGauntlet: (stage: number) => { newBest: boolean; outcome: RecordOutcome | null };
  recordZen: () => void;

  // selectors (read the persisted progress)
  caseStatus: (puzzleId: string) => CaseStatus;
  tierProgress: (districtId: string, tier: Tier) => ProgressCount;
  districtProgress: (districtId: string) => ProgressCount;
}

// ─────────────────────────── helpers ───────────────────────────

export const MAX_UNDO = 200;
export const puzzleIdOf = (districtId: string, tier: Tier, index: number) => `${districtId}-${tier}-${index}`;

const EMPTY_MARKS: CellMarks = { notes: {}, crosses: {} };

export function freshDesk(puzzle?: Puzzle): DeskState {
  const placements: Record<string, Cell | null> = {};
  for (const p of puzzle?.people ?? []) placements[p.id] = null;
  return {
    placements,
    marks: { notes: {}, crosses: {} },
    elapsedMs: 0,
    otto: 0,
    reveals: 0,
    undo: [],
    redo: [],
    phase: 'placing',
    history: [],
    ticks: [],
    cleared: [],
    pencilUsed: false,
  };
}

export const sameCell = (a: Cell | null | undefined, b: Cell | null | undefined) =>
  !!a && !!b && a.r === b.r && a.c === b.c;

/** True when the cell holds a non-occupiable (blocking) piece of furniture. */
export function isBlocked(puzzle: Puzzle, cell: Cell): boolean {
  return puzzle.furniture.some((f) => !OCCUPIABLE[f.kind] && f.cells.some((c) => sameCell(c, cell)));
}

export function personAt(placements: Record<string, Cell | null>, cell: Cell): string | null {
  for (const [id, c] of Object.entries(placements)) if (sameCell(c, cell)) return id;
  return null;
}

export function allPlaced(puzzle: Puzzle, placements: Record<string, Cell | null>): boolean {
  return puzzle.people.every((p) => !!placements[p.id]);
}

/** Stars (brief §6): 3 = no Reveal, ≤ 1 Ask Otto, under par · 2 = ≤ 1 Reveal, under 2× par · 1 = solved. */
export function starsFor(timeMs: number, otto: number, reveals: number, parSeconds: number): 1 | 2 | 3 {
  const par = parSeconds * 1000;
  if (reveals === 0 && otto <= 1 && timeMs < par) return 3;
  if (reveals <= 1 && timeMs < 2 * par) return 2;
  return 1;
}

/** Cells (unblocked, uncrossed for `personId`) still open to that person. */
export function openCellsFor(puzzle: Puzzle, marks: CellMarks, personId: string): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = { r, c };
      if (isBlocked(puzzle, cell)) continue;
      if ((marks.crosses[cellKey(cell)] ?? []).includes(personId)) continue;
      out.push(cell);
    }
  }
  return out;
}

function toggleIn(map: Record<string, string[]>, key: string, id: string): { map: Record<string, string[]>; added: boolean } {
  const list = map[key] ?? [];
  const has = list.includes(id);
  const next = { ...map };
  const nl = has ? list.filter((x) => x !== id) : [...list, id];
  if (nl.length) next[key] = nl;
  else delete next[key];
  return { map: next, added: !has };
}

function removeFrom(map: Record<string, string[]>, key: string, id: string): Record<string, string[]> {
  const list = map[key];
  if (!list?.includes(id)) return map;
  const next = { ...map };
  const nl = list.filter((x) => x !== id);
  if (nl.length) next[key] = nl;
  else delete next[key];
  return next;
}

function addCrosses(map: Record<string, string[]>, key: string, ids: string[]): Record<string, string[]> {
  const list = map[key] ?? [];
  const add = ids.filter((id) => !list.includes(id));
  if (!add.length) return map;
  return { ...map, [key]: [...list, ...add] };
}

function snap(s: DeskState): DeskSnapshot {
  return { placements: s.placements, marks: s.marks };
}

function pushUndo(s: DeskState): DeskSnapshot[] {
  const stack = [...s.undo, snap(s)];
  return stack.length > MAX_UNDO ? stack.slice(stack.length - MAX_UNDO) : stack;
}

/** Apply an undoable board edit: snapshot → undo stack, clear redo. */
function edit(s: DeskState, patch: Partial<Pick<DeskState, 'placements' | 'marks' | 'history' | 'pencilUsed' | 'reveals'>>): DeskState {
  return { ...s, ...patch, undo: pushUndo(s), redo: [] };
}

const emptyProgress = (): CaseProgress => ({ solved: false, stars: 0, burns: 0, attempts: 0, inProgress: null });

const DEFAULT_SETTINGS: FloorplanSettings = {
  autoCross: false,
  sound: true,
  music: true,
  lampFollow: true,
  showTimer: true,
  confirmLever: true,
};

const DEFAULT_RECORDS: ModeRecords = {
  blitzBest: 0,
  blitzRuns: 0,
  gauntletBest: 0,
  gauntletRuns: 0,
  weeklyBest: {},
  zenSolved: 0,
};

/** Old v1 season ids → v2 district ids (brief §7). */
export const LEGACY_SEASON_MAP: Record<string, string> = {
  files: 'ashcombe',
  files2: 'harrow',
  files3: 'meridian',
  files4: 'curiosities',
  files5: 'neon',
  academy: 'hollowmere',
};

/** Read `crime-files-v1` and map it into v2 progress (solved/stars/best time only; boards are dropped). */
export function migrateLegacyProgress(raw: string | null): Record<string, CaseProgress> {
  const out: Record<string, CaseProgress> = {};
  if (!raw) return out;
  try {
    const parsed = JSON.parse(raw) as { state?: { progress?: Record<string, { solved?: boolean; stars?: number; bestTimeMs?: number }> } };
    const old = parsed.state?.progress ?? {};
    for (const [id, p] of Object.entries(old)) {
      const m = /^(.+)-(easy|medium|hard|extreme)-(\d+)$/.exec(id);
      if (!m) continue;
      const district = LEGACY_SEASON_MAP[m[1]!];
      const index = Number(m[3]);
      if (!district || index < 1 || index > 30) continue;
      if (!p?.solved) continue;
      out[puzzleIdOf(district, m[2] as Tier, index)] = {
        solved: true,
        stars: Math.max(0, Math.min(3, Math.round(p.stars ?? 1))) as 0 | 1 | 2 | 3,
        bestTimeMs: typeof p.bestTimeMs === 'number' ? p.bestTimeMs : undefined,
        burns: 0,
        attempts: 1,
        inProgress: null,
        lastOutcome: 'solved',
      };
    }
  } catch {
    /* corrupt legacy save — ignore */
  }
  return out;
}

function statusOf(p: CaseProgress | undefined): CaseStatus {
  if (p?.solved) return 'solved';
  if (p?.inProgress && p.inProgress.phase !== 'burned') return 'progress';
  if (p?.lastOutcome === 'burned') return 'burned';
  return 'new';
}

function countTier(progress: Record<string, CaseProgress>, districtId: string, tier: Tier): ProgressCount {
  const total = getDistrict(districtId)?.casesPerTier[tier] ?? (tier === 'mastermind' ? 10 : 30);
  const acc: ProgressCount = { solved: 0, total, stars: 0, inProgress: 0, burned: 0 };
  for (let i = 1; i <= total; i++) {
    const p = progress[puzzleIdOf(districtId, tier, i)];
    if (!p) continue;
    const st = statusOf(p);
    if (p.solved) acc.solved++;
    acc.stars += p.stars;
    if (st === 'progress') acc.inProgress++;
    if (st === 'burned') acc.burned++;
  }
  return acc;
}

function countDistrict(progress: Record<string, CaseProgress>, districtId: string): ProgressCount {
  return TIERS.reduce<ProgressCount>(
    (a, t) => {
      const p = countTier(progress, districtId, t);
      return {
        solved: a.solved + p.solved,
        total: a.total + p.total,
        stars: a.stars + p.stars,
        inProgress: a.inProgress + p.inProgress,
        burned: a.burned + p.burned,
      };
    },
    { solved: 0, total: 0, stars: 0, inProgress: 0, burned: 0 },
  );
}

/** Strip undo/redo from persisted desks (keeps localStorage small). */
function slimDesk(d: DeskState | null): DeskState | null {
  return d ? { ...d, undo: [], redo: [] } : null;
}

// ─────────────────────────── store ───────────────────────────

export const useFloorplan = create<FloorplanState>()(
  persist(
    (set, get) => {
      /** Write the live desk and mirror it into progress (when recording). */
      const commit = (next: DeskState, extra?: (p: CaseProgress) => CaseProgress) => {
        const { activeId, record } = get();
        if (!activeId) return;
        set((s) => {
          if (!record) return { active: next };
          const prev = s.progress[activeId] ?? emptyProgress();
          const live = next.phase === 'solved' || next.phase === 'burned' ? null : next;
          const base: CaseProgress = { ...prev, inProgress: live };
          return { active: next, progress: { ...s.progress, [activeId]: extra ? extra(base) : base } };
        });
      };

      const burn = (puzzle: Puzzle, s: DeskState, info: BurnInfo): DeskState => {
        const next: DeskState = { ...s, phase: 'burned', burn: info, undo: [], redo: [] };
        commit(next, (p) => ({ ...p, burns: p.burns + 1, attempts: p.attempts + 1, lastOutcome: 'burned' }));
        try {
          recordBurn({
            puzzleId: puzzle.id,
            district: puzzle.seasonId,
            tier: puzzle.tier,
            variant: variantOf(puzzle),
            mode: get().mode,
            at: Date.now(),
          });
        } catch (err) {
          console.warn('[desk] recordBurn failed', err);
        }
        return next;
      };

      const editable = (): DeskState | null => {
        const a = get().active;
        return a && a.phase === 'placing' ? a : null;
      };

      return {
        progress: {},
        settings: { ...DEFAULT_SETTINGS },
        seenVariants: [],
        records: { ...DEFAULT_RECORDS },
        migratedV1: false,

        activeId: null,
        active: null,
        mode: 'case',
        burnEnabled: true,
        record: true,
        selectedPersonId: null,
        tool: 'pin',
        ottoHint: null,
        lastResult: null,

        open: (puzzle, opts = {}) => {
          const s = get();
          const mode = opts.mode ?? 'case';
          const burnEnabled = opts.burnEnabled ?? mode !== 'zen';
          const record = opts.record ?? !(mode === 'zen' || mode === 'blitz' || mode === 'gauntlet');
          if (!opts.fresh && s.activeId === puzzle.id && s.active) {
            set({ mode, burnEnabled, record });
            return s.active;
          }
          const saved = !opts.fresh && record ? s.progress[puzzle.id]?.inProgress : null;
          const base = freshDesk(puzzle);
          const desk: DeskState = saved
            ? {
                ...base,
                ...saved,
                placements: { ...base.placements, ...saved.placements },
                marks: saved.marks ?? EMPTY_MARKS,
                history: saved.history ?? [],
                ticks: saved.ticks ?? [],
                cleared: saved.cleared ?? [],
                undo: [],
                redo: [],
              }
            : base;
          const first = puzzle.people.find((p) => !p.isVictim && !desk.placements[p.id])?.id
            ?? puzzle.people.find((p) => !desk.placements[p.id])?.id
            ?? puzzle.people[0]?.id
            ?? null;
          set({
            activeId: puzzle.id,
            active: desk,
            mode,
            burnEnabled,
            record,
            selectedPersonId: first,
            tool: 'pin',
            ottoHint: null,
            lastResult: null,
          });
          if (opts.fresh && record) commit(desk);
          return desk;
        },

        select: (personId) => set({ selectedPersonId: personId }),
        setTool: (tool) => set({ tool }),

        tap: (puzzle, cell, opts = {}) => {
          const a = editable();
          if (!a) return 'noop';
          const tool = opts.tool ?? get().tool;
          const sel = get().selectedPersonId;
          const key = cellKey(cell);
          const occupant = personAt(a.placements, cell);
          const blocked = isBlocked(puzzle, cell);

          if (tool === 'erase') {
            const hasMarks = !!a.marks.notes[key]?.length || !!a.marks.crosses[key]?.length;
            if (!occupant && !hasMarks) return 'noop';
            const notes = { ...a.marks.notes };
            const crosses = { ...a.marks.crosses };
            delete notes[key];
            delete crosses[key];
            const placements = occupant ? { ...a.placements, [occupant]: null } : a.placements;
            const history = occupant ? [...a.history, { personId: occupant, cell: null, t: a.elapsedMs }] : a.history;
            commit(edit(a, { placements, marks: { notes, crosses }, history }));
            return 'erased';
          }

          if (tool === 'cross') {
            if (blocked) return 'blocked';
            if (opts.all) {
              const everyone = puzzle.people.map((p) => p.id);
              const list = a.marks.crosses[key] ?? [];
              const allCrossed = everyone.every((id) => list.includes(id));
              const crosses = { ...a.marks.crosses };
              if (allCrossed) delete crosses[key];
              else crosses[key] = everyone;
              commit(edit(a, { marks: { ...a.marks, crosses } }));
              return allCrossed ? 'uncrossed' : 'crossed';
            }
            if (!sel) {
              if (occupant) {
                set({ selectedPersonId: occupant });
                return 'selected';
              }
              return 'need-select';
            }
            const { map, added } = toggleIn(a.marks.crosses, key, sel);
            commit(edit(a, { marks: { ...a.marks, crosses: map } }));
            return added ? 'crossed' : 'uncrossed';
          }

          // pin & pencil: tapping somebody else's pin selects them (never blocks, never overwrites)
          if (occupant && occupant !== sel) {
            set({ selectedPersonId: occupant });
            return 'selected';
          }
          if (blocked) return 'blocked';
          if (!sel) return 'need-select';

          if (tool === 'pencil') {
            if (occupant === sel) return 'noop';
            const { map, added } = toggleIn(a.marks.notes, key, sel);
            commit(edit(a, { marks: { ...a.marks, notes: map }, pencilUsed: true }));
            return added ? 'noted' : 'unnoted';
          }

          // pin
          if (occupant === sel) {
            commit(
              edit(a, {
                placements: { ...a.placements, [sel]: null },
                history: [...a.history, { personId: sel, cell: null, t: a.elapsedMs }],
              }),
            );
            return 'removed';
          }
          const wasPlaced = !!a.placements[sel];
          let crosses = removeFrom(a.marks.crosses, key, sel);
          const notes = removeFrom(a.marks.notes, key, sel);
          if (get().settings.autoCross) {
            const others = puzzle.people.map((p) => p.id).filter((id) => id !== sel);
            for (let i = 0; i < puzzle.cols; i++) {
              const rc = { r: cell.r, c: i };
              if (!isBlocked(puzzle, rc)) crosses = addCrosses(crosses, cellKey(rc), others);
            }
            for (let i = 0; i < puzzle.rows; i++) {
              const cc = { r: i, c: cell.c };
              if (!isBlocked(puzzle, cc)) crosses = addCrosses(crosses, cellKey(cc), others);
            }
          }
          commit(
            edit(a, {
              placements: { ...a.placements, [sel]: { r: cell.r, c: cell.c } },
              marks: { notes, crosses },
              history: [...a.history, { personId: sel, cell: { r: cell.r, c: cell.c }, t: a.elapsedMs }],
            }),
          );
          return wasPlaced ? 'moved' : 'placed';
        },

        longPress: (puzzle, cell) => get().tap(puzzle, cell, { all: true, tool: 'cross' }),

        toggleTick: (clueIndex) => {
          const a = get().active;
          if (!a) return;
          const ticks = a.ticks.includes(clueIndex) ? a.ticks.filter((x) => x !== clueIndex) : [...a.ticks, clueIndex];
          commit({ ...a, ticks });
        },

        toggleCleared: (personId) => {
          const a = get().active;
          if (!a) return;
          const list = a.cleared ?? [];
          const cleared = list.includes(personId) ? list.filter((x) => x !== personId) : [...list, personId];
          commit({ ...a, cleared });
        },

        askOtto: (puzzle) => {
          const a = editable();
          if (!a) return null;
          let d: Deduction | null = null;
          try {
            d = nextDeduction(puzzle, { placements: a.placements, crosses: a.marks.crosses });
          } catch (err) {
            console.warn('[desk] Otto failed', err);
          }
          if (d) commit({ ...a, otto: a.otto + 1 });
          set({ ottoHint: d });
          return d;
        },

        applyOtto: () => {
          const a = editable();
          const d = get().ottoHint;
          if (!a || !d) return false;
          const target = d.cells[0];
          if (d.kind === 'place' && target) {
            const placements = { ...a.placements };
            const squatter = personAt(placements, target);
            if (squatter && squatter !== d.personId) placements[squatter] = null;
            placements[d.personId] = { r: target.r, c: target.c };
            commit(
              edit(a, {
                placements,
                marks: { ...a.marks, crosses: removeFrom(a.marks.crosses, cellKey(target), d.personId) },
                history: [...a.history, { personId: d.personId, cell: target, t: a.elapsedMs }],
              }),
            );
            set({ selectedPersonId: d.personId });
          } else if (d.kind === 'cross') {
            let crosses = a.marks.crosses;
            for (const c of d.cells) crosses = addCrosses(crosses, cellKey(c), [d.personId]);
            commit(edit(a, { marks: { ...a.marks, crosses } }));
          } else if (d.kind === 'mistake') {
            const placements = { ...a.placements };
            const at = placements[d.personId];
            if (at && (!target || sameCell(at, target))) {
              placements[d.personId] = null;
              commit(
                edit(a, { placements, history: [...a.history, { personId: d.personId, cell: null, t: a.elapsedMs }] }),
              );
            }
            set({ selectedPersonId: d.personId });
          }
          set({ ottoHint: null });
          return true;
        },

        dismissOtto: () => set({ ottoHint: null }),

        reveal: (puzzle) => {
          const a = editable();
          if (!a) return null;
          const sel = get().selectedPersonId;
          const ok = (id: string) => sameCell(a.placements[id], puzzle.solution[id]);
          const order = [...(sel ? [sel] : []), ...puzzle.people.map((p) => p.id).filter((id) => id !== sel)];
          const target =
            order.find((id) => !a.placements[id] && puzzle.solution[id]) ??
            order.find((id) => !ok(id) && puzzle.solution[id]);
          if (!target) return null;
          const cell = puzzle.solution[target]!;
          const placements = { ...a.placements };
          const squatter = personAt(placements, cell);
          if (squatter && squatter !== target) placements[squatter] = null;
          placements[target] = { r: cell.r, c: cell.c };
          const next = edit(a, {
            placements,
            marks: { ...a.marks, crosses: removeFrom(a.marks.crosses, cellKey(cell), target) },
            history: [...a.history, { personId: target, cell, t: a.elapsedMs }],
          });
          commit({ ...next, reveals: a.reveals + 1 });
          set({ selectedPersonId: target, ottoHint: null });
          return target;
        },

        undo: () => {
          const a = editable();
          if (!a || !a.undo.length) return false;
          const last = a.undo[a.undo.length - 1]!;
          const redo = [...a.redo, snap(a)].slice(-MAX_UNDO);
          commit({ ...a, placements: last.placements, marks: last.marks, undo: a.undo.slice(0, -1), redo });
          return true;
        },

        redo: () => {
          const a = editable();
          if (!a || !a.redo.length) return false;
          const nextSnap = a.redo[a.redo.length - 1]!;
          commit({ ...a, placements: nextSnap.placements, marks: nextSnap.marks, undo: pushUndo(a), redo: a.redo.slice(0, -1) });
          return true;
        },

        tick: (ms) => {
          const a = get().active;
          if (!a || ms <= 0 || (a.phase !== 'placing' && a.phase !== 'accusing')) return;
          if (typeof document !== 'undefined' && document.hidden) return;
          commit({ ...a, elapsedMs: a.elapsedMs + ms });
        },

        pullLever: (puzzle) => {
          const a = editable();
          if (!a) return { outcome: 'violations', violations: [], missing: [] };
          const missing = puzzle.people.filter((p) => !a.placements[p.id]).map((p) => p.id);
          const res = checkPlacement(puzzle, a.placements);
          if (!missing.length && res.ok) {
            commit({ ...a, phase: 'accusing' });
            set({ ottoHint: null });
            return { outcome: 'accusing', violations: [], missing };
          }
          if (!get().burnEnabled) return { outcome: 'violations', violations: res.violations, missing };
          burn(puzzle, a, { reason: missing.length ? 'incomplete' : 'placement', violations: res.violations, missing });
          set({ ottoHint: null });
          return { outcome: 'burned', violations: res.violations, missing };
        },

        accuse: (puzzle, accusation) => {
          const { active: a, activeId, progress, burnEnabled, record, mode } = get();
          const miss: AccuseResult = {
            correct: false, burned: false, stars: 0, timeMs: a?.elapsedMs ?? 0, newBest: false, reward: null,
          };
          if (!a || !activeId || a.phase !== 'accusing') return miss;
          if (!checkAccusation(puzzle, accusation)) {
            if (!burnEnabled) return miss;
            burn(puzzle, { ...a, accusation }, { reason: 'accusation', violations: [], missing: [] });
            return { ...miss, burned: true };
          }
          const timeMs = a.elapsedMs;
          const stars = starsFor(timeMs, a.otto, a.reveals, puzzle.parSeconds);
          const prev = progress[activeId];
          const newBest = record && (prev?.bestTimeMs === undefined || timeMs < prev.bestTimeMs);
          const bestTimeMs = newBest ? timeMs : prev?.bestTimeMs;
          const solved: DeskState = { ...a, phase: 'solved', accusation, undo: [], redo: [] };
          commit(solved, (p) => ({
            ...p,
            solved: true,
            stars: Math.max(p.stars, stars) as 0 | 1 | 2 | 3,
            bestTimeMs,
            attempts: p.attempts + 1,
            lastOutcome: 'solved',
          }));
          if (mode === 'weekly') {
            const week = puzzle.id;
            set((s) => {
              const best = s.records.weeklyBest[week];
              if (best !== undefined && best <= timeMs) return {};
              return { records: { ...s.records, weeklyBest: { ...s.records.weeklyBest, [week]: timeMs } } };
            });
          }
          let reward: RecordOutcome | null = null;
          try {
            reward = recordSolve({
              puzzleId: puzzle.id,
              district: puzzle.seasonId,
              tier: puzzle.tier,
              variant: variantOf(puzzle),
              mode,
              size: puzzle.rows,
              timeMs,
              parSeconds: puzzle.parSeconds,
              stars: mode === 'zen' ? 0 : stars,
              otto: a.otto,
              reveals: a.reveals,
              pencilUsed: a.pencilUsed === true,
              firstSolve: !prev?.solved,
              at: Date.now(),
            });
          } catch (err) {
            console.warn('[desk] recordSolve failed', err);
          }
          const result: AccuseResult = { correct: true, burned: false, stars, timeMs, newBest, bestTimeMs, reward };
          set({ lastResult: result });
          return result;
        },

        reopen: (puzzleId, puzzle) => {
          set((s) => {
            const prev = s.progress[puzzleId];
            const progress = prev ? { ...s.progress, [puzzleId]: { ...prev, inProgress: null } } : s.progress;
            if (s.activeId !== puzzleId) return { progress };
            const desk = freshDesk(puzzle);
            const first = puzzle?.people.find((p) => !p.isVictim)?.id ?? puzzle?.people[0]?.id ?? null;
            return { progress, active: desk, selectedPersonId: first, tool: 'pin' as DeskTool, ottoHint: null, lastResult: null };
          });
        },

        markVariantSeen: (v) =>
          set((s) => (s.seenVariants.includes(v) ? {} : { seenVariants: [...s.seenVariants, v] })),

        setSetting: (key, value) => {
          if (key === 'sound') setDeskSound(Boolean(value));
          set((s) => ({ settings: { ...s.settings, [key]: value } }));
        },

        recordBlitz: (score) => {
          const best = get().records.blitzBest;
          set((s) => ({ records: { ...s.records, blitzRuns: s.records.blitzRuns + 1, blitzBest: Math.max(best, score) } }));
          let outcome: RecordOutcome | null = null;
          try {
            outcome = metaRecordBlitz(score);
          } catch (err) {
            console.warn('[desk] recordBlitz failed', err);
          }
          return { newBest: score > best, outcome };
        },

        recordGauntlet: (stage) => {
          const best = get().records.gauntletBest;
          set((s) => ({
            records: { ...s.records, gauntletRuns: s.records.gauntletRuns + 1, gauntletBest: Math.max(best, stage) },
          }));
          let outcome: RecordOutcome | null = null;
          try {
            outcome = metaRecordGauntlet(stage);
          } catch (err) {
            console.warn('[desk] recordGauntlet failed', err);
          }
          return { newBest: stage > best, outcome };
        },

        recordZen: () => set((s) => ({ records: { ...s.records, zenSolved: s.records.zenSolved + 1 } })),

        caseStatus: (puzzleId) => statusOf(get().progress[puzzleId]),
        tierProgress: (districtId, tier) => countTier(get().progress, districtId, tier),
        districtProgress: (districtId) => countDistrict(get().progress, districtId),
      };
    },
    {
      name: 'floorplan-v2',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        progress: Object.fromEntries(
          Object.entries(s.progress).map(([k, v]) => [k, v.inProgress ? { ...v, inProgress: slimDesk(v.inProgress) } : v]),
        ),
        settings: s.settings,
        seenVariants: s.seenVariants,
        records: s.records,
        migratedV1: s.migratedV1,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FloorplanState>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          records: { ...DEFAULT_RECORDS, ...(p.records ?? {}) },
          seenVariants: p.seenVariants ?? [],
          progress: p.progress ?? {},
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        setDeskSound(state.settings.sound);
        if (state.migratedV1 || typeof localStorage === 'undefined') return;
        let legacy: string | null = null;
        try {
          legacy = localStorage.getItem('crime-files-v1');
        } catch {
          legacy = null;
        }
        const migrated = migrateLegacyProgress(legacy);
        useFloorplan.setState((s) => ({
          migratedV1: true,
          progress: { ...migrated, ...s.progress },
        }));
      },
    },
  ),
);

// ─────────────────────────── selectors & hooks ───────────────────────────

/** Status of a case by id. */
export function caseStatus(puzzleId: string): CaseStatus {
  return statusOf(useFloorplan.getState().progress[puzzleId]);
}

/** Solved/total for a district tier. */
export function tierProgress(districtId: string, tier: Tier): ProgressCount {
  return countTier(useFloorplan.getState().progress, districtId, tier);
}

export function districtProgress(districtId: string): ProgressCount {
  return countDistrict(useFloorplan.getState().progress, districtId);
}

/** Reactive hooks (re-render when progress changes). */
export function useCaseStatus(puzzleId: string): CaseStatus {
  return useFloorplan((s) => statusOf(s.progress[puzzleId]));
}
export function useCaseProgress(puzzleId: string): CaseProgress | undefined {
  return useFloorplan((s) => s.progress[puzzleId]);
}
export function useDistrictTierProgress(districtId: string, tier: Tier): ProgressCount {
  const progress = useFloorplan((s) => s.progress);
  return countTier(progress, districtId, tier);
}
export function useDistrictProgress(districtId: string): ProgressCount {
  const progress = useFloorplan((s) => s.progress);
  return countDistrict(progress, districtId);
}
/** Totals across all eight districts. */
export function useBureauProgress(): ProgressCount {
  const progress = useFloorplan((s) => s.progress);
  return DISTRICTS.reduce<ProgressCount>(
    (a, d) => {
      const p = countDistrict(progress, d.id);
      return {
        solved: a.solved + p.solved,
        total: a.total + p.total,
        stars: a.stars + p.stars,
        inProgress: a.inProgress + p.inProgress,
        burned: a.burned + p.burned,
      };
    },
    { solved: 0, total: 0, stars: 0, inProgress: 0, burned: 0 },
  );
}


// Game state + the "director" that sequences rolls, moves and animations.
import { create } from 'zustand';
import {
  applyMove, destinationsFrom, hasWon, initialPosition, legalMoves, OFF, other, removeDie,
  winKind, winPoints, type Destination, type Move, type Player, type Position, type WinKind,
} from '../engine/rules';
import { checkersFromPosition, moveCheckers, type Checker } from '../engine/checkers';
import { simulateThrow, type ThrowRecording } from '../physics/dice';
import type { AiLevel } from '../engine/ai';
import { think } from '../engine/aiClient';
import { checkerRest, type Vec3 } from '../scene/layout';
import { flightTime, motionBus } from '../scene/motion';
import { fxBus } from '../scene/fx';
import { sound } from '../audio/sound';
import type { ThemeId } from '../textures/themes';
import { fa } from '../ui/fa';

export interface Settings {
  theme: ThemeId;
  volume: number;
  muted: boolean;
  quality: 'high' | 'low';
  rotateBoard: boolean;
  autoRoll: boolean;
  autoEnd: boolean;
  showPips: boolean;
}

export interface DiceView {
  id: number;
  rec: ThrowRecording | null; // null = place directly at rest (resumed game)
  values: number[];
  skins: Player[];
  lanes: Player[]; // which half each die rests in
  gone: boolean;
}

export interface GameResult {
  winner: Player;
  kind: WinKind;
  points: number;
  matchOver: boolean;
}

export interface Toast {
  id: number;
  text: string;
  sub?: string;
  tone: 'info' | 'hit' | 'warn' | 'gold';
}

export type Screen = 'loading' | 'menu' | 'game';
export type GameMode = 'pvp' | 'ai';
/** The computer always plays the second color (top of the board). */
export const AI_PLAYER: Player = 1;
export type Phase = 'opening' | 'rolling' | 'roll' | 'move' | 'done' | 'gameover';

interface Snapshot {
  pos: Position;
  checkers: Checker[];
  remaining: number[];
  moves: Move[];
}

export interface GameState {
  screen: Screen;
  settings: Settings;
  players: [string, string];
  matchLength: number;
  score: [number, number];
  gameNo: number;

  pos: Position;
  checkers: Checker[];
  turn: Player;
  phase: Phase;
  rolled: number[];
  remaining: number[];
  legal: Move[];
  history: Snapshot[];
  turnMoves: Move[];
  selected: number | null;
  /** true when the current selection was made automatically (only one movable stack). */
  autoSelected: boolean;
  dests: Destination[];
  busy: boolean;
  dice: DiceView | null;
  result: GameResult | null;
  toast: Toast | null;
  menuOpen: boolean;
  hasSave: boolean;
  mode: GameMode;
  aiLevel: AiLevel;
  aiThinking: boolean;

  setScreen(s: Screen): void;
  intro(): void;
  updateSettings(p: Partial<Settings>): void;
  setMenuOpen(v: boolean): void;
  newMatch(players: [string, string], matchLength: number, mode: GameMode, aiLevel: AiLevel): void;
  resume(): void;
  nextGame(): void;
  rollOpening(): void;
  roll(): void;
  select(loc: number | null): void;
  moveTo(to: number, fromDrag?: boolean): Promise<void>;
  quickMove(loc: number): void;
  undo(): void;
  endTurn(): void;
  showToast(text: string, tone?: Toast['tone'], sub?: string): void;
}

const SETTINGS_KEY = 'nard.settings.v1';
const SAVE_KEY = 'nard.save.v1';
const PLAYERS_KEY = 'nard.players.v1';

const defaultSettings: Settings = {
  theme: 'khatam',
  volume: 0.8,
  muted: false,
  quality: 'high',
  rotateBoard: false,
  autoRoll: false,
  autoEnd: false,
  showPips: true,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return fallback;
}
function loadRaw<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function persist(key: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

interface SaveData {
  players: [string, string];
  matchLength: number;
  score: [number, number];
  gameNo: number;
  pos: Position;
  checkers: Checker[];
  turn: Player;
  phase: 'opening' | 'roll' | 'move';
  rolled: number[];
  diceSkins: Player[];
  mode?: GameMode;
  aiLevel?: AiLevel;
}

/** Dev-only: queued dice values for testing. */
const forcedDice: number[] = [];

const rollDie = () => {
  if (forcedDice.length) return forcedDice.shift()!;
  const a = new Uint32Array(1);
  // rejection sampling for an unbiased 1..6
  for (;;) {
    crypto.getRandomValues(a);
    if (a[0] < 4294967292) return (a[0] % 6) + 1;
  }
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Bumped on every new game; async sequences bail out when it changes. */
let epoch = 0;
let diceId = 0;
let toastId = 0;

/** Checkers parked in the off-trays, used as the "box" the pieces are set up from. */
function boxedCheckers(): Checker[] {
  const base = checkersFromPosition(initialPosition());
  const counters = [0, 0];
  return base.map((c) => ({ ...c, loc: OFF, slot: counters[c.owner]++ }));
}

function diceForRemaining(rolled: number[]) {
  return rolled[0] === rolled[1] ? [rolled[0], rolled[0], rolled[0], rolled[0]] : [rolled[0], rolled[1]];
}

const settings0 = load(SETTINGS_KEY, defaultSettings);
sound.enabled = !settings0.muted;
sound.setVolume(settings0.volume);

export const useGame = create<GameState>((set, get) => {
  const obstacles = (): Vec3[] =>
    get()
      .checkers.filter((c) => c.loc < 24)
      .map((c) => checkerRest(c.owner, c.loc, c.slot).pos);

  const restOf = (c: Checker) => checkerRest(c.owner, c.loc, c.slot).pos;

  const save = () => {
    const s = get();
    if (s.screen !== 'game' || s.phase === 'gameover') return;
    const atTurnStart = s.history[0];
    const data: SaveData = {
      players: s.players,
      matchLength: s.matchLength,
      score: s.score,
      gameNo: s.gameNo,
      pos: atTurnStart ? atTurnStart.pos : s.pos,
      checkers: atTurnStart ? atTurnStart.checkers : s.checkers,
      turn: s.turn,
      phase: s.phase === 'move' || s.phase === 'done' ? 'move' : s.phase === 'opening' ? 'opening' : 'roll',
      rolled: s.rolled,
      diceSkins: s.dice?.skins ?? [s.turn, s.turn],
      mode: s.mode,
      aiLevel: s.aiLevel,
    };
    persist(SAVE_KEY, data);
    set({ hasSave: true });
  };

  /** Sets up the board with a staggered fly-in from wherever the checkers are. */
  const setupBoard = (from: Checker[]) => {
    const target = checkersFromPosition(initialPosition());
    const fromById = new Map(from.map((c) => [c.id, c]));
    // order by destination so stacks fill bottom-up, alternating players for a lively setup
    const order = [...target].sort((a, b) => a.slot - b.slot || a.loc - b.loc || a.owner - b.owner);
    let n = 0;
    order.forEach((c) => {
      const src = fromById.get(c.id);
      if (src && src.loc === c.loc && src.slot === c.slot) return;
      const i = n++;
      const d = src ? flightTime(restOf(src), restOf(c), 'reset') : 0.4;
      const delay = 0.25 + i * 0.045;
      motionBus.hints.set(c.id, { kind: 'reset', delay, duration: d });
      sound.checker(delay + d, 0.55);
    });
    return target;
  };

  const lockedTo = (e: number) => e === epoch;
  const aiTurn = () => isAiTurn(get());

  const autoSelect = () => {
    const s = get();
    if (isAiTurn(s)) return;
    const sources = new Set(s.legal.map((m) => m.from));
    if (sources.size === 1) {
      const [only] = sources;
      set({ selected: only, autoSelected: true, dests: destinationsFrom(s.pos, s.turn, s.remaining, only) });
    }
  };

  const beginMoves = async (rolled: number[], e: number) => {
    const s = get();
    const remaining = diceForRemaining(rolled);
    const legal = legalMoves(s.pos, s.turn, remaining);
    set({ rolled, remaining, legal, history: [], turnMoves: [], phase: 'move', busy: false, selected: null, dests: [] });
    save();
    if (legal.length === 0) {
      set({ busy: true, phase: 'done' });
      get().showToast('حرکتی ممکن نیست', 'warn', `${get().players[s.turn]} باید نوبت را واگذار کند`);
      sound.error();
      await wait(1900);
      if (!lockedTo(e)) return;
      set({ busy: false });
      get().endTurn();
      return;
    }
    if (aiTurn()) void runAi(e);
    else autoSelect();
  };

  const performMove = async (m: Move, kind: 'move' | 'drop', e: number) => {
    const s = get();
    const p = s.turn;
    const snapshot: Snapshot = { pos: s.pos, checkers: s.checkers, remaining: s.remaining, moves: s.turnMoves };
    const { list, step } = moveCheckers(s.checkers, p, m);
    const before = s.checkers.find((c) => c.id === step.moverId)!;
    const after = list.find((c) => c.id === step.moverId)!;
    const fromPos = kind === 'drop' && motionBus.drag ? motionBus.drag.pos : restOf(before);
    motionBus.drag = null;
    const toPos = restOf(after);
    const dur = flightTime(fromPos, toPos, kind);
    motionBus.hints.set(step.moverId, { kind: m.to === OFF ? 'bearoff' : kind, delay: 0, duration: dur });

    if (m.to === OFF) {
      sound.bearOff(dur * 0.55);
      fxBus.push('bearoff', toPos, dur);
    } else if (after.slot > 0) {
      sound.stack(dur);
      fxBus.push('land', toPos, dur);
    } else {
      sound.checker(dur);
      fxBus.push('land', toPos, dur);
    }

    if (step.hitId !== null) {
      const victimBefore = s.checkers.find((c) => c.id === step.hitId)!;
      const victimAfter = list.find((c) => c.id === step.hitId)!;
      const hd = flightTime(restOf(victimBefore), restOf(victimAfter), 'hit');
      motionBus.hints.set(step.hitId, { kind: 'hit', delay: dur * 0.82, duration: hd });
      sound.hit(dur * 0.85);
      fxBus.push('hit', toPos, dur * 0.85);
      setTimeout(() => {
        if (lockedTo(e)) get().showToast('زد!', 'hit');
        if ('vibrate' in navigator) navigator.vibrate?.(40);
      }, dur * 850);
    }

    set({
      pos: applyMove(s.pos, p, m),
      checkers: list,
      remaining: removeDie(s.remaining, m.die),
      history: [...s.history, snapshot],
      turnMoves: [...s.turnMoves, m],
    });
    await wait(dur * 1000 + (m.hit ? 90 : 30));
  };

  const finishGame = () => {
    const s = get();
    const kind = winKind(s.pos, s.turn);
    const points = winPoints[kind];
    const score: [number, number] = [s.score[0], s.score[1]];
    score[s.turn] += points;
    const matchOver = score[s.turn] >= s.matchLength;
    set({
      phase: 'gameover',
      busy: false,
      score,
      selected: null,
      dests: [],
      legal: [],
      result: { winner: s.turn, kind, points, matchOver },
    });
    if (matchOver) persist(SAVE_KEY, null);
    set({ hasSave: !matchOver });
    if (!matchOver) {
      // Save the score so a refresh resumes at the next game.
      const data: SaveData = {
        players: s.players,
        matchLength: s.matchLength,
        score,
        gameNo: s.gameNo + 1,
        pos: initialPosition(),
        checkers: checkersFromPosition(initialPosition()),
        turn: 0,
        phase: 'opening',
        rolled: [],
        diceSkins: [0, 1],
        mode: s.mode,
        aiLevel: s.aiLevel,
      };
      persist(SAVE_KEY, data);
    }
    setTimeout(() => sound.win(), 350);
  };

  const afterMove = async (e: number) => {
    const s = get();
    if (hasWon(s.pos, s.turn)) {
      await wait(250);
      if (lockedTo(e)) finishGame();
      return;
    }
    const legal = legalMoves(s.pos, s.turn, s.remaining);
    if (s.remaining.length === 0 || legal.length === 0) {
      set({ phase: 'done', legal: [], busy: false, selected: null, dests: [] });
      if (s.settings.autoEnd && !aiTurn()) {
        const marker = get().history.length;
        await wait(650);
        const n = get();
        if (lockedTo(e) && n.phase === 'done' && n.history.length === marker && !n.busy) n.endTurn();
      }
    } else {
      set({ legal, busy: false, phase: 'move' });
      autoSelect();
    }
  };

  /** The computer's turn: think in the worker, then play each move with the same animations a person gets. */
  const runAi = async (e: number) => {
    const s = get();
    set({ aiThinking: true });
    const started = performance.now();
    const moves = await think(s.pos, s.turn, s.remaining, s.aiLevel);
    const minThink = s.aiLevel === 'hard' ? 750 : 550;
    const left = minThink - (performance.now() - started);
    if (left > 0) await wait(left);
    if (!lockedTo(e)) return;
    set({ aiThinking: false });
    for (const m of moves) {
      if (!lockedTo(e) || get().phase !== 'move') return;
      // lift the checker briefly, like a hand picking it up
      set({ selected: m.from, autoSelected: false, dests: [{ to: m.to, path: [m] }] });
      sound.pickup();
      await wait(280);
      if (!lockedTo(e)) return;
      await get().moveTo(m.to);
      await wait(120);
    }
    if (!lockedTo(e)) return;
    if (get().phase === 'done') {
      await wait(450);
      if (lockedTo(e)) get().endTurn();
    }
  };

  const throwDice = async (specs: { value: number; half: Player; from: Player }[], skins: Player[]) => {
    sound.shake();
    await wait(170);
    const rec = simulateThrow(specs, obstacles());
    set({
      dice: { id: ++diceId, rec, values: specs.map((d) => d.value), skins, lanes: specs.map((d) => d.half), gone: false },
    });
    return rec;
  };

  const startFresh = (
    players: [string, string],
    matchLength: number,
    score: [number, number],
    gameNo: number,
    from: Checker[],
    mode: GameMode,
    aiLevel: AiLevel,
  ) => {
    epoch++;
    motionBus.drag = null;
    const checkers = setupBoard(from);
    set({
      screen: 'game',
      players,
      matchLength,
      score,
      gameNo,
      pos: initialPosition(),
      checkers,
      turn: 0,
      phase: 'opening',
      rolled: [],
      remaining: [],
      legal: [],
      history: [],
      turnMoves: [],
      selected: null,
      dests: [],
      busy: true,
      dice: null,
      result: null,
      menuOpen: false,
      mode,
      aiLevel,
      aiThinking: false,
    });
    const e = epoch;
    setTimeout(() => {
      if (lockedTo(e)) {
        set({ busy: false });
        save();
      }
    }, 1900);
  };

  return {
    screen: 'loading',
    settings: settings0,
    players: load(PLAYERS_KEY, { names: ['بازیکن ۱', 'بازیکن ۲'] as [string, string] }).names,
    matchLength: 3,
    score: [0, 0],
    gameNo: 1,
    pos: initialPosition(),
    checkers: boxedCheckers(),
    turn: 0,
    phase: 'opening',
    rolled: [],
    remaining: [],
    legal: [],
    history: [],
    turnMoves: [],
    selected: null,
    autoSelected: false,
    dests: [],
    busy: false,
    dice: null,
    result: null,
    toast: null,
    menuOpen: false,
    hasSave: !!loadRaw<SaveData>(SAVE_KEY),
    mode: 'pvp',
    aiLevel: 'medium',
    aiThinking: false,

    setScreen: (screen) => set({ screen }),

    intro: () => set({ screen: 'menu', checkers: setupBoard(get().checkers), pos: initialPosition() }),

    updateSettings: (p) => {
      const settings = { ...get().settings, ...p };
      set({ settings });
      persist(SETTINGS_KEY, settings);
      sound.enabled = !settings.muted;
      sound.setVolume(settings.volume);
    },

    setMenuOpen: (menuOpen) => set({ menuOpen }),

    newMatch: (players, matchLength, mode, aiLevel) => {
      startFresh(players, matchLength, [0, 0], 1, get().checkers, mode, aiLevel);
    },

    resume: () => {
      const data = loadRaw<SaveData>(SAVE_KEY);
      if (!data) return;
      epoch++;
      const e = epoch;
      // fly the pieces from the box to where they were
      const fromById = new Map(get().checkers.map((c) => [c.id, c]));
      data.checkers.forEach((c, i) => {
        const src = fromById.get(c.id);
        const d = src ? flightTime(restOf(src), restOf(c), 'reset') : 0.4;
        motionBus.hints.set(c.id, { kind: 'reset', delay: 0.2 + i * 0.035, duration: d });
        sound.checker(0.2 + i * 0.035 + d, 0.5);
      });
      const inMove = data.phase === 'move' && data.rolled.length === 2;
      set({
        screen: 'game',
        players: data.players,
        matchLength: data.matchLength,
        score: data.score,
        gameNo: data.gameNo,
        pos: data.pos,
        checkers: data.checkers,
        turn: data.turn,
        phase: inMove ? 'move' : data.phase === 'opening' ? 'opening' : 'roll',
        rolled: inMove ? data.rolled : [],
        remaining: [],
        legal: [],
        history: [],
        turnMoves: [],
        selected: null,
        dests: [],
        busy: true,
        dice: inMove
          ? { id: ++diceId, rec: null, values: data.rolled, skins: data.diceSkins, lanes: [data.turn, data.turn], gone: false }
          : null,
        result: null,
        menuOpen: false,
        mode: data.mode ?? 'pvp',
        aiLevel: data.aiLevel ?? 'medium',
        aiThinking: false,
      });
      setTimeout(() => {
        if (!lockedTo(e)) return;
        if (inMove) void beginMoves(data.rolled, e);
        else {
          set({ busy: false });
          if (get().phase === 'roll' && aiTurn()) get().roll();
        }
      }, 1700);
    },

    nextGame: () => {
      const s = get();
      if (!s.result) return;
      if (s.result.matchOver) {
        startFresh(s.players, s.matchLength, [0, 0], 1, s.checkers, s.mode, s.aiLevel);
      } else {
        startFresh(s.players, s.matchLength, s.score, s.gameNo + 1, s.checkers, s.mode, s.aiLevel);
      }
    },

    rollOpening: async () => {
      const s = get();
      if (s.phase !== 'opening' || s.busy) return;
      const e = epoch;
      set({ busy: true, phase: 'rolling' });
      sound.unlock();
      for (;;) {
        const a = rollDie();
        const b = rollDie();
        const rec = await throwDice([{ value: a, half: 0, from: 0 }, { value: b, half: 1, from: 1 }], [0, 1]);
        await wait(rec.duration * 1000 + 450);
        if (!lockedTo(e)) return;
        if (a === b) {
          get().showToast('مساوی!', 'info', 'دوباره پرتاب می‌شود');
          await wait(1300);
          if (!lockedTo(e)) return;
          set((st) => ({ dice: st.dice && { ...st.dice, gone: true } }));
          await wait(350);
          if (!lockedTo(e)) return;
          continue;
        }
        const w: Player = a > b ? 0 : 1;
        const name = get().players[w];
        get().showToast(`${name} شروع می‌کند`, 'gold', `${fa(Math.max(a, b))} در برابر ${fa(Math.min(a, b))}`);
        set((st) => ({ turn: w, dice: st.dice && { ...st.dice, lanes: [w, w] } }));
        await wait(700);
        if (!lockedTo(e)) return;
        await beginMoves([a, b], e);
        return;
      }
    },

    roll: async () => {
      const s = get();
      if (s.phase !== 'roll' || s.busy) return;
      const e = epoch;
      set({ busy: true, phase: 'rolling', selected: null, dests: [] });
      sound.unlock();
      const a = rollDie();
      const b = rollDie();
      const rec = await throwDice(
        [{ value: a, half: s.turn, from: s.turn }, { value: b, half: s.turn, from: s.turn }],
        [s.turn, s.turn],
      );
      await wait(rec.duration * 1000 + 300);
      if (!lockedTo(e)) return;
      if (a === b) get().showToast(`جفت ${fa(a)}`, 'gold');
      await beginMoves([a, b], e);
    },

    select: (loc) => {
      const s = get();
      if (s.phase !== 'move' || s.busy) return;
      if (loc === null || loc === s.selected) {
        set({ selected: null, autoSelected: false, dests: [] });
        return;
      }
      if (!s.legal.some((m) => m.from === loc)) {
        set({ selected: null, dests: [] });
        return;
      }
      sound.pickup();
      set({ selected: loc, autoSelected: false, dests: destinationsFrom(s.pos, s.turn, s.remaining, loc) });
    },

    moveTo: async (to, fromDrag = false) => {
      const s = get();
      if (s.phase !== 'move' || s.busy || s.selected === null) return;
      const d = s.dests.find((x) => x.to === to);
      if (!d) return;
      const e = epoch;
      set({ busy: true, selected: null, dests: [] });
      for (let i = 0; i < d.path.length; i++) {
        await performMove(d.path[i], i === 0 && fromDrag ? 'drop' : 'move', e);
        if (!lockedTo(e)) return;
      }
      await afterMove(e);
    },

    quickMove: async (loc) => {
      const s = get();
      if (s.phase !== 'move' || s.busy) return;
      const moves = s.legal.filter((m) => m.from === loc).sort((a, b) => b.die - a.die);
      if (!moves.length) return;
      set({ selected: loc, dests: destinationsFrom(s.pos, s.turn, s.remaining, loc) });
      get().moveTo(moves[0].to);
    },

    undo: () => {
      const s = get();
      if (s.busy || isAiTurn(s) || (s.phase !== 'move' && s.phase !== 'done') || s.history.length === 0) return;
      const snap = s.history[s.history.length - 1];
      const cur = new Map(s.checkers.map((c) => [c.id, c]));
      for (const c of snap.checkers) {
        const was = cur.get(c.id)!;
        if (was.loc !== c.loc || was.slot !== c.slot) {
          const d = flightTime(restOf(was), restOf(c), 'undo');
          motionBus.hints.set(c.id, { kind: 'undo', delay: 0, duration: d });
          sound.checker(d, 0.7);
        }
      }
      const legal = legalMoves(snap.pos, s.turn, snap.remaining);
      set({
        pos: snap.pos,
        checkers: snap.checkers,
        remaining: snap.remaining,
        turnMoves: snap.moves,
        history: s.history.slice(0, -1),
        legal,
        phase: 'move',
        selected: null,
        dests: [],
      });
      autoSelect();
    },

    endTurn: async () => {
      const s = get();
      if (s.busy || s.phase !== 'done') return;
      const e = epoch;
      set({
        dice: s.dice && { ...s.dice, gone: true },
        turn: other(s.turn),
        phase: 'roll',
        history: [],
        turnMoves: [],
        remaining: [],
        legal: [],
        rolled: [],
        selected: null,
        dests: [],
      });
      save();
      sound.chime();
      if (aiTurn()) {
        await wait(750);
        if (lockedTo(e) && get().phase === 'roll') get().roll();
      } else if (get().settings.autoRoll) {
        await wait(700);
        if (lockedTo(e) && get().phase === 'roll') get().roll();
      }
    },

    showToast: (text, tone = 'info', sub) => set({ toast: { id: ++toastId, text, sub, tone } }),
  };
});

/** True while the computer is the player to act (input is locked for the human). */
export const isAiTurn = (s: Pick<GameState, 'mode' | 'turn' | 'phase'>) =>
  s.mode === 'ai' && s.turn === AI_PLAYER && s.phase !== 'opening' && s.phase !== 'gameover';

if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>;
  w.__game = useGame;
  w.__dice = (...v: number[]) => forcedDice.push(...v);
  w.__setup = (pos: Position, turn: Player) =>
    useGame.setState({
      screen: 'game', pos, checkers: checkersFromPosition(pos), turn, phase: 'roll', busy: false,
      dice: null, result: null, history: [], rolled: [], remaining: [], legal: [], selected: null, dests: [],
    });
}

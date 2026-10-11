// Pure backgammon rules. No React, no three.js.
//
// Absolute indexing: points[0..23] — index i is "point i+1" from White's view.
// White (player 0) moves high → low and bears off below index 0.
// Black (player 1) moves low → high and bears off above index 23.
// points[i] > 0 → White checkers, < 0 → Black checkers.

export type Player = 0 | 1;
export const WHITE: Player = 0;
export const BLACK: Player = 1;

export const BAR = 24; // Move.from sentinel
export const OFF = 25; // Move.to sentinel
export const CHECKERS_PER_PLAYER = 15;

export interface Position {
  points: number[];
  bar: [number, number];
  off: [number, number];
}

export interface Move {
  from: number; // 0..23 | BAR
  to: number; // 0..23 | OFF
  die: number;
  hit: boolean;
}

export const other = (p: Player): Player => (p === 0 ? 1 : 0);

export function initialPosition(): Position {
  const points = new Array(24).fill(0);
  points[23] = 2;
  points[12] = 5;
  points[7] = 3;
  points[5] = 5;
  points[0] = -2;
  points[11] = -5;
  points[16] = -3;
  points[18] = -5;
  return { points, bar: [0, 0], off: [0, 0] };
}

export const clonePosition = (p: Position): Position => ({
  points: p.points.slice(),
  bar: [p.bar[0], p.bar[1]],
  off: [p.off[0], p.off[1]],
});

/** Number of player p's checkers on absolute index i. */
export const ownAt = (pos: Position, p: Player, i: number): number => {
  const v = pos.points[i];
  return p === 0 ? (v > 0 ? v : 0) : v < 0 ? -v : 0;
};

/** Relative index: 0 = the player's own 1-point, 23 = their 24-point. Self-inverse. */
export const rel = (p: Player, i: number): number => (p === 0 ? i : 23 - i);

const isHome = (p: Player, i: number) => rel(p, i) < 6;

/** Absolute landing index when moving from absolute index (or BAR) with a die. May be out of range (bear-off). */
function target(p: Player, from: number, die: number): number {
  if (from === BAR) return p === 0 ? 24 - die : die - 1;
  return p === 0 ? from - die : from + die;
}

function allHome(pos: Position, p: Player): boolean {
  if (pos.bar[p] > 0) return false;
  for (let i = 0; i < 24; i++) if (ownAt(pos, p, i) > 0 && !isHome(p, i)) return false;
  return true;
}

/** Every single-checker move for one die value. */
export function singleMoves(pos: Position, p: Player, die: number): Move[] {
  const out: Move[] = [];
  const o = other(p);
  const tryLand = (from: number, to: number) => {
    const opp = ownAt(pos, o, to);
    if (opp >= 2) return;
    out.push({ from, to, die, hit: opp === 1 });
  };

  if (pos.bar[p] > 0) {
    tryLand(BAR, target(p, BAR, die));
    return out;
  }

  const canBearOff = allHome(pos, p);
  for (let i = 0; i < 24; i++) {
    if (ownAt(pos, p, i) === 0) continue;
    const t = target(p, i, die);
    if (t >= 0 && t <= 23) {
      tryLand(i, t);
    } else if (canBearOff) {
      const r = rel(p, i);
      if (r + 1 === die) {
        out.push({ from: i, to: OFF, die, hit: false });
      } else {
        // Over-sized die: only allowed from the furthest checker.
        let furthest = true;
        for (let rr = r + 1; rr < 6; rr++) {
          if (ownAt(pos, p, rel(p, rr)) > 0) {
            furthest = false;
            break;
          }
        }
        if (furthest) out.push({ from: i, to: OFF, die, hit: false });
      }
    }
  }
  return out;
}

export function applyMove(pos: Position, p: Player, m: Move): Position {
  const n = clonePosition(pos);
  const sign = p === 0 ? 1 : -1;
  if (m.from === BAR) n.bar[p]--;
  else n.points[m.from] -= sign;

  if (m.to === OFF) {
    n.off[p]++;
  } else {
    if (m.hit) {
      n.points[m.to] += sign; // remove the single opposing checker
      n.bar[other(p)]++;
    }
    n.points[m.to] += sign;
  }
  return n;
}

const removeOne = (dice: number[], d: number): number[] => {
  const i = dice.indexOf(d);
  return i < 0 ? dice : [...dice.slice(0, i), ...dice.slice(i + 1)];
};

/** Maximum number of dice that can be played from here (early-exits once it hits dice.length). */
export function maxPlayable(pos: Position, p: Player, dice: number[]): number {
  if (dice.length === 0) return 0;
  let best = 0;
  const tried = new Set<number>();
  for (const d of dice) {
    if (tried.has(d)) continue;
    tried.add(d);
    const rest = removeOne(dice, d);
    for (const m of singleMoves(pos, p, d)) {
      const v = 1 + maxPlayable(applyMove(pos, p, m), p, rest);
      if (v > best) best = v;
      if (best === dice.length) return best;
    }
  }
  return best;
}

/**
 * Moves that may be played right now given the dice still unused, honoring:
 *  - the maximum number of dice must be played,
 *  - if only one of two different dice can be played, it must be the larger one.
 */
export function legalMoves(pos: Position, p: Player, remaining: number[]): Move[] {
  const need = maxPlayable(pos, p, remaining);
  if (need === 0) return [];
  const out: Move[] = [];
  const tried = new Set<number>();
  for (const d of remaining) {
    if (tried.has(d)) continue;
    tried.add(d);
    const rest = removeOne(remaining, d);
    for (const m of singleMoves(pos, p, d)) {
      if (need === 1 || 1 + maxPlayable(applyMove(pos, p, m), p, rest) === need) out.push(m);
    }
  }
  if (need === 1 && remaining.length === 2 && remaining[0] !== remaining[1]) {
    const hi = Math.max(remaining[0], remaining[1]);
    if (out.some((m) => m.die === hi)) return out.filter((m) => m.die === hi);
  }
  return out;
}

export interface Destination {
  to: number;
  path: Move[]; // one or more moves of the same checker
}

/**
 * Every place the checker at `from` can reach this turn — directly or by chaining several dice
 * with the same checker. Shorter paths win; among equals the first found (larger die first).
 */
export function destinationsFrom(pos: Position, p: Player, remaining: number[], from: number): Destination[] {
  const found = new Map<number, Destination>();
  const walk = (cur: Position, dice: number[], at: number, path: Move[]) => {
    const moves = legalMoves(cur, p, dice)
      .filter((m) => m.from === at)
      .sort((a, b) => b.die - a.die);
    for (const m of moves) {
      const np = [...path, m];
      const known = found.get(m.to);
      if (!known || known.path.length > np.length) found.set(m.to, { to: m.to, path: np });
      if (m.to !== OFF) walk(applyMove(cur, p, m), removeOne(dice, m.die), m.to, np);
    }
  };
  walk(pos, remaining, from, []);
  return [...found.values()];
}

export function pipCount(pos: Position, p: Player): number {
  let s = pos.bar[p] * 25;
  for (let i = 0; i < 24; i++) s += ownAt(pos, p, i) * (rel(p, i) + 1);
  return s;
}

export const hasWon = (pos: Position, p: Player) => pos.off[p] === CHECKERS_PER_PLAYER;

export type WinKind = 'single' | 'mars' | 'backgammon';

/** Classify a finished game from the winner's side. single = 1, mars (gammon) = 2, backgammon = 3. */
export function winKind(pos: Position, winner: Player): WinKind {
  const loser = other(winner);
  if (pos.off[loser] > 0) return 'single';
  if (pos.bar[loser] > 0) return 'backgammon';
  for (let r = 0; r < 6; r++) if (ownAt(pos, loser, rel(winner, r)) > 0) return 'backgammon';
  return 'mars';
}

export const winPoints: Record<WinKind, number> = { single: 1, mars: 2, backgammon: 3 };

export const removeDie = removeOne;

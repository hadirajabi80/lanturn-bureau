// Computer opponent. Pure functions — runs inside a Web Worker (see ai.worker.ts) and in Node tests.
//
// Every distinct end-of-turn position is scored by a positional evaluation (pips, made points,
// primes, blot exposure to the opponent's next roll, checkers on the bar, race efficiency).
// easy   — simplified evaluation with heavy noise (plausible moves, frequent mistakes)
// medium — full evaluation with moderate noise
// hard   — full evaluation, always the best-scoring move
// (A 2-ply lookahead was tried and measured no stronger than this in self-play, so it was dropped.)
import {
  applyMove, legalMoves, other, ownAt, rel, removeDie, type Move, type Player, type Position,
} from './rules';

export type AiLevel = 'easy' | 'medium' | 'hard';

export interface Candidate {
  moves: Move[];
  pos: Position;
}

const posKey = (p: Position) => `${p.points.join(',')}|${p.bar[0]},${p.bar[1]}|${p.off[0]},${p.off[1]}`;

/** Every distinct end-of-turn position reachable with the dice (rules enforced by legalMoves). */
export function enumerateTurns(pos: Position, p: Player, dice: number[]): Candidate[] {
  const out = new Map<string, Candidate>();
  const seen = new Set<string>();
  const walk = (cur: Position, rem: number[], moves: Move[]) => {
    const k = `${posKey(cur)}#${rem.join('')}`;
    if (seen.has(k)) return;
    seen.add(k);
    const ms = rem.length ? legalMoves(cur, p, rem) : [];
    if (ms.length === 0) {
      const key = posKey(cur);
      if (!out.has(key)) out.set(key, { moves, pos: cur });
      return;
    }
    for (const m of ms) walk(applyMove(cur, p, m), removeDie(rem, m.die), [...moves, m]);
  };
  walk(pos, dice, []);
  return [...out.values()];
}

/* ---------------------------------------------------------------- evaluation */

// Value of owning a made point, by relative index (0 = own 1-point … 23 = opponent's 1-point).
const POINT_W = [
  0.4, 1.0, 1.6, 2.4, 3.6, 3.4, 2.9, 1.5, 0.8, 0.6, 0.5, 0.5,
  0.4, 0.4, 0.4, 0.4, 0.5, 0.7, 1.6, 2.2, 2.0, 1.2, 0.9, 0.7,
];
const PRIME_BONUS = [0, 0, 1.2, 3.5, 7, 12, 19];

interface Side {
  own: number[]; // own checkers by own-relative index
  opp: number[]; // opponent checkers, by the same (own) relative index
  ownBar: number;
  oppBar: number;
  ownOff: number;
  oppOff: number;
}

function sideView(pos: Position, p: Player): Side {
  const o = other(p);
  const own = new Array(24).fill(0);
  const opp = new Array(24).fill(0);
  for (let i = 0; i < 24; i++) {
    own[rel(p, i)] = ownAt(pos, p, i);
    opp[rel(p, i)] = ownAt(pos, o, i);
  }
  return { own, opp, ownBar: pos.bar[p], oppBar: pos.bar[o], ownOff: pos.off[p], oppOff: pos.off[o] };
}

function pips(arr: number[], bar: number) {
  let s = bar * 25;
  for (let r = 0; r < 24; r++) s += arr[r] * (r + 1);
  return s;
}
/** Opponent pips, given its checkers indexed in our relative frame (its r' = 23 - r). */
function oppPips(s: Side) {
  let t = s.oppBar * 25;
  for (let r = 0; r < 24; r++) t += s.opp[r] * (24 - r);
  return t;
}

function longestPrime(made: boolean[], from: number, to: number) {
  let best = 0;
  let run = 0;
  for (let r = from; r <= to; r++) {
    run = made[r] ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

/**
 * Expected pips lost to the opponent's next roll. Opponent checkers travel toward our high
 * relative indices; a blot at r is hit from q < r at distance r - q (bar entries come from -1).
 */
function blotRisk(s: Side, made: boolean[], oppHomeBoard: number) {
  const blots: number[] = [];
  for (let r = 0; r < 24; r++) if (s.own[r] === 1) blots.push(r);
  if (!blots.length) return 0;
  const shooters: number[] = [];
  if (s.oppBar > 0) shooters.push(-1);
  // with two or more on the bar, only entering checkers can hit
  if (s.oppBar <= 1) for (let q = 0; q < 24; q++) if (s.opp[q] > 0) shooters.push(q);
  if (!shooters.length) return 0;

  const blocked = (pt: number) => pt >= 0 && pt < 24 && made[pt];
  let total = 0;
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      let worst = 0;
      for (const r of blots) {
        let hit = false;
        for (const q of shooters) {
          const d = r - q;
          if (d <= 0) continue;
          if (a === b) {
            for (let k = 1; k <= 4; k++) {
              if (blocked(q + a * k) && a * k < d) break;
              if (a * k === d) {
                hit = true;
                break;
              }
            }
          } else if (d === a || d === b) {
            hit = true;
          } else if (d === a + b && (!blocked(q + a) || !blocked(q + b))) {
            hit = true;
          }
          if (hit) break;
        }
        if (hit) {
          const loss = (24 - r) * (1 + oppHomeBoard * 0.12) + 4;
          if (loss > worst) worst = loss;
        }
      }
      total += worst;
    }
  }
  return total / 36;
}

/** Positional score for the side to have just moved (positive = good for p). Pip-like units. */
export function evaluate(pos: Position, p: Player, simple = false): number {
  const s = sideView(pos, p);
  if (s.ownOff === 15) return 1000;
  if (s.oppOff === 15) return -1000;

  const myPips = pips(s.own, s.ownBar);
  const theirPips = oppPips(s);

  // contact: does any of our checkers still have to pass any of theirs?
  let myBack = s.ownBar > 0 ? 24 : -1;
  for (let r = 23; r >= 0 && myBack < 0; r--) if (s.own[r] > 0) myBack = r;
  let theirBack = s.oppBar > 0 ? -1 : 24;
  for (let r = 0; r < 24 && theirBack === 24; r++) if (s.opp[r] > 0) theirBack = r;
  const contact = myBack > theirBack;

  if (!contact) {
    // Race: pips decide; bear off efficiently and avoid wasted pips on high points.
    let waste = 0;
    for (let r = 0; r < 6; r++) waste += s.own[r] * (r >= 3 ? 0.15 * r : 0);
    let gaps = 0;
    for (let r = 0; r < 6; r++) if (s.own[r] === 0) gaps += 0.25;
    return (theirPips - myPips) * 1.2 + s.ownOff * 2.5 - s.oppOff * 2.5 - waste - gaps * (s.ownOff > 0 ? 1 : 0);
  }

  const made = s.own.map((n) => n >= 2);
  const oppMade = s.opp.map((n) => n >= 2);
  let score = (theirPips - myPips) * 0.55;

  if (simple) {
    for (let r = 0; r < 24; r++) if (made[r]) score += POINT_W[r] * 0.6;
    for (let r = 0; r < 24; r++) if (s.own[r] === 1) score -= 2.5;
    score += s.oppBar * 6;
    return score;
  }

  // structure
  for (let r = 0; r < 24; r++) {
    if (made[r]) score += POINT_W[r];
    if (s.own[r] > 3) score -= (s.own[r] - 3) * 0.45;
  }
  const prime = longestPrime(made, 0, 17);
  score += PRIME_BONUS[Math.min(6, prime)];

  // opponent's structure (mirror weights into their frame)
  let oppHome = 0;
  for (let r = 0; r < 24; r++) {
    if (oppMade[r]) {
      score -= POINT_W[23 - r] * 0.85;
      if (r >= 18) oppHome++;
    }
  }
  let oppPrime = 0;
  let run = 0;
  for (let r = 23; r >= 6; r--) {
    run = oppMade[r] ? run + 1 : 0;
    oppPrime = Math.max(oppPrime, run);
  }
  score -= PRIME_BONUS[Math.min(6, oppPrime)] * 0.85;

  let myHome = 0;
  for (let r = 0; r < 6; r++) if (made[r]) myHome++;

  // checkers on the bar
  score += s.oppBar * (5 + myHome * 1.6);
  score -= s.ownBar * (5 + oppHome * 1.6);

  // trapped back checkers when behind our prime
  if (prime >= 4) {
    let trapped = 0;
    for (let r = 0; r < 18; r++) if (s.opp[r] > 0) trapped += s.opp[r];
    score += trapped * prime * 0.35 + s.oppBar * prime * 0.4;
  }

  // our back checkers left deep when we are ahead in the race
  if (theirPips - myPips > 10) {
    for (let r = 18; r < 24; r++) score -= s.own[r] * 0.6;
  }

  // shot risk for our blots (the opponent rolls next)
  score -= blotRisk(s, made, oppHome);

  // their exposed blots are future targets
  for (let r = 0; r < 24; r++) if (s.opp[r] === 1) score += r < 12 ? 0.6 : 0.25;

  score += s.ownOff * 1.5 - s.oppOff * 1.5;
  return score;
}

/* ---------------------------------------------------------------- search */

function gaussian() {
  const u = Math.random() || 1e-9;
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function chooseMoves(pos: Position, p: Player, dice: number[], level: AiLevel): Move[] {
  const cands = enumerateTurns(pos, p, dice);
  if (cands.length <= 1) return cands[0]?.moves ?? [];
  const simple = level === 'easy';
  const noise = level === 'easy' ? 7 : level === 'medium' ? 5 : 0;
  let best = cands[0];
  let bestV = -Infinity;
  for (const c of cands) {
    const v = evaluate(c.pos, p, simple) + (noise ? gaussian() * noise : 0);
    if (v > bestV) {
      bestV = v;
      best = c;
    }
  }
  return best.moves;
}

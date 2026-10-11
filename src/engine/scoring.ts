/**
 * Pure score / rank math (PLAN §1). No React, no store.
 */
export type Rank = 'S' | 'A' | 'B' | 'C';

export const START_SCORE = 1000;
export const PENALTY = {
  wrongAccusation: 100,
  wrongProveIt: 60,
  hint: 80,
  wrongPress: 10,
} as const;

export interface ScoreInput {
  wrongAccusations: number;
  wrongProveIt: number;
  hintsUsed: number;
  wrongPresses: number;
}

export interface ScoreBreakdown {
  start: number;
  accusations: number;
  proveIt: number;
  hints: number;
  presses: number;
  total: number;
}

const nonNeg = (n: number): number => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

export function scoreBreakdown(s: ScoreInput): ScoreBreakdown {
  const accusations = nonNeg(s.wrongAccusations) * PENALTY.wrongAccusation;
  const proveIt = nonNeg(s.wrongProveIt) * PENALTY.wrongProveIt;
  const hints = nonNeg(s.hintsUsed) * PENALTY.hint;
  const presses = nonNeg(s.wrongPresses) * PENALTY.wrongPress;
  const total = Math.max(0, START_SCORE - accusations - proveIt - hints - presses);
  return { start: START_SCORE, accusations, proveIt, hints, presses, total };
}

export function computeScore(s: ScoreInput): number {
  return scoreBreakdown(s).total;
}

export function rankFor(score: number): Rank {
  if (score >= 950) return 'S';
  if (score >= 800) return 'A';
  if (score >= 600) return 'B';
  return 'C';
}

const RANK_ORDER: Record<Rank, number> = { S: 3, A: 2, B: 1, C: 0 };
export const betterRank = (a: Rank, b: Rank): Rank => (RANK_ORDER[a] >= RANK_ORDER[b] ? a : b);

export const RANK_LABEL: Record<Rank, string> = {
  S: 'Sterling — not a wasted step.',
  A: 'Admirable — Otto almost smiled.',
  B: 'Brisk — solved, with a few scuffs.',
  C: 'Closed — the truth got there eventually.',
};

export const RANK_COLOR: Record<Rank, string> = {
  S: '#FFB347',
  A: '#D4A857',
  B: '#2EC4B6',
  C: '#9AA3B8',
};

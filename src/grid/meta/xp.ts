/**
 * XP & ranks. Pure — safe to import from tests and non-React code.
 *
 * Case XP = tier base × stars multiplier × scenario multiplier
 *         + first-solve bonus (+50% of that) + under-par bonus (up to +50%) + Daily bonus (+50 flat).
 * Zen pays 25% of the total; Blitz / Gauntlet pay 60% per case plus a run bonus.
 *
 * Rank curve: minXp(i) = 100,000 · (i/7)^2.2 (rounded to 50). An average catalogue solve is worth
 * ~160 XP (tier mix 240/240/240/240/80, ~1.6× stars, ~1.2× scenario, first-solve bonus), so
 * Legend arrives after roughly 600 solves; Sergeant after ~10.
 */
import type { PlayMode, Tier, Variant } from '../types';
import type { Rank, RankId, SolveRecord, XpLine } from './types';

export const TIER_BASE: Record<Tier, number> = { easy: 20, medium: 35, hard: 60, extreme: 100, mastermind: 180, ultra: 396 }; // ultra (Extra Extreme) = 2.2 × Mastermind
export const STAR_MULT: Record<0 | 1 | 2 | 3, number> = { 0: 1, 1: 1, 2: 1.4, 3: 2 };
export const VARIANT_MULT: Record<Variant, number> = {
  classic: 1,
  lockedRoom: 1.15,
  poison: 1.15,
  sniper: 1.25,
  accomplice: 1.25,
  liar: 1.4,
  double: 1.5,
  liarDouble: 1.8,
  accompliceLiar: 1.8,
};
export const FIRST_SOLVE_BONUS = 0.5;
export const UNDER_PAR_MAX = 0.5;
export const DAILY_BONUS = 50;
export const ZEN_MULT = 0.25;
export const RUN_CASE_MULT = 0.6;

export const TIER_LABEL: Record<Tier, string> = {
  easy: 'Rookie', medium: 'Detective', hard: 'Inspector', extreme: 'Chief', mastermind: 'Mastermind', ultra: 'Extra Extreme',
};
export const VARIANT_LABEL: Record<Variant, string> = {
  classic: 'Classic', accomplice: 'Accomplice', lockedRoom: 'Locked room', poison: 'Poison', sniper: 'Sniper',
  liar: 'Liar', double: 'Double', liarDouble: 'Liar double', accompliceLiar: 'Accomplice liar',
};
export const MODE_LABEL: Record<PlayMode, string> = {
  case: 'Case', daily: 'Daily', blitz: 'Blitz', gauntlet: 'Gauntlet', weekly: 'Weekly', custom: 'Custom', zen: 'Zen',
};

// ─────────────────────────── ranks ───────────────────────────
export const LEGEND_XP = 100_000;
export const RANK_CURVE = 2.2;

const RANK_DEFS: Array<Pick<Rank, 'id' | 'name' | 'metal' | 'color'>> = [
  { id: 'constable', name: 'Constable', metal: 'bronze', color: '#B87A4B' },
  { id: 'sergeant', name: 'Sergeant', metal: 'bronze', color: '#CF9460' },
  { id: 'detective', name: 'Detective', metal: 'silver', color: '#B9C2CC' },
  { id: 'inspector', name: 'Inspector', metal: 'silver', color: '#D9E1EA' },
  { id: 'chiefInspector', name: 'Chief Inspector', metal: 'gold', color: '#D4A857' },
  { id: 'superintendent', name: 'Superintendent', metal: 'gold', color: '#F0C766' },
  { id: 'commissioner', name: 'Commissioner', metal: 'platinum', color: '#BFE7E8' },
  { id: 'legend', name: 'Legend', metal: 'platinum', color: '#FFB347' },
];

export function rankThreshold(i: number): number {
  const last = RANK_DEFS.length - 1;
  if (i <= 0) return 0;
  return Math.round((LEGEND_XP * Math.pow(Math.min(i, last) / last, RANK_CURVE)) / 50) * 50;
}

export const RANKS: Rank[] = RANK_DEFS.map((d, index) => ({ ...d, index, minXp: rankThreshold(index) }));
export const RANK_BY_ID = Object.fromEntries(RANKS.map((r) => [r.id, r])) as Record<RankId, Rank>;

export function rankForXp(xp: number): Rank {
  let r = RANKS[0];
  for (const k of RANKS) if (xp >= k.minXp) r = k;
  return r;
}

export interface RankProgress {
  rank: Rank;
  next: Rank | null;
  /** XP earned inside the current rank */
  xpInRank: number;
  /** XP span of the current rank (0 at Legend) */
  xpForNext: number;
  /** 0..1 (1 at Legend) */
  pct: number;
}

export function rankProgress(xp: number): RankProgress {
  const rank = rankForXp(xp);
  const next = RANKS[rank.index + 1] ?? null;
  const xpInRank = xp - rank.minXp;
  const xpForNext = next ? next.minXp - rank.minXp : 0;
  return { rank, next, xpInRank, xpForNext, pct: next ? Math.min(1, xpInRank / xpForNext) : 1 };
}

// ─────────────────────────── case XP ───────────────────────────
const fmtMult = (m: number) => `×${Number(m.toFixed(2))}`;

/** XP for one closed case, as an additive breakdown (lines always sum to the total). */
export function computeSolveXp(rec: Pick<SolveRecord, 'tier' | 'variant' | 'mode' | 'stars' | 'timeMs' | 'parSeconds' | 'firstSolve'>): {
  total: number;
  breakdown: XpLine[];
} {
  const lines: XpLine[] = [];
  const zen = rec.mode === 'zen';
  const stars = zen ? 0 : rec.stars;
  const base = TIER_BASE[rec.tier] ?? TIER_BASE.easy;
  lines.push({ label: `${TIER_LABEL[rec.tier] ?? 'Case'} case`, xp: base });

  const sm = STAR_MULT[stars] ?? 1;
  const afterStars = Math.round(base * sm);
  if (afterStars !== base) lines.push({ label: `${'★'.repeat(stars)} ${fmtMult(sm)}`, xp: afterStars - base });

  const vm = VARIANT_MULT[rec.variant] ?? 1;
  const core = Math.round(base * sm * vm);
  if (core !== afterStars) lines.push({ label: `${VARIANT_LABEL[rec.variant]} ${fmtMult(vm)}`, xp: core - afterStars });

  if (rec.firstSolve) lines.push({ label: 'First solve +50%', xp: Math.round(core * FIRST_SOLVE_BONUS) });

  const parMs = rec.parSeconds * 1000;
  if (!zen && parMs > 0 && rec.timeMs > 0 && rec.timeMs < parMs) {
    lines.push({ label: 'Under par', xp: Math.max(1, Math.round(core * UNDER_PAR_MAX * (1 - rec.timeMs / parMs))) });
  }

  if (rec.mode === 'daily' && rec.firstSolve) lines.push({ label: "Today's case", xp: DAILY_BONUS });

  const subtotal = lines.reduce((s, l) => s + l.xp, 0);
  let total = subtotal;
  if (zen) {
    total = Math.round(subtotal * ZEN_MULT);
    lines.push({ label: 'Zen pays 25%', xp: total - subtotal });
  } else if (rec.mode === 'blitz' || rec.mode === 'gauntlet') {
    total = Math.round(subtotal * RUN_CASE_MULT);
    lines.push({ label: `${MODE_LABEL[rec.mode]} pace ×0.6`, xp: total - subtotal });
  }
  if (total < 1) {
    lines.push({ label: 'Minimum', xp: 1 - total });
    total = 1;
  }
  return { total, breakdown: lines };
}

/** Run bonus at the end of a Blitz run (`score` = cases closed). */
export function blitzRunXp(score: number): XpLine[] {
  const s = Math.max(0, Math.floor(score));
  const lines: XpLine[] = [];
  if (s > 0) lines.push({ label: `Blitz run · ${s} closed`, xp: s * 15 });
  if (s >= 10) lines.push({ label: 'Double figures', xp: 100 });
  return lines;
}

export const GAUNTLET_STAGES = 8;

/** Run bonus at the end of a Gauntlet run (`stage` = stages cleared, 0–8; the 8th is an Extra Extreme case). */
export function gauntletRunXp(stage: number): XpLine[] {
  const s = Math.max(0, Math.min(GAUNTLET_STAGES, Math.floor(stage)));
  const lines: XpLine[] = [];
  if (s > 0) lines.push({ label: `Gauntlet · floor ${s}`, xp: s * s * 10 });
  if (s >= GAUNTLET_STAGES) lines.push({ label: 'Gauntlet cleared', xp: 250 });
  return lines;
}

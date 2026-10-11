/**
 * Case ladder: board sizes and scenario (variant) schedule per tier and case
 * index (docs/GRID-PLAN.md §2). All functions are cheap and deterministic.
 */
import type { Tier, Variant } from '../types';
import { hashSeed } from './rng';

/** Grid size ladder per tier: [last case index (1-based, inclusive), N]. */
export const SIZE_LADDER: Record<Tier, [number, number][]> = {
  easy: [[15, 4], [30, 5]],
  medium: [[10, 5], [20, 6], [30, 7]],
  hard: [[10, 7], [20, 8], [30, 9]],
  extreme: [[8, 9], [16, 10], [24, 11], [30, 12]],
  mastermind: [[4, 12], [7, 13], [10, 14]],
};

/** Cases per tier in every district. */
export const CASES_PER_TIER: Record<Tier, number> = { easy: 30, medium: 30, hard: 30, extreme: 30, mastermind: 10 };

/**
 * Board size N (the map is N×N and holds N people) for case `index` (1-based)
 * of a tier. Cheap — no generation. Indices past the ladder use the largest size.
 */
export function gridSizeFor(tier: Tier, index: number): number {
  const ladder = SIZE_LADDER[tier];
  for (const [upTo, n] of ladder) if (index <= upTo) return n;
  return (ladder[ladder.length - 1] as [number, number])[1];
}

/** Smallest / largest board side of a tier. */
export function tierSizeRange(tier: Tier): [number, number] {
  const l = SIZE_LADDER[tier];
  return [(l[0] as [number, number])[1], (l[l.length - 1] as [number, number])[1]];
}

/** 0 → first case of a tier, 1 → last. */
export function rampFor(tier: Tier, index: number): number {
  const n = CASES_PER_TIER[tier];
  return Math.max(0, Math.min(1, (index - 1) / Math.max(1, n - 1)));
}

interface Sched {
  /** cases 1..classicUntil are always the base pool's first entry */
  classicUntil: number;
  /** "classic-like" pool (picked with probability pBase) */
  base: { v: Variant; from: number; w: number }[];
  /** special pool */
  special: { v: Variant; from: number; w: number }[];
  /** probability of the base pool at the start / end of the tier */
  pBase: [number, number];
}

/**
 * Variant schedule. Easy is always classic. Other tiers start classic(-like)
 * and ramp into their special variants; liar (Inspector) and double (Chief)
 * unlock at case 16.
 */
const SCHEDULE: Record<Tier, Sched> = {
  easy: { classicUntil: 999, base: [{ v: 'classic', from: 1, w: 1 }], special: [], pBase: [1, 1] },
  medium: {
    classicUntil: 5,
    base: [{ v: 'classic', from: 1, w: 1 }],
    special: [{ v: 'lockedRoom', from: 6, w: 1 }, { v: 'poison', from: 11, w: 1.3 }],
    pBase: [0.5, 0.2],
  },
  hard: {
    classicUntil: 3,
    base: [{ v: 'classic', from: 1, w: 1 }],
    special: [
      { v: 'lockedRoom', from: 4, w: 0.8 }, { v: 'poison', from: 4, w: 0.8 }, { v: 'accomplice', from: 6, w: 1.3 },
      { v: 'sniper', from: 9, w: 1.4 }, { v: 'liar', from: 16, w: 2.4 },
    ],
    pBase: [0.55, 0.25],
  },
  extreme: {
    classicUntil: 0,
    base: [{ v: 'accomplice', from: 1, w: 1 }, { v: 'sniper', from: 1, w: 1 }, { v: 'poison', from: 1, w: 1 }],
    special: [{ v: 'liar', from: 1, w: 1 }, { v: 'double', from: 16, w: 2.2 }],
    pBase: [0.6, 0.3],
  },
  mastermind: {
    classicUntil: 0,
    base: [{ v: 'liar', from: 1, w: 1 }, { v: 'double', from: 1, w: 1 }],
    special: [{ v: 'liarDouble', from: 1, w: 1.3 }, { v: 'accompliceLiar', from: 3, w: 1 }],
    pBase: [0.45, 0.3],
  },
};

const frac = (x: number): number => x - Math.floor(x);

function pickWeighted(list: { v: Variant; w: number }[], u: number): Variant {
  const total = list.reduce((s, x) => s + x.w, 0);
  let x = u * total;
  for (const it of list) {
    x -= it.w;
    if (x < 0) return it.v;
  }
  return (list[list.length - 1] as { v: Variant }).v;
}

/**
 * Scenario of case `index` in `tier`. Deterministic and cheap. Without a seed
 * the schedule is the same in every district (the case rack can show the
 * variant glyph without generating); daily / custom cases pass a seed.
 */
export function variantFor(tier: Tier, index: number, seed?: number): Variant {
  const s = SCHEDULE[tier];
  const first = (s.base[0] as { v: Variant }).v;
  if (index <= s.classicUntil) return first;
  const off1 = seed === undefined ? 0.11 : (hashSeed('variant-a', seed) % 100000) / 100000;
  const off2 = seed === undefined ? 0.37 : (hashSeed('variant-b', seed) % 100000) / 100000;
  // low-discrepancy sequences spread each variant evenly along the tier
  const u1 = frac(index * 0.6180339887 + off1 + tier.length * 0.071);
  const u2 = frac(index * 0.7548776662 + off2);
  const t = rampFor(tier, index);
  const pBase = s.pBase[0] + (s.pBase[1] - s.pBase[0]) * t;
  const base = s.base.filter((x) => index >= x.from);
  const special = s.special.filter((x) => index >= x.from);
  if (!special.length || u1 < pBase) return pickWeighted(base, u2);
  return pickWeighted(special, u2);
}

/** Smallest board each variant is generated on (custom cases are clamped up to it). */
export const VARIANT_MIN_SIZE: Record<Variant, number> = {
  classic: 4, accomplice: 4, lockedRoom: 4, poison: 4, sniper: 5, liar: 5, double: 5, liarDouble: 6, accompliceLiar: 6,
};

/** Difficulty multiplier on par time per variant. */
export const VARIANT_PAR: Record<Variant, number> = {
  classic: 1, accomplice: 1.1, lockedRoom: 1.1, poison: 1.1, sniper: 1.15, liar: 1.35, double: 1.2, liarDouble: 1.5,
  accompliceLiar: 1.45,
};

// ─────────────────────────── daily / weekly ───────────────────────────

/** Weekday (0 = Sunday) → daily tier. */
export const DAILY_TIERS: Tier[] = ['extreme', 'easy', 'medium', 'hard', 'medium', 'hard', 'extreme'];

/** Day number since 1970-01-01 (UTC) for an ISO date "YYYY-MM-DD". */
export function dayNumber(dateISO: string): number {
  const [y, m, d] = dateISO.slice(0, 10).split('-').map(Number);
  return Math.floor(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) / 86400000);
}

export function dailyTier(dateISO: string): Tier {
  const day = dayNumber(dateISO);
  return DAILY_TIERS[(((day + 4) % 7) + 7) % 7] as Tier;
}

/** ISO week label "2026-W41" for an ISO date. */
export function isoWeekOf(dateISO: string): string {
  const day = dayNumber(dateISO);
  const date = new Date(day * 86400000);
  const dow = (date.getUTCDay() + 6) % 7; // Monday = 0
  const thursday = new Date((day - dow + 3) * 86400000);
  const year = thursday.getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4);
  const jan4dow = (new Date(jan4).getUTCDay() + 6) % 7;
  const week1Monday = jan4 / 86400000 - jan4dow;
  const week = Math.floor((day - dow - week1Monday) / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Parse "2026-W41" / "2026W41" / "2026-41" → { year, week } or null. */
export function parseIsoWeek(s: string): { year: number; week: number } | null {
  const m = /^(\d{4})-?W?(\d{1,2})$/i.exec(s.trim());
  if (!m) return null;
  const year = Number(m[1]), week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

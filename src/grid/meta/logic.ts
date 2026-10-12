/**
 * Pure profile reducers (no React, no storage). The zustand store in ./store.ts is a thin wrapper
 * around these, so everything here is unit-tested in __tests__/meta.ts.
 */
import { DISTRICTS } from '../skins/districts';
import { TIERS, type Tier, type Variant } from '../types';
import { ACHIEVEMENTS, ALL_VARIANTS, casesInDistrict, pendingAchievements } from './achievements';
import { dayDiff, isoWeekKey, lastNDays, localHour, localISODate } from './dates';
import type { Achievement, BurnEntry, BurnRecord, Counters, ProfileData, RecordOutcome, SolveEntry, SolveRecord, XpLine } from './types';
import { blitzRunXp, computeSolveXp, gauntletRunXp, GAUNTLET_STAGES, rankForXp } from './xp';

export const HISTORY_LIMIT = 2000;
/** Calendar / daily maps keep this many days. */
export const CALENDAR_DAYS = 400;

export function emptyCounters(): Counters {
  return {
    solves: 0, burns: 0, byTier: {}, byDistrict: {}, byVariant: {}, byMode: {}, uniqueByDistrict: {}, bySize: {},
    threeStars: 0, noOtto: 0, nightShift: 0, speedOfThought: 0, noPencil: 0, burnSurvivor: 0, maxSize: 0,
    blitzRuns: 0, gauntletRuns: 0, gauntletClears: 0,
  };
}

export function emptyProfile(now: number = Date.now()): ProfileData {
  return {
    xp: 0, solves: [], burns: [], streak: { current: 0, best: 0, last: null }, activity: {}, dailyDates: {},
    blitzBest: 0, gauntletBest: 0, weekly: {}, solvedIds: {}, burnedIds: {}, counters: emptyCounters(), unlocked: {},
    createdAt: now,
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Fill any missing fields (old / partial / corrupted saves) with defaults. */
export function normalizeProfile(raw: unknown): ProfileData {
  const base = emptyProfile();
  if (!isObj(raw)) return base;
  const r = raw as Partial<ProfileData>;
  const c = isObj(r.counters) ? (r.counters as Partial<Counters>) : {};
  const counters: Counters = { ...base.counters, ...c };
  for (const k of ['byTier', 'byDistrict', 'byVariant', 'byMode', 'uniqueByDistrict', 'bySize'] as const) {
    (counters as unknown as Record<string, unknown>)[k] = isObj(c[k]) ? { ...(c[k] as object) } : {};
  }
  return {
    ...base,
    xp: typeof r.xp === 'number' && Number.isFinite(r.xp) ? Math.max(0, r.xp) : 0,
    solves: Array.isArray(r.solves) ? r.solves.slice(-HISTORY_LIMIT) : [],
    burns: Array.isArray(r.burns) ? r.burns.slice(-HISTORY_LIMIT) : [],
    streak: isObj(r.streak) ? { ...base.streak, ...r.streak } : base.streak,
    activity: isObj(r.activity) ? { ...r.activity } : {},
    dailyDates: isObj(r.dailyDates) ? { ...r.dailyDates } : {},
    blitzBest: typeof r.blitzBest === 'number' ? r.blitzBest : 0,
    gauntletBest: typeof r.gauntletBest === 'number' ? r.gauntletBest : 0,
    weekly: isObj(r.weekly) ? { ...r.weekly } : {},
    solvedIds: isObj(r.solvedIds) ? { ...r.solvedIds } : {},
    burnedIds: isObj(r.burnedIds) ? { ...r.burnedIds } : {},
    counters,
    unlocked: isObj(r.unlocked) ? { ...r.unlocked } : {},
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : base.createdAt,
  };
}

const inc = <K extends string>(m: Partial<Record<K, number>>, k: K, by = 1) => {
  m[k] = (m[k] ?? 0) + by;
};

function pruneDates<T>(m: Record<string, T>, today: string): Record<string, T> {
  const keys = Object.keys(m);
  if (keys.length <= CALENDAR_DAYS) return m;
  const out: Record<string, T> = {};
  for (const k of keys) if (dayDiff(k, today) < CALENDAR_DAYS) out[k] = m[k];
  return out;
}

/** Advance the streak for a solve on local date `day`. Same day = no change; gap > 1 day resets to 1. */
export function advanceStreak(s: ProfileData['streak'], day: string): ProfileData['streak'] {
  if (s.last === day) return s;
  if (s.last && dayDiff(s.last, day) < 0) return s; // out-of-order (clock went backwards): ignore
  const current = s.last && dayDiff(s.last, day) === 1 ? s.current + 1 : 1;
  return { current, best: Math.max(s.best, current), last: day };
}

/** Streak as displayed today: alive if the last solve was today or yesterday, else 0. */
export function liveStreak(s: ProfileData['streak'], today: string = localISODate()): number {
  if (!s.last) return 0;
  const gap = dayDiff(s.last, today);
  return gap === 0 || gap === 1 ? s.current : 0;
}

/** Is `id` a catalogue case of `district` (`<district>-<tier>-<n>`)? */
export function isCatalogueCase(id: string, district: string): boolean {
  const m = /^(.+)-(easy|medium|hard|extreme|mastermind|ultra)-(\d+)$/.exec(id);
  return !!m && m[1] === district;
}

function unlock(prev: ProfileData, next: ProfileData, at: number): Achievement[] {
  const fresh = pendingAchievements(next);
  if (fresh.length) {
    next.unlocked = { ...prev.unlocked };
    for (const a of fresh) next.unlocked[a.id] = at;
  }
  return fresh;
}

function outcome(prev: ProfileData, next: ProfileData, breakdown: XpLine[], achievements: Achievement[]): RecordOutcome {
  const rankBefore = rankForXp(prev.xp);
  const rankAfter = rankForXp(next.xp);
  return {
    xpGained: next.xp - prev.xp,
    breakdown,
    rankBefore,
    rankAfter,
    rankUp: rankAfter.index > rankBefore.index,
    achievements,
  };
}

const cloneCounters = (c: Counters): Counters => ({
  ...c,
  byTier: { ...c.byTier }, byDistrict: { ...c.byDistrict }, byVariant: { ...c.byVariant }, byMode: { ...c.byMode },
  uniqueByDistrict: { ...c.uniqueByDistrict }, bySize: { ...c.bySize },
});

export function applySolve(prev: ProfileData, rec: SolveRecord): { profile: ProfileData; outcome: RecordOutcome } {
  const at = rec.at ?? Date.now();
  const day = localISODate(at);
  const { total, breakdown } = computeSolveXp(rec);
  const c = cloneCounters(prev.counters);
  const zen = rec.mode === 'zen';
  const stars = zen ? 0 : rec.stars;

  c.solves++;
  inc(c.byTier, rec.tier);
  inc(c.byDistrict, rec.district);
  inc(c.byVariant, rec.variant);
  inc(c.byMode, rec.mode);
  if (stars === 3) c.threeStars++;
  if (rec.otto === 0 && rec.reveals === 0) c.noOtto++;
  const hour = localHour(at);
  if (hour >= 0 && hour < 5) c.nightShift++;
  const parMs = rec.parSeconds * 1000;
  if (!zen && rec.size >= 9 && parMs > 0 && rec.timeMs > 0 && rec.timeMs < parMs * 0.5) c.speedOfThought++;
  if (rec.pencilUsed === false && rec.size >= 7) c.noPencil++;
  c.maxSize = Math.max(c.maxSize, rec.size);
  if (!zen && rec.timeMs > 0) {
    const k = String(rec.size);
    const s = c.bySize[k] ?? { n: 0, sumMs: 0, bestMs: 0 };
    c.bySize[k] = { n: s.n + 1, sumMs: s.sumMs + rec.timeMs, bestMs: s.n === 0 ? rec.timeMs : Math.min(s.bestMs, rec.timeMs) };
  }

  let solvedIds = prev.solvedIds;
  if (!solvedIds[rec.puzzleId]) {
    solvedIds = { ...solvedIds, [rec.puzzleId]: 1 };
    if (isCatalogueCase(rec.puzzleId, rec.district)) inc(c.uniqueByDistrict, rec.district);
  }
  let burnedIds = prev.burnedIds;
  if (burnedIds[rec.puzzleId]) {
    burnedIds = { ...burnedIds };
    delete burnedIds[rec.puzzleId];
    c.burnSurvivor++;
  }

  let weekly = prev.weekly;
  if (rec.mode === 'weekly') {
    const wk = isoWeekKey(day);
    const old = weekly[wk];
    if (!old || stars > old.stars || (stars === old.stars && rec.timeMs < old.timeMs)) {
      weekly = { ...weekly, [wk]: { timeMs: rec.timeMs, stars, at } };
    }
  }

  const entry: SolveEntry = {
    id: rec.puzzleId, district: rec.district, tier: rec.tier, variant: rec.variant, mode: rec.mode, size: rec.size,
    timeMs: rec.timeMs, par: rec.parSeconds, stars, otto: rec.otto, reveals: rec.reveals, xp: total, at,
  };
  const solves = prev.solves.length >= HISTORY_LIMIT ? [...prev.solves.slice(-(HISTORY_LIMIT - 1)), entry] : [...prev.solves, entry];

  const next: ProfileData = {
    ...prev,
    xp: prev.xp + total,
    solves,
    streak: advanceStreak(prev.streak, day),
    activity: pruneDates({ ...prev.activity, [day]: (prev.activity[day] ?? 0) + 1 }, day),
    dailyDates: rec.mode === 'daily' ? pruneDates({ ...prev.dailyDates, [day]: 1 as const }, day) : prev.dailyDates,
    weekly,
    solvedIds,
    burnedIds,
    counters: c,
  };
  const achievements = unlock(prev, next, at);
  return { profile: next, outcome: outcome(prev, next, breakdown, achievements) };
}

export function applyBurn(prev: ProfileData, rec: BurnRecord): { profile: ProfileData; outcome: RecordOutcome } {
  const at = rec.at ?? Date.now();
  const entry: BurnEntry = { id: rec.puzzleId, district: rec.district, tier: rec.tier, variant: rec.variant, mode: rec.mode, at };
  const c = cloneCounters(prev.counters);
  c.burns++;
  const next: ProfileData = {
    ...prev,
    burns: prev.burns.length >= HISTORY_LIMIT ? [...prev.burns.slice(-(HISTORY_LIMIT - 1)), entry] : [...prev.burns, entry],
    burnedIds: rec.mode === 'zen' ? prev.burnedIds : { ...prev.burnedIds, [rec.puzzleId]: 1 },
    counters: c,
  };
  const achievements = unlock(prev, next, at);
  return { profile: next, outcome: outcome(prev, next, [], achievements) };
}

export function applyBlitz(prev: ProfileData, score: number, at: number = Date.now()): { profile: ProfileData; outcome: RecordOutcome; newBest: boolean } {
  const s = Math.max(0, Math.floor(score));
  const lines = blitzRunXp(s);
  const c = cloneCounters(prev.counters);
  c.blitzRuns++;
  const next: ProfileData = { ...prev, xp: prev.xp + lines.reduce((t, l) => t + l.xp, 0), blitzBest: Math.max(prev.blitzBest, s), counters: c };
  const achievements = unlock(prev, next, at);
  return { profile: next, outcome: outcome(prev, next, lines, achievements), newBest: s > prev.blitzBest };
}

export function applyGauntlet(prev: ProfileData, stage: number, at: number = Date.now()): { profile: ProfileData; outcome: RecordOutcome; newBest: boolean } {
  const s = Math.max(0, Math.min(GAUNTLET_STAGES, Math.floor(stage)));
  const lines = gauntletRunXp(s);
  const c = cloneCounters(prev.counters);
  c.gauntletRuns++;
  if (s >= GAUNTLET_STAGES) c.gauntletClears++;
  const next: ProfileData = { ...prev, xp: prev.xp + lines.reduce((t, l) => t + l.xp, 0), gauntletBest: Math.max(prev.gauntletBest, s), counters: c };
  const achievements = unlock(prev, next, at);
  return { profile: next, outcome: outcome(prev, next, lines, achievements), newBest: s > prev.gauntletBest };
}

// ─────────────────────────── derived stats (ProfileScreen) ───────────────────────────
export interface ProfileStats {
  totalSolved: number;
  totalBurns: number;
  /** solves / (solves + burns), 0..1 (1 with no attempts) */
  accuracy: number;
  threeStarRate: number;
  byTier: { tier: Tier; count: number }[];
  byDistrict: { id: string; name: string; icon: string; color: string; color2: string; light: boolean; count: number; unique: number; total: number }[];
  byVariant: { variant: Variant; count: number }[];
  bySize: { size: number; count: number; bestMs: number | null; avgMs: number | null }[];
  activity30: { date: string; count: number }[];
  calendar14: { date: string; count: number; daily: boolean; today: boolean }[];
  recent: Array<({ kind: 'solve' } & SolveEntry) | ({ kind: 'burn' } & BurnEntry)>;
  achievementsUnlocked: number;
  achievementsTotal: number;
}

export function computeStats(p: ProfileData, now: number = Date.now(), recentCount = 12): ProfileStats {
  const today = localISODate(now);
  const c = p.counters;
  const attempts = c.solves + c.burns;
  const recent = [
    ...p.solves.slice(-recentCount).map((s) => ({ kind: 'solve' as const, ...s })),
    ...p.burns.slice(-recentCount).map((b) => ({ kind: 'burn' as const, ...b })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, recentCount);
  const sizes: ProfileStats['bySize'] = [];
  for (let size = 4; size <= 14; size++) {
    const s = c.bySize[String(size)];
    sizes.push({ size, count: s?.n ?? 0, bestMs: s && s.n ? s.bestMs : null, avgMs: s && s.n ? Math.round(s.sumMs / s.n) : null });
  }
  return {
    totalSolved: c.solves,
    totalBurns: c.burns,
    accuracy: attempts ? c.solves / attempts : 1,
    threeStarRate: c.solves ? c.threeStars / c.solves : 0,
    byTier: TIERS.map((tier) => ({ tier, count: c.byTier[tier] ?? 0 })),
    byDistrict: DISTRICTS.map((d) => ({
      id: d.id, name: d.name, icon: d.icon, color: d.palette.accent, color2: d.palette.accent2, light: d.mood === 'light',
      count: c.byDistrict[d.id] ?? 0, unique: c.uniqueByDistrict[d.id] ?? 0, total: casesInDistrict(d),
    })),
    byVariant: ALL_VARIANTS.map((variant) => ({ variant, count: c.byVariant[variant] ?? 0 })),
    bySize: sizes,
    activity30: lastNDays(today, 30).map((date) => ({ date, count: p.activity[date] ?? 0 })),
    calendar14: lastNDays(today, 14).map((date) => ({ date, count: p.activity[date] ?? 0, daily: !!p.dailyDates[date], today: date === today })),
    recent,
    achievementsUnlocked: ACHIEVEMENTS.filter((a) => p.unlocked[a.id]).length,
    achievementsTotal: ACHIEVEMENTS.length,
  };
}


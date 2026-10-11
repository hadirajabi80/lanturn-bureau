/**
 * Hub ↔ other modules bridge (owned by the hub agent): progress store, profile, ambience and cheap
 * engine helpers, each with a defensive fallback so hub screens never crash on missing data.
 */
import {
  CASES_PER_TIER, VARIANT_MIN_SIZE, dailyTier, dayNumber, gridSizeFor, hashSeed, puzzleTitle, tierSizeRange, variantFor,
} from '@/grid/engine';
import { useFloorplan } from '@/grid/store';
import { useProfile } from '@/grid/meta';
import { useAmbience } from '@/grid/audio';
import { TIERS, VARIANTS_BY_TIER, type Tier, type Variant } from '@/grid/types';
import { DISTRICTS } from '@/grid/skins/districts';



// ───────────────────────────── progress ─────────────────────────────

export interface CaseProgressLike {
  solved?: boolean;
  stars?: number;
  bestTimeMs?: number;
  burns?: number;
  inProgress?: unknown;
  lastOutcome?: 'solved' | 'burned';
}
export type ProgressMap = Record<string, CaseProgressLike | undefined>;

const EMPTY: ProgressMap = {};

/** The persisted per-case progress map (`progress[puzzleId]`). */
export const useProgressMap = (): ProgressMap => useFloorplan((s) => (s.progress as ProgressMap | undefined) ?? EMPTY);

/** Show a scorch mark: the latest attempt burned, or burned and never solved. */
export const isScorched = (p: CaseProgressLike | undefined) =>
  Boolean(p && (p.lastOutcome === 'burned' || ((p.burns ?? 0) > 0 && !p.solved)));

/** Ambience bed for a district while mounted (respects the music setting). */
export function useDistrictAmbience(ambienceId: string | null) {
  const music = useFloorplan((s) => s.settings?.music ?? true);
  useAmbience(ambienceId, music);
}

export const puzzleId = (districtId: string, tier: Tier, n: number) => `${districtId}-${tier}-${n}`;

export type CaseStatus = 'new' | 'progress' | 'solved';
export function caseStatusOf(p: CaseProgressLike | undefined): CaseStatus {
  if (p?.solved) return 'solved';
  if (p?.inProgress) return 'progress';
  return 'new';
}

export interface Tally {
  solved: number;
  total: number;
  stars: number;
  inProgress: number;
  burns: number;
}

export function tierTally(progress: ProgressMap, districtId: string, tier: Tier): Tally {
  const d = DISTRICTS.find((x) => x.id === districtId);
  const total = d?.casesPerTier[tier] ?? 30;
  const t: Tally = { solved: 0, total, stars: 0, inProgress: 0, burns: 0 };
  for (let i = 1; i <= total; i++) {
    const p = progress[puzzleId(districtId, tier, i)];
    if (!p) continue;
    if (p.solved) t.solved++;
    t.stars += p.stars ?? 0;
    if (p.inProgress && !p.solved) t.inProgress++;
    t.burns += p.burns ?? 0;
  }
  return t;
}

export function districtTally(progress: ProgressMap, districtId: string): Tally {
  return TIERS.reduce<Tally>(
    (acc, tier) => {
      const t = tierTally(progress, districtId, tier);
      return {
        solved: acc.solved + t.solved,
        total: acc.total + t.total,
        stars: acc.stars + t.stars,
        inProgress: acc.inProgress + t.inProgress,
        burns: acc.burns + t.burns,
      };
    },
    { solved: 0, total: 0, stars: 0, inProgress: 0, burns: 0 },
  );
}

// ───────────────────────────── engine helpers ─────────────────────────────

/** Board size N for case n of a tier. */
export function sizeFor(tier: Tier, n: number): number {
  try {
    const v = gridSizeFor(tier, n);
    if (Number.isFinite(v) && v > 0) return v;
  } catch {
    /* fall through */
  }
  return tier === 'easy' ? 5 : tier === 'medium' ? 6 : tier === 'hard' ? 8 : tier === 'extreme' ? 10 : 13;
}

/** Scenario variant for case n of a tier (cheap). */
export function variantOf(tier: Tier, n: number): Variant {
  try {
    return variantFor(tier, n);
  } catch {
    return VARIANTS_BY_TIER[tier][0] as Variant;
  }
}

/** Case title (cheap). */
export function titleOf(districtId: string, tier: Tier, n: number): string {
  try {
    return puzzleTitle(districtId, tier, n);
  } catch {
    return `Case ${n}`;
  }
}

export interface DailyInfo {
  districtId: string;
  tier: Tier;
  size: number;
  variant: Variant;
  title: string;
}

/**
 * Today's case summary WITHOUT generating the puzzle (mirrors the engine's daily spec:
 * district rotates by day, tier by weekday, size/variant from cheap helpers).
 */
export function dailyInfo(dateISO: string): DailyInfo {
  const day = dayNumber(dateISO);
  const tier = dailyTier(dateISO);
  const d = DISTRICTS[((day % DISTRICTS.length) + DISTRICTS.length) % DISTRICTS.length] ?? DISTRICTS[0]!;
  let variant: Variant = 'classic';
  let size = sizeFor(tier, 1);
  let title = d.name;
  try {
    const [lo, hi] = tierSizeRange(tier);
    const vIndex = ((Math.abs(day) * 7) % CASES_PER_TIER[tier]) + 1;
    variant = variantFor(tier, vIndex, day);
    size = Math.max(VARIANT_MIN_SIZE[variant], lo + (hashSeed('daily-size', day) % (hi - lo + 1)));
    title = puzzleTitle('daily', tier, day);
  } catch {
    /* keep fallbacks */
  }
  return { districtId: d.id, tier, size, variant, title };
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ───────────────────────────── profile (meta) ─────────────────────────────

export interface ProfileLike {
  rank: string;
  xp: number;
  /** XP earned inside the current rank / XP span of the rank. */
  xpInRank: number;
  xpForNext: number;
  /** 0..1 progress to the next rank. */
  pct: number;
  streak: number;
  solvedToday: boolean;
}

/** Thin view over meta's `useProfile()` used by hub widgets. */
export function useProfileSafe(): ProfileLike {
  const p = useProfile();
  return {
    rank: p.rank?.name ?? 'Constable',
    xp: p.xp ?? 0,
    xpInRank: p.xpInRank ?? 0,
    xpForNext: p.xpForNext ?? 0,
    pct: Number.isFinite(p.pct) ? p.pct : 0,
    streak: p.streak ?? 0,
    solvedToday: (p.solvedToday ?? 0) > 0,
  };
}

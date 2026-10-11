/**
 * Detective profile store — zustand + persist, key `bureau-profile-v1` (separate from the
 * play store `floorplan-v2`). All mutation logic lives in ./logic.ts (pure, tested).
 *
 * Usage from the desk / modes:
 *   const out = useProfileStore.getState().recordSolve(rec);   // or the bare `recordSolve(rec)` export
 *   out.xpGained, out.breakdown, out.rankUp, out.rankBefore/After, out.achievements (newly unlocked)
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { localISODate } from './dates';
import { applyBlitz, applyBurn, applyGauntlet, applySolve, emptyProfile, liveStreak, normalizeProfile } from './logic';
import type { BurnRecord, ProfileData, Rank, RecordOutcome, SolveRecord } from './types';
import { rankProgress } from './xp';

export const PROFILE_STORE_KEY = 'bureau-profile-v1';
export const PROFILE_STORE_VERSION = 1;

export interface ProfileActions {
  recordSolve: (rec: SolveRecord) => RecordOutcome;
  recordBurn: (rec: BurnRecord) => RecordOutcome;
  /** End of a Blitz run; `score` = cases closed. */
  recordBlitz: (score: number) => RecordOutcome & { newBest: boolean };
  /** End of a Gauntlet run; `stage` = floors cleared (0–7). */
  recordGauntlet: (stage: number) => RecordOutcome & { newBest: boolean };
  /** Dev / settings: wipe the profile. */
  resetProfile: () => void;
  /** Dev / previews: replace the profile wholesale (normalised). */
  replaceProfile: (data: unknown) => void;
}

export type ProfileStore = ProfileData & ProfileActions;

const dataOf = (s: ProfileStore): ProfileData => {
  const { recordSolve: _a, recordBurn: _b, recordBlitz: _c, recordGauntlet: _d, resetProfile: _e, replaceProfile: _f, ...data } = s;
  return data;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      ...emptyProfile(),
      recordSolve: (rec) => {
        const { profile, outcome } = applySolve(dataOf(get()), rec);
        set(profile);
        return outcome;
      },
      recordBurn: (rec) => {
        const { profile, outcome } = applyBurn(dataOf(get()), rec);
        set(profile);
        return outcome;
      },
      recordBlitz: (score) => {
        const { profile, outcome, newBest } = applyBlitz(dataOf(get()), score);
        set(profile);
        return { ...outcome, newBest };
      },
      recordGauntlet: (stage) => {
        const { profile, outcome, newBest } = applyGauntlet(dataOf(get()), stage);
        set(profile);
        return { ...outcome, newBest };
      },
      resetProfile: () => set(emptyProfile()),
      replaceProfile: (data) => set(normalizeProfile(data)),
    }),
    {
      name: PROFILE_STORE_KEY,
      version: PROFILE_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => dataOf(s),
      // v0 (or any unknown shape) → v1: fill defaults; future versions add steps here.
      migrate: (persisted) => normalizeProfile(persisted),
      merge: (persisted, current) => ({ ...current, ...normalizeProfile(persisted) }),
    },
  ),
);

// Bare action exports (no hook needed).
export const recordSolve = (rec: SolveRecord): RecordOutcome => useProfileStore.getState().recordSolve(rec);
export const recordBurn = (rec: BurnRecord): RecordOutcome => useProfileStore.getState().recordBurn(rec);
export const recordBlitz = (score: number) => useProfileStore.getState().recordBlitz(score);
export const recordGauntlet = (stage: number) => useProfileStore.getState().recordGauntlet(stage);
export const getProfile = (): ProfileData => dataOf(useProfileStore.getState());

export interface ProfileSummary {
  rank: Rank;
  rankIndex: number;
  nextRank: Rank | null;
  xp: number;
  xpInRank: number;
  /** XP span of the current rank (0 at Legend) */
  xpForNext: number;
  /** 0..1 */
  pct: number;
  /** live streak (0 if the last solve was before yesterday) */
  streak: number;
  bestStreak: number;
  solvedToday: number;
  totalSolved: number;
}

export function summarize(s: ProfileData, today: string = localISODate()): ProfileSummary {
  const rp = rankProgress(s.xp);
  return {
    rank: rp.rank,
    rankIndex: rp.rank.index,
    nextRank: rp.next,
    xp: s.xp,
    xpInRank: rp.xpInRank,
    xpForNext: rp.xpForNext,
    pct: rp.pct,
    streak: liveStreak(s.streak, today),
    bestStreak: s.streak.best,
    solvedToday: s.activity[today] ?? 0,
    totalSolved: s.counters.solves,
  };
}

/** Compact live summary for chips / hub rails. Re-renders only when a field changes. */
export function useProfile(): ProfileSummary {
  return useProfileStore(useShallow((s) => summarize(s)));
}

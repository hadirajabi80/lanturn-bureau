/**
 * Floorplan Mysteries — meta layer (profile, XP & ranks, streaks, achievements, profile screen).
 * Owned by the Meta agent. Store key `bureau-profile-v1`. See docs/FLOORPLAN-DESIGN.md §6/§7.
 */
// types
export type {
  Achievement, AchievementIconName, AchievementTier, DistrictIconName, BurnEntry, BurnRecord, Counters, ProfileData, Rank, RankId,
  RecordOutcome, SizeStat, SolveEntry, SolveRecord, StreakState, WeeklyRecord, XpLine,
} from './types';

// store & actions
export {
  useProfileStore, useProfile, summarize, getProfile, recordSolve, recordBurn, recordBlitz, recordGauntlet,
  PROFILE_STORE_KEY, PROFILE_STORE_VERSION, type ProfileStore, type ProfileActions, type ProfileSummary,
} from './store';

// pure logic
export {
  applySolve, applyBurn, applyBlitz, applyGauntlet, emptyProfile, normalizeProfile, advanceStreak, liveStreak,
  computeStats, isCatalogueCase, HISTORY_LIMIT, type ProfileStats,
} from './logic';
export {
  RANKS, RANK_BY_ID, rankForXp, rankProgress, rankThreshold, computeSolveXp, blitzRunXp, gauntletRunXp,
  TIER_BASE, STAR_MULT, VARIANT_MULT, FIRST_SOLVE_BONUS, DAILY_BONUS, ZEN_MULT, RUN_CASE_MULT, LEGEND_XP, GAUNTLET_STAGES,
  TIER_LABEL, VARIANT_LABEL, MODE_LABEL, type RankProgress,
} from './xp';
export {
  ACHIEVEMENTS, ACHIEVEMENT_BY_ID, ACHIEVEMENT_TIERS, ALL_VARIANTS, CASES_PER_DISTRICT, casesInDistrict, achievementProgress, pendingAchievements,
  type AchievementStatus,
} from './achievements';
export { DISTRICT_ACHIEVEMENT_ICONS } from './types';
export { localISODate, isoWeekKey, dayDiff, addDays, lastNDays } from './dates';
export { makeDemoProfile } from './demo';

// UI
export { ProfileScreen, type ProfileScreenProps } from './ProfileScreen';
export { RankChip, type RankChipProps } from './RankChip';
export { RankInsignia, type RankInsigniaProps } from './RankInsignia';
export { RankUpCelebration, type RankUpCelebrationProps } from './RankUpCelebration';
export { AchievementToast, useAchievementToasts, pushAchievementToasts, Medallion, type AchievementToastProps, type ToastItem } from './AchievementToast';
export { XpCountUp, type XpCountUpProps } from './XpCountUp';
export { XpFilament, type XpFilamentProps } from './XpFilament';
export { ACHIEVEMENT_ICONS, VARIANT_ICONS, districtIcon } from './icons';
export { FP, METAL, fmtTime } from './theme';

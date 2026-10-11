import type { PlayMode, Tier, Variant } from '../types';

/** What the desk / modes report when a case is closed. */
export interface SolveRecord {
  puzzleId: string;
  /** District id (DISTRICTS[i].id) — the engine seasonId. */
  district: string;
  tier: Tier;
  variant: Variant;
  mode: PlayMode;
  /** Plan size N (N×N). */
  size: number;
  timeMs: number;
  parSeconds: number;
  /** 0 in Zen (no stars). */
  stars: 0 | 1 | 2 | 3;
  /** "Ask Otto" hints used. */
  otto: number;
  /** Reveals used. */
  reveals: number;
  /** First time this puzzle id was ever solved (drives the first-solve bonus). */
  firstSolve: boolean;
  /** Optional: did the player use pencil notes? Only an explicit `false` counts for "No Pencil Needed". */
  pencilUsed?: boolean;
  /** Epoch ms; defaults to now. */
  at?: number;
}

export interface BurnRecord {
  puzzleId: string;
  district: string;
  tier: Tier;
  variant: Variant;
  mode: PlayMode;
  at?: number;
}

/** Compact history entry (persisted, last 2,000 kept). */
export interface SolveEntry {
  id: string;
  district: string;
  tier: Tier;
  variant: Variant;
  mode: PlayMode;
  size: number;
  timeMs: number;
  par: number;
  stars: 0 | 1 | 2 | 3;
  otto: number;
  reveals: number;
  xp: number;
  at: number;
}

export interface BurnEntry {
  id: string;
  district: string;
  tier: Tier;
  variant: Variant;
  mode: PlayMode;
  at: number;
}

export interface SizeStat {
  /** timed solves (Zen excluded) */
  n: number;
  sumMs: number;
  bestMs: number;
}

export interface Counters {
  solves: number;
  burns: number;
  byTier: Partial<Record<Tier, number>>;
  byDistrict: Record<string, number>;
  byVariant: Partial<Record<Variant, number>>;
  byMode: Partial<Record<PlayMode, number>>;
  /** distinct catalogue cases (`<district>-<tier>-<n>`) solved per district — District Complete */
  uniqueByDistrict: Record<string, number>;
  bySize: Record<string, SizeStat>;
  threeStars: number;
  /** solved without Ask Otto and without Reveal */
  noOtto: number;
  nightShift: number;
  speedOfThought: number;
  noPencil: number;
  burnSurvivor: number;
  maxSize: number;
  blitzRuns: number;
  gauntletRuns: number;
  gauntletClears: number;
}

export interface StreakState {
  current: number;
  best: number;
  /** last local date with a solve */
  last: string | null;
}

export interface WeeklyRecord {
  timeMs: number;
  stars: 0 | 1 | 2 | 3;
  at: number;
}

/** The persisted profile (store `bureau-profile-v1`). */
export interface ProfileData {
  xp: number;
  solves: SolveEntry[];
  burns: BurnEntry[];
  streak: StreakState;
  /** Calendar: local date → solves that day (keys = the set of active dates). */
  activity: Record<string, number>;
  /** Local dates on which the Daily case was solved. */
  dailyDates: Record<string, 1>;
  blitzBest: number;
  gauntletBest: number;
  /** ISO week (`2026W41`) → best Weekly Mastermind result. */
  weekly: Record<string, WeeklyRecord>;
  solvedIds: Record<string, 1>;
  /** Burned and not yet redeemed. */
  burnedIds: Record<string, 1>;
  counters: Counters;
  /** achievement id → unlocked at (epoch ms) */
  unlocked: Record<string, number>;
  createdAt: number;
}

export interface XpLine {
  label: string;
  xp: number;
}

export interface Rank {
  id: RankId;
  index: number;
  name: string;
  minXp: number;
  metal: 'bronze' | 'silver' | 'gold' | 'platinum';
  /** main colour of the insignia */
  color: string;
}

export type RankId =
  | 'constable' | 'sergeant' | 'detective' | 'inspector'
  | 'chiefInspector' | 'superintendent' | 'commissioner' | 'legend';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** lucide-react icon name (see ACHIEVEMENT_ICONS in ./icons) */
  icon: AchievementIconName;
  tier: AchievementTier;
  /** Hidden until unlocked (still counted). */
  secret?: boolean;
  progress: (p: ProfileData) => { value: number; goal: number };
}

/** District building icons (District.icon) that District Complete badges may use; others fall back to Building2. */
export const DISTRICT_ACHIEVEMENT_ICONS = [
  'Castle', 'Anchor', 'Hotel', 'Landmark', 'Zap', 'GraduationCap', 'TrainFront', 'Telescope', 'Cake', 'Gem', 'FerrisWheel',
] as const;
export type DistrictIconName = (typeof DISTRICT_ACHIEVEMENT_ICONS)[number];

export type AchievementIconName =
  | 'Pin' | 'Sparkles' | 'Drama' | 'Users' | 'Copy' | 'Lock' | 'FlaskConical' | 'Crosshair'
  | 'Crown' | 'Moon' | 'Zap' | 'PencilOff' | 'Shield' | 'Timer' | 'Building2' | 'Flame'
  | 'FlameKindling' | 'Coffee' | 'Ruler' | 'Globe' | 'Award' | 'Medal' | 'Trophy' | 'Gem'
  | 'CalendarCheck' | 'Leaf' | 'Layers' | 'Map' | 'Star' | 'Footprints' | 'Gavel'
  | DistrictIconName;

export interface RecordOutcome {
  xpGained: number;
  breakdown: XpLine[];
  rankBefore: Rank;
  rankAfter: Rank;
  rankUp: boolean;
  /** newly unlocked this call */
  achievements: Achievement[];
}

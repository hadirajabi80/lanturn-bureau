/**
 * Achievements (brief §6). Pure data + progress functions over the persisted profile, so an
 * achievement unlocks exactly when `progress.value >= progress.goal` and is then frozen in
 * `profile.unlocked` (never re-announced).
 */
import { DISTRICTS } from '../skins/districts';
import type { District } from '../skins/types';
import type { Variant } from '../types';
import { TIERS } from '../types';
import { GAUNTLET_STAGES, RANKS } from './xp';
import { DISTRICT_ACHIEVEMENT_ICONS, type Achievement, type AchievementIconName, type AchievementTier, type ProfileData } from './types';

export const ALL_VARIANTS: Variant[] = ['classic', 'accomplice', 'lockedRoom', 'poison', 'sniper', 'liar', 'double', 'liarDouble', 'accompliceLiar'];

const v = (p: ProfileData, ...ks: Variant[]) => ks.reduce((s, k) => s + (p.counters.byVariant[k] ?? 0), 0);
const n = (value: number, goal: number) => ({ value: Math.min(value, goal), goal });

/** Catalogue size of a district (sum of its per-tier counts; 130 today). */
export const casesInDistrict = (d: Pick<District, 'casesPerTier'>): number =>
  Object.values(d.casesPerTier).reduce((s, k) => s + k, 0);

/** Default catalogue size (kept for callers that don't have a District handy). */
export const CASES_PER_DISTRICT = DISTRICTS.length ? casesInDistrict(DISTRICTS[0]) : 130;

/** Extra Extreme catalogue ids (`<district>-ultra-<n>`, n within the district's ultra count). */
const ULTRA_ID = /^(.+)-ultra-([0-9]+)$/;
const ULTRA_COUNT: Record<string, number> = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.casesPerTier.ultra ?? 0]));
/** Total Extra Extreme cases in the catalogue (110 today). */
export const ULTRA_CASES_TOTAL = DISTRICTS.reduce((s, d) => s + (d.casesPerTier.ultra ?? 0), 0);
/** Most Extra Extreme cases in one district (10 today). */
const ULTRA_PER_DISTRICT = Math.max(1, ...DISTRICTS.map((d) => d.casesPerTier.ultra ?? 0));

/** Distinct Extra Extreme catalogue cases solved: per district and in total. */
export function ultraSolved(p: ProfileData): { perDistrict: Record<string, number>; total: number } {
  const perDistrict: Record<string, number> = {};
  let total = 0;
  for (const id of Object.keys(p.solvedIds)) {
    const m = ULTRA_ID.exec(id);
    if (!m) continue;
    const d = m[1] as string;
    const k = Number(m[2]);
    if (!(k >= 1 && k <= (ULTRA_COUNT[d] ?? 0))) continue;
    perDistrict[d] = (perDistrict[d] ?? 0) + 1;
    total++;
  }
  return { perDistrict, total };
}

/** Flavour titles for "District Complete"; unknown/new districts fall back to "<name>: Closed". */
const DISTRICT_TITLES: Record<string, string> = {
  ashcombe: 'Lord of the Manor',
  harrow: 'Harbour Master',
  meridian: 'Gilded Guest',
  curiosities: 'Curator of Crime',
  neon: 'Neon Noir',
  hollowmere: 'Head of House',
  express: 'End of the Line',
  frostmere: 'Star Witness',
  rosewater: 'Sweet Tooth',
  lacewing: 'Couture Sleuth',
  candyfloss: 'Ring Toss Champion',
};

const DISTRICT_ICON_NAMES = new Set<string>(DISTRICT_ACHIEVEMENT_ICONS);
const districtIconName = (icon: string): AchievementIconName =>
  DISTRICT_ICON_NAMES.has(icon) ? (icon as AchievementIconName) : 'Building2';

/** One "District Complete" per entry in DISTRICTS (derived — adding a district adds a badge). */
const districtAchievements: Achievement[] = DISTRICTS.map((d) => {
  const goal = casesInDistrict(d);
  return {
    id: `district-${d.id}`,
    title: DISTRICT_TITLES[d.id] ?? `${d.name}: Closed`,
    description: `Solve all ${goal} cases in ${d.name}.`,
    icon: districtIconName(d.icon),
    tier: 'gold' as AchievementTier,
    progress: (p: ProfileData) => n(p.counters.uniqueByDistrict[d.id] ?? 0, goal),
  };
});

export const ACHIEVEMENTS: Achievement[] = [
  // ── first steps ──
  { id: 'first-pin', title: 'First Pin', description: 'Close your first case.', icon: 'Pin', tier: 'bronze', progress: (p) => n(p.counters.solves, 1) },
  { id: 'gold-star', title: 'By the Book', description: 'Earn three stars on a case.', icon: 'Star', tier: 'bronze', progress: (p) => n(p.counters.threeStars, 1) },
  { id: 'cases-10', title: 'Settling In', description: 'Close 10 cases.', icon: 'Footprints', tier: 'bronze', progress: (p) => n(p.counters.solves, 10) },
  { id: 'night-shift', title: 'Night Shift', description: 'Close a case between midnight and 5 a.m.', icon: 'Moon', tier: 'bronze', progress: (p) => n(p.counters.nightShift, 1) },
  { id: 'burn-survivor', title: 'From the Ashes', description: 'Solve a case you burned before.', icon: 'FlameKindling', tier: 'bronze', progress: (p) => n(p.counters.burnSurvivor, 1) },
  { id: 'daily-10', title: 'Morning Paper', description: "Solve 10 of Today's cases.", icon: 'Coffee', tier: 'bronze', progress: (p) => n(Object.keys(p.dailyDates).length, 10) },
  { id: 'zen-25', title: 'Still Waters', description: 'Close 25 cases in Zen.', icon: 'Leaf', tier: 'bronze', progress: (p) => n(p.counters.byMode.zen ?? 0, 25) },

  // ── scenarios ──
  { id: 'liar-liar', title: 'Liar Liar', description: 'Unmask the liar in 10 cases.', icon: 'Drama', tier: 'silver', progress: (p) => n(v(p, 'liar', 'liarDouble', 'accompliceLiar'), 10) },
  { id: 'partners-in-crime', title: 'Partners in Crime', description: 'Name killer and accomplice in 10 cases.', icon: 'Users', tier: 'silver', progress: (p) => n(v(p, 'accomplice', 'accompliceLiar'), 10) },
  { id: 'double-trouble', title: 'Double Trouble', description: 'Solve 10 double homicides.', icon: 'Copy', tier: 'silver', progress: (p) => n(v(p, 'double', 'liarDouble'), 10) },
  { id: 'locked-in', title: 'Locked In', description: 'Solve 10 locked-room cases.', icon: 'Lock', tier: 'silver', progress: (p) => n(v(p, 'lockedRoom'), 10) },
  { id: 'poison-pen', title: 'Poison Pen', description: 'Solve 10 poisonings.', icon: 'FlaskConical', tier: 'silver', progress: (p) => n(v(p, 'poison'), 10) },
  { id: 'eagle-eye', title: 'Eagle Eye', description: 'Solve 10 sniper cases.', icon: 'Crosshair', tier: 'silver', progress: (p) => n(v(p, 'sniper'), 10) },
  {
    id: 'polyglot', title: 'Polyglot of Scenarios', description: 'Solve every kind of scenario at least once.', icon: 'Globe', tier: 'gold',
    progress: (p) => n(ALL_VARIANTS.filter((k) => (p.counters.byVariant[k] ?? 0) > 0).length, ALL_VARIANTS.length),
  },

  // ── skill ──
  { id: 'clean-sweep', title: 'Clean Sweep', description: 'Earn three stars on 30 cases.', icon: 'Sparkles', tier: 'gold', progress: (p) => n(p.counters.threeStars, 30) },
  { id: 'ottos-favourite', title: "Otto's Favourite", description: 'Close 20 cases without asking Otto or revealing anyone.', icon: 'Award', tier: 'silver', progress: (p) => n(p.counters.noOtto, 20) },
  { id: 'no-pencil', title: 'No Pencil Needed', description: 'Solve a 7×7 or larger plan without a single pencil note.', icon: 'PencilOff', tier: 'silver', progress: (p) => n(p.counters.noPencil, 1) },
  { id: 'speed-of-thought', title: 'Speed of Thought', description: 'Solve a 9×9 or larger plan in under half of par.', icon: 'Zap', tier: 'gold', progress: (p) => n(p.counters.speedOfThought, 1) },
  { id: 'big-plans', title: 'Big Plans', description: 'Solve a 14×14 plan.', icon: 'Ruler', tier: 'gold', progress: (p) => n(p.counters.maxSize >= 14 ? 1 : 0, 1) },
  { id: 'mastermind', title: 'Mastermind', description: 'Solve a case on the roof (Mastermind tier).', icon: 'Crown', tier: 'gold', progress: (p) => n(p.counters.byTier.mastermind ?? 0, 1) },
  { id: 'mastermind-10', title: 'Roof Regular', description: 'Solve 10 Mastermind cases.', icon: 'Gem', tier: 'platinum', progress: (p) => n(p.counters.byTier.mastermind ?? 0, 10) },
  { id: 'every-floor', title: 'Every Floor', description: 'Solve a case on every floor, Rookie to the sealed attic.', icon: 'Layers', tier: 'silver', progress: (p) => n(TIERS.filter((t) => (p.counters.byTier[t] ?? 0) > 0).length, TIERS.length) },
  // ── the sealed attic (Extra Extreme) ──
  { id: 'attic-dweller', title: 'Attic Dweller', description: 'Solve an Extra Extreme case in the sealed attic.', icon: 'KeyRound', tier: 'gold', progress: (p) => n(p.counters.byTier.ultra ?? 0, 1) },
  {
    id: 'sealed-shut', title: 'Sealed Shut', description: `Solve all ${ULTRA_PER_DISTRICT} Extra Extreme cases in one district.`, icon: 'LockKeyhole', tier: 'platinum',
    progress: (p) => n(Math.max(0, ...Object.values(ultraSolved(p).perDistrict)), ULTRA_PER_DISTRICT),
  },
  { id: 'no-coordinates', title: 'No Coordinates Needed', description: 'Solve 20 Extra Extreme cases.', icon: 'MapPinOff', tier: 'platinum', progress: (p) => n(p.counters.byTier.ultra ?? 0, 20) },
  {
    id: 'grand-attic', title: 'Grand Attic', description: `Solve all ${ULTRA_CASES_TOTAL} Extra Extreme cases.`, icon: 'Skull', tier: 'platinum',
    progress: (p) => n(ultraSolved(p).total, ULTRA_CASES_TOTAL),
  },
  { id: 'grand-tour', title: 'Grand Tour', description: `Solve a case in all ${DISTRICTS.length} districts.`, icon: 'Map', tier: 'silver', progress: (p) => n(DISTRICTS.filter((d) => (p.counters.byDistrict[d.id] ?? 0) > 0).length, DISTRICTS.length) },

  // ── modes ──
  { id: 'gauntlet-survivor', title: 'Gauntlet Survivor', description: `Clear all ${GAUNTLET_STAGES} floors of the Gauntlet.`, icon: 'Shield', tier: 'gold', progress: (p) => n(p.gauntletBest, GAUNTLET_STAGES) },
  { id: 'blitz-10', title: 'Blitz 10', description: 'Close 10 cases in a single Blitz run.', icon: 'Timer', tier: 'gold', progress: (p) => n(p.blitzBest, 10) },
  { id: 'weekly', title: 'Weekly Mastermind', description: 'Solve a Weekly Mastermind case.', icon: 'Gavel', tier: 'gold', progress: (p) => n(p.counters.byMode.weekly ?? 0, 1) },

  // ── streaks ──
  { id: 'week-streak', title: 'Week-long Streak', description: 'Close a case 7 days in a row.', icon: 'Flame', tier: 'silver', progress: (p) => n(p.streak.best, 7) },
  { id: 'month-streak', title: 'Lamp Never Out', description: 'Close a case 30 days in a row.', icon: 'CalendarCheck', tier: 'gold', progress: (p) => n(p.streak.best, 30) },

  // ── volume ──
  { id: 'cases-100', title: 'Century', description: 'Close 100 cases.', icon: 'Medal', tier: 'silver', progress: (p) => n(p.counters.solves, 100) },
  { id: 'cases-500', title: 'Casebook', description: 'Close 500 cases.', icon: 'Trophy', tier: 'gold', progress: (p) => n(p.counters.solves, 500) },
  { id: 'cases-1000', title: 'One Thousand Files', description: 'Close 1,000 cases.', icon: 'Trophy', tier: 'platinum', progress: (p) => n(p.counters.solves, 1000) },
  { id: 'legend', title: 'Legend of Greywick', description: 'Reach the rank of Legend.', icon: 'Crown', tier: 'platinum', progress: (p) => n(p.xp, RANKS[RANKS.length - 1].minXp) },

  // ── districts ──
  ...districtAchievements,
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const ACHIEVEMENT_TIERS: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export interface AchievementStatus {
  value: number;
  goal: number;
  pct: number;
  unlocked: boolean;
  at?: number;
}

export function achievementProgress(a: Achievement, p: ProfileData): AchievementStatus {
  const at = p.unlocked[a.id];
  const { value, goal } = a.progress(p);
  return { value: at ? goal : value, goal, pct: at ? 1 : goal > 0 ? Math.min(1, value / goal) : 0, unlocked: !!at, at };
}

/** Achievements whose goal is met but are not yet in `p.unlocked`. */
export function pendingAchievements(p: ProfileData): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    if (p.unlocked[a.id]) return false;
    const { value, goal } = a.progress(p);
    return value >= goal;
  });
}

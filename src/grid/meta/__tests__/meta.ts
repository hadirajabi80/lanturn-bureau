/**
 * Pure-logic tests for the profile meta layer. Run: `npx tsx src/grid/meta/__tests__/meta.ts`
 * (exits 1 on failure). No React, no storage.
 */
import { DISTRICTS } from '../../skins/districts';
import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID, casesInDistrict } from '../achievements';
import { ACHIEVEMENT_ICONS } from '../icons';
import { addDays, dayDiff, isoWeekKey, lastNDays, localISODate } from '../dates';
import { HISTORY_LIMIT, advanceStreak, applyBlitz, applyBurn, applyGauntlet, applySolve, computeStats, emptyProfile, liveStreak, normalizeProfile } from '../logic';
import type { ProfileData, SolveRecord } from '../types';
import { RANKS, VARIANT_MULT, computeSolveXp, rankForXp, rankProgress } from '../xp';

let failed = 0;
let passed = 0;
function ok(cond: unknown, msg: string): void {
  if (cond) passed++;
  else {
    failed++;
    console.error('  ✗ ' + msg);
  }
}
function eq<T>(a: T, b: T, msg: string): void {
  ok(JSON.stringify(a) === JSON.stringify(b), `${msg} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
}
function section(name: string, fn: () => void): void {
  console.log('• ' + name);
  fn();
}

/** local-time timestamp for y-m-d h:mm */
const T = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();

const rec = (over: Partial<SolveRecord> = {}): SolveRecord => ({
  puzzleId: 'ashcombe-easy-1', district: 'ashcombe', tier: 'easy', variant: 'classic', mode: 'case', size: 5,
  timeMs: 200_000, parSeconds: 120, stars: 1, otto: 1, reveals: 0, firstSolve: false, at: T(2026, 10, 11), ...over,
});

const sum = (lines: { xp: number }[]) => lines.reduce((s, l) => s + l.xp, 0);

section('XP math', () => {
  // easy 1★ classic, no bonuses, over par
  eq(computeSolveXp(rec()).total, 20, 'easy 1-star classic = 20');
  // easy 3★ = 40
  eq(computeSolveXp(rec({ stars: 3 })).total, 40, 'easy 3-star = 40');
  // medium 2★ lockedRoom: 35*1.4*1.15 = 56.35 → 56
  eq(computeSolveXp(rec({ tier: 'medium', stars: 2, variant: 'lockedRoom' })).total, 56, 'medium 2★ lockedRoom = 56');
  // mastermind 3★ liarDouble: 180*2*1.8 = 648; first solve +324 = 972
  eq(computeSolveXp(rec({ tier: 'mastermind', stars: 3, variant: 'liarDouble', firstSolve: true })).total, 972, 'mastermind 3★ liarDouble first = 972');
  // daily first: easy 1★ = 20 + 10 first + 50 daily = 80
  eq(computeSolveXp(rec({ mode: 'daily', firstSolve: true })).total, 80, 'daily first-solve = 80');
  // daily replay: no daily/first bonus
  eq(computeSolveXp(rec({ mode: 'daily', firstSolve: false })).total, 20, 'daily replay = 20');
  // under par: hard 3★ classic core 120, time = 0.5 par → +30
  eq(computeSolveXp(rec({ tier: 'hard', stars: 3, timeMs: 60_000, parSeconds: 120 })).total, 150, 'under-par bonus = +25% at half par');
  // zen: 25% of (extreme 100 + first 50) = 37.5 → 38; stars ignored
  eq(computeSolveXp(rec({ tier: 'extreme', mode: 'zen', stars: 3, firstSolve: true })).total, 38, 'zen pays 25%');
  // blitz: 60% of easy 3★ (40 + under-par 0) = 24
  eq(computeSolveXp(rec({ mode: 'blitz', stars: 3 })).total, 24, 'blitz case ×0.6');
  // breakdown always sums to the total
  for (const tier of ['easy', 'medium', 'hard', 'extreme', 'mastermind'] as const) {
    for (const variant of Object.keys(VARIANT_MULT) as (keyof typeof VARIANT_MULT)[]) {
      for (const stars of [0, 1, 2, 3] as const) {
        for (const mode of ['case', 'daily', 'zen', 'blitz', 'gauntlet'] as const) {
          const r = computeSolveXp(rec({ tier, variant, stars, mode, firstSolve: stars === 2, timeMs: 30_000 }));
          if (sum(r.breakdown) !== r.total || r.total < 1) ok(false, `breakdown sum ${tier}/${variant}/${stars}/${mode}`);
        }
      }
    }
  }
  ok(true, 'breakdown sums');
  // variant multiplier ordering
  ok(VARIANT_MULT.classic < VARIANT_MULT.poison && VARIANT_MULT.poison < VARIANT_MULT.sniper && VARIANT_MULT.sniper < VARIANT_MULT.liar && VARIANT_MULT.liar < VARIANT_MULT.double && VARIANT_MULT.double < VARIANT_MULT.liarDouble, 'variant mults ordered');
});

section('Ranks', () => {
  eq(RANKS.map((r) => r.name), ['Constable', 'Sergeant', 'Detective', 'Inspector', 'Chief Inspector', 'Superintendent', 'Commissioner', 'Legend'], 'rank names');
  eq(RANKS[0].minXp, 0, 'Constable starts at 0');
  for (let i = 1; i < RANKS.length; i++) ok(RANKS[i].minXp > RANKS[i - 1].minXp, `threshold ${i} increasing`);
  for (let i = 2; i < RANKS.length; i++) {
    ok(RANKS[i].minXp - RANKS[i - 1].minXp > RANKS[i - 1].minXp - (RANKS[i - 2]?.minXp ?? 0), `rank gaps grow (${i})`);
  }
  const legend = RANKS[RANKS.length - 1].minXp;
  ok(legend / 160 > 500 && legend / 160 < 750, `Legend ≈ 600 average solves (${Math.round(legend / 160)})`);
  eq(rankForXp(0).id, 'constable', 'xp 0 → constable');
  eq(rankForXp(RANKS[3].minXp - 1).index, 2, 'just below Inspector');
  eq(rankForXp(RANKS[3].minXp).index, 3, 'exactly Inspector');
  eq(rankForXp(10_000_000).id, 'legend', 'huge xp → Legend');
  const rp = rankProgress(RANKS[1].minXp + 10);
  eq([rp.xpInRank, rp.xpForNext], [10, RANKS[2].minXp - RANKS[1].minXp], 'rank progress');
  eq(rankProgress(legend + 5).pct, 1, 'Legend pct = 1');
  let last = -1;
  for (let x = 0; x <= legend + 1000; x += 37) {
    const i = rankForXp(x).index;
    if (i < last) ok(false, 'rankForXp monotonic');
    last = i;
  }
});

section('Dates & streak', () => {
  eq(localISODate(T(2026, 3, 29, 0, 30)), '2026-03-29', 'local date just after midnight');
  eq(localISODate(T(2026, 3, 29, 23, 59)), '2026-03-29', 'local date just before midnight');
  eq(dayDiff('2026-03-28', '2026-03-30'), 2, 'dayDiff across EU DST change');
  eq(dayDiff('2026-10-31', '2026-11-02'), 2, 'dayDiff across US DST change');
  eq(dayDiff('2026-12-31', '2027-01-01'), 1, 'dayDiff across year');
  eq(addDays('2028-02-28', 1), '2028-02-29', 'leap day');
  eq(addDays('2026-03-01', -1), '2026-02-28', 'addDays back');
  eq(lastNDays('2026-10-11', 3), ['2026-10-09', '2026-10-10', '2026-10-11'], 'lastNDays');
  eq(isoWeekKey('2026-10-11'), '2026W41', 'iso week 2026-10-11');
  eq(isoWeekKey('2021-01-03'), '2020W53', 'iso week year boundary');
  eq(isoWeekKey('2024-12-30'), '2025W01', 'iso week belongs to next year');

  let s = { current: 0, best: 0, last: null as string | null };
  s = advanceStreak(s, '2026-10-01');
  eq(s.current, 1, 'first day');
  s = advanceStreak(s, '2026-10-01');
  eq(s.current, 1, 'same day no change');
  s = advanceStreak(s, '2026-10-02');
  s = advanceStreak(s, '2026-10-03');
  eq([s.current, s.best], [3, 3], 'three days');
  s = advanceStreak(s, '2026-10-05');
  eq([s.current, s.best], [1, 3], 'gap resets, best kept');
  eq(liveStreak(s, '2026-10-05'), 1, 'live today');
  eq(liveStreak(s, '2026-10-06'), 1, 'live yesterday');
  eq(liveStreak(s, '2026-10-07'), 0, 'dead after a missed day');
  s = advanceStreak(s, '2026-10-04');
  eq(s.last, '2026-10-05', 'out-of-order date ignored');

  // through the reducer, solves at 23:59 and 00:01 are consecutive local days
  let p = emptyProfile(T(2026, 10, 1));
  p = applySolve(p, rec({ at: T(2026, 10, 1, 23, 59) })).profile;
  p = applySolve(p, rec({ at: T(2026, 10, 2, 0, 1) })).profile;
  eq(p.streak.current, 2, 'midnight crossing = 2-day streak');
  eq(Object.keys(p.activity).sort(), ['2026-10-01', '2026-10-02'], 'calendar set');
  // 7-day streak across the EU DST switch
  let q = emptyProfile();
  for (let d = 0; d < 7; d++) q = applySolve(q, rec({ at: new Date(2026, 2, 25 + d, 9).getTime() })).profile;
  eq(q.streak.current, 7, 'streak across DST');
  ok(!!q.unlocked['week-streak'], 'week-long streak unlocked');
});

section('Achievements unlock exactly once', () => {
  ok(ACHIEVEMENTS.length >= 30, `>= 30 achievements (${ACHIEVEMENTS.length})`);
  eq(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length, 'unique ids');
  let p: ProfileData = emptyProfile();
  const first = applySolve(p, rec());
  ok(first.outcome.achievements.some((a) => a.id === 'first-pin'), 'First Pin on first solve');
  p = first.profile;
  const second = applySolve(p, rec({ at: T(2026, 10, 11, 13) }));
  ok(!second.outcome.achievements.some((a) => a.id === 'first-pin'), 'First Pin not re-announced');
  p = second.profile;
  const firstAt = p.unlocked['first-pin'];
  for (let i = 0; i < 9; i++) p = applySolve(p, rec({ variant: 'liar', tier: 'hard' })).profile;
  eq(p.unlocked['first-pin'], firstAt, 'unlock timestamp frozen');
  const tenth = applySolve(p, rec({ variant: 'liar', tier: 'hard' }));
  eq(tenth.outcome.achievements.filter((a) => a.id === 'liar-liar').length, 1, 'Liar Liar on 10th liar case');
  p = tenth.profile;
  const eleventh = applySolve(p, rec({ variant: 'liar', tier: 'hard' }));
  ok(!eleventh.outcome.achievements.some((a) => a.id === 'liar-liar'), 'Liar Liar once');

  // night shift / speed / no pencil / big plans / burn survivor
  let r = applySolve(emptyProfile(), rec({ at: T(2026, 10, 11, 3, 15) }));
  ok(r.outcome.achievements.some((a) => a.id === 'night-shift'), 'Night Shift at 03:15');
  r = applySolve(emptyProfile(), rec({ at: T(2026, 10, 11, 5, 0) }));
  ok(!r.outcome.achievements.some((a) => a.id === 'night-shift'), 'no Night Shift at 05:00');
  r = applySolve(emptyProfile(), rec({ size: 9, tier: 'hard', parSeconds: 600, timeMs: 299_000, stars: 3 }));
  ok(r.outcome.achievements.some((a) => a.id === 'speed-of-thought'), 'Speed of Thought');
  r = applySolve(emptyProfile(), rec({ size: 8, parSeconds: 600, timeMs: 100_000 }));
  ok(!r.outcome.achievements.some((a) => a.id === 'speed-of-thought'), 'no Speed of Thought below 9×9');
  r = applySolve(emptyProfile(), rec({ size: 7, pencilUsed: false }));
  ok(r.outcome.achievements.some((a) => a.id === 'no-pencil'), 'No Pencil Needed');
  r = applySolve(emptyProfile(), rec({ size: 7 }));
  ok(!r.outcome.achievements.some((a) => a.id === 'no-pencil'), 'pencil unknown ≠ no pencil');
  r = applySolve(emptyProfile(), rec({ size: 14, tier: 'mastermind', variant: 'double' }));
  ok(r.outcome.achievements.some((a) => a.id === 'big-plans') && r.outcome.achievements.some((a) => a.id === 'mastermind'), 'Big Plans + Mastermind');
  let b = applyBurn(emptyProfile(), { puzzleId: 'neon-hard-3', district: 'neon', tier: 'hard', variant: 'sniper', mode: 'case' }).profile;
  eq(b.counters.burns, 1, 'burn counted');
  const surv = applySolve(b, rec({ puzzleId: 'neon-hard-3', district: 'neon', tier: 'hard', variant: 'sniper' }));
  ok(surv.outcome.achievements.some((a) => a.id === 'burn-survivor'), 'Burn Survivor');
  b = surv.profile;
  eq(b.burnedIds['neon-hard-3'], undefined, 'burn redeemed');

  // Blitz 10 / Gauntlet
  let m = applyBlitz(emptyProfile(), 9);
  ok(!m.outcome.achievements.some((a) => a.id === 'blitz-10') && m.newBest, 'blitz 9: no badge, new best');
  m = applyBlitz(m.profile, 10);
  ok(m.outcome.achievements.some((a) => a.id === 'blitz-10'), 'Blitz 10');
  m = applyBlitz(m.profile, 12);
  ok(!m.outcome.achievements.some((a) => a.id === 'blitz-10'), 'Blitz 10 once');
  eq(m.profile.blitzBest, 12, 'blitz best');
  const g = applyGauntlet(emptyProfile(), 7);
  ok(g.outcome.achievements.some((a) => a.id === 'gauntlet-survivor') && g.outcome.xpGained === 490 + 250, 'Gauntlet survivor + run XP');

  // District complete: 130 distinct catalogue cases, duplicates don't count
  let dp = emptyProfile();
  const tiers = [['easy', 30], ['medium', 30], ['hard', 30], ['extreme', 30], ['mastermind', 10]] as const;
  let unlockedCount = 0;
  for (const [tier, count] of tiers) {
    for (let i = 1; i <= count; i++) {
      const o = applySolve(dp, rec({ puzzleId: `harrow-${tier}-${i}`, district: 'harrow', tier, firstSolve: true }));
      dp = o.profile;
      unlockedCount += o.outcome.achievements.filter((a) => a.id === 'district-harrow').length;
      if (i === 1) {
        const dup = applySolve(dp, rec({ puzzleId: `harrow-${tier}-${i}`, district: 'harrow', tier }));
        dp = dup.profile;
      }
    }
  }
  eq(dp.counters.uniqueByDistrict.harrow, 130, '130 unique');
  eq(unlockedCount, 1, 'District Complete exactly once');
  // District badges are derived from DISTRICTS (11 today incl. the light-mood IX–XI)
  const districtBadges = ACHIEVEMENTS.filter((a) => a.id.startsWith('district-'));
  eq(districtBadges.length, DISTRICTS.length, 'one District Complete per DISTRICTS entry');
  for (const d of DISTRICTS) {
    const a = ACHIEVEMENT_BY_ID[`district-${d.id}`];
    ok(!!a, `badge for ${d.id}`);
    if (!a) continue;
    ok(!!ACHIEVEMENT_ICONS[a.icon], `icon resolves for ${d.id}`);
    eq(a.progress(emptyProfile()).goal, casesInDistrict(d), `goal = catalogue size for ${d.id}`);
  }
  eq(
    ['rosewater', 'lacewing', 'candyfloss'].map((id) => [ACHIEVEMENT_BY_ID[`district-${id}`]?.title, ACHIEVEMENT_BY_ID[`district-${id}`]?.icon]),
    [['Sweet Tooth', 'Cake'], ['Couture Sleuth', 'Gem'], ['Ring Toss Champion', 'FerrisWheel']],
    'light-mood district badges',
  );
  eq(ACHIEVEMENT_BY_ID['grand-tour'].progress(emptyProfile()).goal, DISTRICTS.length, 'Grand Tour goal = district count');
  const ds = computeStats(emptyProfile());
  eq(ds.byDistrict.length, DISTRICTS.length, 'stats rows per district');
  ok(ds.byDistrict.filter((r) => r.light).length >= 3, 'light districts flagged in stats');

  // Polyglot
  let pg = emptyProfile();
  for (const variant of Object.keys(VARIANT_MULT) as (keyof typeof VARIANT_MULT)[]) pg = applySolve(pg, rec({ variant })).profile;
  ok(!!pg.unlocked.polyglot, 'Polyglot of Scenarios');

  // no achievement unlocked twice across a long random run
  let rp = emptyProfile();
  const seen = new Map<string, number>();
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const variants = Object.keys(VARIANT_MULT) as (keyof typeof VARIANT_MULT)[];
  for (let i = 0; i < 1200; i++) {
    const o = applySolve(rp, rec({
      variant: variants[Math.floor(rnd() * variants.length)], stars: (1 + Math.floor(rnd() * 3)) as 1 | 2 | 3,
      otto: rnd() < 0.5 ? 0 : 1, at: T(2026, 1, 1) + i * 3_600_000 * 7, firstSolve: rnd() < 0.5,
    }));
    rp = o.profile;
    for (const a of o.outcome.achievements) seen.set(a.id, (seen.get(a.id) ?? 0) + 1);
  }
  ok([...seen.values()].every((c) => c === 1), 'each achievement announced at most once');
  ok(!!rp.unlocked['cases-1000'], '1,000 cases');
  eq(rp.solves.length, 1200, 'history below limit');
});

section('History cap, normalize, stats', () => {
  let p = emptyProfile();
  for (let i = 0; i < HISTORY_LIMIT + 25; i++) p = applySolve(p, rec({ at: T(2026, 1, 1) + i * 60_000 })).profile;
  eq(p.solves.length, HISTORY_LIMIT, 'history capped at 2,000');
  eq(p.counters.solves, HISTORY_LIMIT + 25, 'counters keep lifetime totals');
  const n = normalizeProfile({ xp: 50, counters: { solves: 3 } });
  eq([n.xp, n.counters.solves, n.counters.burns, n.streak.current], [50, 3, 0, 0], 'normalize fills defaults');
  eq(normalizeProfile(null).xp, 0, 'normalize null');
  let s = applySolve(emptyProfile(), rec({ size: 6, timeMs: 90_000 })).profile;
  s = applySolve(s, rec({ size: 6, timeMs: 30_000 })).profile;
  s = applyBurn(s, { puzzleId: 'x', district: 'ashcombe', tier: 'easy', variant: 'classic', mode: 'case', at: T(2026, 10, 11, 14) }).profile;
  const st = computeStats(s, T(2026, 10, 11, 18));
  const six = st.bySize.find((r) => r.size === 6)!;
  eq([six.count, six.bestMs, six.avgMs], [2, 30_000, 60_000], 'size stats');
  eq(Math.round(st.accuracy * 100), 67, 'accuracy = solves/(solves+burns)');
  eq(st.activity30.length, 30, '30-day activity');
  eq(st.calendar14[13], { date: '2026-10-11', count: 2, daily: false, today: true }, 'calendar today');
  eq(st.recent[0].kind, 'burn', 'recent sorted by time');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);

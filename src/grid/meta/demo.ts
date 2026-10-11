/**
 * Deterministic fake profile for previews / screenshots / other agents' storybook-style harnesses.
 * `useProfileStore.getState().replaceProfile(makeDemoProfile())`.
 */
import { DISTRICTS } from '../skins/districts';
import { VARIANTS_BY_TIER, type PlayMode, type Tier } from '../types';
import { applyBlitz, applyBurn, applyGauntlet, applySolve, emptyProfile } from './logic';
import type { ProfileData } from './types';

const SIZE: Record<Tier, [number, number]> = { easy: [4, 5], medium: [5, 7], hard: [7, 9], extreme: [9, 12], mastermind: [12, 14] };

export function makeDemoProfile(opts: { solves?: number; days?: number; seed?: number; now?: number } = {}): ProfileData {
  const { solves = 260, days = 75, now = Date.now() } = opts;
  let seed = opts.seed ?? 20261011;
  const rnd = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];
  const start = now - days * 86_400_000;
  let p = emptyProfile(start);
  const counters: Record<string, number> = {};
  const tiers: Tier[] = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard', 'extreme', 'mastermind'];
  for (let i = 0; i < solves; i++) {
    // spread over the window, skipping some days, last week dense (streak)
    const frac = i / solves;
    const at = Math.min(now - 60_000, start + frac * days * 86_400_000 + rnd() * 6 * 3_600_000);
    if (rnd() < 0.12 && now - at > 8 * 86_400_000) continue;
    const tier = pick(tiers);
    const district = pick(DISTRICTS).id;
    const variant = pick(VARIANTS_BY_TIER[tier]);
    const [lo, hi] = SIZE[tier];
    const size = lo + Math.floor(rnd() * (hi - lo + 1));
    const par = size * size * 6;
    const timeMs = Math.round(par * 1000 * (0.4 + rnd() * 1.6));
    const key = `${district}-${tier}`;
    const n = (counters[key] = (counters[key] ?? 0) + 1);
    const mode: PlayMode = rnd() < 0.1 ? 'daily' : rnd() < 0.06 ? 'zen' : 'case';
    const id = mode === 'daily' ? `DAILY-${new Date(at).toISOString().slice(0, 10)}` : `${district}-${tier}-${n}`;
    if (rnd() < 0.08) {
      p = applyBurn(p, { puzzleId: id, district, tier, variant, mode, at: at - 1_000 }).profile;
    }
    const otto = rnd() < 0.55 ? 0 : 1 + Math.floor(rnd() * 3);
    const reveals = rnd() < 0.85 ? 0 : 1;
    const stars = (reveals > 1 ? 1 : reveals === 1 ? 2 : otto <= 1 && timeMs < par * 1000 ? 3 : timeMs < par * 2000 ? 2 : 1) as 1 | 2 | 3;
    p = applySolve(p, {
      puzzleId: id, district, tier, variant, mode, size, timeMs, parSeconds: par, stars, otto, reveals,
      firstSolve: true, pencilUsed: rnd() < 0.85, at,
    }).profile;
  }
  p = applyBlitz(p, 8, now - 5 * 86_400_000).profile;
  p = applyGauntlet(p, 5, now - 3 * 86_400_000).profile;
  return p;
}

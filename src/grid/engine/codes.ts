/**
 * Case codes (brief §6): `ASH-I-12`, `DAILY-20261011`, `WEEK-2026W41`,
 * custom `C-<district3>-<tier1>-<size>-<variant>-<seed>`.
 * Tier letters: R D I C M U (Rookie, Detective, Inspector, Chief, Mastermind, Extra Extreme);
 * legacy E / H / X (easy / hard / extreme) are accepted when parsing.
 */
import type { District } from '../skins/types';
import { DISTRICTS, TIER_INFO, getDistrict } from '../skins/districts';
import type { Puzzle, Tier, Variant } from '../types';
import { TIERS } from '../types';
import { dailyPuzzle, generateCustom, generatePuzzle, normalizeCustom, resolveDistrictId, weeklyPuzzle } from './generator';
import { CASES_PER_TIER, parseIsoWeek } from './variants';

const KNOWN_CODES: Record<string, string> = {
  ashcombe: 'ASH', harrow: 'HAR', meridian: 'MER', curiosities: 'CUR', neon: 'NEO', hollowmere: 'HOL', express: 'EXP',
  frostmere: 'FRO', rosewater: 'ROS', lacewing: 'LAC', candyfloss: 'CAN',
};
/** District id → 3-letter code (districts without a fixed code use their first three letters). */
export const DISTRICT_CODES: Record<string, string> = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, KNOWN_CODES[d.id] ?? d.id.slice(0, 3).toUpperCase()]),
);
const CODE_TO_DISTRICT: Record<string, string> = Object.fromEntries(Object.entries(DISTRICT_CODES).map(([k, v]) => [v, k]));

export const TIER_LETTER: Record<Tier, string> = { easy: 'R', medium: 'D', hard: 'I', extreme: 'C', mastermind: 'M', ultra: 'U' };
/** X stays legacy extreme; Extra Extreme ('ultra') is U. */
const LETTER_TO_TIER: Record<string, Tier> = {
  R: 'easy', D: 'medium', I: 'hard', C: 'extreme', M: 'mastermind', U: 'ultra', E: 'easy', H: 'hard', X: 'extreme',
};

const VARIANTS: Variant[] = ['classic', 'accomplice', 'lockedRoom', 'poison', 'sniper', 'liar', 'double', 'liarDouble', 'accompliceLiar'];

/** Shareable code for a puzzle. */
export function codeFor(p: Puzzle): string {
  if (p.seasonId === 'daily') {
    const m = /^daily-(\d{4})-(\d{2})-(\d{2})$/.exec(p.id);
    if (m) return `DAILY-${m[1]}${m[2]}${m[3]}`;
    const d = new Date(p.index * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    return `DAILY-${d}`;
  }
  if (p.seasonId === 'weekly') {
    const m = /^weekly-(\d{4})-W(\d{2})$/.exec(p.id);
    return m ? `WEEK-${m[1]}W${m[2]}` : `WEEK-${Math.floor(p.index / 100)}W${String(p.index % 100).padStart(2, '0')}`;
  }
  if (p.seasonId === 'custom') {
    const m = /^custom-([a-z]+)-([a-z]+)-(\d+)-([A-Za-z]+)-(\d+)$/.exec(p.id);
    if (m) {
      const d3 = DISTRICT_CODES[m[1] as string] ?? 'ASH';
      return `C-${d3}-${TIER_LETTER[m[2] as Tier] ?? 'D'}-${m[3]}-${m[4]}-${m[5]}`;
    }
  }
  const d3 = DISTRICT_CODES[resolveDistrictId(p.seasonId)] ?? 'ASH';
  return `${d3}-${TIER_LETTER[p.tier]}-${p.index}`;
}

export interface ParsedCode {
  kind: 'case' | 'daily' | 'weekly' | 'custom';
  puzzle: () => Puzzle;
  label: string;
}

const tierName = (t: Tier): string => TIER_INFO[t].name;

/** Parse any case code (case-insensitive, surrounding spaces ignored). null when malformed / out of range. */
export function parseCode(code: string): ParsedCode | null {
  const s = String(code ?? '').trim().toUpperCase().replace(/\s+/g, '');
  let m = /^DAILY-?(\d{4})-?(\d{2})-?(\d{2})$/.exec(s);
  if (m) {
    const date = `${m[1]}-${m[2]}-${m[3]}`;
    const t = Date.parse(`${date}T00:00:00Z`);
    if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== date) return null;
    return { kind: 'daily', puzzle: () => dailyPuzzle(date), label: `Daily case · ${date}` };
  }
  m = /^WEEK-?(\d{4})-?W(\d{1,2})$/.exec(s);
  if (m) {
    const w = parseIsoWeek(`${m[1]}-W${m[2]}`);
    if (!w) return null;
    const label = `${w.year}-W${String(w.week).padStart(2, '0')}`;
    return { kind: 'weekly', puzzle: () => weeklyPuzzle(label), label: `Weekly Mastermind · ${label}` };
  }
  m = /^C-([A-Z]{3})-([A-Z])-(\d{1,2})-([A-Z]+)-(\d{1,10})$/.exec(s);
  if (m) {
    const districtId = CODE_TO_DISTRICT[m[1] as string];
    const tier = LETTER_TO_TIER[m[2] as string];
    const variant = VARIANTS.find((v) => v.toUpperCase() === m?.[4]);
    const size = Number(m[3]);
    const seed = Number(m[5]);
    if (!districtId || !tier || !variant || size < 4 || size > 14 || !Number.isSafeInteger(seed)) return null;
    const opts = normalizeCustom({ districtId, tier, size, variant, seed });
    const d = getDistrict(districtId) as District;
    return {
      kind: 'custom',
      puzzle: () => generateCustom(opts),
      label: `Custom · ${d.name} · ${tierName(opts.tier)} · ${opts.size}×${opts.size} · ${opts.variant}`,
    };
  }
  m = /^([A-Z]{3})-([A-Z])-?(\d{1,3})$/.exec(s);
  if (m) {
    const districtId = CODE_TO_DISTRICT[m[1] as string];
    const tier = LETTER_TO_TIER[m[2] as string];
    const index = Number(m[3]);
    if (!districtId || !tier || !TIERS.includes(tier)) return null;
    const d = getDistrict(districtId) as District;
    if (index < 1 || index > (d.casesPerTier[tier] ?? CASES_PER_TIER[tier])) return null;
    return { kind: 'case', puzzle: () => generatePuzzle(districtId, tier, index), label: `${d.name} · ${tierName(tier)} #${index}` };
  }
  return null;
}

/** All district ids in display order (convenience for code builders). */
export const DISTRICT_IDS: string[] = DISTRICTS.map((d) => d.id);

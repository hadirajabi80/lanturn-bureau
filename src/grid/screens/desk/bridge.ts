/**
 * Contract bridge for the case desk & modes: one import point for engine, meta and audio.
 *
 * Engine functions are read off the `@/grid/engine` namespace, so the desk keeps working while the
 * engine is mid-change (fallbacks below for checkAccusation / codeFor / parseCode / weeklyPuzzle /
 * generateCustom / nextDeduction / variantFor). Meta (`@/grid/meta`) and audio (`@/grid/audio`)
 * are re-exported directly.
 */
import * as EngineNS from '@/grid/engine';
import { sfx } from '@/engine/audio';
import { ambience, sfx2 } from '@/grid/audio';
import { DISTRICTS } from '@/grid/skins/districts';
import { cellKey, type Cell, type Puzzle, type Tier, type Variant } from '@/grid/types';

// ─────────────────────────── engine ───────────────────────────

export interface Violation { personId: string; clueIndex: number }
export interface PlacementCheck { ok: boolean; violations: Violation[] }
export interface Accusation {
  killers: string[];
  accomplice?: string;
  /** double variants: victimId → killerId */
  pairs?: Record<string, string>;
}
export interface Deduction {
  kind: 'place' | 'cross' | 'mistake';
  personId: string;
  cells: Cell[];
  reasonCells: Cell[];
  text: string;
}
export interface ParsedCode {
  kind: 'case' | 'daily' | 'weekly' | 'custom';
  puzzle: () => Puzzle;
  label: string;
}
export interface CustomOpts { districtId: string; tier: Tier; size: number; variant: Variant; seed: number }

interface EngineV2 {
  generatePuzzle(districtId: string, tier: Tier, index: number): Puzzle;
  dailyPuzzle(dateISO: string): Puzzle;
  weeklyPuzzle(isoWeek: string): Puzzle;
  generateCustom(opts: CustomOpts): Puzzle;
  parseCode(code: string): ParsedCode | null;
  codeFor(p: Puzzle): string;
  checkPlacement(p: Puzzle, placements: Record<string, Cell | null>): PlacementCheck;
  checkAccusation(p: Puzzle, a: Accusation): boolean;
  nextDeduction(
    p: Puzzle,
    state: { placements: Record<string, Cell | null>; crosses: Record<string, string[]> },
  ): Deduction | null;
  candidateCells(p: Puzzle, personId: string, placements: Record<string, Cell | null>): Cell[];
  gridSizeFor(tier: Tier, index: number): number;
  variantFor(tier: Tier, index: number, seed?: number): Variant;
  hashSeed(...parts: (string | number)[]): number;
}

const E = EngineNS as unknown as Partial<EngineV2>;

export const hashSeed: EngineV2['hashSeed'] =
  E.hashSeed ??
  ((...parts) => {
    let h = 2166136261;
    for (const ch of parts.join('|')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return h >>> 0;
  });

export const generatePuzzle: EngineV2['generatePuzzle'] = (d, t, i) => E.generatePuzzle!(d, t, i);
export const dailyPuzzle: EngineV2['dailyPuzzle'] = (iso) => E.dailyPuzzle!(iso);
export const checkPlacement: EngineV2['checkPlacement'] = (p, pl) => E.checkPlacement!(p, pl);
export const candidateCells: EngineV2['candidateCells'] = (p, id, pl) =>
  E.candidateCells ? E.candidateCells(p, id, pl) : [];
export const gridSizeFor: EngineV2['gridSizeFor'] = (t, i) =>
  E.gridSizeFor ? E.gridSizeFor(t, i) : 4 + Math.min(10, i % 10);
export const variantFor: EngineV2['variantFor'] = (t, i, s) => (E.variantFor ? E.variantFor(t, i, s) : 'classic');

const TIER_LETTER: Record<Tier, string> = { easy: 'R', medium: 'D', hard: 'I', extreme: 'C', mastermind: 'M', ultra: 'U' };

export const weeklyPuzzle: EngineV2['weeklyPuzzle'] = (week) =>
  E.weeklyPuzzle ? E.weeklyPuzzle(week) : E.generatePuzzle!('frostmere', 'extreme', (hashSeed('week', week) % 30) + 1);

export const generateCustom: EngineV2['generateCustom'] = (o) =>
  E.generateCustom ? E.generateCustom(o) : E.generatePuzzle!(o.districtId, o.tier, (Math.abs(o.seed) % 30) + 1);

export const codeFor: EngineV2['codeFor'] = (p) => {
  if (E.codeFor) return E.codeFor(p);
  if (p.seasonId === 'daily') return `DAILY-${p.index}`;
  return `${p.seasonId.slice(0, 3).toUpperCase()}-${TIER_LETTER[p.tier]}-${p.index}`;
};

const DISTRICT_IDS = DISTRICTS.map((d) => d.id);

export const parseCode: EngineV2['parseCode'] = (code) => {
  if (E.parseCode) {
    try {
      return E.parseCode(code);
    } catch {
      return null;
    }
  }
  const m = /^([A-Z]{3})-([RDICM])-(\d{1,3})$/.exec(code.trim().toUpperCase());
  if (!m) return null;
  const tier = (Object.keys(TIER_LETTER) as Tier[]).find((t) => TIER_LETTER[t] === m[2]);
  const district = DISTRICT_IDS.find((d) => d.slice(0, 3).toUpperCase() === m[1]);
  const n = Number(m[3]);
  if (!tier || !district || n < 1 || n > 30) return null;
  return { kind: 'case', puzzle: () => generatePuzzle(district, tier, n), label: `${district} ${tier} #${n}` };
};

export function killersOf(p: Puzzle): string[] {
  return p.killerIds?.length ? p.killerIds : [p.killerId];
}
export function victimsOf(p: Puzzle): string[] {
  return p.victimIds?.length ? p.victimIds : p.people.filter((x) => x.isVictim).map((x) => x.id);
}
export const variantOf = (p: Puzzle): Variant => p.variant ?? 'classic';
export const needsAccomplice = (v: Variant) => v === 'accomplice' || v === 'accompliceLiar';
export const isDouble = (v: Variant) => v === 'double' || v === 'liarDouble';

export const checkAccusation: EngineV2['checkAccusation'] = (p, a) => {
  if (E.checkAccusation) return E.checkAccusation(p, a);
  const want = killersOf(p);
  const got = [...new Set(a.killers)];
  if (got.length !== want.length || !want.every((k) => got.includes(k))) return false;
  const v = variantOf(p);
  if (needsAccomplice(v) && a.accomplice !== p.accompliceId) return false;
  if (isDouble(v) && p.victimIds && p.killerIds && a.pairs) {
    return p.victimIds.every((vid, i) => a.pairs?.[vid] === p.killerIds?.[i]);
  }
  return true;
};

const sameCell = (a: Cell | null | undefined, b: Cell | null | undefined) =>
  !!a && !!b && a.r === b.r && a.c === b.c;
const cellName = (c: Cell) => `${String.fromCharCode(65 + c.c)}${c.r + 1}`;

/** Fallback Otto: first wrong pin, then forced single candidates, then one impossible square. */
function fallbackDeduction(
  p: Puzzle,
  state: { placements: Record<string, Cell | null>; crosses: Record<string, string[]> },
): Deduction | null {
  const name = (id: string) => p.people.find((x) => x.id === id)?.name ?? 'Someone';
  for (const person of p.people) {
    const at = state.placements[person.id];
    if (at && !sameCell(at, p.solution[person.id])) {
      return {
        kind: 'mistake', personId: person.id, cells: [at], reasonCells: [at],
        text: `Hm. ${name(person.id)} does not belong at ${cellName(at)}. Read those sentences again, Rookie.`,
      };
    }
  }
  const fixed: Record<string, Cell | null> = {};
  for (const person of p.people) {
    const at = state.placements[person.id];
    fixed[person.id] = at && sameCell(at, p.solution[person.id]) ? at : null;
  }
  for (const person of p.people) {
    if (fixed[person.id]) continue;
    const cand = candidateCells(p, person.id, fixed).filter(
      (c) => !(state.crosses[cellKey(c)] ?? []).includes(person.id),
    );
    if (cand.length === 1) {
      const c = cand[0]!;
      return {
        kind: 'place', personId: person.id, cells: [c], reasonCells: [c],
        text: `Hm. Every other square breaks one of ${name(person.id)}'s sentences. ${name(person.id)} must be at ${cellName(c)}.`,
      };
    }
  }
  for (const person of p.people) {
    if (fixed[person.id]) continue;
    const cand = candidateCells(p, person.id, fixed);
    const sol = p.solution[person.id];
    const bad = cand.filter((c) => !sameCell(c, sol) && !(state.crosses[cellKey(c)] ?? []).includes(person.id));
    if (bad.length) {
      const c = bad[0]!;
      return {
        kind: 'cross', personId: person.id, cells: [c], reasonCells: [],
        text: `Hm. Follow ${name(person.id)}'s sentences through from ${cellName(c)} and the plan falls apart. Cross it out.`,
      };
    }
  }
  return null;
}

export const nextDeduction: EngineV2['nextDeduction'] = (p, s) => {
  if (E.nextDeduction) {
    try {
      return E.nextDeduction(p, s);
    } catch (err) {
      console.warn('[desk] nextDeduction failed, using fallback', err);
    }
  }
  return fallbackDeduction(p, s);
};

// ─────────────────────────── meta & audio (landed — thin re-exports) ───────────────────────────

export {
  recordSolve,
  recordBurn,
  recordBlitz as metaRecordBlitz,
  recordGauntlet as metaRecordGauntlet,
  pushAchievementToasts,
  type SolveRecord,
  type BurnRecord,
  type RecordOutcome,
} from '@/grid/meta';

export type SfxName = 'pin' | 'cross' | 'pencil' | 'erase' | 'stamp' | 'lever' | 'spotlight' | 'otto' | 'burn' | 'reveal' | 'success';

/** Desk-level sound switch (mirrors `settings.sound`). */
export function setDeskSound(on: boolean): void {
  try {
    sfx2.setMuted(!on);
  } catch {
    /* decorative */
  }
}

export function play(name: SfxName): void {
  try {
    sfx2[name]();
  } catch {
    /* audio is decorative */
  }
}
export function playSuccess(): void {
  play('success');
}
export function playWrong(): void {
  if (!sfx2.isMuted()) sfx.wrong();
}

export { ambience };

/**
 * `npm run grid:otto-test` — Ask Otto (explain.ts) end-to-end check.
 *
 * For a sample of generated cases (first 6 per tier of the first two districts
 * plus the legacy seasons `files`, `files2`, and a couple of 12×12 boards) a
 * simulated player follows ONLY Otto's hints from an empty board:
 *  - every 'place' must match the hidden solution,
 *  - every 'cross' must never cross a solution square,
 *  - no 'mistake' may be reported on a board built from Otto's own steps,
 *  - each call must stay fast (≤ 15 ms on 12×12, measured as the max over calls).
 * Reports the % of cases Otto solves end-to-end per tier and variant, and
 * checks mistake detection on deliberately wrong boards. Exits 1 on failure.
 * Extra Extreme: the first ULTRA_N (4) ultra cases of the first 4 districts must be solved
 * end-to-end (100 %), with the deep what-if steps (rule what-if-2) explained.
 */
import type { Cell, Predicate, Puzzle, Tier } from '../../types';
import { cellKey } from '../../types';

type Engine = typeof import('../index');
type Deduction = import('../explain').Deduction;

const failures: string[] = [];
const fail = (msg: string): void => { failures.push(msg); };

let eng: Engine;
try {
  eng = await import('../index');
} catch (e) {
  console.error('Engine failed to load (mid-rewrite?):', (e as Error).message);
  process.exit(1);
}
const TIERS: Tier[] = ['easy', 'medium', 'hard', 'extreme', 'mastermind'];

let districtIds: string[] = [];
let ultraDistricts: string[] = [];
try {
  const mod = await import('../../skins/districts');
  districtIds = mod.DISTRICTS.slice(0, 2).map((d) => d.id);
  ultraDistricts = mod.DISTRICTS.slice(0, 4).map((d) => d.id);
} catch { /* no districts yet */ }
const ULTRA_N = Number(process.env.OTTO_ULTRA_N ?? 4);
const SEASON_IDS = [...districtIds, 'files', 'files2'];
const CASES = Number(process.env.OTTO_N ?? 6);

interface SimResult {
  solved: boolean;
  steps: number;
  maxMs: number;
  totalMs: number;
  calls: number;
  rules: Record<string, number>;
  texts: string[];
  byRule: [string, string][];
}

const same = (a: Cell, b: Cell | undefined): boolean => !!b && a.r === b.r && a.c === b.c;

function sentenceCount(text: string): number {
  const body = text.replace(/^Hm\.\s*/, '').replace(/\bRookie\./g, 'Rookie');
  return (body.match(/[.!?](\s|$)/g) ?? []).length;
}

function simulate(p: Puzzle, label: string): SimResult {
  const placements: Record<string, Cell | null> = {};
  const crosses: Record<string, string[]> = {};
  const res: SimResult = { solved: false, steps: 0, maxMs: 0, totalMs: 0, calls: 0, rules: {}, texts: [], byRule: [] };
  for (let step = 0; step < 4000; step++) {
    const t0 = performance.now();
    let d: Deduction | null;
    try {
      d = eng.nextDeduction(p, { placements, crosses });
    } catch (e) {
      fail(`${label}: nextDeduction threw: ${(e as Error).stack}`);
      return res;
    }
    const ms = performance.now() - t0;
    res.calls++;
    res.totalMs += ms;
    res.maxMs = Math.max(res.maxMs, ms);
    if (!d) break;
    res.steps++;
    res.rules[d.rule] = (res.rules[d.rule] ?? 0) + 1;
    res.texts.push(d.text);
    res.byRule.push([d.rule, d.text]);
    if (!d.text.startsWith('Hm.')) fail(`${label}: text without "Hm.": ${d.text}`);
    if (sentenceCount(d.text) > 2) fail(`${label}: more than 2 sentences: ${d.text}`);
    if (/undefined|NaN|\[object/.test(d.text)) fail(`${label}: broken text: ${d.text}`);
    const sol = p.solution[d.personId];
    if (d.kind === 'mistake') {
      fail(`${label}: unexpected mistake at step ${step}: ${d.text}`);
      return res;
    }
    if (d.kind === 'place') {
      const c = d.cells[0];
      if (d.cells.length !== 1 || !c) { fail(`${label}: place with ${d.cells.length} cells`); return res; }
      if (!same(c, sol)) { fail(`${label}: WRONG PLACE ${d.personId} at ${cellKey(c)} (${d.rule}): ${d.text}`); return res; }
      if (placements[d.personId]) { fail(`${label}: re-placing ${d.personId}`); return res; }
      placements[d.personId] = c;
    } else {
      if (!d.cells.length) { fail(`${label}: empty cross (${d.rule})`); return res; }
      let fresh = 0;
      for (const c of d.cells) {
        if (same(c, sol)) { fail(`${label}: CROSSED SOLUTION ${d.personId} at ${cellKey(c)} (${d.rule}): ${d.text}`); return res; }
        const k = cellKey(c);
        const list = crosses[k] ?? (crosses[k] = []);
        if (!list.includes(d.personId)) { list.push(d.personId); fresh++; }
      }
      if (!fresh) { fail(`${label}: cross with nothing new (${d.rule}): ${d.text}`); return res; }
    }
  }
  res.solved = p.people.every((x) => !!placements[x.id]);
  if (res.solved) {
    const after = eng.nextDeduction(p, { placements, crosses });
    if (after) fail(`${label}: solved board still yields a step: ${after.text}`);
  }
  return res;
}

// ─────────────────────────── corpus ───────────────────────────

interface Row { n: number; solved: number; steps: number; ms: number; maxMs: number }
const byTier = new Map<string, Row>();
const byVariant = new Map<string, Row>();
const rulesAll: Record<string, number> = {};
/** mistake-detection lines (filled by mistakeTests) */
const samples: string[] = [];
const byRule = new Map<string, string[]>();
let maxMs12 = 0;
let maxMsBig = 0;
const sizesSeen = new Set<number>();
let skipped = 0;

function record(map: Map<string, Row>, key: string, r: SimResult): void {
  const row = map.get(key) ?? { n: 0, solved: 0, steps: 0, ms: 0, maxMs: 0 };
  row.n++;
  if (r.solved) row.solved++;
  row.steps += r.steps;
  row.ms += r.totalMs / Math.max(1, r.calls);
  row.maxMs = Math.max(row.maxMs, r.maxMs);
  map.set(key, row);
}

function runCase(p: Puzzle, label: string): void {
  const r = simulate(p, label);
  const variant = p.variant ?? 'classic';
  record(byTier, p.tier, r);
  record(byVariant, `${p.tier}/${variant}`, r);
  for (const [k, v] of Object.entries(r.rules)) rulesAll[k] = (rulesAll[k] ?? 0) + v;
  for (const [rule, t] of r.byRule) { const l = byRule.get(rule) ?? []; if (l.length < 3 && !l.includes(t)) l.push(t); byRule.set(rule, l); }
  sizesSeen.add(p.rows);
  if (p.rows === 12) maxMs12 = Math.max(maxMs12, r.maxMs);
  else if (p.rows > 12) maxMsBig = Math.max(maxMsBig, r.maxMs);
}

const t0 = performance.now();
for (const sid of SEASON_IDS) {
  for (const tier of TIERS) {
    for (let i = 1; i <= CASES; i++) {
      let p: Puzzle;
      try {
        p = eng.generatePuzzle(sid, tier, i);
      } catch {
        skipped++;
        continue;
      }
      runCase(p, `${sid}/${tier}/${i}`);
    }
  }
}

// 12×12 performance sample
for (const [sid, tier, i] of [['files', 'extreme', 40], [SEASON_IDS[0] ?? 'files', 'extreme', 30]] as [string, Tier, number][]) {
  try {
    const p = eng.generatePuzzle(sid, tier, i);
    if (p.rows >= 12) runCase(p, `${sid}/${tier}/${i}`);
  } catch { skipped++; }
}

// synthetic liar cases: a classic case where the killer's sentences are all negated (killer = the liar).
const negate = (pr: Predicate): Predicate => ({ type: 'not', p: pr });
let liarRuns = 0;
const liarRow: Row = { n: 0, solved: 0, steps: 0, ms: 0, maxMs: 0 };
for (const sid of ['files', 'files2']) {
  for (const tier of ['medium', 'hard', 'extreme'] as Tier[]) {
    for (let i = 1; i <= 4; i++) {
      let base: Puzzle;
      try { base = eng.generatePuzzle(sid, tier, i); } catch { continue; }
      if ((base.variant ?? 'classic') !== 'classic') continue;
      const liarId = base.killerId;
      const p: Puzzle = {
        ...base,
        id: `${base.id}-synthliar`,
        variant: 'liar',
        liarId,
        clues: base.clues.map((cl) => (cl.personId === liarId ? { ...cl, predicate: negate(cl.predicate) } : cl)),
      };
      const r = simulate(p, `synthetic-liar ${base.id}`);
      liarRuns++;
      liarRow.n++;
      if (r.solved) liarRow.solved++;
      liarRow.steps += r.steps;
      liarRow.ms += r.totalMs / Math.max(1, r.calls);
      liarRow.maxMs = Math.max(liarRow.maxMs, r.maxMs);
      for (const [k, v] of Object.entries(r.rules)) rulesAll[k] = (rulesAll[k] ?? 0) + v;
      for (const [rule, t] of r.byRule) { const l = byRule.get(rule) ?? []; if (l.length < 3 && !l.includes(t)) l.push(t); byRule.set(rule, l); }
    }
  }
}

// synthetic scenario cases: classic boards whose hidden solution already satisfies a variant's
// "exactly one suspect …" rule are relabelled (sniper / poison) — exercises Otto's case-rule reasoning.
const scenarioRow = new Map<string, Row>();
for (const sid of ['files', 'files2']) {
  for (const tier of ['hard', 'extreme'] as Tier[]) {
    for (let i = 1; i <= 6; i++) {
      let base: Puzzle;
      try { base = eng.generatePuzzle(sid, tier, i); } catch { continue; }
      if ((base.variant ?? 'classic') !== 'classic') continue;
      const g = eng.buildGridCtx(base);
      const victim = base.people.find((x) => x.isVictim);
      if (!victim) continue;
      const at = (id: string): number => eng.cellIndex(g.cols, base.solution[id] as Cell);
      const v = at(victim.id);
      const suspects = base.people.filter((x) => !x.isVictim).map((x) => at(x.id));
      const variants: Puzzle[] = [];
      if (suspects.filter((c) => eng.lineOfSight(g, c, v)).length === 1) variants.push({ ...base, id: `${base.id}-sniper`, variant: 'sniper' });
      for (const k of g.kindsPresent) {
        if ((g.adjKinds[v] as Set<string>).has(k)) continue;
        if (suspects.filter((c) => (g.adjKinds[c] as Set<string>).has(k)).length !== 1) continue;
        variants.push({ ...base, id: `${base.id}-poison`, variant: 'poison', poisonKind: k });
        break;
      }
      for (const p of variants) {
        const r = simulate(p, `synthetic ${p.id}`);
        record(scenarioRow, `${tier}/${p.variant}`, r);
        for (const [k, n] of Object.entries(r.rules)) rulesAll[k] = (rulesAll[k] ?? 0) + n;
        for (const [rule, t] of r.byRule) { const l = byRule.get(rule) ?? []; if (l.length < 3 && !l.includes(t)) l.push(t); byRule.set(rule, l); }
      }
    }
  }
}

// Extra Extreme: Otto must solve every sampled case end-to-end
const ultraRow: Row = { n: 0, solved: 0, steps: 0, ms: 0, maxMs: 0 };
const ultraRules: Record<string, number> = {};
const ultraDeep: string[] = [];
for (const sid of ultraDistricts) {
  for (let i = 1; i <= ULTRA_N; i++) {
    let p: Puzzle;
    try { p = eng.generatePuzzle(sid, 'ultra', i); } catch (e) { fail(`ultra ${sid}/${i}: generation threw ${(e as Error).message}`); continue; }
    const r = simulate(p, `${sid}/ultra/${i}`);
    record(byVariant, `ultra/${p.variant ?? 'classic'}`, r);
    ultraRow.n++;
    if (r.solved) ultraRow.solved++;
    else fail(`ultra ${sid}/${i} (${p.variant}): Otto stalled after ${r.steps} steps`);
    ultraRow.steps += r.steps;
    ultraRow.ms += r.totalMs / Math.max(1, r.calls);
    ultraRow.maxMs = Math.max(ultraRow.maxMs, r.maxMs);
    for (const [k, v] of Object.entries(r.rules)) { ultraRules[k] = (ultraRules[k] ?? 0) + v; rulesAll[k] = (rulesAll[k] ?? 0) + v; }
    for (const [rule, t] of r.byRule) {
      if (rule.endsWith('what-if-2') && ultraDeep.length < 4) ultraDeep.push(t);
      const l = byRule.get(rule) ?? []; if (l.length < 3 && !l.includes(t)) l.push(t); byRule.set(rule, l);
    }
  }
}

// Extra Extreme depth-2 explanations ("If Felix stood at C3, Ivy would be stuck …"): Otto's simpler steps
// usually get there first, so exercise the solver-backed depth-2 step directly every 5th move and check it is sound.
let deep2 = 0;
for (const sid of ultraDistricts.slice(0, 2)) {
  for (let i = 1; i <= 2; i++) {
    let p: Puzzle;
    try { p = eng.generatePuzzle(sid, 'ultra', i); } catch { continue; }
    const placements: Record<string, Cell | null> = {};
    const crosses: Record<string, string[]> = {};
    for (let step = 0; step < 3000; step++) {
      const d2 = step % 5 === 0 ? eng.deepWhatIfStep(p, { placements, crosses }, true) : null;
      const d = d2 ?? eng.nextDeduction(p, { placements, crosses });
      if (!d) break;
      if (d2) { deep2++; if (ultraDeep.length < 4) ultraDeep.push(d2.text); }
      const sol = p.solution[d.personId];
      if (d.kind === 'mistake') { fail(`deep ${p.id}: mistake ${d.text}`); break; }
      if (d.kind === 'place') {
        if (!same(d.cells[0] as Cell, sol)) { fail(`deep ${p.id}: WRONG PLACE ${d.text}`); break; }
        placements[d.personId] = d.cells[0] as Cell;
      } else {
        if (d.cells.some((c) => same(c, sol))) { fail(`deep ${p.id}: CROSSED SOLUTION (${d.rule}) ${d.text}`); break; }
        for (const c of d.cells) (crosses[cellKey(c)] ??= []).push(d.personId);
      }
    }
    if (!p.people.every((x) => placements[x.id])) fail(`deep ${p.id}: not solved with depth-2 steps mixed in`);
  }
}
if (ultraDistricts.length && deep2 === 0) fail('depth-2 what-if never produced a step');

// ─────────────────────────── mistake detection ───────────────────────────

function mistakeTests(): void {
  const p = eng.generatePuzzle('files', 'easy', 3);
  const ctx = eng.makePuzzleCtx(p);
  const g = ctx.grid;
  const free = g.free.map((i) => eng.indexCell(g.cols, i));
  const suspects = p.people.filter((x) => !x.isVictim);

  // 1) a pin that contradicts the person's own unary clue
  let done = false;
  for (const s of suspects) {
    for (const cl of p.clues.filter((c) => c.personId === s.id)) {
      if (eng.predicatePeople(cl.predicate).length || eng.isGlobalPredicate(cl.predicate)) continue;
      const bad = free.find((c) => eng.evalPredicate(cl.predicate, s.id, { [s.id]: c }, ctx) === false);
      if (!bad) continue;
      const d = eng.nextDeduction(p, { placements: { [s.id]: bad }, crosses: {} });
      if (!d || d.kind !== 'mistake' || d.personId !== s.id) fail(`mistake(unary): expected mistake for ${s.id}, got ${d?.kind} ${d?.text}`);
      else samples.unshift(d.text);
      done = true;
      break;
    }
    if (done) break;
  }
  if (!done) fail('mistake(unary): no testable clue found');

  // 2) two pins in one row
  const [a, b2] = suspects;
  const row0 = free.filter((c) => c.r === 0);
  if (a && b2 && row0.length >= 2) {
    const d = eng.nextDeduction(p, { placements: { [a.id]: row0[0] as Cell, [b2.id]: row0[1] as Cell }, crosses: {} });
    if (!d || d.kind !== 'mistake' || d.rule !== 'mistake-line') fail(`mistake(row): got ${d?.kind}/${d?.rule} ${d?.text}`);
  }

  // 3) a pin on blocking furniture
  const blockedIdx = Array.from(g.blocked).findIndex((x) => x === 1);
  if (blockedIdx >= 0 && a) {
    const d = eng.nextDeduction(p, { placements: { [a.id]: eng.indexCell(g.cols, blockedIdx) }, crosses: {} });
    if (!d || d.kind !== 'mistake' || d.rule !== 'mistake-blocked') fail(`mistake(blocked): got ${d?.kind}/${d?.rule} ${d?.text}`);
  }

  // 4) every square of someone crossed out
  if (a) {
    const crosses: Record<string, string[]> = {};
    for (const c of free) crosses[cellKey(c)] = [a.id];
    const d = eng.nextDeduction(p, { placements: {}, crosses });
    if (!d || d.kind !== 'mistake' || d.personId !== a.id) fail(`mistake(stuck): got ${d?.kind} ${d?.text}`);
  }

  // 5) the solution itself never reports a mistake and yields no further step
  const d5 = eng.nextDeduction(p, { placements: { ...p.solution }, crosses: {} });
  if (d5) fail(`solved board: expected null, got ${d5.kind}: ${d5.text}`);

  // 6) a wrong pin that only clashes through a relational clue (if one exists in a harder case)
  const ph = eng.generatePuzzle('files', 'hard', 2);
  const ctxh = eng.makePuzzleCtx(ph);
  const rel = ph.clues.find((cl) => eng.predicatePeople(cl.predicate).length === 1 && !eng.isGlobalPredicate(cl.predicate));
  if (rel) {
    const other = eng.predicatePeople(rel.predicate)[0] as string;
    const oc = ph.solution[other] as Cell;
    const bad = ctxh.grid.free.map((i) => eng.indexCell(ctxh.grid.cols, i)).find((c) =>
      c.r !== oc.r && c.c !== oc.c
      && ph.clues.filter((x) => x.personId === rel.personId && x !== rel && !eng.predicatePeople(x.predicate).length && !eng.isGlobalPredicate(x.predicate))
        .every((x) => eng.evalPredicate(x.predicate, rel.personId, { [rel.personId]: c }, ctxh) !== false)
      && eng.evalPredicate(rel.predicate, rel.personId, { [rel.personId]: c, [other]: oc }, ctxh) === false);
    if (bad) {
      const d = eng.nextDeduction(ph, { placements: { [rel.personId]: bad, [other]: oc }, crosses: {} });
      if (!d || d.kind !== 'mistake') fail(`mistake(relational): got ${d?.kind} ${d?.text}`);
      else samples.unshift(d.text);
    }
  }
}
try { mistakeTests(); } catch (e) { fail(`mistake tests threw: ${(e as Error).stack}`); }

// ─────────────────────────── report ───────────────────────────

const pct = (r: Row): string => `${((100 * r.solved) / Math.max(1, r.n)).toFixed(0)}%`;
const line = (k: string, r: Row): string =>
  `${k.padEnd(22)} ${String(r.n).padStart(4)} ${pct(r).padStart(6)} ${(r.steps / Math.max(1, r.n)).toFixed(1).padStart(8)} ${(r.ms / Math.max(1, r.n)).toFixed(2).padStart(9)} ${r.maxMs.toFixed(1).padStart(8)}`;
console.log(`\nOtto coverage — seasons: ${SEASON_IDS.join(', ')} · first ${CASES} cases per tier · skipped ${skipped}`);
console.log(`${'tier'.padEnd(22)} ${'n'.padStart(4)} ${'solved'.padStart(6)} ${'avgSteps'.padStart(8)} ${'avgMs/call'.padStart(9)} ${'maxMs'.padStart(8)}`);
for (const t of TIERS) { const r = byTier.get(t); if (r) console.log(line(t, r)); }
console.log('\nby tier/variant:');
for (const [k, r] of [...byVariant.entries()].sort()) console.log(line(k, r));
if (liarRuns) console.log(line('synthetic liar*', liarRow));
for (const [k, r] of [...scenarioRow.entries()].sort()) console.log(line(`synthetic ${k}`, r));
if (ultraRow.n) {
  console.log(line('ULTRA (Extra Extreme)', ultraRow));
  console.log(`  ultra rules: ${Object.entries(ultraRules).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  console.log(`  depth-2 steps exercised: ${deep2}`);
  for (const t of ultraDeep) console.log(`  deep: ${t}`);
}
console.log('  * synthetic liar boards are not unique under liar rules: soundness only, no coverage target');
console.log('\nrules used:', Object.entries(rulesAll).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log(`max ms per call on 12×12: ${maxMs12.toFixed(1)} · on >12×12: ${maxMsBig.toFixed(1)} · sizes seen: ${[...sizesSeen].sort((a, b) => a - b).join(",")}`);
console.log(`\nmistake lines:\n  ${samples.slice(0, 2).join('\n  ')}`);
console.log('\nper rule:');
for (const [rule, l] of [...byRule.entries()].sort()) console.log(`  [${rule}]\n    ${l.join('\n    ')}`);
console.log(`\ntotal ${((performance.now() - t0) / 1000).toFixed(1)} s`);

// targets
const target = (key: string, min: number): void => {
  const r = byVariant.get(key);
  if (r && r.solved / r.n < min) fail(`coverage ${key}: ${pct(r)} < ${(min * 100).toFixed(0)}%`);
};
target('easy/classic', 1);
target('medium/classic', 1);
target('hard/classic', 0.9);
for (const [k, r] of byVariant) if (k.startsWith('extreme/') && r.solved / r.n < 0.7) fail(`coverage ${k}: ${pct(r)} < 70%`);
if (maxMs12 > 15) fail(`slow: ${maxMs12.toFixed(1)} ms per call on 12×12 (budget 15 ms)`);

if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`);
  for (const f of failures.slice(0, 40)) console.error(' -', f);
  process.exit(1);
}
console.log('\nOK — Otto is sound on every simulated case.');

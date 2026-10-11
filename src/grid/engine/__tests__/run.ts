/**
 * `npm run grid:test` — generates every season × tier × first 12 cases (plus
 * three daily cases) and checks the invariants from docs/GRID-PLAN.md.
 * Exits 1 on any failure.
 */
import type { Cell, Puzzle, Tier } from '../../types';
import { OCCUPIABLE, TIERS, cellKey } from '../../types';
import {
  SEASONS, THEMES, CAST, buildGridCtx, checkPlacement, candidateCells, countSolutions, dailyPuzzle,
  generatePuzzleUncached, killerFor, puzzleTitle, isKillerRuleClue, evalPredicate, makePuzzleCtx, compilePredicate,
} from '../index';

const CASES_PER_TIER = Number(process.env.GRID_TEST_N ?? 12);
const failures: string[] = [];
const fail = (id: string, msg: string): void => { failures.push(`${id}: ${msg}`); };

const timings: Record<string, number[]> = {};
const solveTimings: number[] = [];

function sameCell(a: Cell | undefined, b: Cell | undefined): boolean {
  return !!a && !!b && a.r === b.r && a.c === b.c;
}

function checkPuzzle(p: Puzzle): void {
  const id = p.id;
  const g = buildGridCtx(p);

  // rooms partition the grid and are connected
  const seen = new Map<string, string>();
  for (const room of p.rooms) {
    if (room.cells.length < 3) fail(id, `room ${room.name} has ${room.cells.length} cells`);
    for (const c of room.cells) {
      const k = cellKey(c);
      if (seen.has(k)) fail(id, `cell ${k} in two rooms`);
      seen.set(k, room.id);
    }
    const keys = new Set(room.cells.map(cellKey));
    const start = room.cells[0];
    if (start) {
      const stack = [start];
      const reached = new Set([cellKey(start)]);
      while (stack.length) {
        const c = stack.pop() as Cell;
        for (const d of [{ r: c.r + 1, c: c.c }, { r: c.r - 1, c: c.c }, { r: c.r, c: c.c + 1 }, { r: c.r, c: c.c - 1 }]) {
          const k = cellKey(d);
          if (keys.has(k) && !reached.has(k)) { reached.add(k); stack.push(d); }
        }
      }
      if (reached.size !== keys.size) fail(id, `room ${room.name} not connected`);
    }
  }
  if (seen.size !== p.rows * p.cols) fail(id, `rooms cover ${seen.size}/${p.rows * p.cols} cells`);

  // furniture: within grid, no overlap, 2-cell pieces adjacent and inside one room
  const fcells = new Set<string>();
  for (const f of p.furniture) {
    for (const c of f.cells) {
      const k = cellKey(c);
      if (fcells.has(k)) fail(id, `furniture overlap at ${k}`);
      fcells.add(k);
    }
    if (f.cells.length === 2) {
      const [a, b] = f.cells as [Cell, Cell];
      if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) fail(id, `${f.id} cells not adjacent`);
      if (seen.get(cellKey(a)) !== seen.get(cellKey(b))) fail(id, `${f.id} spans two rooms`);
      const orient = a.r === b.r ? 'h' : 'v';
      if (f.orient !== orient) fail(id, `${f.id} orient ${f.orient} != ${orient}`);
    } else if (f.cells.length !== 1) fail(id, `${f.id} has ${f.cells.length} cells`);
  }

  // people
  const victims = p.people.filter((x) => x.isVictim);
  if (victims.length !== 1) fail(id, `${victims.length} victims`);
  if (new Set(p.people.map((x) => x.id)).size !== p.people.length) fail(id, 'duplicate person ids');
  const occupied = new Set<string>();
  for (const person of p.people) {
    const c = p.solution[person.id];
    if (!c) { fail(id, `${person.id} has no solution cell`); continue; }
    const k = cellKey(c);
    if (occupied.has(k)) fail(id, `two people share ${k}`);
    occupied.add(k);
    if (g.blocked[c.r * p.cols + c.c]) fail(id, `${person.id} stands on blocking furniture`);
    const kind = g.kindAt[c.r * p.cols + c.c];
    if (kind && !OCCUPIABLE[kind]) fail(id, `${person.id} on ${kind}`);
    if (!p.clues.some((cl) => cl.personId === person.id)) fail(id, `${person.id} has no clue`);
    if (!person.isVictim) {
      const n = p.clues.filter((cl) => cl.personId === person.id).length;
      if (n > 3) fail(id, `${person.id} has ${n} clues`);
    }
  }

  // clue text
  for (const cl of p.clues) {
    if (/\{|\}|undefined|NaN|someone|unknown room/.test(cl.text)) fail(id, `bad text "${cl.text}"`);
    if (!/^[A-Z].*\.$/.test(cl.text)) fail(id, `unpunctuated text "${cl.text}"`);
  }
  if (!p.title || !p.title.startsWith('The ')) fail(id, `bad title "${p.title}"`);
  if (p.title !== puzzleTitle(p.seasonId, p.tier, p.index)) fail(id, 'title differs from puzzleTitle()');

  // every clue holds in the solution
  const ctx = makePuzzleCtx(p);
  p.clues.forEach((cl) => {
    if (evalPredicate(cl.predicate, cl.personId, p.solution, ctx) !== true) fail(id, `clue false in solution: "${cl.text}"`);
  });

  // uniqueness
  const t0 = performance.now();
  const res = countSolutions(p, p.clues, 2);
  solveTimings.push(performance.now() - t0);
  if (res.count !== 1) fail(id, `solver found ${res.count} solutions`);
  else for (const person of p.people) {
    if (!sameCell(res.first?.[person.id], p.solution[person.id])) fail(id, `solver solution differs for ${person.id}`);
  }

  // killer
  const k = killerFor(p, p.solution);
  if (k !== p.killerId) fail(id, `killerFor = ${k}, expected ${p.killerId}`);
  if (p.people.find((x) => x.id === p.killerId)?.isVictim) fail(id, 'killer is the victim');

  // play API
  const chk = checkPlacement(p, p.solution);
  if (!chk.ok) fail(id, `checkPlacement(solution) not ok: ${JSON.stringify(chk.violations)}`);
  const partial: Record<string, Cell | null> = {};
  for (const person of p.people) partial[person.id] = null;
  const first = p.people[0];
  if (first) {
    const cands = candidateCells(p, first.id, partial);
    if (!cands.some((c) => sameCell(c, p.solution[first.id]))) fail(id, 'candidateCells misses the solution cell');
  }
  const victimClue = p.clues.findIndex((cl) => p.people.find((x) => x.id === cl.personId)?.isVictim);
  if (victimClue < 0 || !isKillerRuleClue(p, victimClue)) fail(id, 'victim killer-rule clue missing');
}

/**
 * Independent uniqueness check for small puzzles: enumerate every assignment of
 * distinct free cells and evaluate all clues only on complete placements.
 * Shares nothing with the solver except the clue semantics.
 */
function bruteForceCount(p: Puzzle, cap: number): number {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const n = p.people.length;
  const fs = p.clues.map((cl) => compilePredicate(cl.predicate, ctx.personIndex.get(cl.personId) as number, ctx));
  const pos = new Int16Array(n).fill(-1);
  const used = new Uint8Array(g.size);
  let count = 0;
  const rec = (k: number): void => {
    if (count >= cap) return;
    if (k === n) {
      if (fs.every((f) => f(pos) === 1)) count++;
      return;
    }
    for (const c of g.free) {
      if (used[c]) continue;
      used[c] = 1;
      pos[k] = c;
      rec(k + 1);
      used[c] = 0;
      pos[k] = -1;
    }
  };
  rec(0);
  return count;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── static data checks
for (const [tid, theme] of Object.entries(THEMES)) {
  if (theme.roomNames.length < 14) fail(tid, 'fewer than 14 room names');
  if (theme.palette.length < 8) fail(tid, 'fewer than 8 colours');
  if (theme.titleWords.a.length < 20 || theme.titleWords.b.length < 20) fail(tid, 'title pools < 20');
  if (new Set(theme.roomNames).size !== theme.roomNames.length) fail(tid, 'duplicate room names');
}
if (CAST.length !== 24 || CAST.filter((c) => c.pronoun === 'he').length !== 12) fail('cast', 'need 12 he + 12 she');
if (new Set(CAST.map((c) => c.name)).size !== 24) fail('cast', 'duplicate names');

// ── generate
let total = 0;
let bruteChecked = 0;
const examples: Partial<Record<Tier, Puzzle>> = {};
for (const season of SEASONS) {
  for (const tier of TIERS) {
    const n = Math.min(CASES_PER_TIER, season.casesPerTier);
    for (let i = 1; i <= n; i++) {
      const id = `${season.id}-${tier}-${i}`;
      try {
        const t0 = performance.now();
        const p = generatePuzzleUncached(season.id, tier, i);
        const dt = performance.now() - t0;
        (timings[tier] ??= []).push(dt);
        total++;
        checkPuzzle(p);
        if (i <= 2) {
          const again = generatePuzzleUncached(season.id, tier, i);
          if (!deepEqual(p, again)) fail(id, 'not deterministic');
        }
        if (season.id === 'files' && i === 8) examples[tier] = p;
        if (Math.pow(buildGridCtx(p).free.length, p.people.length) < 4e5) {
          bruteChecked++;
          const bc = bruteForceCount(p, 2);
          if (bc !== 1) fail(id, `brute force found ${bc} solutions`);
        }
      } catch (e) {
        fail(id, `threw ${(e as Error).message}`);
      }
    }
  }
}
for (const date of ['2026-10-11', '2026-10-14', '2026-10-17']) {
  try {
    const t0 = performance.now();
    const p = dailyPuzzle(date);
    (timings[`daily(${p.tier})`] ??= []).push(performance.now() - t0);
    total++;
    checkPuzzle(p);
    if (!deepEqual(p, generatePuzzleUncached('daily', p.tier, p.index))) fail(p.id, 'daily not deterministic');
  } catch (e) {
    fail(`daily ${date}`, `threw ${(e as Error).message}`);
  }
}

// ── the solver must exit fast on an under-constrained input too
{
  const big = generatePuzzleUncached('files', 'extreme', 40);
  const t0 = performance.now();
  const r = countSolutions(big, big.clues.filter((_, i) => i % 3 === 0), 2);
  const dt = performance.now() - t0;
  if (r.count !== 2) fail(big.id, `a third of the clues should leave ≥ 2 solutions, got ${r.count}`);
  if (dt > 100) fail(big.id, `under-constrained solve took ${dt.toFixed(0)} ms`);
}

// ── report
const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));
console.log('\nCRIME FILES — engine test\n');
console.log(`${pad('TIER', 18)}${pad('N', 6)}${pad('AVG ms', 10)}MAX ms`);
for (const [tier, ts] of Object.entries(timings)) {
  const avg = ts.reduce((a, b) => a + b, 0) / ts.length;
  console.log(`${pad(tier, 18)}${pad(String(ts.length), 6)}${pad(avg.toFixed(1), 10)}${Math.max(...ts).toFixed(1)}`);
}
const sAvg = solveTimings.reduce((a, b) => a + b, 0) / Math.max(1, solveTimings.length);
console.log(`\nbrute-force cross-checked: ${bruteChecked} small puzzles`);
console.log(`solver countSolutions: avg ${sAvg.toFixed(2)} ms, max ${Math.max(...solveTimings).toFixed(2)} ms`);

if (process.env.GRID_TEST_VERBOSE) {
  for (const tier of TIERS) {
    const p = examples[tier];
    if (!p) continue;
    console.log(`\n── ${p.id} "${p.title}" ${p.rows}×${p.cols}, rule ${p.killerRule.type}`);
    for (const person of p.people) {
      const lines = p.clues.filter((c) => c.personId === person.id).map((c) => c.text).join(' ');
      console.log(`  ${pad(person.name + (person.isVictim ? ' (victim)' : ''), 22)}${lines}`);
    }
  }
}

console.log(`\n${total} puzzles generated, ${failures.length} failure(s).`);
for (const f of failures.slice(0, 60)) console.log(`  - ${f}`);
process.exit(failures.length ? 1 : 0);

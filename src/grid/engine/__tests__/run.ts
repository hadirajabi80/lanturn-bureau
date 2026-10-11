/**
 * `npm run grid:test` — generates every season × tier × first 15 cases (plus
 * the 12×12 extreme cases 36–40 and a few daily cases) and checks the
 * invariants from docs/GRID-PLAN.md. `npm run grid:test -- --all` runs the
 * full 40-per-tier stress set. Exits 1 on any failure.
 */
import type { Cell, Puzzle, Tier } from '../../types';
import { OCCUPIABLE, TIERS, cellKey } from '../../types';
import {
  SEASONS, THEMES, CAST, buildGridCtx, checkPlacement, candidateCells, countSolutions, dailyPuzzle, gridSizeFor,
  generatePuzzleUncached, killerFor, puzzleTitle, isKillerRuleClue, evalPredicate, makePuzzleCtx, compilePredicate,
} from '../index';

const ALL = process.argv.includes('--all');
const CASES_PER_TIER = Number(process.env.GRID_TEST_N ?? (ALL ? 40 : 15));
const failures: string[] = [];
const fail = (id: string, msg: string): void => { failures.push(`${id}: ${msg}`); };

/** generation time per board size N */
const genBySize: Record<number, number[]> = {};
const solveBySize: Record<number, number[]> = {};
let victimExtraClues = 0;
const cluesPerSuspect: Record<Tier, number[]> = { easy: [], medium: [], hard: [], extreme: [] };

function sameCell(a: Cell | undefined, b: Cell | undefined): boolean {
  return !!a && !!b && a.r === b.r && a.c === b.c;
}

function checkPuzzle(p: Puzzle): void {
  const id = p.id;
  const g = buildGridCtx(p);
  const N = p.rows;

  // ── board shape: N×N with exactly N people
  if (p.rows !== p.cols) fail(id, `grid ${p.rows}×${p.cols} is not square`);
  if (p.people.length !== N) fail(id, `${p.people.length} people on a ${N}×${N} board`);
  if (p.seasonId !== 'daily' && N !== gridSizeFor(p.tier, p.index)) fail(id, `size ${N} != gridSizeFor ${gridSizeFor(p.tier, p.index)}`);
  if (p.rooms.length < N - 1 || p.rooms.length > N + 1) fail(id, `${p.rooms.length} rooms for N=${N}`);

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
  if (new Set(p.rooms.map((r) => r.name)).size !== p.rooms.length) fail(id, 'duplicate room names');
  if (new Set(p.rooms.map((r) => r.color)).size !== p.rooms.length) fail(id, 'duplicate room colours');

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
  // every row and column keeps ≥ 2 free cells
  for (let i = 0; i < N; i++) {
    let fr = 0, fc = 0;
    for (let j = 0; j < N; j++) {
      if (!g.blocked[i * N + j]) fr++;
      if (!g.blocked[j * N + i]) fc++;
    }
    if (fr < 2) fail(id, `row ${i} has ${fr} free cells`);
    if (fc < 2) fail(id, `column ${i} has ${fc} free cells`);
  }

  // people: one per row and per column
  const victims = p.people.filter((x) => x.isVictim);
  if (victims.length !== 1) fail(id, `${victims.length} victims`);
  if (new Set(p.people.map((x) => x.id)).size !== p.people.length) fail(id, 'duplicate person ids');
  const rowsUsed = new Set<number>(), colsUsed = new Set<number>();
  for (const person of p.people) {
    const c = p.solution[person.id];
    if (!c) { fail(id, `${person.id} has no solution cell`); continue; }
    if (rowsUsed.has(c.r)) fail(id, `two people in row ${c.r}`);
    if (colsUsed.has(c.c)) fail(id, `two people in column ${c.c}`);
    rowsUsed.add(c.r);
    colsUsed.add(c.c);
    if (g.blocked[c.r * p.cols + c.c]) fail(id, `${person.id} stands on blocking furniture`);
    const kind = g.kindAt[c.r * p.cols + c.c];
    if (kind && !OCCUPIABLE[kind]) fail(id, `${person.id} on ${kind}`);
    const n = p.clues.filter((cl) => cl.personId === person.id).length;
    if (n === 0) fail(id, `${person.id} has no clue`);
    if (!person.isVictim) {
      if (n > 3) fail(id, `${person.id} has ${n} clues`);
      cluesPerSuspect[p.tier].push(n);
    } else victimExtraClues += n - 1;
  }
  if (rowsUsed.size !== N || colsUsed.size !== N) fail(id, 'not exactly one person per row and column');

  // killer: aloneWithVictim, the victim's room holds exactly the victim and the killer
  if (p.killerRule.type !== 'aloneWithVictim') fail(id, `killer rule ${p.killerRule.type}`);
  const victim = victims[0];
  if (victim) {
    const vRoom = seen.get(cellKey(p.solution[victim.id] as Cell));
    const inRoom = p.people.filter((x) => seen.get(cellKey(p.solution[x.id] as Cell)) === vRoom);
    if (inRoom.length !== 2) fail(id, `victim's room holds ${inRoom.length} people`);
    const other = inRoom.find((x) => !x.isVictim);
    if (other?.id !== p.killerId) fail(id, `killer ${p.killerId} is not the other person in the victim's room`);
  }
  const k = killerFor(p, p.solution);
  if (k !== p.killerId) fail(id, `killerFor = ${k}, expected ${p.killerId}`);
  if (p.people.find((x) => x.id === p.killerId)?.isVictim) fail(id, 'killer is the victim');

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
  (solveBySize[N] ??= []).push(performance.now() - t0);
  if (res.count !== 1) fail(id, `solver found ${res.count} solutions`);
  else for (const person of p.people) {
    if (!sameCell(res.first?.[person.id], p.solution[person.id])) fail(id, `solver solution differs for ${person.id}`);
  }

  // play API
  const chk = checkPlacement(p, p.solution);
  if (!chk.ok) fail(id, `checkPlacement(solution) not ok: ${JSON.stringify(chk.violations)}`);
  const [a, b] = p.people as [typeof p.people[0], typeof p.people[0]];
  const sa = p.solution[a.id] as Cell, sb = p.solution[b.id] as Cell;
  // put b into a's row → a row collision is reported for both, with clueIndex -1
  const clash: Record<string, Cell | null> = {};
  for (const person of p.people) clash[person.id] = null;
  clash[a.id] = sa;
  clash[b.id] = { r: sa.r, c: sb.c };
  const v = checkPlacement(p, clash).violations.filter((x) => x.clueIndex === -1).map((x) => x.personId);
  if (!v.includes(a.id) || !v.includes(b.id)) fail(id, 'row collision not reported by checkPlacement');
  const partial: Record<string, Cell | null> = {};
  for (const person of p.people) partial[person.id] = null;
  const cands = candidateCells(p, a.id, partial);
  if (!cands.some((c) => sameCell(c, sa))) fail(id, 'candidateCells misses the solution cell');
  partial[b.id] = sb;
  const cands2 = candidateCells(p, a.id, partial);
  if (cands2.some((c) => c.r === sb.r || c.c === sb.c)) fail(id, 'candidateCells offers a used row/column');
  if (!cands2.some((c) => sameCell(c, sa))) fail(id, 'candidateCells (partial) misses the solution cell');
  const victimClue = p.clues.findIndex((cl) => p.people.find((x) => x.id === cl.personId)?.isVictim);
  if (victimClue < 0 || !isKillerRuleClue(p, victimClue)) fail(id, 'victim killer-rule clue missing');
  if (p.clues.some((_, i) => i !== victimClue && isKillerRuleClue(p, i))) fail(id, 'isKillerRuleClue matches a non-rule clue');
}

/**
 * Independent uniqueness check for small boards: enumerate every assignment of
 * people to distinct rows and columns on free cells and evaluate all clues
 * only on complete placements. Shares nothing with the solver except the clue
 * semantics.
 */
function bruteForceCount(p: Puzzle, cap: number): number {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const n = p.people.length;
  const fs = p.clues.map((cl) => compilePredicate(cl.predicate, ctx.personIndex.get(cl.personId) as number, ctx));
  const pos = new Int16Array(n).fill(-1);
  const rowUsed = new Uint8Array(p.rows), colUsed = new Uint8Array(p.cols);
  let count = 0;
  const rec = (k: number): void => {
    if (count >= cap) return;
    if (k === n) {
      if (fs.every((f) => f(pos) === 1)) count++;
      return;
    }
    for (const c of g.free) {
      const r = Math.floor(c / p.cols), col = c % p.cols;
      if (rowUsed[r] || colUsed[col]) continue;
      rowUsed[r] = 1; colUsed[col] = 1;
      pos[k] = c;
      rec(k + 1);
      rowUsed[r] = 0; colUsed[col] = 0;
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
  if (theme.palette.length < 13) fail(tid, 'fewer than 13 colours (12×12 maps use up to 13 rooms)');
  if (new Set(theme.palette).size !== theme.palette.length) fail(tid, 'duplicate colours');
  if (theme.titleWords.a.length < 20 || theme.titleWords.b.length < 20) fail(tid, 'title pools < 20');
  if (new Set(theme.roomNames).size !== theme.roomNames.length) fail(tid, 'duplicate room names');
}
if (CAST.length !== 24 || CAST.filter((c) => c.pronoun === 'he').length !== 12) fail('cast', 'need 12 he + 12 she');
if (new Set(CAST.map((c) => c.name)).size !== 24) fail('cast', 'duplicate names');
const ladder: Record<Tier, [number, number][]> = {
  easy: [[1, 4], [20, 4], [21, 5], [40, 5]],
  medium: [[1, 5], [20, 5], [21, 6], [40, 6]],
  hard: [[1, 6], [15, 6], [16, 7], [30, 7], [31, 8], [40, 8]],
  extreme: [[1, 8], [10, 8], [11, 9], [20, 9], [21, 10], [30, 10], [31, 11], [35, 11], [36, 12], [40, 12]],
};
for (const tier of TIERS) for (const [i, n] of ladder[tier]) if (gridSizeFor(tier, i) !== n) fail('gridSizeFor', `${tier} ${i} → ${gridSizeFor(tier, i)}, want ${n}`);

// ── generate
let total = 0;
let bruteChecked = 0;
const examples: Partial<Record<Tier, Puzzle>> = {};
const tStart = performance.now();
function runCase(seasonId: string, tier: Tier, i: number): void {
  const id = `${seasonId}-${tier}-${i}`;
  try {
    const t0 = performance.now();
    const p = generatePuzzleUncached(seasonId, tier, i);
    const dt = performance.now() - t0;
    (genBySize[p.rows] ??= []).push(dt);
    total++;
    checkPuzzle(p);
    if (i <= 2 || i === 40) {
      const again = generatePuzzleUncached(seasonId, tier, i);
      if (!deepEqual(p, again)) fail(id, 'not deterministic');
    }
    if (seasonId === 'files' && i === 8) examples[tier] = p;
    if (p.people.length <= 5) {
      bruteChecked++;
      const bc = bruteForceCount(p, 2);
      if (bc !== 1) fail(id, `brute force found ${bc} solutions`);
    }
  } catch (e) {
    fail(id, `threw ${(e as Error).message}`);
  }
}
for (const season of SEASONS) {
  for (const tier of TIERS) {
    const n = Math.min(CASES_PER_TIER, season.casesPerTier);
    for (let i = 1; i <= n; i++) runCase(season.id, tier, i);
    // the default run always covers the 12×12 extreme cases
    if (!ALL && tier === 'extreme' && season.casesPerTier >= 40) for (let i = 36; i <= 40; i++) if (i > n) runCase(season.id, tier, i);
  }
}
const dailyDates = ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-17', '2026-10-18', '2026-10-25'];
for (const date of dailyDates) {
  try {
    const t0 = performance.now();
    const p = dailyPuzzle(date);
    (genBySize[p.rows] ??= []).push(performance.now() - t0);
    total++;
    checkPuzzle(p);
    if (p.tier === 'extreme' && (p.rows < 9 || p.rows > 12)) fail(p.id, `daily extreme is ${p.rows}×${p.rows}`);
    if (!deepEqual(p, generatePuzzleUncached('daily', p.tier, p.index))) fail(p.id, 'daily not deterministic');
  } catch (e) {
    fail(`daily ${date}`, `threw ${(e as Error).message}`);
  }
}
const totalSec = (performance.now() - tStart) / 1000;

// ── the solver must exit fast on an under-constrained 12×12 input too
{
  const big = generatePuzzleUncached('files', 'extreme', 40);
  if (big.rows !== 12) fail(big.id, `expected 12×12, got ${big.rows}`);
  const t0 = performance.now();
  const r = countSolutions(big, big.clues.filter((_, i) => i % 3 === 0), 2);
  const dt = performance.now() - t0;
  if (r.count !== 2) fail(big.id, `a third of the clues should leave ≥ 2 solutions, got ${r.count}`);
  if (dt > 50) fail(big.id, `under-constrained 12×12 solve took ${dt.toFixed(1)} ms`);
  console.log(`under-constrained 12×12 countSolutions: ${dt.toFixed(2)} ms`);
}

// ── report
const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
console.log(`\nCRIME FILES — engine test${ALL ? ' (--all stress run)' : ''}\n`);
console.log(`${pad('BOARD', 9)}${pad('N', 6)}${pad('GEN avg', 10)}${pad('GEN max', 10)}${pad('SOLVE avg', 11)}SOLVE max (ms)`);
for (const size of Object.keys(genBySize).map(Number).sort((a, b) => a - b)) {
  const gs = genBySize[size] as number[], ss = solveBySize[size] ?? [];
  console.log(`${pad(`${size}×${size}`, 9)}${pad(String(gs.length), 6)}${pad(avg(gs).toFixed(1), 10)}${pad(Math.max(...gs).toFixed(1), 10)}`
    + `${pad(avg(ss).toFixed(2), 11)}${Math.max(...ss).toFixed(2)}`);
  if (Math.max(...ss) > 20) fail(`solver ${size}×${size}`, `max ${Math.max(...ss).toFixed(1)} ms > 20 ms`);
  if (avg(gs) > 300) fail(`generator ${size}×${size}`, `avg ${avg(gs).toFixed(0)} ms > 300 ms`);
}
console.log('\nclues per suspect (avg / max):');
for (const tier of TIERS) {
  const xs = cluesPerSuspect[tier];
  if (xs.length) console.log(`  ${pad(tier, 9)}${avg(xs).toFixed(2)} / ${Math.max(...xs)}`);
}
console.log(`victim position clues (beyond the killer-rule sentence): ${victimExtraClues} across ${total} puzzles`);
console.log(`brute-force cross-checked: ${bruteChecked} boards with ≤ 5 people`);
console.log(`total wall time: ${totalSec.toFixed(1)} s`);

if (process.env.GRID_TEST_VERBOSE) {
  for (const tier of TIERS) {
    const p = examples[tier];
    if (!p) continue;
    console.log(`\n── ${p.id} "${p.title}" ${p.rows}×${p.cols}`);
    for (const person of p.people) {
      const lines = p.clues.filter((c) => c.personId === person.id).map((c) => c.text).join(' ');
      console.log(`  ${pad(person.name + (person.isVictim ? ' (victim)' : ''), 22)}${lines}`);
    }
  }
}

console.log(`\n${total} puzzles generated, ${failures.length} failure(s).`);
for (const f of failures.slice(0, 60)) console.log(`  - ${f}`);
process.exit(failures.length ? 1 : 0);

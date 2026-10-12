/**
 * `npm run grid:test` — Floorplan Mysteries engine invariants (docs/GRID-PLAN.md).
 *
 * Default run: every district × tier × (first 6 + last 2 cases), 3 daily cases,
 * 1 weekly case, 10 custom cases, code round trips. `npm run grid:test -- --all`
 * generates every case of every district. Exits 1 on any failure.
 * Extra Extreme ('ultra'): first 3 cases per district by default, all 10 with --all; checks the
 * docs/EXTRA-EXTREME.md contract (no coordinate predicates, difficultyReport, every clue necessary).
 */
import type { Cell, Puzzle, Tier, Variant } from '../../types';
import { OCCUPIABLE, TIERS, cellKey } from '../../types';
import { DISTRICTS } from '../../skins/districts';
import {
  SEASONS, THEMES, CAST, buildGridCtx, checkPlacement, checkAccusation, candidateCells, countSolutions, gridSizeFor,
  generatePuzzleUncached, generatePuzzle, killerFor, culpritsFor, puzzleTitle, isKillerRuleClue, makePuzzleCtx,
  compilePredicate, deduceWorlds, variantFor, codeFor, parseCode, uncached, baseRuleItems, compileItem, ruleSpecOf,
  hypothesisItems, toPositions, isLiarVariant, isAccompliceVariant, isDoubleVariant, CASES_PER_TIER, tierSizeRange,
  VARIANT_MIN_SIZE, isoWeekOf, genStats, difficultyReport, puzzleWorlds, deduceDeep, ULTRA_K1, ULTRA_K2, BANNED_ULTRA,
} from '../index';
import type { DifficultyReport } from '../index';
import type { CustomOptions } from '../index';

const ALL = process.argv.includes('--all');
const VERBOSE = !!process.env.GRID_TEST_VERBOSE;
const failures: string[] = [];
const fail = (id: string, msg: string): void => { failures.push(`${id}: ${msg}`); };
const warnings: string[] = [];

/** generation / solve time per board size N */
const genBySize: Record<number, number[]> = {};
const solveBySize: Record<number, number[]> = {};
const variantByTier: Record<Tier, Record<string, number>> = { easy: {}, medium: {}, hard: {}, extreme: {}, mastermind: {}, ultra: {} };
const cluesPerSuspect: Record<Tier, number[]> = { easy: [], medium: [], hard: [], extreme: [], mastermind: [], ultra: [] };
/** Extra Extreme generation times per N (separate budget) and difficulty reports (ultra vs mastermind) */
const genUltraBySize: Record<number, number[]> = {};
const reports: Partial<Record<Tier, DifficultyReport[]>> = {};
const ultraSamples: Puzzle[] = [];
const samples: Partial<Record<Variant, Puzzle>> = {};
let victimExtraClues = 0;
let bruteChecked = 0;
const layoutFallbacks: string[] = [];

/** probe depth used by the generator at the top of each tier ramp (the deducibility check may not be weaker) */
const PROBE: Record<Tier, number> = { easy: 0, medium: 2, hard: 3, extreme: 4, mastermind: 4, ultra: ULTRA_K1 };

const sameCell = (a: Cell | undefined, b: Cell | undefined): boolean => !!a && !!b && a.r === b.r && a.c === b.c;

function checkRooms(p: Puzzle): Map<string, string> {
  const id = p.id;
  const N = p.rows;
  const hi = p.tier === 'mastermind' ? N + 3 : N + 2;
  if (p.rooms.length < Math.min(N - 1, 4) || p.rooms.length > hi) fail(id, `${p.rooms.length} rooms for N=${N} (${p.layout})`);
  const seen = new Map<string, string>();
  for (const room of p.rooms) {
    if (room.cells.length < 3) fail(id, `room ${room.name} has ${room.cells.length} cells (${p.layout})`);
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
      if (reached.size !== keys.size) fail(id, `room ${room.name} not connected (${p.layout})`);
    }
  }
  if (seen.size !== p.rows * p.cols) fail(id, `rooms cover ${seen.size}/${p.rows * p.cols} cells`);
  if (new Set(p.rooms.map((r) => r.name)).size !== p.rooms.length) fail(id, 'duplicate room names');
  if (new Set(p.rooms.map((r) => r.color)).size !== p.rooms.length) fail(id, 'duplicate room colours');
  return seen;
}

function checkPuzzle(p: Puzzle, expect: { size?: number; variant?: Variant } = {}): void {
  const id = p.id;
  const g = buildGridCtx(p);
  const N = p.rows;
  const variant = p.variant ?? 'classic';

  // ── board shape: N×N with exactly N people
  if (p.rows !== p.cols) fail(id, `grid ${p.rows}×${p.cols} is not square`);
  if (p.people.length !== N) fail(id, `${p.people.length} people on a ${N}×${N} board`);
  if (expect.size !== undefined && N !== expect.size) fail(id, `size ${N} != expected ${expect.size}`);
  if (expect.variant !== undefined && variant !== expect.variant) fail(id, `variant ${variant} != expected ${expect.variant}`);
  if (!p.layout || !p.skinId) fail(id, 'missing layout / skinId');
  const roomOf = checkRooms(p);

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
      if (roomOf.get(cellKey(a)) !== roomOf.get(cellKey(b))) fail(id, `${f.id} spans two rooms`);
    } else if (f.cells.length !== 1) fail(id, `${f.id} has ${f.cells.length} cells`);
  }
  for (let i = 0; i < N; i++) {
    let fr = 0, fc = 0;
    for (let j = 0; j < N; j++) {
      if (!g.blocked[i * N + j]) fr++;
      if (!g.blocked[j * N + i]) fc++;
    }
    if (fr < 2 || fc < 2) fail(id, `row/column ${i} has < 2 free cells`);
  }

  // ── people & roles
  const victims = p.people.filter((x) => x.isVictim);
  const nv = isDoubleVariant(variant) ? 2 : 1;
  if (victims.length !== nv) fail(id, `${victims.length} victims for ${variant}`);
  if (JSON.stringify(victims.map((v) => v.id).sort()) !== JSON.stringify([...(p.victimIds ?? [])].sort())) fail(id, 'victimIds mismatch');
  if ((p.killerIds ?? []).length !== nv || p.killerIds?.[0] !== p.killerId) fail(id, 'killerIds mismatch');
  if (new Set([...(p.killerIds ?? []), ...(p.victimIds ?? [])]).size !== 2 * nv) fail(id, 'killer is a victim / duplicate roles');
  if (isAccompliceVariant(variant) !== !!p.accompliceId) fail(id, 'accompliceId presence');
  if (p.accompliceId && (p.killerIds ?? []).includes(p.accompliceId)) fail(id, 'accomplice is a killer');
  if (isLiarVariant(variant) !== !!p.liarId) fail(id, 'liarId presence');
  if (variant === 'liar' && p.liarId !== p.killerId) fail(id, 'liar is not the killer');
  if (variant === 'liarDouble' && !(p.killerIds ?? []).includes(p.liarId ?? '')) fail(id, 'liar is not one of the killers');
  if (variant === 'accompliceLiar' && p.liarId !== p.accompliceId) fail(id, 'liar is not the accomplice');
  if ((variant === 'poison') !== !!p.poisonKind) fail(id, 'poisonKind presence');
  if (p.poisonKind && p.furniture.filter((f) => f.kind === p.poisonKind).length < 2) fail(id, 'poison kind present < 2 times');
  if (p.poisonKind && OCCUPIABLE[p.poisonKind]) fail(id, `poison hidden in a seat (${p.poisonKind})`);

  const rowsUsed = new Set<number>(), colsUsed = new Set<number>();
  for (const person of p.people) {
    const c = p.solution[person.id];
    if (!c) { fail(id, `${person.id} has no solution cell`); continue; }
    rowsUsed.add(c.r);
    colsUsed.add(c.c);
    const kind = g.kindAt[c.r * p.cols + c.c];
    if (g.blocked[c.r * p.cols + c.c] || (kind && !OCCUPIABLE[kind])) fail(id, `${person.id} stands on blocking furniture`);
    const n = p.clues.filter((cl) => cl.personId === person.id).length;
    if (n === 0) fail(id, `${person.id} has no clue`);
    if (!person.isVictim) {
      if (n > 3) fail(id, `${person.id} has ${n} clues`);
      if (person.id === p.liarId && n < 2) fail(id, `liar has ${n} clue(s)`);
      cluesPerSuspect[p.tier].push(n);
    } else victimExtraClues += n - 1;
  }
  if (rowsUsed.size !== N || colsUsed.size !== N) fail(id, 'not exactly one person per row and column');

  // ── the scenario rule holds and names the recorded culprits
  const ctx = makePuzzleCtx(p);
  const pos = toPositions(ctx, p.solution);
  const spec = ruleSpecOf(p);
  for (const it of baseRuleItems(ctx, spec)) if (compileItem(ctx, it).f(pos) !== 1) fail(id, `scenario rule broken in the solution (${variant})`);
  if (p.liarId) {
    for (const it of hypothesisItems(ctx, spec, ctx.personIndex.get(p.liarId) as number)) {
      if (compileItem(ctx, it).f(pos) !== 1) fail(id, 'liar role rule broken');
    }
  }
  const cul = culpritsFor(p, p.solution);
  if (!cul) fail(id, 'culpritsFor(solution) = null');
  else {
    if (cul.killers.join() !== (p.killerIds ?? []).join()) fail(id, `culprits ${cul.killers} != killerIds ${p.killerIds}`);
    if ((cul.accomplice ?? undefined) !== p.accompliceId) fail(id, 'accomplice mismatch');
  }
  if (killerFor(p, p.solution) !== p.killerId) fail(id, 'killerFor mismatch');

  // ── clues: true for everyone, ALL false for the liar; text sanity
  p.clues.forEach((cl) => {
    const self = ctx.personIndex.get(cl.personId) as number;
    const v = compilePredicate(cl.predicate, self, ctx)(pos);
    const want = cl.personId === p.liarId ? 0 : 1;
    if (v !== want) fail(id, `clue ${want ? 'false' : 'true'} in solution: "${cl.text}"${cl.personId === p.liarId ? ' (liar)' : ''}`);
    if (/\{|\}|undefined|NaN|someone|unknown room/.test(cl.text)) fail(id, `bad text "${cl.text}"`);
    if (!/^[A-Z].*\.$/.test(cl.text)) fail(id, `unpunctuated text "${cl.text}"`);
  });
  for (const v of victims) {
    const at = p.clues.findIndex((cl) => cl.personId === v.id);
    if (at < 0 || !isKillerRuleClue(p, at)) fail(id, `victim ${v.id} rule sentence missing`);
  }
  if (!p.title || !p.title.startsWith('The ')) fail(id, `bad title "${p.title}"`);

  // ── uniqueness across every liar hypothesis (exhaustive)
  const t0 = performance.now();
  const res = countSolutions(p, p.clues, 2);
  (solveBySize[N] ??= []).push(performance.now() - t0);
  if (res.count !== 1) fail(id, `solver found ${res.count} solutions`);
  else {
    for (const person of p.people) if (!sameCell(res.first?.[person.id], p.solution[person.id])) fail(id, `solver solution differs for ${person.id}`);
    if (res.liarId !== p.liarId) fail(id, `solver liar ${res.liarId} != ${p.liarId}`);
  }

  // ── human deducibility: one world solved, every other liar hypothesis contradicts
  //    (Extra Extreme: the depth-2 what-if engine)
  const worlds = p.tier === 'ultra'
    ? puzzleWorlds(p).map((w) => {
      const r = deduceDeep(w.prob, w.act, ULTRA_K1, ULTRA_K2);
      return { liar: w.liar === null ? null : (ctx.personIds[w.liar] as string), status: r.status };
    })
    : deduceWorlds(p, PROBE[p.tier]);
  const solved = worlds.filter((w) => w.status === 'solved');
  if (solved.length !== 1) fail(id, `deduction: ${solved.length} solved worlds`);
  else if (solved[0]?.liar !== (p.liarId ?? null)) fail(id, 'deduction solved the wrong liar world');
  const open = worlds.filter((w) => w.status === 'stuck');
  if (open.length) fail(id, `deduction stuck in ${open.length} world(s) (liars ${open.map((w) => w.liar).join(',')})`);

  // ── play API
  const chk = checkPlacement(p, p.solution);
  if (!chk.ok) fail(id, `checkPlacement(solution) not ok: ${JSON.stringify(chk.violations)}`);
  const [a, b] = p.people as [typeof p.people[0], typeof p.people[0]];
  const sa = p.solution[a.id] as Cell, sb = p.solution[b.id] as Cell;
  const clash: Record<string, Cell | null> = { ...p.solution, [b.id]: { r: sa.r, c: sb.c } };
  const cv = checkPlacement(p, clash);
  if (cv.ok || !cv.violations.some((x) => x.clueIndex === -1 && x.personId === a.id) || !cv.violations.some((x) => x.clueIndex === -1 && x.personId === b.id)) {
    fail(id, 'row collision not reported by checkPlacement');
  }
  // swapping two people's columns keeps one-per-row/col but must break a clue or the rule
  const swapped: Record<string, Cell | null> = { ...p.solution, [a.id]: { r: sa.r, c: sb.c }, [b.id]: { r: sb.r, c: sa.c } };
  const blockedSwap = g.blocked[sa.r * N + sb.c] || g.blocked[sb.r * N + sa.c];
  const sw = checkPlacement(p, swapped);
  if (sw.ok) fail(id, 'checkPlacement accepts a wrong placement');
  if (!blockedSwap && !sw.violations.length) fail(id, 'wrong placement without violations');
  try { checkPlacement(p, { [a.id]: { r: -3, c: 99 } }); } catch { fail(id, 'checkPlacement threw on garbage'); }
  const empty: Record<string, Cell | null> = {};
  for (const person of p.people) empty[person.id] = null;
  if (!candidateCells(p, a.id, empty).some((c) => sameCell(c, sa))) fail(id, 'candidateCells misses the solution cell');
  const partial = { ...empty, [b.id]: sb };
  const c2 = candidateCells(p, a.id, partial);
  if (c2.some((c) => c.r === sb.r || c.c === sb.c)) fail(id, 'candidateCells offers a used row/column');
  if (!c2.some((c) => sameCell(c, sa))) fail(id, 'candidateCells (partial) misses the solution cell');

  // ── accusation
  const pairs: Record<string, string> = {};
  (p.victimIds ?? []).forEach((v, i) => { pairs[v] = (p.killerIds ?? [])[i] as string; });
  const right = { killers: [...(p.killerIds ?? [])].reverse(), accomplice: p.accompliceId, pairs };
  if (!checkAccusation(p, right)) fail(id, 'checkAccusation rejects the truth');
  const innocent = p.people.find((x) => !x.isVictim && !(p.killerIds ?? []).includes(x.id) && x.id !== p.accompliceId);
  if (innocent && checkAccusation(p, { ...right, killers: [innocent.id, ...(p.killerIds ?? []).slice(1)] })) fail(id, 'checkAccusation accepts an innocent');
  if (p.accompliceId && checkAccusation(p, { ...right, accomplice: p.killerId })) fail(id, 'checkAccusation accepts a wrong accomplice');
  if (nv === 2) {
    const [v1, v2] = p.victimIds as [string, string];
    if (checkAccusation(p, { ...right, pairs: { [v1]: pairs[v2] as string, [v2]: pairs[v1] as string } })) fail(id, 'checkAccusation accepts swapped pairs');
  }

  // ── code round trip
  const code = codeFor(p);
  const parsed = parseCode(code);
  if (!parsed) fail(id, `parseCode(${code}) = null`);
  else if (parsed.puzzle().id !== p.id) fail(id, `code ${code} → ${parsed.puzzle().id}`);

  // ── brute force on small boards (shares only clue / rule semantics with the solver)
  if (N <= 5) {
    bruteChecked++;
    const bc = bruteForceCount(p, 2);
    if (bc !== 1) fail(id, `brute force found ${bc} solutions`);
  }

  variantByTier[p.tier][variant] = (variantByTier[p.tier][variant] ?? 0) + 1;
  samples[variant] ??= p;
  if (p.tier === 'ultra') checkUltra(p);
}

/** docs/EXTRA-EXTREME.md §1 + §3 */
function checkUltra(p: Puzzle): void {
  const id = p.id;
  const rep = difficultyReport(p);
  (reports.ultra ??= []).push(rep);
  if (!rep.ok) fail(id, `contract: ${rep.problems.join('; ')}`);
  // no coordinate predicates anywhere (the rule sentence carries no position)
  const walk = (pr: Puzzle['clues'][number]['predicate'], out: string[]): string[] => {
    out.push(pr.type);
    if (pr.type === 'or' || pr.type === 'ifThen' || pr.type === 'xor' || pr.type === 'and') { walk(pr.a, out); walk(pr.b, out); }
    if (pr.type === 'not') walk(pr.p, out);
    return out;
  };
  p.clues.forEach((cl, i) => {
    if (isKillerRuleClue(p, i)) return;
    const bad = walk(cl.predicate, []).filter((t) => BANNED_ULTRA.has(t as never));
    if (bad.length) fail(id, `banned predicate ${bad.join(',')} in "${cl.text}"`);
    // room names ("Noodle Row") are names, not coordinates
    const plain = p.rooms.reduce((t, r) => t.split(r.name).join(''), cl.text);
    if (/\b(row|column|corner|edge)\b/i.test(plain)) fail(id, `coordinate wording "${cl.text}"`);
  });
  // every clue matters: removing any sentence breaks uniqueness (over every liar reading)
  p.clues.forEach((cl, i) => {
    if (isKillerRuleClue(p, i)) return;
    const rest = p.clues.filter((_, j) => j !== i);
    if (countSolutions(p, rest, 2).count < 2) fail(id, `clue not necessary: "${cl.text}"`);
  });
  if (ultraSamples.length < 40) ultraSamples.push(p);
}

/** Enumerate every one-per-row/column placement; count those where some liar reading (or none) satisfies everything. */
function bruteForceCount(p: Puzzle, cap: number): number {
  const ctx = makePuzzleCtx(p);
  const g = ctx.grid;
  const n = p.people.length;
  const spec = ruleSpecOf(p);
  const fs = p.clues.map((cl) => ({ owner: ctx.personIndex.get(cl.personId) as number, f: compilePredicate(cl.predicate, ctx.personIndex.get(cl.personId) as number, ctx) }));
  const rule = baseRuleItems(ctx, spec).map((it) => compileItem(ctx, it).f);
  const liars = isLiarVariant(spec.variant) ? p.people.map((_, i) => i).filter((i) => !spec.victims.includes(i)) : [-1];
  const hyp = liars.map((L) => (L < 0 ? [] : hypothesisItems(ctx, spec, L).map((it) => compileItem(ctx, it).f)));
  const pos = new Int16Array(n).fill(-1);
  const rowUsed = new Uint8Array(p.rows), colUsed = new Uint8Array(p.cols);
  let count = 0;
  const rec = (k: number): void => {
    if (count >= cap) return;
    if (k === n) {
      if (!rule.every((f) => f(pos) === 1)) return;
      liars.forEach((L, li) => {
        if (fs.every((c) => c.f(pos) === (c.owner === L ? 0 : 1)) && (hyp[li] ?? []).every((f) => f(pos) === 1)) count++;
      });
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

const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

// ── static data checks
if (SEASONS.length !== DISTRICTS.length) fail('SEASONS', 'not derived from DISTRICTS');
for (const d of DISTRICTS) {
  const theme = THEMES[d.themeId];
  if (!theme) { fail(d.id, `theme ${d.themeId} missing`); continue; }
  if (theme.roomNames.length < 18) fail(d.themeId, 'fewer than 18 room names (14×14 mastermind uses up to 17 rooms)');
  if (theme.palette.length < 17) fail(d.themeId, 'fewer than 17 colours');
  if (theme.titleWords.a.length < 24 || theme.titleWords.b.length < 24) fail(d.themeId, 'title pools < 24');
  for (const k of d.furniture) if (!theme.furniture.includes(k)) fail(d.themeId, `district furniture ${k} missing from theme pool`);
}
for (const [tid, theme] of Object.entries(THEMES)) {
  if (new Set(theme.palette).size !== theme.palette.length) fail(tid, 'duplicate colours');
  if (new Set(theme.roomNames).size !== theme.roomNames.length) fail(tid, 'duplicate room names');
}
if (CAST.length !== 24 || CAST.filter((c) => c.pronoun === 'he').length !== 12) fail('cast', 'need 12 he + 12 she');
const ladder: Record<Tier, [number, number][]> = {
  easy: [[1, 4], [15, 4], [16, 5], [30, 5]],
  medium: [[1, 5], [10, 5], [11, 6], [20, 6], [21, 7], [30, 7]],
  hard: [[1, 7], [10, 7], [11, 8], [20, 8], [21, 9], [30, 9]],
  extreme: [[1, 9], [8, 9], [9, 10], [16, 10], [17, 11], [24, 11], [25, 12], [30, 12]],
  mastermind: [[1, 12], [4, 12], [5, 13], [7, 13], [8, 14], [10, 14]],
  ultra: [[1, 8], [2, 9], [3, 9], [4, 10], [5, 10], [6, 11], [7, 11], [8, 12], [9, 12], [10, 12]],
};
for (const tier of TIERS) for (const [i, n] of ladder[tier]) if (gridSizeFor(tier, i) !== n) fail('gridSizeFor', `${tier} ${i} → ${gridSizeFor(tier, i)}, want ${n}`);
for (let i = 1; i <= 30; i++) if (variantFor('easy', i) !== 'classic') fail('variantFor', `easy ${i} not classic`);
for (let i = 1; i <= 15; i++) if (variantFor('hard', i) === 'liar') fail('variantFor', `hard ${i} is liar`);
for (let i = 1; i <= 15; i++) if (variantFor('extreme', i) === 'double') fail('variantFor', `extreme ${i} is double`);
if (generatePuzzle('files', 'easy', 1).id !== 'ashcombe-easy-1') fail('legacy', 'files → ashcombe');
if (puzzleTitle('files2', 'medium', 3) !== puzzleTitle('harrow', 'medium', 3)) fail('legacy', 'files2 title');

// ── generate
let total = 0;
const tStart = performance.now();
function timed(make: () => Puzzle): Puzzle {
  const t0 = performance.now();
  const p = make();
  ((p.tier === 'ultra' ? genUltraBySize : genBySize)[p.rows] ??= []).push(performance.now() - t0);
  total++;
  return p;
}
for (const d of DISTRICTS) {
  for (const tier of TIERS) {
    const n = d.casesPerTier[tier] ?? CASES_PER_TIER[tier];
    const idx = ALL ? Array.from({ length: n }, (_, i) => i + 1) : tier === 'ultra' ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, n - 1, n];
    for (const i of idx) {
      const id = `${d.id}-${tier}-${i}`;
      try {
        const p = timed(() => generatePuzzleUncached(d.id, tier, i));
        if (tier === 'mastermind' && i <= 4) (reports.mastermind ??= []).push(difficultyReport(p));
        checkPuzzle(p, { size: gridSizeFor(tier, i), variant: variantFor(tier, i) });
        if (p.layout !== d.layout) layoutFallbacks.push(`${id} ${p.rows} ${d.layout}→${p.layout}`);
        if (p.title !== puzzleTitle(d.id, tier, i)) fail(id, 'title differs from puzzleTitle()');
        if (p.skinId !== d.id || p.seasonId !== d.id) fail(id, 'skinId / seasonId');
        if ((i <= 2 || i === n) && !deepEqual(p, generatePuzzleUncached(d.id, tier, i))) fail(id, 'not deterministic');
      } catch (e) {
        fail(id, `threw ${(e as Error).message}`);
      }
    }
  }
}
for (const date of ['2026-10-11', '2026-10-14', '2026-10-17']) {
  try {
    const p = timed(() => uncached.daily(date));
    const [lo, hi] = tierSizeRange(p.tier);
    if (p.rows < Math.min(lo, VARIANT_MIN_SIZE[p.variant ?? 'classic']) || p.rows > hi) fail(p.id, `daily size ${p.rows} outside ${lo}–${hi}`);
    checkPuzzle(p);
    if (!deepEqual(p, uncached.daily(date))) fail(p.id, 'daily not deterministic');
    if (codeFor(p) !== `DAILY-${date.replace(/-/g, '')}`) fail(p.id, `daily code ${codeFor(p)}`);
  } catch (e) {
    fail(`daily ${date}`, `threw ${(e as Error).message}`);
  }
}
try {
  const week = isoWeekOf('2026-10-11');
  if (week !== '2026-W41') fail('isoWeekOf', `2026-10-11 → ${week}`);
  const p = timed(() => uncached.weekly(week));
  checkPuzzle(p, { size: 14, variant: 'liarDouble' });
  if (codeFor(p) !== 'WEEK-2026W41') fail(p.id, `weekly code ${codeFor(p)}`);
} catch (e) {
  fail('weekly', `threw ${(e as Error).message}`);
}
const customs: CustomOptions[] = [
  { districtId: 'ashcombe', tier: 'easy', size: 4, variant: 'classic', seed: 1 },
  { districtId: 'harrow', tier: 'medium', size: 6, variant: 'poison', seed: 42 },
  { districtId: 'meridian', tier: 'hard', size: 8, variant: 'sniper', seed: 7 },
  { districtId: 'curiosities', tier: 'hard', size: 7, variant: 'lockedRoom', seed: 2026 },
  { districtId: 'neon', tier: 'extreme', size: 10, variant: 'accomplice', seed: 99 },
  { districtId: 'hollowmere', tier: 'hard', size: 6, variant: 'liar', seed: 5 },
  { districtId: 'express', tier: 'extreme', size: 9, variant: 'double', seed: 123456 },
  { districtId: 'frostmere', tier: 'mastermind', size: 11, variant: 'accompliceLiar', seed: 31337 },
  { districtId: 'candyfloss', tier: 'ultra', size: 9, variant: 'sniper', seed: 4242 },
  { districtId: DISTRICTS[DISTRICTS.length - 1]?.id ?? 'ashcombe', tier: 'medium', size: 5, variant: 'liarDouble', seed: 8 },
  { districtId: DISTRICTS[(DISTRICTS.length - 2 + DISTRICTS.length) % DISTRICTS.length]?.id ?? 'neon', tier: 'easy', size: 3, variant: 'classic', seed: 77 },
];
for (const o of customs) {
  const label = `custom ${o.districtId}/${o.variant}/${o.size}`;
  try {
    const p = timed(() => uncached.custom(o));
    const want = Math.max(VARIANT_MIN_SIZE[o.variant], Math.min(14, Math.max(4, o.size)));
    checkPuzzle(p, { size: want, variant: o.variant });
    const code = codeFor(p);
    const back = parseCode(code.toLowerCase());
    if (!back || back.kind !== 'custom' || back.puzzle().id !== p.id) fail(label, `code ${code} does not round-trip`);
  } catch (e) {
    fail(label, `threw ${(e as Error).message}`);
  }
}
for (const bad of ['', 'XYZ-R-1', 'ASH-Q-3', 'ASH-R-31', 'ASH-M-11', 'ASH-U-11', 'ASH-U-0', 'DAILY-20261340', 'WEEK-2026W60', 'C-ASH-R-3-classic-1', 'C-ASH-R-6-banana-1']) {
  if (parseCode(bad)) fail('parseCode', `accepted "${bad}"`);
}
for (const [code, id] of [['ash-h-12', 'ashcombe-hard-12'], ['NEO-X-30', 'neon-extreme-30'], [' exp-i-4 ', 'express-hard-4'], ['FRO-M-2', 'frostmere-mastermind-2'], ['ash-u-3', 'ashcombe-ultra-3'], ['NEO-X-3', 'neon-extreme-3']] as const) {
  const r = parseCode(code);
  if (!r || r.kind !== 'case') fail('parseCode', `rejected "${code}"`);
  else if (generatePuzzle(r.puzzle().seasonId, r.puzzle().tier, r.puzzle().index).id !== id) fail('parseCode', `"${code}" → ${r.puzzle().id}`);
}
const totalSec = (performance.now() - tStart) / 1000;

// ── report
const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
console.log(`\nFLOORPLAN MYSTERIES — engine test${ALL ? ' (--all)' : ''}\n`);
console.log(`${pad('BOARD', 9)}${pad('N', 6)}${pad('GEN avg', 10)}${pad('GEN max', 10)}${pad('SOLVE avg', 11)}SOLVE max (ms)`);
for (const size of Object.keys(genBySize).map(Number).sort((a, b) => a - b)) {
  const gs = genBySize[size] as number[], ss = solveBySize[size] ?? [0];
  console.log(`${pad(`${size}×${size}`, 9)}${pad(String(gs.length), 6)}${pad(avg(gs).toFixed(1), 10)}${pad(Math.max(...gs).toFixed(1), 10)}`
    + `${pad(avg(ss).toFixed(2), 11)}${Math.max(...ss).toFixed(2)}`);
  // budgets: solver ≤ 30 ms, generation ≤ 250 ms (≤ 12×12) / ≤ 600 ms (13–14). Over budget = warning;
  // over 1.5× budget = failure (the suite often shares the machine with builds).
  const budget = (label: string, v: number, lim: number): void => {
    if (v > lim * 1.5) fail(label, `avg ${v.toFixed(1)} ms > 1.5 × ${lim} ms`);
    else if (v > lim) warnings.push(`${label}: avg ${v.toFixed(1)} ms over the ${lim} ms budget`);
  };
  budget(`solver ${size}×${size}`, avg(ss), 30);
  budget(`generator ${size}×${size}`, avg(gs), size <= 12 ? 250 : 600);
}
const VARS: Variant[] = ['classic', 'accomplice', 'lockedRoom', 'poison', 'sniper', 'liar', 'double', 'liarDouble', 'accompliceLiar'];
console.log(`\nvariants per tier (generated):\n${pad('', 11)}${VARS.map((v) => pad(v.slice(0, 9), 10)).join('')}`);
for (const tier of TIERS) console.log(`${pad(tier, 11)}${VARS.map((v) => pad(String(variantByTier[tier][v] ?? 0), 10)).join('')}`);
console.log(`\nvariant schedule (variantFor, one district):`);
for (const tier of TIERS) {
  const cnt: Record<string, number> = {};
  for (let i = 1; i <= CASES_PER_TIER[tier]; i++) { const v = variantFor(tier, i); cnt[v] = (cnt[v] ?? 0) + 1; }
  console.log(`  ${pad(tier, 11)}${Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
}
console.log('\nclues per suspect (avg / max):');
for (const tier of TIERS) {
  const xs = cluesPerSuspect[tier];
  if (xs.length) console.log(`  ${pad(tier, 11)}${avg(xs).toFixed(2)} / ${Math.max(...xs)}`);
}
// ── Extra Extreme
console.log(`\nExtra Extreme generation (ms, budget: typical ≤ 1500 on 12×12):`);
for (const size of Object.keys(genUltraBySize).map(Number).sort((a, b) => a - b)) {
  const gs = genUltraBySize[size] as number[];
  const sorted = [...gs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  console.log(`  ${pad(`${size}×${size}`, 9)}n ${pad(String(gs.length), 4)}avg ${pad(avg(gs).toFixed(0), 7)}median ${pad(median.toFixed(0), 7)}max ${Math.max(...gs).toFixed(0)}`);
  if (size === 12 && median > 1500) warnings.push(`ultra 12×12: median ${median.toFixed(0)} ms over 1500 ms`);
  if (median > 6000) fail(`ultra generator ${size}×${size}`, `median ${median.toFixed(0)} ms`);
}
const FAMS = ['sight', 'company', 'neighbours', 'order', 'distance', 'furniture', 'rooms', 'conditionals', 'eitherOr', 'negatives', 'coordinates'];
console.log(`\ndifficulty (difficultyReport) — ultra vs mastermind:`);
console.log(`  ${pad('tier', 12)}${pad('n', 5)}${pad('clues', 7)}${pad('rel%', 6)}${pad('whatIf', 8)}${pad('depth2', 8)}${pad('maxDepth', 9)}${pad('fam', 5)}★fam`);
for (const t of ['mastermind', 'ultra'] as Tier[]) {
  const rs = reports[t] ?? [];
  if (!rs.length) continue;
  const a = (fn: (r: DifficultyReport) => number): string => avg(rs.map(fn)).toFixed(1);
  console.log(`  ${pad(t, 12)}${pad(String(rs.length), 5)}${pad(a((r) => r.clues), 7)}${pad(a((r) => r.relationalPct), 6)}${pad(a((r) => r.whatIf), 8)}`
    + `${pad(a((r) => r.whatIfDepth2), 8)}${pad(a((r) => r.maxDepth), 9)}${pad(a((r) => r.families.length), 5)}${a((r) => r.starFamilies.length)}`);
}
console.log(`  families used (share of cases):\n  ${pad('', 12)}${FAMS.map((x) => pad(x.slice(0, 10), 11)).join('')}`);
for (const t of ['mastermind', 'ultra'] as Tier[]) {
  const rs = reports[t] ?? [];
  if (rs.length) console.log(`  ${pad(t, 12)}${FAMS.map((x) => pad(`${Math.round((100 * rs.filter((r) => r.families.includes(x as never)).length) / rs.length)}%`, 11)).join('')}`);
}
const starCount: Record<string, number> = {};
for (const r of reports.ultra ?? []) for (const t of r.starTypes) starCount[t] = (starCount[t] ?? 0) + 1;
console.log(`  ★ predicates in ultra cases: ${Object.entries(starCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
if (VERBOSE || process.env.ULTRA_SAMPLES) {
  for (const p of ultraSamples.slice(0, Number(process.env.ULTRA_SAMPLES ?? 6) || 6)) {
    console.log(`\n── ${p.id} "${p.title}" ${p.rows}×${p.cols} ${p.variant}${p.liarId ? ` liar=${p.liarId}` : ''}`);
    for (const person of p.people) {
      const lines = p.clues.filter((c) => c.personId === person.id).map((c) => c.text).join(' ');
      console.log(`  ${pad(person.name + (person.isVictim ? ' (victim)' : ''), 22)}${lines}`);
    }
  }
}
console.log(`victim position clues (beyond the rule sentence): ${victimExtraClues} across ${total} puzzles`);
console.log(`brute-force cross-checked: ${bruteChecked} boards with ≤ 5 people`);
console.log(`generator attempts: ${genStats.attempts} for ${genStats.cases} cases; failures ${JSON.stringify(genStats.fails)}`);
console.log(`layout fallbacks to organic: ${layoutFallbacks.length}${layoutFallbacks.length ? ` (${layoutFallbacks.slice(0, 6).join('; ')})` : ''}`);
console.log(`total wall time: ${totalSec.toFixed(1)} s`);

if (VERBOSE) {
  for (const v of VARS) {
    const p = samples[v];
    if (!p) continue;
    console.log(`\n── ${v}: ${p.id} "${p.title}" ${p.rows}×${p.cols} (${p.layout})${p.liarId ? ` liar=${p.liarId}` : ''}`);
    for (const person of p.people) {
      const lines = p.clues.filter((c) => c.personId === person.id).map((c) => c.text).join(' ');
      console.log(`  ${pad(person.name + (person.isVictim ? ' (victim)' : ''), 22)}${lines}`);
    }
  }
}

for (const w of warnings) console.log(`WARNING ${w}`);
console.log(`\n${total} puzzles generated, ${failures.length} failure(s).`);
for (const f of failures.slice(0, 80)) console.log(`  - ${f}`);
process.exit(failures.length ? 1 : 0);

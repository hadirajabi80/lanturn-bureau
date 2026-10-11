// Rules self-test: `npm test`. Checks hand-picked rule cases and cross-checks legalMoves against
// brute-force enumeration of full turns over thousands of random games.
import {
  applyMove, BAR, destinationsFrom, initialPosition, legalMoves, OFF, pipCount, removeDie,
  singleMoves, winKind, type Move, type Player, type Position,
} from './rules';
import { checkersFromPosition, moveCheckers } from './checkers';

let failures = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
};

const empty = (): Position => ({ points: new Array(24).fill(0), bar: [0, 0], off: [0, 0] });
const key = (m: Move) => `${m.from}>${m.to}:${m.die}${m.hit ? 'x' : ''}`;

// Brute force: all full sequences, keep the longest, apply higher-die rule, collect first moves.
function bruteFirstMoves(pos: Position, p: Player, dice: number[]): Set<string> {
  const seqs: Move[][] = [];
  const rec = (cur: Position, rem: number[], seq: Move[]) => {
    let any = false;
    for (const d of new Set(rem)) {
      for (const m of singleMoves(cur, p, d)) {
        any = true;
        rec(applyMove(cur, p, m), removeDie(rem, d), [...seq, m]);
      }
    }
    if (!any) seqs.push(seq);
  };
  rec(pos, dice, []);
  const max = Math.max(...seqs.map((s) => s.length));
  let best = seqs.filter((s) => s.length === max && max > 0);
  if (max === 1 && dice.length === 2 && dice[0] !== dice[1]) {
    const hi = Math.max(...dice);
    if (best.some((s) => s[0].die === hi)) best = best.filter((s) => s[0].die === hi);
  }
  return new Set(best.map((s) => key(s[0])));
}

// 1. Opening position
{
  const pos = initialPosition();
  check(pipCount(pos, 0) === 167 && pipCount(pos, 1) === 167, 'opening pip count 167');
  const ms = legalMoves(pos, 0, [6, 1]);
  check(ms.some((m) => m.from === 12 && m.to === 6), '13/7 legal with 6-1');
  check(ms.some((m) => m.from === 23 && m.to === 17), '24/18 legal with 6-1');
  check(!ms.some((m) => m.from === 12 && m.to === 11), '13/12 blocked by black point');
}

// 2. Bar entry is mandatory
{
  const pos = initialPosition();
  pos.points[23] = 1;
  pos.bar[0] = 1;
  const ms = legalMoves(pos, 0, [3, 5]);
  check(ms.length > 0 && ms.every((m) => m.from === BAR), 'must enter from bar first');
  check(ms.some((m) => m.to === 21) && ms.some((m) => m.to === 19), 'bar entry targets 22 and 20');
}

// 3. Higher-die rule: only one die playable → must play larger
{
  const pos = empty();
  pos.points[10] = 1; // white on point 11
  pos.points[4] = -2; // block point 5 (11-6)
  pos.points[9] = -2; // block point 10 (11-1)? -> then 1 from 11 blocked
  pos.points[0] = -2;
  pos.off[0] = 14;
  pos.off[1] = 9;
  // White at idx10 with dice 6,5: 10-6=4 blocked, 10-5=5 open. Then from 5 with 6 → off? not all home… one checker → all home after first move.
  const ms = legalMoves(pos, 0, [6, 5]);
  check(ms.every((m) => m.die === 5), 'only the 5 is playable first');
}
{
  // Pure "play the larger" case
  const pos = empty();
  pos.points[12] = 1;
  pos.points[6] = -2; // blocks 13-6
  pos.points[2] = -2; // blocks after 13-4=8 then 8-6=2 → blocked; after 13-6 blocked
  pos.points[8] = 0;
  pos.points[3] = -2;
  pos.off[0] = 14;
  pos.off[1] = 9;
  // dice 6 & 4: 12→6 (6) blocked; 12→8 (4) open; then 8→2 (6) blocked. So only one die, the 4 (no 6 possible)
  const ms = legalMoves(pos, 0, [6, 4]);
  check(ms.length === 1 && ms[0].die === 4, 'single playable die is used even if smaller');
}

// 4. Bear-off with larger die only from furthest
{
  const pos = empty();
  pos.points[2] = 2; // white on point 3
  pos.points[0] = 1;
  pos.off[0] = 12;
  pos.points[23] = -15 + 15; // nothing
  pos.off[1] = 14;
  pos.points[20] = -1;
  const ms = singleMoves(pos, 0, 6);
  check(ms.some((m) => m.from === 2 && m.to === OFF), 'bear off from furthest with 6');
  check(!ms.some((m) => m.from === 0 && m.to === OFF), 'cannot bear off nearer checker with 6');
}

// 5. Win kinds
{
  const pos = empty();
  pos.off[0] = 15;
  pos.points[3] = -15; // black in white's home → backgammon
  check(winKind(pos, 0) === 'backgammon', 'backgammon');
  pos.points[3] = 0;
  pos.points[12] = -15;
  check(winKind(pos, 0) === 'mars', 'mars (gammon)');
  pos.points[12] = -14;
  pos.off[1] = 1;
  check(winKind(pos, 0) === 'single', 'single');
}

// 6. Combined destination
{
  const pos = initialPosition();
  const d = destinationsFrom(pos, 0, [6, 5], 23);
  check(d.some((x) => x.to === 12 && x.path.length === 2), '24/13 via 6-5 (lover\'s leap)');
}

// 7. Random games: cross-check legalMoves with brute force and checker entity bookkeeping.
const rnd = () => 1 + Math.floor(Math.random() * 6);
let compared = 0;
for (let g = 0; g < 400; g++) {
  let pos = initialPosition();
  let ents = checkersFromPosition(pos);
  let p: Player = g % 2 === 0 ? 0 : 1;
  for (let turn = 0; turn < 400; turn++) {
    const a = rnd();
    const b = rnd();
    let rem = a === b ? [a, a, a, a] : [a, b];
    let first = true;
    for (;;) {
      const ms = legalMoves(pos, p, rem);
      if (first && compared < 6000) {
        const brute = bruteFirstMoves(pos, p, rem);
        const mine = new Set(ms.map(key));
        const same = brute.size === mine.size && [...brute].every((k) => mine.has(k));
        check(same, `legalMoves mismatch dice ${rem} : ${[...mine]} vs ${[...brute]}`);
        compared++;
      }
      first = false;
      if (ms.length === 0) break;
      const m = ms[Math.floor(Math.random() * ms.length)];
      pos = applyMove(pos, p, m);
      ents = moveCheckers(ents, p, m).list;
      rem = removeDie(rem, m.die);
    }
    // entity list must match the position exactly
    const re = checkersFromPosition(pos);
    const sig = (l: typeof ents) =>
      l.map((c) => `${c.owner}@${c.loc}`).sort().join(',');
    check(sig(re) === sig(ents), 'entity list diverged from position');
    for (const owner of [0, 1] as Player[]) {
      const slots = new Map<number, number[]>();
      for (const c of ents) if (c.owner === owner) slots.set(c.loc, [...(slots.get(c.loc) ?? []), c.slot]);
      for (const [, s] of slots) check(s.sort((x, y) => x - y).every((v, i) => v === i), 'slots contiguous');
    }
    let total = 0;
    for (const v of pos.points) total += Math.abs(v);
    check(total + pos.bar[0] + pos.bar[1] + pos.off[0] + pos.off[1] === 30, 'checker conservation');
    if (pos.off[p] === 15) break;
    p = p === 0 ? 1 : 0;
  }
}

console.log(failures === 0 ? `OK — all checks passed (${compared} positions cross-checked)` : `${failures} failures`);
process.exit(failures === 0 ? 0 : 1);

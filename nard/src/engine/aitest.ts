// AI strength check: `npx tsx src/engine/aitest.ts`
import { chooseMoves, enumerateTurns, type AiLevel } from './ai';
import { applyMove, hasWon, initialPosition, type Player } from './rules';

type Bot = AiLevel | 'random';
const rnd = () => 1 + Math.floor(Math.random() * 6);
const times: Record<string, number[]> = {};

function play(a: Bot, b: Bot): Player {
  let pos = initialPosition();
  let p: Player = Math.random() < 0.5 ? 0 : 1;
  for (let turn = 0; turn < 1000; turn++) {
    const x = rnd();
    const y = rnd();
    const dice = x === y ? [x, x, x, x] : [x, y];
    const bot = p === 0 ? a : b;
    const t0 = performance.now();
    let moves;
    if (bot === 'random') {
      const c = enumerateTurns(pos, p, dice);
      moves = c[Math.floor(Math.random() * c.length)]?.moves ?? [];
    } else {
      moves = chooseMoves(pos, p, dice, bot);
    }
    (times[bot] ??= []).push(performance.now() - t0);
    for (const m of moves) pos = applyMove(pos, p, m);
    if (hasWon(pos, p)) return p;
    p = p === 0 ? 1 : 0;
  }
  return 0;
}

function series(a: Bot, b: Bot, n: number) {
  let wa = 0;
  for (let i = 0; i < n; i++) if (play(a, b) === 0) wa++;
  console.log(`${a.padEnd(6)} vs ${b.padEnd(6)}: ${wa}/${n} (${Math.round((wa / n) * 100)}%)`);
}

series('easy', 'random', 100);
series('medium', 'easy', 100);
series('hard', 'medium', Number(process.argv[2] ?? 40));
for (const [k, v] of Object.entries(times)) {
  v.sort((x, y) => x - y);
  console.log(`${k}: avg ${(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1)}ms  p95 ${v[Math.floor(v.length * 0.95)].toFixed(0)}ms  max ${v[v.length - 1].toFixed(0)}ms`);
}

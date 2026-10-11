import { chooseMoves, type AiLevel } from './ai';
import type { Move, Player, Position } from './rules';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (moves: Move[]) => void>();

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; moves: Move[] }>) => {
      pending.get(e.data.id)?.(e.data.moves);
      pending.delete(e.data.id);
    };
    return worker;
  } catch {
    return null;
  }
}

/** Asks the computer player for its full turn. Falls back to the main thread if workers are unavailable. */
export function think(pos: Position, player: Player, dice: number[], level: AiLevel): Promise<Move[]> {
  const w = getWorker();
  if (!w) return Promise.resolve(chooseMoves(pos, player, dice, level));
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ id, pos, player, dice, level });
  });
}

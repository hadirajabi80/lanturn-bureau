// Runs the computer player off the main thread so animations never stutter while it thinks.
import { chooseMoves, type AiLevel } from './ai';
import type { Player, Position } from './rules';

interface Request {
  id: number;
  pos: Position;
  player: Player;
  dice: number[];
  level: AiLevel;
}

self.onmessage = (e: MessageEvent<Request>) => {
  const { id, pos, player, dice, level } = e.data;
  const moves = chooseMoves(pos, player, dice, level);
  (self as unknown as Worker).postMessage({ id, moves });
};

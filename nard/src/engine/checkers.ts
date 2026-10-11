// Gives every checker a stable identity so the 3D layer can animate each one individually.
import { BAR, OFF, type Move, type Player, type Position } from './rules';

export interface Checker {
  id: number;
  owner: Player;
  loc: number; // 0..23 | BAR | OFF
  slot: number; // stack position at that location (0 = bottom / outermost)
}

export function checkersFromPosition(pos: Position): Checker[] {
  const list: Checker[] = [];
  let id = 0;
  const add = (owner: Player, loc: number, n: number) => {
    for (let s = 0; s < n; s++) list.push({ id: id++, owner, loc, slot: s });
  };
  for (const owner of [0, 1] as Player[]) {
    for (let i = 0; i < 24; i++) {
      const v = pos.points[i];
      const n = owner === 0 ? Math.max(v, 0) : Math.max(-v, 0);
      add(owner, i, n);
    }
    add(owner, BAR, pos.bar[owner]);
    add(owner, OFF, pos.off[owner]);
  }
  // Keep ids stable per player regardless of layout: White 0..14, Black 15..29.
  list.sort((a, b) => a.owner - b.owner || a.id - b.id);
  return list.map((c, i) => ({ ...c, id: i }));
}

const topOf = (list: Checker[], owner: Player, loc: number) => {
  let top: Checker | undefined;
  for (const c of list) if (c.owner === owner && c.loc === loc && (!top || c.slot > top.slot)) top = c;
  return top;
};

const countAt = (list: Checker[], owner: Player, loc: number) =>
  list.reduce((n, c) => n + (c.owner === owner && c.loc === loc ? 1 : 0), 0);

export interface CheckerStep {
  moverId: number;
  hitId: number | null;
}

/** Applies a move to the entity list; returns the new list and which checkers moved. */
export function moveCheckers(list: Checker[], p: Player, m: Move): { list: Checker[]; step: CheckerStep } {
  const next = list.map((c) => ({ ...c }));
  const mover = topOf(next, p, m.from)!;
  let hitId: number | null = null;
  if (m.hit) {
    const o = (1 - p) as Player;
    const victim = topOf(next, o, m.to)!;
    victim.slot = countAt(next, o, BAR);
    victim.loc = BAR;
    hitId = victim.id;
  }
  mover.slot = countAt(next, p, m.to);
  mover.loc = m.to;
  return { list: next, step: { moverId: mover.id, hitId } };
}

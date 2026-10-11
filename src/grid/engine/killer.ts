/**
 * Killer rules: who, relative to the victim, is the unique person matching the
 * rule (docs/GRID-PLAN.md §1, types.ts KillerRule).
 */
import type { KillerRule } from '../types';
import type { GridCtx } from './geometry';
import { adjacent, colOf, lineOfSight, manhattan, rowOf } from './geometry';

/** Does suspect cell `c` satisfy the rule's relation to victim cell `v`? (closest handled separately) */
export function ruleRelation(g: GridCtx, rule: KillerRule['type'], c: number, v: number): boolean {
  switch (rule) {
    case 'aloneWithVictim': return g.roomOf[c] === g.roomOf[v];
    case 'besideVictim': return adjacent(g, c, v);
    case 'lineOfSight': return lineOfSight(g, c, v);
    case 'sameRowOrCol': return c !== v && (rowOf(g, c) === rowOf(g, v) || colOf(g, c) === colOf(g, v));
    case 'closest': return true;
  }
}

/**
 * Index of the unique killer for a full placement, or -1 when nobody / more
 * than one person matches, or someone is unplaced.
 */
export function killerIndex(g: GridCtx, rule: KillerRule, pos: Int16Array, victim: number): number {
  const v = pos[victim] as number;
  if (v < 0) return -1;
  const matches: number[] = [];
  if (rule.type === 'closest') {
    let best = Infinity;
    for (let s = 0; s < pos.length; s++) {
      if (s === victim) continue;
      const c = pos[s] as number;
      if (c < 0) return -1;
      const d = manhattan(g, c, v);
      if (d < best) { best = d; matches.length = 0; matches.push(s); }
      else if (d === best) matches.push(s);
    }
  } else {
    for (let s = 0; s < pos.length; s++) {
      if (s === victim) continue;
      const c = pos[s] as number;
      if (c < 0) return -1;
      if (ruleRelation(g, rule.type, c, v)) matches.push(s);
    }
  }
  return matches.length === 1 ? (matches[0] as number) : -1;
}

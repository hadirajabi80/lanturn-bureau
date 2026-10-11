import { TIERS, type Tier } from '@/grid/types';
import { TIER_INFO } from '@/grid/skins/districts';

const ALIASES: Record<string, Tier> = {
  easy: 'easy', rookie: 'easy', r: 'easy', e: 'easy',
  medium: 'medium', detective: 'medium', d: 'medium', m: 'medium',
  hard: 'hard', inspector: 'hard', i: 'hard', h: 'hard',
  extreme: 'extreme', chief: 'extreme', c: 'extreme', x: 'extreme',
  mastermind: 'mastermind', mm: 'mastermind',
};

/** Route param → Tier. Accepts internal ids (`easy`…`mastermind`, used in links) and display names (`rookie`, `chief`…). */
export function parseTierParam(param: string | undefined): Tier | null {
  if (!param) return null;
  const t = ALIASES[param.toLowerCase()];
  return t && TIERS.includes(t) ? t : null;
}

export const tierLabel = (t: Tier) => TIER_INFO[t].name;

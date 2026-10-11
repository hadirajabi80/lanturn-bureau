import type { CaseFile, Difficulty } from './types';
import { case01 } from './cases/case01';
import { case02 } from './cases/case02';
import { case03 } from './cases/case03';
import { case04 } from './cases/case04';
import { case05 } from './cases/case05';
import { case06 } from './cases/case06';
import { case07 } from './cases/case07';
import { case08 } from './cases/case08';
import { case09 } from './cases/case09';
import { case10 } from './cases/case10';
import { case11 } from './cases/case11';
import { case12 } from './cases/case12';
import { case13 } from './cases/case13';
import { case14 } from './cases/case14';
import { case15 } from './cases/case15';
import { case16 } from './cases/case16';
import { case17 } from './cases/case17';
import { case18 } from './cases/case18';
import { case19 } from './cases/case19';
import { case20 } from './cases/case20';

export const CASES: CaseFile[] = [
  case01, case02, case03, case04, case05,
  case06, case07, case08, case09, case10,
  case11, case12, case13, case14, case15,
  case16, case17, case18, case19, case20,
];

export const TIERS: { id: Difficulty; label: string; blurb: string }[] = [
  { id: 'easy', label: 'Easy', blurb: 'Warm-ups. One lie, one clue, one culprit.' },
  { id: 'medium', label: 'Medium', blurb: 'Two steps of inference and a red herring.' },
  { id: 'hard', label: 'Hard', blurb: 'Frame-ups, false confessions, innocent liars.' },
  { id: 'extreme', label: 'Extreme', blurb: 'The Cartographer is drawing. Follow the map home.' },
];

export const getCase = (id: string): CaseFile | undefined => CASES.find((c) => c.id === id);
export const casesOfTier = (tier: Difficulty): CaseFile[] => CASES.filter((c) => c.difficulty === tier);
export const nextCase = (id: string): CaseFile | undefined => {
  const i = CASES.findIndex((c) => c.id === id);
  return i >= 0 ? CASES[i + 1] : undefined;
};

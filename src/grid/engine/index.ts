/**
 * Crime Files engine — public API (docs/GRID-PLAN.md §7).
 */
export { hashSeed, mulberry32, weightedIndex } from './rng';
export type { Rng } from './rng';
export { THEMES, SEASONS, DAILY_THEMES } from './themes';
export { CAST } from './people';
export type { CastMember } from './people';
export {
  buildGridCtx, cellIndex, indexCell, rowOf, colOf, manhattan, adjacent, isCorner, isEdge, lineOfSight,
  lineHasBlocker, strictlyBetween,
} from './geometry';
export type { GridCtx, GridLike } from './geometry';
export {
  evalPredicate, compilePredicate, makePuzzleCtx, predicatePeople, isGlobalPredicate, toPositions,
} from './predicates';
export type { PuzzleCtx, PosFn, Tri } from './predicates';
export { clueText, killerRuleText, pronouns, rowLabel, colLabel, numberWord, furnitureNoun } from './text';
export type { TextCtx } from './text';
export { countSolutions, deduce, search, propagate, makeProblem } from './solver';
export { killerIndex } from './killer';
export { checkPlacement, killerFor, candidateCells, isKillerRuleClue, KILLER_RULE_PREDICATE } from './play';
export {
  generatePuzzle, generatePuzzleUncached, clearPuzzleCache, puzzleTitle, dailyPuzzle, dailyTier, dayNumber,
} from './generator';

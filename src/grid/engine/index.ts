/**
 * Floorplan Mysteries engine — public API (docs/FLOORPLAN-DESIGN.md §7, docs/GRID-PLAN.md).
 */
export { hashSeed, mulberry32, weightedIndex } from './rng';
export type { Rng } from './rng';
export { THEMES, SEASONS, DAILY_THEMES, ROLE_NAMES, GENERIC_ROLE_NAMES, LEGACY_SEASON_IDS } from './themes';
export type { RoomRole } from './themes';
export { CAST } from './people';
export type { CastMember } from './people';
export {
  buildGridCtx, cellIndex, indexCell, rowOf, colOf, manhattan, adjacent, diagAdjacent, isCorner, isEdge, lineOfSight,
  lineHasBlocker, strictlyBetween,
} from './geometry';
export type { GridCtx, GridLike } from './geometry';
export {
  evalPredicate, compilePredicate, makePuzzleCtx, predicatePeople, isGlobalPredicate, toPositions,
} from './predicates';
export type { PuzzleCtx, PosFn, Tri } from './predicates';
export { clueText, killerRuleText, victimRuleText, pronouns, rowLabel, colLabel, numberWord, furnitureNoun } from './text';
export type { TextCtx } from './text';
export { deduce, search, propagate, probe, makeProblem, compileItem, initialDomains, cloneDomains, allSingle } from './solver';
export type { Problem, Domains, CClue, CustomRule, ProblemItem, DeduceStatus } from './solver';
export {
  negatePred, hasPlainNegation, roomAdjacency, baseRuleItems, hypothesisItems, liarCandidates, culpritsFromPos,
  isLiarVariant, isDoubleVariant, isAccompliceVariant, hitFor,
} from './rules';
export type { RuleSpec, Culprits } from './rules';
export { puzzleWorlds, countSolutions, deduceWorlds, ruleSpecOf } from './worlds';
export type { World } from './worlds';
export { killerIndex } from './killer';
export {
  checkPlacement, checkAccusation, culpritsFor, killerFor, candidateCells, isKillerRuleClue, ruleClueIndex,
  killerRulePredicate, KILLER_RULE_PREDICATE,
} from './play';
export type { CulpritNames } from './play';
export { carveRooms, validCarving } from './layouts';
export type { Carving } from './layouts';
export {
  gridSizeFor, tierSizeRange, variantFor, rampFor, dailyTier, dayNumber, isoWeekOf, parseIsoWeek, SIZE_LADDER,
  CASES_PER_TIER, VARIANT_MIN_SIZE, DAILY_TIERS,
} from './variants';
export {
  generatePuzzle, generatePuzzleUncached, generateCustom, normalizeCustom, clearPuzzleCache, puzzleTitle, dailyPuzzle,
  weeklyPuzzle, resolveDistrictId, uncached, genStats,
} from './generator';
export type { CustomOptions } from './generator';
export { codeFor, parseCode, DISTRICT_CODES, TIER_LETTER, DISTRICT_IDS } from './codes';
export type { ParsedCode } from './codes';
export * from './explain';

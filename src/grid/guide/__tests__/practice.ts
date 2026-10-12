// npx tsx src/grid/guide/__tests__/practice.ts — the tutorial's practice case must have exactly one solution.
import { checkAccusation, checkPlacement, countSolutions } from '../../engine';
import { PRACTICE, PRACTICE_IDS } from '../practice';

const n = countSolutions(PRACTICE);
const placed = checkPlacement(PRACTICE, PRACTICE.solution);
const accused = checkAccusation(PRACTICE, { killers: [PRACTICE_IDS.grace] });
const wrong = checkAccusation(PRACTICE, { killers: [PRACTICE_IDS.oliver] });
console.log({ solutions: n.count, placementOk: placed.ok, violations: placed.violations, accuseGrace: accused, accuseOliver: wrong });
if (n.count !== 1 || !placed.ok || !accused || wrong) {
  console.error('practice case is broken');
  process.exit(1);
}
console.log('practice case ok');

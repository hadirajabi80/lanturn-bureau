/**
 * `npm run validate` — prints a table of case-data problems, exits 1 if any.
 */
import { CASES } from '../data';
import { validateAll } from './validate';

const reports = validateAll(CASES);
const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));

let total = 0;
console.log('\nLANTERN BUREAU — case validation\n');
console.log(`${pad('CASE', 10)}${pad('TITLE', 36)}${pad('STATUS', 10)}PROBLEMS`);
console.log('-'.repeat(68));
reports.forEach((r, i) => {
  const c = CASES[i];
  const title = c ? c.title.slice(0, 34) : '(missing)';
  total += r.problems.length;
  console.log(`${pad(r.caseId, 10)}${pad(title, 36)}${pad(r.problems.length ? 'FAIL' : 'ok', 10)}${r.problems.length}`);
});
console.log('-'.repeat(68));

for (const r of reports) {
  if (r.problems.length === 0) continue;
  console.log(`\n${r.caseId}:`);
  for (const msg of r.problems) console.log(`  - ${msg}`);
}

const valid = reports.filter((r) => r.problems.length === 0).length;
console.log(`\n${valid}/${reports.length} cases valid, ${total} problem(s).\n`);
process.exit(total > 0 ? 1 : 0);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { CASES } from '@/data';
import { validateAll } from '@/engine/validate';

if (import.meta.env.DEV) {
  const reports = validateAll(CASES).filter((r) => r.problems.length > 0);
  if (reports.length > 0) {
    console.warn(
      `[Lantern Bureau] case data problems in ${reports.length} case(s):\n` +
        reports.map((r) => `  ${r.caseId}:\n${r.problems.map((p) => `    - ${p}`).join('\n')}`).join('\n'),
    );
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root element missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

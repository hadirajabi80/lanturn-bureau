/** Has this player finished the practice case? (per device; never blocks anything) */
const KEY = 'floorplan-guide-done';

export function isGuideDone(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markGuideDone(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* private mode: fine */
  }
}

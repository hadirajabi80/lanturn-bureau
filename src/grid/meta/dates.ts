/**
 * Timezone-safe local calendar helpers. Every "day" in the profile is the player's LOCAL date as
 * `YYYY-MM-DD`; day arithmetic happens on UTC midnights of those labels so DST never skews a gap.
 */

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

/** Local calendar date of a timestamp as `YYYY-MM-DD`. */
export function localISODate(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local hour (0–23) of a timestamp. */
export function localHour(ts: number): number {
  return new Date(ts).getHours();
}

/** Day number (days since 1970-01-01) of an ISO date label, independent of the local timezone. */
export function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** `b - a` in whole calendar days. */
export function dayDiff(a: string, b: string): number {
  return dayNumber(b) - dayNumber(a);
}

/** ISO date label `n` days after `iso` (n may be negative). */
export function addDays(iso: string, n: number): string {
  const d = new Date((dayNumber(iso) + n) * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** The `n` dates ending with `endIso` (oldest first). */
export function lastNDays(endIso: string, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endIso, -i));
  return out;
}

/** ISO-8601 week key of a local date label, e.g. `2026W41`. */
export function isoWeekKey(iso: string): string {
  const dn = dayNumber(iso);
  const dow = (new Date(dn * 86_400_000).getUTCDay() + 6) % 7; // Mon=0
  const thursday = dn - dow + 3;
  const year = new Date(thursday * 86_400_000).getUTCFullYear();
  const jan1 = Math.round(Date.UTC(year, 0, 1) / 86_400_000);
  const week = Math.floor((thursday - jan1) / 7) + 1;
  return `${year}W${pad(week)}`;
}

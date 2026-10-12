import type { ReactNode } from 'react';
import { Flame } from 'lucide-react';

const ROMAN_PAIRS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** 11 → "XI" (works for any district count). */
export function roman(n: number): string {
  let out = '';
  let v = Math.max(0, Math.floor(n));
  for (const [k, s] of ROMAN_PAIRS) while (v >= k) {
    out += s;
    v -= k;
  }
  return out || String(n);
}

/** Flat colour used behind the night facades: a printed illustration plate, never a page wash. */
export const NIGHT_PLATE = '#1B2130';
/** Flat plate behind the daytime (Sugar Lane) facades. */
export const DAY_PLATE = '#FBE6EE';

/** "District I · The Old Quarter" → "The Old Quarter". */
export const quarterOf = (kicker: string) => kicker.split('·')[1]?.trim() ?? kicker;

/** District identity swatch: a small ink-outlined square in the district's own colour. */
export function Swatch({ color = 'var(--fp-district)', className, size = 14 }: { color?: string; className?: string; size?: number }) {
  return (
    <span
      aria-hidden
      className={['inline-block shrink-0 rounded-[3px]', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, background: color, boxShadow: 'inset 0 0 0 1.5px var(--fp-ink)' }}
    />
  );
}

/** Booklet section heading: red index number, Archivo title, short ink underline. */
export function SectionTitle({ index, id, children, aside }: { index: number; id?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <h2 id={id} className="flex items-baseline gap-2.5 font-display text-[clamp(1.25rem,1.05rem+0.8vw,1.6rem)] font-extrabold leading-tight tracking-[-0.02em] text-(--fp-ink)">
        <span className="font-mono text-[0.8em] font-semibold text-(--fp-accent)">{String(index).padStart(2, '0')}</span>
        <span className="border-b-[3px] border-(--fp-ink) pb-0.5">{children}</span>
      </h2>
      {aside}
    </div>
  );
}

export function StreakFlame({ streak, lit }: { streak: number; lit: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-sm font-semibold tabular-nums"
      style={{ color: lit ? 'var(--fp-accent2)' : 'var(--fp-muted)' }}
      aria-label={`${streak} day streak${lit ? ', today solved' : ''}`}
      title={`${streak}-day streak`}
    >
      <Flame className="size-4" aria-hidden style={lit ? { fill: 'var(--fp-hl)', color: 'var(--fp-ink)' } : undefined} />
      {streak}
    </span>
  );
}

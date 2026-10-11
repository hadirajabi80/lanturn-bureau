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

export function StreakFlame({ streak, lit }: { streak: number; lit: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-sm font-semibold tabular-nums"
      style={{ color: lit ? 'var(--fp-glow)' : 'var(--fp-muted)' }}
      aria-label={`${streak} day streak${lit ? ', today solved' : ''}`}
      title={`${streak}-day streak`}
    >
      <Flame
        className="size-4"
        aria-hidden
        style={lit ? { filter: 'drop-shadow(0 0 6px var(--fp-glow))', fill: 'color-mix(in srgb, var(--fp-glow) 45%, transparent)' } : undefined}
      />
      {streak}
    </span>
  );
}

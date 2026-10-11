import type { ReactNode } from 'react';
import type { Variant } from '@/grid/types';

/** Player-facing names and one-liners per scenario variant (brief §4). */
export const VARIANT_INFO: Record<Variant, { name: string; line: string; accuse: string }> = {
  classic: { name: 'Classic', line: 'The victim was alone with the killer.', accuse: 'Name the killer' },
  accomplice: {
    name: 'Accomplice',
    line: 'Two people shared the victim’s room — the killer stood closer.',
    accuse: 'Name the killer and the accomplice',
  },
  lockedRoom: {
    name: 'Locked Room',
    line: 'The victim was alone behind a locked door; the killer was the only one next door.',
    accuse: 'Name the killer',
  },
  poison: {
    name: 'Poison',
    line: 'The poison was in the furniture — the killer was the only one beside it.',
    accuse: 'Name the killer',
  },
  sniper: { name: 'Sniper', line: 'Only the killer had a clear line of sight to the victim.', accuse: 'Name the killer' },
  liar: { name: 'Liar', line: 'One suspect lies with every word — and the liar is the killer.', accuse: 'Name the killer' },
  double: { name: 'Double', line: 'Two victims, each alone with their own killer.', accuse: 'Match both killers to their victims' },
  liarDouble: { name: 'Liar’s Double', line: 'Two victims, two killers — and one of the killers lies.', accuse: 'Name both killers' },
  accompliceLiar: {
    name: 'False Accomplice',
    line: 'A killer, an accomplice — and the accomplice lies about everything.',
    accuse: 'Name the killer and the accomplice',
  },
};

const DAGGER = (
  <>
    <path d="M12 2.5 13.4 12h-2.8z" />
    <path d="M8.5 12.5h7" />
    <path d="M12 12.5v5.5" />
    <circle cx="12" cy="19.6" r="1.4" />
  </>
);
const MASK_SMALL = (
  <g transform="translate(13 13) scale(0.45)">
    <path d="M2 5c3-2 17-2 20 0 0 8-4 14-10 14S2 13 2 5z" fill="currentColor" fillOpacity="0.25" />
    <path d="M7 10.5q1.5-1.5 3 0M14 10.5q1.5-1.5 3 0M8.5 15q3.5-2 7 0" />
  </g>
);
const HEADS = (
  <>
    <circle cx="8" cy="8" r="3" />
    <path d="M2.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6" />
    <circle cx="16.5" cy="7" r="2.5" opacity="0.75" />
    <path d="M14.5 13.2c.6-.2 1.3-.3 2-.3 2.7 0 5 2.2 5 5.6" opacity="0.75" />
  </>
);

const GLYPHS: Record<Variant, ReactNode> = {
  classic: DAGGER,
  accomplice: HEADS,
  lockedRoom: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="1.8" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1.3" />
      <path d="M12 16.3v2" />
    </>
  ),
  poison: (
    <>
      <path d="M10 2.5h4M10.5 2.5v4.2L6.6 12a6 6 0 1 0 10.8 0l-3.9-5.3V2.5" />
      <path d="M7.2 14.5h9.6" opacity="0.6" />
      <circle cx="10.5" cy="17.2" r="0.9" fill="currentColor" />
      <circle cx="13.6" cy="17.2" r="0.9" fill="currentColor" />
    </>
  ),
  sniper: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
    </>
  ),
  liar: (
    <>
      <path d="M3 5.5c3.5-2.5 14.5-2.5 18 0 0 8.5-3.5 14.5-9 14.5S3 14 3 5.5z" />
      <path d="M7 10.5q1.6-1.6 3.2 0M13.8 10.5q1.6-1.6 3.2 0" />
      <path d="M8.5 15.2q3.5 2.4 7 0" />
    </>
  ),
  double: (
    <>
      <g transform="rotate(-28 12 12)">{DAGGER}</g>
      <g transform="rotate(28 12 12)">{DAGGER}</g>
    </>
  ),
  liarDouble: (
    <>
      <g transform="translate(-2 -1) scale(0.85)">
        <g transform="rotate(-28 12 12)">{DAGGER}</g>
        <g transform="rotate(28 12 12)">{DAGGER}</g>
      </g>
      {MASK_SMALL}
    </>
  ),
  accompliceLiar: (
    <>
      <g transform="translate(-1.5 -1.5) scale(0.85)">{HEADS}</g>
      {MASK_SMALL}
    </>
  ),
};

export interface VariantGlyphProps {
  variant: Variant;
  /** px (default 16). */
  size?: number;
  className?: string;
  /** Adds an accessible title (otherwise decorative). */
  title?: boolean;
}

/** Small line icon for each scenario variant (uses currentColor). */
export function VariantGlyph({ variant, size = 16, className, title }: VariantGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title ? VARIANT_INFO[variant].name : undefined}
    >
      {title && <title>{VARIANT_INFO[variant].name}</title>}
      {GLYPHS[variant]}
    </svg>
  );
}

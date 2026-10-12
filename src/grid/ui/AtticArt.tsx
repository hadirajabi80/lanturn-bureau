import type { CSSProperties } from 'react';

/**
 * The sealed attic (tier `ultra`, shown as "Extra Extreme"): a skull-key glyph and a lock-and-chain motif.
 * Both draw in `currentColor` (the chain's padlock body takes `--attic-red` when set) so they work on the
 * crimson-on-black attic card and on paper.
 */

export interface SkullKeyGlyphProps {
  /** px (default 16). */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Adds an accessible title (otherwise decorative). */
  title?: string;
}

/** A key whose bow is a small skull: the Extra Extreme badge. */
export function SkullKeyGlyph({ size = 16, className, style, title }: SkullKeyGlyphProps) {
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
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {/* skull bow */}
      <path d="M2.6 7.6a5.2 5.2 0 0 1 10.4 0v2.1c0 .8-.5 1.4-1.2 1.6V13H3.8v-1.7c-.7-.2-1.2-.8-1.2-1.6z" fill="currentColor" fillOpacity={0.18} />
      <circle cx={6} cy={8} r={1.25} fill="currentColor" stroke="none" />
      <circle cx={9.6} cy={8} r={1.25} fill="currentColor" stroke="none" />
      <path d="M7.8 9.9v.9" />
      <path d="M5.8 13v-1.2M7.8 13v-1.2M9.8 13v-1.2" strokeWidth={1.1} />
      {/* shaft + bit */}
      <path d="M11.4 12.6 21 22.2" />
      <path d="M16.2 17.4l2.3-2.3M18.6 19.8l1.6-1.6" />
    </svg>
  );
}

export interface AtticChainProps {
  /** px width (height follows). */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

/** A short run of chain with a padlock hanging from the middle (decorative). */
export function AtticChain({ width = 92, className, style }: AtticChainProps) {
  const links = [6, 18, 30, 62, 74, 86];
  return (
    <svg viewBox="0 0 92 30" width={width} height={(width * 30) / 92} className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeLinecap="round">
      {/* chain sagging to the lock */}
      {links.map((x, i) => {
        const y = 5 + (i < 3 ? i * 1.6 : (5 - i) * 1.6);
        return (
          <rect
            key={x}
            x={x - 5}
            y={y - 2.6}
            width={10}
            height={5.2}
            rx={2.6}
            strokeWidth={1.5}
            transform={i % 2 ? `rotate(${i < 3 ? 14 : -14} ${x} ${y})` : undefined}
            opacity={i % 2 ? 0.75 : 1}
          />
        );
      })}
      <path d="M36 9.5q10 4 20 0" strokeWidth={1.5} strokeDasharray="2.4 2.6" opacity={0.75} />
      {/* padlock */}
      <path d="M41.5 15v-3a4.5 4.5 0 0 1 9 0v3" strokeWidth={1.8} />
      <rect x={38.5} y={15} width={15} height={12} rx={2} strokeWidth={1.8} style={{ fill: 'var(--attic-red, currentColor)' }} />
      <circle cx={46} cy={20} r={1.4} fill="currentColor" stroke="none" />
      <path d="M46 21v3" strokeWidth={1.6} />
    </svg>
  );
}

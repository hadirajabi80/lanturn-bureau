import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface IconSquareProps {
  icon: LucideIcon;
  color: string;
  /** Tile size in px (default 52). */
  size?: number;
  /** Solid fill (white icon) instead of a soft tint. */
  solid?: boolean;
  className?: string;
}

/** Rounded tile with a lucide icon in the given accent colour (season/tier cards). */
export function IconSquare({ icon: Icon, color, size = 52, solid, className }: IconSquareProps) {
  return (
    <span
      aria-hidden
      className={clsx('grid shrink-0 place-items-center rounded-2xl', className)}
      style={{
        width: size,
        height: size,
        background: solid ? `linear-gradient(160deg, ${color}, ${color}dd)` : `${color}1f`,
        boxShadow: solid ? `0 8px 18px -10px ${color}` : `inset 0 0 0 1px ${color}2e`,
        color: solid ? '#fff' : color,
      }}
    >
      <Icon style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2.2} />
    </span>
  );
}

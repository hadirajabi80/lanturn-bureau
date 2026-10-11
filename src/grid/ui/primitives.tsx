import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { useSkin } from './skin';
import type { Variant } from '@/grid/types';
import { VariantGlyph, VARIANT_INFO } from './VariantGlyph';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

// ───────────────────────────── Panel ─────────────────────────────
export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'inset' | 'glow';
  as?: 'div' | 'section' | 'article' | 'aside';
}

/** District-coloured surface: `--fp-panel`, 1px accent hairline at 18 %, soft shadow, 10 px corners. */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { tone = 'default', as: Tag = 'div', className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx('fp-panel', tone === 'inset' && 'fp-panel--inset', tone === 'glow' && 'fp-panel--glow', className)}
      {...rest}
    />
  );
});

// ───────────────────────────── Buttons ─────────────────────────────
type Size = 'sm' | 'md' | 'lg';
const SIZE: Record<Size, string> = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

export interface FpButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders a router <Link> instead of a <button>. */
  to?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: Size;
  block?: boolean;
}

function makeButton(base: string) {
  return function FpButton({ to, icon, iconRight, size = 'md', block, className, children, type, ...rest }: FpButtonProps) {
    const cls = cx(base, SIZE[size], block && 'w-full', className);
    const inner = (
      <>
        {icon}
        {children !== undefined && <span className="relative">{children}</span>}
        {iconRight}
      </>
    );
    if (to) {
      return (
        <Link
          to={to}
          className={cls}
          onClick={rest.onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
          aria-label={rest['aria-label']}
          title={rest.title}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button type={type ?? 'button'} className={cls} {...rest}>
        {inner}
      </button>
    );
  };
}

/** Primary: brass plate with engraved text and two screws. */
export const BrassButton = makeButton('fp-brass');
/** Secondary: transparent with an accent hairline. */
export const GhostButton = makeButton('fp-ghost');

// ───────────────────────────── Chip ─────────────────────────────
export interface ChipProps extends HTMLAttributes<HTMLElement> {
  active?: boolean;
  icon?: ReactNode;
  /** When given the chip is a toggle button. */
  onClick?: () => void;
}

export function Chip({ active, icon, onClick, className, children, ...rest }: ChipProps) {
  const cls = cx('fp-chip px-3 py-1.5', className);
  if (onClick) {
    return (
      <button type="button" className={cls} data-active={active ? 'true' : 'false'} aria-pressed={active} onClick={onClick} {...rest}>
        {icon}
        {children}
      </button>
    );
  }
  return (
    <span className={cls} data-active={active ? 'true' : 'false'} {...rest}>
      {icon}
      {children}
    </span>
  );
}

// ───────────────────────────── Plate ─────────────────────────────
export interface PlateProps extends HTMLAttributes<HTMLSpanElement> {
  dark?: boolean;
}
/** Small engraved label plate (mono, tracked caps). */
export function Plate({ dark, className, ...rest }: PlateProps) {
  return <span className={cx('fp-plate', dark && 'fp-plate--dark', className)} {...rest} />;
}

// ───────────────────────────── MonoStat ─────────────────────────────
export interface MonoStatProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}
/** Label over a monospaced value: "SOLVED / 41". */
export function MonoStat({ label, value, icon, className, align = 'left' }: MonoStatProps) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-0.5', align === 'center' && 'items-center text-center', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--fp-muted)">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-mono text-base font-semibold tabular-nums text-(--fp-ink)">
        {icon}
        {value}
      </span>
    </div>
  );
}

// ───────────────────────────── ProgressFilament ─────────────────────────────
export interface ProgressFilamentProps {
  /** 0..1 */
  value: number;
  className?: string;
  label?: string;
  style?: CSSProperties;
}
/** Thin glowing progress line with a pulsing bright tip. */
export function ProgressFilament({ value, className, label, style }: ProgressFilamentProps) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div
      className={cx('fp-filament', className)}
      data-empty={v === 0 ? 'true' : 'false'}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      style={style}
    >
      <span style={{ width: `${v * 100}%` }} />
    </div>
  );
}

// ───────────────────────────── Stars ─────────────────────────────
/** Star rating; light-mood districts get little hearts instead. */
export function StarRow({ stars, max = 3, size = 12, className }: { stars: number; max?: number; size?: number; className?: string }) {
  const { light } = useSkin();
  const Icon = light ? Heart : Star;
  return (
    <span className={cx('inline-flex items-center gap-0.5', className)} aria-label={`${stars} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon
          key={i}
          aria-hidden
          style={{ width: size, height: size, color: light && i < stars ? 'var(--fp-accent)' : undefined }}
          strokeWidth={2}
          className={i < stars ? 'fill-current' : 'opacity-35'}
        />
      ))}
    </span>
  );
}

// ───────────────────────────── KeyTag ─────────────────────────────
export type KeyTagStatus = 'new' | 'progress' | 'solved';

export interface KeyTagProps {
  number: number;
  status: KeyTagStatus;
  stars?: number;
  /** Burn count (> 0 shows a scorch mark). */
  burns?: number;
  /** Board size N (badge "N×N"). */
  size?: number;
  variant?: Variant;
  /** Case title, shown on hover / focus. */
  title?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** Brass key tag for a case: number, size badge, variant glyph, stars / in-progress pin / scorch. */
export function KeyTag({ number, status, stars = 0, burns = 0, size, variant, title, to, onClick, className, style }: KeyTagProps) {
  const label = [
    `Case ${number}`,
    title,
    size ? `${size} by ${size}` : null,
    variant ? VARIANT_INFO[variant].name : null,
    status === 'solved' ? `solved, ${stars} stars` : status === 'progress' ? 'in progress' : 'new',
    burns > 0 ? `burned ${burns} time${burns > 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const body = (
    <>
      {burns > 0 && (
        <>
          <span className="fp-keytag__scorch" aria-hidden />
          <span className="fp-keytag__ember" aria-hidden />
        </>
      )}
      <span className="font-mono text-[clamp(1.15rem,0.9rem+1vw,1.6rem)] font-semibold leading-none tracking-tight tabular-nums [text-shadow:0_1px_0_rgb(255_255_255/0.35)]">
        {String(number).padStart(2, '0')}
      </span>
      <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold opacity-80">
        {size ? <span className="font-mono">{size}×{size}</span> : null}
        {variant && variant !== 'classic' && <VariantGlyph variant={variant} size={12} />}
      </span>
      <span className="mt-1 flex h-3.5 items-center">
        {status === 'solved' ? (
          <StarRow stars={stars} size={11} />
        ) : status === 'progress' ? (
          <MapPin className="size-3.5 fill-(--fp-danger) text-[#2a0c06]" aria-hidden strokeWidth={2} />
        ) : null}
      </span>
      {title && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[11rem] -translate-x-1/2 rounded-md px-2 py-1 text-center font-display text-xs text-(--fp-ink) opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ background: 'var(--fp-panel)', boxShadow: 'inset 0 0 0 1px var(--fp-hair-strong), 0 8px 20px -8px #000' }}
        >
          {title}
        </span>
      )}
    </>
  );
  const cls = cx('fp-keytag group w-full outline-none', className);
  if (to) {
    return (
      <Link to={to} className={cls} data-status={status} aria-label={label} onClick={onClick} style={style}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} data-status={status} aria-label={label} onClick={onClick} style={style}>
      {body}
    </button>
  );
}

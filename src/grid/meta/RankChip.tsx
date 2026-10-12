import { Link } from 'react-router-dom';
import { RankInsignia } from './RankInsignia';
import { useProfile } from './store';
import { FP, fmtInt } from './theme';
import { XpFilament } from './XpFilament';

export interface RankChipProps {
  /** Route opened on click (default `/plans/profile`). Ignored when `onClick` is given. */
  to?: string;
  onClick?: () => void;
  /** Hide the XP numbers (icon + rank + bar only). */
  compact?: boolean;
  className?: string;
}

/** Compact rank badge for the hub rail / desk header: insignia, rank name, XP bar. */
export function RankChip({ to = '/plans/profile', onClick, compact, className }: RankChipProps) {
  const p = useProfile();
  const inner = (
    <>
      <RankInsignia rank={p.rank} size={compact ? 28 : 34} />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-bold" style={{ fontFamily: FP.display, color: FP.ink }}>
            {p.rank.name}
          </span>
          {!compact && (
            <span className="shrink-0 text-xs tabular-nums" style={{ fontFamily: FP.mono, color: FP.muted }}>
              {p.nextRank ? `${fmtInt(p.xpInRank)} / ${fmtInt(p.xpForNext)}` : `${fmtInt(p.xp)} XP`}
            </span>
          )}
        </span>
        <XpFilament pct={p.pct} height={6} />
      </span>
    </>
  );
  const cls = [
    'group flex w-full min-w-[180px] bg-[var(--fp-panel,#FFFFFF)] max-w-[280px] items-center gap-2.5 px-2.5 py-2 transition-[background-color,transform] duration-100',
    'hover:bg-[color-mix(in_srgb,var(--fp-hl,#FFD84D)_40%,white)] active:translate-y-px',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = { borderRadius: 6, boxShadow: `inset 0 0 0 2px ${FP.ink}`, color: FP.ink };
  const label = `${p.rank.name}, ${fmtInt(p.xp)} XP. Open detective profile.`;
  return onClick ? (
    <button type="button" onClick={onClick} className={cls} style={style} aria-label={label}>
      {inner}
    </button>
  ) : (
    <Link to={to} className={cls} style={style} aria-label={label}>
      {inner}
    </Link>
  );
}

import { motion } from 'framer-motion';
import { CountUp, useReduced } from '../../components/fx';
import { RankInsignia } from './RankInsignia';
import { FP, fmtInt } from './theme';
import type { XpLine } from './types';
import { rankProgress } from './xp';
import { XpFilament } from './XpFilament';

export interface XpCountUpProps {
  breakdown: XpLine[];
  /** Profile XP after this award: shows the rank filament filling from before → after. */
  xpAfter?: number;
  /** seconds before the first line appears */
  delay?: number;
  className?: string;
}

/**
 * Results-card XP block: each breakdown line ticks in (label · +xp), then the total counts up and,
 * when `xpAfter` is given, the rank filament fills (from the start of the rank on a rank-up).
 */
export function XpCountUp({ breakdown, xpAfter, delay = 0.2, className }: XpCountUpProps) {
  const reduced = useReduced();
  const total = breakdown.reduce((s, l) => s + l.xp, 0);
  const step = reduced ? 0 : 0.12;
  const totalDelay = delay + breakdown.length * step + 0.1;
  const after = xpAfter != null ? rankProgress(xpAfter) : null;
  const before = xpAfter != null ? rankProgress(Math.max(0, xpAfter - total)) : null;
  const rankedUp = !!(after && before && after.rank.index > before.rank.index);

  return (
    <div className={className} style={{ color: FP.ink }}>
      <ul className="flex flex-col gap-1">
        {breakdown.map((l, i) => (
          <motion.li
            key={`${l.label}-${i}`}
            className="flex items-baseline justify-between gap-4 text-sm"
            initial={reduced ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * step, type: 'spring', stiffness: 420, damping: 30 }}
          >
            <span style={{ color: FP.muted }}>{l.label}</span>
            <span className="tabular-nums" style={{ fontFamily: FP.mono, color: l.xp < 0 ? FP.danger : FP.ink }}>
              {l.xp < 0 ? '−' : '+'}
              {fmtInt(Math.abs(l.xp))}
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.div
        className="mt-2 flex items-baseline justify-between border-t pt-2"
        style={{ borderColor: FP.hair }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalDelay }}
      >
        <span className="text-xs uppercase tracking-[0.25em]" style={{ fontFamily: FP.mono, color: FP.muted }}>
          XP earned
        </span>
        <span className="text-2xl font-bold" style={{ fontFamily: FP.display, color: FP.accent2, textShadow: `0 0 18px color-mix(in srgb, ${FP.accent2} 40%, transparent)` }}>
          +<CountUp to={total} duration={reduced ? 0 : 1100} />
        </span>
      </motion.div>
      {after && before && (
        <div className="mt-3 flex items-center gap-2.5">
          <RankInsignia rank={after.rank} size={28} />
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[11px]" style={{ fontFamily: FP.mono, color: FP.muted }}>
              <span>{after.rank.name}</span>
              <span>{after.next ? `${fmtInt(after.xpInRank)} / ${fmtInt(after.xpForNext)}` : `${fmtInt(xpAfter ?? 0)} XP`}</span>
            </div>
            <XpFilament pct={after.pct} animateFrom={rankedUp ? 0 : before.pct} delay={totalDelay} color={after.rank.color} />
          </div>
        </div>
      )}
    </div>
  );
}

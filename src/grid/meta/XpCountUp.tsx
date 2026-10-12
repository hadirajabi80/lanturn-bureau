import { motion } from 'framer-motion';
import { CountUp, useReduced } from '../../components/fx';
import { RankInsignia } from './RankInsignia';
import { FP, fmtInt } from './theme';
import type { XpLine } from './types';
import { rankProgress } from './xp';
import { XpFilament } from './XpFilament';

export interface XpCountUpProps {
  breakdown: XpLine[];
  /** Profile XP after this award: shows the rank bar filling from before → after. */
  xpAfter?: number;
  /** seconds before the first line appears */
  delay?: number;
  className?: string;
}

/**
 * Results-card XP block, printed like a receipt: each breakdown line ticks in (label · +xp), then
 * the total counts up and, when `xpAfter` is given, the rank bar fills (from the start of the rank on a rank-up).
 */
export function XpCountUp({ breakdown, xpAfter, delay = 0.2, className }: XpCountUpProps) {
  const reduced = useReduced();
  const total = breakdown.reduce((s, l) => s + l.xp, 0);
  const step = reduced ? 0 : 0.1;
  const totalDelay = delay + breakdown.length * step + 0.1;
  const after = xpAfter != null ? rankProgress(xpAfter) : null;
  const before = xpAfter != null ? rankProgress(Math.max(0, xpAfter - total)) : null;
  const rankedUp = !!(after && before && after.rank.index > before.rank.index);

  return (
    <div className={className} style={{ color: FP.ink }}>
      <ul className="flex flex-col">
        {breakdown.map((l, i) => (
          <motion.li
            key={`${l.label}-${i}`}
            className="flex items-baseline justify-between gap-4 py-1 text-sm"
            style={{ borderBottom: `1px solid ${FP.hair}` }}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * step, type: 'spring', stiffness: 520, damping: 34 }}
          >
            <span style={{ color: FP.muted }}>{l.label}</span>
            <span className="tabular-nums" style={{ fontFamily: FP.mono, color: l.xp < 0 ? FP.accent2 : FP.ink }}>
              {l.xp < 0 ? '−' : '+'}
              {fmtInt(Math.abs(l.xp))}
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.div
        className="mt-1 flex items-baseline justify-between pt-1.5"
        style={{ borderTop: `2px solid ${FP.ink}` }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalDelay, duration: 0.15 }}
      >
        <span className="text-sm font-semibold">XP earned</span>
        <span className="text-2xl font-semibold tabular-nums" style={{ fontFamily: FP.mono }}>
          +<CountUp to={total} duration={reduced ? 0 : 900} />
        </span>
      </motion.div>
      {after && before && (
        <div className="mt-3 flex items-center gap-2.5">
          <RankInsignia rank={after.rank} size={30} />
          <div className="flex-1">
            <div className="mb-1 flex justify-between gap-3 text-xs" style={{ color: FP.muted }}>
              <span className="font-semibold" style={{ color: FP.ink }}>
                {after.rank.name}
              </span>
              <span className="tabular-nums" style={{ fontFamily: FP.mono }}>
                {after.next ? `${fmtInt(after.xpInRank)} / ${fmtInt(after.xpForNext)}` : `${fmtInt(xpAfter ?? 0)} XP`}
              </span>
            </div>
            <XpFilament pct={after.pct} animateFrom={rankedUp ? 0 : before.pct} delay={totalDelay} />
          </div>
        </div>
      )}
    </div>
  );
}

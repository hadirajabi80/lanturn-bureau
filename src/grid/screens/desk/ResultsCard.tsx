/** Results card after a correct accusation: time, stars, XP breakdown, rank-up, achievements, Replay, Share. */
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clapperboard, Share2, Star } from 'lucide-react';
import { fireConfetti } from '@/components/fx';
import { RankUpCelebration, XpCountUp, getProfile } from '@/grid/meta';
import type { AccuseResult } from '@/grid/store';
import { play, pushAchievementToasts } from './bridge';
import { BrassBtn, GhostBtn } from './parts';
import { formatTime } from './util';

export interface ResultAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export function ResultsCard({
  result,
  title,
  code,
  parSeconds,
  showStars = true,
  onReplay,
  onShare,
  actions,
  className,
}: {
  result: AccuseResult;
  title: string;
  code: string;
  parSeconds: number;
  showStars?: boolean;
  onReplay: () => void;
  onShare: () => void;
  actions: ResultAction[];
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const reward = result.reward;
  const [rankUpOpen, setRankUpOpen] = useState(false);
  const [xpAfter] = useState(() => {
    try {
      return getProfile().xp;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    if (reward?.rankUp) {
      const t = window.setTimeout(() => setRankUpOpen(true), reduced ? 0 : 1600);
      return () => window.clearTimeout(t);
    }
    fireConfetti('solve');
    return undefined;
  }, [reward, reduced]);

  useEffect(() => {
    if (reward?.achievements.length) pushAchievementToasts(reward.achievements);
  }, [reward]);

  return (
    <>
      <motion.section
        aria-label="Case closed — results"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.9, type: 'spring', stiffness: 260, damping: 28 }}
        className={['fp-panel fp-panel--glow', className].filter(Boolean).join(' ')}
      >
        <div className="p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--dk-accent-text,var(--fp-accent2))]">Case closed · {code}</div>
          <h2 className="mt-1 font-display text-2xl font-black leading-tight text-[var(--fp-ink)]">{title}</h2>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fp-muted)]">Time</div>
              <div className="font-mono text-3xl font-semibold tabular-nums text-[var(--fp-ink)]">{formatTime(result.timeMs)}</div>
              <div className="text-[11px] text-[var(--fp-muted)]">
                par {formatTime(parSeconds * 1000)}
                {result.newBest && <span className="ml-1 font-semibold text-[var(--dk-accent-text,var(--fp-accent2))]">· new best</span>}
              </div>
            </div>
            {showStars && (
              <div className="flex items-center gap-1.5 pb-1" aria-label={`${result.stars} of 3 stars`}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={reduced ? false : { scale: 2.2, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 1.2 + i * 0.22, type: 'spring', stiffness: 420, damping: 18 }}
                  >
                    <Star
                      aria-hidden
                      className="size-8"
                      style={{ color: i < result.stars ? 'var(--fp-accent2)' : 'var(--dk-line, rgb(255 255 255 / 0.15))' }}
                      fill={i < result.stars ? 'currentColor' : 'none'}
                    />
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {reward && (
            <div className="mt-4 rounded-[8px] bg-[var(--dk-shade,rgb(0_0_0/0.25))] p-3">
              <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--fp-muted)]">Experience</div>
              <XpCountUp breakdown={reward.breakdown} xpAfter={xpAfter} delay={reduced ? 0 : 1} />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <GhostBtn size="sm" onClick={onReplay} icon={<Clapperboard className="size-4" />}>
              Replay
            </GhostBtn>
            <GhostBtn size="sm" onClick={onShare} icon={<Share2 className="size-4" />}>
              Share
            </GhostBtn>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a, i) =>
              a.primary ? (
                <BrassBtn key={i} onClick={a.onClick} className="flex-1" data-autofocus>
                  {a.label}
                </BrassBtn>
              ) : (
                <GhostBtn key={i} onClick={a.onClick} className="flex-1">
                  {a.label}
                </GhostBtn>
              ),
            )}
          </div>
        </div>
      </motion.section>
      {rankUpOpen && reward && (
        <RankUpCelebration
          from={reward.rankBefore}
          to={reward.rankAfter}
          onStamp={() => play('stamp')}
          onDone={() => setRankUpOpen(false)}
        />
      )}
    </>
  );
}

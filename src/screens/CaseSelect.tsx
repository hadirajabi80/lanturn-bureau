import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Award, Settings, Trophy } from 'lucide-react';
import { CASES, TIERS, casesOfTier } from '@/data';
import type { Difficulty } from '@/data/types';
import { tierBadgesIn, useGame } from '@/engine/store';
import { CaseCard } from '@/components/game/CaseCard';
import { SettingsModal } from '@/components/game/SettingsModal';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Tooltip } from '@/components/ui/Tooltip';
import { useReducedFx } from '@/components/ui/useReducedFx';

const TIER_COLOR: Record<Difficulty, string> = {
  easy: '#2EC4B6',
  medium: '#D4A857',
  hard: '#FF7A45',
  extreme: '#C8323C',
};

const BADGE_NAME: Record<Difficulty, string> = {
  easy: 'Brass Whistle',
  medium: 'Silver Loupe',
  hard: 'Iron Gavel',
  extreme: 'The Last Map',
};

export default function CaseSelect() {
  const navigate = useNavigate();
  const reduced = useReducedFx();
  const progress = useGame((s) => s.progress);
  const sessions = useGame((s) => s.sessions);
  const [settings, setSettings] = useState(false);
  const badges = tierBadgesIn(progress);
  const solved = CASES.filter((c) => progress[c.id]?.solved).length;
  const total = CASES.reduce((sum, c) => sum + (progress[c.id]?.score ?? 0), 0);

  let cardIndex = 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:pt-12">
      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-brass/80">Lantern Bureau · Open files</div>
          <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">The desk of the Rookie</h1>
          <p className="mt-2 max-w-xl text-paper/60">
            Twenty files, all open on the desk. Take them in order or pick the one that calls to you.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass flex items-center gap-4 rounded-2xl px-4 py-3">
            <ProgressRing value={solved / Math.max(1, CASES.length)} size={52} stroke={5} label="Files closed">
              <span className="text-xs">
                {solved}/{CASES.length}
              </span>
            </ProgressRing>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-paper/45">Career score</div>
              <div className="font-mono text-xl font-semibold text-lantern">{total.toLocaleString('en-GB')}</div>
            </div>
            <div className="ml-1 flex gap-1.5">
              {TIERS.map((t) => (
                <Tooltip key={t.id} content={`${BADGE_NAME[t.id]} — ${badges[t.id] ? 'earned' : `close every ${t.label} file`}`} side="bottom">
                  <span
                    className={clsx('grid size-8 place-items-center rounded-full border', badges[t.id] ? '' : 'border-white/8 text-paper/20')}
                    style={badges[t.id] ? { color: TIER_COLOR[t.id], borderColor: TIER_COLOR[t.id], boxShadow: `0 0 14px -4px ${TIER_COLOR[t.id]}` } : undefined}
                    tabIndex={0}
                  >
                    <Award className="size-4" />
                  </span>
                </Tooltip>
              ))}
            </div>
          </div>
          <IconButton label="Settings" icon={<Settings className="size-5" />} onClick={() => setSettings(true)} />
        </div>
      </header>

      {/* Tiers */}
      <div className="space-y-14">
        {TIERS.map((tier) => {
          const list = casesOfTier(tier.id);
          const done = list.filter((c) => progress[c.id]?.solved).length;
          return (
            <section key={tier.id} aria-labelledby={`tier-${tier.id}`}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/6 pb-3">
                <div>
                  <h2 id={`tier-${tier.id}`} className="flex items-center gap-3 font-display text-2xl font-bold sm:text-3xl">
                    <span className="h-6 w-1.5 rounded-full" style={{ background: TIER_COLOR[tier.id], boxShadow: `0 0 12px ${TIER_COLOR[tier.id]}` }} />
                    {tier.label}
                  </h2>
                  <p className="mt-1 text-sm text-paper/55">{tier.blurb}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-paper/50">
                  {badges[tier.id] && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold" style={{ color: TIER_COLOR[tier.id], borderColor: `${TIER_COLOR[tier.id]}88` }}>
                      <Trophy className="size-3.5" /> {BADGE_NAME[tier.id]}
                    </span>
                  )}
                  <span className="font-mono">
                    {done}/{list.length} closed
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {list.map((c) => {
                  const i = cardIndex++;
                  const s = sessions[c.id];
                  return (
                    <motion.div
                      key={c.id}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 200, damping: 22, delay: Math.min(i * 0.045, 0.8) }}
                    >
                      <CaseCard
                        caseFile={c}
                        progress={progress[c.id]}
                        unlocked
                        inProgress={Boolean(s && s.phase !== 'intro' && s.phase !== 'solved')}
                        onOpen={() => navigate(`/case/${c.id}`)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

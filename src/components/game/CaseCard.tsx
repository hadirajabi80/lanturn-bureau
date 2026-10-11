import { useAnimationControls, motion } from 'framer-motion';
import clsx from 'clsx';
import { Lock, MapPin, Play } from 'lucide-react';
import type { CaseFile } from '@/data/types';
import type { CaseProgress } from '@/engine/store';
import { RANK_COLOR } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { GlowCard } from '@/components/fx';
import { toast } from '@/components/ui/Toast';

export interface CaseCardProps {
  caseFile: CaseFile;
  progress?: CaseProgress;
  unlocked: boolean;
  inProgress?: boolean;
  onOpen: () => void;
}

const pad = (n: number): string => String(n).padStart(2, '0');

export function CaseCard({ caseFile: c, progress, unlocked, inProgress, onOpen }: CaseCardProps) {
  const lock = useAnimationControls();

  const click = () => {
    if (unlocked) {
      sfx.blip();
      onOpen();
      return;
    }
    sfx.wrong();
    void lock.start({ rotate: [0, -14, 12, -9, 6, 0], x: [0, -3, 3, -2, 1, 0], transition: { duration: 0.5 } });
    toast(`Close case ${pad(c.number - 1)} first. Otto files these in order.`, 'warn');
  };

  const glow = unlocked ? c.palette.glow : 'rgb(80 90 110 / 0.35)';

  return (
    <GlowCard glow={glow} onClick={click} tilt={unlocked} className="h-full rounded-2xl">
      <div
        className={clsx('relative flex h-full min-h-[208px] flex-col overflow-hidden rounded-2xl border bg-ink-2', unlocked ? 'border-white/10' : 'border-white/5')}
        aria-label={unlocked ? `Case ${c.number}: ${c.title}` : `Case ${c.number}, locked`}
      >
        {/* palette band */}
        <div
          className={clsx('relative h-20 shrink-0', !unlocked && 'grayscale')}
          style={{ background: `linear-gradient(135deg, ${c.palette.from}, ${c.palette.to})` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgb(255_255_255/0.45),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink-2 to-transparent" />
          <span
            className="absolute left-4 top-3 -rotate-6 rounded border-2 border-ink/70 px-1.5 font-display text-sm font-black tracking-widest text-ink/80"
            style={{ mixBlendMode: 'multiply' }}
          >
            Nº {pad(c.number)}
          </span>
          {progress?.solved && (
            <motion.span
              initial={{ scale: 1.6, opacity: 0, rotate: 8 }}
              animate={{ scale: 1, opacity: 1, rotate: 8 }}
              className="absolute right-3 top-2.5 grid size-11 place-items-center rounded-full border-2 bg-ink/85 font-display text-2xl font-black"
              style={{ color: RANK_COLOR[progress.rank], borderColor: RANK_COLOR[progress.rank], boxShadow: `0 0 18px -2px ${RANK_COLOR[progress.rank]}` }}
              title={`Best: ${progress.score} pts`}
            >
              {progress.rank}
            </motion.span>
          )}
        </div>

        <div className="relative flex flex-1 flex-col px-4 pb-4 pt-1">
          {unlocked ? (
            <>
              <h3 className="font-display text-lg font-bold leading-snug text-paper">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-paper/60">{c.tagline}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-paper/45">
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{c.location}</span>
                </span>
                {progress?.solved ? (
                  <span className="shrink-0 font-mono text-brass">{progress.score} pts</span>
                ) : inProgress ? (
                  <span className="flex shrink-0 items-center gap-1 font-semibold text-lantern">
                    <Play className="size-3" /> Resume
                  </span>
                ) : (
                  <span className="shrink-0 font-semibold uppercase tracking-wider text-paper/60">Open</span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <motion.span animate={lock} className="grid size-12 place-items-center rounded-full border border-white/10 bg-fog/60">
                <Lock className="size-5 text-paper/45" />
              </motion.span>
              <span className="font-display text-base font-bold text-paper/40">Sealed</span>
              <span className="text-[11px] text-paper/35">Solve the previous file to break the seal.</span>
            </div>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

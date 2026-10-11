/**
 * /plans/blitz — 3:00 on the clock, small classic cases back to back.
 * Lever + accusation right = +1 (and +10 s when no Otto / Reveal was used); a burn costs 20 s.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Timer, Zap } from 'lucide-react';
import { DISTRICTS } from '@/grid/skins/districts';
import { useFloorplan, type AccuseResult, type RecordOutcome } from '@/grid/store';
import type { Puzzle, Tier } from '@/grid/types';
import { BrassButton, GhostButton, MonoStat, PageShell } from '@/grid/ui';
import { generateCustom, hashSeed } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
import { rng } from '../desk/util';
import { RunCard } from './shared';

export const BLITZ_MS = 180_000;
const CLEAN_BONUS_MS = 10_000;
const BURN_PENALTY_MS = 20_000;

/** The i-th case of a Blitz session: Rookie/Detective sizes, always classic. */
export function blitzPuzzle(seed: number, i: number): Puzzle {
  const r = rng(hashSeed('blitz', seed, i));
  const district = DISTRICTS[Math.floor(r() * DISTRICTS.length)]!.id;
  const tier: Tier = i < 2 || r() < 0.55 ? 'easy' : 'medium';
  const size = tier === 'easy' ? 4 + Math.floor(r() * 2) : 5 + Math.floor(r() * 2);
  return generateCustom({ districtId: district, tier, size, variant: 'classic', seed: hashSeed('blitz-case', seed, i) % 1_000_000 });
}

type Phase = 'intro' | 'running' | 'over';

export function BlitzScreen() {
  const navigate = useNavigate();
  const best = useFloorplan((s) => s.records.blitzBest);
  const [phase, setPhase] = useState<Phase>('intro');
  const [seed, setSeed] = useState(() => Date.now() % 1_000_000_007);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [budget, setBudget] = useState(BLITZ_MS);
  const [flash, setFlash] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const [end, setEnd] = useState<{ score: number; newBest: boolean; outcome: RecordOutcome | null } | null>(null);
  const busy = useRef(false);

  const puzzle = useMemo(() => {
    if (phase !== 'running') return null;
    try {
      return blitzPuzzle(seed, index);
    } catch (err) {
      console.error('[blitz] generation failed', err);
      return null;
    }
  }, [phase, seed, index]);

  const start = () => {
    setSeed(Date.now() % 1_000_000_007);
    setIndex(0);
    setScore(0);
    setBudget(BLITZ_MS);
    setEnd(null);
    busy.current = false;
    setPhase('running');
  };

  const finish = useCallback((finalScore: number) => {
    const res = useFloorplan.getState().recordBlitz(finalScore);
    setEnd({ score: finalScore, ...res });
    setPhase('over');
  }, []);

  const showFlash = (text: string, good: boolean) => setFlash({ id: Date.now(), text, good });

  const advance = (remaining: number, nextScore: number) => {
    window.setTimeout(() => {
      busy.current = false;
      if (remaining <= 0) finish(nextScore);
      else {
        setBudget(remaining);
        setIndex((i) => i + 1);
      }
    }, 1100);
  };

  const onSolved = (r: AccuseResult) => {
    if (busy.current) return;
    busy.current = true;
    const a = useFloorplan.getState().active;
    const clean = !!a && a.otto === 0 && a.reveals === 0;
    const remaining = budget - r.timeMs + (clean ? CLEAN_BONUS_MS : 0);
    const next = score + 1;
    setScore(next);
    showFlash(clean ? '+1 · +10 s' : '+1', true);
    advance(remaining, next);
  };

  const onBurned = () => {
    if (busy.current) return;
    busy.current = true;
    const elapsed = useFloorplan.getState().active?.elapsedMs ?? 0;
    showFlash('Burned · −20 s', false);
    advance(budget - elapsed - BURN_PENALTY_MS, score);
  };

  const onTimeUp = () => {
    if (busy.current) return;
    busy.current = true;
    finish(score);
  };

  if (phase === 'running' && puzzle) {
    return (
      <CasePlayer
        key={`${seed}-${index}`}
        puzzle={puzzle}
        mode="blitz"
        fresh
        record={false}
        timeLimitMs={budget}
        onTimeUp={onTimeUp}
        onSolved={onSolved}
        onBurned={onBurned}
        showResults={false}
        showBurnOverlay={false}
        backTo="/plans/modes"
        backLabel="Abandon the run"
        kicker={`Blitz · case ${index + 1}`}
        hud={
          <div className="relative flex items-center gap-1.5 rounded-full border border-[var(--fp-hair)] bg-[var(--dk-shade,rgb(0_0_0/0.25))] px-3 py-1 font-mono text-sm">
            <Zap className="size-3.5 text-[var(--dk-accent-text,var(--fp-accent2))]" aria-hidden />
            <span aria-label={`${score} cases closed`}>{score}</span>
            <AnimatePresence>
              {flash && (
                <motion.span
                  key={flash.id}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: 26, opacity: 0 }}
                  transition={{ duration: 1.6 }}
                  className="pointer-events-none absolute left-0 top-full whitespace-nowrap text-xs font-bold"
                  style={{ color: flash.good ? '#8fe3a0' : '#ff8a7a' }}
                  onAnimationComplete={() => setFlash(null)}
                >
                  {flash.text}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        }
      />
    );
  }

  return (
    <PageShell title="Blitz" kicker="Modes · three minutes" back="/plans/modes" backLabel="Back to modes">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {phase === 'over' && end ? (
          <RunCard
            kicker="Time's up"
            title={end.newBest ? 'A new Bureau record' : 'The clock wins'}
            big={end.score}
            bigLabel={end.score === 1 ? 'case closed' : 'cases closed'}
            lines={<>Best: {Math.max(best, end.score)}</>}
            outcome={end.outcome}
          >
            <BrassButton onClick={start} icon={<Zap className="size-4" />}>
              Again
            </BrassButton>
            <GhostButton onClick={() => navigate('/plans/modes')}>Back to modes</GhostButton>
          </RunCard>
        ) : (
          <section className="fp-panel mx-auto max-w-xl p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[var(--dk-shade,rgb(0_0_0/0.25))]">
                <Timer className="size-6 text-[var(--dk-accent-text,var(--fp-accent2))]" />
              </span>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--fp-muted)]">3:00 on the clock</div>
                <h2 className="font-display text-2xl font-black">Close as many as you can</h2>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed">
              <li>Small classic cases arrive back to back — Rookie and Detective sizes.</li>
              <li>
                Every correct lever + accusation scores <b>+1</b>. Solve it without Otto or a Reveal and the clock gains <b>+10 s</b>.
              </li>
              <li className="flex items-start gap-1.5">
                <Flame className="mt-0.5 size-4 shrink-0 text-[#ff8a3d]" /> A burned file costs <b>20 s</b> and the next case comes in.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <MonoStat label="Your best" value={best} />
              <BrassButton size="lg" onClick={start} icon={<Zap className="size-4" />}>
                Start the clock
              </BrassButton>
            </div>
            {phase === 'running' && !puzzle && <p className="mt-4 text-sm text-[var(--fp-danger)]">Could not draw a plan. Try again.</p>}
          </section>
        )}
      </div>
    </PageShell>
  );
}

export default BlitzScreen;

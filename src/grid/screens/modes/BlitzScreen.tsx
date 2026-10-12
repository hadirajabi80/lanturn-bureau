/**
 * /plans/blitz — 3:00 on the clock, small classic cases back to back.
 * Lever + accusation right = +1 (and +10 s when no Otto / Reveal was used); a burn costs 20 s.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { DISTRICTS } from '@/grid/skins/districts';
import { useFloorplan, type AccuseResult, type RecordOutcome } from '@/grid/store';
import type { Puzzle, Tier } from '@/grid/types';
import { BrassButton, GhostButton, MonoStat, PageShell, SkinProvider } from '@/grid/ui';
import { generateCustom, hashSeed } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
import { rng } from '../desk/util';
import { FactTable, IntroSheet, ModeLayout, RunCard } from './shared';

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
          <div className="relative flex h-8 items-center gap-1.5 rounded-md bg-(--fp-panel) px-2.5 font-mono text-sm font-semibold text-(--fp-ink) shadow-[inset_0_0_0_2px_var(--fp-ink)]">
            <Zap className="size-3.5 fill-(--fp-hl)" strokeWidth={2.2} aria-hidden />
            <span aria-label={`${score} cases closed`}>{score}</span>
            <AnimatePresence>
              {flash && (
                <motion.span
                  key={flash.id}
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: [-4, 0, 0, 6], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.3, times: [0, 0.12, 0.8, 1] }}
                  className="pointer-events-none absolute left-0 top-full mt-1.5 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 font-sans text-xs font-bold text-white shadow-[inset_0_0_0_1.5px_var(--fp-ink)]"
                  style={{ background: flash.good ? 'var(--fp-green, #1E8A4C)' : 'var(--fp-accent, #D7261E)' }}
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
    <SkinProvider>
      <PageShell title="Blitz" kicker="Modes · three minutes" back="/plans/modes" backLabel="Back to modes">
        {phase === 'over' && end ? (
          <div className="py-2 sm:py-6">
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
          </div>
        ) : (
          <ModeLayout
            aside={
              <FactTable
                title="Scoring"
                rows={[
                  ['Case closed', '+1'],
                  ['No Otto, no Reveal', '+10 s'],
                  ['Burned file', '−20 s'],
                ]}
              />
            }
          >
            <IntroSheet
              label="3:00 on the clock"
              title="Close as many as you can"
              figure="3:00"
              figureLabel="Three minutes"
              rules={[
                <>Small classic cases arrive back to back, in Rookie and Detective sizes.</>,
                <>
                  Every correct lever and accusation scores <b>+1</b>. Solve it without Otto or a Reveal and the clock gains <b>+10 s</b>.
                </>,
                <>
                  A burned file costs <b>20 s</b> and the next case comes in.
                </>,
              ]}
              footer={
                <>
                  <MonoStat label="Your best" value={best} />
                  <BrassButton size="lg" onClick={start} icon={<Zap className="size-4" />}>
                    Start the clock
                  </BrassButton>
                  {phase === 'running' && !puzzle && <p className="w-full text-sm font-semibold text-(--fp-accent2)">Could not draw a plan. Try again.</p>}
                </>
              }
            />
          </ModeLayout>
        )}
      </PageShell>
    </SkinProvider>
  );
}

export default BlitzScreen;

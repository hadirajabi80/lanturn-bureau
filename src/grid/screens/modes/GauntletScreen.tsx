/**
 * /plans/gauntlet — eight floors of rising difficulty, the last one an Extra Extreme case from the sealed attic. No Reveal, two Ask Otto for the whole run,
 * and one burn ends it. The best floor reached is saved.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, ChevronRight, Swords } from 'lucide-react';
import { DISTRICTS } from '@/grid/skins/districts';
import { useFloorplan, type RecordOutcome } from '@/grid/store';
import type { Puzzle, Tier, Variant } from '@/grid/types';
import { BrassButton, GhostButton, MonoStat, PageShell, SkinProvider, VariantGlyph } from '@/grid/ui';
import { generateCustom, hashSeed } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
import { HEAVY_TIERS } from '../desk/genJob';
import { DeskLoading, useGeneratedPuzzle } from '../desk/loading';
import { VARIANT_META } from '../desk/util';
import { FactTable, IntroSheet, ModeLayout, RunCard } from './shared';

export interface GauntletStage {
  tier: Tier;
  variant: Variant;
  size: number;
  label: string;
}

export const GAUNTLET: GauntletStage[] = [
  { tier: 'easy', variant: 'classic', size: 5, label: 'Rookie' },
  { tier: 'medium', variant: 'classic', size: 6, label: 'Detective' },
  { tier: 'hard', variant: 'classic', size: 8, label: 'Inspector' },
  { tier: 'hard', variant: 'liar', size: 8, label: 'Inspector · the liar' },
  { tier: 'extreme', variant: 'accomplice', size: 10, label: 'Chief · the accomplice' },
  { tier: 'extreme', variant: 'double', size: 11, label: 'Chief · double homicide' },
  { tier: 'mastermind', variant: 'liarDouble', size: 12, label: 'Mastermind' },
  { tier: 'ultra', variant: 'classic', size: 9, label: 'Extra Extreme · the sealed attic' },
];
const OTTO_PER_RUN = 2;

function gauntletOpts(seed: number, stage: number) {
  const s = GAUNTLET[stage]!;
  const district = DISTRICTS[hashSeed('gauntlet-d', seed, stage) % DISTRICTS.length]!.id;
  return { districtId: district, tier: s.tier, size: s.size, variant: s.variant, seed: hashSeed('gauntlet', seed, stage) % 1_000_000 };
}

export function gauntletPuzzle(seed: number, stage: number): Puzzle {
  return generateCustom(gauntletOpts(seed, stage));
}

type Phase = 'intro' | 'playing' | 'cleared' | 'over';

export function GauntletScreen() {
  const navigate = useNavigate();
  const best = useFloorplan((s) => s.records.gauntletBest);
  const [phase, setPhase] = useState<Phase>('intro');
  const [seed, setSeed] = useState(() => Date.now() % 1_000_000_007);
  const [stage, setStage] = useState(0);
  const [ottoUsed, setOttoUsed] = useState(0);
  const [end, setEnd] = useState<{ stage: number; newBest: boolean; outcome: RecordOutcome | null } | null>(null);

  const heavy = phase === 'playing' && HEAVY_TIERS.has(GAUNTLET[stage]!.tier);
  const gen = useGeneratedPuzzle(
    phase === 'playing' ? `${seed}-${stage}` : null,
    () => gauntletPuzzle(seed, stage),
    heavy ? { kind: 'custom', opts: gauntletOpts(seed, stage) } : null,
  );

  const start = () => {
    setSeed(Date.now() % 1_000_000_007);
    setStage(0);
    setOttoUsed(0);
    setEnd(null);
    setPhase('playing');
  };

  const finish = (cleared: number) => {
    const res = useFloorplan.getState().recordGauntlet(cleared);
    setEnd({ stage: cleared, ...res });
    setPhase('over');
  };

  const onSolved = () => {
    const a = useFloorplan.getState().active;
    setOttoUsed((u) => u + (a?.otto ?? 0));
    const cleared = stage + 1;
    window.setTimeout(() => {
      if (cleared >= GAUNTLET.length) finish(cleared);
      else setPhase('cleared');
    }, 1600);
  };

  if (phase === 'playing') {
    if (gen.status !== 'ready')
      return (
        <DeskLoading
          label={GAUNTLET[stage]!.tier === 'ultra' ? `Unsealing the attic, floor ${stage + 1}…` : `Climbing to floor ${stage + 1}…`}
          attic={GAUNTLET[stage]!.tier === 'ultra'}
        />
      );
    const s = GAUNTLET[stage]!;
    return (
      <CasePlayer
        key={`${seed}-${stage}`}
        puzzle={gen.puzzle}
        mode="gauntlet"
        fresh
        record={false}
        allowReveal={false}
        ottoLimit={Math.max(0, OTTO_PER_RUN - ottoUsed)}
        showResults={false}
        onSolved={onSolved}
        backTo="/plans/modes"
        backLabel="Abandon the run"
        kicker={`Gauntlet · floor ${stage + 1} of ${GAUNTLET.length} · ${s.label}`}
        burnActions={[{ label: 'See how far you got', onClick: () => finish(stage), primary: true }]}
        hud={<FloorMeter stage={stage} />}
      />
    );
  }

  return (
    <SkinProvider>
      <PageShell title="The Gauntlet" kicker="Modes · eight floors" back="/plans/modes" backLabel="Back to modes">
        {phase === 'over' && end ? (
          <div className="py-2 sm:py-6">
            <RunCard
              kicker={end.stage >= GAUNTLET.length ? 'The sealed attic' : 'The file burned'}
              title={end.stage >= GAUNTLET.length ? 'You survived the Gauntlet' : end.newBest ? 'Your highest climb yet' : 'The run is over'}
              big={`${end.stage}/${GAUNTLET.length}`}
              bigLabel="floors cleared"
              lines={<>Best: {Math.max(best, end.stage)} / {GAUNTLET.length}</>}
              outcome={end.outcome}
            >
              <BrassButton onClick={start} icon={<Swords className="size-4" />}>
                Climb again
              </BrassButton>
              <GhostButton onClick={() => navigate('/plans/modes')}>Back to modes</GhostButton>
            </RunCard>
          </div>
        ) : phase === 'cleared' ? (
          <motion.section
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="fp-panel fp-panel--glow mx-auto my-2 max-w-md p-5 sm:my-6 sm:p-6"
          >
            <p className="text-[13px] font-semibold text-(--fp-muted)">Floor {stage + 1} cleared</p>
            <h2 className="mt-0.5 border-b-2 border-(--fp-ink) pb-3 font-display text-[1.9rem] font-black leading-[1.05] tracking-[-0.02em]">
              Up the stairs
            </h2>
            <div className="mt-3">
              <StageList current={stage + 1} />
            </div>
            <p className="mt-4 text-sm text-(--fp-muted)">
              Otto has <b className="font-mono text-(--fp-ink)">{Math.max(0, OTTO_PER_RUN - ottoUsed)}</b>{' '}
              {OTTO_PER_RUN - ottoUsed === 1 ? 'answer' : 'answers'} left for this run.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BrassButton
                data-autofocus
                onClick={() => {
                  setStage((s) => s + 1);
                  setPhase('playing');
                }}
                iconRight={<ChevronRight className="size-4" />}
              >
                Floor {stage + 2}
              </BrassButton>
              <GhostButton onClick={() => finish(stage + 1)}>Stop here</GhostButton>
            </div>
          </motion.section>
        ) : (
          <ModeLayout
            aside={
              <FactTable title="The building">
                <div className="mt-3">
                  <StageList current={0} />
                </div>
                <p className="mt-3 text-[13px] text-(--fp-muted)">Top floor first. Cleared floors get struck off.</p>
              </FactTable>
            }
          >
            <IntroSheet
              label="One life · eight floors"
              title="Climb to the attic"
              figure="8"
              figureLabel="Eight floors"
              rules={[
                <>Eight cases, each harder than the last. Liars, accomplices and a double homicide wait upstairs, and above the roof, an Extra Extreme case with no coordinates at all.</>,
                <>No Reveal. Otto answers twice in the whole run.</>,
                <>One burned file ends the climb.</>,
              ]}
              footer={
                <>
                  <MonoStat label="Best floor" value={`${best} / ${GAUNTLET.length}`} />
                  <BrassButton size="lg" onClick={start} icon={<Swords className="size-4" />}>
                    Enter the Gauntlet
                  </BrassButton>
                </>
              }
            />
          </ModeLayout>
        )}
      </PageShell>
    </SkinProvider>
  );
}

/** The building, top floor first: cleared floors struck through, the current one highlighted. */
function StageList({ current }: { current: number }) {
  return (
    <ol className="flex flex-col-reverse overflow-hidden rounded-md text-left shadow-[inset_0_0_0_2px_var(--fp-ink)]" aria-label="Floors">
      {GAUNTLET.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={i}
            aria-current={now ? 'step' : undefined}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 text-sm',
              i > 0 && 'border-b border-(--fp-hair)',
              now && 'bg-(--fp-hl) font-semibold shadow-[inset_0_0_0_2px_var(--fp-ink)]',
              done && 'text-(--fp-muted)',
            )}
          >
            <span className={clsx('w-5 font-mono text-xs font-semibold', now ? 'text-(--fp-ink)' : 'text-(--fp-muted)')}>{i + 1}</span>
            <VariantGlyph variant={s.variant} size={15} className={done ? 'text-(--fp-muted)' : 'text-(--fp-ink)'} />
            <span className={clsx('min-w-0 flex-1 truncate', done && 'line-through decoration-(--fp-accent) decoration-2')}>{s.label}</span>
            <span className="shrink-0 text-right font-mono text-xs text-(--fp-muted)">
              {s.size}×{s.size}
            </span>
            {done && <Check className="size-4 shrink-0 text-(--fp-green)" strokeWidth={3} aria-label="cleared" />}
          </li>
        );
      })}
    </ol>
  );
}

function FloorMeter({ stage }: { stage: number }) {
  return (
    <div
      className="hidden items-center gap-[3px] sm:flex"
      aria-label={`Floor ${stage + 1} of ${GAUNTLET.length}`}
      title={VARIANT_META[GAUNTLET[stage]!.variant].name}
    >
      {GAUNTLET.map((_, i) => (
        <span
          key={i}
          className="h-4 w-2 rounded-[2px] shadow-[inset_0_0_0_1.5px_var(--fp-ink)]"
          style={{ background: i < stage ? 'var(--fp-ink)' : i === stage ? 'var(--fp-accent)' : 'var(--fp-panel)' }}
        />
      ))}
    </div>
  );
}

export default GauntletScreen;

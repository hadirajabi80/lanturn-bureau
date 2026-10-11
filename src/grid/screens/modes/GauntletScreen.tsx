/**
 * /plans/gauntlet — seven floors of rising difficulty. No Reveal, two Ask Otto for the whole run,
 * and one burn ends it. The best floor reached is saved.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Building, ChevronRight, Flame, MessageCircleQuestion, Swords } from 'lucide-react';
import { DISTRICTS, TIER_INFO } from '@/grid/skins/districts';
import { useFloorplan, type RecordOutcome } from '@/grid/store';
import type { Puzzle, Tier, Variant } from '@/grid/types';
import { BrassButton, GhostButton, MonoStat, PageShell, VariantGlyph } from '@/grid/ui';
import { generateCustom, hashSeed } from '../desk/bridge';
import { CasePlayer } from '../desk/CasePlayer';
import { DeskLoading, useGeneratedPuzzle } from '../desk/loading';
import { VARIANT_META } from '../desk/util';
import { RunCard } from './shared';

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
];
const OTTO_PER_RUN = 2;

export function gauntletPuzzle(seed: number, stage: number): Puzzle {
  const s = GAUNTLET[stage]!;
  const district = DISTRICTS[hashSeed('gauntlet-d', seed, stage) % DISTRICTS.length]!.id;
  return generateCustom({ districtId: district, tier: s.tier, size: s.size, variant: s.variant, seed: hashSeed('gauntlet', seed, stage) % 1_000_000 });
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

  const gen = useGeneratedPuzzle(phase === 'playing' ? `${seed}-${stage}` : null, () => gauntletPuzzle(seed, stage));

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
    if (gen.status !== 'ready') return <DeskLoading label={`Climbing to floor ${stage + 1}…`} />;
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
    <PageShell title="The Gauntlet" kicker="Modes · seven floors" back="/plans/modes" backLabel="Back to modes">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {phase === 'over' && end ? (
          <RunCard
            kicker={end.stage >= GAUNTLET.length ? 'The roof' : 'The file burned'}
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
        ) : phase === 'cleared' ? (
          <motion.section initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fp-panel fp-panel--glow mx-auto max-w-md p-6 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--dk-accent-text,var(--fp-accent2))]">Floor {stage + 1} cleared</div>
            <h2 className="mt-1 font-display text-3xl font-black">Up the stairs</h2>
            <div className="mt-5">
              <StageList current={stage + 1} />
            </div>
            <p className="mt-4 text-sm text-[var(--fp-muted)]">
              Otto has {Math.max(0, OTTO_PER_RUN - ottoUsed)} {OTTO_PER_RUN - ottoUsed === 1 ? 'answer' : 'answers'} left for this run.
            </p>
            <div className="mt-6 flex justify-center gap-2">
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
          <section className="fp-panel mx-auto max-w-xl p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[var(--dk-shade,rgb(0_0_0/0.25))]">
                <Building className="size-6 text-[var(--dk-accent-text,var(--fp-accent2))]" />
              </span>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--fp-muted)]">One life · seven floors</div>
                <h2 className="font-display text-2xl font-black">Climb to the roof</h2>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm leading-relaxed">
              <li>Seven cases, each harder than the last — liars, accomplices and a double homicide wait upstairs.</li>
              <li className="flex items-start gap-1.5">
                <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-[var(--dk-accent-text,var(--fp-accent2))]" /> No Reveal. Otto answers twice in the whole run.
              </li>
              <li className="flex items-start gap-1.5">
                <Flame className="mt-0.5 size-4 shrink-0 text-[#ff8a3d]" /> One burned file ends the climb.
              </li>
            </ul>
            <div className="mt-5">
              <StageList current={0} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <MonoStat label="Best floor" value={`${best} / ${GAUNTLET.length}`} />
              <BrassButton size="lg" onClick={start} icon={<Swords className="size-4" />}>
                Enter the Gauntlet
              </BrassButton>
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function StageList({ current }: { current: number }) {
  return (
    <ol className="flex flex-col-reverse gap-1 text-left">
      {GAUNTLET.map((s, i) => (
        <li
          key={i}
          className={clsx(
            'flex items-center gap-3 rounded-[6px] px-3 py-1.5 text-sm',
            i < current ? 'text-[var(--fp-muted)] line-through decoration-[var(--fp-accent)]/50' : i === current ? 'bg-[var(--dk-hover,rgb(255_255_255/0.06))] font-semibold' : 'opacity-70',
          )}
        >
          <span className="w-5 font-mono text-xs text-[var(--fp-muted)]">{i + 1}</span>
          <VariantGlyph variant={s.variant} size={14} className="text-[var(--dk-accent-text,var(--fp-accent2))]" />
          <span className="flex-1">{s.label}</span>
          <span className="font-mono text-[11px] text-[var(--fp-muted)]">
            {s.size}×{s.size} · {TIER_INFO[s.tier].name}
          </span>
        </li>
      ))}
    </ol>
  );
}

function FloorMeter({ stage }: { stage: number }) {
  return (
    <div className="hidden items-center gap-0.5 sm:flex" aria-label={`Floor ${stage + 1} of ${GAUNTLET.length}`} title={VARIANT_META[GAUNTLET[stage]!.variant].name}>
      {GAUNTLET.map((_, i) => (
        <span
          key={i}
          className="h-4 w-2 rounded-[2px]"
          style={{ background: i < stage ? 'var(--fp-accent)' : i === stage ? 'var(--fp-accent2)' : 'rgb(255 255 255 / 0.12)' }}
        />
      ))}
    </div>
  );
}

export default GauntletScreen;

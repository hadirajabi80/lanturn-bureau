import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Lock, Quote } from 'lucide-react';
import { CASES } from '@/data';
import { BUREAU_LIST } from '@/data/bureau';
import type { Character } from '@/data/types';
import { useGame } from '@/engine/store';
import { Avatar } from '@/components/avatar/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { pad2 } from './useCaseSession';

interface Pick {
  ch: Character;
  note?: string;
  culprit?: boolean;
}

export default function Codex() {
  const reduced = useReducedFx();
  const progress = useGame((s) => s.progress);
  const [pick, setPick] = useState<Pick | null>(null);
  const solvedCases = CASES.filter((c) => progress[c.id]?.solved);
  const met = solvedCases.reduce((n, c) => n + c.suspects.filter((s) => !BUREAU_LIST.some((b) => b.id === s.character.id)).length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:pt-12">
      <header className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-brass/80">Hestia's index cards</div>
        <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">The Codex</h1>
        <p className="mt-2 max-w-xl text-paper/60">
          Everyone you've met, filed and cross-referenced. {met > 0 ? `${met} persons of interest so far.` : 'Close a case to start the collection.'}
        </p>
      </header>

      <section className="mb-14">
        <h2 className="mb-4 font-display text-2xl font-bold">The Bureau</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {BUREAU_LIST.map((ch, i) => (
            <CharacterTile key={ch.id} ch={ch} index={i} reduced={reduced} onClick={() => setPick({ ch })} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Case archive</h2>
        <div className="space-y-8">
          {CASES.map((c) => {
            const solved = Boolean(progress[c.id]?.solved);
            return (
              <div key={c.id} className="rounded-2xl border border-white/5 bg-ink-2/60 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs" style={{ color: solved ? c.palette.glow : undefined }}>
                      Nº {pad2(c.number)}
                    </span>
                    <h3 className={clsx('font-display text-lg font-bold', !solved && 'text-paper/35')}>
                      {solved ? c.title : 'Sealed file'}
                    </h3>
                  </div>
                  {solved && progress[c.id] && <Badge tone="brass">Rank {progress[c.id]?.rank}</Badge>}
                </div>
                {solved ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {c.suspects.map((s, i) => {
                      const culprit = s.character.id === c.culpritId;
                      return (
                        <CharacterTile
                          key={s.character.id}
                          ch={s.character}
                          index={i}
                          reduced={reduced}
                          culprit={culprit}
                          onClick={() => setPick({ ch: s.character, note: s.relation, culprit })}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {c.suspects.map((s) => (
                      <div key={s.character.id} className="grid h-24 w-20 place-items-center rounded-xl border border-dashed border-white/8 bg-fog/30">
                        <Lock className="size-4 text-paper/20" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Modal open={pick !== null} onClose={() => setPick(null)} eyebrow={pick?.ch.role} title={pick?.ch.name} size="md">
        {pick && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar spec={pick.ch.avatar} size={110} mood={pick.culprit ? 'smug' : 'happy'} />
              <div className="min-w-0">
                <p className="flex gap-1.5 font-display text-lg italic text-paper/85">
                  <Quote className="mt-1 size-4 shrink-0 text-brass" />
                  {pick.ch.tagline}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="fog">Age {pick.ch.age}</Badge>
                  {pick.culprit && <Badge tone="crimson">Culprit</Badge>}
                </div>
              </div>
            </div>
            {pick.note && <Fact label="Connection">{pick.note}</Fact>}
            {pick.ch.personality && <Fact label="Personality">{pick.ch.personality}</Fact>}
            {pick.ch.quirk && <Fact label="Tell">{pick.ch.quirk}</Fact>}
            {pick.ch.voice && <Fact label="How they talk">{pick.ch.voice}</Fact>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: string }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-paper/45">{label}</div>
      <p className="mt-0.5 text-sm text-paper/85">{children}</p>
    </div>
  );
}

function CharacterTile({
  ch,
  index,
  reduced,
  culprit,
  onClick,
}: {
  ch: Character;
  index: number;
  reduced: boolean;
  culprit?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={clsx(
        'flex flex-col items-center rounded-2xl border bg-fog/40 p-3 text-center transition-colors hover:border-brass/40',
        culprit ? 'border-crimson/40' : 'border-white/6',
      )}
    >
      <Avatar spec={ch.avatar} size={84} />
      <span className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">{ch.name}</span>
      <span className="mt-0.5 line-clamp-1 text-[11px] text-paper/50">{ch.role}</span>
      {culprit && <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-crimson">Culprit</span>}
    </motion.button>
  );
}

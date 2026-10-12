/** The Line-up: suspects stand in front of a height chart; pick the killer (+ accomplice / per-victim killers). */
import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { Gavel } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import type { Accusation } from '@/grid/store';
import type { Puzzle } from '@/grid/types';
import { isDouble, needsAccomplice, play, victimsOf } from './bridge';
import { BrassBtn, GhostBtn, Overlay, VariantIcon } from './parts';
import { VARIANT_META } from './util';

interface Slot {
  id: string;
  label: string;
  sub?: string;
}

export function LineUp({
  puzzle,
  open,
  onClose,
  onAccuse,
  burnEnabled,
}: {
  puzzle: Puzzle;
  open: boolean;
  onClose: () => void;
  /** returns true when the accusation was right */
  onAccuse: (a: Accusation) => boolean;
  burnEnabled: boolean;
}) {
  return (
    <Overlay open={open} onClose={onClose} label="The line-up" backdrop="var(--fp-bg)">
      <LineUpStage puzzle={puzzle} onClose={onClose} onAccuse={onAccuse} burnEnabled={burnEnabled} />
    </Overlay>
  );
}

function LineUpStage({
  puzzle,
  onClose,
  onAccuse,
  burnEnabled,
}: {
  puzzle: Puzzle;
  onClose: () => void;
  onAccuse: (a: Accusation) => boolean;
  burnEnabled: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const variant = puzzle.variant ?? 'classic';
  const suspects = puzzle.people.filter((p) => !p.isVictim);
  const name = (id: string) => puzzle.people.find((p) => p.id === id)?.name ?? '';
  const slots: Slot[] = useMemo(() => {
    if (isDouble(variant)) {
      return victimsOf(puzzle).map((v) => ({ id: v, label: `Killer of ${name(v)}`, sub: 'victim' }));
    }
    if (needsAccomplice(variant)) return [{ id: 'killer', label: 'Killer' }, { id: 'accomplice', label: 'Accomplice' }];
    return [{ id: 'killer', label: 'Killer' }];
  }, [puzzle, variant]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [activeSlot, setActiveSlot] = useState(slots[0]!.id);
  const [hover, setHover] = useState<string | null>(null);
  const lights = useAnimationControls();

  useEffect(() => {
    play('spotlight');
  }, []);

  const pick = (personId: string) => {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(picks)) if (v !== personId) next[k] = v;
    next[activeSlot] = personId;
    setPicks(next);
    const empty = slots.find((s) => !next[s.id]);
    if (empty) setActiveSlot(empty.id);
  };

  const ready = slots.every((s) => picks[s.id]);
  const accuse = () => {
    if (!ready) return;
    let acc: Accusation;
    if (isDouble(variant)) acc = { killers: slots.map((s) => picks[s.id]!), pairs: { ...picks } };
    else if (needsAccomplice(variant)) acc = { killers: [picks.killer!], accomplice: picks.accomplice };
    else acc = { killers: [picks.killer!] };
    const ok = onAccuse(acc);
    if (!ok && !burnEnabled && !reduced) {
      void lights.start({ opacity: [1, 0.15, 1, 0.3, 1, 0.1, 1], transition: { duration: 0.8 } });
    }
  };

  const avatarSize = suspects.length <= 5 ? 128 : suspects.length <= 8 ? 104 : 84;
  const slotOf = (id: string) => slots.find((s) => picks[s.id] === id);
  // height chart behind the row (police line-up board): a rule every 24 px, a number every other one
  const chartRows = 9;

  return (
    <motion.div animate={lights} className="relative flex min-h-dvh flex-col items-center px-3 pb-8 pt-8 sm:px-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[var(--fp-muted)]">
          <VariantIcon variant={variant} className="size-4 text-[var(--fp-accent)]" /> {VARIANT_META[variant].name}
        </div>
        <h2
          className="mt-1 font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.01em] text-[var(--fp-ink)] sm:text-6xl"
          style={{ fontStretch: '75%' }}
        >
          The Line-up
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--fp-ink)]">
          {VARIANT_META[variant].accuse} One shot{burnEnabled ? '. A wrong name burns the file.' : '.'}
        </p>
      </div>

      {/* slots */}
      <div className="mt-5 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Accusation slots">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={activeSlot === s.id}
            onClick={() => setActiveSlot(s.id)}
            className={clsx(
              'min-w-[10rem] rounded-[6px] border-2 border-[var(--fp-ink)] px-3 py-2 text-left transition-colors',
              activeSlot === s.id ? 'bg-[var(--fp-hl)]' : 'bg-[var(--fp-panel)] hover:bg-[var(--dk-hover)]',
            )}
          >
            <div className="text-[13px] font-semibold text-[var(--fp-muted)]">{s.label}</div>
            <div className={clsx('font-display text-lg font-extrabold leading-tight', picks[s.id] ? 'text-[var(--fp-accent2)]' : 'text-[var(--fp-muted)]')}>
              {picks[s.id] ? name(picks[s.id]!) : 'Nobody yet'}
            </div>
          </button>
        ))}
      </div>

      {/* the row, in front of a height chart */}
      <div className="relative mt-6 w-full max-w-6xl overflow-hidden rounded-[8px] border-2 border-[var(--fp-ink)] bg-[var(--fp-panel)]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={{ height: chartRows * 24 }}>
          {Array.from({ length: chartRows }, (_, i) => (
            <div key={i} className="relative border-b border-[var(--fp-hair)]" style={{ height: 24 }}>
              {i % 2 === 1 && (
                <span className="absolute bottom-0.5 left-2 font-mono text-[12px] leading-none text-[var(--fp-muted)]">{(chartRows - i) * 10 + 100}</span>
              )}
            </div>
          ))}
        </div>
        <div className="relative flex gap-2 overflow-x-auto px-3 pb-3 pt-0 sm:justify-center" role="listbox" aria-label="Suspects">
          {suspects.map((p, i) => {
            const chosen = slotOf(p.id);
            const lit = hover === p.id || !!chosen;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={!!chosen}
                aria-label={`${p.name}${chosen ? ` — ${chosen.label}` : ''}`}
                onClick={() => pick(p.id)}
                onPointerEnter={() => setHover(p.id)}
                onPointerLeave={() => setHover((h) => (h === p.id ? null : h))}
                onFocus={() => setHover(p.id)}
                className="group relative flex shrink-0 flex-col items-center rounded-[6px] px-1 pt-10"
                style={{ width: avatarSize + 16 }}
              >
                <span aria-hidden className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[13px] font-semibold text-[var(--fp-muted)]">
                  {i + 1}
                </span>
                <motion.span
                  className="relative"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduced ? 0 : i * 0.04, type: 'spring', stiffness: 420, damping: 30 }}
                >
                  <Avatar spec={p.avatar} size={avatarSize} mood={chosen ? 'angry' : 'neutral'} />
                </motion.span>
                <span
                  className={clsx(
                    'relative mt-1 w-full truncate rounded-[4px] border-2 border-[var(--fp-ink)] px-1 py-0.5 text-center text-[13px] font-semibold',
                    chosen ? 'bg-[var(--fp-accent)] text-white' : lit ? 'bg-[var(--fp-hl)] text-[var(--fp-ink)]' : 'bg-[var(--fp-panel)] text-[var(--fp-ink)]',
                  )}
                >
                  {p.name}
                </span>
                <span className={clsx('relative mt-0.5 h-4 text-[12px] font-bold leading-4 text-[var(--fp-accent2)]', !chosen && 'invisible')}>
                  {chosen?.label ?? 'none'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <GhostBtn onClick={onClose} size="lg">
          Back to the plan
        </GhostBtn>
        <BrassBtn onClick={accuse} disabled={!ready} size="lg" icon={<Gavel className="size-5" />}>
          Accuse
        </BrassBtn>
      </div>
    </motion.div>
  );
}

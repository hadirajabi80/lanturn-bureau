/** The Line-up: suspects stand in a row under spotlights; pick the killer (+ accomplice / per-victim killers). */
import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { Gavel } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import type { Accusation } from '@/grid/store';
import type { Puzzle } from '@/grid/types';
import { isDouble, needsAccomplice, play, victimsOf } from './bridge';
import { BrassBtn, GhostBtn, Overlay, VariantIcon, useDeskMood } from './parts';
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
    <Overlay open={open} onClose={onClose} label="The line-up" backdrop={useDeskMood() === 'light' ? 'color-mix(in srgb, var(--fp-bg) 94%, rgb(70 30 70))' : 'rgb(3 2 2 / 0.94)'}>
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
  const light = useDeskMood() === 'light';
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

  return (
    <motion.div animate={lights} className="relative flex min-h-dvh flex-col items-center px-3 pb-8 pt-8 sm:px-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--dk-accent-text,var(--fp-accent2))]">
          <VariantIcon variant={variant} className="size-3.5" /> {VARIANT_META[variant].name}
        </div>
        <h2 className="mt-1 font-display text-3xl font-black text-[var(--fp-ink)] sm:text-4xl">The Line-up</h2>
        <p className="mt-1 text-sm text-[var(--fp-muted)]">{VARIANT_META[variant].accuse} One shot{burnEnabled ? ' — a wrong name burns the file.' : '.'}</p>
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
              'min-w-[9rem] rounded-[8px] border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]',
              activeSlot === s.id ? 'border-[var(--fp-danger)] bg-[color-mix(in_srgb,var(--fp-danger)_18%,transparent)]' : 'border-[var(--dk-line,rgb(255_255_255/0.1))] bg-[var(--dk-hover,rgb(255_255_255/0.03))]',
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fp-muted)]">{s.label}</div>
            <div className="font-display text-base font-bold text-[var(--fp-ink)]">{picks[s.id] ? name(picks[s.id]!) : '—'}</div>
          </button>
        ))}
      </div>

      {/* the row */}
      <div className="relative mt-6 w-full max-w-6xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-10 top-6 rounded-[6px] opacity-40"
          style={{ background: 'repeating-linear-gradient(180deg, transparent 0 27px, var(--dk-line, rgb(255 255 255 / 0.12)) 27px 28px)' }}
        />
        <div className="flex gap-1 overflow-x-auto px-2 pb-2 pt-0 sm:justify-center" role="listbox" aria-label="Suspects">
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
                className="group relative flex shrink-0 flex-col items-center rounded-[8px] px-1 pt-10 focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
                style={{ width: avatarSize + 16 }}
              >
                {/* light cone */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-full transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(180deg, var(--dk-cone, rgb(255 236 190 / 0.38)), color-mix(in srgb, var(--dk-cone, rgb(255 236 190)) 15%, transparent) 70%, transparent)',
                    clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
                    opacity: lit ? 1 : 0.18,
                  }}
                />
                <motion.span
                  className="relative"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduced ? 0 : i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
                  style={{ filter: lit ? 'none' : light ? 'saturate(0.55) opacity(0.7)' : 'brightness(0.55) saturate(0.7)' }}
                >
                  <Avatar spec={p.avatar} size={avatarSize} mood={chosen ? 'angry' : 'neutral'} />
                </motion.span>
                <span
                  className={clsx(
                    'relative mt-1 w-full truncate rounded-[3px] px-1 py-0.5 text-center font-mono text-[11px]',
                    chosen ? 'bg-[var(--fp-danger)] text-white' : 'bg-[var(--fp-panel)] text-[var(--fp-ink)]',
                  )}
                >
                  {p.name}
                </span>
                {chosen && (
                  <span className="relative mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--fp-danger)]">{chosen.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <GhostBtn onClick={onClose}>Back to the plan</GhostBtn>
        <BrassBtn onClick={accuse} disabled={!ready} size="lg" icon={<Gavel className="size-4" />}>
          Accuse
        </BrassBtn>
      </div>
    </motion.div>
  );
}

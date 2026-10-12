/**
 * The Dossier: suspect photo cards (a grid on the desktop rail, a scrolling row on phones) and the
 * testimony card with a tick-box per sentence. The victim card states the scenario rule.
 */
import { Fragment, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, Info } from 'lucide-react';
import { furnitureName } from '@/grid/board/FurnitureTag';
import type { Cell, Person, Puzzle, Variant } from '@/grid/types';
import { linkClueText, linkLabel, sameLink, type ClueLink } from './clueLinks';
import { DeskLabel, Polaroid, VariantIcon } from './parts';
import { VARIANT_META } from './util';

export interface DossierProps {
  puzzle: Puzzle;
  placements: Record<string, Cell | null>;
  selectedId: string | null;
  cleared: string[];
  flagged: string[];
  layout: 'rail' | 'strip';
  onSelect: (id: string) => void;
  onToggleCleared: (id: string) => void;
}

export function Dossier({ puzzle, placements, selectedId, cleared, flagged, layout, onSelect, onToggleCleared }: DossierProps) {
  const victims = puzzle.people.filter((p) => p.isVictim);
  const suspects = puzzle.people.filter((p) => !p.isVictim);
  const placedCount = suspects.filter((p) => placements[p.id]).length;

  const card = (p: Person, size: 'sm' | 'md') => (
    <Polaroid
      key={p.id}
      person={p}
      size={size}
      victim={p.isVictim}
      selected={selectedId === p.id}
      placed={!!placements[p.id]}
      cleared={cleared.includes(p.id)}
      flagged={flagged.includes(p.id)}
      onSelect={() => onSelect(p.id)}
      onToggleCleared={p.isVictim ? undefined : () => onToggleCleared(p.id)}
    />
  );

  const count = (
    <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--fp-ink)]">
      {placedCount}/{suspects.length} pinned
    </span>
  );

  if (layout === 'strip') {
    return (
      <div className="relative border-y-2 border-[var(--fp-ink)] bg-[var(--fp-panel)]">
        <div className="flex items-baseline justify-between px-3 pt-2">
          <DeskLabel>Victim and suspects</DeskLabel>
          {count}
        </div>
        <div role="listbox" aria-label="Suspects" className="flex gap-2.5 overflow-x-auto px-3 pb-4 pt-3.5 [scrollbar-width:thin]">
          {[...victims, ...suspects].map((p) => card(p, 'sm'))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <DeskLabel className="px-1">{victims.length > 1 ? 'Victims' : 'Victim'}</DeskLabel>
      <div className="flex flex-wrap items-start gap-3 px-1 pb-5 pt-3">{victims.map((p) => card(p, 'md'))}</div>
      <div className="mb-1 flex items-baseline justify-between border-t border-[var(--fp-hair)] px-1 pt-2.5">
        <DeskLabel>Suspects</DeskLabel>
        {count}
      </div>
      <div role="listbox" aria-label="Suspects" className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] justify-items-start gap-x-2 gap-y-4 px-1 pb-3 pt-3">
        {suspects.map((p) => card(p, 'md'))}
      </div>
    </div>
  );
}

export interface SlipProps {
  puzzle: Puzzle;
  personId: string | null;
  ticks: number[];
  onToggleTick: (clueIndex: number) => void;
  onScenario: () => void;
  /** Clue ↔ board linking: the link currently lit on the plan (hover or tapped). */
  activeLink?: ClueLink | null;
  /** The tapped (sticky) link, shown pressed. */
  lockedLink?: ClueLink | null;
  onLinkHover?: (link: ClueLink | null) => void;
  onLinkTap?: (link: ClueLink) => void;
  className?: string;
}

/** A clue sentence with furniture nouns and room names as blue links that light up the plan. */
function ClueText({
  text,
  puzzle,
  activeLink,
  lockedLink,
  onLinkHover,
  onLinkTap,
}: {
  text: string;
  puzzle: Puzzle;
  activeLink?: ClueLink | null;
  lockedLink?: ClueLink | null;
  onLinkHover?: (link: ClueLink | null) => void;
  onLinkTap?: (link: ClueLink) => void;
}) {
  const segs = useMemo(() => (onLinkHover || onLinkTap ? linkClueText(text, puzzle) : [{ text }]), [text, puzzle, onLinkHover, onLinkTap]);
  return (
    <>
      {segs.map((s, i) => {
        const link = s.link;
        if (!link) return <Fragment key={i}>{s.text}</Fragment>;
        const lit = sameLink(link, activeLink);
        const pressed = sameLink(link, lockedLink);
        const label = linkLabel(link, puzzle);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={pressed}
            aria-label={`${s.text}: ${link.type === 'room' ? `show the ${label} on the plan` : `show every ${furnitureName(link.kind).toLowerCase()} on the plan`}`}
            title={`Show the ${label} on the plan`}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') onLinkHover?.(link);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') onLinkHover?.(null);
            }}
            onFocus={() => onLinkHover?.(link)}
            onBlur={() => onLinkHover?.(null)}
            onClick={(e) => {
              e.stopPropagation();
              onLinkTap?.(link);
            }}
            className={clsx(
              'inline rounded-[2px] px-[1px] font-medium text-[var(--fp-blue)] underline decoration-[1.5px] underline-offset-[3px] transition-colors',
              link.type === 'room' ? 'decoration-dotted' : 'decoration-solid',
              lit ? 'bg-[var(--fp-hl)] text-[var(--fp-ink)]' : 'hover:bg-[color-mix(in_srgb,var(--fp-hl)_55%,transparent)]',
            )}
            style={{ textDecorationLine: 'underline' }}
          >
            {s.text}
          </button>
        );
      })}
    </>
  );
}

/** White testimony card: the selected person's sentences, one tick-box per line. */
export function TestimonySlip({ puzzle, personId, ticks, onToggleTick, onScenario, activeLink, lockedLink, onLinkHover, onLinkTap, className }: SlipProps) {
  const person = puzzle.people.find((p) => p.id === personId) ?? null;
  const variant: Variant = puzzle.variant ?? 'classic';
  const lines = puzzle.clues.map((c, i) => ({ ...c, i })).filter((c) => c.personId === personId);
  return (
    <div className={clsx('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {person ? (
          <motion.div
            key={person.id}
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="fp-panel relative overflow-hidden text-[var(--fp-ink)]"
            aria-live="polite"
          >
            <div
              className={clsx(
                'flex items-center gap-2 border-b-2 border-[var(--fp-ink)] px-3.5 py-2.5',
                person.isVictim ? 'bg-[#F4DEDC]' : 'bg-[var(--fp-panel)]',
              )}
            >
              {person.isVictim && (
                <span className="grid size-7 shrink-0 place-items-center rounded-[4px] border-2 border-[var(--fp-ink)] bg-[var(--fp-danger)] text-white">
                  <VariantIcon variant={variant} className="size-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className={clsx('text-[12px] font-semibold leading-tight', person.isVictim ? 'text-[var(--fp-accent2)]' : 'text-[var(--fp-muted)]')}>
                  {person.isVictim ? 'Victim' : 'Testimony'}
                </div>
                <div className="truncate font-display text-lg font-extrabold leading-tight tracking-[-0.02em]">{person.name}</div>
              </div>
              {person.isVictim && (
                <button type="button" onClick={onScenario} className="fp-ghost h-8 shrink-0 gap-1 px-2.5 text-[13px]">
                  <Info className="size-3.5" /> Scenario
                </button>
              )}
            </div>
            <ul className="divide-y divide-[var(--fp-hair)] px-3.5 py-1">
              {lines.map((l) => {
                const done = ticks.includes(l.i);
                return (
                  <li key={l.i} className="group flex w-full items-start gap-2.5 py-2 text-left">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={l.text}
                      onClick={() => onToggleTick(l.i)}
                      className={clsx(
                        'mt-[2px] grid size-[18px] shrink-0 place-items-center rounded-[3px] border-2 border-[var(--fp-ink)] transition-colors',
                        done ? 'bg-[var(--fp-ink)] text-white' : 'bg-[var(--fp-panel)] group-hover:bg-[var(--dk-hover)]',
                      )}
                    >
                      {done && <Check className="size-3" strokeWidth={3.5} />}
                    </button>
                    <span
                      onClick={() => onToggleTick(l.i)}
                      className={clsx(
                        'cursor-pointer text-[15px] leading-[1.45]',
                        done && 'text-[var(--fp-muted)] line-through decoration-[var(--fp-ink)] decoration-1',
                      )}
                    >
                      <ClueText text={l.text} puzzle={puzzle} activeLink={activeLink} lockedLink={lockedLink} onLinkHover={onLinkHover} onLinkTap={onLinkTap} />
                    </span>
                  </li>
                );
              })}
            </ul>
            {person.isVictim && (
              <p className="mx-3.5 mb-3 border-t-2 border-[var(--fp-ink)] pt-2 text-[13px] leading-snug text-[var(--fp-ink)]">
                <span className="font-bold">{VARIANT_META[variant].name}.</span> {VARIANT_META[variant].accuse}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[8px] border-2 border-dashed border-[var(--fp-muted)] px-4 py-6 text-center text-[15px] text-[var(--fp-muted)]"
          >
            Pick a suspect card to read their testimony.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

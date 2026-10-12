/**
 * The Dossier: suspect polaroids (vertical rail on desktop, film strip on phones) and the
 * sliding testimony slip with a tick-box per sentence. The victim slip states the scenario rule.
 */
import { Fragment, useMemo, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, Info } from 'lucide-react';
import { furnitureName } from '@/grid/board/FurnitureTag';
import type { Cell, Person, Puzzle, Variant } from '@/grid/types';
import { linkClueText, linkLabel, sameLink, type ClueLink } from './clueLinks';
import { Polaroid, VariantIcon, useDeskMood } from './parts';
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

const tiltFor = (i: number) => ((i * 7) % 5) - 2;

/** Slip palettes: aged paper at night, pastel stationery in the light districts. */
function slipStyle(light: boolean, victim: boolean): CSSProperties {
  if (light) {
    return {
      '--sl-ink': 'var(--fp-ink)',
      '--sl-on-ink': '#ffffff',
      '--sl-muted': 'var(--fp-muted)',
      '--sl-box': 'var(--fp-accent)',
      '--sl-accent': 'var(--fp-danger)',
      background: victim
        ? 'radial-gradient(circle at 12px 12px, color-mix(in srgb, var(--fp-danger) 18%, transparent) 2px, transparent 2.5px) 0 0/16px 16px, linear-gradient(180deg, color-mix(in srgb, var(--fp-danger) 10%, white), color-mix(in srgb, var(--fp-accent) 10%, white))'
        : 'repeating-linear-gradient(180deg, transparent 0 25px, color-mix(in srgb, var(--fp-accent) 22%, transparent) 25px 26px), linear-gradient(180deg, color-mix(in srgb, var(--fp-accent2) 10%, white), color-mix(in srgb, var(--fp-accent) 8%, white))',
      boxShadow: '0 10px 24px -14px var(--dk-shadow), inset 0 0 0 1px color-mix(in srgb, var(--fp-accent) 20%, transparent)',
    } as CSSProperties;
  }
  return {
    '--sl-ink': '#2a2117',
    '--sl-on-ink': '#f3ead8',
    '--sl-muted': '#8a7458',
    '--sl-box': '#5a4733',
    '--sl-accent': '#7d1c16',
    background: victim
      ? 'linear-gradient(180deg,#efe2cf,#e4d2b9)'
      : 'repeating-linear-gradient(180deg, transparent 0 25px, rgb(90 120 160 / 0.16) 25px 26px), linear-gradient(180deg,#f3ead8,#e9dcc2)',
  } as CSSProperties;
}

const STRIP_NIGHT =
  'repeating-linear-gradient(90deg, #0b0907 0 10px, transparent 10px 22px) top/100% 6px no-repeat, repeating-linear-gradient(90deg, #0b0907 0 10px, transparent 10px 22px) bottom/100% 6px no-repeat, #15110d';
const STRIP_LIGHT =
  'repeating-linear-gradient(90deg, white 0 10px, transparent 10px 22px) top/100% 6px no-repeat, repeating-linear-gradient(90deg, white 0 10px, transparent 10px 22px) bottom/100% 6px no-repeat, color-mix(in srgb, var(--fp-accent) 22%, var(--fp-bg))';

export function Dossier({ puzzle, placements, selectedId, cleared, flagged, layout, onSelect, onToggleCleared }: DossierProps) {
  const victims = puzzle.people.filter((p) => p.isVictim);
  const suspects = puzzle.people.filter((p) => !p.isVictim);
  const placedCount = suspects.filter((p) => placements[p.id]).length;
  const light = useDeskMood() === 'light';

  const card = (p: Person, i: number, size: 'sm' | 'md') => (
    <Polaroid
      key={p.id}
      person={p}
      size={size}
      victim={p.isVictim}
      selected={selectedId === p.id}
      placed={!!placements[p.id]}
      cleared={cleared.includes(p.id)}
      flagged={flagged.includes(p.id)}
      tilt={tiltFor(i)}
      onSelect={() => onSelect(p.id)}
      onToggleCleared={p.isVictim ? undefined : () => onToggleCleared(p.id)}
    />
  );

  if (layout === 'strip') {
    return (
      <div className="relative">
        <div
          role="listbox"
          aria-label="Suspects"
          className="flex gap-2.5 overflow-x-auto px-3 pb-3 pt-3 [scrollbar-width:thin]"
          style={{ background: light ? STRIP_LIGHT : STRIP_NIGHT }}
        >
          {[...victims, ...suspects].map((p, i) => card(p, i, 'sm'))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="relative flex flex-wrap items-start justify-center gap-3 pb-4 pt-2">
        {victims.map((p, i) => card(p, i, 'md'))}
        <svg aria-hidden className="pointer-events-none absolute inset-x-4 bottom-0 h-4" preserveAspectRatio="none" viewBox="0 0 100 10">
          <path d="M0 2 Q 50 12 100 2" fill="none" stroke="var(--fp-danger)" strokeWidth="0.8" strokeDasharray="0" />
        </svg>
      </div>
      <div className="mb-2 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fp-muted)]">
        <span>Suspects</span>
        <span className="font-mono tracking-normal">
          {placedCount}/{suspects.length} pinned
        </span>
      </div>
      <div role="listbox" aria-label="Suspects" className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] justify-items-center gap-x-2 gap-y-3 px-1 pb-2 pt-1">
        {suspects.map((p, i) => card(p, i + 1, 'md'))}
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

/** A clue sentence with furniture nouns and room names as chips that light up the plan. */
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
              'inline rounded-[3px] px-[2px] font-mono text-[13px] leading-[1.45] underline decoration-dotted decoration-[1.5px] underline-offset-[3px] transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sl-accent)]',
              link.type === 'room' ? 'decoration-[var(--sl-muted)]' : 'decoration-[var(--sl-box)]',
              lit
                ? 'bg-[color-mix(in_srgb,var(--sl-accent)_18%,transparent)] decoration-[var(--sl-accent)]'
                : 'hover:bg-[color-mix(in_srgb,var(--sl-box)_14%,transparent)]',
            )}
            style={{ color: 'inherit', textDecorationLine: 'underline' }}
          >
            {s.text}
          </button>
        );
      })}
    </>
  );
}

/** Paper slip with the selected person's sentences (typewriter face, tick-box per line). */
export function TestimonySlip({ puzzle, personId, ticks, onToggleTick, onScenario, activeLink, lockedLink, onLinkHover, onLinkTap, className }: SlipProps) {
  const person = puzzle.people.find((p) => p.id === personId) ?? null;
  const variant: Variant = puzzle.variant ?? 'classic';
  const lines = puzzle.clues.map((c, i) => ({ ...c, i })).filter((c) => c.personId === personId);
  const light = useDeskMood() === 'light';
  return (
    <div className={clsx('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {person ? (
          <motion.div
            key={person.id}
            initial={{ x: -24, opacity: 0, rotate: -1.5 }}
            animate={{ x: 0, opacity: 1, rotate: person.isVictim ? 0.6 : -0.4 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative rounded-[3px] px-4 pb-4 pt-3 text-[var(--sl-ink)] shadow-[0_14px_30px_-16px_var(--dk-shadow,rgb(0_0_0/0.9))]"
            style={slipStyle(light, person.isVictim)}
            aria-live="polite"
          >
            <div className="mb-1.5 flex items-center gap-2">
              {person.isVictim && (
                <span className="grid size-6 place-items-center rounded-full bg-[var(--sl-accent)] text-white">
                  <VariantIcon variant={variant} className="size-3.5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--sl-muted)]">
                  {person.isVictim ? 'Victim · scenario' : 'Testimony'}
                </div>
                <div className="truncate font-display text-lg font-bold leading-tight">{person.name}</div>
              </div>
              {person.isVictim && (
                <button
                  type="button"
                  onClick={onScenario}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--sl-ink)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-on-ink)] hover:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--sl-accent)]"
                >
                  <Info className="size-3" /> Scenario
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {lines.map((l) => {
                const done = ticks.includes(l.i);
                return (
                  <li key={l.i} className="group flex w-full items-start gap-2 rounded-[3px] px-0.5 py-0.5 text-left">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={l.text}
                      onClick={() => onToggleTick(l.i)}
                      className={clsx(
                        'mt-[3px] grid size-[15px] shrink-0 place-items-center rounded-[2px] border-[1.5px] border-[var(--sl-box)] transition-colors',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]',
                        done ? 'bg-[var(--sl-box)] text-[var(--sl-on-ink)]' : 'group-hover:bg-[color-mix(in_srgb,var(--sl-box)_12%,transparent)]',
                      )}
                    >
                      {done && <Check className="size-3" strokeWidth={3.5} />}
                    </button>
                    <span
                      onClick={() => onToggleTick(l.i)}
                      className={clsx('cursor-pointer font-mono text-[13px] leading-[1.45]', done && 'text-[var(--sl-muted)] line-through decoration-[var(--sl-accent)]')}
                    >
                      <ClueText text={l.text} puzzle={puzzle} activeLink={activeLink} lockedLink={lockedLink} onLinkHover={onLinkHover} onLinkTap={onLinkTap} />
                    </span>
                  </li>
                );
              })}
            </ul>
            {person.isVictim && (
              <p className="mt-2 border-t border-dashed border-[var(--sl-muted)] pt-2 text-[11px] leading-snug text-[var(--sl-muted)]">
                <span className="font-semibold">{VARIANT_META[variant].name}.</span> {VARIANT_META[variant].accuse}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[6px] border border-dashed border-[var(--fp-hair)] px-4 py-6 text-center text-sm text-[var(--fp-muted)]"
          >
            Pick a polaroid to read their testimony.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

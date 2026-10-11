/**
 * Desk-local pieces built on the Floorplan design system (`@/grid/ui`): the skinned night desk,
 * button aliases, overlays, polaroids, variant icons and the Board wrapper.
 */
import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { MapPin, X } from 'lucide-react';
import { Avatar, luminance } from '@/components/avatar';
import { Board, type BoardProps } from '@/grid/board';
import { DISTRICTS, getDistrict } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import type { Person, Puzzle, Variant } from '@/grid/types';
import { BrassButton, DeskBackground, GhostButton, SkinProvider, VariantGlyph } from '@/grid/ui';

// ─────────────────────────── skin ───────────────────────────

export function districtFor(puzzle: Pick<Puzzle, 'seasonId' | 'skinId'> | null | undefined): District {
  return (
    (puzzle?.skinId ? getDistrict(puzzle.skinId) : undefined) ??
    (puzzle ? getDistrict(puzzle.seasonId) : undefined) ??
    DISTRICTS[0]!
  );
}

// ─────────────────────────── mood (night / light districts) ───────────────────────────

export type DeskMood = 'night' | 'light';

/** 'light' for the pastel daytime districts (explicit `mood`, else palette.bg luminance). */
export function moodOf(d: District): DeskMood {
  if (d.mood) return d.mood;
  return luminance(d.palette.bg) > 0.45 ? 'light' : 'night';
}

const MoodContext = createContext<DeskMood>('night');
/** Current desk mood (inside a DeskFrame). */
export const useDeskMood = (): DeskMood => useContext(MoodContext);

/**
 * Desk-level tokens on top of the --fp-* palette, so every piece reads right on dark and light:
 * --dk-shade (inset wells), --dk-hover, --dk-line (hairlines), --dk-shadow (drop shadows),
 * --dk-backdrop (overlay scrim), --dk-cone (spotlight light), --dk-paper (testimony stationery).
 */
export function deskVars(mood: DeskMood): CSSProperties {
  return (mood === 'light'
    ? {
        '--dk-shade': 'color-mix(in srgb, var(--fp-ink) 6%, transparent)',
        '--dk-hover': 'color-mix(in srgb, var(--fp-accent) 12%, transparent)',
        '--dk-line': 'color-mix(in srgb, var(--fp-ink) 14%, transparent)',
        '--dk-shadow': 'color-mix(in srgb, var(--fp-accent) 28%, rgb(90 60 90 / 0.25))',
        '--dk-backdrop': 'color-mix(in srgb, var(--fp-bg) 80%, transparent)',
        '--dk-cone': 'color-mix(in srgb, var(--fp-accent2) 55%, white)',
        '--dk-paper': 'linear-gradient(180deg, color-mix(in srgb, var(--fp-accent) 9%, white), color-mix(in srgb, var(--fp-accent2) 12%, white))',
        '--dk-paper-ink': 'var(--fp-ink)',
        '--dk-accent-text': 'color-mix(in srgb, var(--fp-accent) 70%, var(--fp-ink))',
      }
    : {
        '--dk-shade': 'rgb(0 0 0 / 0.25)',
        '--dk-hover': 'rgb(255 255 255 / 0.06)',
        '--dk-line': 'rgb(255 255 255 / 0.1)',
        '--dk-shadow': 'rgb(0 0 0 / 0.8)',
        '--dk-backdrop': 'rgb(4 3 2 / 0.78)',
        '--dk-cone': 'rgb(255 236 190 / 0.38)',
        '--dk-paper': 'linear-gradient(180deg,#f3ead8,#e9dcc2)',
        '--dk-paper-ink': '#2a2117',
        '--dk-accent-text': 'var(--fp-accent2)',
      }) as CSSProperties;
}

/** The desk page: SkinProvider (--fp-* vars) + mood tokens + DeskBackground (lamp, grain, dust). */
export function DeskFrame({
  district,
  lampFollow = true,
  children,
  className,
}: {
  district: District;
  lampFollow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const mood = moodOf(district);
  return (
    <MoodContext.Provider value={mood}>
      <SkinProvider
        district={district}
        className={clsx('relative isolate min-h-dvh w-full overflow-x-clip font-sans', className)}
        style={{ background: 'var(--fp-bg)', ...deskVars(mood) }}
      >
        <DeskBackground dust lamp={lampFollow ? 1 : 0.7} />
        <div className="relative" data-mood={mood}>
          {children}
        </div>
      </SkinProvider>
    </MoodContext.Provider>
  );
}

// ─────────────────────────── panels & buttons ───────────────────────────

export function PanelBox({
  children,
  className,
  style,
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'aside' | 'header';
}) {
  return (
    <As style={style} className={clsx('fp-panel', className)}>
      {children}
    </As>
  );
}

/** Aliases of the design-system buttons (brass plate primary, ghost secondary). */
export const BrassBtn = BrassButton;
export const GhostBtn = GhostButton;

const BRASS_BG = 'linear-gradient(180deg, #f6dc9a 0%, #d6a752 42%, #a8792f 58%, #8b6224 100%)';
const CANDY_BG =
  'linear-gradient(180deg, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0) 55%), linear-gradient(100deg, color-mix(in srgb, var(--fp-accent) 55%, white), color-mix(in srgb, var(--fp-accent2) 60%, white))';

export function MonoClock({ ms, warn, className, label }: { ms: string; warn?: boolean; className?: string; label?: string }) {
  const light = useDeskMood() === 'light';
  return (
    <div
      role="timer"
      aria-label={label ?? 'Elapsed time'}
      className={clsx(
        'rounded-[8px] px-3 py-1.5 text-center font-mono text-base font-semibold tabular-nums tracking-wider',
        warn ? (light ? 'text-white' : 'text-[#ffb4a8]') : light ? 'text-[var(--fp-ink)]' : 'text-[#2b1b08]',
        className,
      )}
      style={{
        background: warn
          ? light
            ? 'linear-gradient(180deg, var(--fp-danger), color-mix(in srgb, var(--fp-danger) 70%, black))'
            : 'linear-gradient(180deg,#7a2018,#4a120d)'
          : light
            ? CANDY_BG
            : BRASS_BG,
        boxShadow: light
          ? 'inset 0 1px 0 rgb(255 255 255 / 0.8), 0 4px 12px -6px var(--dk-shadow)'
          : 'inset 0 1px 0 rgb(255 250 230 / 0.5), inset 0 -2px 0 rgb(0 0 0 / 0.25)',
      }}
    >
      {ms}
    </div>
  );
}

// ─────────────────────────── overlay ───────────────────────────

/** Full-screen overlay with Esc to close and focus moved inside. */
export function Overlay({
  open,
  onClose,
  label,
  children,
  className,
  backdrop = 'var(--dk-backdrop, rgb(4 3 2 / 0.78))',
}: {
  open: boolean;
  onClose?: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  backdrop?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const token = {};
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const root = ref.current;
      const el =
        root?.querySelector<HTMLElement>('[data-autofocus]') ?? root?.querySelector<HTMLElement>('button, [href], input');
      el?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeRef.current && overlayStack[overlayStack.length - 1] === token) {
        e.stopPropagation();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    overlayStack.push(token);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      overlayStack = overlayStack.filter((x) => x !== token);
      prev?.focus?.();
    };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          data-desk-overlay
          className={clsx('fixed inset-0 z-[80] overflow-y-auto', className)}
          style={{ background: backdrop }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

let overlayStack: object[] = [];
/** True while any desk overlay (line-up, burn, confirm, explainer…) is open — they own the keyboard. */
export const anyOverlayOpen = () => overlayStack.length > 0;

// ─────────────────────────── variant icon ───────────────────────────

export function VariantIcon({ variant, className, size = 16 }: { variant: Variant; className?: string; size?: number }) {
  return <VariantGlyph variant={variant} size={size} className={className} />;
}

// ─────────────────────────── polaroid ───────────────────────────

export function Polaroid({
  person,
  selected,
  placed,
  cleared,
  victim,
  flagged,
  size = 'md',
  onSelect,
  onToggleCleared,
  tilt = 0,
}: {
  person: Person;
  selected?: boolean;
  placed?: boolean;
  cleared?: boolean;
  victim?: boolean;
  flagged?: boolean;
  size?: 'sm' | 'md';
  onSelect?: () => void;
  onToggleCleared?: () => void;
  tilt?: number;
}) {
  const av = size === 'sm' ? 46 : 58;
  const light = useDeskMood() === 'light';
  return (
    <motion.div
      layout="position"
      className="group relative shrink-0"
      animate={flagged ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      style={{ rotate: selected ? 0 : tilt }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${victim ? 'Victim' : 'Suspect'} ${person.name}${placed ? ', pinned' : ''}${cleared ? ', cleared' : ''}`}
        className={clsx(
          'relative flex flex-col items-center rounded-[3px] px-1.5 pb-1.5 pt-1.5 transition-[transform,box-shadow] duration-200',
          light ? 'bg-white text-[var(--fp-ink)]' : 'bg-[#f4efe4] text-[#2a241c]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fp-accent2)]',
          selected ? '-translate-y-1' : 'hover:-translate-y-0.5',
        )}
        style={{
          width: av + 14,
          boxShadow: flagged
            ? '0 0 0 2px var(--fp-danger)'
            : selected
              ? '0 0 0 2px var(--fp-accent), 0 14px 24px -10px var(--dk-shadow)'
              : '0 6px 14px -6px var(--dk-shadow)',
        }}
      >
        <span
          className="block overflow-hidden rounded-[2px]"
          style={{
            width: av,
            height: av,
            background: light
              ? victim
                ? 'linear-gradient(160deg, color-mix(in srgb, var(--fp-danger) 25%, white), color-mix(in srgb, var(--fp-danger) 10%, white))'
                : 'linear-gradient(160deg, color-mix(in srgb, var(--fp-accent) 22%, white), color-mix(in srgb, var(--fp-accent2) 22%, white))'
              : victim
                ? 'linear-gradient(160deg,#3a1d1d,#1b0e0e)'
                : 'linear-gradient(160deg,#36404d,#1a1f27)',
            filter: victim ? (light ? 'grayscale(0.45)' : 'grayscale(0.7) sepia(0.3)') : undefined,
          }}
        >
          <Avatar spec={person.avatar} size={av} mood={victim ? 'sad' : 'neutral'} />
        </span>
        <span className="mt-1 block w-full truncate text-center font-display text-[11px] italic leading-tight">
          {person.name}
        </span>
        {placed &&
          (light ? (
            <span
              aria-hidden
              className="absolute -top-2 left-1/2 h-3.5 w-9 -translate-x-1/2 -rotate-6 rounded-[2px] opacity-90"
              style={{
                background:
                  'repeating-linear-gradient(45deg, color-mix(in srgb, var(--fp-accent) 55%, white) 0 4px, color-mix(in srgb, var(--fp-accent2) 45%, white) 4px 8px)',
                boxShadow: '0 1px 3px rgb(0 0 0 / 0.12)',
              }}
            />
          ) : (
            <span
              aria-hidden
              className="absolute -top-2 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 30%, #fff1c2, #d4a857 45%, #7a5520)' }}
            >
              <MapPin className="size-2.5 text-[#3a2508]" strokeWidth={3} />
            </span>
          ))}
        {cleared && (
          <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-2 opacity-85">
            <path d="M6 6 L34 34 M34 6 L6 34" stroke="#c0281f" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {victim && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-sm bg-[var(--fp-danger)] px-1 text-[8px] font-bold uppercase tracking-wider text-white">
            victim
          </span>
        )}
      </button>
      {onToggleCleared && !victim && (
        <button
          type="button"
          onClick={onToggleCleared}
          aria-label={cleared ? `Un-clear ${person.name}` : `Mark ${person.name} as cleared`}
          title={cleared ? 'Un-clear' : 'Mark as cleared'}
          className={clsx(
            'absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[var(--fp-panel)] text-[var(--fp-danger)] ring-1 ring-[var(--dk-line)] transition-opacity',
            'opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
            cleared && 'opacity-100',
          )}
        >
          <X className="size-3" strokeWidth={3} />
        </button>
      )}
    </motion.div>
  );
}


// ─────────────────────────── board ───────────────────────────

export type DeskBoardProps = BoardProps;

export function DeskBoard(props: DeskBoardProps) {
  return <Board {...props} />;
}

/**
 * Desk-local pieces built on the Floorplan design system (`@/grid/ui`), in the printed case-file
 * look (docs/PRINT-DESIGN.md): the paper desk, button aliases, overlays, suspect photo cards,
 * variant icons and the Board wrapper.
 */
import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Avatar, luminance } from '@/components/avatar';
import { Board, type BoardProps } from '@/grid/board';
import { DISTRICTS, getDistrict } from '@/grid/skins/districts';
import type { District } from '@/grid/skins/types';
import type { Person, Puzzle, Variant } from '@/grid/types';
import { BrassButton, DeskBackground, GhostButton, PRINT, SkinProvider, VariantGlyph } from '@/grid/ui';

// ─────────────────────────── skin ───────────────────────────

export function districtFor(puzzle: Pick<Puzzle, 'seasonId' | 'skinId'> | null | undefined): District {
  return (
    (puzzle?.skinId ? getDistrict(puzzle.skinId) : undefined) ??
    (puzzle ? getDistrict(puzzle.seasonId) : undefined) ??
    DISTRICTS[0]!
  );
}

// ─────────────────────────── mood (kept for callers; the UI is the same printed look everywhere) ───────────────────────────

export type DeskMood = 'night' | 'light';

/** 'light' for the pastel daytime districts (explicit `mood`, else palette.bg luminance). Flavour only. */
export function moodOf(d: District): DeskMood {
  if (d.mood) return d.mood;
  return luminance(d.palette.bg) > 0.45 ? 'light' : 'night';
}

const MoodContext = createContext<DeskMood>('night');
/** Current desk mood (inside a DeskFrame). The chrome does not change with it any more. */
export const useDeskMood = (): DeskMood => useContext(MoodContext);

/**
 * Desk-level tokens on top of the --fp-* palette. v3: one printed palette for every district.
 * --dk-shade (inset wells), --dk-hover, --dk-line (rules), --dk-shadow (hard shadow colour),
 * --dk-backdrop (overlay scrim), --dk-paper (testimony card), --dk-accent-text (red text on white).
 */
export function deskVars(_mood?: DeskMood): CSSProperties {
  return {
    '--dk-shade': '#EBEBE5',
    '--dk-hover': 'color-mix(in srgb, var(--fp-hl) 45%, white)',
    '--dk-line': 'var(--fp-hair, #D9D9D2)',
    '--dk-shadow': 'var(--fp-ink)',
    '--dk-backdrop': 'rgb(241 241 236 / 0.94)',
    '--dk-cone': 'transparent',
    '--dk-paper': 'var(--fp-panel)',
    '--dk-paper-ink': 'var(--fp-ink)',
    '--dk-accent-text': 'var(--fp-accent2)',
  } as CSSProperties;
}

/** The desk page: SkinProvider (--fp-* vars) + desk tokens + the graph-paper background. */
export function DeskFrame({
  district,
  children,
  className,
}: {
  district: District;
  /** v2 option (lamp follows the cursor); the paper desk has no lamp. */
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
        <DeskBackground />
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

/** Aliases of the design-system buttons (red primary, white outlined secondary). */
export const BrassBtn = BrassButton;
export const GhostBtn = GhostButton;

/** Small muted section label (sentence case, never tracked caps). */
export function DeskLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('text-[13px] font-semibold leading-tight text-[var(--fp-muted)]', className)}>{children}</div>;
}

/** Timer: mono digits in an ink-bordered box; red when time is running out. */
export function MonoClock({ ms, warn, className, label }: { ms: string; warn?: boolean; className?: string; label?: string }) {
  return (
    <div
      role="timer"
      aria-label={label ?? 'Elapsed time'}
      className={clsx(
        'rounded-[6px] border-2 border-[var(--fp-ink)] px-3 py-1.5 text-center font-mono text-base font-semibold tabular-nums',
        warn ? 'bg-[var(--fp-accent)] text-white' : 'bg-[var(--fp-panel)] text-[var(--fp-ink)]',
        className,
      )}
    >
      {ms}
    </div>
  );
}

/** White square toolbar button with an ink outline; `pressed` = yellow highlighter. */
export function SquareBtn({
  label,
  title,
  onClick,
  disabled,
  pressed,
  children,
  className,
}: {
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      className={clsx(
        'grid size-9 shrink-0 place-items-center rounded-[6px] border-2 border-[var(--fp-ink)] text-[var(--fp-ink)] transition-[background,transform] duration-100 active:translate-y-px',
        'disabled:cursor-not-allowed disabled:border-[#9A9A94] disabled:bg-[var(--fp-grey,#C9C9C3)] disabled:text-[#6B6B66] disabled:active:translate-y-0',
        pressed ? 'bg-[var(--fp-hl)]' : 'bg-[var(--fp-panel)] enabled:hover:bg-[var(--dk-hover)]',
        className,
      )}
    >
      {children}
    </button>
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
  backdrop = 'var(--dk-backdrop, rgb(241 241 236 / 0.94))',
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
          style={{ background: backdrop, paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
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

/** The white sheet a dialog sits on: ink border, hard shadow. */
export const SHEET_CLASS = 'fp-panel fp-panel--glow';

// ─────────────────────────── variant icon ───────────────────────────

export function VariantIcon({ variant, className, size = 16 }: { variant: Variant; className?: string; size?: number }) {
  return <VariantGlyph variant={variant} size={size} className={className} />;
}

// ─────────────────────────── suspect photo card ───────────────────────────

/** Map pin in the print palette: red head, ink outline (marks a pinned suspect). */
function PinMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 20" className={className}>
      <path d="M8 19 L8 11" stroke={PRINT.ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="7" r="5.5" fill={PRINT.red} stroke={PRINT.ink} strokeWidth="2" />
    </svg>
  );
}

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
  /** v2 option (scattered tilt); the printed cards sit square. */
  tilt?: number;
}) {
  const av = size === 'sm' ? 46 : 58;
  return (
    <motion.div
      layout="position"
      className="group relative shrink-0"
      animate={flagged ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${victim ? 'Victim' : 'Suspect'} ${person.name}${placed ? ', pinned' : ''}${cleared ? ', cleared' : ''}`}
        className={clsx(
          'relative flex flex-col items-center rounded-[5px] px-[5px] pt-[5px] text-[var(--fp-ink)] transition-[transform,background,box-shadow] duration-150',
          victim ? 'pb-4' : 'pb-1.5',
          selected ? '-translate-y-0.5 bg-[var(--fp-hl)]' : 'bg-[var(--fp-panel)] hover:-translate-y-0.5',
        )}
        style={{
          width: av + 14,
          boxShadow: flagged
            ? `inset 0 0 0 3px ${PRINT.red}`
            : selected
              ? `inset 0 0 0 3px ${PRINT.ink}, 3px 3px 0 ${PRINT.ink}`
              : `inset 0 0 0 2px ${PRINT.ink}`,
        }}
      >
        <span
          className="block overflow-hidden rounded-[3px]"
          style={{
            width: av,
            height: av,
            background: victim ? '#F4DEDC' : '#E6E6DF',
            boxShadow: `inset 0 0 0 1.5px ${PRINT.ink}`,
            filter: victim ? 'grayscale(0.6)' : undefined,
          }}
        >
          <Avatar spec={person.avatar} size={av} mood={victim ? 'sad' : 'neutral'} />
        </span>
        <span className="mt-1 block w-full truncate text-center text-[12px] font-semibold leading-tight">{person.name}</span>
        {placed && <PinMark className="absolute -top-2.5 left-1/2 h-5 w-4 -translate-x-1/2" />}
        {cleared && (
          <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-2 opacity-90">
            <path d="M6 6 L34 34 M34 6 L6 34" stroke={PRINT.red} strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        )}
        {victim && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-[3px] bg-[var(--fp-danger)] px-1.5 text-[12px] font-bold leading-[18px] text-white shadow-[inset_0_0_0_1.5px_var(--fp-ink)]">
            Victim
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
            'absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-[var(--fp-ink)] transition-opacity',
            cleared ? 'bg-[var(--fp-accent)] text-white opacity-100' : 'bg-[var(--fp-panel)] text-[var(--fp-danger)] opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
          )}
        >
          <X className="size-3.5" strokeWidth={3} />
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

/** The board on the paper like a pinned print: white mat, ink border, hard shadow, two bits of tape. */
export function PlanFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('relative rounded-[4px] bg-[var(--fp-panel)] p-1.5 sm:p-2', className)} style={{ boxShadow: `inset 0 0 0 2px ${PRINT.ink}, 5px 5px 0 ${PRINT.ink}` }}>
      <span aria-hidden className="absolute -top-2.5 left-6 z-10 h-5 w-14 -rotate-3 rounded-[2px] border-[1.5px] border-[var(--fp-ink)] bg-[#E6E6DF]" />
      <span aria-hidden className="absolute -top-2.5 right-6 z-10 h-5 w-14 rotate-2 rounded-[2px] border-[1.5px] border-[var(--fp-ink)] bg-[#E6E6DF]" />
      {children}
    </div>
  );
}

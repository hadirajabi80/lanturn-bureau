/**
 * Instruments: Pin / Pencil / Grease pencil / Rubber, Ask Otto, Reveal, Undo/Redo, the brass
 * timer and the CLOSE THE CASE lever. Column layout on desktop, a brass dock on phones.
 */
import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { Eraser, Eye, Lightbulb, MapPin, MessageCircleQuestion, Pencil, PenLine, Redo2, Stamp, Tag, Undo2 } from 'lucide-react';
import type { DeskTool } from '@/grid/store';
import { MonoClock, useDeskMood } from './parts';

export const TOOLS: { id: DeskTool; label: string; short: string; key: string; icon: typeof MapPin; hint: string }[] = [
  { id: 'pin', label: 'Brass pin', short: 'Pin', key: '1', icon: MapPin, hint: 'Pin the selected suspect onto a square' },
  { id: 'pencil', label: 'Pencil', short: 'Pencil', key: '2', icon: Pencil, hint: 'Pencil a candidate note' },
  { id: 'cross', label: 'Grease pencil', short: 'Cross', key: '3', icon: PenLine, hint: 'Red X for the selected suspect (Alt / long-press: everyone)' },
  { id: 'erase', label: 'Rubber', short: 'Rubber', key: '4', icon: Eraser, hint: 'Erase pins and marks in a square' },
];

export interface InstrumentsProps {
  tool: DeskTool;
  onTool: (t: DeskTool) => void;
  disabled: boolean;
  onOtto: () => void;
  ottoCount: number;
  ottoLeft?: number | null;
  onReveal?: () => void;
  revealCount: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clock: string | null;
  clockWarn?: boolean;
  clockLabel?: string;
  pinned: number;
  total: number;
  phase: 'placing' | 'accusing' | 'solved' | 'burned';
  onLever: () => void;
  crossesAll: boolean;
  onToggleCrossesAll: () => void;
  /** "Name labels": tiny captions under every piece of furniture */
  furnitureLabels?: boolean;
  onToggleFurnitureLabels?: () => void;
}

function ToolButton({
  active,
  disabled,
  onClick,
  label,
  title,
  kbd,
  children,
  compact,
  danger,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  title: string;
  kbd?: string;
  children: ReactNode;
  compact?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={title}
      title={kbd ? `${title} (${kbd})` : title}
      className={clsx(
        'relative flex items-center rounded-[8px] transition-[background,box-shadow,color] duration-150 disabled:opacity-40',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--fp-accent2)]',
        compact ? 'h-14 min-w-12 flex-1 flex-col justify-center gap-0.5 px-1' : 'h-11 w-full gap-3 px-3',
        active
          ? 'bg-[color-mix(in_srgb,var(--fp-accent)_22%,transparent)] text-[var(--fp-ink)] shadow-[inset_0_0_0_1px_var(--fp-accent)]'
          : 'text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.06))] hover:text-[var(--fp-ink)]',
        danger && active && 'text-[var(--fp-danger)]',
      )}
    >
      {children}
      <span className={clsx(compact ? 'text-[9px] font-semibold uppercase tracking-wider' : 'flex-1 text-left text-sm font-medium')}>
        {label}
      </span>
      {kbd && !compact && (
        <kbd className="rounded border border-[var(--dk-line,rgb(255_255_255/0.1))] px-1.5 font-mono text-[10px] text-[var(--fp-muted)]">{kbd}</kbd>
      )}
    </button>
  );
}


/** Brass lever at night, a pink/mint candy lever in the light districts. */
function leverSkin(light: boolean) {
  return light
    ? {
        compactBg:
          'repeating-linear-gradient(135deg, color-mix(in srgb, var(--fp-accent) 70%, white) 0 8px, white 8px 12px, color-mix(in srgb, var(--fp-accent2) 65%, white) 12px 20px, white 20px 24px)',
        compactInk: 'text-[var(--fp-ink)]',
        well: 'linear-gradient(180deg, color-mix(in srgb, var(--fp-accent) 10%, white), color-mix(in srgb, var(--fp-accent2) 14%, white))',
        wellShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--fp-accent) 30%, transparent), inset 0 4px 10px color-mix(in srgb, var(--fp-accent) 18%, transparent)',
        slot: 'color-mix(in srgb, var(--fp-ink) 22%, white)',
        knob:
          'radial-gradient(circle at 35% 30%, white 0 18%, transparent 19%), repeating-linear-gradient(120deg, var(--fp-accent) 0 7px, white 7px 11px, var(--fp-accent2) 11px 18px, white 18px 22px)',
        knobBurned: 'linear-gradient(180deg, color-mix(in srgb, var(--fp-muted) 60%, white), var(--fp-muted))',
        stem: 'linear-gradient(180deg, white, color-mix(in srgb, var(--fp-accent) 40%, white))',
        ready: 'bg-[color-mix(in_srgb,var(--fp-accent)_75%,black)] text-white',
        idleBadge: 'bg-white text-[var(--fp-muted)]',
        radius: '999px',
      }
    : {
        compactBg: 'linear-gradient(180deg,#f6dc9a,#c9974a 55%,#8b6224)',
        compactInk: 'text-[#2b1b08]',
        well: 'linear-gradient(180deg,#1a1410,#0c0907)',
        wellShadow: 'inset 0 0 0 1px var(--fp-hair), inset 0 6px 14px rgb(0 0 0 / 0.8)',
        slot: '#000',
        knob: 'linear-gradient(180deg,#f6dc9a,#d6a752 45%,#8b6224)',
        knobBurned: 'linear-gradient(180deg,#5b5047,#2b2420)',
        stem: 'linear-gradient(180deg,#8b6224,#3c2a10)',
        ready: 'bg-[#2c6b3a] text-white',
        idleBadge: 'bg-[#1b1512] text-[var(--fp-muted)]',
        radius: '6px',
      };
}
/** The CLOSE THE CASE lever: a brass handle that is pulled down in its slot. */
export function Lever({
  onPull,
  disabled,
  phase,
  pinned,
  total,
  compact,
}: {
  onPull: () => void;
  disabled: boolean;
  phase: InstrumentsProps['phase'];
  pinned: number;
  total: number;
  compact?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const [pulling, setPulling] = useState(false);
  const ready = pinned === total;
  const sk = leverSkin(useDeskMood() === 'light');
  const label =
    phase === 'accusing' ? 'Open the line-up' : phase === 'solved' ? 'Case closed' : phase === 'burned' ? 'Case burned' : 'Close the case';
  const pull = () => {
    if (disabled || pulling) return;
    if (phase === 'accusing' || reduced) {
      onPull();
      return;
    }
    setPulling(true);
    window.setTimeout(() => {
      onPull();
      setPulling(false);
    }, 380);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={pull}
        disabled={disabled}
        aria-label={`${label} (L)`}
        className={clsx(
          'relative flex h-14 min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-[8px] px-2 disabled:opacity-45',
          sk.compactInk,
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--fp-accent2)]',
        )}
        style={{ background: sk.compactBg }}
      >
        <motion.span animate={pulling ? { y: [0, 6, 0] } : { y: 0 }} transition={{ duration: 0.38 }}>
          <Stamp className="size-5" />
        </motion.span>
        <span className="text-[9px] font-bold uppercase tracking-wider">{phase === 'accusing' ? 'Line-up' : 'Close'}</span>
        {phase === 'placing' && (
          <span className={clsx('absolute -top-1.5 right-1 rounded-full px-1 font-mono text-[9px]', ready ? sk.ready : sk.idleBadge)}>
            {pinned}/{total}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={pull}
        disabled={disabled}
        aria-label={`${label} (L)`}
        title={`${label} (L)`}
        className="group relative h-36 w-20 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fp-accent2)] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: sk.well, boxShadow: sk.wellShadow }}
      >
        {/* slot */}
        <span aria-hidden className="absolute bottom-4 left-1/2 top-4 w-2 -translate-x-1/2 rounded-full shadow-[inset_0_0_4px_rgb(0_0_0/0.6)]" style={{ background: sk.slot }} />
        {/* handle */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-3 -ml-6 flex w-12 flex-col items-center"
          animate={pulling ? { y: 74 } : { y: phase === 'accusing' || phase === 'solved' ? 74 : 0 }}
          transition={pulling ? { type: 'spring', stiffness: 260, damping: 16 } : { duration: 0.3 }}
        >
          <span
            className="h-7 w-12 group-hover:brightness-110"
            style={{
              background: phase === 'burned' ? sk.knobBurned : sk.knob,
              borderRadius: sk.radius,
              boxShadow: 'inset 0 1px 0 rgb(255 250 230 / 0.6), 0 6px 10px -4px var(--dk-shadow, rgb(0 0 0 / 0.9))',
            }}
          />
          <span className="h-5 w-2 rounded-b" style={{ background: sk.stem }} />
        </motion.span>
        {phase === 'placing' && (
          <span
            aria-hidden
            className={clsx(
              'absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-mono text-[10px]',
              ready ? sk.ready : 'text-[var(--fp-muted)]',
            )}
          >
            {pinned}/{total}
          </span>
        )}
      </button>
      <div className="text-center font-display text-[13px] font-bold uppercase leading-tight tracking-[0.18em] text-[var(--dk-accent-text,var(--fp-accent2))]">
        {label}
      </div>
      {phase === 'placing' && !ready && (
        <p className="max-w-[11rem] text-center text-[10px] leading-snug text-[var(--fp-muted)]">
          Pulled early or wrong, the file burns.
        </p>
      )}
    </div>
  );
}

export function Instruments(props: InstrumentsProps & { layout: 'column' | 'dock' }) {
  const { tool, onTool, disabled, layout } = props;
  if (layout === 'dock') {
    return (
      <nav
        aria-label="Instruments"
        className="flex items-stretch gap-1 px-2 pb-[max(var(--safe-bottom),8px)] pt-2"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--fp-panel) 92%, #000), var(--fp-panel))',
          boxShadow: '0 -1px 0 var(--fp-hair), 0 -14px 30px -18px var(--dk-shadow, rgb(0 0 0 / 0.9))',
        }}
      >
        {TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            compact
            active={tool === t.id}
            disabled={disabled}
            onClick={() => onTool(t.id)}
            label={t.short}
            title={t.label}
            danger={t.id === 'cross'}
          >
            <t.icon className={clsx('size-5', t.id === 'cross' && 'text-[#e2554a]')} />
          </ToolButton>
        ))}
        <ToolButton compact disabled={disabled || props.ottoLeft === 0} onClick={props.onOtto} label="Otto" title="Ask Otto">
          <MessageCircleQuestion className="size-5" />
        </ToolButton>
        <Lever compact onPull={props.onLever} disabled={props.phase === 'solved' || props.phase === 'burned'} phase={props.phase} pinned={props.pinned} total={props.total} />
      </nav>
    );
  }

  return (
    <nav aria-label="Instruments" className="flex h-full flex-col gap-3">
      {props.clock !== null && (
        <MonoClock ms={props.clock} warn={props.clockWarn} label={props.clockLabel} className="text-lg" />
      )}
      <div className="space-y-1">
        {TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            active={tool === t.id}
            disabled={disabled}
            onClick={() => onTool(t.id)}
            label={t.label}
            title={t.hint}
            kbd={t.key}
            danger={t.id === 'cross'}
          >
            <t.icon className={clsx('size-[18px] shrink-0', t.id === 'cross' && 'text-[#e2554a]')} />
          </ToolButton>
        ))}
      </div>
      <button
        type="button"
        onClick={props.onToggleCrossesAll}
        aria-pressed={props.crossesAll}
        className="flex items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] text-[var(--fp-muted)] hover:text-[var(--fp-ink)] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
      >
        <Eye className="size-3.5" /> Crosses: {props.crossesAll ? 'everyone' : 'selected only'}
      </button>
      {props.onToggleFurnitureLabels && (
        <button
          type="button"
          onClick={props.onToggleFurnitureLabels}
          aria-pressed={!!props.furnitureLabels}
          title="Show the name of every piece of furniture on the plan"
          className={clsx(
            '-mt-2 flex items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] hover:text-[var(--fp-ink)] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]',
            props.furnitureLabels ? 'text-[var(--fp-ink)]' : 'text-[var(--fp-muted)]',
          )}
        >
          <Tag className="size-3.5" /> Name labels: {props.furnitureLabels ? 'on' : 'off'}
        </button>
      )}
      <div className="h-px bg-[var(--fp-hair)]" />
      <div className="space-y-1">
        <ToolButton disabled={disabled || props.ottoLeft === 0} onClick={props.onOtto} label={`Ask Otto${props.ottoLeft != null ? ` · ${props.ottoLeft} left` : props.ottoCount ? ` · ${props.ottoCount}` : ''}`} title="Ask Otto for the next deduction" kbd="O">
          <MessageCircleQuestion className="size-[18px] shrink-0" />
        </ToolButton>
        {props.onReveal && (
          <ToolButton disabled={disabled} onClick={props.onReveal} label={`Reveal${props.revealCount ? ` · ${props.revealCount}` : ''}`} title="Reveal one suspect (costs a star)" kbd="R">
            <Lightbulb className="size-[18px] shrink-0" />
          </ToolButton>
        )}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={props.onUndo}
            disabled={disabled || !props.canUndo}
            aria-label="Undo (U or Ctrl+Z)"
            title="Undo (U / Ctrl+Z)"
            className="grid h-10 flex-1 place-items-center rounded-[8px] text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.06))] hover:text-[var(--fp-ink)] disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
          >
            <Undo2 className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={props.onRedo}
            disabled={disabled || !props.canRedo}
            aria-label="Redo (Shift+U or Ctrl+Y)"
            title="Redo (Shift+U / Ctrl+Y)"
            className="grid h-10 flex-1 place-items-center rounded-[8px] text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.06))] hover:text-[var(--fp-ink)] disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
          >
            <Redo2 className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="mt-auto pt-2">
        <Lever onPull={props.onLever} disabled={props.phase === 'solved' || props.phase === 'burned'} phase={props.phase} pinned={props.pinned} total={props.total} />
      </div>
    </nav>
  );
}

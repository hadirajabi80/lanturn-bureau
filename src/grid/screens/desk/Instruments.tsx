/**
 * Instruments: the tools (Pin / Pencil / Cross / Nobody here / Rubber, data-driven from TOOLS), Ask Otto, Reveal,
 * Undo/Redo, the timer and the "Close the case" button. A column rail on desktop, a bottom dock on phones.
 * Printed look: white ink-outlined buttons, the current tool in yellow highlighter, the close button red.
 */
import { type ReactNode } from 'react';
import clsx from 'clsx';
import { Ban, Eraser, Eye, Lightbulb, MapPin, MessageCircleQuestion, Pencil, PenLine, Redo2, Stamp, Tag, Undo2 } from 'lucide-react';
import type { DeskTool } from '@/grid/store';
import { DeskLabel, MonoClock } from './parts';

export interface ToolDef {
  id: DeskTool;
  /** full name (rail label, dock aria-label) */
  label: string;
  /** dock label */
  short: string;
  /** keyboard shortcut */
  key: string;
  icon: typeof MapPin;
  /** rail aria-label / tooltip */
  hint: string;
  /** icon colour (e.g. red for marks that cross out) */
  tint?: string;
}

/** The desk tools, in order. Add an entry here to get a button in both the rail and the dock, plus its shortcut. */
export const TOOLS: ToolDef[] = [
  { id: 'pin', label: 'Brass pin', short: 'Pin', key: '1', icon: MapPin, hint: 'Pin the selected suspect onto a square' },
  { id: 'pencil', label: 'Pencil', short: 'Pencil', key: '2', icon: Pencil, hint: 'Pencil a candidate note', tint: 'var(--fp-blue)' },
  { id: 'cross', label: 'Grease pencil', short: 'Cross', key: '3', icon: PenLine, hint: 'Red X for the selected suspect only', tint: 'var(--fp-accent)' },
  { id: 'empty', label: 'Nobody here', short: 'Nobody', key: '4', icon: Ban, hint: 'Nobody can be here: grey a square out for everyone (drag to mark several)' },
  { id: 'erase', label: 'Rubber', short: 'Rubber', key: '5', icon: Eraser, hint: 'Erase pins and marks in a square' },
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

const BTN_BASE =
  'relative flex items-center rounded-[6px] border-2 border-[var(--fp-ink)] text-[var(--fp-ink)] transition-[background,transform] duration-100 active:translate-y-px ' +
  'disabled:cursor-not-allowed disabled:border-[#9A9A94] disabled:bg-[var(--fp-grey,#C9C9C3)] disabled:text-[#6B6B66] disabled:active:translate-y-0';

function ToolButton({
  active,
  disabled,
  onClick,
  label,
  title,
  kbd,
  children,
  compact,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  title: string;
  kbd?: string;
  children: ReactNode;
  compact?: boolean;
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
        BTN_BASE,
        compact ? 'h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 px-0.5' : 'h-10 w-full gap-2.5 px-2.5',
        active ? 'bg-[var(--fp-hl)]' : 'bg-[var(--fp-panel)] enabled:hover:bg-[var(--dk-hover)]',
      )}
    >
      {children}
      <span className={clsx(compact ? 'max-w-full truncate text-[12px] font-semibold leading-none' : 'flex-1 truncate text-left text-sm font-semibold')}>{label}</span>
      {kbd && !compact && (
        <kbd
          className={clsx(
            'grid h-5 min-w-5 place-items-center rounded-[3px] border-[1.5px] px-1 text-[12px] font-bold leading-none',
            active ? 'border-[var(--fp-ink)] bg-[var(--fp-panel)]' : 'border-[var(--fp-hair)] text-[var(--fp-muted)]',
          )}
        >
          {kbd}
        </kbd>
      )}
    </button>
  );
}

/** A small on/off line in the rail (checkbox look). */
function Toggle({ on, onClick, icon, children, title }: { on: boolean; onClick: () => void; icon: ReactNode; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className="flex w-full items-center gap-2 rounded-[4px] px-1 py-1 text-left text-[13px] text-[var(--fp-ink)] hover:bg-[var(--dk-hover)]"
    >
      <span
        aria-hidden
        className={clsx('grid size-4 shrink-0 place-items-center rounded-[3px] border-2 border-[var(--fp-ink)]', on ? 'bg-[var(--fp-ink)] text-white' : 'bg-[var(--fp-panel)]')}
      >
        {on && (
          <svg viewBox="0 0 10 10" className="size-2.5">
            <path d="M1.5 5.2 L4 7.5 L8.5 2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
      <span className="text-[var(--fp-muted)]">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

/** The "Close the case" control: a big red primary button with the pinned count. */
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
  const ready = pinned === total;
  const label =
    phase === 'accusing' ? 'Open the line-up' : phase === 'solved' ? 'Case closed' : phase === 'burned' ? 'Case burned' : 'Close the case';
  const pull = () => {
    if (disabled) return;
    onPull();
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={pull}
        disabled={disabled}
        aria-label={`${label} (L)`}
        className="fp-brass relative h-14 min-w-[76px] flex-col !gap-0.5 px-2"
      >
        <Stamp className="size-5" aria-hidden />
        <span className="text-[12px] leading-none">{phase === 'accusing' ? 'Line-up' : 'Close'}</span>
        {phase === 'placing' && (
          <span
            className={clsx(
              'absolute -top-2.5 right-1 rounded-[4px] border-[1.5px] border-[var(--fp-ink)] px-1 font-mono text-[12px] font-semibold leading-[16px]',
              ready ? 'bg-[var(--fp-hl)] text-[var(--fp-ink)]' : 'bg-[var(--fp-panel)] text-[var(--fp-ink)]',
            )}
          >
            {pinned}/{total}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {phase === 'placing' && (
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold text-[var(--fp-muted)]">Pinned</span>
          <span className={clsx('rounded-[3px] px-1 font-mono font-semibold tabular-nums', ready ? 'bg-[var(--fp-hl)] text-[var(--fp-ink)]' : 'text-[var(--fp-ink)]')}>
            {pinned}/{total}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={pull}
        disabled={disabled}
        aria-label={`${label} (L)`}
        title={`${label} (L)`}
        className="fp-brass min-h-13 w-full px-3 text-[17px] leading-tight"
      >
        <Stamp className="size-5 shrink-0" aria-hidden />
        <span>{label}</span>
      </button>
      {phase === 'placing' && !ready && <p className="text-[12px] leading-snug text-[var(--fp-muted)]">Close it early or wrong and the file burns.</p>}
    </div>
  );
}

export function Instruments(props: InstrumentsProps & { layout: 'column' | 'dock' }) {
  const { tool, onTool, disabled, layout } = props;
  if (layout === 'dock') {
    return (
      <nav
        aria-label="Instruments"
        className="flex items-stretch gap-1.5 border-t-2 border-[var(--fp-ink)] bg-[var(--fp-panel)] px-2 pb-[max(var(--safe-bottom),8px)] pt-3"
      >
        {TOOLS.map((t) => (
          <ToolButton key={t.id} compact active={tool === t.id} disabled={disabled} onClick={() => onTool(t.id)} label={t.short} title={t.label}>
            <t.icon className="size-5" style={disabled ? undefined : { color: t.tint }} />
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
        <div>
          <DeskLabel className="mb-1">{props.clockLabel === 'Time remaining' ? 'Time left' : 'Time'}</DeskLabel>
          <MonoClock ms={props.clock} warn={props.clockWarn} label={props.clockLabel} className="text-xl" />
        </div>
      )}
      <div>
        <DeskLabel className="mb-1.5">Tools</DeskLabel>
        <div className="space-y-1">
          {TOOLS.map((t) => (
            <ToolButton key={t.id} active={tool === t.id} disabled={disabled} onClick={() => onTool(t.id)} label={t.label} title={t.hint} kbd={t.key}>
              <t.icon className="size-[18px] shrink-0" style={disabled ? undefined : { color: t.tint }} />
            </ToolButton>
          ))}
        </div>
        <div className="mt-2 space-y-0.5">
          <Toggle on={props.crossesAll} onClick={props.onToggleCrossesAll} icon={<Eye className="size-3.5" />}>
            Show everyone's crosses
          </Toggle>
          {props.onToggleFurnitureLabels && (
            <Toggle
              on={!!props.furnitureLabels}
              onClick={props.onToggleFurnitureLabels}
              icon={<Tag className="size-3.5" />}
              title="Show the name of every piece of furniture on the plan"
            >
              Name labels
            </Toggle>
          )}
        </div>
      </div>
      <div className="border-t border-[var(--fp-hair)] pt-3">
        <DeskLabel className="mb-1.5">Help</DeskLabel>
        <div className="space-y-1">
          <ToolButton
            disabled={disabled || props.ottoLeft === 0}
            onClick={props.onOtto}
            label={`Ask Otto${props.ottoLeft != null ? ` (${props.ottoLeft} left)` : props.ottoCount ? ` (${props.ottoCount})` : ''}`}
            title="Ask Otto for the next deduction"
            kbd="O"
          >
            <MessageCircleQuestion className="size-[18px] shrink-0" />
          </ToolButton>
          {props.onReveal && (
            <ToolButton
              disabled={disabled}
              onClick={props.onReveal}
              label={`Reveal${props.revealCount ? ` (${props.revealCount})` : ''}`}
              title="Reveal one suspect (costs a star)"
              kbd="R"
            >
              <Lightbulb className="size-[18px] shrink-0" />
            </ToolButton>
          )}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={props.onUndo}
              disabled={disabled || !props.canUndo}
              aria-label="Undo (U or Ctrl+Z)"
              title="Undo (U / Ctrl+Z)"
              className={clsx(BTN_BASE, 'h-9 flex-1 justify-center gap-1.5 bg-[var(--fp-panel)] text-sm font-semibold enabled:hover:bg-[var(--dk-hover)]')}
            >
              <Undo2 className="size-4" /> Undo
            </button>
            <button
              type="button"
              onClick={props.onRedo}
              disabled={disabled || !props.canRedo}
              aria-label="Redo (Shift+U or Ctrl+Y)"
              title="Redo (Shift+U / Ctrl+Y)"
              className={clsx(BTN_BASE, 'h-9 flex-1 justify-center gap-1.5 bg-[var(--fp-panel)] text-sm font-semibold enabled:hover:bg-[var(--dk-hover)]')}
            >
              <Redo2 className="size-4" /> Redo
            </button>
          </div>
        </div>
      </div>
      <div className="mt-auto border-t-2 border-[var(--fp-ink)] pt-3">
        <Lever onPull={props.onLever} disabled={props.phase === 'solved' || props.phase === 'burned'} phase={props.phase} pinned={props.pinned} total={props.total} />
      </div>
    </nav>
  );
}

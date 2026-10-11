/**
 * CasePlayer — the reusable case desk (brief §5). Used by every desk route and by the modes.
 *
 * Desktop (≥ 900 px): Dossier rail · the Plan under the lamp · Instruments column with the lever.
 * Phone: plan on top, polaroid film strip, testimony slip, brass bottom dock.
 * The desk never blocks a move; the lever / accusation judges — a wrong one burns the file.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronLeft, Lightbulb, Redo2, Settings2, Undo2 } from 'lucide-react';
import { Stamp } from '@/components/fx';
import { toast } from '@/components/ui/Toast';
import {
  openCellsFor,
  useFloorplan,
  type AccuseResult,
  type BurnInfo,
  type DeskTool,
  type FloorplanSettings,
} from '@/grid/store';
import type { Cell, PlayMode, Puzzle } from '@/grid/types';
import { ambience, codeFor, killersOf, play, playSuccess, playWrong, victimsOf } from './bridge';
import { BurnOverlay, type BurnAction } from './BurnOverlay';
import { Dossier, TestimonySlip } from './Dossier';
import { Instruments } from './Instruments';
import { LineUp } from './LineUp';
import { OttoPanel, type OttoView } from './OttoPanel';
import { BrassBtn, DeskBoard, DeskFrame, GhostBtn, MonoClock, Overlay, PanelBox, VariantIcon, anyOverlayOpen, districtFor, moodOf } from './parts';
import { ResultsCard, type ResultAction } from './ResultsCard';
import { ScenarioExplainer } from './ScenarioExplainer';
import { TIER_NAME, VARIANT_META, formatTime, pad2, shareOrCopy, shareText } from './util';

export interface CasePlayerProps {
  puzzle: Puzzle;
  mode: PlayMode;
  onSolved?: (r: AccuseResult) => void;
  onBurned?: (info: BurnInfo) => void;
  /** wrong lever / accusation burns the file (default true; Zen passes false) */
  burnEnabled?: boolean;
  /** count down from this instead of counting up; `onTimeUp` fires once at zero */
  timeLimitMs?: number;
  onTimeUp?: () => void;
  backTo?: string;
  backLabel?: string;
  /** "Next case" target after solving */
  nextTo?: string | null;
  /** header kicker override (default: district · tier · case nn) */
  kicker?: ReactNode;
  /** extra HUD in the header (mode score, stage…) */
  hud?: ReactNode;
  allowReveal?: boolean;
  /** max Ask Otto uses for this case (null = unlimited) */
  ottoLimit?: number | null;
  showResults?: boolean;
  showBurnOverlay?: boolean;
  showTimer?: boolean;
  burnActions?: BurnAction[];
  resultActions?: ResultAction[];
  /** start a fresh desk even if one is saved */
  fresh?: boolean;
  /** write per-case progress (defaults per mode) */
  record?: boolean;
}

const EMPTY_PLACEMENTS: Record<string, Cell | null> = {};
const EMPTY_MARKS = { notes: {}, crosses: {} };

function useIsWide(): boolean {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

export function CasePlayer(props: CasePlayerProps) {
  const {
    puzzle,
    mode,
    onSolved,
    onBurned,
    burnEnabled = true,
    timeLimitMs,
    onTimeUp,
    backTo = '/plans',
    backLabel = 'Back to the rack',
    nextTo = null,
    allowReveal = true,
    ottoLimit = null,
    showResults = true,
    showBurnOverlay = true,
  } = props;
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const wide = useIsWide();
  const district = districtFor(puzzle);
  const variant = puzzle.variant ?? 'classic';

  const store = useFloorplan.getState;
  const activeId = useFloorplan((s) => s.activeId);
  const active = useFloorplan((s) => s.active);
  const selectedId = useFloorplan((s) => s.selectedPersonId);
  const tool = useFloorplan((s) => s.tool);
  const ottoHint = useFloorplan((s) => s.ottoHint);
  const lastResult = useFloorplan((s) => s.lastResult);
  const settings = useFloorplan((s) => s.settings);
  const seenVariants = useFloorplan((s) => s.seenVariants);
  const showTimer = props.showTimer ?? (timeLimitMs !== undefined || (mode !== 'zen' && settings.showTimer));

  const ready = activeId === puzzle.id && !!active;
  const desk = ready ? active : null;
  const phase = desk?.phase ?? 'placing';
  const placements = desk?.placements ?? EMPTY_PLACEMENTS;
  const marks = desk?.marks ?? EMPTY_MARKS;
  const editable = ready && phase === 'placing';

  // ── open / restore ──
  useEffect(() => {
    store().open(puzzle, { mode, burnEnabled, record: props.record, fresh: props.fresh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);
  // self-heal: if another desk (or a hot reload) took the store over, re-open this case (restores its saved desk)
  useEffect(() => {
    if (!ready) store().open(puzzle, { mode, burnEnabled, record: props.record });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ── ambience ──
  useEffect(() => {
    if (!settings.music) return;
    ambience.play(district.ambience);
    return () => ambience.stop();
  }, [settings.music, district.ambience]);

  // ── timer ──
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (!document.hidden) store().tick(Math.min(delta, 5000));
    }, 500);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [store]);

  const elapsed = desk?.elapsedMs ?? 0;
  const remaining = timeLimitMs !== undefined ? Math.max(0, timeLimitMs - elapsed) : null;
  const timeUpFired = useRef(false);
  useEffect(() => {
    timeUpFired.current = false;
  }, [puzzle.id]);
  useEffect(() => {
    if (remaining === 0 && !timeUpFired.current && (phase === 'placing' || phase === 'accusing')) {
      timeUpFired.current = true;
      onTimeUp?.();
    }
  }, [remaining, phase, onTimeUp]);

  // ── UI state ──
  const [lineupOpen, setLineupOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [ottoView, setOttoView] = useState<OttoView>(null);
  const [zenViolations, setZenViolations] = useState<string[]>([]);
  const [replay, setReplay] = useState<Record<string, Cell | null> | null>(null);
  const [crossesAll, setCrossesAll] = useState(false);
  const [confirm, setConfirm] = useState<null | 'lever' | 'reveal'>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resultsHidden, setResultsHidden] = useState(false);
  // the plan chars on the Board first, then the full-screen burn takes over
  const [burnShown, setBurnShown] = useState(false);
  useEffect(() => {
    if (phase !== 'burned') {
      setBurnShown(false);
      return;
    }
    const t = window.setTimeout(() => setBurnShown(true), reduced ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [phase, reduced]);

  // first time this scenario is met → explainer
  const autoShown = useRef(false);
  useEffect(() => {
    if (!ready || autoShown.current) return;
    if (!seenVariants.includes(variant) && phase === 'placing') {
      autoShown.current = true;
      setScenarioOpen(true);
    }
  }, [ready, seenVariants, variant, phase]);
  const isNewVariant = !seenVariants.includes(variant);
  const closeScenario = useCallback(() => {
    setScenarioOpen(false);
    store().markVariantSeen(variant);
  }, [store, variant]);

  // reopen the line-up automatically when entering 'accusing'
  const prevPhase = useRef<typeof phase | null>(null);
  useEffect(() => {
    if (!ready) {
      prevPhase.current = null;
      return;
    }
    const prev = prevPhase.current;
    prevPhase.current = phase;
    if (prev === null) {
      // restored desk: reopen the line-up, but never replay burn / solve effects
      if (phase === 'accusing') setLineupOpen(true);
      return;
    }
    if (prev === phase) return;
    if (phase === 'accusing') setLineupOpen(true);
    if (phase === 'burned') {
      setLineupOpen(false);
      setOttoView(null);
      play('burn');
      const info = store().active?.burn;
      if (info) onBurned?.(info);
    }
    if (phase === 'solved') {
      setLineupOpen(false);
      play('stamp');
      window.setTimeout(playSuccess, 250);
      setResultsHidden(false);
      const r = store().lastResult;
      if (r) onSolved?.(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ready]);

  // Otto view follows the store hint
  useEffect(() => {
    if (ottoHint) setOttoView({ kind: 'hint', d: ottoHint });
  }, [ottoHint]);

  useEffect(() => {
    if (!zenViolations.length) return;
    const t = window.setTimeout(() => setZenViolations([]), 3500);
    return () => window.clearTimeout(t);
  }, [zenViolations]);

  // ── derived ──
  const pinned = puzzle.people.filter((p) => placements[p.id]).length;
  const total = puzzle.people.length;
  const ottoLeft = ottoLimit === null ? null : Math.max(0, ottoLimit - (desk?.otto ?? 0));
  const code = useMemo(() => {
    try {
      return codeFor(puzzle);
    } catch {
      return puzzle.id;
    }
  }, [puzzle]);

  const singles = useMemo<Cell[]>(() => {
    if (!settings.autoCross || !selectedId || placements[selectedId]) return [];
    const open = openCellsFor(puzzle, marks, selectedId).filter(
      (c) => !Object.values(placements).some((p) => p && p.r === c.r && p.c === c.c),
    );
    return open.length === 1 ? open : [];
  }, [settings.autoCross, selectedId, placements, puzzle, marks]);

  const ottoCells = ottoView?.kind === 'hint' ? ottoView.d.cells : [];
  const ottoReason = ottoView?.kind === 'hint' ? ottoView.d.reasonCells : undefined;
  const highlightCells = useMemo(() => {
    const out = [...ottoCells, ...singles];
    return out.length ? out : undefined;
  }, [ottoCells, singles]);

  const accusationLines = useMemo(() => {
    if (phase !== 'solved') return undefined;
    const ks = killersOf(puzzle);
    const vs = victimsOf(puzzle);
    return ks.map((k, i) => ({ from: k, to: vs[Math.min(i, vs.length - 1)]! })).filter((l) => !!l.to);
  }, [phase, puzzle]);

  // ── actions ──
  const lastWarn = useRef(0);
  const warn = (msg: string) => {
    const now = Date.now();
    if (now - lastWarn.current < 900) return;
    lastWarn.current = now;
    toast(msg, 'warn', { duration: 1800 });
  };

  const actOnCell = (cell: Cell, opts: { all?: boolean; tool?: DeskTool } = {}) => {
    if (!editable || replay) return;
    const res = store().tap(puzzle, cell, opts);
    switch (res) {
      case 'placed':
      case 'moved':
        play('pin');
        break;
      case 'noted':
      case 'unnoted':
        play('pencil');
        break;
      case 'crossed':
      case 'uncrossed':
        play('cross');
        break;
      case 'erased':
      case 'removed':
        play('erase');
        break;
      case 'blocked':
        warn('Blocking furniture — nobody can stand there.');
        break;
      case 'need-select':
        warn('Pick a suspect from the dossier first.');
        break;
      default:
        break;
    }
  };

  const onCellTap = (cell: Cell) => {
    actOnCell(cell);
  };
  const onCellLongPress = (cell: Cell) => {
    if (!editable) return;
    const res = store().longPress(puzzle, cell);
    if (res === 'crossed' || res === 'uncrossed') play('cross');
  };

  const askOtto = () => {
    if (!editable) return;
    if (ottoLeft === 0) {
      setOttoView({ kind: 'limit' });
      return;
    }
    play('otto');
    const d = store().askOtto(puzzle);
    setOttoView(d ? { kind: 'hint', d } : { kind: 'none' });
  };
  const applyOtto = () => {
    store().applyOtto();
    play('pin');
    setOttoView(null);
  };
  const dismissOtto = () => {
    store().dismissOtto();
    setOttoView(null);
  };

  const doReveal = () => {
    setConfirm(null);
    if (!editable) return;
    const id = store().reveal(puzzle);
    if (!id) {
      toast('Everyone is already where they belong.', 'info', { duration: 2000 });
      return;
    }
    play('reveal');
    const who = puzzle.people.find((p) => p.id === id);
    toast(`${who?.name ?? 'Someone'} is pinned where they belong.`, 'evidence', { title: 'Revealed', duration: 2200 });
  };
  const askReveal = () => {
    if (!editable || !allowReveal) return;
    setConfirm('reveal');
  };

  const doLever = () => {
    setConfirm(null);
    if (phase === 'accusing') {
      setLineupOpen(true);
      return;
    }
    if (!editable) return;
    play('lever');
    const res = store().pullLever(puzzle);
    if (res.outcome === 'violations') {
      playWrong();
      const ids = [...new Set([...res.missing, ...res.violations.map((v) => v.personId)])];
      setZenViolations(ids);
      const first = res.missing.length
        ? `${res.missing.length} ${res.missing.length === 1 ? 'person is' : 'people are'} not pinned yet.`
        : (() => {
            const v = res.violations[0];
            const who = puzzle.people.find((p) => p.id === v?.personId);
            const clue = v && v.clueIndex >= 0 ? puzzle.clues[v.clueIndex]?.text : null;
            return who ? `${who.name}: ${clue ?? 'shares a row, column or square with someone else.'}` : 'Something does not add up.';
          })();
      toast(first, 'error', { title: 'First contradiction', duration: 4200 });
    }
  };
  const askLever = () => {
    if (phase === 'accusing') {
      setLineupOpen(true);
      return;
    }
    if (!editable) return;
    if (settings.confirmLever && burnEnabled) setConfirm('lever');
    else doLever();
  };

  const onAccuse = (acc: Parameters<ReturnType<typeof store>['accuse']>[1]) => {
    const r = store().accuse(puzzle, acc);
    if (!r.correct && !r.burned) playWrong();
    return r.correct;
  };

  const reopen = () => {
    store().reopen(puzzle.id, puzzle);
    setZenViolations([]);
    setReplay(null);
  };

  // replay: re-animate the recorded pins over ~6 s
  const startReplay = () => {
    const hist = desk?.history.length
      ? desk.history
      : puzzle.people.map((p, i) => ({ personId: p.id, cell: puzzle.solution[p.id] ?? null, t: i }));
    const frames: Record<string, Cell | null>[] = [];
    let cur: Record<string, Cell | null> = {};
    for (const e of hist) {
      cur = { ...cur, [e.personId]: e.cell };
      frames.push(cur);
    }
    const final = desk?.placements ?? {};
    frames.push({ ...final });
    setResultsHidden(true);
    setReplay({});
    const step = Math.max(90, Math.min(700, 6000 / frames.length));
    frames.forEach((f, i) =>
      window.setTimeout(() => {
        setReplay(f);
        if (f !== frames[frames.length - 1]) play('pin');
      }, (i + 1) * step),
    );
    window.setTimeout(() => {
      setReplay(null);
      setResultsHidden(false);
    }, (frames.length + 1) * step + 600);
  };

  const share = async () => {
    const r = lastResult;
    const text = shareText({ title: puzzle.title, code, stars: r?.stars ?? 0, timeMs: r?.timeMs ?? elapsed });
    const how = await shareOrCopy(text);
    if (how === 'copied') toast('Case summary copied to the clipboard.', 'success', { duration: 2000 });
    else if (how === 'failed') toast('Could not share from this browser.', 'warn');
  };

  const cycleSuspect = (dir: 1 | -1) => {
    const ids = puzzle.people.map((p) => p.id);
    const i = selectedId ? ids.indexOf(selectedId) : -1;
    const next = ids[(i + dir + ids.length) % ids.length] ?? null;
    store().select(next);
  };

  // ── keyboard ──
  // The Board owns a roving focus over its cells (arrows, Enter = tap, Shift/Alt+Enter = cross for everyone).
  // The desk adds: tools, Otto, reveal, undo/redo, Tab cycling, Space = cross for the selected suspect, lever.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return; // handled by the Board or an overlay
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (anyOverlayOpen()) return; // overlays own their keys (Esc)
    const k = e.key;
    const lower = k.toLowerCase();
    const onBodyOrPlan = !t || t === document.body || !!t.closest?.('[data-plan]');

    if (k === 'Escape') {
      if (ottoView) dismissOtto();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && lower === 'z') {
      e.preventDefault();
      if (e.shiftKey) store().redo();
      else store().undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && lower === 'y') {
      e.preventDefault();
      store().redo();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (phase === 'solved' || phase === 'burned') return;

    if (k === 'Tab' && onBodyOrPlan) {
      e.preventDefault();
      cycleSuspect(e.shiftKey ? -1 : 1);
      return;
    }
    if (k.startsWith('Arrow') && onBodyOrPlan) {
      // move the focus cursor onto the plan (the Board's roving cell)
      const cell = document.querySelector<SVGElement>('[data-plan] [role="button"][tabindex="0"]');
      if (cell) {
        e.preventDefault();
        cell.focus();
      }
      return;
    }
    if (k === '1') store().setTool('pin');
    else if (k === '2') store().setTool('pencil');
    else if (k === '3') store().setTool('cross');
    else if (k === '4') store().setTool('erase');
    else if (lower === 'o') askOtto();
    else if (lower === 'r') askReveal();
    else if (lower === 'u') {
      if (e.shiftKey) store().redo();
      else store().undo();
    } else if (lower === 'l') askLever();
    else return;
    e.preventDefault();
  };
  const spaceRef = useRef<(e: KeyboardEvent) => void>(() => {});
  spaceRef.current = (e: KeyboardEvent) => {
    if (e.key !== ' ' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as Element | null;
    if (!t || t.getAttribute?.('role') !== 'button' || !t.closest?.('[data-plan]')) return;
    const x = Number(t.getAttribute('x'));
    const y = Number(t.getAttribute('y'));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    e.preventDefault();
    e.stopPropagation();
    actOnCell({ r: Math.round(y / 100), c: Math.round(x / 100) }, { tool: 'cross', all: e.shiftKey });
  };
  useEffect(() => {
    const down = (e: KeyboardEvent) => keyRef.current(e);
    const space = (e: KeyboardEvent) => spaceRef.current(e);
    window.addEventListener('keydown', down);
    window.addEventListener('keydown', space, true);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keydown', space, true);
    };
  }, []);

  // ── pieces ──
  const kicker =
    props.kicker ??
    (mode === 'case'
      ? `${district.name} · ${TIER_NAME[puzzle.tier]} · Case ${pad2(puzzle.index)}`
      : `${district.name} · ${TIER_NAME[puzzle.tier]}`);
  const clock = showTimer ? formatTime(remaining ?? elapsed) : null;
  const clockWarn = remaining !== null && remaining < 20000;

  const board = (
    <div data-plan className="relative" tabIndex={-1} aria-label={`Floor plan, ${puzzle.rows} by ${puzzle.cols}`}>
      {ready ? (
        <DeskBoard
          puzzle={puzzle}
          skinId={puzzle.skinId ?? district.id}
          placements={replay ?? placements}
          marks={replay ? EMPTY_MARKS : marks}
          crossesVisibleFor={crossesAll || !selectedId ? 'all' : selectedId}
          selectedPersonId={phase === 'placing' && !replay ? selectedId : null}
          tool={tool}
          highlightCells={replay ? undefined : highlightCells}
          reasonCells={ottoReason}
          violations={zenViolations.length ? zenViolations : undefined}
          accusationLines={replay ? undefined : accusationLines}
          lampFollow={settings.lampFollow}
          burn={phase === 'burned'}
          onCellTap={onCellTap}
          onCellLongPress={onCellLongPress}
          caseCode={code}
          maxWidth={wide ? 1600 : undefined}
        />
      ) : (
        <div className="aspect-square w-full animate-pulse rounded-[10px] bg-[var(--dk-shade,rgb(255_255_255/0.05))]" />
      )}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <Stamp
          text="Case closed"
          show={phase === 'solved' && !replay}
          color={moodOf(district) === 'light' ? district.palette.accent : undefined}
          className="text-3xl sm:text-5xl"
        />
      </div>
    </div>
  );

  const slip = (
    <TestimonySlip
      puzzle={puzzle}
      personId={selectedId}
      ticks={desk?.ticks ?? []}
      onToggleTick={(i) => store().toggleTick(i)}
      onScenario={() => setScenarioOpen(true)}
    />
  );

  const dossierProps = {
    puzzle,
    placements,
    selectedId,
    cleared: desk?.cleared ?? [],
    flagged: zenViolations,
    onSelect: (id: string) => store().select(id),
    onToggleCleared: (id: string) => store().toggleCleared(id),
  };

  const scenarioChip = (
    <button
      type="button"
      onClick={() => setScenarioOpen(true)}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[var(--fp-hair)] bg-[var(--dk-shade,rgb(0_0_0/0.25))] px-3 text-[11px] font-semibold text-[var(--fp-ink)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.06))] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
      aria-label={`Scenario: ${VARIANT_META[variant].name}`}
    >
      <VariantIcon variant={variant} className="size-3.5 text-[var(--dk-accent-text,var(--fp-accent2))]" />
      <span className="max-[420px]:hidden">{VARIANT_META[variant].name}</span>
      {isNewVariant && <span className="rounded-full bg-[var(--fp-danger)] px-1.5 text-[9px] uppercase text-white">new</span>}
    </button>
  );

  const settingsBtn = (
    <button
      type="button"
      onClick={() => setSettingsOpen(true)}
      aria-label="Desk settings"
      className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.08))] hover:text-[var(--fp-ink)] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
    >
      <Settings2 className="size-[18px]" />
    </button>
  );

  const backBtn = (
    <Link
      to={backTo}
      aria-label={backLabel}
      title={backLabel}
      className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--fp-ink)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.08))] focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
    >
      <ChevronLeft className="size-5" />
    </Link>
  );

  const titleBlock = (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fp-muted)]">{kicker}</div>
      <h1 className="truncate font-display text-lg font-bold leading-tight sm:text-2xl">
        {puzzle.title}
        <span className="ml-2 align-middle font-mono text-[11px] font-normal text-[var(--fp-muted)]">
          {puzzle.rows}×{puzzle.cols} · {code}
        </span>
      </h1>
    </div>
  );

  const defaultBurnActions: BurnAction[] = props.burnActions ?? [
    { label: 'Reopen the case', onClick: reopen, primary: true },
    { label: backLabel, onClick: () => navigate(backTo) },
  ];
  const defaultResultActions: ResultAction[] = props.resultActions ?? [
    ...(nextTo ? [{ label: 'Next case', onClick: () => navigate(nextTo), primary: true }] : []),
    { label: backLabel, onClick: () => navigate(backTo), primary: !nextTo },
  ];

  const results =
    showResults && phase === 'solved' && lastResult && !resultsHidden ? (
      <div className={clsx('fixed z-[70]', wide ? 'bottom-6 right-6 w-[380px]' : 'inset-x-2 bottom-2')}>
        <ResultsCard
          result={lastResult}
          title={puzzle.title}
          code={code}
          parSeconds={puzzle.parSeconds}
          showStars={mode !== 'zen'}
          onReplay={startReplay}
          onShare={() => void share()}
          actions={defaultResultActions}
          className="max-h-[80dvh] overflow-y-auto"
        />
      </div>
    ) : null;

  const instrumentsProps = {
    tool,
    onTool: (t: DeskTool) => store().setTool(t),
    disabled: !editable || !!replay,
    onOtto: askOtto,
    ottoCount: desk?.otto ?? 0,
    ottoLeft,
    onReveal: allowReveal ? askReveal : undefined,
    revealCount: desk?.reveals ?? 0,
    onUndo: () => store().undo(),
    onRedo: () => store().redo(),
    canUndo: !!desk?.undo.length,
    canRedo: !!desk?.redo.length,
    clock,
    clockWarn,
    clockLabel: remaining !== null ? 'Time remaining' : 'Elapsed time',
    pinned,
    total,
    phase,
    onLever: askLever,
    crossesAll,
    onToggleCrossesAll: () => setCrossesAll((v) => !v),
  };

  const overlays = (
    <>
      <OttoPanel
        view={ottoView}
        onApply={applyOtto}
        onDismiss={dismissOtto}
        className={clsx('fixed z-[60]', wide ? 'bottom-6 left-1/2 w-[min(560px,46vw)] -translate-x-1/2' : 'inset-x-2 bottom-[88px]')}
      />
      <LineUp puzzle={puzzle} open={lineupOpen && phase === 'accusing'} onClose={() => setLineupOpen(false)} onAccuse={onAccuse} burnEnabled={burnEnabled} />
      <ScenarioExplainer variant={variant} open={scenarioOpen} onClose={closeScenario} isNew={isNewVariant} />
      {showBurnOverlay && (
        <BurnOverlay open={phase === 'burned' && burnShown} title={puzzle.title} actions={defaultBurnActions} />
      )}
      <Overlay open={confirm !== null} onClose={() => setConfirm(null)} label="Confirm">
        <div className="grid min-h-dvh place-items-center p-4">
          <PanelBox className="w-full max-w-sm p-5">
            {confirm === 'lever' ? (
              <>
                <h2 className="font-display text-xl font-bold">Close the case?</h2>
                <p className="mt-2 text-sm text-[var(--fp-muted)]">
                  {pinned < total
                    ? `${total - pinned} ${total - pinned === 1 ? 'person is' : 'people are'} still unpinned. Pulling the lever now burns the file.`
                    : 'If a single pin is wrong, the file burns and the attempt is lost.'}
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <GhostBtn onClick={() => setConfirm(null)}>Not yet</GhostBtn>
                  <BrassBtn onClick={doLever} data-autofocus>
                    Pull the lever
                  </BrassBtn>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-bold">Reveal one suspect?</h2>
                <p className="mt-2 text-sm text-[var(--fp-muted)]">
                  The selected suspect (or the next one) is pinned on the right square. A reveal costs the third star; two cost the second.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <GhostBtn onClick={() => setConfirm(null)}>Cancel</GhostBtn>
                  <BrassBtn onClick={doReveal} data-autofocus icon={<Lightbulb className="size-4" />}>
                    Reveal
                  </BrassBtn>
                </div>
              </>
            )}
          </PanelBox>
        </div>
      </Overlay>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} />
    </>
  );

  // ─────────────── desktop ───────────────
  if (wide) {
    return (
      <DeskFrame district={district} lampFollow={settings.lampFollow}>
        <div className="mx-auto flex h-dvh max-w-[2200px] flex-col px-4 pb-4 pt-3 2xl:px-8">
          <header className="flex shrink-0 items-center gap-3 pb-3">
            {backBtn}
            {titleBlock}
            {props.hud}
            {scenarioChip}
            {settingsBtn}
          </header>
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(240px,300px)_minmax(0,1fr)_210px] gap-4 2xl:grid-cols-[340px_minmax(0,1fr)_230px]">
            <PanelBox as="aside" className="flex min-h-0 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-3">
                <Dossier {...dossierProps} layout="rail" />
              </div>
              <div className="max-h-[48%] shrink-0 overflow-y-auto border-t border-[var(--fp-hair)] p-3">{slip}</div>
            </PanelBox>

            <main className="relative flex min-h-0 items-center justify-center overflow-auto [perspective:1600px]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(55% 50% at 50% 38%, color-mix(in srgb, var(--fp-glow) 18%, transparent), transparent 75%)' }}
              />
              <TiltPlan disabled={reduced || !settings.lampFollow}>
                <div className="w-[min(100%,calc(100dvh-120px))] min-w-[320px]">{board}</div>
              </TiltPlan>
            </main>

            <PanelBox as="aside" className="flex min-h-0 flex-col overflow-y-auto p-3">
              <Instruments {...instrumentsProps} layout="column" />
            </PanelBox>
          </div>
        </div>
        {overlays}
        {results}
      </DeskFrame>
    );
  }

  // ─────────────── phone ───────────────
  return (
    <DeskFrame district={district} lampFollow={false}>
      <div className="flex min-h-dvh flex-col pb-[96px]">
        <header className="sticky top-0 z-30 flex items-center gap-1.5 px-2 py-2 backdrop-blur" style={{ background: 'color-mix(in srgb, var(--fp-bg) 82%, transparent)' }}>
          {backBtn}
          {titleBlock}
          {props.hud}
          {clock !== null && <MonoClock ms={clock} warn={clockWarn} className="!px-2 !py-1 text-sm" label={instrumentsProps.clockLabel} />}
        </header>
        <div className="flex items-center gap-1 px-2 pb-1">
          {scenarioChip}
          <div className="flex-1" />
          <IconMini label="Undo" onClick={() => store().undo()} disabled={!editable || !desk?.undo.length}>
            <Undo2 className="size-[18px]" />
          </IconMini>
          <IconMini label="Redo" onClick={() => store().redo()} disabled={!editable || !desk?.redo.length}>
            <Redo2 className="size-[18px]" />
          </IconMini>
          {allowReveal && (
            <IconMini label="Reveal one suspect" onClick={askReveal} disabled={!editable}>
              <Lightbulb className="size-[18px]" />
            </IconMini>
          )}
          {settingsBtn}
        </div>
        <div className="relative px-1.5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-6 h-40"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--fp-glow) 20%, transparent), transparent)' }}
          />
          {board}
        </div>
        <div className="mt-2">
          <Dossier {...dossierProps} layout="strip" />
        </div>
        <div className="px-3 pt-3">{slip}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40">
        <Instruments {...instrumentsProps} layout="dock" />
      </div>
      {overlays}
      {results}
    </DeskFrame>
  );
}

function IconMini({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full text-[var(--fp-muted)] hover:bg-[var(--dk-hover,rgb(255_255_255/0.08))] hover:text-[var(--fp-ink)] disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[var(--fp-accent2)]"
    >
      {children}
    </button>
  );
}

/** ≤ 1.5° 3D tilt following the pointer (desktop only). */
function TiltPlan({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      className="relative flex w-full justify-center"
      onPointerMove={(e) => {
        if (disabled || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setT({ x: -y * 1.5, y: x * 1.5 });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      animate={{ rotateX: t.x, rotateY: t.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', filter: 'drop-shadow(0 40px 50px var(--dk-shadow, rgb(0 0 0 / 0.65)))' }}
    >
      {children}
    </motion.div>
  );
}

const SETTING_ROWS: { key: keyof FloorplanSettings; label: string; hint: string }[] = [
  { key: 'autoCross', label: 'Auto-cross', hint: 'Pinning someone crosses their row and column for everyone else.' },
  { key: 'confirmLever', label: 'Confirm the lever', hint: 'Ask before closing the case.' },
  { key: 'showTimer', label: 'Show the timer', hint: 'Hide it if the clock makes you nervous.' },
  { key: 'lampFollow', label: 'Lamp follows the cursor', hint: 'Desk lamp light and plan tilt follow your mouse.' },
  { key: 'sound', label: 'Sound effects', hint: 'Pins, pencils, stamps and fire.' },
  { key: 'music', label: 'District ambience', hint: 'Rain, waves, clocks…' },
];

function SettingsSheet({ open, onClose, settings }: { open: boolean; onClose: () => void; settings: FloorplanSettings }) {
  const set = useFloorplan((s) => s.setSetting);
  return (
    <Overlay open={open} onClose={onClose} label="Desk settings">
      <div className="grid min-h-dvh place-items-center p-4">
        <PanelBox className="w-full max-w-sm p-5">
          <h2 className="font-display text-xl font-bold">Desk settings</h2>
          <ul className="mt-4 space-y-3">
            {SETTING_ROWS.map((r) => (
              <li key={r.key}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={settings[r.key]}
                    onChange={(e) => set(r.key, e.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--fp-accent)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{r.label}</span>
                    <span className="block text-xs text-[var(--fp-muted)]">{r.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-end">
            <BrassBtn onClick={onClose}>Done</BrassBtn>
          </div>
        </PanelBox>
      </div>
    </Overlay>
  );
}


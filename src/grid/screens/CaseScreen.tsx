import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronLeft, CircleHelp, Pause, Undo2 } from 'lucide-react';
import { ShakeOnError } from '@/components/fx';
import { toast } from '@/components/ui/Toast';
import { Board } from '@/grid/board';
import { SEASONS, candidateCells, dailyPuzzle, generatePuzzle } from '@/grid/engine';
import { MAX_HINTS, allPlaced, isBlocked, personAt, useFiles, type GuessResult } from '@/grid/store';
import type { Cell, Puzzle, Season, Tier } from '@/grid/types';
import { ClueCard } from '@/grid/components/ClueCard';
import { FilesPage } from '@/grid/components/FilesPage';
import { anySheetOpen } from '@/grid/components/Sheet';
import { SuspectBar } from '@/grid/components/SuspectBar';
import { TimerPill } from '@/grid/components/TimerPill';
import { ToolBar } from '@/grid/components/ToolBar';
import { TIER_META, isTier, nextCasePath, pad2, play, prettyDate, todayISO } from '@/grid/components/theme';
import { HelpModal } from './HelpModal';
import { KillerSheet } from './KillerSheet';
import { PauseOverlay } from './PauseOverlay';
import { ResultSheet } from './ResultSheet';

/** /files/:season/:tier/:n and /files/daily — the case screen. */
export default function CaseScreen({ daily = false }: { daily?: boolean }) {
  const params = useParams<{ season: string; tier: string; n: string }>();
  const [today] = useState(todayISO);
  const season = daily ? undefined : SEASONS.find((s: Season) => s.id === params.season);
  const tier = isTier(params.tier) ? params.tier : undefined;
  const n = Number(params.n);
  const validIndex = Number.isInteger(n) && n >= 1 && !!season && n <= season.casesPerTier;

  const puzzle = useMemo<Puzzle | null>(() => {
    try {
      if (daily) return dailyPuzzle(today);
      if (!season || !tier || !validIndex) return null;
      return generatePuzzle(season.id, tier, n);
    } catch (err) {
      console.error('[crime-files] failed to generate puzzle', err);
      return null;
    }
  }, [daily, today, season, tier, n, validIndex]);

  if (!daily && (!season || !tier || !validIndex)) {
    return <Navigate to={season ? (tier ? `/files/${season.id}/${tier}` : `/files/${season.id}`) : '/files'} replace />;
  }
  if (!puzzle) {
    return (
      <FilesPage className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <div className="font-display text-2xl font-black">This file is missing pages.</div>
        <Link to="/files" className="font-semibold text-[#e8632b] underline-offset-4 hover:underline">
          Back to Crime Files
        </Link>
      </FilesPage>
    );
  }
  return <CaseView key={puzzle.id} puzzle={puzzle} season={season} tier={tier} daily={daily} today={today} />;
}

interface CaseViewProps {
  puzzle: Puzzle;
  season: Season | undefined;
  tier: Tier | undefined;
  daily: boolean;
  today: string;
}

function CaseView({ puzzle, season, tier, daily, today }: CaseViewProps) {
  const navigate = useNavigate();
  const activeId = useFiles((s) => s.activeId);
  const active = useFiles((s) => s.active);
  const selectedId = useFiles((s) => s.selectedPersonId);
  const tool = useFiles((s) => s.tool);
  const paused = useFiles((s) => s.paused);
  const assist = useFiles((s) => s.settings.assist);
  const store = useFiles.getState;

  const [helpOpen, setHelpOpen] = useState(false);
  const [killerOpen, setKillerOpen] = useState(false);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [round, setRound] = useState(0);

  const ready = activeId === puzzle.id && !!active;
  const state = ready ? active : null;
  const phase = state?.phase ?? 'placing';

  // ── load / restore ──
  useEffect(() => {
    const s = store().load(puzzle.id, puzzle);
    if (s.phase === 'killer') setKillerOpen(true);
  }, [puzzle, store]);

  // ── timer: 1 s ticks measured with performance.now; hidden-tab time is discarded ──
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (!document.hidden) store().tick(Math.min(delta, 5000));
    }, 1000);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [store]);

  // ── transient feedback ──
  useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(t);
  }, [shake]);

  useEffect(() => {
    if (!violations.length) return;
    const t = window.setTimeout(() => setViolations([]), 2000);
    return () => window.clearTimeout(t);
  }, [violations]);

  const lastWarn = useRef(0);
  const warn = (msg: string) => {
    const now = Date.now();
    if (now - lastWarn.current < 900) return;
    lastWarn.current = now;
    toast(msg, 'warn', { duration: 1800 });
  };

  // ── derived ──
  const people = puzzle.people;
  const suspects = useMemo(() => people.filter((p) => !p.isVictim), [people]);
  const victim = useMemo(() => people.find((p) => p.isVictim), [people]);
  const selected = people.find((p) => p.id === selectedId) ?? null;
  const cluesFor = useCallback((id: string) => puzzle.clues.filter((c) => c.personId === id), [puzzle]);
  const placements = state?.placements ?? EMPTY_PLACEMENTS;
  const notes = state?.notes ?? EMPTY_NOTES;
  const everyonePlaced = allPlaced(puzzle, placements);
  const hintsLeft = MAX_HINTS - (state?.hintsUsed ?? 0);
  const editable = ready && phase === 'placing' && !paused;

  const highlightCells = useMemo<Cell[] | undefined>(() => {
    if (!assist || !selectedId || phase !== 'placing') return undefined;
    try {
      return candidateCells(puzzle, selectedId, placements);
    } catch {
      return undefined;
    }
  }, [assist, selectedId, phase, puzzle, placements]);

  const backTo = daily || !season || !tier ? '/files' : `/files/${season.id}/${tier}`;
  const next = daily || !season || !tier ? null : nextCasePath(season, tier, puzzle.index);

  // ── actions ──
  const onCellTap = (cell: Cell) => {
    if (!editable) return;
    const before = store().selectedPersonId;
    const res = store().tapCell(puzzle, cell);
    switch (res) {
      case 'placed':
      case 'moved':
      case 'noted':
      case 'selected':
        play('blip');
        break;
      case 'reject': {
        if (tool === 'erase') break;
        if (!before) warn('Pick someone from the suspects below first.');
        else if (isBlocked(puzzle, cell)) warn('That spot is blocked by furniture.');
        else if (personAt(placements, cell)) warn('Someone is already standing there.');
        break;
      }
      default:
        break;
    }
  };

  const onUndo = () => {
    if (!editable) return;
    if (store().undo()) play('blip');
  };

  const onHint = () => {
    if (!editable) return;
    if (hintsLeft <= 0) {
      warn('No hints left on this case.');
      return;
    }
    const id = store().useHint(puzzle);
    if (!id) {
      toast('Everyone is already where they belong.', 'info', { duration: 2000 });
      return;
    }
    play('reveal');
    const who = people.find((p) => p.id === id);
    toast(`${who?.isVictim ? 'The victim' : who?.name ?? 'Someone'} is now in the right spot.`, 'evidence', {
      title: 'Hint',
      duration: 2200,
    });
  };

  const onSubmit = () => {
    if (phase === 'killer') {
      setKillerOpen(true);
      return;
    }
    if (phase === 'solved') {
      if (result) setResultOpen(true);
      return;
    }
    if (!editable || !everyonePlaced) return;
    const res = store().submit(puzzle);
    if (res.ok) {
      play('reveal');
      setKillerOpen(true);
    } else if (!res.incomplete) {
      play('wrong');
      setShake(true);
      setViolations(res.violations);
      toast('Something doesn’t add up', 'error', { duration: 2400 });
    }
  };

  const onGuess = (id: string) => {
    const res = store().guessKiller(puzzle, id);
    if (!res.correct) {
      play('wrong');
      return false;
    }
    setResult(res);
    setKillerOpen(false);
    window.setTimeout(() => setResultOpen(true), 280);
    return true;
  };

  const onReplay = () => {
    setResultOpen(false);
    setResult(null);
    store().reset(puzzle.id, puzzle);
    setRound((r) => r + 1);
  };

  // ── keyboard ──
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (anySheetOpen()) return; // sheets own Esc
    const k = e.key.toLowerCase();
    if (paused) {
      if (k === 'escape' || k === 'p' || k === ' ') {
        e.preventDefault();
        store().setPaused(false);
      }
      return;
    }
    if (phase === 'solved') return;
    if (k === '1') store().setTool('notes');
    else if (k === '2') store().setTool('place');
    else if (k === '3') store().setTool('erase');
    else if (k === 'u') onUndo();
    else if (k === 'h') onHint();
    else if (k === 'p') store().setPaused(true);
    else return;
    e.preventDefault();
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const eyebrow = daily
    ? `Daily Case · ${prettyDate(today)}`
    : `${season?.name ?? ''} · ${tier ? TIER_META[tier].label : ''} · Case ${pad2(puzzle.index)}`;

  const submitLabel =
    phase === 'killer'
      ? 'Name the killer'
      : phase === 'solved'
        ? 'Case closed — view result'
        : everyonePlaced
          ? 'Submit solution'
          : `Submit solution (${people.filter((p) => placements[p.id]).length}/${people.length} placed)`;

  return (
    <FilesPage className="pb-6">
      {/* title */}
      <div className="pt-1 text-center">
        <div className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8178]">{eyebrow}</div>
        <h1 className="truncate font-display text-[22px] font-black leading-tight text-[#2b2724]">{puzzle.title}</h1>
      </div>

      {/* top bar */}
      <div className="mt-2 flex items-center gap-2">
        <RoundBtn label="Back to case list" onClick={() => navigate(backTo)}>
          <ChevronLeft className="size-5" strokeWidth={2.6} />
        </RoundBtn>
        <RoundBtn label="How to play" onClick={() => setHelpOpen(true)}>
          <CircleHelp className="size-5" />
        </RoundBtn>
        <div className="flex flex-1 justify-center">
          <TimerPill ms={state?.elapsedMs ?? 0} stopped={paused || phase === 'solved'} />
        </div>
        <RoundBtn label="Undo (U)" onClick={onUndo} disabled={!editable || !state?.undoStack.length}>
          <Undo2 className="size-5" />
        </RoundBtn>
        <RoundBtn label="Pause (P)" onClick={() => store().setPaused(true)} disabled={!ready || phase === 'solved'}>
          <Pause className="size-5" fill="currentColor" />
        </RoundBtn>
      </div>

      {/* board */}
      <ShakeOnError shake={shake} className="mt-3">
        <div className={clsx('mx-auto w-full transition-[filter] duration-200', paused && 'blur-md')}>
          {ready ? (
            <Board
              puzzle={puzzle}
              placements={placements}
              notes={notes}
              selectedPersonId={phase === 'placing' ? selectedId : null}
              tool={tool}
              highlightCells={highlightCells}
              violations={violations}
              onCellTap={onCellTap}
            />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-[20px] bg-[#e9e1d5]" />
          )}
        </div>
      </ShakeOnError>

      {/* tools */}
      <ToolBar
        className="mt-3"
        tool={tool}
        onTool={(t) => store().setTool(t)}
        hintsLeft={hintsLeft}
        onHint={onHint}
        disabled={!editable}
      />

      {/* suspects */}
      <SuspectBar
        className="mt-2"
        people={people}
        placements={placements}
        selectedId={selectedId}
        onSelect={(id) => store().select(id)}
        violations={violations}
      />

      {/* clue */}
      <ClueCard className="mt-2" person={selected} clues={selected ? cluesFor(selected.id) : []} />

      {/* submit */}
      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={!ready || (phase === 'placing' && (!everyonePlaced || paused)) || (phase === 'solved' && !result)}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'mt-4 h-14 w-full rounded-2xl text-base font-bold transition-colors',
          'disabled:cursor-not-allowed disabled:bg-[#e2d9cc] disabled:text-[#9b9186] disabled:shadow-none',
          phase === 'solved'
            ? 'bg-[#3f9d55] text-white shadow-[0_14px_26px_-14px_#3f9d55]'
            : 'bg-[#e8632b] text-white shadow-[0_14px_26px_-14px_#e8632b] hover:bg-[#d9561f]',
        )}
      >
        {submitLabel}
      </motion.button>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <PauseOverlay
        open={paused && !helpOpen}
        elapsedMs={state?.elapsedMs ?? 0}
        title={puzzle.title}
        exitTo={backTo}
        onResume={() => store().setPaused(false)}
      />
      <KillerSheet
        key={round}
        open={killerOpen && phase === 'killer'}
        onClose={() => setKillerOpen(false)}
        suspects={suspects}
        victim={victim}
        victimClues={victim ? cluesFor(victim.id) : []}
        onGuess={onGuess}
      />
      <ResultSheet
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        result={result}
        killer={people.find((p) => p.id === puzzle.killerId)}
        title={puzzle.title}
        parSeconds={puzzle.parSeconds}
        onNext={next ? () => navigate(next) : null}
        onList={() => navigate(backTo)}
        listLabel={daily ? 'All seasons' : 'Case list'}
        onReplay={onReplay}
      />
    </FilesPage>
  );
}

const EMPTY_PLACEMENTS: Record<string, Cell | null> = {};
const EMPTY_NOTES: Record<string, string[]> = {};

function RoundBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#2b2724] shadow-[0_6px_16px_-10px_rgb(70_45_20/0.4)] ring-1 ring-black/5 transition-colors hover:bg-[#fbf8f3] disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}

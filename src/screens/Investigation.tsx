import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import clsx from 'clsx';
import { ArrowLeft, Archive, Gavel, Map as MapIcon, Puzzle, Search, Users } from 'lucide-react';
import type { CaseFile, Hotspot } from '@/data/types';
import { allPuzzlesSolved, currentScore, game, type Session } from '@/engine/store';
import { SceneView } from '@/components/scene/SceneView';
import { AccuseBoard } from '@/components/game/AccuseBoard';
import { EvidenceDrawer, EvidenceList } from '@/components/game/EvidenceDrawer';
import { HintLantern } from '@/components/game/HintLantern';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';
import { SuspectPanel } from '@/components/game/SuspectPanel';
import { announceClue } from '@/components/game/announce';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { CountDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { toast } from '@/components/ui/Toast';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { pad2, useCaseSession } from './useCaseSession';

type TabId = 'scenes' | 'suspects' | 'evidence' | 'puzzles' | 'accuse';
const TAB_IDS: TabId[] = ['scenes', 'suspects', 'evidence', 'puzzles', 'accuse'];

export default function Investigation() {
  const { caseFile, session } = useCaseSession();
  if (!caseFile) return <Navigate to="/cases" replace />;
  if (!session) return <div className="min-h-[60vh]" />;
  return <InvestigationBody caseFile={caseFile} session={session} />;
}

function InvestigationBody({ caseFile: c, session }: { caseFile: CaseFile; session: Session }) {
  const navigate = useNavigate();
  const reduced = useReducedFx();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const badge = useAnimationControls();

  const raw = params.get('tab');
  const tab: TabId = TAB_IDS.includes(raw as TabId) ? (raw as TabId) : 'scenes';
  const setTab = useCallback(
    (t: TabId) => {
      setParams((p) => {
        const n = new URLSearchParams(p);
        n.set('tab', t);
        return n;
      }, { replace: true });
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    },
    [setParams, reduced],
  );

  useEffect(() => {
    if (session.phase === 'intro') game().setPhase('investigate');
  }, [session.phase]);

  // Bounce the evidence badge when the drawer grows.
  const count = session.foundClues.length;
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current && !reduced) {
      void badge.start({ scale: [1, 1.5, 0.9, 1.15, 1], rotate: [0, -12, 8, 0], transition: { duration: 0.6 } });
    }
    prevCount.current = count;
  }, [count, badge, reduced]);

  const puzzlesDone = allPuzzlesSolved(c, session);
  const score = currentScore(session);
  const accused = session.phase === 'prove' || session.phase === 'solved';

  const tabs: TabItem<TabId>[] = useMemo(
    () => [
      { id: 'scenes', label: 'Scenes', icon: <MapIcon className="size-4" /> },
      { id: 'suspects', label: 'Suspects', icon: <Users className="size-4" /> },
      {
        id: 'evidence',
        label: 'Evidence',
        icon: <Archive className="size-4" />,
        badge: (
          <motion.span animate={badge} className="inline-block">
            <CountDot count={count} />
          </motion.span>
        ),
      },
      {
        id: 'puzzles',
        label: 'Puzzles',
        icon: <Puzzle className="size-4" />,
        badge:
          c.puzzles.length > 0 && !puzzlesDone ? (
            <CountDot count={c.puzzles.length - session.solvedPuzzles.filter((id) => c.puzzles.some((p) => p.id === id)).length} tone="crimson" />
          ) : undefined,
      },
      {
        id: 'accuse',
        label: 'Accuse',
        icon: <Gavel className="size-4" />,
        disabled: !puzzlesDone,
        hint: puzzlesDone ? undefined : 'Open every lock in Puzzles first.',
      },
    ],
    [badge, count, c.puzzles, puzzlesDone, session.solvedPuzzles],
  );

  const onHotspot = (h: Hotspot) => {
    if (h.clueId) {
      const isNew = game().findClue(h.clueId);
      if (isNew) announceClue(c, h.clueId);
      else {
        const clue = c.clues.find((cl) => cl.id === h.clueId);
        if (clue && !h.flavor) toast(`Already in the drawer: ${clue.name}.`, 'info');
      }
    }
    if (h.flavor) toast(h.flavor, 'info', { title: h.label });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-4 sm:pb-24 sm:pt-6">
      {/* Case header */}
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/cases" className="mb-1 inline-flex items-center gap-1 text-xs text-paper/50 hover:text-lantern">
            <ArrowLeft className="size-3.5" /> Files
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: c.palette.glow }}>
            Case Nº {pad2(c.number)} · {c.difficulty}
          </div>
          <h1 className="font-display text-2xl font-black leading-tight sm:text-3xl">{c.title}</h1>
          <p className="mt-0.5 truncate text-xs text-paper/50">
            {c.location} · {c.time}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2">
            <ProgressRing value={count / Math.max(1, c.clues.length)} size={40} stroke={4} label="Evidence found" color="var(--color-teal)">
              <span className="text-[10px]">
                {count}/{c.clues.length}
              </span>
            </ProgressRing>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-paper/45">Score</div>
              <AnimatedNumber value={score} className="font-mono text-lg font-semibold tabular-nums text-lantern" />
            </div>
          </div>
          <Button variant="subtle" icon={<Archive className="size-4" />} onClick={() => setDrawer(true)} className="hidden sm:inline-flex">
            Drawer
          </Button>
        </div>
      </header>

      {accused && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3"
        >
          <span className="text-sm text-paper/85">
            {session.phase === 'solved' ? 'Case closed. The file is stamped and filed.' : "You've named the culprit. Now prove it."}
          </span>
          <Button size="sm" variant="danger" icon={<Gavel className="size-3.5" />} onClick={() => navigate(`/case/${c.id}/verdict`)}>
            {session.phase === 'solved' ? 'See the verdict' : 'Go to the verdict'}
          </Button>
        </motion.div>
      )}

      {/* Desktop tabs */}
      <Tabs items={tabs} value={tab} onChange={setTab} className="mb-6 hidden sm:flex" />

      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'scenes' && <ScenesTab caseFile={c} session={session} onHotspot={onHotspot} />}
          {tab === 'suspects' && <SuspectPanel caseFile={c} session={session} />}
          {tab === 'evidence' && (
            <div className="glass rounded-2xl p-4 sm:p-6">
              <EvidenceList caseFile={c} session={session} />
            </div>
          )}
          {tab === 'puzzles' && <PuzzleBoard caseFile={c} session={session} />}
          {tab === 'accuse' &&
            (accused ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Gavel className="mx-auto mb-3 size-10 text-crimson" />
                <h3 className="font-display text-2xl font-bold">The accusation stands.</h3>
                <Button className="mt-4" onClick={() => navigate(`/case/${c.id}/verdict`)}>
                  Continue to the verdict
                </Button>
              </div>
            ) : puzzlesDone ? (
              <AccuseBoard caseFile={c} session={session} onCorrect={() => navigate(`/case/${c.id}/verdict`)} />
            ) : (
              <div className="glass rounded-2xl p-10 text-center text-paper/60">Open every lock in Puzzles first.</div>
            ))}
        </motion.main>
      </AnimatePresence>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
        <Tabs items={tabs} value={tab} onChange={setTab} variant="bottom" />
      </div>

      {session.phase !== 'solved' && <HintLantern caseFile={c} session={session} />}
      <EvidenceDrawer open={drawer} onClose={() => setDrawer(false)} caseFile={c} session={session} />
    </div>
  );
}

function ScenesTab({ caseFile: c, session, onHotspot }: { caseFile: CaseFile; session: Session; onHotspot: (h: Hotspot) => void }) {
  const [sceneId, setSceneId] = useState(c.scenes[0]?.id ?? '');
  const scene = c.scenes.find((s) => s.id === sceneId) ?? c.scenes[0];
  if (!scene) return null;

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {c.scenes.map((s) => {
          const clueSpots = s.hotspots.filter((h) => h.clueId);
          const found = clueSpots.filter((h) => h.clueId && session.foundClues.includes(h.clueId)).length;
          const active = s.id === scene.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSceneId(s.id)}
              className={clsx(
                'flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-all',
                active ? 'border-brass/60 bg-brass/10 shadow-glow' : 'border-white/7 bg-fog/50 hover:border-brass/30',
              )}
            >
              <span
                className="size-7 shrink-0 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${s.palette[0]}, ${s.palette[1]}, ${s.palette[2]})` }}
              />
              <span>
                <span className={clsx('block text-sm font-semibold', active ? 'text-lantern' : 'text-paper')}>{s.name}</span>
                <span className="block text-[10px] uppercase tracking-wider text-paper/45">
                  {clueSpots.length === 0 ? 'Atmosphere only' : found === clueSpots.length ? 'Swept clean' : `${found}/${clueSpots.length} found`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="max-w-3xl text-sm italic leading-relaxed text-paper/60">{scene.description}</p>
      <AnimatePresence mode="wait">
        <motion.div key={scene.id} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <SceneView scene={scene} foundClueIds={session.foundClues} onHotspot={onHotspot} />
        </motion.div>
      </AnimatePresence>
      <p className="flex items-center gap-1.5 text-xs text-paper/40">
        <Search className="size-3.5" /> Glowing points can be examined. Pinned ones are already in your drawer.
      </p>
    </div>
  );
}

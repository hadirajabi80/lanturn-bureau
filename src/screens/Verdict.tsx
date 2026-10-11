import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, FolderOpen, RotateCcw, Scale } from 'lucide-react';
import { nextCase } from '@/data';
import type { CaseFile } from '@/data/types';
import { game, isUnlockedIn, useGame, type Session } from '@/engine/store';
import { RANK_COLOR, RANK_LABEL, rankFor, scoreBreakdown } from '@/engine/scoring';
import { sfx } from '@/engine/audio';
import { Avatar } from '@/components/avatar/Avatar';
import { CountUp, Stamp, Typewriter, fireConfetti } from '@/components/fx';
import { DialogueBox } from '@/components/game/DialogueBox';
import { ProveIt } from '@/components/game/ProveIt';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import { reducedFxNow, useReducedFx } from '@/components/ui/useReducedFx';
import { pad2, useCaseSession } from './useCaseSession';

type Step = 'confession' | 'prove' | 'solution' | 'closing' | 'rank';

export default function Verdict() {
  const { caseFile, session } = useCaseSession();
  if (!caseFile) return <Navigate to="/cases" replace />;
  if (!session) return <div className="min-h-[60vh]" />;
  if (session.phase !== 'prove' && session.phase !== 'solved') return <Navigate to={`/case/${caseFile.id}/play`} replace />;
  return <VerdictBody caseFile={caseFile} session={session} />;
}

function VerdictBody({ caseFile: c, session }: { caseFile: CaseFile; session: Session }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(session.phase === 'solved' ? 'rank' : 'confession');
  const culprit = c.suspects.find((s) => s.character.id === c.culpritId);

  const finish = () => {
    game().completeCase();
    setStep('solution');
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pt-10">
      <div className="mb-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: c.palette.glow }}>
          Case Nº {pad2(c.number)} · The verdict
        </div>
        <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">{c.title}</h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          {step === 'confession' && culprit && (
            <Confession
              caseFile={c}
              onNext={() => (c.proveIt.length > 0 ? setStep('prove') : finish())}
            />
          )}
          {step === 'prove' && <ProveIt caseFile={c} session={session} onDone={finish} />}
          {step === 'solution' && (
            <div className="paper rounded-md px-5 py-8 sm:px-12 sm:py-10">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8a6a35]">Case summary · for the archive</div>
              <h2 className="mt-2 font-display text-3xl font-black text-[#1f1a12]">What really happened</h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#2a2218] sm:text-base">
                {c.solution.map((p, i) => (
                  <RichText key={i} text={p} tone="paper" />
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button icon={<BookOpen className="size-4" />} onClick={() => setStep(c.closingDialogue.length ? 'closing' : 'rank')}>
                  Back at the Bureau
                </Button>
              </div>
            </div>
          )}
          {step === 'closing' && (
            <div className="pt-10">
              <DialogueBox lines={c.closingDialogue} caseFile={c} onDone={() => setStep('rank')} doneLabel="File it" />
            </div>
          )}
          {step === 'rank' && <RankReveal caseFile={c} session={session} onReread={() => setStep('solution')} onNavigate={navigate} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Confession({ caseFile: c, onNext }: { caseFile: CaseFile; onNext: () => void }) {
  const culprit = c.suspects.find((s) => s.character.id === c.culpritId);
  const [stamp, setStamp] = useState(false);
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamp(true);
      sfx.stamp();
    }, 500);
    return () => window.clearTimeout(t);
  }, []);
  if (!culprit) return null;
  const ch = culprit.character;
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(200_50_60/0.18),transparent_60%)]" />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <Avatar spec={ch.avatar} size={168} mood="sad" speaking={!typed} />
          <div className="absolute -right-10 bottom-2">
            <Stamp text="Guilty" show={stamp} />
          </div>
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold">{ch.name}</h2>
        <div className="text-sm text-paper/50">{ch.role}</div>
        <p className="mt-5 max-w-2xl font-display text-lg italic leading-relaxed text-paper/90 sm:text-xl">
          “<Typewriter text={culprit.accusedRight ?? '...Fine. You got me. I suppose you want to know how.'} speed={22} onDone={() => setTyped(true)} />”
        </p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: typed ? 1 : 0 }} className="mt-8">
          <Button size="lg" icon={<Scale className="size-4" />} onClick={onNext} disabled={!typed}>
            {c.proveIt.length > 0 ? 'Now prove it' : 'Close the case'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function RankReveal({
  caseFile: c,
  session,
  onReread,
  onNavigate,
}: {
  caseFile: CaseFile;
  session: Session;
  onReread: () => void;
  onNavigate: (to: string) => void;
}) {
  const reduced = useReducedFx();
  const progress = useGame((s) => s.progress);
  const score = session.finalScore ?? scoreBreakdown(session).total;
  const rank = rankFor(score);
  const best = progress[c.id]?.score ?? score;
  const b = scoreBreakdown(session);
  const nxt = nextCase(c.id);
  const nextOpen = nxt ? isUnlockedIn(progress, nxt.id) : false;
  const [stamped, setStamped] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamped(true);
      sfx.stamp();
      if (!fired.current) {
        fired.current = true;
        sfx.success();
        if (!reducedFxNow()) fireConfetti('rank');
      }
    }, reduced ? 200 : 1300);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const rows: [string, number][] = [
    ['Wrong accusations', b.accusations],
    ['Wrong prove-it answers', b.proveIt],
    ['Hints lit', b.hints],
    ['Wrong presses', b.presses],
  ];

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 text-center sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(circle at 50% 30%, ${RANK_COLOR[rank]}33, transparent 60%)` }}
      />
      <div className="relative">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-paper/50">Final score</div>
        <div className="mt-2 font-mono text-6xl font-semibold text-lantern sm:text-7xl">
          <CountUp to={score} duration={1200} />
        </div>

        <div className="relative mx-auto mt-6 grid h-40 w-40 place-items-center">
          <AnimatePresence>
            {stamped && (
              <motion.div
                initial={reduced ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 14 }}
                className="grid size-36 place-items-center rounded-full border-[6px] font-display text-8xl font-black"
                style={{ color: RANK_COLOR[rank], borderColor: RANK_COLOR[rank], boxShadow: `0 0 60px -10px ${RANK_COLOR[rank]}, inset 0 0 30px -10px ${RANK_COLOR[rank]}` }}
              >
                {rank}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: stamped ? 1 : 0 }}
          className="mt-4 font-display text-xl italic text-paper/85"
        >
          {RANK_LABEL[rank]}
        </motion.p>
        {best > score && <p className="mt-1 text-xs text-paper/45">Your best on this file: {best}</p>}

        <div className="mx-auto mt-6 max-w-sm space-y-1.5 text-left text-sm">
          <div className="flex justify-between text-paper/60">
            <span>Opening balance</span>
            <span className="font-mono">{b.start}</span>
          </div>
          {rows.map(([label, v]) => (
            <div key={label} className="flex justify-between text-paper/60">
              <span>{label}</span>
              <span className={v > 0 ? 'font-mono text-[#ff8a90]' : 'font-mono text-paper/35'}>{v > 0 ? `−${v}` : '0'}</span>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {nxt && nextOpen && (
            <Button size="lg" iconRight={<ArrowRight className="size-4" />} onClick={() => onNavigate(`/case/${nxt.id}`)} autoFocus>
              Next case · Nº {pad2(nxt.number)}
            </Button>
          )}
          {!nxt && (
            <p className="w-full font-display text-lg italic text-paper/75">That was the last file. Greywick sleeps a little easier.</p>
          )}
          <Button size="lg" variant="ghost" icon={<FolderOpen className="size-4" />} onClick={() => onNavigate('/cases')}>
            Back to the files
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          <button type="button" onClick={onReread} className="text-paper/45 hover:text-lantern">
            Read the solution again
          </button>
          <button
            type="button"
            onClick={() => {
              game().restartCase(c.id);
              onNavigate(`/case/${c.id}`);
            }}
            className="inline-flex items-center gap-1 text-paper/45 hover:text-lantern"
          >
            <RotateCcw className="size-3" /> Replay for a better rank
          </button>
        </div>
      </div>
    </div>
  );
}

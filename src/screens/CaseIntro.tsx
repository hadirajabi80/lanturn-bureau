import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock, FileWarning, MapPin, MessagesSquare, Play, RotateCcw, Search, Trophy } from 'lucide-react';
import { game } from '@/engine/store';
import { sfx } from '@/engine/audio';
import { Stamp } from '@/components/fx';
import { DialogueBox } from '@/components/game/DialogueBox';
import { Button } from '@/components/ui/Button';
import { DynamicIcon, KIND_META } from '@/components/ui/ClueIcon';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { pad2, useCaseSession } from './useCaseSession';

type Step = 'brief' | 'dialogue' | 'ready';

const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme' } as const;

export default function CaseIntro() {
  const navigate = useNavigate();
  const reduced = useReducedFx();
  const { caseFile: c, session } = useCaseSession();
  const [step, setStep] = useState<Step>('brief');
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamped(true);
      sfx.stamp();
    }, reduced ? 150 : 650);
    return () => window.clearTimeout(t);
  }, [reduced]);

  if (!c) return <Navigate to="/cases" replace />;

  const phase = session?.phase ?? 'intro';
  const begin = () => {
    game().startCase(c.id);
    game().setPhase('investigate');
    navigate(`/case/${c.id}/play`);
  };
  const restart = () => {
    game().restartCase(c.id);
    setStep('brief');
  };
  const initialClues = c.clues.filter((cl) => cl.initial);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pt-10">
      <button
        type="button"
        onClick={() => navigate('/cases')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-paper/55 transition-colors hover:text-lantern"
      >
        <ArrowLeft className="size-4" /> All files
      </button>

      {/* The paper briefing */}
      <motion.article
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 80, rotate: -2.5 }}
        animate={{ opacity: 1, y: 0, rotate: reduced ? 0 : -0.4 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="paper relative rounded-md px-5 py-8 sm:px-12 sm:py-12"
      >
        {/* paperclip */}
        <div className="absolute -top-4 left-10 h-14 w-5 rounded-full border-[3px] border-[#9aa3b0] border-b-transparent opacity-80" aria-hidden />
        <div className="absolute right-4 top-4 sm:right-10 sm:top-8">
          <Stamp text={`Case file Nº ${pad2(c.number)}`} show={stamped} />
        </div>

        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8a6a35]">
          Lantern Bureau · {DIFF_LABEL[c.difficulty]} · Confidential
        </div>
        <h1 className="mt-3 max-w-[80%] font-display text-3xl font-black leading-tight text-[#1f1a12] sm:text-5xl">{c.title}</h1>
        <p className="mt-2 font-display text-lg italic text-[#5b4a30]">{c.tagline}</p>

        <dl className="mt-6 grid gap-3 border-y border-[#8a6a35]/25 py-4 text-sm text-[#3b3122] sm:grid-cols-3">
          <div className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#8a6a35]" />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8a6a35]">Location</dt>
              <dd>{c.location}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-[#8a6a35]" />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8a6a35]">Time</dt>
              <dd>{c.time}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <FileWarning className="mt-0.5 size-4 shrink-0 text-[#8a6a35]" />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8a6a35]">The crime</dt>
              <dd>{c.crime}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 space-y-4 font-body text-[15px] leading-relaxed text-[#2a2218] sm:text-base">
          {c.briefing.map((p, i) => (
            <motion.p
              key={i}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className={i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:leading-[0.85] first-letter:text-[#8a2a20]' : undefined}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {initialClues.length > 0 && (
          <div className="mt-8">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6a35]">Enclosed with this file</div>
            <div className="flex flex-wrap gap-2">
              {initialClues.map((cl) => (
                <span key={cl.id} className="inline-flex items-center gap-1.5 rounded-md border border-[#8a6a35]/30 bg-white/40 px-2.5 py-1 text-xs text-[#3b3122]">
                  <DynamicIcon name={cl.icon} fallback={KIND_META[cl.kind].icon} className="size-3.5 text-[#8a6a35]" />
                  {cl.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.article>

      {/* What next */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {phase === 'solved' ? (
            <motion.div key="solved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3">
              <Button icon={<Trophy className="size-4" />} onClick={() => navigate(`/case/${c.id}/verdict`)}>
                Review the verdict
              </Button>
              <Button variant="ghost" icon={<RotateCcw className="size-4" />} onClick={restart}>
                Replay this case
              </Button>
            </motion.div>
          ) : phase !== 'intro' ? (
            <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                icon={<Play className="size-4" />}
                onClick={() => navigate(phase === 'prove' ? `/case/${c.id}/verdict` : `/case/${c.id}/play`)}
              >
                {phase === 'prove' ? 'Back to the verdict' : 'Resume investigation'}
              </Button>
              <Button size="lg" variant="ghost" icon={<RotateCcw className="size-4" />} onClick={restart}>
                Start over
              </Button>
            </motion.div>
          ) : step === 'brief' ? (
            <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap justify-center gap-3">
              <Button size="lg" icon={<MessagesSquare className="size-4" />} onClick={() => setStep('dialogue')}>
                Report to the Chief
              </Button>
              <Button size="lg" variant="ghost" icon={<Search className="size-4" />} onClick={begin}>
                Skip to the scene
              </Button>
            </motion.div>
          ) : step === 'dialogue' ? (
            <motion.div key="dialogue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-8">
              <DialogueBox lines={c.openingDialogue} caseFile={c} onDone={() => setStep('ready')} doneLabel="To work" />
            </motion.div>
          ) : (
            <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 text-center">
              <p className="font-display text-xl italic text-paper/70">The fog is thick. The lies are thicker.</p>
              <Button size="lg" hum icon={<Search className="size-5" />} onClick={begin} data-autofocus autoFocus>
                Begin investigation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

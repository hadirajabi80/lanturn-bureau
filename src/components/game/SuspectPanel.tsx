import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronRight, HeartCrack, MapPin, Scale, Users } from 'lucide-react';
import type { CaseFile, Mood, Suspect } from '@/data/types';
import { statementKey, type Session } from '@/engine/store';
import { sfx } from '@/engine/audio';
import { Avatar } from '@/components/avatar/Avatar';
import { Typewriter } from '@/components/fx';
import { Button } from '@/components/ui/Button';
import { useReducedFx } from '@/components/ui/useReducedFx';
import { StatementCard } from './StatementCard';

export interface SuspectPanelProps {
  caseFile: CaseFile;
  session: Session;
}

function suspectStats(session: Session, s: Suspect) {
  const id = s.character.id;
  const read = s.statements.filter((st) => session.readStatements.includes(statementKey(id, st.id))).length;
  const broken = s.statements.filter((st) => session.brokenStatements.includes(statementKey(id, st.id))).length;
  return { read, broken, total: s.statements.length };
}

function moodFor(session: Session, s: Suspect): Mood {
  const { broken } = suspectStats(session, s);
  const breakable = s.statements.filter((st) => st.contradictedBy).length;
  if (breakable > 0 && broken >= breakable) return 'sad';
  if (broken > 0) return 'angry';
  return 'neutral';
}

/** Number of leading statements already read (they show immediately). */
function initialRevealed(session: Session, s: Suspect): number {
  let n = 0;
  for (const st of s.statements) {
    if (session.readStatements.includes(statementKey(s.character.id, st.id))) n++;
    else break;
  }
  return n;
}

export function SuspectPanel({ caseFile, session }: SuspectPanelProps) {
  const [selectedId, setSelectedId] = useState<string>(caseFile.suspects[0]?.character.id ?? '');
  const selected = caseFile.suspects.find((s) => s.character.id === selectedId) ?? caseFile.suspects[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Roster */}
      <nav aria-label="Suspects" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        <div className="hidden items-center gap-2 px-1 pb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80 lg:flex">
          <Users className="size-3.5" /> Persons of interest
        </div>
        {caseFile.suspects.map((s) => {
          const st = suspectStats(session, s);
          const active = s.character.id === selected?.character.id;
          return (
            <button
              key={s.character.id}
              type="button"
              onClick={() => {
                sfx.blip();
                setSelectedId(s.character.id);
              }}
              className={clsx(
                'flex min-w-[210px] items-center gap-3 rounded-2xl border p-2.5 pr-3 text-left transition-all lg:min-w-0',
                active ? 'border-brass/60 bg-brass/10 shadow-glow' : 'border-white/6 bg-fog/50 hover:border-brass/30 hover:bg-fog-2/60',
              )}
              aria-current={active || undefined}
            >
              <Avatar spec={s.character.avatar} size={48} mood={moodFor(session, s)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold leading-tight text-paper">{s.character.name}</span>
                <span className="block truncate text-xs text-paper/55">{s.character.role}</span>
                <span className="mt-1 flex items-center gap-1" aria-label={`${st.read} of ${st.total} statements heard`}>
                  {s.statements.map((x) => {
                    const key = statementKey(s.character.id, x.id);
                    const b = session.brokenStatements.includes(key);
                    const r = session.readStatements.includes(key);
                    return (
                      <span
                        key={x.id}
                        className={clsx('h-1.5 w-4 rounded-full', b ? 'bg-crimson' : r ? 'bg-brass/70' : 'bg-white/12')}
                      />
                    );
                  })}
                </span>
              </span>
              <ChevronRight className={clsx('size-4 shrink-0 transition-transform', active ? 'text-brass' : 'text-paper/25')} />
            </button>
          );
        })}
      </nav>

      {/* Interview */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.character.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Interview caseFile={caseFile} session={session} suspect={selected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Interview({ caseFile, session, suspect }: { caseFile: CaseFile; session: Session; suspect: Suspect }) {
  const reduced = useReducedFx();
  const ch = suspect.character;
  const [revealed, setRevealed] = useState(() => initialRevealed(session, suspect));
  const [greeted, setGreeted] = useState(() => revealed > 0);
  const [typing, setTyping] = useState(false);
  const total = suspect.statements.length;
  const { read } = suspectStats(session, suspect);
  const mood = moodFor(session, suspect);

  const next = () => {
    sfx.blip();
    const upcoming = suspect.statements[revealed];
    const unread = upcoming ? !session.readStatements.includes(statementKey(ch.id, upcoming.id)) : false;
    setRevealed((n) => Math.min(total, n + 1));
    setTyping(unread);
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-40 blur-3xl"
          style={{ background: ch.avatar.accent }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <motion.div
            className="shrink-0 self-center sm:self-start"
            animate={reduced ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Avatar spec={ch.avatar} size={120} mood={typing ? 'neutral' : mood} speaking={typing || !greeted} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">{ch.role} · {ch.age}</div>
            <h3 className="font-display text-2xl font-bold leading-tight">{ch.name}</h3>
            <p className="mt-0.5 text-sm italic text-paper/60">{ch.tagline}</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-black/20 p-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-paper/45">
                  <HeartCrack className="size-3" /> Relation
                </dt>
                <dd className="mt-0.5 text-paper/85">{suspect.relation}</dd>
              </div>
              <div className="rounded-xl bg-black/20 p-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-paper/45">
                  <MapPin className="size-3" /> Claimed alibi
                </dt>
                <dd className="mt-0.5 text-paper/85">{suspect.alibi}</dd>
              </div>
              {suspect.motive && (
                <div className="rounded-xl bg-black/20 p-2.5 sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-paper/45">
                    <Scale className="size-3" /> Possible motive
                  </dt>
                  <dd className="mt-0.5 text-paper/85">{suspect.motive}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        <div className="relative mt-4 rounded-xl border border-white/6 bg-ink/50 p-3.5 text-paper/90">
          <span className="mr-1 text-brass">“</span>
          {greeted ? suspect.greeting : <Typewriter text={suspect.greeting} speed={16} onDone={() => setGreeted(true)} />}
          <span className="ml-0.5 text-brass">”</span>
        </div>
      </div>

      {/* Statements */}
      <div className="space-y-3">
        {suspect.statements.slice(0, revealed).map((st, i) => (
          <StatementCard
            key={st.id}
            caseFile={caseFile}
            session={session}
            suspect={suspect}
            statement={st}
            index={i}
            onRead={() => setTyping(false)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-paper/45">
          {read}/{total} statements heard
        </span>
        {revealed < total ? (
          <Button
            variant="subtle"
            disabled={!greeted || typing}
            onClick={next}
            iconRight={<ChevronRight className="size-4" />}
            data-autofocus
          >
            {revealed === 0 ? 'Ask for a statement' : 'Continue'}
          </Button>
        ) : (
          <span className="text-xs italic text-paper/45">That's everything {ch.name.split(' ')[0]} is willing to say.</span>
        )}
      </div>
    </div>
  );
}

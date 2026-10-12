/**
 * The interactive tutorial: a hand-made 4×4 case (./practice.ts) on the real board, with Otto
 * coaching one move at a time (read a statement, pin, mark "nobody here", deduce, close, accuse).
 * Local state only: it never touches the player's saved progress. Route: /plans/guide/practice.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eraser, MapPin, Square, X } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { BUREAU } from '@/data/bureau';
import { Board } from '@/grid/board';
import { checkPlacement } from '@/grid/engine';
import { OCCUPIABLE, cellKey, type Cell } from '@/grid/types';
import { BrassButton, GhostButton, PageShell, SkinProvider, useFpReduced } from '@/grid/ui';
import { PRACTICE, PRACTICE_IDS } from './practice';
import { markGuideDone } from './progress';

type Tool = 'pin' | 'cross' | 'empty' | 'erase';

const P = PRACTICE;
const ID = PRACTICE_IDS;
const person = (id: string) => P.people.find((p) => p.id === id)!;
const C = (r: number, c: number): Cell => ({ r, c });
const same = (a: Cell | null | undefined, b: Cell) => !!a && a.r === b.r && a.c === b.c;
const blockedAt = (cell: Cell) => P.furniture.some((f) => !OCCUPIABLE[f.kind] && f.cells.some((x) => same(x, cell)));
const everyone = P.people.map((p) => p.id);

interface Desk {
  placements: Record<string, Cell | null>;
  crosses: Record<string, string[]>;
}

const isEmpty = (d: Desk, cell: Cell) => {
  const list = d.crosses[cellKey(cell)] ?? [];
  return everyone.every((id) => list.includes(id));
};

/** Nora's row and column, minus her square and the table. */
const NORA_LINES = [C(0, 0), C(0, 2), C(1, 1), C(2, 1), C(3, 1)];

interface Step {
  title: string;
  body: string;
  /** a tool to suggest (its button gets a highlighter ring) */
  tool?: Tool;
  /** a person to suggest (their photo gets a ring) */
  who?: string;
  highlight?: Cell[];
  /** finished when true (no Next button) */
  done?: (d: Desk, selected: string | null) => boolean;
  next?: string;
}

const STEPS: Step[] = [
  {
    title: 'Your first case',
    body: 'Four people were in this house tonight. Henry is the victim. Put everyone on the square where they really were, then name the killer.',
    next: 'Show me',
  },
  {
    title: 'The one rule',
    body: 'Every row holds exactly one person, and so does every column. The coloured areas are rooms. You can sit in the armchair or on the sofa, but nobody can stand on the bookshelf, the table or the plant.',
    next: 'Got it',
  },
  {
    title: 'Read a statement',
    body: 'Tap Nora’s photo under the plan to read what she told us.',
    who: ID.nora,
    done: (_d, sel) => sel === ID.nora,
  },
  {
    title: 'Pin Nora',
    body: '“She was sitting in the armchair.” There is only one armchair. Keep Pin selected and tap it.',
    tool: 'pin',
    highlight: [C(0, 1)],
    done: (d) => same(d.placements[ID.nora], C(0, 1)),
  },
  {
    title: 'Nobody else fits here',
    body: 'Nora now owns the top row and the second column, so nobody else can be in them. Choose Nobody here and drag across the other squares of her row and column.',
    tool: 'empty',
    highlight: NORA_LINES,
    done: (d) => NORA_LINES.every((c) => isEmpty(d, c)),
  },
  {
    title: 'Oliver',
    body: 'Oliver was in the Kitchen. One Kitchen square is in Nora’s row and one holds the table, so only one is left. Tap Oliver’s photo, choose Pin, and pin him there.',
    tool: 'pin',
    who: ID.oliver,
    highlight: [C(0, 2), C(0, 3), C(1, 3)],
    done: (d) => same(d.placements[ID.oliver], C(1, 3)),
  },
  {
    title: 'Grace',
    body: 'Grace was right next to the bookshelf. Three squares touch it, but the top two rows are taken now. Pin Grace on the one that is left.',
    tool: 'pin',
    who: ID.grace,
    highlight: [C(0, 0), C(1, 1), C(2, 0)],
    done: (d) => same(d.placements[ID.grace], C(2, 0)),
  },
  {
    title: 'Henry',
    body: 'Only one row and one column are still free. The square where they cross is Henry’s. Pin him.',
    tool: 'pin',
    who: ID.henry,
    done: (d) => same(d.placements[ID.henry], C(3, 2)),
  },
  {
    title: 'Close the case',
    body: 'Everyone is pinned, one per row and column. In a real case a wrong plan burns the file, so check it once, then close the case.',
    next: 'Close the case',
  },
  {
    title: 'Name the killer',
    body: 'Henry was alone with the killer. Who is in his room?',
  },
  {
    title: 'Case closed',
    body: 'That is the whole game. Real cases have bigger plans, more statements and trickier scenarios. When you are stuck, Ask Otto explains the next step.',
  },
];
const ACCUSE = 9;
const LAST = STEPS.length - 1;

const TOOLS: { id: Tool; label: string; icon: typeof MapPin }[] = [
  { id: 'pin', label: 'Pin', icon: MapPin },
  { id: 'cross', label: 'Cross', icon: X },
  { id: 'empty', label: 'Nobody here', icon: Square },
  { id: 'erase', label: 'Erase', icon: Eraser },
];

export default function PracticeCase() {
  const reduced = useFpReduced();
  const [desk, setDesk] = useState<Desk>(() => ({ placements: Object.fromEntries(everyone.map((id) => [id, null])), crosses: {} }));
  const [selected, setSelected] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('pin');
  const [step, setStep] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const stroke = useRef(true);

  const s = STEPS[step];

  // finish a step as soon as its condition holds
  useEffect(() => {
    if (!s.done || !s.done(desk, selected)) return;
    const t = window.setTimeout(() => {
      setNote(null);
      setStep((n) => Math.min(n + 1, LAST));
    }, reduced ? 150 : 650);
    return () => window.clearTimeout(t);
  }, [desk, selected, s, reduced]);

  useEffect(() => {
    if (step === LAST) markGuideDone();
  }, [step]);

  const say = (text: string) => setNote(text);

  const tap = useCallback(
    (cell: Cell) => {
      const key = cellKey(cell);
      const occupant = Object.entries(desk.placements).find(([, c]) => same(c, cell))?.[0] ?? null;
      setNote(null);
      if (tool === 'erase') {
        const crosses = { ...desk.crosses };
        delete crosses[key];
        const placements = occupant ? { ...desk.placements, [occupant]: null } : desk.placements;
        setDesk({ placements, crosses });
        return;
      }
      if (blockedAt(cell)) return say('Nobody can stand there: that furniture blocks the square.');
      if (tool === 'empty') {
        const crosses = { ...desk.crosses };
        if (isEmpty(desk, cell)) delete crosses[key];
        else crosses[key] = everyone;
        setDesk({ ...desk, crosses });
        return;
      }
      if (occupant && occupant !== selected) {
        setSelected(occupant);
        return;
      }
      if (!selected) return say('First pick a person: tap a photo under the plan.');
      if (tool === 'cross') {
        const list = desk.crosses[key] ?? [];
        const crosses = { ...desk.crosses, [key]: list.includes(selected) ? list.filter((x) => x !== selected) : [...list, selected] };
        if (!crosses[key].length) delete crosses[key];
        setDesk({ ...desk, crosses });
        return;
      }
      // pin (tapping your own pin lifts it)
      if (occupant === selected) {
        setDesk({ ...desk, placements: { ...desk.placements, [selected]: null } });
        return;
      }
      setDesk({ ...desk, placements: { ...desk.placements, [selected]: cell } });
    },
    [desk, selected, tool],
  );

  // Nobody here: drag across squares (the first square decides whether the stroke marks or clears)
  const paint = useCallback(
    (cell: Cell, phase: 'start' | 'move') => {
      if (blockedAt(cell)) return;
      setDesk((d) => {
        if (phase === 'start') stroke.current = !isEmpty(d, cell);
        const crosses = { ...d.crosses };
        if (stroke.current) crosses[cellKey(cell)] = everyone;
        else delete crosses[cellKey(cell)];
        return { ...d, crosses };
      });
    },
    [],
  );

  const closeCase = () => {
    const res = checkPlacement(P, desk.placements as Record<string, Cell>);
    if (res.ok) setStep(ACCUSE);
    else say('Something is still off. Check that every row and column has one person.');
  };

  const accuse = (id: string) => {
    if (id === ID.grace) {
      setWrong(null);
      setStep(LAST);
    } else {
      setWrong(id === ID.oliver ? 'Not Oliver: he was in the Kitchen. Henry is in the Lounge.' : 'Not Nora: she was in the Study. Henry is in the Lounge.');
    }
  };

  const onNext = () => {
    if (step === 8) return closeCase();
    setStep((n) => Math.min(n + 1, LAST));
  };

  const restart = () => {
    setDesk({ placements: Object.fromEntries(everyone.map((id) => [id, null])), crosses: {} });
    setSelected(null);
    setTool('pin');
    setStep(0);
    setNote(null);
    setWrong(null);
  };

  const highlight = useMemo(() => s.highlight ?? [], [s]);
  const sel = selected ? person(selected) : null;
  const selClue = sel ? P.clues.filter((c) => c.personId === sel.id) : [];

  return (
    <SkinProvider district="ashcombe">
      <PageShell title="Practice case" kicker="How to play · 2 minutes" back="/plans/guide" backLabel="How to play">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:items-start">
          {/* the plan, tools and people */}
          <div className="flex flex-col gap-4">
            <div className="fp-panel p-2 sm:p-3" style={{ boxShadow: 'inset 0 0 0 2px var(--fp-ink), var(--fp-shadow)' }}>
              <Board
                puzzle={P}
                skinId="ashcombe"
                placements={desk.placements}
                marks={{ notes: {}, crosses: desk.crosses }}
                selectedPersonId={selected}
                tool={tool}
                highlightCells={highlight}
                onCellTap={tap}
                onCellPaint={paint}
                furnitureLabels
                maxWidth={540}
              />
            </div>

            <div role="toolbar" aria-label="Tools" className="grid grid-cols-4 gap-2">
              {TOOLS.map(({ id, label, icon: Icon }) => {
                const on = tool === id;
                const hint = s.tool === id && !on;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTool(id)}
                    className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[13px] font-semibold"
                    style={{
                      background: on ? 'var(--fp-hl)' : 'var(--fp-panel)',
                      boxShadow: hint ? 'inset 0 0 0 2px var(--fp-ink), 0 0 0 3px var(--fp-hl), 0 0 0 5px var(--fp-ink)' : 'inset 0 0 0 2px var(--fp-ink)',
                    }}
                  >
                    <Icon className="size-4" aria-hidden strokeWidth={2.4} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-2" role="list" aria-label="People">
              {P.people.map((p) => {
                const on = selected === p.id;
                const hint = s.who === p.id && !on;
                const pinned = !!desk.placements[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="listitem"
                    aria-pressed={on}
                    onClick={() => {
                      setSelected(on ? null : p.id);
                      setNote(null);
                    }}
                    className="relative flex flex-col items-center gap-1 rounded-md px-1 pb-2 pt-2"
                    style={{
                      background: on ? 'var(--fp-hl)' : 'var(--fp-panel)',
                      boxShadow: hint ? 'inset 0 0 0 2px var(--fp-ink), 0 0 0 3px var(--fp-hl), 0 0 0 5px var(--fp-ink)' : on ? 'inset 0 0 0 3px var(--fp-ink)' : 'inset 0 0 0 2px var(--fp-ink)',
                    }}
                  >
                    <span className="overflow-hidden rounded-sm" style={{ boxShadow: 'inset 0 0 0 1.5px var(--fp-ink)' }}>
                      <Avatar spec={p.avatar} size={56} mood={p.isVictim ? 'sad' : 'neutral'} />
                    </span>
                    <span className="text-sm font-semibold leading-none">{p.name}</span>
                    {p.isVictim ? (
                      <span className="rounded-sm bg-(--fp-danger) px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">Victim</span>
                    ) : (
                      <span className="text-[11px] font-semibold leading-none text-(--fp-muted)">{pinned ? 'Pinned' : 'Not placed'}</span>
                    )}
                    {pinned && (
                      <Check className="absolute right-1.5 top-1.5 size-4 rounded-full bg-(--fp-green) p-0.5 text-white" aria-label="pinned" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>

            {sel && (
              <div className="fp-panel px-4 py-3" aria-live="polite">
                <div className="text-xs font-semibold text-(--fp-muted)">{sel.name} said</div>
                {selClue.map((c) => (
                  <p key={c.text} className="mt-1 text-[15px] leading-snug">
                    {c.text}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Otto's coaching card (above the plan on phones, so the next move is always in view) */}
          <div className="order-first lg:sticky lg:top-20 lg:order-none">
            <div className="fp-panel fp-panel--glow p-5">
              <div className="flex items-center gap-3">
                <span className="overflow-hidden rounded-md" style={{ boxShadow: 'inset 0 0 0 2px var(--fp-ink)' }}>
                  <Avatar spec={BUREAU.otto.avatar} size={52} mood={step === LAST ? 'happy' : 'neutral'} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-(--fp-muted)">
                    Otto · step <span className="font-mono">{Math.min(step + 1, LAST)}</span> of <span className="font-mono">{LAST}</span>
                  </div>
                  <div className="mt-1 flex gap-1" aria-hidden>
                    {STEPS.slice(0, LAST).map((_, i) => (
                      <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i < step ? 'var(--fp-ink)' : i === step ? 'var(--fp-accent)' : 'var(--fp-hair)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* no exit animation: the next step must appear even if animation frames are paused */}
                <motion.div
                  key={step}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight">{s.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed">{s.body}</p>

                  {step === ACCUSE && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {P.people
                        .filter((p) => !p.isVictim)
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => accuse(p.id)}
                            className="flex flex-col items-center gap-1 rounded-md bg-(--fp-panel) px-1 py-2 text-sm font-semibold"
                            style={{ boxShadow: 'inset 0 0 0 2px var(--fp-ink), var(--fp-shadow)' }}
                          >
                            <Avatar spec={p.avatar} size={44} />
                            {p.name}
                          </button>
                        ))}
                    </div>
                  )}
                  {wrong && step === ACCUSE && <p className="mt-3 text-sm font-semibold text-(--fp-accent2)">{wrong}</p>}

                  {step === LAST && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <BrassButton to="/plans/d/ashcombe/rookie/1" size="lg">
                        Play your first real case
                      </BrassButton>
                      <GhostButton to="/plans/guide" size="lg">
                        Read the rules
                      </GhostButton>
                      <GhostButton onClick={restart} size="lg">
                        Play it again
                      </GhostButton>
                    </div>
                  )}

                  {s.next && (
                    <div className="mt-4">
                      {step === 8 ? (
                        <BrassButton size="lg" onClick={onNext}>
                          {s.next}
                        </BrassButton>
                      ) : (
                        <GhostButton size="md" onClick={onNext}>
                          {s.next}
                        </GhostButton>
                      )}
                    </div>
                  )}
                </motion.div>

              {note && (
                <p role="status" className="mt-4 rounded-md bg-(--fp-hl) px-3 py-2 text-sm font-semibold" style={{ boxShadow: 'inset 0 0 0 1.5px var(--fp-ink)' }}>
                  {note}
                </p>
              )}
            </div>
            {step > 1 && step < LAST && (
              <button type="button" onClick={restart} className="mt-3 text-sm font-semibold text-(--fp-muted) underline underline-offset-4">
                Start over
              </button>
            )}
          </div>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

/**
 * How to play: the rules as a short printed booklet (numbered sections with small diagrams),
 * plus the way into the interactive practice case. Route: /plans/guide.
 */
import type { ReactNode } from 'react';
import { BrassButton, GhostButton, PageShell, SkinProvider, VARIANT_INFO } from '@/grid/ui';
import type { Variant } from '@/grid/types';
import { Diagram } from './Diagram';
import { isGuideDone } from './progress';

const SECTIONS = [
  { id: 'goal', title: 'The goal' },
  { id: 'rule', title: 'One per row, one per column' },
  { id: 'rooms', title: 'Rooms and furniture' },
  { id: 'clues', title: 'Reading statements' },
  { id: 'tools', title: 'Your tools' },
  { id: 'close', title: 'Closing the case' },
  { id: 'scenarios', title: 'Scenarios' },
  { id: 'stars', title: 'Stars and hints' },
] as const;

// a 4×4 example plan used by several diagrams
const ROOMS4 = ['a', 'a', 'b', 'b', 'a', 'a', 'c', 'b', 'd', 'd', 'c', 'c', 'd', 'd', 'd', 'c'];

const PHRASES: Array<{ say: string; means: string }> = [
  { say: 'in the Kitchen', means: 'on any square of that room.' },
  { say: 'in the top row, in row 3', means: 'rows are counted from the top, columns from the left.' },
  { say: 'beside the table', means: 'on a square that shares an edge with the table.' },
  { say: 'sitting in the armchair', means: 'on the armchair’s own square.' },
  { say: 'diagonally beside Ann', means: 'touching Ann’s square at a corner. Two people never share a row or column, so “beside a person” is always diagonal.' },
  { say: 'north of Ann', means: 'in any row above Ann. “Directly north” means above her in the same column.' },
  { say: 'three steps from Ann', means: 'count squares up, down, left and right, never diagonally.' },
  { say: 'could see Ann', means: 'same row, column or diagonal, with no blocking furniture in between. People never block the view.' },
  { say: 'nobody could see her', means: 'no one has a clear sight line to her. “Exactly two people could see her” counts those sight lines.' },
  { say: 'closer to the piano than Ann', means: 'fewer steps (up, down, left, right) to the nearest piano than Ann needs.' },
  { say: 'her room touched the Ballroom', means: 'her room and the Ballroom share a wall somewhere.' },
  { say: 'if she was in the Library, she was sitting down', means: 'only broken when she was in the Library and standing. If she was not in the Library, the statement is true.' },
  { say: 'either beside the piano or with Felix, not both', means: 'exactly one of the two is true.' },
  { say: 'alone in the room', means: 'nobody else is in that room.' },
];

const TOOLS: Array<{ name: string; key: string; what: string }> = [
  { name: 'Pin', key: '1', what: 'Pick a person, then tap a square to pin them there. Tap their pin again to lift it.' },
  { name: 'Pencil', key: '2', what: 'A small note: “maybe here”. Use it when a person has two or three possible squares.' },
  { name: 'Cross', key: '3', what: 'A red X for the selected person only: they were not on this square.' },
  { name: 'Nobody here', key: '4', what: 'A grey square with a black X: no one at all can be here. Tap one square, or drag across a whole row or column.' },
  { name: 'Erase', key: '5', what: 'Clears a square: its pin, notes and crosses.' },
  { name: 'Ask Otto', key: '', what: 'Otto explains the next logical step and shows the squares he used.' },
  { name: 'Reveal', key: '', what: 'Pins one person for you. It lowers your stars.' },
];

const VARIANTS: Variant[] = ['classic', 'lockedRoom', 'poison', 'accomplice', 'sniper', 'liar', 'double', 'liarDouble', 'accompliceLiar'];
const plain = (s: string) => s.replace(/\s+—\s+/g, ': ');

function Section({ n, id, title, children, art }: { n: number; id: string; title: string; children: ReactNode; art?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t-2 border-(--fp-ink) py-7 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm font-semibold text-(--fp-accent)">{String(n).padStart(2, '0')}</span>
        <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{title}</h2>
      </div>
      <div className={art ? 'mt-3 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start' : 'mt-3'}>
        <div className="max-w-[62ch] space-y-3 text-[15.5px] leading-relaxed">{children}</div>
        {art && <figure className="flex flex-wrap gap-4">{art}</figure>}
      </div>
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-1.5 max-w-[11rem] text-xs font-semibold text-(--fp-muted)">{children}</figcaption>;
}

export default function GuideScreen() {
  const done = isGuideDone();
  return (
    <SkinProvider district="ashcombe">
      <PageShell title="How to play" kicker="The rules in two minutes" back="/plans" backLabel="Bureau">
        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <nav aria-label="Sections" className="hidden lg:block">
            <ol className="sticky top-20 space-y-1 text-sm font-semibold">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1 text-(--fp-muted) hover:bg-(--fp-hl) hover:text-(--fp-ink)">
                    <span className="font-mono">{i + 1}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0">
            <header className="fp-panel fp-panel--glow mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="max-w-[46ch]">
                <h1 className="font-display text-3xl font-black leading-none tracking-tight sm:text-4xl">Pin everyone. Then name the killer.</h1>
                <p className="mt-3 text-[15.5px] leading-relaxed text-(--fp-muted)">
                  The fastest way to learn is the practice case: four people, one small house, and Otto telling you what to do next.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <BrassButton to="/plans/guide/practice" size="lg">
                  {done ? 'Play the practice case again' : 'Start the practice case'}
                </BrassButton>
                <GhostButton to="/plans/daily" size="md">
                  Skip to today’s case
                </GhostButton>
              </div>
            </header>

            <Section
              n={1}
              id="goal"
              title="The goal"
              art={
                <div>
                  <Diagram n={4} rooms={ROOMS4} pins={[{ at: [0, 1], label: 'N' }, { at: [1, 3], label: 'O' }, { at: [2, 0], label: 'G' }, { at: [3, 2], label: 'H', red: true }]} title="A solved four by four plan" />
                  <Caption>A solved plan. H is the victim.</Caption>
                </div>
              }
            >
              <p>Every case is a floor plan, a list of people and what each of them said. One of them is the victim.</p>
              <p>Work out the square where every person was standing. When the plan is complete and right, the scenario tells you who the killer is.</p>
              <p>Every case has exactly one answer, and you never need to guess: each square can be reasoned out from the statements.</p>
            </Section>

            <Section
              n={2}
              id="rule"
              title="One per row, one per column"
              art={
                <div>
                  <Diagram
                    n={4}
                    hl={[[1, 0], [1, 1], [1, 2], [1, 3], [0, 2], [2, 2], [3, 2]]}
                    pins={[{ at: [1, 2], label: 'A' }]}
                    empty={[[1, 0], [1, 1], [1, 3], [0, 2], [2, 2], [3, 2]]}
                    title="A's row and column are closed to everyone else"
                  />
                  <Caption>Once A is pinned, the rest of A’s row and column is empty.</Caption>
                </div>
              }
            >
              <p>
                A plan with <b>N</b> rows has <b>N</b> people. Exactly one person stands in each row and exactly one in each column.
              </p>
              <p>
                That is the most useful rule in the game. As soon as you pin someone, every other square in their row and column is out for everybody. Mark those with <b>Nobody here</b> by dragging across them.
              </p>
            </Section>

            <Section
              n={3}
              id="rooms"
              title="Rooms and furniture"
              art={
                <div>
                  <Diagram n={4} rooms={ROOMS4} blocked={[[1, 0], [0, 3], [2, 3]]} seat={[[0, 1], [3, 0], [3, 1]]} title="Rooms with furniture" />
                  <Caption>Black squares block. Outlined ones you can sit on.</Caption>
                </div>
              }
            >
              <p>Thick lines split the plan into rooms. A statement like “in the Study” means any square of that room.</p>
              <p>
                You can stand or sit on <b>chairs, armchairs, sofas, stools, benches, beds, rugs and bathtubs</b>. Every other piece blocks its square: tables, desks, shelves, plants,
                crates, statues and so on. Tap a piece on the plan to see its name.
              </p>
            </Section>

            <Section n={4} id="clues" title="Reading statements">
              <p>Statements are always true, unless the scenario says someone is lying. Read them literally:</p>
              <table className="mt-2 w-full border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b-2 border-(--fp-ink)">
                    <th className="py-2 pr-4 font-display font-extrabold">They say</th>
                    <th className="py-2 font-display font-extrabold">It means</th>
                  </tr>
                </thead>
                <tbody>
                  {PHRASES.map((p) => (
                    <tr key={p.say} className="border-b border-(--fp-hair) align-top">
                      <td className="py-2 pr-4 font-semibold">“{p.say}”</td>
                      <td className="py-2">{p.means}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p id="extra-extreme" className="scroll-mt-20">
                <b>Extra Extreme</b> (the sealed attic, above the roof) never mentions rows, columns, corners or edges. No coordinates: read the
                room. Every statement is about who could see whom, who stood beside or closer to what, and which rooms touched.
              </p>
            </Section>

            <Section
              n={5}
              id="tools"
              title="Your tools"
              art={
                <div className="flex gap-4">
                  <div>
                    <Diagram n={3} cell={38} cross={[[0, 1], [1, 2]]} pins={[{ at: [2, 0], label: 'B' }]} title="Red crosses for one person" />
                    <Caption>Cross: not B here.</Caption>
                  </div>
                  <div>
                    <Diagram n={3} cell={38} empty={[[0, 0], [0, 1], [0, 2]]} title="Nobody here across a row" />
                    <Caption>Nobody here: no one at all.</Caption>
                  </div>
                </div>
              }
            >
              <p>Pick a person by tapping their photo, then pick a tool. On a keyboard, the number keys switch tools.</p>
              <ul className="mt-1 divide-y divide-(--fp-hair) border-y border-(--fp-hair)">
                {TOOLS.map((t) => (
                  <li key={t.name} className="flex gap-3 py-2">
                    <span className="w-28 shrink-0 font-semibold">
                      {t.name}
                      {t.key && <kbd className="ml-1.5 rounded-sm px-1 font-mono text-xs" style={{ boxShadow: 'inset 0 0 0 1.5px var(--fp-ink)' }}>{t.key}</kbd>}
                    </span>
                    <span>{t.what}</span>
                  </li>
                ))}
              </ul>
              <p>Undo and Redo take back any move. The desk never stops you from making a move, so it is up to you to keep the plan consistent.</p>
            </Section>

            <Section n={6} id="close" title="Closing the case">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  When everyone is pinned, press <b>Close the case</b>.
                </li>
                <li>
                  If any statement or the row and column rule is broken, the file <b>burns</b>. That attempt is over and counts as a failure, but you can reopen the case and try again.
                </li>
                <li>
                  If the plan is right, the line-up opens. Read the victim’s statement again and <b>name the killer</b> (and, in some scenarios, the accomplice or both killers). A wrong name burns the file too.
                </li>
              </ol>
              <p>Zen mode never burns: it just points at the first problem.</p>
            </Section>

            <Section n={7} id="scenarios" title="Scenarios">
              <p>The victim’s statement sets the scenario. Rookie cases are always Classic; the others arrive as you climb. The first time you meet one, it is explained on the desk.</p>
              <table className="mt-2 w-full border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b-2 border-(--fp-ink)">
                    <th className="py-2 pr-4 font-display font-extrabold">Scenario</th>
                    <th className="py-2 pr-4 font-display font-extrabold">What happened</th>
                    <th className="hidden py-2 font-display font-extrabold sm:table-cell">You name</th>
                  </tr>
                </thead>
                <tbody>
                  {VARIANTS.map((v) => (
                    <tr key={v} className="border-b border-(--fp-hair) align-top">
                      <td className="py-2 pr-4 font-semibold">{VARIANT_INFO[v].name}</td>
                      <td className="py-2 pr-4">{plain(VARIANT_INFO[v].line)}</td>
                      <td className="hidden py-2 sm:table-cell">{VARIANT_INFO[v].accuse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section n={8} id="stars" title="Stars and hints">
              <ul className="space-y-1.5">
                <li>
                  <b>3 stars</b>: no Reveal, at most one Ask Otto, and faster than the par time.
                </li>
                <li>
                  <b>2 stars</b>: at most one Reveal, and under twice the par time.
                </li>
                <li>
                  <b>1 star</b>: solved.
                </li>
              </ul>
              <p>Pencil notes and crosses are free. Use as many as you like.</p>
              <div className="pt-3">
                <BrassButton to="/plans/guide/practice" size="lg">
                  {done ? 'Play the practice case again' : 'Start the practice case'}
                </BrassButton>
              </div>
            </Section>
          </article>
        </div>
      </PageShell>
    </SkinProvider>
  );
}

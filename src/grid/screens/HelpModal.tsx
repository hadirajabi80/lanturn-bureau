import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useFiles } from '@/grid/store';
import { Sheet } from '@/grid/components/Sheet';

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

/** Cell kinds for the tiny illustration grids. */
type K = '.' | 'me' | 'p' | 'k' | 'ok' | 'x' | 'block' | 'furn' | 'ra' | 'rb' | 'rc';

const CHAR: Record<string, K> = {
  M: 'me', // a suspect
  P: 'p', // the victim
  K: 'k', // the killer
  o: 'ok',
  x: 'x',
  '#': 'block',
  f: 'furn',
  a: 'ra',
  b: 'rb',
  c: 'rc',
};

const ROWS = (s: string): K[][] =>
  s
    .trim()
    .split('/')
    .map((row) => row.split('').map((ch) => CHAR[ch] ?? '.'));

function MiniGrid({ cells }: { cells: K[][] }) {
  const cols = cells[0]?.length ?? 3;
  return (
    <div
      aria-hidden
      className="grid shrink-0 gap-[2px] rounded-lg bg-[#d9d0c3] p-[2px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 14px)` }}
    >
      {cells.flat().map((k, i) => (
        <span
          key={i}
          className={clsx(
            'grid size-[14px] place-items-center rounded-[3px]',
            k === 'me' && 'bg-[#e8632b]',
            k === 'p' && 'bg-[#7b4fd6]',
            k === 'k' && 'bg-[#c8323c]',
            k === 'ok' && 'bg-[#bfe3c7]',
            k === 'x' && 'bg-[repeating-linear-gradient(45deg,#e6ddd0_0_2px,#fbf8f3_2px_4px)]',
            k === 'block' && 'bg-[#6b5a48]',
            k === 'furn' && 'bg-[#d9b98c]',
            k === 'ra' && 'bg-[#f3d9a4]',
            k === 'rb' && 'bg-[#c9e2f2]',
            k === 'rc' && 'bg-[#d6ecc9]',
            k === '.' && 'bg-[#fbf8f3]',
          )}
        >
          {k === 'furn' && <span className="size-[5px] rounded-full bg-[#8a6a43]" />}
        </span>
      ))}
    </div>
  );
}

interface Rule {
  grid: string;
  title: string;
  body: ReactNode;
}

/** The four core rules, in the order a player meets them. */
const RULES: Rule[] = [
  {
    grid: '.M../...M/P.../..M.',
    title: 'Place everybody',
    body: 'Put every suspect and the victim on the map. Nobody shares a cell.',
  },
  {
    grid: '..x./xxMx/..x./..x.',
    title: 'One per row, one per column',
    body: 'Each row and each column holds exactly one person. Once someone is placed, their row and column are shaded.',
  },
  {
    grid: 'aaPb/aKbb/ccbM/Mccb',
    title: 'Find the killer',
    body: 'The killer is the one person who was in the same room as the victim.',
  },
];

/** How to read the sentences on each person’s card. */
const WORDS: Rule[] = [
  {
    grid: '.o./oMo/.o.',
    title: '“Beside”',
    body: 'For furniture: up, down, left or right of it. Two people can only be beside each other diagonally (one per row and column!). Sight lines run along rows, columns and diagonals and are blocked by furniture.',
  },
  {
    grid: '.#f/fM./#.f',
    title: '“On”',
    body: 'Standing or sitting on that piece of furniture (chair, sofa, rug, bed, bench…). Tables, crates, plants and the like block the cell.',
  },
  {
    grid: 'aaab/aabb/ccbb/cccb',
    title: 'Rooms',
    body: 'Rooms are the coloured areas, each with a name label. Walls mark where one room ends.',
  },
  {
    grid: 'ooo/ooo/.M.',
    title: 'Directions & rows',
    body: '“North of” is any row above; “directly north” is the same column, above. “Row 3” counts from the top.',
  },
];

function RuleCard({ rule, step }: { rule: Rule; step?: number }) {
  return (
    <li className="flex items-center gap-3.5 rounded-2xl bg-white p-3 ring-1 ring-black/5">
      <MiniGrid cells={ROWS(rule.grid)} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#2b2724]">
          {step !== undefined && (
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-[#2b2724] text-[11px] font-black text-white">
              {step}
            </span>
          )}
          {rule.title}
        </div>
        <div className="text-[13px] leading-snug text-[#5b524a]">{rule.body}</div>
      </div>
    </li>
  );
}

/** Rules of the puzzle + settings toggles. */
export function HelpModal({ open, onClose }: HelpModalProps) {
  const assist = useFiles((s) => s.settings.assist);
  const sound = useFiles((s) => s.settings.sound);
  const setAssist = useFiles((s) => s.setAssist);
  const setSound = useFiles((s) => s.setSound);

  return (
    <Sheet open={open} onClose={onClose} eyebrow="How to play" title="Crack the floor plan">
      <p className="mb-4 text-[14px] leading-relaxed text-[#5b524a]">
        An <strong>N×N</strong> map holds exactly <strong>N</strong> people. Every sentence is true and together they allow
        exactly <strong>one</strong> placement. Place everybody, submit, then name the killer.
      </p>
      <p className="-mt-2 mb-4 text-[12px] leading-snug text-[#8a8178]">
        Maps grow with the difficulty: small 4×4 files in Easy, all the way up to 12×12 (twelve people) in Extreme.
      </p>
      <ul className="flex flex-col gap-3">
        {RULES.map((r, i) => (
          <RuleCard key={r.title} rule={r} step={i + 1} />
        ))}
      </ul>

      <h3 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a8178]">
        Reading each person’s sentences
      </h3>
      <ul className="flex flex-col gap-3">
        {WORDS.map((r) => (
          <RuleCard key={r.title} rule={r} />
        ))}
      </ul>

      <div className="mt-4 rounded-2xl bg-white p-3 text-[13px] leading-snug text-[#5b524a] ring-1 ring-black/5">
        <strong className="text-[#2b2724]">Tools.</strong> <em>Place</em> puts the selected person on a cell (tap again to
        pick them up). <em>Notes</em> pencils them in as a reminder. <em>Erase</em> clears a cell. <em>Hint</em> reveals one
        person’s true cell (5 per case).
        <div className="mt-2 flex items-center gap-1.5 text-[12px]">
          <strong className="text-[#2b2724]">Stars:</strong> ★ solve · ★★ ≤ 1 hint and under 2× par · ★★★ no hints and
          under par.
        </div>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-black/5 rounded-2xl bg-white ring-1 ring-black/5">
        <Toggle
          label="Assist mode"
          hint="Highlight cells that fit the selected person’s own clues."
          checked={assist}
          onChange={setAssist}
        />
        <Toggle label="Sound effects" checked={sound} onChange={setSound} />
      </div>

      <div className="mt-4 hidden flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#8a8178] sm:flex">
        <span>
          <Kbd>1</Kbd>/<Kbd>2</Kbd>/<Kbd>3</Kbd> tools
        </span>
        <span>
          <Kbd>U</Kbd> undo
        </span>
        <span>
          <Kbd>H</Kbd> hint
        </span>
        <span>
          <Kbd>P</Kbd> pause
        </span>
        <span>
          <Kbd>Esc</Kbd> close
        </span>
      </div>
    </Sheet>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-black/10 bg-white px-1 font-mono text-[11px] text-[#2b2724]">{children}</kbd>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-3.5 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-[#2b2724]">{label}</span>
        {hint && <span className="block text-[12px] text-[#8a8178]">{hint}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={clsx(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#e8632b]',
          checked ? 'bg-[#e8632b]' : 'bg-[#d9d0c3]',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </label>
  );
}

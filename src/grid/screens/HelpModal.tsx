import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useFiles } from '@/grid/store';
import { Sheet } from '@/grid/components/Sheet';

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

/** Cell kinds for the tiny illustration grids. */
type K = '.' | 'me' | 'ok' | 'x' | 'block' | 'p';

const ROWS = (s: string): K[][] =>
  s
    .trim()
    .split('/')
    .map((row) =>
      row.split('').map((ch) =>
        ch === 'M' ? 'me' : ch === 'o' ? 'ok' : ch === 'x' ? 'x' : ch === '#' ? 'block' : ch === 'P' ? 'p' : '.',
      ),
    );

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
            'grid size-[14px] place-items-center rounded-[3px] text-[8px] font-black',
            k === 'me' && 'bg-[#e8632b]',
            k === 'ok' && 'bg-[#bfe3c7]',
            k === 'x' && 'bg-[#f6d5d1]',
            k === 'block' && 'bg-[#6b5a48]',
            k === 'p' && 'bg-[#7b4fd6]',
            k === '.' && 'bg-[#fbf8f3]',
          )}
        />
      ))}
    </div>
  );
}

const RULES: { grid: string; title: string; body: ReactNode }[] = [
  {
    grid: '.o../.Mo./..o.',
    title: 'One person, one cell',
    body: 'Place every suspect and the victim. Nobody shares a cell.',
  },
  {
    grid: '.#../.oo./#.o.',
    title: 'Furniture',
    body: 'Chairs, sofas, rugs, beds, stools, benches and bathtubs can be stood on. Tables, crates, plants and the like block the cell.',
  },
  {
    grid: '.o./oMo/.o.',
    title: '“Beside”',
    body: 'Orthogonally adjacent — up, down, left or right. Never diagonal.',
  },
  {
    grid: 'ooo/ooo/.P.',
    title: '“North of” vs “directly north of”',
    body: 'North of X = any row above X. Directly north = same column, above.',
  },
  {
    grid: 'Moo#x/o..../P....',
    title: '“Could see”',
    body: 'Same row or column with no blocking furniture in between. People never block the view.',
  },
  {
    grid: 'PoooP',
    title: '“Between A and B”',
    body: 'In the same row (or column) as both, strictly between them.',
  },
  {
    grid: 'o.o/.../o.o',
    title: 'Rows, columns, corners, edges',
    body: '“Row 3” counts from the top. Corners are the four grid corners; the edge is any border cell.',
  },
];

/** Rules of the puzzle (GRID-PLAN §1) + settings toggles. */
export function HelpModal({ open, onClose }: HelpModalProps) {
  const assist = useFiles((s) => s.settings.assist);
  const sound = useFiles((s) => s.settings.sound);
  const setAssist = useFiles((s) => s.setAssist);
  const setSound = useFiles((s) => s.setSound);

  return (
    <Sheet open={open} onClose={onClose} eyebrow="How to play" title="Crack the floor plan">
      <p className="mb-4 text-[14px] leading-relaxed text-[#5b524a]">
        Every clue is true and together they allow exactly <strong>one</strong> placement. Place everybody, submit, then
        name the killer using the victim’s clue.
      </p>
      <ul className="flex flex-col gap-3">
        {RULES.map((r) => (
          <li key={r.title} className="flex items-center gap-3.5 rounded-2xl bg-white p-3 ring-1 ring-black/5">
            <MiniGrid cells={ROWS(r.grid)} />
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-[#2b2724]">{r.title}</div>
              <div className="text-[13px] leading-snug text-[#5b524a]">{r.body}</div>
            </div>
          </li>
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

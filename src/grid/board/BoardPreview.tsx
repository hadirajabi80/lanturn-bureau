/**
 * DEV ONLY — skin gallery for the integrator: one sample plan rendered in all 8 district skins
 * side by side, sharing one set of pins, pencil notes and crosses. Toggles for burn, accusation
 * strings, lamp, tool, selected person, plan size and card width. No engine import.
 */
import { useMemo, useState, type JSX } from 'react';
import { DISTRICTS } from '../skins/districts';
import type { Cell, CellMarks, FloorStyle, Furniture, FurnitureKind, Person, Puzzle, Room } from '../types';
import { OCCUPIABLE, cellKey } from '../types';
import { Board } from './Board';
import type { BoardTool } from './tools';
import { MiniFace } from './NoteDots';
import { rng } from './skins/geom';

const rect = (r0: number, r1: number, c0: number, c1: number): Cell[] => {
  const out: Cell[] = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push({ r, c });
  return out;
};
const without = (cells: Cell[], drop: Cell[]) => cells.filter((c) => !drop.some((d) => d.r === c.r && d.c === c.c));

const AV = (o: Partial<Person['avatar']>): Person['avatar'] => ({
  skin: '#F1D2B6', hair: 'short', hairColor: '#2B1F17', eyes: 'round', brows: 'flat', mouth: 'neutral', accessory: 'none', facial: 'none', outfit: '#4F86C6', accent: '#7FB8E8', ...o,
});

const PEOPLE_POOL: Person[] = [
  { id: 'v', name: 'Lord Pemberton', pronoun: 'he', isVictim: true, avatar: AV({ skin: '#F2DCC4', hair: 'slick', hairColor: '#DDDDDD', eyes: 'sleepy', accessory: 'monocle', facial: 'mustache', outfit: '#6B4A7A', accent: '#B9A3D6', age: 'old' }) },
  { id: 'p1', name: 'Ada', pronoun: 'she', isVictim: false, avatar: AV({ hair: 'bob', hairColor: '#8B4A2B', brows: 'arched', mouth: 'smile' }) },
  { id: 'p2', name: 'Bruno', pronoun: 'he', isVictim: false, avatar: AV({ skin: '#C9956B', eyes: 'sharp', brows: 'thick', accessory: 'glasses', facial: 'mustache', outfit: '#3E3A33', accent: '#F6BB42' }) },
  { id: 'p3', name: 'Cleo', pronoun: 'she', isVictim: false, avatar: AV({ skin: '#6B3F2A', hair: 'afro', hairColor: '#1B1B1B', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'earring', outfit: '#E5493A', accent: '#FF9F80', age: 'young' }) },
  { id: 'p4', name: 'Dmitri', pronoun: 'he', isVictim: false, avatar: AV({ skin: '#E8C4A2', hair: 'bald', hairColor: '#B8B8B8', eyes: 'narrow', mouth: 'frown', accessory: 'bowtie', facial: 'beard', outfit: '#5A9E6F', accent: '#9CD3A8', age: 'old' }) },
  { id: 'p5', name: 'Esme', pronoun: 'she', isVictim: false, avatar: AV({ skin: '#D9A77F', hair: 'long', hairColor: '#C9772E', mouth: 'smile', outfit: '#2F6F8F', accent: '#8FD3E8' }) },
  { id: 'p6', name: 'Felix', pronoun: 'he', isVictim: false, avatar: AV({ skin: '#8D5A3B', hair: 'curly', hairColor: '#2A1A10', brows: 'thick', outfit: '#8F3B2F', accent: '#E8A08F' }) },
  { id: 'p7', name: 'Greta', pronoun: 'she', isVictim: false, avatar: AV({ hair: 'bun', hairColor: '#E6D3A3', eyes: 'narrow', outfit: '#4A4F8F', accent: '#A3A8E8', age: 'old' }) },
  { id: 'p8', name: 'Hugo', pronoun: 'he', isVictim: false, avatar: AV({ skin: '#F0C9A8', hair: 'short', hairColor: '#5A3A22', accessory: 'hat', outfit: '#6F5A2F', accent: '#E8D08F' }) },
];

// ─────────── hand-made 6×6 sample (organic rooms) ───────────
const ROOMS6: Room[] = [
  { id: 'lib', name: 'Library', floor: 'wood', color: '#e2b07a', cells: rect(0, 1, 0, 2) },
  { id: 'hall', name: 'Great Hall', floor: 'stone', color: '#c4c2bb', cells: [...rect(0, 2, 3, 5), { r: 2, c: 2 }] },
  { id: 'kit', name: 'Kitchen', floor: 'tile', color: '#a9dcc6', cells: [...rect(2, 3, 0, 1), { r: 3, c: 2 }] },
  { id: 'lng', name: 'Lounge', floor: 'carpet', color: '#dcbb8c', cells: without(rect(3, 5, 3, 5), [{ r: 5, c: 3 }]) },
  { id: 'std', name: 'Study', floor: 'checker', color: '#f0c49e', cells: [...rect(4, 5, 0, 2), { r: 5, c: 3 }] },
];
const FURN6: Furniture[] = [
  { id: 'f1', kind: 'table', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }], orient: 'h' },
  { id: 'f2', kind: 'bookshelf', cells: [{ r: 0, c: 2 }] },
  { id: 'f3', kind: 'armchair', cells: [{ r: 1, c: 1 }] },
  { id: 'f4', kind: 'plant', cells: [{ r: 0, c: 5 }] },
  { id: 'f5', kind: 'rug', cells: [{ r: 1, c: 4 }] },
  { id: 'f6', kind: 'counter', cells: [{ r: 2, c: 0 }] },
  { id: 'f7', kind: 'stool', cells: [{ r: 3, c: 1 }] },
  { id: 'f8', kind: 'sofa', cells: [{ r: 4, c: 4 }, { r: 4, c: 5 }], orient: 'h' },
  { id: 'f9', kind: 'crate', cells: [{ r: 5, c: 0 }] },
  { id: 'f10', kind: 'chair', cells: [{ r: 4, c: 1 }] },
];

// ─────────── procedural bigger plans: carriages (bands split into compartments) ───────────
const NAMES = ['Parlour', 'Pantry', 'Dining Car', 'Observation', 'Galley', 'Sleeper', 'Gallery', 'Vault', 'Archive', 'Conservatory', 'Boiler Room', 'Chapel', 'Lounge', 'Study', 'Cellar', 'Nursery', 'Armoury', 'Ballroom', 'Bar', 'Office'];
const FLOORS: FloorStyle[] = ['wood', 'carpet', 'tile', 'stone', 'marble', 'checker', 'deck', 'concrete', 'grass', 'sand'];
const KINDS: FurnitureKind[] = ['chair', 'table', 'plant', 'crate', 'lamp', 'bookshelf', 'armchair', 'stool', 'barrel', 'globe', 'statue', 'cabinet'];

function bandsPlan(n: number, seed: number): { rooms: Room[]; furniture: Furniture[] } {
  const rnd = rng(seed);
  const rooms: Room[] = [];
  let r = 0;
  let k = 0;
  while (r < n) {
    const h = Math.min(n - r, rnd() > 0.45 ? 2 : 1 + (r === 0 ? 1 : 0));
    let c = 0;
    while (c < n) {
      const w = Math.min(n - c, 2 + Math.floor(rnd() * 3));
      const cw = n - (c + w) === 1 ? w + 1 : w;
      rooms.push({ id: `r${k}`, name: NAMES[k % NAMES.length] ?? 'Room', floor: FLOORS[k % FLOORS.length] ?? 'wood', color: '#cccccc', cells: rect(r, r + h - 1, c, c + cw - 1) });
      k++;
      c += cw;
    }
    r += h;
  }
  const furniture: Furniture[] = [];
  const used = new Set<string>();
  const count = Math.round(n * n * 0.16);
  for (let i = 0; i < count; i++) {
    const cell = { r: Math.floor(rnd() * n), c: Math.floor(rnd() * n) };
    if (used.has(cellKey(cell))) continue;
    used.add(cellKey(cell));
    furniture.push({ id: `f${i}`, kind: KINDS[Math.floor(rnd() * KINDS.length)] ?? 'chair', cells: [cell] });
  }
  return { rooms, furniture };
}

function makePuzzle(size: 6 | 9 | 14): Puzzle {
  const base = size === 6 ? { rooms: ROOMS6, furniture: FURN6 } : bandsPlan(size, size * 7919);
  const people = PEOPLE_POOL.slice(0, Math.min(PEOPLE_POOL.length, size === 6 ? 5 : 9));
  return {
    id: `preview-${size}`,
    seasonId: 'preview',
    tier: size === 6 ? 'medium' : size === 9 ? 'hard' : 'mastermind',
    index: size,
    seed: size,
    title: size === 6 ? 'The Torn Receipt' : size === 9 ? 'The Late Train' : 'The Fourteenth Room',
    themeId: 'mansion',
    rows: size,
    cols: size,
    rooms: base.rooms,
    furniture: base.furniture,
    people,
    clues: [],
    killerRule: { type: 'aloneWithVictim' },
    solution: {},
    killerId: 'p4',
    parSeconds: 180,
  };
}

function initialState(p: Puzzle): { placements: Record<string, Cell | null>; marks: CellMarks } {
  const blocked = new Set(p.furniture.filter((f) => !OCCUPIABLE[f.kind]).flatMap((f) => f.cells.map(cellKey)));
  const free = (r: number, c: number) => !blocked.has(`${r},${c}`);
  const placements: Record<string, Cell | null> = {};
  const n = p.rows;
  const spots: Cell[] = n === 6 ? [{ r: 5, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 4 }] : [{ r: n - 2, c: 2 }, { r: 1, c: 1 }, { r: 3, c: n - 3 }, { r: n - 4, c: 5 }];
  p.people.slice(0, spots.length).forEach((person, i) => {
    const s = spots[i];
    if (s && free(s.r, s.c)) placements[person.id] = s;
  });
  const marks: CellMarks = {
    notes: { '3,4': ['p3', 'p4'], '5,5': ['p3', 'p1', 'p2', 'p4', 'v'], '4,1': ['p4'], '2,2': ['p1', 'p2'] },
    crosses: { '0,3': ['p3'], '0,4': ['p3'], '1,3': ['*'], '2,3': ['p3', 'p4'], '5,4': ['*'], '3,0': ['p3'] },
  };
  return { placements, marks };
}

type Size = 6 | 9 | 14;

/** URL params for quick looks: ?skin=neon&w=640&size=14&burn=1 */
const qp = (k: string): string | null => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(k));

export function BoardPreview(): JSX.Element {
  const [size, setSize] = useState<Size>(() => (Number(qp("size")) === 9 ? 9 : Number(qp("size")) === 14 ? 14 : 6));
  const puzzle = useMemo(() => makePuzzle(size), [size]);
  const [state, setState] = useState(() => initialState(makePuzzle(size)));
  const [selected, setSelected] = useState<string | null>('p3');
  const [tool, setTool] = useState<BoardTool>('pin');
  const [burn, setBurn] = useState(qp("burn") === "1");
  const [strings, setStrings] = useState(true);
  const [lamp, setLamp] = useState(true);
  const [assist, setAssist] = useState(false);
  const [otto, setOtto] = useState(false);
  const [violations, setViolations] = useState(false);
  const [crossesAll, setCrossesAll] = useState(false);
  const [width, setWidth] = useState(() => Number(qp("w")) || 390);
  const [only, setOnly] = useState<string | null>(() => qp("skin"));

  const changeSize = (s: Size) => {
    setSize(s);
    setState(initialState(makePuzzle(s)));
    setBurn(false);
  };

  const onCellTap = (cell: Cell) => {
    const k = cellKey(cell);
    setState((st) => {
      const notes = { ...st.marks.notes };
      const crosses = { ...st.marks.crosses };
      const placements = { ...st.placements };
      if (tool === 'erase') {
        for (const [id, c] of Object.entries(placements)) if (c && cellKey(c) === k) placements[id] = null;
        delete notes[k];
        delete crosses[k];
      } else if (selected) {
        const toggle = (list: string[] | undefined) => {
          const cur = list ?? [];
          return cur.includes(selected) ? cur.filter((x) => x !== selected) : [...cur, selected];
        };
        if (tool === 'pencil') notes[k] = toggle(notes[k]);
        else if (tool === 'cross') crosses[k] = toggle(crosses[k]);
        else {
          for (const [id, c] of Object.entries(placements)) if (c && cellKey(c) === k && id !== selected) return st;
          const prev = placements[selected];
          placements[selected] = prev && cellKey(prev) === k ? null : cell;
        }
      }
      return { placements, marks: { notes, crosses } };
    });
  };
  const onCellLongPress = (cell: Cell) => {
    const k = cellKey(cell);
    setState((st) => {
      const crosses = { ...st.marks.crosses };
      crosses[k] = (crosses[k] ?? []).includes('*') ? [] : ['*'];
      return { ...st, marks: { ...st.marks, crosses } };
    });
  };

  const highlight = useMemo<Cell[]>(() => (otto ? [{ r: 2, c: 1 }] : []), [otto]);
  const reason = useMemo<Cell[]>(() => (otto ? [{ r: 2, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }] : []), [otto]);
  const lines = strings ? [{ from: 'p1', to: 'v' }, { from: 'p2', to: 'v' }] : [];

  const chip = (active: boolean) =>
    `rounded-[8px] px-2.5 py-1 text-xs font-semibold transition-colors ${active ? 'bg-[#C9974A] text-[#120E0B]' : 'bg-white/8 text-[#F1E6D2] ring-1 ring-white/15 hover:bg-white/15'}`;

  const shown = only ? DISTRICTS.filter((d) => d.id === only) : DISTRICTS;

  return (
    <div className="min-h-dvh space-y-6 p-5" style={{ background: 'radial-gradient(ellipse at 50% 0%, #2a2018 0%, #0c0907 70%)', color: '#F1E6D2' }}>
      <header className="space-y-3">
        <h1 className="font-display text-2xl font-bold">Floorplan Mysteries · board skins</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['pin', 'pencil', 'cross', 'erase'] as const).map((t) => (
            <button key={t} type="button" className={chip(tool === t)} onClick={() => setTool(t)}>
              {t}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/20" />
          {puzzle.people.map((p) => (
            <button key={p.id} type="button" className={`${chip(selected === p.id)} flex items-center gap-1`} onClick={() => setSelected(selected === p.id ? null : p.id)}>
              <svg width={16} height={16} viewBox="-12 -12 24 24" aria-hidden>
                <MiniFace person={p} r={10} />
              </svg>
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className={chip(burn)} onClick={() => setBurn((v) => !v)}>
            burn
          </button>
          <button type="button" className={chip(strings)} onClick={() => setStrings((v) => !v)}>
            accusation strings
          </button>
          <button type="button" className={chip(lamp)} onClick={() => setLamp((v) => !v)}>
            lamp follow
          </button>
          <button type="button" className={chip(otto)} onClick={() => setOtto((v) => !v)}>
            Otto highlight
          </button>
          <button type="button" className={chip(violations)} onClick={() => setViolations((v) => !v)}>
            violations
          </button>
          <button type="button" className={chip(crossesAll)} onClick={() => setCrossesAll((v) => !v)}>
            crosses: {crossesAll ? 'all' : 'selected'}
          </button>
          <button type="button" className={chip(assist)} onClick={() => setAssist((v) => !v)}>
            row/col assist
          </button>
          <span className="mx-1 h-4 w-px bg-white/20" />
          {([6, 9, 14] as const).map((s) => (
            <button key={s} type="button" className={chip(size === s)} onClick={() => changeSize(s)}>
              {s}×{s}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/20" />
          {[320, 390, 520, 640].map((w) => (
            <button key={w} type="button" className={chip(width === w)} onClick={() => setWidth(w)}>
              {w}px
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/20" />
          <select className="rounded-[8px] bg-white/10 px-2 py-1 text-xs" value={only ?? ''} onChange={(e) => setOnly(e.target.value || null)} aria-label="Show one skin">
            <option value="">all {DISTRICTS.length} skins</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs opacity-60">Long-press / Alt+click a cell: cross out for everyone. Tap with pin/pencil/cross/erase.</p>
      </header>
      <div className="flex flex-wrap items-start gap-6">
        {shown.map((d) => (
          <section key={d.id} style={{ width }} className="space-y-1.5" data-skin={d.id}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold" style={{ color: d.palette.accent }}>
                {d.number}. {d.name}
              </span>
              <span className="font-mono opacity-60">
                {d.wall} / {d.sheet}
              </span>
            </div>
            <div className="rounded-[10px] p-2" style={{ background: d.palette.bg, boxShadow: `inset 0 0 0 1px ${d.palette.accent}2e` }}>
              <Board
                puzzle={puzzle}
                skinId={d.id}
                placements={state.placements}
                marks={state.marks}
                crossesVisibleFor={crossesAll ? 'all' : undefined}
                selectedPersonId={selected}
                tool={tool}
                highlightCells={highlight}
                reasonCells={reason}
                violations={violations ? ['p2'] : []}
                accusationLines={lines}
                lampFollow={lamp}
                burn={burn}
                rowColAssist={assist}
                onCellTap={onCellTap}
                onCellLongPress={onCellLongPress}
                maxWidth={width}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default BoardPreview;

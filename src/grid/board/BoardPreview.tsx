/**
 * DEV ONLY — eyeball the Board at several widths with a hand-written sample puzzle,
 * plus an 8×8 gallery showing all 30 furniture sprites and all 10 floor styles.
 * No engine import: every puzzle here is a literal (or built by a tiny local packer).
 */
import { useMemo, useState, type JSX } from 'react';
import type { Cell, Furniture, FurnitureKind, Person, Puzzle, Room } from '../types';
import { cellKey } from '../types';
import { Board, type BoardProps } from './Board';
import { MiniFace } from './NoteDots';

const rect = (r0: number, r1: number, c0: number, c1: number): Cell[] => {
  const out: Cell[] = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push({ r, c });
  return out;
};
const without = (cells: Cell[], drop: Cell[]) => cells.filter((c) => !drop.some((d) => d.r === c.r && d.c === c.c));

const PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Ada',
    pronoun: 'she',
    isVictim: false,
    avatar: { skin: '#F1D2B6', hair: 'bob', hairColor: '#8B4A2B', eyes: 'round', brows: 'arched', mouth: 'smile', accessory: 'none', facial: 'none', outfit: '#4F86C6', accent: '#7FB8E8' },
  },
  {
    id: 'p2',
    name: 'Bruno',
    pronoun: 'he',
    isVictim: false,
    avatar: { skin: '#C9956B', hair: 'short', hairColor: '#2B1F17', eyes: 'sharp', brows: 'thick', mouth: 'neutral', accessory: 'glasses', facial: 'mustache', outfit: '#3E3A33', accent: '#F6BB42' },
  },
  {
    id: 'p3',
    name: 'Cleo',
    pronoun: 'she',
    isVictim: false,
    avatar: { skin: '#6B3F2A', hair: 'afro', hairColor: '#1B1B1B', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'earring', facial: 'none', outfit: '#E5493A', accent: '#FF9F80', age: 'young' },
  },
  {
    id: 'p4',
    name: 'Dmitri',
    pronoun: 'he',
    isVictim: false,
    avatar: { skin: '#E8C4A2', hair: 'bald', hairColor: '#B8B8B8', eyes: 'narrow', brows: 'flat', mouth: 'frown', accessory: 'bowtie', facial: 'beard', outfit: '#5A9E6F', accent: '#9CD3A8', age: 'old' },
  },
  {
    id: 'v',
    name: 'Lord Pemberton',
    pronoun: 'he',
    isVictim: true,
    avatar: { skin: '#F2DCC4', hair: 'slick', hairColor: '#DDDDDD', eyes: 'sleepy', brows: 'flat', mouth: 'neutral', accessory: 'monocle', facial: 'mustache', outfit: '#6B4A7A', accent: '#B9A3D6', age: 'old' },
  },
];

const ROOMS: Room[] = [
  { id: 'lib', name: 'Library', floor: 'wood', color: '#e2b07a', cells: rect(0, 1, 0, 2) },
  { id: 'hall', name: 'Great Hall', floor: 'stone', color: '#c4c2bb', cells: [...rect(0, 2, 3, 5), { r: 2, c: 2 }] },
  { id: 'kit', name: 'Kitchen', floor: 'tile', color: '#a9dcc6', cells: [...rect(2, 3, 0, 1), { r: 3, c: 2 }] },
  { id: 'lng', name: 'Lounge', floor: 'carpet', color: '#dcbb8c', cells: without(rect(3, 5, 3, 5), [{ r: 5, c: 3 }]) },
  { id: 'std', name: 'Study', floor: 'deck', color: '#f0c49e', cells: [...rect(4, 5, 0, 2), { r: 5, c: 3 }] },
];

const FURNITURE: Furniture[] = [
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

const SAMPLE: Puzzle = {
  id: 'preview-easy-1',
  seasonId: 'preview',
  tier: 'medium',
  index: 1,
  seed: 1,
  title: 'The Torn Receipt',
  themeId: 'mansion',
  rows: 6,
  cols: 6,
  rooms: ROOMS,
  furniture: FURNITURE,
  people: PEOPLE,
  clues: [],
  killerRule: { type: 'aloneWithVictim' },
  solution: { p1: { r: 1, c: 1 }, p2: { r: 2, c: 4 }, p3: { r: 3, c: 1 }, p4: { r: 4, c: 4 }, v: { r: 5, c: 2 } },
  killerId: 'p4',
  parSeconds: 180,
};

// ─────────────── 8×8 gallery: every sprite + every floor style ───────────────
const GALLERY_ROOMS: Room[] = [
  { id: 'g1', name: 'Parlour', floor: 'wood', color: '#e2b07a', cells: rect(0, 1, 0, 2) },
  { id: 'g2', name: 'Bathroom', floor: 'tile', color: '#a9dcc6', cells: rect(0, 1, 3, 5) },
  { id: 'g3', name: 'Vault', floor: 'stone', color: '#c4c2bb', cells: rect(0, 1, 6, 7) },
  { id: 'g4', name: 'Bedroom', floor: 'carpet', color: '#dcbb8c', cells: rect(2, 3, 0, 3) },
  { id: 'g5', name: 'Garden', floor: 'grass', color: '#9fd07e', cells: rect(2, 3, 4, 7) },
  { id: 'g6', name: 'Gallery', floor: 'marble', color: '#ece8e1', cells: rect(4, 5, 0, 2) },
  { id: 'g7', name: 'Garage', floor: 'concrete', color: '#b8b6b0', cells: rect(4, 5, 3, 5) },
  { id: 'g8', name: 'Deck', floor: 'deck', color: '#e9b98a', cells: rect(4, 5, 6, 7) },
  { id: 'g9', name: 'Diner', floor: 'checker', color: '#e58f8f', cells: rect(6, 7, 0, 3) },
  { id: 'g10', name: 'Beach Hut', floor: 'sand', color: '#f1d9a4', cells: rect(6, 7, 4, 7) },
];

const GALLERY_ORDER: Array<[FurnitureKind, 'h' | 'v' | undefined]> = [
  ['table', 'h'], ['chair', undefined], ['bookshelf', undefined], ['fireplace', undefined], ['armchair', undefined],
  ['bathtub', 'h'], ['plant', undefined], ['lamp', undefined], ['stool', undefined],
  ['safe', undefined], ['cabinet', undefined], ['suitcase', undefined], ['globe', undefined],
  ['bed', 'h'], ['rug', 'h'], ['desk', undefined], ['piano', undefined],
  ['bench', 'h'], ['barrel', undefined], ['bin', undefined], ['bananas', undefined], ['crate', undefined],
  ['statue', undefined], ['easel', undefined], ['coffin', 'v'],
  ['trolley', undefined], ['fridge', undefined], ['counter', 'h'],
  ['anchor', undefined], ['sofa', 'h'],
];

function packGallery(): Furniture[] {
  const rows = 8;
  const cols = 8;
  const roomOf = new Map<string, string>();
  for (const room of GALLERY_ROOMS) for (const c of room.cells) roomOf.set(cellKey(c), room.id);
  const used = new Set<string>();
  const out: Furniture[] = [];
  GALLERY_ORDER.forEach(([kind, orient], i) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = { r, c };
        const b = orient === 'h' ? { r, c: c + 1 } : orient === 'v' ? { r: r + 1, c } : null;
        const cells = b ? [a, b] : [a];
        const ok = cells.every((x) => x.r < rows && x.c < cols && !used.has(cellKey(x)) && roomOf.get(cellKey(x)) === roomOf.get(cellKey(a)));
        if (!ok) continue;
        cells.forEach((x) => used.add(cellKey(x)));
        out.push({ id: `g${i}`, kind, cells, orient });
        return;
      }
    }
  });
  return out;
}

const GALLERY: Puzzle = {
  ...SAMPLE,
  id: 'preview-gallery',
  title: 'Sprite Gallery',
  rows: 8,
  cols: 8,
  rooms: GALLERY_ROOMS,
  furniture: packGallery(),
  people: PEOPLE,
  solution: {},
};

// ─────────────── interactive harness ───────────────
type Tool = BoardProps['tool'];

function Harness({ puzzle, widths }: { puzzle: Puzzle; widths: number[] }): JSX.Element {
  const [placements, setPlacements] = useState<Record<string, Cell | null>>((): Record<string, Cell | null> =>
    puzzle.id === 'preview-easy-1' ? { p1: { r: 1, c: 1 }, p2: { r: 2, c: 4 }, v: { r: 5, c: 2 } } : {},
  );
  const [notes, setNotes] = useState<Record<string, string[]>>((): Record<string, string[]> =>
    puzzle.id === 'preview-easy-1' ? { '3,4': ['p3', 'p4'], '5,5': ['p3', 'p1', 'p2', 'p4', 'v'], '4,1': ['p4'] } : {},
  );
  const [selected, setSelected] = useState<string | null>('p3');
  const [tool, setTool] = useState<Tool>('place');
  const [assist, setAssist] = useState(false);
  const [showViolations, setShowViolations] = useState(false);
  const [lastTap, setLastTap] = useState('');

  const blocked = useMemo(() => {
    const s = new Set<string>();
    for (const f of puzzle.furniture) {
      if (!['chair', 'armchair', 'sofa', 'rug', 'bed', 'stool', 'bench', 'bathtub'].includes(f.kind)) f.cells.forEach((c) => s.add(cellKey(c)));
    }
    return s;
  }, [puzzle.furniture]);

  const highlight = useMemo<Cell[]>(() => {
    if (!assist || !selected) return [];
    const room = puzzle.rooms[(selected.charCodeAt(1) || 0) % puzzle.rooms.length];
    return (room?.cells ?? []).filter((c) => !blocked.has(cellKey(c)));
  }, [assist, selected, puzzle.rooms, blocked]);

  const onCellTap = (cell: Cell) => {
    const k = cellKey(cell);
    setLastTap(`${k}${blocked.has(k) ? ' (blocked → screen would shake)' : ''}`);
    if (tool === 'erase') {
      setPlacements((p) => Object.fromEntries(Object.entries(p).map(([id, c]) => [id, c && cellKey(c) === k ? null : c])));
      setNotes((n) => ({ ...n, [k]: [] }));
      return;
    }
    if (!selected) return;
    if (tool === 'notes') {
      setNotes((n) => {
        const cur = n[k] ?? [];
        return { ...n, [k]: cur.includes(selected) ? cur.filter((x) => x !== selected) : [...cur, selected] };
      });
      return;
    }
    if (blocked.has(k)) return;
    setPlacements((p) => {
      const next: Record<string, Cell | null> = {};
      for (const [id, c] of Object.entries(p)) next[id] = c && cellKey(c) === k ? null : c;
      const prev = p[selected];
      next[selected] = prev && cellKey(prev) === k ? null : cell;
      return next;
    });
  };

  const btn = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-[#2b2420] text-white' : 'bg-white/90 text-[#2b2420]'}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['notes', 'place', 'erase'] as const).map((t) => (
          <button key={t} type="button" className={btn(tool === t)} onClick={() => setTool(t)}>
            {t}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-white/30" />
        {puzzle.people.map((p) => (
          <button key={p.id} type="button" className={`${btn(selected === p.id)} flex items-center gap-1`} onClick={() => setSelected(selected === p.id ? null : p.id)}>
            <svg width={16} height={16} viewBox="-12 -12 24 24" aria-hidden>
              <MiniFace person={p} r={10} />
            </svg>
            {p.name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-white/30" />
        <button type="button" className={btn(assist)} onClick={() => setAssist((v) => !v)}>
          highlight
        </button>
        <button type="button" className={btn(showViolations)} onClick={() => setShowViolations((v) => !v)}>
          violations
        </button>
        <span className="text-xs opacity-70">last tap: {lastTap || '—'}</span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        {widths.map((w) => (
          <div key={w} style={{ width: w }}>
            <div className="mb-1 text-xs opacity-60">{w}px</div>
            <Board
              puzzle={puzzle}
              placements={placements}
              notes={notes}
              selectedPersonId={selected}
              tool={tool}
              highlightCells={highlight}
              violations={showViolations ? ['p2', 'v'] : []}
              onCellTap={onCellTap}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardPreview(): JSX.Element {
  return (
    <div className="min-h-dvh space-y-10 p-6" style={{ background: '#f6efe3', color: '#2b2420' }}>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">Sample 6×6 · 5 rooms · 10 furniture · 5 people</h2>
        <Harness puzzle={SAMPLE} widths={[320, 390, 640]} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">Gallery 8×8 · all 30 sprites · all 10 floors</h2>
        <Harness puzzle={GALLERY} widths={[390, 640]} />
      </section>
    </div>
  );
}

export default BoardPreview;

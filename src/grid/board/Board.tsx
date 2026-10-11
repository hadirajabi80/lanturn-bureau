import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type JSX, type KeyboardEvent, type RefObject } from 'react';
import { FURNITURE_LABEL, OCCUPIABLE, cellKey, type Cell, type Furniture, type Person, type Puzzle } from '../types';
import { FloorPatterns } from './FloorPatterns';
import { LineAssist } from './LineAssist';
import { NoteDots } from './NoteDots';
import { PersonToken } from './PersonToken';
import { RoomLabel } from './RoomLabel';
import { FurnitureSprite } from './sprites';
import { INK } from './sprites/common';
import { buildRoomIndex, floorPatternId, gridPath } from './geometry';
import { Walls } from './Walls';
import { ZoomViewport } from './ZoomViewport';

export interface BoardProps {
  puzzle: Puzzle;
  placements: Record<string, Cell | null>;
  notes: Record<string, string[]>;
  selectedPersonId: string | null;
  tool: 'notes' | 'place' | 'erase';
  highlightCells?: Cell[];
  violations?: string[];
  /** Shade rows/columns that already hold a person and limit "tap here" outlines to free lines. Default true. */
  rowColAssist?: boolean;
  onCellTap: (cell: Cell) => void;
  className?: string;
}

const U = 100;
const PAD = 10;
const RADIUS = 14;
const MAX_WIDTH = 640;
/** Below this cell size (CSS px) the board becomes pannable / zoomable. */
const MIN_CELL_PX = 30;
const HIGHLIGHT = '#ff9f43';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Tracks an element's content width in CSS px (null until measured). */
function useWidth<T extends HTMLElement>(): [RefObject<T | null>, number | null] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth((prev) => (prev !== null && Math.abs(prev - w) < 0.5 ? prev : w));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function squaresPath(cells: Cell[]): string {
  return cells.map((c) => `M${c.c * U},${c.r * U}h${U}v${U}h${-U}Z`).join('');
}

export function Board(props: BoardProps): JSX.Element {
  const { puzzle, placements, notes, selectedPersonId, tool, highlightCells, violations, onCellTap, className } = props;
  const rowColAssist = props.rowColAssist ?? true;
  const { rows, cols, rooms } = puzzle;
  const W = cols * U;
  const H = rows * U;
  const reduceMotion = useReducedMotion() ?? false;
  const uid = 'bd' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [wrapRef, measured] = useWidth<HTMLDivElement>();

  // ── sizing: keep walls / labels at sensible pixel sizes at any board width ──
  const fitWidth = Math.min(measured ?? 390, MAX_WIDTH);
  const fitHeight = (fitWidth * (H + PAD * 2)) / (W + PAD * 2);
  // Dense boards (e.g. 12×12 on a phone) get pan + zoom once a cell would be under MIN_CELL_PX.
  const zoomable = (fitWidth / (W + PAD * 2)) * U < MIN_CELL_PX;
  const [zoomState, setZoom] = useState(1);
  const zoom = zoomable ? zoomState : 1;
  const pxWidth = fitWidth * zoom;
  const ppu = pxWidth / (W + PAD * 2); // CSS px per user unit
  const cellPx = U * ppu;
  const dense = cellPx < 40;
  const wall = clamp(6.5 * ppu, dense ? 1.5 : 2.5, 6) / ppu;
  const border = wall * 1.35;
  const fontSize = clamp(cellPx * 0.2, dense ? 8 : 9, 13) / ppu;
  const hair = 1 / ppu;

  // ── derived lookups ──
  const roomIndex = useMemo(() => buildRoomIndex(rows, cols, rooms), [rows, cols, rooms]);
  const furnitureAt = useMemo(() => {
    const m = new Map<string, Furniture>();
    for (const f of puzzle.furniture) for (const c of f.cells) m.set(cellKey(c), f);
    return m;
  }, [puzzle.furniture]);
  const peopleById = useMemo(() => new Map<string, Person>(puzzle.people.map((p) => [p.id, p])), [puzzle.people]);
  const occupant = useMemo(() => {
    const m = new Map<string, Person>();
    for (const [pid, cell] of Object.entries(placements)) {
      const p = peopleById.get(pid);
      if (cell && p) m.set(cellKey(cell), p);
    }
    return m;
  }, [placements, peopleById]);
  const highlightSet = useMemo(() => new Set((highlightCells ?? []).map(cellKey)), [highlightCells]);
  const violationSet = useMemo(() => new Set(violations ?? []), [violations]);
  const grid = useMemo(() => gridPath(rows, cols), [rows, cols]);

  const cells = useMemo(() => {
    const out: Cell[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ r, c });
    return out;
  }, [rows, cols]);

  const isBlocked = useCallback((k: string) => {
    const f = furnitureAt.get(k);
    return !!f && !OCCUPIABLE[f.kind];
  }, [furnitureAt]);

  const showAffordance = tool === 'place' && !!selectedPersonId;

  // One person per row and column: lines already holding someone other than the selected person.
  const placedCells = useMemo(
    () => Object.entries(placements).flatMap(([pid, c]) => (c && peopleById.has(pid) ? [c] : [])),
    [placements, peopleById],
  );
  const takenLines = useMemo(() => {
    const rowsTaken = new Set<number>();
    const colsTaken = new Set<number>();
    for (const [pid, c] of Object.entries(placements)) {
      if (!c || pid === selectedPersonId || !peopleById.has(pid)) continue;
      rowsTaken.add(c.r);
      colsTaken.add(c.c);
    }
    return { rowsTaken, colsTaken };
  }, [placements, selectedPersonId, peopleById]);

  // ── keyboard: roving tabindex across cells ──
  const [rove, setRove] = useState(0);
  const [focusRing, setFocusRing] = useState<number | null>(null);
  const cellRefs = useRef<Array<SVGRectElement | null>>([]);
  const moveFocus = (idx: number) => {
    const n = clamp(idx, 0, cells.length - 1);
    setRove(n);
    cellRefs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent<SVGRectElement>, idx: number, cell: Cell) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onCellTap(cell);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (cell.c < cols - 1) moveFocus(idx + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (cell.c > 0) moveFocus(idx - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (cell.r < rows - 1) moveFocus(idx + cols);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (cell.r > 0) moveFocus(idx - cols);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(cell.r * cols);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(cell.r * cols + cols - 1);
        break;
      default:
    }
  };

  const ariaFor = (cell: Cell): string => {
    const k = cellKey(cell);
    const room = rooms[roomIndex[cell.r]?.[cell.c] ?? -1];
    const f = furnitureAt.get(k);
    const who = occupant.get(k);
    const noted = (notes[k] ?? []).map((id) => peopleById.get(id)?.name).filter(Boolean);
    const parts = [`row ${cell.r + 1}, column ${cell.c + 1}`];
    if (room) parts.push(room.name);
    if (f) parts.push(FURNITURE_LABEL[f.kind].a.replace(/^(a|an|some) /, '') + (OCCUPIABLE[f.kind] ? '' : ' (blocked)'));
    if (who) parts.push(`${who.name}${who.isVictim ? ' (victim)' : ''} placed here`);
    if (noted.length) parts.push(`notes: ${noted.join(', ')}`);
    return parts.join(', ');
  };

  const placedEntries = Object.entries(placements).filter((e): e is [string, Cell] => !!e[1] && peopleById.has(e[0]));

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', maxWidth: MAX_WIDTH, marginInline: 'auto' }}>
      <ZoomViewport enabled={zoomable} zoom={zoom} onZoom={setZoom} baseWidth={fitWidth} baseHeight={fitHeight}>
        <svg
          viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`}
          width="100%"
          style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: `${W + PAD * 2} / ${H + PAD * 2}`, touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
          role="group"
          aria-label={`${puzzle.title}: floor plan, ${rows} rows by ${cols} columns`}
        >
          <FloorPatterns idPrefix={uid} rooms={rooms} />
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={W} height={H} rx={RADIUS} />
            </clipPath>
          </defs>

          {/* floors + grid */}
          <g clipPath={`url(#${uid}-clip)`} pointerEvents="none">
            <rect x={0} y={0} width={W} height={H} fill="#e8dcc6" />
            {rooms.map((room) => (
              <path key={room.id} d={squaresPath(room.cells)} fill={`url(#${floorPatternId(uid, room.floor, room.color)})`} />
            ))}
            <path d={grid} fill="none" stroke="#ffffff" strokeOpacity={0.42} strokeWidth={hair * 1.1} />
            <path d={grid} fill="none" stroke={INK} strokeOpacity={0.1} strokeWidth={hair} transform={`translate(${hair} ${hair})`} />
          </g>

          {/* furniture */}
          <g>
            {puzzle.furniture.map((f) => (
              <FurnitureSprite key={f.id} piece={f} cellSize={U} />
            ))}
          </g>

          {/* row / column assist: hatch every line that already holds a person */}
          {rowColAssist && (
            <LineAssist idPrefix={uid} rows={rows} cols={cols} unit={U} placed={placedCells} clipId={`${uid}-clip`} />
          )}

          {/* highlight overlay */}
          <g pointerEvents="none">
            <AnimatePresence>
              {(highlightCells ?? []).map((c) => (
                <motion.rect
                  key={cellKey(c)}
                  x={c.c * U + 4}
                  y={c.r * U + 4}
                  width={U - 8}
                  height={U - 8}
                  rx={12}
                  fill={HIGHLIGHT}
                  fillOpacity={0.3}
                  stroke={HIGHLIGHT}
                  strokeWidth={2.4 / ppu}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                />
              ))}
            </AnimatePresence>
          </g>

          {/* "tap here" affordance for the selected person */}
          {showAffordance && (
            <g pointerEvents="none">
              {cells.map((c) => {
                const k = cellKey(c);
                const who = occupant.get(k);
                if (highlightSet.has(k) || isBlocked(k) || (who && who.id !== selectedPersonId)) return null;
                if (rowColAssist && (takenLines.rowsTaken.has(c.r) || takenLines.colsTaken.has(c.c))) return null;
                return (
                  <rect
                    key={k}
                    x={c.c * U + 7}
                    y={c.r * U + 7}
                    width={U - 14}
                    height={U - 14}
                    rx={12}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={0.3}
                    strokeWidth={1.5 / ppu}
                    strokeDasharray={`${5 / ppu} ${4 / ppu}`}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          )}

          <Walls roomIndex={roomIndex} rows={rows} cols={cols} wall={wall} border={border} radius={RADIUS} clipId={`${uid}-clip`} />

          {/* room name chips */}
          {rooms.map((room) => (
            <RoomLabel key={room.id} room={room} fontSize={fontSize} boardW={W} boardH={H} inset={wall / 2 + 5} compact={dense} />
          ))}

          {/* pencil notes (hidden under a placed token) */}
          {Object.entries(notes).map(([k, ids]) => {
            if (!ids.length || occupant.has(k)) return null;
            const [r, c] = k.split(',').map(Number);
            if (r === undefined || c === undefined || Number.isNaN(r) || Number.isNaN(c) || r >= rows || c >= cols) return null;
            return <NoteDots key={k} cell={{ r, c }} personIds={ids} people={peopleById} max={dense ? 2 : 4} />;
          })}

          {/* people */}
          <AnimatePresence>
            {placedEntries.map(([pid, cell]) => {
              const person = peopleById.get(pid);
              if (!person) return null;
              return (
                <PersonToken
                  key={`${pid}@${cellKey(cell)}`}
                  person={person}
                  cell={cell}
                  violating={violationSet.has(pid)}
                  selected={pid === selectedPersonId}
                  reduceMotion={reduceMotion}
                />
              );
            })}
          </AnimatePresence>

          {/* keyboard focus ring */}
          {focusRing !== null && cells[focusRing] && (
            <rect
              x={(cells[focusRing]?.c ?? 0) * U + 3}
              y={(cells[focusRing]?.r ?? 0) * U + 3}
              width={U - 6}
              height={U - 6}
              rx={12}
              fill="none"
              stroke="#ffb347"
              strokeWidth={3 / ppu}
              pointerEvents="none"
            />
          )}

          {/* hit targets */}
          <g>
            {cells.map((c, i) => (
              <rect
                key={cellKey(c)}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                x={c.c * U}
                y={c.r * U}
                width={U}
                height={U}
                fill="transparent"
                role="button"
                tabIndex={i === rove ? 0 : -1}
                aria-label={ariaFor(c)}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() => {
                  setRove(i);
                  onCellTap(c);
                }}
                onKeyDown={(e) => onKey(e, i, c)}
                onFocus={(e) => {
                  setRove(i);
                  let visible = true;
                  try {
                    visible = e.currentTarget.matches(':focus-visible');
                  } catch {
                    /* older engines: always show */
                  }
                  setFocusRing(visible ? i : null);
                }}
                onBlur={() => setFocusRing((f) => (f === i ? null : f))}
              />
            ))}
          </g>
        </svg>
      </ZoomViewport>
    </div>
  );
}

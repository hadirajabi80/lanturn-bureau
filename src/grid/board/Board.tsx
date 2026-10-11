import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type JSX, type KeyboardEvent, type RefObject } from 'react';
import { FURNITURE_LABEL, OCCUPIABLE, cellKey, type Cell, type Furniture, type Person, type Puzzle } from '../types';
import { FloorPatterns } from './FloorPatterns';
import { NoteDots } from './NoteDots';
import { PersonToken } from './PersonToken';
import { RoomLabel } from './RoomLabel';
import { FurnitureSprite } from './sprites';
import { INK } from './sprites/common';
import { buildRoomIndex, floorPatternId, gridPath } from './geometry';
import { Walls } from './Walls';

export interface BoardProps {
  puzzle: Puzzle;
  placements: Record<string, Cell | null>;
  notes: Record<string, string[]>;
  selectedPersonId: string | null;
  tool: 'notes' | 'place' | 'erase';
  highlightCells?: Cell[];
  violations?: string[];
  onCellTap: (cell: Cell) => void;
  className?: string;
}

const U = 100;
const PAD = 10;
const RADIUS = 14;
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
  const { rows, cols, rooms } = puzzle;
  const W = cols * U;
  const H = rows * U;
  const reduceMotion = useReducedMotion() ?? false;
  const uid = 'bd' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [wrapRef, measured] = useWidth<HTMLDivElement>();

  // ── sizing: keep walls / labels at sensible pixel sizes at any board width ──
  const pxWidth = measured ?? 390;
  const ppu = pxWidth / (W + PAD * 2); // CSS px per user unit
  const wall = clamp(6.5 * ppu, 2.5, 6) / ppu;
  const border = wall * 1.35;
  const fontSize = clamp(U * ppu * 0.2, 9, 13) / ppu;
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
    <div ref={wrapRef} className={className} style={{ width: '100%', maxWidth: 640, marginInline: 'auto' }}>
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
          <RoomLabel key={room.id} room={room} fontSize={fontSize} boardW={W} boardH={H} inset={wall / 2 + 5} />
        ))}

        {/* pencil notes (hidden under a placed token) */}
        {Object.entries(notes).map(([k, ids]) => {
          if (!ids.length || occupant.has(k)) return null;
          const [r, c] = k.split(',').map(Number);
          if (r === undefined || c === undefined || Number.isNaN(r) || Number.isNaN(c) || r >= rows || c >= cols) return null;
          return <NoteDots key={k} cell={{ r, c }} personIds={ids} people={peopleById} />;
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
    </div>
  );
}

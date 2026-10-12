import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { cellKey, type Cell, type CellMarks, type Furniture, type FurnitureKind, type Person, type Puzzle } from '../types';
import { Burn } from './Burn';
import { FurnitureCaptions, FurnitureTag, furnitureName, furnitureRule, pieceBox, tagColors, type PieceBox } from './FurnitureTag';
import { LineAssist } from './LineAssist';
import { CrossMark, PencilNotes } from './Marks';
import { PersonToken } from './PersonToken';
import { FurnitureSprite } from './sprites';
import { buildWallGeo, resolveSkin, type SkinCtx, type SkinRenderer, type SkinTokens } from './skins';
import { Strings, type AccusationString } from './Strings';
import { normalizeTool, type BoardTool, type LegacyBoardTool } from './tools';
import { ZoomViewport } from './ZoomViewport';

export type { BoardTool, LegacyBoardTool } from './tools';


export interface BoardProps {
  puzzle: Puzzle;
  placements: Record<string, Cell | null>;
  /** District id ('ashcombe', 'neon'…), wall style or sheet style. Default: puzzle.skinId → puzzle.seasonId → 'ashcombe'. */
  skinId?: string;
  /** v2 marks: pencil notes + red crosses per cell. */
  marks?: CellMarks;
  /** Legacy pencil notes (used when `marks` is absent). */
  notes?: Record<string, string[]>;
  /** Whose crosses to draw: a person id, or 'all'. Default: selected person, else 'all'. */
  crossesVisibleFor?: string | 'all';
  /** After solving: red strings between people (person ids). */
  accusationLines?: { from: string; to: string }[];
  /** Warm lamp-light pool that follows the mouse (never on touch). */
  lampFollow?: boolean;
  /** Burn the case file (plays once when it turns true, then stays charred). */
  burn?: boolean;
  selectedPersonId: string | null;
  tool: BoardTool | LegacyBoardTool;
  highlightCells?: Cell[];
  /** Cells Otto reasons from (dashed amber outline). */
  reasonCells?: Cell[];
  /** Person ids currently breaking a rule (red pulse). */
  violations?: string[];
  /** Optional row/column hatch assist. Default false: the desk never blocks or nudges. */
  rowColAssist?: boolean;
  onCellTap: (cell: Cell) => void;
  /** Long-press (touch), Alt+click or Shift+Enter: e.g. cross a cell out for everyone. */
  onCellLongPress?: (cell: Cell) => void;
  /** Shown in title blocks ("ASH-H-12"). */
  caseCode?: string;
  /** Tapping a furniture square pops a name tag above the piece (default true). */
  furnitureTags?: boolean;
  /** Tiny persistent name captions under every piece (skipped on cells < 30 px). */
  furnitureLabels?: boolean;
  /** Soft glow outline around every piece of this kind (clue ↔ board linking). */
  highlightFurniture?: FurnitureKind | null;
  /** Soft wash over this room (clue ↔ board linking). */
  highlightRoomId?: string | null;
  /** Max board width in CSS px (default 640). */
  maxWidth?: number;
  className?: string;
}

const U = 100;
const MAX_WIDTH = 640;
/** Below this on-screen cell size the board must pan/zoom. */
const MIN_CELL_PX = 26;
/** Boards of 9×9 and up also get zoom while cells are smaller than this. */
const COMFORT_CELL_PX = 44;
const LONG_PRESS_MS = 450;
/** Tap name tag lifetime; hover tooltip delay. */
const TAG_MS = 1800;
const HOVER_MS = 250;
/** Persistent captions need at least this on-screen cell size (zoom in on dense boards). */
const CAPTION_MIN_CELL_PX = 30;
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

function gridLines(rows: number, cols: number): string {
  const parts: string[] = [];
  for (let r = 1; r < rows; r++) parts.push(`M0,${r * U}H${cols * U}`);
  for (let c = 1; c < cols; c++) parts.push(`M${c * U},0V${rows * U}`);
  return parts.join('');
}

const layerStyle: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' };

// ───────────────────────────── static base layer ─────────────────────────────

interface BaseProps {
  ctx: SkinCtx;
  skin: SkinRenderer;
  tokens: SkinTokens;
  viewBox: string;
}

/** Sheet, floors, furniture, walls, labels, frame. Re-renders only when the plan, skin or scale changes. */
const BaseLayer = memo(function BaseLayer({ ctx, skin, tokens, viewBox }: BaseProps): JSX.Element {
  const { puzzle } = ctx;
  const grid = useMemo(() => gridLines(ctx.rows, ctx.cols), [ctx.rows, ctx.cols]);
  return (
    <svg viewBox={viewBox} style={{ display: 'block', width: '100%', height: 'auto' }} aria-hidden>
      <defs>
        {skin.defs(ctx)}
        <clipPath id={ctx.id('clip')}>
          <rect x={0} y={0} width={ctx.W} height={ctx.H} />
        </clipPath>
        {/* bloom used by sprites' glowing parts (neon rims, lamps…) */}
        <filter id={ctx.id('glow')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(3, ctx.px(3))} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {skin.sheet(ctx)}
      <g clipPath={ctx.url('clip')}>
        {puzzle.rooms.map((room, i) => (
          <Fragment key={room.id}>{skin.floor(ctx, room, i, ctx.geo.roomPaths[i] ?? '')}</Fragment>
        ))}
        {skin.floorOverlay?.(ctx)}
        <path
          d={grid}
          fill="none"
          stroke={tokens.grid.color}
          strokeOpacity={tokens.grid.opacity}
          strokeWidth={ctx.px(1)}
          strokeDasharray={tokens.grid.dash ? tokens.grid.dash.split(' ').map((n) => ctx.px(Number(n))).join(' ') : undefined}
        />
      </g>
      <g>
        {puzzle.furniture.map((f) => (
          <FurnitureSprite key={f.id} piece={f} cellSize={U} skin={ctx.district.id} glowFilterId={ctx.id('glow')} />
        ))}
      </g>
      {skin.walls(ctx)}
      <g>
        {ctx.geo.spots.map((s) => (
          <Fragment key={s.room.id}>{skin.label(ctx, s)}</Fragment>
        ))}
      </g>
      {skin.frame?.(ctx)}
    </svg>
  );
});

const GlowLayer = memo(function GlowLayer({ ctx, skin, viewBox }: { ctx: SkinCtx; skin: SkinRenderer; viewBox: string }): JSX.Element | null {
  if (!skin.glow) return null;
  return (
    <svg viewBox={viewBox} style={{ ...layerStyle, pointerEvents: 'none', ...skin.glowStyle }} className={skin.glowClassName} aria-hidden>
      {skin.glow(ctx)}
    </svg>
  );
});

// ───────────────────────────── lamp ─────────────────────────────

function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFine(mq.matches);
    const on = () => setFine(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return fine;
}

// ───────────────────────────── Board ─────────────────────────────

export function Board(props: BoardProps): JSX.Element {
  const { puzzle, placements, selectedPersonId, highlightCells, reasonCells, violations, onCellTap, onCellLongPress, className } = props;
  const tool = normalizeTool(props.tool);
  const rowColAssist = props.rowColAssist ?? false;
  const maxWidth = props.maxWidth ?? MAX_WIDTH;
  const { rows, cols, rooms } = puzzle;
  const W = cols * U;
  const H = rows * U;
  const reduceMotion = useReducedMotion() ?? false;
  const uid = 'bd' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [wrapRef, measured] = useWidth<HTMLDivElement>();
  const finePointer = useFinePointer();

  const skinKey = props.skinId ?? puzzle.skinId ?? puzzle.seasonId;
  const { district, renderer: skin } = useMemo(() => resolveSkin(skinKey), [skinKey]);
  const tokens = useMemo(() => skin.tokens(district.palette), [skin, district]);
  const m = skin.margins;
  const VBW = W + m.l + m.r;
  const VBH = H + m.t + m.b;
  const viewBox = `${-m.l} ${-m.t} ${VBW} ${VBH}`;

  // ── sizing ──
  const fitWidth = Math.min(measured ?? 390, maxWidth);
  const fitHeight = (fitWidth * VBH) / VBW;
  const fitCell = (fitWidth / VBW) * U;
  const zoomable = fitCell < MIN_CELL_PX || (Math.max(rows, cols) >= 9 && fitCell < COMFORT_CELL_PX);
  const [zoomState, setZoom] = useState(1);
  const zoom = zoomable ? zoomState : 1;
  const ppu = Math.round(((fitWidth * zoom) / VBW) * 1000) / 1000;
  const cellPx = U * ppu;
  const dense = cellPx < 40;
  const wall = clamp(6.5 * ppu, dense ? 1.6 : 2.6, 6) / ppu;
  const font = clamp(cellPx * 0.17, dense ? 7.5 : 9, 12.5) / ppu;

  const geo = useMemo(() => buildWallGeo(rows, cols, rooms, U), [rows, cols, rooms]);
  const caseCode = props.caseCode ?? `${district.id.slice(0, 3).toUpperCase()}-${(puzzle.tier[0] ?? 'x').toUpperCase()}-${puzzle.index}`;

  const ctx = useMemo<SkinCtx>(() => {
    const pal = district.palette;
    return {
      uid,
      id: (n) => `${uid}-${n}`,
      url: (n) => `url(#${uid}-${n})`,
      district,
      pal,
      puzzle,
      rows,
      cols,
      U,
      W,
      H,
      m,
      ppu,
      px: (n) => n / ppu,
      wall,
      font,
      dense,
      reduceMotion,
      geo,
      roomColor: (i) => pal.rooms[i % pal.rooms.length] ?? pal.sheet,
      caseCode,
      title: puzzle.title,
    };
  }, [uid, district, puzzle, rows, cols, W, H, m, ppu, wall, font, dense, reduceMotion, geo, caseCode]);

  // ── derived lookups ──
  const furnitureAt = useMemo(() => {
    const map = new Map<string, Furniture>();
    for (const f of puzzle.furniture) for (const c of f.cells) map.set(cellKey(c), f);
    return map;
  }, [puzzle.furniture]);
  const peopleById = useMemo(() => new Map<string, Person>(puzzle.people.map((p) => [p.id, p])), [puzzle.people]);
  const occupant = useMemo(() => {
    const map = new Map<string, Person>();
    for (const [pid, cell] of Object.entries(placements)) {
      const p = peopleById.get(pid);
      if (cell && p) map.set(cellKey(cell), p);
    }
    return map;
  }, [placements, peopleById]);
  const violationSet = useMemo(() => new Set(violations ?? []), [violations]);
  const notes = props.marks?.notes ?? props.notes ?? {};
  const crosses = props.marks?.crosses ?? {};
  const crossFor = props.crossesVisibleFor ?? selectedPersonId ?? 'all';

  // ── furniture names: tap tag, hover tooltip, captions, clue highlights ──
  const tagsOn = props.furnitureTags ?? true;
  const tagCols = useMemo(() => tagColors(district.palette, district.mood), [district]);
  const boxOf = useCallback((f: Furniture): PieceBox => pieceBox(f, U, m, VBW, VBH), [m, VBW, VBH]);
  const [tag, setTag] = useState<{ piece: Furniture; nonce: number } | null>(null);
  const [hoverPiece, setHoverPiece] = useState<Furniture | null>(null);
  const tagTimer = useRef(0);
  const hoverTimer = useRef(0);
  useEffect(
    () => () => {
      window.clearTimeout(tagTimer.current);
      window.clearTimeout(hoverTimer.current);
    },
    [],
  );
  useEffect(() => {
    window.clearTimeout(tagTimer.current);
    window.clearTimeout(hoverTimer.current);
    setTag(null);
    setHoverPiece(null);
  }, [puzzle.id]);
  /** A tap on a square: furniture (not under a pinned person) pops its name tag; anything else hides it. */
  const noteTap = (cell: Cell) => {
    if (!tagsOn) return;
    window.clearTimeout(tagTimer.current);
    window.clearTimeout(hoverTimer.current);
    setHoverPiece(null);
    const k = cellKey(cell);
    const f = furnitureAt.get(k);
    if (!f || occupant.has(k)) {
      setTag(null);
      return;
    }
    setTag((t) => ({ piece: f, nonce: (t?.nonce ?? 0) + 1 }));
    tagTimer.current = window.setTimeout(() => setTag(null), TAG_MS);
  };
  const hoverOn = tagsOn && finePointer;
  const onHitEnter = (e: PointerEvent<SVGRectElement>, cell: Cell) => {
    if (!hoverOn || e.pointerType !== 'mouse') return;
    const f = furnitureAt.get(cellKey(cell)) ?? null;
    if (f && hoverPiece?.id === f.id) return;
    window.clearTimeout(hoverTimer.current);
    setHoverPiece(null);
    if (f) hoverTimer.current = window.setTimeout(() => setHoverPiece(f), HOVER_MS);
  };
  const onHitsLeave = () => {
    window.clearTimeout(hoverTimer.current);
    setHoverPiece(null);
  };
  const shownHover = !tag ? hoverPiece : null;
  const captionsOn = !!props.furnitureLabels && cellPx >= CAPTION_MIN_CELL_PX;
  const hlKind = props.highlightFurniture ?? null;
  const hlPieces = useMemo(() => (hlKind ? puzzle.furniture.filter((f) => f.kind === hlKind) : []), [hlKind, puzzle.furniture]);
  const hlRoomIdx = props.highlightRoomId ? rooms.findIndex((r) => r.id === props.highlightRoomId) : -1;

  const cells = useMemo(() => {
    const out: Cell[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ r, c });
    return out;
  }, [rows, cols]);
  const inBounds = (r: number, c: number) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && c >= 0 && r < rows && c < cols;
  const parseKey = (k: string): Cell | null => {
    const [r, c] = k.split(',').map(Number);
    return r !== undefined && c !== undefined && inBounds(r, c) ? { r, c } : null;
  };

  const placedCells = useMemo(
    () => Object.entries(placements).flatMap(([pid, c]) => (c && peopleById.has(pid) ? [c] : [])),
    [placements, peopleById],
  );
  const placedEntries = Object.entries(placements).filter((e): e is [string, Cell] => !!e[1] && peopleById.has(e[0]));

  const strings = useMemo<AccusationString[]>(() => {
    const out: AccusationString[] = [];
    for (const l of props.accusationLines ?? []) {
      const a = placements[l.from];
      const b = placements[l.to];
      if (a && b) out.push({ from: a, to: b, key: `${l.from}>${l.to}` });
    }
    return out;
  }, [props.accusationLines, placements]);

  // ── burn: animate only when it turns on after mount ──
  const burnInitial = useRef(!!props.burn);
  const burnAnimate = !!props.burn && !burnInitial.current;
  useEffect(() => {
    if (!props.burn) burnInitial.current = false;
  }, [props.burn]);

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
        noteTap(cell);
        if ((e.shiftKey || e.altKey) && onCellLongPress) onCellLongPress(cell);
        else onCellTap(cell);
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

  // ── long press ──
  const press = useRef<{ timer: number; fired: boolean; x: number; y: number } | null>(null);
  const cancelPress = useCallback(() => {
    if (press.current) window.clearTimeout(press.current.timer);
  }, []);
  useEffect(() => cancelPress, [cancelPress]);
  const onHitDown = (e: PointerEvent<SVGRectElement>, cell: Cell) => {
    if (!onCellLongPress || e.button !== 0) return;
    cancelPress();
    const state = { timer: 0, fired: false, x: e.clientX, y: e.clientY };
    state.timer = window.setTimeout(() => {
      state.fired = true;
      try {
        navigator.vibrate?.(12);
      } catch {
        /* not supported */
      }
      onCellLongPress(cell);
    }, LONG_PRESS_MS);
    press.current = state;
  };
  const onHitMove = (e: PointerEvent<SVGRectElement>) => {
    const p = press.current;
    if (p && !p.fired && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) cancelPress();
  };
  const onHitClick = (e: MouseEvent<SVGRectElement>, i: number, cell: Cell) => {
    setRove(i);
    const p = press.current;
    press.current = null;
    if (p?.fired) return;
    if (p) window.clearTimeout(p.timer);
    noteTap(cell);
    if (e.altKey && onCellLongPress) onCellLongPress(cell);
    else onCellTap(cell);
  };

  // ── lamp ──
  const lampOn = !!props.lampFollow && finePointer;
  const lampRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!lampOn || e.pointerType === 'touch') return;
    const el = lampRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const rect = stage.getBoundingClientRect();
    const size = el.offsetWidth;
    el.style.transform = `translate3d(${e.clientX - rect.left - size / 2}px, ${e.clientY - rect.top - size / 2}px, 0)`;
    el.style.opacity = '1';
  };
  const onStageLeave = () => {
    if (lampRef.current) lampRef.current.style.opacity = '0';
  };

  const ariaFor = (cell: Cell): string => {
    const k = cellKey(cell);
    const ri = geo.index[cell.r]?.[cell.c] ?? -1;
    const room = rooms[ri];
    const f = furnitureAt.get(k);
    const who = occupant.get(k);
    const noted = (notes[k] ?? []).map((id) => peopleById.get(id)?.name).filter(Boolean);
    const crossed = (crosses[k] ?? []).map((id) => (id === '*' ? 'everyone' : peopleById.get(id)?.name)).filter(Boolean);
    const parts = [`row ${cell.r + 1}, column ${cell.c + 1}`];
    if (room) parts.push(room.name);
    if (f) parts.push(`${furnitureName(f.kind).toLowerCase()} (${furnitureRule(f.kind)})`);
    if (who) parts.push(`${who.name}${who.isVictim ? ' (victim)' : ''} pinned here`);
    if (noted.length) parts.push(`pencilled: ${noted.join(', ')}`);
    if (crossed.length) parts.push(`crossed out for ${crossed.join(', ')}`);
    return parts.join(', ');
  };

  const crossW = Math.max(ctx.px(2.6), 7);
  const hitClass = `${uid}-hit`;
  const hoverCss = `
.${hitClass}{fill:transparent;stroke:none;cursor:${tool === 'erase' ? 'cell' : tool === 'cross' ? 'crosshair' : 'pointer'};outline:none}
@media (hover:hover){.${hitClass}:hover{fill:${tokens.hover};fill-opacity:.13;stroke:${tokens.hover};stroke-opacity:.85;stroke-width:${ctx.px(2).toFixed(2)}px}}`;

  const allIds = puzzle.people.map((p) => p.id);

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', maxWidth, marginInline: 'auto' }}>
      <ZoomViewport enabled={zoomable} zoom={zoom} onZoom={setZoom} baseWidth={fitWidth} baseHeight={fitHeight} ui={tokens.ui}>
        <div
          ref={stageRef}
          style={{ position: 'relative', width: '100%', aspectRatio: `${VBW} / ${VBH}`, overflow: 'hidden', touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
          onPointerMove={lampOn ? onStageMove : undefined}
          onPointerLeave={lampOn ? onStageLeave : undefined}
        >
          <BaseLayer ctx={ctx} skin={skin} tokens={tokens} viewBox={viewBox} />
          <GlowLayer ctx={ctx} skin={skin} viewBox={viewBox} />

          {/* live layer: marks, people, strings, hover, hit targets */}
          <svg viewBox={viewBox} style={{ ...layerStyle, willChange: 'transform' }} role="group" aria-label={`${puzzle.title}: floor plan, ${rows} rows by ${cols} columns`}>
            <defs>
              <style>{hoverCss}</style>
              <radialGradient id={`${uid}-pin`} cx="35%" cy="30%" r="75%">
                <stop offset="0" stopColor="#FFF1C2" />
                <stop offset="0.45" stopColor="#D9A94E" />
                <stop offset="1" stopColor="#7A5216" />
              </radialGradient>
              <filter id={`${uid}-selglow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={6} />
              </filter>
              <clipPath id={`${uid}-gclip`}>
                <rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>

            {rowColAssist && <LineAssist idPrefix={uid} rows={rows} cols={cols} unit={U} placed={placedCells} clipId={`${uid}-gclip`} />}

            {/* clue ↔ board linking: a soft wash over the hovered room */}
            <g pointerEvents="none">
              <AnimatePresence>
                {hlRoomIdx >= 0 && ctx.geo.roomPaths[hlRoomIdx] && (
                  <motion.path
                    key={`room-${rooms[hlRoomIdx]?.id ?? hlRoomIdx}`}
                    d={ctx.geo.roomPaths[hlRoomIdx]}
                    clipPath={`url(#${uid}-gclip)`}
                    fill={tokens.hover}
                    fillOpacity={0.16}
                    stroke={tokens.hover}
                    strokeOpacity={0.9}
                    strokeWidth={ctx.px(3)}
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  />
                )}
              </AnimatePresence>
            </g>

            {/* Otto / hint highlight */}
            <g pointerEvents="none">
              <AnimatePresence>
                {(highlightCells ?? []).map((c) => (
                  <motion.rect
                    key={cellKey(c)}
                    x={c.c * U + 5}
                    y={c.r * U + 5}
                    width={U - 10}
                    height={U - 10}
                    rx={6}
                    fill={tokens.highlight}
                    fillOpacity={0.28}
                    stroke={tokens.highlight}
                    strokeWidth={ctx.px(2.4)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  />
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {(reasonCells ?? []).map((c) => (
                  <motion.rect
                    key={`r${cellKey(c)}`}
                    x={c.c * U + 8}
                    y={c.r * U + 8}
                    width={U - 16}
                    height={U - 16}
                    rx={4}
                    fill={tokens.reason}
                    fillOpacity={0.08}
                    stroke={tokens.reason}
                    strokeWidth={ctx.px(2)}
                    strokeDasharray={`${ctx.px(6)} ${ctx.px(4)}`}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  />
                ))}
              </AnimatePresence>
            </g>

            {/* red grease-pencil crosses */}
            <g pointerEvents="none">
              {Object.entries(crosses).map(([k, ids]) => {
                if (!ids.length || occupant.has(k)) return null;
                const cell = parseKey(k);
                if (!cell) return null;
                const everyone = ids.includes('*') || allIds.every((id) => ids.includes(id));
                if (crossFor === 'all') {
                  return <CrossMark key={k} k={k} r={cell.r} c={cell.c} color={tokens.cross} width={crossW} small={!everyone} reduceMotion={reduceMotion} />;
                }
                if (!everyone && !ids.includes(crossFor)) return null;
                return <CrossMark key={k} k={k} r={cell.r} c={cell.c} color={tokens.cross} width={crossW} reduceMotion={reduceMotion} />;
              })}
            </g>

            {/* pencil notes (hidden under a pinned photo) */}
            <g pointerEvents="none">
              {Object.entries(notes).map(([k, ids]) => {
                if (!ids.length || occupant.has(k)) return null;
                const cell = parseKey(k);
                if (!cell) return null;
                const people = ids.map((id) => peopleById.get(id)).filter((p): p is Person => !!p);
                return <PencilNotes key={k} r={cell.r} c={cell.c} people={people} dense={dense} ink={tokens.note} paper={tokens.noteBg} />;
              })}
            </g>

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
                    accent={tokens.select}
                    compact={cellPx < 56}
                    glowFilter={`${uid}-selglow`}
                    pinFill={`${uid}-pin`}
                    shadowColor={tokens.shadow}
                  />
                );
              })}
            </AnimatePresence>

            {/* clue ↔ board linking: soft glow around every piece of the hovered kind (over people, so it shows under a pin) */}
            <g pointerEvents="none">
              <AnimatePresence>
                {hlPieces.map((f) => {
                  const rs = f.cells.map((c) => c.r);
                  const cs = f.cells.map((c) => c.c);
                  const x = Math.min(...cs) * U + 5;
                  const y = Math.min(...rs) * U + 5;
                  const w = (Math.max(...cs) - Math.min(...cs) + 1) * U - 10;
                  const h = (Math.max(...rs) - Math.min(...rs) + 1) * U - 10;
                  return (
                    <motion.g
                      key={`hl-${f.id}`}
                      initial={{ opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { opacity: [0.7, 1, 0.7] }}
                      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } }}
                      transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <rect x={x} y={y} width={w} height={h} rx={14} fill="none" stroke={tokens.hover} strokeWidth={ctx.px(8)} strokeOpacity={0.7} filter={`url(#${uid}-selglow)`} />
                      <rect x={x} y={y} width={w} height={h} rx={14} fill={tokens.hover} fillOpacity={0.14} stroke={tokens.hover} strokeWidth={ctx.px(3)} />
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </g>

            <Strings lines={strings} color={tokens.string} reduceMotion={reduceMotion} shadow={tokens.shadow} />

            {/* keyboard focus ring */}
            {focusRing !== null && cells[focusRing] && (
              <rect
                x={(cells[focusRing]?.c ?? 0) * U + 3}
                y={(cells[focusRing]?.r ?? 0) * U + 3}
                width={U - 6}
                height={U - 6}
                rx={6}
                fill="none"
                stroke={tokens.hover}
                strokeWidth={ctx.px(3)}
                pointerEvents="none"
              />
            )}

            {/* hit targets */}
            <g onPointerLeave={hoverOn ? onHitsLeave : undefined}>
              {cells.map((c, i) => (
                <rect
                  key={cellKey(c)}
                  ref={(el) => {
                    cellRefs.current[i] = el;
                  }}
                  className={hitClass}
                  x={c.c * U}
                  y={c.r * U}
                  width={U}
                  height={U}
                  role="button"
                  tabIndex={i === rove ? 0 : -1}
                  aria-label={ariaFor(c)}
                  onPointerDown={(e) => onHitDown(e, c)}
                  onPointerEnter={hoverOn ? (e) => onHitEnter(e, c) : undefined}
                  onPointerMove={onCellLongPress ? onHitMove : undefined}
                  onPointerUp={onCellLongPress ? cancelPress : undefined}
                  onPointerCancel={onCellLongPress ? cancelPress : undefined}
                  onPointerLeave={onCellLongPress ? cancelPress : undefined}
                  onContextMenu={onCellLongPress ? (e) => e.preventDefault() : undefined}
                  onClick={(e) => onHitClick(e, i, c)}
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

          {lampOn && (
            <div
              ref={lampRef}
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '90%',
                aspectRatio: '1',
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 260ms ease',
                willChange: 'transform, opacity',
                mixBlendMode: tokens.lamp.blend,
                background: `radial-gradient(circle at center, ${hexA(tokens.lamp.color, tokens.lamp.strength)} 0%, ${hexA(tokens.lamp.color, tokens.lamp.strength * 0.45)} 22%, ${hexA(tokens.lamp.color, 0)} 58%)`,
              }}
            />
          )}

          {captionsOn && (
            <FurnitureCaptions
              pieces={puzzle.furniture.filter((f) => !f.cells.some((c) => occupant.has(cellKey(c))))}
              boxOf={boxOf}
              colors={tagCols}
              cellPx={cellPx}
            />
          )}

          {/* hover tooltip (desktop) — decorative, the cell aria-label already names the piece */}
          {hoverOn && (
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
              <FurnitureTag
                piece={shownHover}
                box={shownHover ? boxOf(shownHover) : null}
                colors={tagCols}
                variant="hover"
                reduceMotion={reduceMotion}
                layoutKey={ppu}
              />
            </div>
          )}

          {/* tap name tag */}
          {tagsOn && (
            <div role="status" aria-live="polite" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
              <FurnitureTag
                piece={tag?.piece ?? null}
                nonce={tag?.nonce}
                box={tag ? boxOf(tag.piece) : null}
                colors={tagCols}
                variant="tag"
                reduceMotion={reduceMotion}
                layoutKey={ppu}
              />
            </div>
          )}

          {props.burn && <Burn vb={{ x: -m.l, y: -m.t, w: VBW, h: VBH }} uid={uid} animate={burnAnimate && !reduceMotion} />}
        </div>
      </ZoomViewport>
    </div>
  );
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

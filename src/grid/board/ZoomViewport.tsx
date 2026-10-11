import { useLayoutEffect, useRef, type JSX, type PointerEvent, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
const STEP = 0.5;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

export interface ZoomViewportProps {
  /** Off: children render as-is (no scroll box, no controls). */
  enabled: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  /** Fit-to-width size of the content (CSS px) at zoom 1. */
  baseWidth: number;
  baseHeight: number;
  children: ReactNode;
}

/**
 * Pan + pinch-zoom box for dense boards. The content is re-laid out at `baseWidth × zoom`
 * (so the SVG stays crisp) inside a scroll box the size of the fit-to-width board.
 * Pinch with two fingers, or use the − / + pair; tap or double-tap the readout to reset.
 */
export function ZoomViewport({ enabled, zoom, onZoom, baseWidth, baseHeight, children }: ZoomViewportProps): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);
  const prevZoom = useRef(zoom);
  /** Focal point (box-relative CSS px) to keep still across the next zoom change. */
  const focal = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  // Keep the focal point under the finger / in the centre while zooming.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const prev = prevZoom.current;
    prevZoom.current = zoom;
    if (!box || prev === zoom) return;
    const f = focal.current ?? { x: box.clientWidth / 2, y: box.clientHeight / 2 };
    focal.current = null;
    const k = zoom / prev;
    box.scrollLeft = (box.scrollLeft + f.x) * k - f.x;
    box.scrollTop = (box.scrollTop + f.y) * k - f.y;
  }, [zoom]);

  if (!enabled) return <>{children}</>;

  const dist = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) pinch.current = { dist: dist(), zoom };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = pinch.current;
    const box = boxRef.current;
    if (!p || !box || pointers.current.size !== 2 || p.dist <= 0) return;
    const next = clampZoom(p.zoom * (dist() / p.dist));
    if (Math.abs(next - zoom) < 0.01) return;
    const [a, b] = [...pointers.current.values()];
    const rect = box.getBoundingClientRect();
    if (a && b) focal.current = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
    onZoom(next);
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const zoomed = zoom > ZOOM_MIN + 0.001;
  const btn =
    'grid size-8 place-items-center rounded-full text-[#2b2724] transition-colors hover:bg-[#f3ede4] disabled:opacity-35 disabled:hover:bg-transparent';

  return (
    <div>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          width: baseWidth,
          height: baseHeight,
          maxWidth: '100%',
          overflow: zoomed ? 'auto' : 'hidden',
          touchAction: 'pan-x pan-y',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ width: baseWidth * zoom }}>{children}</div>
      </div>
      <div
        className="ml-auto mt-1.5 flex w-fit items-center gap-0.5 rounded-full bg-white p-0.5 shadow-[0_6px_16px_-10px_rgb(70_45_20/0.5)] ring-1 ring-black/5"
        role="group"
        aria-label="Board zoom"
      >
        <button type="button" className={btn} aria-label="Zoom out" disabled={!zoomed} onClick={() => onZoom(clampZoom(zoom - STEP))}>
          <Minus className="size-4" strokeWidth={2.6} />
        </button>
        <button
          type="button"
          className="h-8 min-w-[42px] rounded-full px-1 text-[12px] font-bold tabular-nums text-[#5b524a] hover:bg-[#f3ede4]"
          aria-label="Reset zoom"
          title="Tap or double-tap to fit the board"
          onClick={() => onZoom(ZOOM_MIN)}
          onDoubleClick={() => onZoom(ZOOM_MIN)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className={btn}
          aria-label="Zoom in"
          disabled={zoom >= ZOOM_MAX - 0.001}
          onClick={() => onZoom(clampZoom(zoom + STEP))}
        >
          <Plus className="size-4" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

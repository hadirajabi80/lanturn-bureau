import { memo, useLayoutEffect, useRef, useState, type JSX } from 'react';
import type { Room } from '../types';
import { INK } from './sprites/common';

export interface RoomLabelProps {
  room: Room;
  /** Font size in board user units. */
  fontSize: number;
  boardW: number;
  boardH: number;
  /** Inset from the walls in user units. */
  inset: number;
}

/** Anchor cell: the left-most cell of the room's bottom-most row. */
function labelAnchor(room: Room): { r: number; c: number } | null {
  let best: { r: number; c: number } | null = null;
  for (const cell of room.cells) {
    if (!best || cell.r > best.r || (cell.r === best.r && cell.c < best.c)) best = cell;
  }
  return best;
}

/** White rounded name chip sitting at the bottom edge inside a room. */
function RoomLabelImpl({ room, fontSize, boardW, boardH, inset }: RoomLabelProps): JSX.Element | null {
  const textRef = useRef<SVGTextElement>(null);
  const estimate = room.name.length * fontSize * 0.6;
  const [measured, setMeasured] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || typeof el.getComputedTextLength !== 'function') return;
    try {
      const len = el.getComputedTextLength();
      if (len > 0) setMeasured((prev) => (prev !== null && Math.abs(prev - len) < 0.5 ? prev : len));
    } catch {
      /* not rendered (e.g. display:none) — keep the estimate */
    }
  }, [room.name, fontSize]);

  const anchor = labelAnchor(room);
  if (!anchor) return null;

  const textW = measured ?? estimate;
  const padX = fontSize * 0.6;
  const chipH = fontSize * 1.5;
  const chipW = Math.min(boardW - inset * 2, textW + padX * 2);
  let x = anchor.c * 100 + inset;
  x = Math.max(inset, Math.min(x, boardW - inset - chipW));
  let y = (anchor.r + 1) * 100 - inset - chipH;
  y = Math.max(inset, Math.min(y, boardH - inset - chipH));

  return (
    <g pointerEvents="none" aria-hidden>
      <rect x={x} y={y + chipH * 0.12} width={chipW} height={chipH} rx={chipH / 2} fill={INK} opacity={0.22} />
      <rect x={x} y={y} width={chipW} height={chipH} rx={chipH / 2} fill="#fffdf8" stroke={INK} strokeOpacity={0.18} strokeWidth={fontSize * 0.08} />
      <text
        ref={textRef}
        x={x + chipW / 2}
        y={y + chipH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={800}
        fontFamily='"Inter", system-ui, -apple-system, "Segoe UI", sans-serif'
        fill={INK}
        textLength={measured !== null && textW > chipW - padX * 2 ? chipW - padX * 2 : undefined}
        lengthAdjust="spacingAndGlyphs"
        style={{ userSelect: 'none' }}
      >
        {room.name}
      </text>
    </g>
  );
}

export const RoomLabel = memo(RoomLabelImpl);

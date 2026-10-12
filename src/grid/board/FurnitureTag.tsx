/**
 * Furniture name tags for the Board (HTML overlays on top of the plan stage):
 *
 *   FurnitureTag       the floating name tag shown after tapping a piece ("Barrel · blocks the square")
 *                      and the lighter hover tooltip (desktop, fine pointer). Anchored above the piece,
 *                      clamped inside the stage, flipped below when there is no room on top.
 *   FurnitureCaptions  tiny persistent captions under every piece ("Name labels" setting).
 *
 * Positions are fractions of the stage (0..1) so they follow zoom without re-layout of the plan.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState, type CSSProperties, type JSX } from 'react';
import { FURNITURE_LABEL, OCCUPIABLE, type Furniture, type FurnitureKind } from '../types';
import type { SkinPalette } from '../skins/types';
import * as sprites from './sprites';

// ───────────────────────────── names ─────────────────────────────

/** Display name of a furniture kind ("Armchair"). Uses the sprite module's names when present. */
export function furnitureName(kind: FurnitureKind): string {
  const fromSprites = (sprites as { furnitureTitle?: (k: FurnitureKind) => string }).furnitureTitle;
  if (typeof fromSprites === 'function') {
    try {
      const t = fromSprites(kind);
      if (t) return t;
    } catch {
      /* fall through */
    }
  }
  const noun = (FURNITURE_LABEL[kind]?.a ?? kind).replace(/^(an?|some)\s+/i, '');
  return noun.charAt(0).toUpperCase() + noun.slice(1);
}

/** What a piece means for placement: "blocks the square", "you can sit here"… */
export function furnitureRule(kind: FurnitureKind): string {
  if (!OCCUPIABLE[kind]) return 'blocks the square';
  if (kind === 'rug') return 'you can stand here';
  if (kind === 'bathtub') return 'you can stand in it';
  if (kind === 'bed') return 'you can sit or lie here';
  return 'you can sit here';
}

// ───────────────────────────── geometry ─────────────────────────────

export interface PieceBox {
  /** fractions of the stage (0..1) */
  cx: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Bounding box of a piece as stage fractions. `U` = user units per cell, margins from the skin. */
export function pieceBox(piece: Furniture, U: number, m: { l: number; t: number }, VBW: number, VBH: number): PieceBox {
  let minR = Infinity;
  let minC = Infinity;
  let maxR = -Infinity;
  let maxC = -Infinity;
  for (const c of piece.cells) {
    minR = Math.min(minR, c.r);
    minC = Math.min(minC, c.c);
    maxR = Math.max(maxR, c.r);
    maxC = Math.max(maxC, c.c);
  }
  const x0 = (m.l + minC * U) / VBW;
  const x1 = (m.l + (maxC + 1) * U) / VBW;
  const y0 = (m.t + minR * U) / VBH;
  const y1 = (m.t + (maxR + 1) * U) / VBH;
  return { cx: (x0 + x1) / 2, top: y0, bottom: y1, left: x0, right: x1 };
}

// ───────────────────────────── colours ─────────────────────────────

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{3,8}$/i.test(h)) return 0;
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (ch[0] ?? 0) + 0.7152 * (ch[1] ?? 0) + 0.0722 * (ch[2] ?? 0);
}

export interface TagColors {
  bg: string;
  ink: string;
  muted: string;
  ring: string;
  shadow: string;
  light: boolean;
}

/** Tag colours from the district palette (panel/ink/accent), mood aware. */
export function tagColors(pal: SkinPalette, mood?: 'night' | 'light'): TagColors {
  const light = mood ? mood === 'light' : luminance(pal.bg) > 0.45;
  return light
    ? {
        bg: `color-mix(in srgb, ${pal.panel} 92%, white)`,
        ink: pal.ink,
        muted: pal.muted,
        ring: `color-mix(in srgb, ${pal.accent} 55%, transparent)`,
        shadow: `0 8px 18px -8px color-mix(in srgb, ${pal.accent} 45%, rgb(60 40 60 / 0.35))`,
        light,
      }
    : {
        bg: `color-mix(in srgb, ${pal.panel} 94%, black)`,
        ink: pal.ink,
        muted: pal.muted,
        ring: `color-mix(in srgb, ${pal.accent2} 60%, transparent)`,
        shadow: '0 10px 22px -8px rgb(0 0 0 / 0.75)',
        light,
      };
}

// ───────────────────────────── tag ─────────────────────────────

const GAP = 6;
const EDGE = 4;

export interface FurnitureTagProps {
  /** null hides the tag */
  piece: Furniture | null;
  /** changes on every tap so a repeated tap re-pops the tag */
  nonce?: number;
  box: PieceBox | null;
  colors: TagColors;
  /** 'tag' = tap tag (name + rule), 'hover' = lighter tooltip (name only) */
  variant: 'tag' | 'hover';
  reduceMotion: boolean;
  /** re-measure when the stage size changes (zoom) */
  layoutKey?: number;
}

export function FurnitureTag({ piece, nonce, box, colors, variant, reduceMotion, layoutKey }: FurnitureTagProps): JSX.Element {
  return (
    <AnimatePresence>
      {piece && box && (
        <TagBody
          key={`${piece.id}:${nonce ?? 0}`}
          piece={piece}
          box={box}
          colors={colors}
          variant={variant}
          reduceMotion={reduceMotion}
          layoutKey={layoutKey}
        />
      )}
    </AnimatePresence>
  );
}

function TagBody({
  piece,
  box,
  colors,
  variant,
  reduceMotion,
  layoutKey,
}: {
  piece: Furniture;
  box: PieceBox;
  colors: TagColors;
  variant: 'tag' | 'hover';
  reduceMotion: boolean;
  layoutKey?: number;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; caret: number; below: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const stage = el?.offsetParent as HTMLElement | null;
    if (!el || !stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const ax = box.cx * W;
    const left = Math.max(EDGE, Math.min(W - w - EDGE, ax - w / 2));
    let top = box.top * H - h - GAP;
    let below = false;
    if (top < EDGE) {
      below = true;
      top = Math.min(H - h - EDGE, box.bottom * H + GAP);
    }
    const caret = Math.max(10, Math.min(w - 10, ax - left));
    setPos({ left, top, caret, below });
  }, [box.cx, box.top, box.bottom, layoutKey, piece.id]);

  const name = furnitureName(piece.kind);
  const isTag = variant === 'tag';
  const style: CSSProperties = {
    position: 'absolute',
    left: pos?.left ?? 0,
    top: pos?.top ?? 0,
    visibility: pos ? 'visible' : 'hidden',
    pointerEvents: 'none',
    zIndex: 5,
    whiteSpace: 'nowrap',
    maxWidth: 'calc(100% - 8px)',
    background: isTag ? colors.bg : `color-mix(in srgb, ${colors.bg} 82%, transparent)`,
    color: colors.ink,
    boxShadow: isTag ? `0 0 0 1px ${colors.ring}, ${colors.shadow}` : `0 0 0 1px color-mix(in srgb, ${colors.ring} 60%, transparent), 0 6px 14px -8px rgb(0 0 0 / 0.5)`,
    borderRadius: isTag ? 8 : 6,
    padding: isTag ? '5px 9px' : '3px 7px',
    fontSize: isTag ? 12.5 : 11.5,
    lineHeight: 1.2,
    fontWeight: isTag ? 600 : 500,
    letterSpacing: '0.01em',
    backdropFilter: isTag ? undefined : 'blur(4px)',
    transformOrigin: pos ? `${pos.caret}px ${pos.below ? 0 : '100%'}` : 'center',
  };
  const caretSize = isTag ? 9 : 7;
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: pos?.below ? -3 : 3 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.18 } }}
      transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
    >
      <span style={{ position: 'relative', zIndex: 1, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
        {isTag && (
          <>
            <span aria-hidden style={{ color: colors.muted, fontWeight: 500 }}>
              {' · '}
            </span>
            <span style={{ color: OCCUPIABLE[piece.kind] ? colors.ink : colors.muted, fontWeight: 500 }}>{furnitureRule(piece.kind)}</span>
          </>
        )}
      </span>
      {pos && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: pos.caret - caretSize / 2,
            [pos.below ? 'top' : 'bottom']: -caretSize / 2 + 0.5,
            width: caretSize,
            height: caretSize,
            background: isTag ? colors.bg : `color-mix(in srgb, ${colors.bg} 82%, transparent)`,
            transform: 'rotate(45deg)',
            boxShadow: pos.below ? `-1px -1px 0 0 ${colors.ring}` : `1px 1px 0 0 ${colors.ring}`,
          }}
        />
      )}
    </motion.div>
  );
}

// ───────────────────────────── captions ─────────────────────────────

export interface FurnitureCaptionsProps {
  pieces: Furniture[];
  boxOf: (f: Furniture) => PieceBox;
  colors: TagColors;
  /** on-screen cell size in CSS px (captions scale with it) */
  cellPx: number;
}

/** Tiny persistent captions at the foot of every piece. Decorative (cells already carry aria-labels). */
export function FurnitureCaptions({ pieces, boxOf, colors, cellPx }: FurnitureCaptionsProps): JSX.Element {
  const font = Math.max(8, Math.min(11, cellPx * 0.15));
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {pieces.map((f) => {
        const b = boxOf(f);
        const colSpan = new Set(f.cells.map((c) => c.c)).size || 1;
        const widthPx = colSpan * cellPx;
        return (
          <span
            key={f.id}
            style={{
              position: 'absolute',
              left: `${b.cx * 100}%`,
              top: `${b.bottom * 100}%`,
              transform: 'translate(-50%, calc(-100% - 2px))',
              maxWidth: Math.max(24, widthPx - 4),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: font,
              lineHeight: 1.15,
              fontWeight: 600,
              letterSpacing: '0.02em',
              padding: '1px 4px',
              borderRadius: 4,
              color: colors.ink,
              background: `color-mix(in srgb, ${colors.bg} 84%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${colors.ring} 45%, transparent)`,
            }}
          >
            {furnitureName(f.kind)}
          </span>
        );
      })}
    </div>
  );
}

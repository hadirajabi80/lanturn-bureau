import type { JSX } from 'react';
import { DISTRICTS, getDistrict } from '../../skins/districts';
import type { SkinPalette, WallStyle } from '../../skins/types';
import type { FurnitureKind } from '../../types';
import { hash } from './core/geom';
import { Pen } from './core/pen';
import { KINDS } from './kinds';
import { STYLE_DEFS } from './styles';

/** Props of a raw sprite drawing. A cell is 100 x 100 units; 2-cell pieces are 200 x 100 or 100 x 200. */
export interface SpriteProps {
  w: number;
  h: number;
  style: WallStyle;
  palette: SkinPalette;
  /** stable variation (book widths, leaf angles, wobble). Defaults to a hash of kind + size. */
  seed?: number;
  /** id of an SVG filter (soft blur) applied to the neon glow layer, defined by the board. */
  glowId?: string;
}

/** Style + palette for a district id (also accepts a bare WallStyle). Defaults to Ashcombe / ink. */
export function skinFor(skin?: string): { style: WallStyle; palette: SkinPalette } {
  const d = skin ? getDistrict(skin) : undefined;
  if (d) return { style: d.wall, palette: d.palette };
  const byWall = skin ? DISTRICTS.find((x) => x.wall === skin) : undefined;
  if (byWall) return { style: byWall.wall, palette: byWall.palette };
  return { style: 'ink', palette: DISTRICTS[0].palette };
}

function drawOne(kind: FurnitureKind, L: number, rot: boolean, p: SpriteProps, seed: number): JSX.Element {
  const pen = new Pen({ def: STYLE_DEFS[p.style] ?? STYLE_DEFS.ink, palette: p.palette, rot, L, seed });
  const body = KINDS[kind].draw(pen, L);
  const overlay = pen.def.decorate ? pen.def.decorate(pen) : null;
  return (
    <g>
      {pen.shadows.length > 0 && <g>{pen.shadows}</g>}
      {pen.glows.length > 0 && <g filter={p.glowId ? `url(#${p.glowId})` : undefined}>{pen.glows}</g>}
      {body}
      {overlay}
    </g>
  );
}

/** Draws `kind` filling a w x h box (sprite units). Vertical 2-cell boxes are rotated, never squashed. */
export function drawSprite(kind: FurnitureKind, p: SpriteProps): JSX.Element {
  const def = KINDS[kind];
  const seed = p.seed ?? hash(`${kind}:${p.w}x${p.h}`);
  const cols = Math.max(1, Math.round(p.w / 100));
  const rows = Math.max(1, Math.round(p.h / 100));
  if (!def.stretch && cols * rows > 1) {
    const out: JSX.Element[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push(
          <g key={`${r},${c}`} transform={`translate(${c * 100} ${r * 100})`}>
            {drawOne(kind, 100, false, p, seed + r * 31 + c * 7)}
          </g>,
        );
      }
    }
    return <g>{out}</g>;
  }
  return drawOne(kind, Math.max(cols, rows) * 100, rows > cols, p, seed);
}

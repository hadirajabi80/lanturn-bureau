import type { ReactNode } from 'react';
import type { SkinPalette } from '@/grid/skins/types';

/** Shared types & helpers for the procedural facades (FacadeArt + FacadeLight). */

export interface Win {
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  col: number;
  kind?: 'rect' | 'arch' | 'round';
}

export interface Spec {
  W: number;
  H: number;
  /** ground line */
  G: number;
  back: ReactNode;
  front?: ReactNode;
  windows: Win[];
  /** The sealed attic (tier 5, Extra Extreme): the roof / gable / lantern box above the top window row. */
  attic?: Box;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ctx {
  p: SkinPalette;
  body: string;
  bodyDark: string;
  roof: string;
  trim: string;
  dark: string;
  id: string;
  light: boolean;
}

export function rng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly spaced grid of windows inside a box; row 0 at the bottom. */
export function grid(
  x0: number, y0: number, x1: number, y1: number, floors: number, wpf: number, fw: number, fh: number, kind: Win['kind'] = 'rect',
): Win[] {
  const cw = (x1 - x0) / wpf;
  const ch = (y1 - y0) / floors;
  const out: Win[] = [];
  for (let r = 0; r < floors; r++)
    for (let c = 0; c < wpf; c++) {
      const w = cw * fw;
      const h = ch * fh;
      out.push({ x: x0 + (c + 0.5) * cw - w / 2, y: y1 - (r + 0.5) * ch - h / 2, w, h, row: r, col: c, kind });
    }
  return out;
}

/** One row of `n` windows spread across [x0, x1]. */
export function row(x0: number, x1: number, y: number, n: number, w: number, h: number, r: number, kind: Win['kind'] = 'rect'): Win[] {
  return Array.from({ length: n }, (_, c) => {
    const cx = x0 + ((c + 0.5) * (x1 - x0)) / Math.max(1, n);
    return { x: cx - w / 2, y, w, h, row: r, col: c, kind };
  });
}

import { DISTRICTS, getDistrict } from '../../skins/districts';
import type { District, WallStyle } from '../../skins/types';
import './fonts.css';
import { blueprintSkin } from './blueprint';
import { candySkin } from './candy';
import { chalkSkin } from './chalk';
import { decoSkin } from './deco';
import { inkSkin } from './ink';
import { laceSkin } from './lace';
import { marbleSkin } from './marble';
import { neonSkin } from './neon';
import { ribbonSkin } from './ribbon';
import { ropeSkin } from './rope';
import { steelSkin } from './steel';
import type { SkinRenderer } from './types';

export type { LabelSpot, Margins, SkinCtx, SkinRenderer, SkinTokens } from './types';
export { buildWallGeo } from './geom';
export type { WallGeo } from './geom';

/** One renderer per drawing medium (District.wall). */
export const SKIN_RENDERERS: Record<WallStyle, SkinRenderer> = {
  ink: inkSkin,
  rope: ropeSkin,
  deco: decoSkin,
  marble: marbleSkin,
  neon: neonSkin,
  chalk: chalkSkin,
  steel: steelSkin,
  blueprint: blueprintSkin,
  ribbon: ribbonSkin,
  lace: laceSkin,
  candy: candySkin,
};

const FALLBACK = 'ashcombe';

/**
 * Resolve a skin id to its district + renderer. Accepts a district id ('neon', 'frostmere'…),
 * a wall style ('ink', 'chalk'…) or a sheet style ('parchment', 'wet-asphalt'…). Falls back to Ashcombe.
 */
export function resolveSkin(skinId?: string | null): { district: District; renderer: SkinRenderer } {
  const id = skinId ?? FALLBACK;
  const district =
    getDistrict(id) ??
    DISTRICTS.find((d) => d.wall === id || d.sheet === id) ??
    getDistrict(FALLBACK) ??
    (DISTRICTS[0] as District);
  return { district, renderer: SKIN_RENDERERS[district.wall] ?? inkSkin };
}

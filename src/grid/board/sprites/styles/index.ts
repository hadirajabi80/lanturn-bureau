import type { WallStyle } from '../../../skins/types';
import { blueprint } from './blueprint';
import { candy } from './candy';
import { chalk } from './chalk';
import { deco } from './deco';
import { ink } from './ink';
import { lace } from './lace';
import { marble } from './marble';
import { neon } from './neon';
import { ribbon } from './ribbon';
import { rope } from './rope';
import { steel } from './steel';
import type { StyleDef } from './types';

export type { AccentLook, Hatch, LineLook, Look, Material, StyleDef } from './types';

/** One furniture rendering style per WallStyle. */
export const STYLE_DEFS: Record<WallStyle, StyleDef> = { ink, rope, deco, marble, neon, chalk, steel, blueprint, ribbon, lace, candy };

export const WALL_STYLES: WallStyle[] = ['ink', 'rope', 'deco', 'marble', 'neon', 'chalk', 'steel', 'blueprint', 'ribbon', 'lace', 'candy'];

/** Light, cute districts (pastel shadows, no dark outlines). */
export const isSweet = (s: WallStyle): boolean => s === 'ribbon' || s === 'lace' || s === 'candy';

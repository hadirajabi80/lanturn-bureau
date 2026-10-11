import type { FurnitureKind } from '../../../types';
import { Anchor, Barrel, Crate, Suitcase, Trolley } from './cargo';
import { Bananas, Easel, Fireplace, Globe, Lamp, Plant, Statue } from './decor';
import { Bathtub, Bed, Coffin, Rug } from './rest';
import { Armchair, Bench, Chair, Sofa, Stool } from './seating';
import { Bin, Bookshelf, Cabinet, Fridge, Safe } from './storage';
import { Counter, Desk, Piano, Table } from './surfaces';
import type { KindDef } from './types';

export type { Draw, KindDef } from './types';

/** Every FurnitureKind -> its plan drawing. `stretch` pieces span their whole footprint. */
export const KINDS: Record<FurnitureKind, KindDef> = {
  chair: { draw: Chair, stretch: false },
  armchair: { draw: Armchair, stretch: false },
  sofa: { draw: Sofa, stretch: true },
  rug: { draw: Rug, stretch: true },
  bed: { draw: Bed, stretch: true },
  stool: { draw: Stool, stretch: false },
  bench: { draw: Bench, stretch: true },
  table: { draw: Table, stretch: true },
  desk: { draw: Desk, stretch: true },
  crate: { draw: Crate, stretch: false },
  barrel: { draw: Barrel, stretch: false },
  bin: { draw: Bin, stretch: false },
  plant: { draw: Plant, stretch: false },
  bananas: { draw: Bananas, stretch: false },
  piano: { draw: Piano, stretch: true },
  bookshelf: { draw: Bookshelf, stretch: true },
  fireplace: { draw: Fireplace, stretch: true },
  bathtub: { draw: Bathtub, stretch: true },
  lamp: { draw: Lamp, stretch: false },
  safe: { draw: Safe, stretch: false },
  statue: { draw: Statue, stretch: false },
  cabinet: { draw: Cabinet, stretch: true },
  fridge: { draw: Fridge, stretch: true },
  counter: { draw: Counter, stretch: true },
  trolley: { draw: Trolley, stretch: false },
  suitcase: { draw: Suitcase, stretch: false },
  anchor: { draw: Anchor, stretch: false },
  globe: { draw: Globe, stretch: false },
  easel: { draw: Easel, stretch: false },
  coffin: { draw: Coffin, stretch: true },
};

export const KIND_ORDER: FurnitureKind[] = Object.keys(KINDS) as FurnitureKind[];

import type { Vec3 } from './layout';

export type FxType = 'hit' | 'land' | 'bearoff';

export interface FxEvent {
  id: number;
  type: FxType;
  pos: Vec3;
  at: number; // performance.now() in ms when it should fire
}

let nextId = 1;
export const fxBus = {
  events: [] as FxEvent[],
  push(type: FxType, pos: Vec3, delaySec: number) {
    this.events.push({ id: nextId++, type, pos, at: performance.now() + delaySec * 1000 });
  },
};

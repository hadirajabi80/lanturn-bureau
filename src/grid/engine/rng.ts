/**
 * Deterministic hashing + PRNG for the Crime Files generator.
 * Everything the generator does must flow from these so that a puzzle id
 * always produces the very same case on every device.
 */

/** 32-bit FNV-1a over the joined parts, finished with the murmur3 avalanche. */
export function hashSeed(...parts: (string | number)[]): number {
  const s = parts.map(String).join('␟');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // murmur3 fmix32 — spreads low-entropy inputs (e.g. consecutive indices)
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [0, n). */
  int(n: number): number;
  /** Uniform element of a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Fisher–Yates shuffled copy. */
  shuffle<T>(arr: readonly T[]): T[];
  /** True with probability p. */
  chance(p: number): boolean;
}

/** mulberry32 — tiny, fast, good enough for procedural content. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number): number => Math.floor(next() * n);
  return {
    next,
    int,
    pick<T>(arr: readonly T[]): T {
      if (arr.length === 0) throw new Error('rng.pick on empty array');
      return arr[int(arr.length)] as T;
    },
    shuffle<T>(arr: readonly T[]): T[] {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(i + 1);
        const tmp = out[i] as T;
        out[i] = out[j] as T;
        out[j] = tmp;
      }
      return out;
    },
    chance(p: number): boolean {
      return next() < p;
    },
  };
}

/** Weighted pick of an index; returns -1 when all weights are ≤ 0. */
export function weightedIndex(rng: Rng, weights: readonly number[]): number {
  let total = 0;
  for (const w of weights) if (w > 0) total += w;
  if (total <= 0) return -1;
  let x = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] as number;
    if (w <= 0) continue;
    x -= w;
    if (x < 0) return i;
  }
  for (let i = weights.length - 1; i >= 0; i--) if ((weights[i] as number) > 0) return i;
  return -1;
}

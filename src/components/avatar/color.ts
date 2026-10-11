/**
 * Tiny colour helpers shared by the procedural Avatar and SceneView.
 * All functions accept loose hex input ("#abc", "abc", "#aabbcc") and never throw.
 */

export type RGB = [number, number, number];

export function parseHex(hex: string): RGB {
  let h = (hex ?? '').trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [128, 128, 128];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function toHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((n) => clamp255(n).toString(16).padStart(2, '0')).join('');
}

/** Linear blend: t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  const k = Math.max(0, Math.min(1, t));
  return toHex([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]);
}

/**
 * Darken (amount < 0) or lighten (amount > 0) a hex colour.
 * amount is in [-1, 1]; -1 = black, +1 = white. Darkening keeps a little hue warmth.
 */
export function shade(hex: string, amount: number): string {
  if (amount === 0) return toHex(parseHex(hex));
  if (amount > 0) return mix(hex, '#ffffff', amount);
  // Darken towards a deep warm ink rather than pure black: shadows read as "painted".
  return mix(hex, '#120c14', -amount);
}

/** Relative luminance 0..1 (sRGB approximation, good enough for contrast choices). */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Blend towards the colour's own grey (t = 1 → fully grey). */
export function desaturate(hex: string, t: number): string {
  const [r, g, b] = parseHex(hex);
  const grey = 0.3 * r + 0.59 * g + 0.11 * b;
  return mix(hex, toHex([grey, grey, grey]), t);
}

/** "#rrggbb" + alpha → "rgba(r, g, b, a)". */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Deterministic 32-bit hash of a string (FNV-1a). */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

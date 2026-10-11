/**
 * Legacy shared bits still imported by other board files (FloorPatterns, LineAssist, NoteDots,
 * PersonToken, RoomLabel, Board). The sprites themselves live in core/, styles/ and kinds/.
 */

/** Default outline ink of the board (Ashcombe sepia). */
export const INK = '#2b2420';

/** Tiny deterministic PRNG so decorative scatter is stable between renders. */
export function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

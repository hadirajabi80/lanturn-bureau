/**
 * Clue ↔ board linking: split a testimony sentence into plain text and linkable nouns —
 * furniture kinds ("beside a bin", "some bananas", "any tables", "the cabinet") and room names.
 * Only kinds / rooms that exist on this plan are linked (hovering one must light something up).
 */
import { furnitureName } from '@/grid/board/FurnitureTag';
import { FURNITURE_LABEL, type FurnitureKind, type Puzzle } from '@/grid/types';

export type ClueLink = { type: 'furniture'; kind: FurnitureKind } | { type: 'room'; roomId: string };
export interface ClueSegment {
  text: string;
  link?: ClueLink;
}

export const sameLink = (a: ClueLink | null | undefined, b: ClueLink | null | undefined): boolean =>
  !!a && !!b && (a.type === 'furniture' ? b.type === 'furniture' && a.kind === b.kind : b.type === 'room' && a.roomId === b.roomId);

export function linkLabel(link: ClueLink, puzzle: Puzzle): string {
  if (link.type === 'room') return puzzle.rooms.find((r) => r.id === link.roomId)?.name ?? 'room';
  return FURNITURE_LABEL[link.kind]?.plural ?? furnitureName(link.kind);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface Matcher {
  re: RegExp;
  map: Map<string, ClueLink>;
}

const cache = new WeakMap<Puzzle, Matcher | null>();

function matcherFor(puzzle: Puzzle): Matcher | null {
  if (cache.has(puzzle)) return cache.get(puzzle) ?? null;
  const map = new Map<string, ClueLink>();
  // rooms first: "Piano Room" must win over "piano"
  for (const room of puzzle.rooms) {
    const k = room.name.trim().toLowerCase();
    if (k && !map.has(k)) map.set(k, { type: 'room', roomId: room.id });
  }
  const present = new Set(puzzle.furniture.map((f) => f.kind));
  for (const kind of present) {
    const lab = FURNITURE_LABEL[kind];
    if (!lab) continue;
    const nouns = [lab.a.replace(/^(an?|some)\s+/i, ''), lab.plural, furnitureName(kind)];
    for (const n of nouns) {
      const k = n.trim().toLowerCase();
      if (k && !map.has(k)) map.set(k, { type: 'furniture', kind });
    }
  }
  if (!map.size) {
    cache.set(puzzle, null);
    return null;
  }
  const alts = [...map.keys()].sort((a, b) => b.length - a.length).map(escape);
  const m: Matcher = { re: new RegExp(`(?<![\\p{L}\\p{N}])(${alts.join('|')})(?![\\p{L}\\p{N}])`, 'giu'), map };
  cache.set(puzzle, m);
  return m;
}

/** Split `text` into segments; linked segments carry the furniture kind or room id. */
export function linkClueText(text: string, puzzle: Puzzle): ClueSegment[] {
  const m = matcherFor(puzzle);
  if (!m) return [{ text }];
  const out: ClueSegment[] = [];
  let last = 0;
  m.re.lastIndex = 0;
  for (const hit of text.matchAll(m.re)) {
    const i = hit.index ?? 0;
    const word = hit[0];
    const link = m.map.get(word.toLowerCase());
    if (!link) continue;
    if (i > last) out.push({ text: text.slice(last, i) });
    out.push({ text: word, link });
    last = i + word.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

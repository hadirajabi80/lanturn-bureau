import { BUREAU } from '@/data/bureau';
import type { AvatarSpec, CaseFile, Character, HairStyle } from '@/data/types';

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pick = <T,>(list: readonly T[], n: number): T => list[n % list.length] as T;

const SKINS = ['#F1D2B6', '#E8C4A2', '#C9956B', '#A86F4C', '#6B3F2A', '#D9A57F'] as const;
const HAIRS: readonly HairStyle[] = ['short', 'long', 'bun', 'curly', 'bob', 'wavy', 'slick', 'pixie'];
const HAIR_COLORS = ['#1B1B1B', '#2B1F17', '#5A3A22', '#8B4A2B', '#B8B8B8', '#C9A66B'] as const;
const OUTFITS = ['#3B4A6B', '#5A1E2B', '#2F4F4F', '#4A3B5C', '#3E3A33', '#264653'] as const;

/** Deterministic stand-in avatar for speakers who have no Character entry. */
export function fallbackAvatar(id: string): AvatarSpec {
  const h = hash(id);
  return {
    skin: pick(SKINS, h),
    hair: pick(HAIRS, h >>> 3),
    hairColor: pick(HAIR_COLORS, h >>> 6),
    eyes: 'round',
    brows: 'flat',
    mouth: 'neutral',
    accessory: 'none',
    facial: 'none',
    outfit: pick(OUTFITS, h >>> 9),
    accent: '#D4A857',
  };
}

/** "c01-margaux-delaroux" → "Margaux Delaroux". */
export function nameFromId(id: string): string {
  const parts = id.replace(/^c\d+-/, '').split('-').filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || id;
}

/** Look up a character by id among the case's suspects and the bureau cast. */
export function findCharacter(c: CaseFile | undefined, id: string): Character | undefined {
  const fromCase = c?.suspects.find((s) => s.character.id === id)?.character;
  return fromCase ?? BUREAU[id];
}

/** Always returns a renderable character (fabricates one for walk-on speakers). */
export function speakerOf(c: CaseFile | undefined, id: string): Character {
  const found = findCharacter(c, id);
  if (found) return found;
  return {
    id,
    name: nameFromId(id),
    role: '',
    age: 40,
    tagline: '',
    personality: '',
    quirk: '',
    voice: '',
    avatar: fallbackAvatar(id),
  };
}

/** Short display name: first name, or the quoted nickname if present. */
export function shortName(ch: Character): string {
  const nick = /"([^"]+)"/.exec(ch.name);
  if (nick?.[1]) return nick[1];
  const cleaned = ch.name.replace(/^(Dr\.|Mrs\.|Mr\.|Ms\.|Prof\.|Lady|Lord|Sir|Sister|Captain|Councillor)\s+/i, '');
  return cleaned.split(' ')[0] ?? ch.name;
}

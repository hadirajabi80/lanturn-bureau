/**
 * The Crime Files cast: 24 recurring characters (12 he / 12 she) with fixed,
 * hand-written avatars. Each case draws its suspects and victim from here.
 */
import type { AvatarSpec } from '../../data/types';

export interface CastMember {
  id: string;
  name: string;
  pronoun: 'he' | 'she';
  avatar: AvatarSpec;
}

const a = (spec: AvatarSpec): AvatarSpec => spec;

export const CAST: CastMember[] = [
  // ── she ──
  { id: 'alice', name: 'Alice', pronoun: 'she', avatar: a({ skin: '#F1D2B6', hair: 'bob', hairColor: '#C8873A', eyes: 'round', brows: 'arched', mouth: 'smile', accessory: 'pearls', facial: 'none', outfit: '#6FA8A0', accent: '#F4C095', age: 'adult' }) },
  { id: 'charlotte', name: 'Charlotte', pronoun: 'she', avatar: a({ skin: '#E8C4A2', hair: 'long', hairColor: '#2B1F17', eyes: 'wide', brows: 'raised', mouth: 'o', accessory: 'scarf', facial: 'none', outfit: '#C0566B', accent: '#F2A7B5', age: 'young' }) },
  { id: 'ivy', name: 'Ivy', pronoun: 'she', avatar: a({ skin: '#F5DCC8', hair: 'pixie', hairColor: '#7A3B2E', eyes: 'wide', brows: 'flat', mouth: 'grin', accessory: 'flower', facial: 'none', outfit: '#7BAE7F', accent: '#CFE6D6', age: 'young' }) },
  { id: 'grace', name: 'Grace', pronoun: 'she', avatar: a({ skin: '#6B3F2A', hair: 'braids', hairColor: '#1B1B1B', eyes: 'round', brows: 'arched', mouth: 'smile', accessory: 'headscarf', facial: 'none', outfit: '#E0A458', accent: '#F4D2BD', age: 'adult' }) },
  { id: 'nora', name: 'Nora', pronoun: 'she', avatar: a({ skin: '#F2DCC4', hair: 'bun', hairColor: '#DDDDDD', eyes: 'closed', brows: 'flat', mouth: 'smile', accessory: 'glasses', facial: 'none', outfit: '#B9A3D6', accent: '#DCD0EA', age: 'old' }) },
  { id: 'beatrice', name: 'Beatrice', pronoun: 'she', avatar: a({ skin: '#F6DFCB', hair: 'curly', hairColor: '#B5452B', eyes: 'wide', brows: 'arched', mouth: 'teeth', accessory: 'beret', facial: 'none', outfit: '#D96C4F', accent: '#F7C59F', age: 'adult' }) },
  { id: 'clara', name: 'Clara', pronoun: 'she', avatar: a({ skin: '#9C6644', hair: 'ponytail', hairColor: '#2B1B12', eyes: 'round', brows: 'raised', mouth: 'grin', accessory: 'headset', facial: 'none', outfit: '#3D7EA6', accent: '#A3CEF1', age: 'young' }) },
  { id: 'edith', name: 'Edith', pronoun: 'she', avatar: a({ skin: '#EBC9AA', hair: 'bun', hairColor: '#A9A9A9', eyes: 'narrow', brows: 'thick', mouth: 'pout', accessory: 'none', facial: 'none', outfit: '#6E5A7E', accent: '#CDB4DB', age: 'old' }) },
  { id: 'margot', name: 'Margot', pronoun: 'she', avatar: a({ skin: '#D8A47F', hair: 'long', hairColor: '#1E1E1E', eyes: 'sharp', brows: 'arched', mouth: 'smirk', accessory: 'hood', facial: 'none', outfit: '#2E2E3A', accent: '#8D86C9', age: 'adult' }) },
  { id: 'rosalind', name: 'Rosalind', pronoun: 'she', avatar: a({ skin: '#7B4B2A', hair: 'wavy', hairColor: '#3B2416', eyes: 'sleepy', brows: 'flat', mouth: 'smile', accessory: 'earring', facial: 'none', outfit: '#B5838D', accent: '#FFCDB2', age: 'adult' }) },
  { id: 'lucy', name: 'Lucy', pronoun: 'she', avatar: a({ skin: '#FBE3D0', hair: 'bob', hairColor: '#E8C07A', eyes: 'dot', brows: 'raised', mouth: 'o', accessory: 'roundGlasses', facial: 'none', outfit: '#F2B880', accent: '#FCE1A8', age: 'young' }) },
  { id: 'vivian', name: 'Vivian', pronoun: 'she', avatar: a({ skin: '#C48B66', hair: 'wavy', hairColor: '#6B2E1F', eyes: 'closed', brows: 'arched', mouth: 'smirk', accessory: 'hat', facial: 'none', outfit: '#8C2F39', accent: '#E8A0A8', age: 'adult' }) },
  // ── he ──
  { id: 'benjamin', name: 'Benjamin', pronoun: 'he', avatar: a({ skin: '#C9956B', hair: 'short', hairColor: '#3B2A1E', eyes: 'narrow', brows: 'thick', mouth: 'neutral', accessory: 'tie', facial: 'beard', outfit: '#3E4C6B', accent: '#9DB4D6', age: 'adult' }) },
  { id: 'daniel', name: 'Daniel', pronoun: 'he', avatar: a({ skin: '#8D5A3B', hair: 'buzz', hairColor: '#1B1B1B', eyes: 'sharp', brows: 'angry', mouth: 'smirk', accessory: 'earring', facial: 'stubble', outfit: '#4A4A4A', accent: '#E07A3F', age: 'adult' }) },
  { id: 'peter', name: 'Peter', pronoun: 'he', avatar: a({ skin: '#F0C8A8', hair: 'curly', hairColor: '#D9A35B', eyes: 'round', brows: 'worried', mouth: 'o', accessory: 'roundGlasses', facial: 'none', outfit: '#A88B5C', accent: '#E9D8B4', age: 'young' }) },
  { id: 'henry', name: 'Henry', pronoun: 'he', avatar: a({ skin: '#D9A57F', hair: 'bald', hairColor: '#9A9A9A', eyes: 'sleepy', brows: 'flat', mouth: 'frown', accessory: 'monocle', facial: 'mustache', outfit: '#5A3E2B', accent: '#D4A857', age: 'old' }) },
  { id: 'frederick', name: 'Frederick', pronoun: 'he', avatar: a({ skin: '#E2B48C', hair: 'slick', hairColor: '#2A2A2A', eyes: 'narrow', brows: 'arched', mouth: 'smirk', accessory: 'bowtie', facial: 'goatee', outfit: '#5A1E2B', accent: '#C8323C', age: 'adult' }) },
  { id: 'oliver', name: 'Oliver', pronoun: 'he', avatar: a({ skin: '#F2D0B0', hair: 'wavy', hairColor: '#A0522D', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'cap', facial: 'none', outfit: '#4F7CAC', accent: '#A8C5E2', age: 'young' }) },
  { id: 'samuel', name: 'Samuel', pronoun: 'he', avatar: a({ skin: '#5C3A24', hair: 'afro', hairColor: '#2A1A12', eyes: 'round', brows: 'thick', mouth: 'teeth', accessory: 'headphones', facial: 'none', outfit: '#2EC4B6', accent: '#B5EAD7', age: 'young' }) },
  { id: 'arthur', name: 'Arthur', pronoun: 'he', avatar: a({ skin: '#E8C4A2', hair: 'short', hairColor: '#EDEDED', eyes: 'dot', brows: 'worried', mouth: 'neutral', accessory: 'hat', facial: 'bigBeard', outfit: '#6B5B4B', accent: '#CBB89D', age: 'old' }) },
  { id: 'felix', name: 'Felix', pronoun: 'he', avatar: a({ skin: '#C68863', hair: 'mohawk', hairColor: '#2D2D2D', eyes: 'sharp', brows: 'angry', mouth: 'pout', accessory: 'bandana', facial: 'none', outfit: '#8E3B46', accent: '#E6A57E', age: 'young' }) },
  { id: 'hugo', name: 'Hugo', pronoun: 'he', avatar: a({ skin: '#D7A27A', hair: 'ponytail', hairColor: '#4A3426', eyes: 'narrow', brows: 'raised', mouth: 'smirk', accessory: 'eyepatch', facial: 'beard', outfit: '#2F4858', accent: '#86BBD8', age: 'adult' }) },
  { id: 'leonard', name: 'Leonard', pronoun: 'he', avatar: a({ skin: '#F0CDB0', hair: 'short', hairColor: '#8B5A2B', eyes: 'sleepy', brows: 'worried', mouth: 'frown', accessory: 'goggles', facial: 'mustache', outfit: '#7D6E58', accent: '#E8D5B5', age: 'adult' }) },
  { id: 'victor', name: 'Victor', pronoun: 'he', avatar: a({ skin: '#A86B47', hair: 'slick', hairColor: '#121212', eyes: 'sharp', brows: 'angry', mouth: 'neutral', accessory: 'collar', facial: 'stubble', outfit: '#1F2A44', accent: '#7C5CFF', age: 'adult' }) },
];

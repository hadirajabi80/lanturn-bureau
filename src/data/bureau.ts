import type { Character } from './types';

/**
 * The recurring cast of the Lantern Bureau, Greywick.
 * Ids are referenced in every case's opening/closing dialogue.
 */
export const BUREAU: Record<string, Character> = {
  you: {
    id: 'you',
    name: 'Rookie',
    role: 'Detective, Lantern Bureau',
    age: 27,
    tagline: 'Newest desk, oldest coffee.',
    personality: 'Quiet, observant, stubborn about the truth; everyone else does the talking.',
    quirk: 'Taps a pencil twice before writing a name down.',
    voice: 'Short, dry lines; the player speaks rarely.',
    avatar: { skin: '#C9956B', hair: 'wavy', hairColor: '#2B1F17', eyes: 'sharp', brows: 'flat', mouth: 'neutral', accessory: 'collar', facial: 'none', outfit: '#3B4A6B', accent: '#FFB347' },
  },
  otto: {
    id: 'otto',
    name: 'Chief Inspector Ottoline "Otto" Marsh',
    role: 'Head of the Lantern Bureau',
    age: 58,
    tagline: 'Hm.',
    personality: 'Gruff, economical, secretly soft; has seen every trick and is unimpressed by all of them.',
    quirk: 'Says "Hm." before every verdict and stirs her tea exactly three times.',
    voice: 'Clipped sentences. Dry understatement. Rarely a full paragraph. Calls the player "Rookie".',
    avatar: { skin: '#E8C4A2', hair: 'short', hairColor: '#B8B8B8', eyes: 'narrow', brows: 'thick', mouth: 'frown', accessory: 'tie', facial: 'none', outfit: '#3E3A33', accent: '#D4A857', age: 'old' },
  },
  quill: {
    id: 'quill',
    name: 'Dr. Felix Aurelio Quill',
    role: 'Forensic scientist',
    age: 44,
    tagline: 'The evidence speaks. I merely translate.',
    personality: 'Theatrical, brilliant, delighted by everything; treats every smear like a soliloquy.',
    quirk: 'Addresses evidence directly ("Well, hello, little fibre") and misquotes Shakespeare.',
    voice: 'Florid, Latin names, dramatic pauses; always technically correct.',
    avatar: { skin: '#F1D2B6', hair: 'curly', hairColor: '#8B4A2B', eyes: 'wide', brows: 'raised', mouth: 'grin', accessory: 'roundGlasses', facial: 'goatee', outfit: '#F3E9D2', accent: '#2EC4B6' },
  },
  nia: {
    id: 'nia',
    name: 'Nia Okonkwo-Reyes',
    role: 'Data & digital analyst',
    age: 29,
    tagline: 'Three energy drinks and a search warrant.',
    personality: 'Fast, funny, relentless; finds anything with a timestamp in under a minute.',
    quirk: 'Puns about databases; types with two fingers at impossible speed.',
    voice: 'Rapid, modern, playful; delivers the hard facts in one breath then a joke.',
    avatar: { skin: '#6B3F2A', hair: 'braids', hairColor: '#1B1B1B', eyes: 'round', brows: 'arched', mouth: 'smile', accessory: 'headphones', facial: 'none', outfit: '#2EC4B6', accent: '#7C5CFF', age: 'young' },
  },
  hestia: {
    id: 'hestia',
    name: 'Mrs. Hestia Vane',
    role: 'Archivist',
    age: 71,
    tagline: 'Everything is filed, dear. Everything.',
    personality: 'Gentle, patient, bottomless memory; the warm hearth of the Bureau — and its deepest secret.',
    quirk: 'Knits lilac scarves for everyone; types index cards on a 1962 Remington whose lowercase e sits low.',
    voice: 'Soft, old-fashioned, calls people "dear"; precise about dates; deflects questions about herself with tea.',
    avatar: { skin: '#F2DCC4', hair: 'bun', hairColor: '#DDDDDD', eyes: 'sleepy', brows: 'flat', mouth: 'smile', accessory: 'glasses', facial: 'none', outfit: '#B9A3D6', accent: '#B9A3D6', age: 'old' },
  },
  lucien: {
    id: 'lucien',
    name: 'Lucien Delacroix-Hart',
    role: 'Private detective (rival)',
    age: 38,
    tagline: 'I solved it already. I was waiting for you to catch up.',
    personality: 'Smug, immaculate, genuinely clever; annoyingly right about one thing per case.',
    quirk: 'Polishes a pocket watch he never checks; corrects everyone\'s grammar.',
    voice: 'Silky, condescending, elegant; compliments that are insults.',
    avatar: { skin: '#D9A57F', hair: 'slick', hairColor: '#1F1A17', eyes: 'narrow', brows: 'arched', mouth: 'smirk', accessory: 'bowtie', facial: 'stubble', outfit: '#5A1E2B', accent: '#C8323C' },
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    role: 'Bureau cat',
    age: 6,
    tagline: 'Sits on evidence. Solves nothing. Beloved.',
    personality: 'Imperious, fluffy, always on the one document you need.',
    quirk: 'Appears on the evidence drawer; knocks over a clue card once per case.',
    voice: 'Mrrp.',
    avatar: { kind: 'cat', skin: '#F0E6D8', hair: 'short', hairColor: '#8D7B68', eyes: 'round', brows: 'flat', mouth: 'smile', accessory: 'collar', facial: 'none', outfit: '#C8323C', accent: '#FFB347' },
  },
};

export const BUREAU_LIST: Character[] = Object.values(BUREAU);

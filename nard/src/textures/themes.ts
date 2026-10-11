export interface BoardTheme {
  id: ThemeId;
  name: string;
  swatch: [string, string, string];
  wood: { dark: string; mid: string; light: string };
  field: { base: string; dark: string; kind: 'leather' | 'felt' };
  pointA: string;
  pointB: string;
  line: string; // inlay metal (gold / silver)
  stitch: string;
  khatam: { bone: string; brass: string; dark: string; accentA: string; accentB: string };
  checkers: [CheckerLook, CheckerLook];
  dice: [{ body: string; pip: string }, { body: string; pip: string }];
  table: { center: string; edge: string };
  background: string;
}

export interface CheckerLook {
  label: string;
  color: string;
  rim: string;
  roughness: number;
  sheen: string;
}

export type ThemeId = 'khatam' | 'classic' | 'night';

export const THEMES: Record<ThemeId, BoardTheme> = {
  khatam: {
    id: 'khatam',
    name: 'خاتم',
    swatch: ['#4b2a17', '#6b1d22', '#c9a24a'],
    wood: { dark: '#1f0f07', mid: '#3e2213', light: '#6a4126' },
    field: { base: '#5b1a1f', dark: '#3a0e12', kind: 'leather' },
    pointA: '#e7d7b6',
    pointB: '#15535a',
    line: '#d4af5a',
    stitch: '#c79a4e',
    khatam: { bone: '#efe3c8', brass: '#c9a24a', dark: '#22130a', accentA: '#1c6b70', accentB: '#8a2128' },
    checkers: [
      { label: 'عاجی', color: '#f3ead9', rim: '#d9c7a4', roughness: 0.28, sheen: '#fff6e0' },
      { label: 'آبنوسی', color: '#1a1414', rim: '#4a3a2c', roughness: 0.22, sheen: '#8a6a40' },
    ],
    dice: [
      { body: '#f5eedf', pip: '#1a1210' },
      { body: '#1b1515', pip: '#d8b25e' },
    ],
    table: { center: '#2a1a12', edge: '#060403' },
    background: '#080504',
  },
  classic: {
    id: 'classic',
    name: 'کلاسیک',
    swatch: ['#3a1a0f', '#1f4d36', '#e9dfc6'],
    wood: { dark: '#2a0f06', mid: '#5a2412', light: '#8a4122' },
    field: { base: '#1d4a34', dark: '#0f2c1f', kind: 'felt' },
    pointA: '#ece2c8',
    pointB: '#8e2a22',
    line: '#c7a157',
    stitch: '#d8c79a',
    khatam: { bone: '#f1e7cf', brass: '#c7a157', dark: '#2a1208', accentA: '#1d4a34', accentB: '#8e2a22' },
    checkers: [
      { label: 'سفید', color: '#f6f3ec', rim: '#d8d2c4', roughness: 0.3, sheen: '#ffffff' },
      { label: 'سیاه', color: '#141416', rim: '#3a3a40', roughness: 0.25, sheen: '#707080' },
    ],
    dice: [
      { body: '#f7f4ee', pip: '#121212' },
      { body: '#8e1f1a', pip: '#f4ecd8' },
    ],
    table: { center: '#1d2620', edge: '#040605' },
    background: '#040605',
  },
  night: {
    id: 'night',
    name: 'شب لاجورد',
    swatch: ['#1a161c', '#13213d', '#c9a24a'],
    wood: { dark: '#08070a', mid: '#1b171d', light: '#3a3340' },
    field: { base: '#14223f', dark: '#0a1226', kind: 'leather' },
    pointA: '#b9c2d0',
    pointB: '#b8913a',
    line: '#e2c27a',
    stitch: '#8f9ab0',
    khatam: { bone: '#e6e9ef', brass: '#c9a24a', dark: '#0c0b10', accentA: '#244a9a', accentB: '#7a2a3a' },
    checkers: [
      { label: 'صدفی', color: '#eef1f6', rim: '#c4ccd8', roughness: 0.24, sheen: '#ffffff' },
      { label: 'مسی', color: '#a8552c', rim: '#6a3018', roughness: 0.26, sheen: '#ffb080' },
    ],
    dice: [
      { body: '#eef1f6', pip: '#14223f' },
      { body: '#7a3a1c', pip: '#f5dcb0' },
    ],
    table: { center: '#151826', edge: '#030306' },
    background: '#030306',
  },
};

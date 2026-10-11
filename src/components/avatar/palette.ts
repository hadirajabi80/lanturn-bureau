import type { AvatarSpec } from '../../data/types';
import { desaturate, luminance, mix, shade } from './color';

/** Every colour an avatar needs, derived once from the spec. */
export interface AvatarPalette {
  skin: string;
  skinLight: string;
  skinShadow: string;
  skinLine: string;
  hair: string;
  hairLight: string;
  hairShadow: string;
  hairLine: string;
  brow: string;
  outfit: string;
  outfitLight: string;
  outfitShadow: string;
  outfitLine: string;
  accent: string;
  accentLight: string;
  accentShadow: string;
  mouthLine: string;
  mouthDark: string;
  lip: string;
  tongue: string;
  blush: string;
  ink: string;
  iris: string;
  sclera: string;
  paper: string;
  brass: string;
  brassDark: string;
  metal: string;
  /** fur colours (cats): main = hairColor, light = skin */
  furMarks: string;
  catIris: string;
  whisker: string;
  innerEar: string;
}

export function buildPalette(spec: AvatarSpec): AvatarPalette {
  const old = spec.age === 'old';
  const skin = old ? desaturate(spec.skin, 0.1) : spec.skin;
  const hair = old ? mix(desaturate(spec.hairColor, 0.35), '#c9c6c2', 0.22) : spec.hairColor;
  const skinLum = luminance(skin);
  const darkSkin = skinLum < 0.18;
  const hairLum = luminance(hair);

  const mouthLine = mix(shade(skin, darkSkin ? -0.62 : -0.58), '#5a1f24', 0.35);
  return {
    skin,
    skinLight: shade(skin, darkSkin ? 0.12 : 0.16),
    skinShadow: shade(skin, darkSkin ? -0.22 : -0.14),
    skinLine: shade(skin, darkSkin ? -0.5 : -0.4),
    hair,
    hairLight: hairLum < 0.05 ? shade(hair, 0.32) : shade(hair, 0.26),
    hairShadow: shade(hair, -0.28),
    hairLine: shade(hair, hairLum < 0.05 ? -0.5 : -0.42),
    brow: hairLum > 0.45 ? shade(hair, -0.3) : shade(hair, -0.12),
    outfit: spec.outfit,
    outfitLight: shade(spec.outfit, 0.14),
    outfitShadow: shade(spec.outfit, -0.24),
    outfitLine: shade(spec.outfit, -0.45),
    accent: spec.accent,
    accentLight: shade(spec.accent, 0.3),
    accentShadow: shade(spec.accent, -0.3),
    mouthLine,
    mouthDark: mix(mouthLine, '#2a0d12', 0.5),
    lip: mix(shade(skin, -0.18), '#c0505c', 0.32),
    tongue: '#d9727c',
    blush: darkSkin ? '#ff5a5a' : '#ff7070',
    ink: '#241b25',
    iris: '#3b2a24',
    sclera: '#fffdf7',
    paper: '#f3e9d2',
    brass: '#d4a857',
    brassDark: '#8f6c30',
    metal: '#2b2a33',
    furMarks: shade(spec.hairColor, -0.32),
    catIris: '#b9d14b',
    whisker: hairLum < 0.25 ? 'rgba(255,255,255,0.85)' : 'rgba(40,28,30,0.7)',
    innerEar: mix(spec.skin, '#e79aa6', 0.55),
  };
}

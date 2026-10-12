/** Small shared helpers for the desk & modes (no React). */
import { TIERS, type Tier, type Variant } from '@/grid/types';

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

/** Local calendar date YYYY-MM-DD. */
export function todayISO(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ISO-8601 week id like `2026W41`. */
export function isoWeek(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}W${pad2(week)}`;
}

export const isTier = (t: string | undefined): t is Tier => !!t && (TIERS as string[]).includes(t);

export const TIER_NAME: Record<Tier, string> = {
  easy: 'Rookie',
  medium: 'Detective',
  hard: 'Inspector',
  extreme: 'Chief',
  mastermind: 'Mastermind',
  ultra: 'Extra Extreme',
};

export interface VariantMeta {
  name: string;
  /** lucide icon name (resolved in parts.tsx) */
  icon: 'Skull' | 'Users' | 'Lock' | 'FlaskConical' | 'Crosshair' | 'VenetianMask' | 'Swords' | 'Drama' | 'UserX';
  blurb: string;
  accuse: string;
}

export const VARIANT_META: Record<Variant, VariantMeta> = {
  classic: {
    name: 'Alone with the killer',
    icon: 'Skull',
    blurb: 'The victim shared a room with exactly one person. That person is the killer.',
    accuse: 'Name the killer.',
  },
  accomplice: {
    name: 'The accomplice',
    icon: 'Users',
    blurb: 'Two people were in the room with the victim. The one standing closer is the killer; the other is the accomplice.',
    accuse: 'Name the killer and the accomplice.',
  },
  lockedRoom: {
    name: 'Locked room',
    icon: 'Lock',
    blurb: 'The victim was alone behind a locked door. The killer was the only person in a room that shares a wall with it.',
    accuse: 'Name the killer.',
  },
  poison: {
    name: 'Poison',
    icon: 'FlaskConical',
    blurb: 'The poison was hidden in a piece of furniture. The killer is the only person standing right beside one of those pieces.',
    accuse: 'Name the killer.',
  },
  sniper: {
    name: 'Line of sight',
    icon: 'Crosshair',
    blurb: 'Only the killer had a clear line to the victim: along a row, column or diagonal, with no blocking furniture between.',
    accuse: 'Name the killer.',
  },
  liar: {
    name: 'The liar',
    icon: 'VenetianMask',
    blurb: 'One suspect lies in every single sentence. Turn their words around. The liar is the killer.',
    accuse: 'Name the killer (the liar).',
  },
  double: {
    name: 'Double homicide',
    icon: 'Swords',
    blurb: 'Two victims, two killers. Each victim was alone in a room with their own killer.',
    accuse: 'Match each victim to their killer.',
  },
  liarDouble: {
    name: 'Double, with a liar',
    icon: 'Drama',
    blurb: 'Two victims, two killers. One of the killers lies in every sentence.',
    accuse: 'Match each victim to their killer.',
  },
  accompliceLiar: {
    name: 'The lying accomplice',
    icon: 'UserX',
    blurb: 'Killer and accomplice shared the room with the victim, the killer closer. The accomplice lies in every sentence.',
    accuse: 'Name the killer and the accomplice.',
  },
};

/** Share text: case code, stars, time (no spoilers). */
export function shareText(opts: { title: string; code: string; stars: number; timeMs: number; mode?: string }): string {
  const stars = '★'.repeat(opts.stars) + '☆'.repeat(Math.max(0, 3 - opts.stars));
  return [
    `Floorplan Mysteries: ${opts.title}`,
    `Case ${opts.code}  ${stars}  ⏱ ${formatTime(opts.timeMs)}`,
    'Closed at the Lantern Bureau.',
  ].join('\n');
}

export async function shareOrCopy(text: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ text });
      return 'shared';
    }
  } catch {
    /* user cancelled or not allowed — fall back to clipboard */
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/** Small seeded RNG (mulberry32) for mode sessions. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const cellName = (c: { r: number; c: number }) => `${String.fromCharCode(65 + c.c)}${c.r + 1}`;

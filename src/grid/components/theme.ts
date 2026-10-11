/**
 * Crime Files light UI tokens + small shared helpers for the /files/* screens.
 */
import { Fingerprint, Flame, Search, Skull, type LucideIcon } from 'lucide-react';
import { sfx } from '@/engine/audio';
import { useFiles } from '@/grid/store';
import { TIERS, type Season, type Tier } from '@/grid/types';

export const C = {
  bg: '#f3ede4',
  card: '#ffffff',
  ink: '#2b2724',
  muted: '#8a8178',
  line: '#e7dfd3',
  orange: '#e8632b',
  green: '#3f9d55',
  amber: '#e0a21b',
  red: '#d9443a',
  purple: '#7b4fd6',
} as const;

/** Soft card shadow used everywhere on the light screens. */
export const CARD_SHADOW = 'shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_8px_22px_-12px_rgb(70_45_20/0.28)]';

export interface TierMeta {
  label: string;
  color: string;
  icon: LucideIcon;
  /** Grid size range (square side) at case 1 and case 40, see GRID-PLAN §2. */
  minSize: number;
  maxSize: number;
  people: [number, number];
}

export const TIER_META: Record<Tier, TierMeta> = {
  easy: { label: 'Easy', color: C.green, icon: Search, minSize: 4, maxSize: 5, people: [3, 4] },
  medium: { label: 'Medium', color: C.amber, icon: Fingerprint, minSize: 5, maxSize: 6, people: [4, 5] },
  hard: { label: 'Hard', color: C.red, icon: Flame, minSize: 6, maxSize: 7, people: [5, 6] },
  extreme: { label: 'Extreme', color: C.purple, icon: Skull, minSize: 7, maxSize: 8, people: [6, 8] },
};

export const isTier = (t: string | undefined): t is Tier => !!t && (TIERS as string[]).includes(t);

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

/** Local calendar date as YYYY-MM-DD (the daily case changes at local midnight). */
export function todayISO(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Route of the case after (season, tier, n): next index, then the next tier's first case, else null. */
export function nextCasePath(season: Pick<Season, 'id' | 'casesPerTier'>, tier: Tier, n: number): string | null {
  if (n < season.casesPerTier) return `/files/${season.id}/${tier}/${n + 1}`;
  const ti = TIERS.indexOf(tier);
  const nextTier = TIERS[ti + 1];
  return nextTier ? `/files/${season.id}/${nextTier}/1` : null;
}

type SfxName = 'blip' | 'reveal' | 'wrong' | 'success' | 'stamp' | 'contradiction' | 'drumroll';

/** Plays a sound effect unless Crime Files sound is switched off (story-mode mute still applies). */
export function play(name: SfxName): void {
  if (!useFiles.getState().settings.sound) return;
  sfx[name]();
}

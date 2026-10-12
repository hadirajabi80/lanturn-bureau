/**
 * Visual tokens for the meta screens (v3 "printed case file", docs/PRINT-DESIGN.md).
 * Reads the Floorplan design-system CSS variables (`--fp-*`) when a <SkinProvider> sets them,
 * with the print palette as fallbacks so widgets also work in portals outside `.fp-root`.
 */
import type { AchievementTier } from './types';

export const FP = {
  bg: 'var(--fp-bg, #F1F1EC)',
  panel: 'var(--fp-panel, #FFFFFF)',
  panel2: 'var(--fp-bg, #F1F1EC)',
  ink: 'var(--fp-ink, #141414)',
  muted: 'var(--fp-muted, #5E5E5A)',
  accent: 'var(--fp-accent, #D7261E)',
  accent2: 'var(--fp-accent2, #A51A14)',
  danger: 'var(--fp-danger, #D7261E)',
  hl: 'var(--fp-hl, #FFD84D)',
  green: 'var(--fp-green, #1E8A4C)',
  grey: '#C9C9C3',
  hair: 'var(--fp-hair, #D9D9D2)',
  hairStrong: 'var(--fp-ink, #141414)',
  display: 'var(--font-display, "Archivo", system-ui, sans-serif)',
  mono: 'var(--font-mono, "IBM Plex Mono", ui-monospace, monospace)',
} as const;

/** Achievement tiers: a printed spot colour per tier (used for a small swatch, never a wash). */
export const METAL: Record<AchievementTier, { base: string; light: string; dark: string; label: string }> = {
  bronze: { base: '#B4682E', light: '#F3DCC8', dark: '#141414', label: 'Bronze' },
  silver: { base: '#8A9097', light: '#E6E8EA', dark: '#141414', label: 'Silver' },
  gold: { base: '#E0A400', light: '#FFD84D', dark: '#141414', label: 'Gold' },
  platinum: { base: '#2350D8', light: '#DCE4FA', dark: '#141414', label: 'Platinum' },
};

/** Static panel: white card, 2px ink border, 8px corners, no shadow. */
export const panelStyle = {
  background: FP.panel,
  boxShadow: `inset 0 0 0 2px ${FP.ink}`,
  borderRadius: 8,
} as const;

export const fmtTime = (ms: number | null | undefined): string => {
  if (ms == null || !Number.isFinite(ms)) return '–';
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};

export const fmtInt = (n: number): string => Math.round(n).toLocaleString('en-US');

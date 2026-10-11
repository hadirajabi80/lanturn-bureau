/**
 * Visual tokens for the meta screens. Reads the Floorplan design-system CSS variables (`--fp-*`)
 * when the hub/desk sets them, with Lantern Bureau fallbacks so widgets work anywhere.
 */
import type { AchievementTier } from './types';

export const FP = {
  bg: 'var(--fp-bg, #0D0A08)',
  panel: 'var(--fp-panel, #18130F)',
  panel2: 'var(--fp-panel-2, #211A14)',
  ink: 'var(--fp-ink, #F1E6D2)',
  muted: 'var(--fp-muted, #A8977D)',
  accent: 'var(--fp-accent, #D4A857)',
  accent2: 'var(--fp-accent2, #FFB347)',
  danger: 'var(--fp-danger, #C8323C)',
  hair: 'color-mix(in srgb, var(--fp-accent, #D4A857) 18%, transparent)',
  hairStrong: 'color-mix(in srgb, var(--fp-accent, #D4A857) 38%, transparent)',
  display: 'var(--font-display, "Playfair Display", Georgia, serif)',
  mono: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)',
} as const;

export const METAL: Record<AchievementTier, { base: string; light: string; dark: string; label: string }> = {
  bronze: { base: '#C0814F', light: '#E9B88A', dark: '#6E4022', label: 'Bronze' },
  silver: { base: '#BCC6D1', light: '#F2F6FA', dark: '#5D6874', label: 'Silver' },
  gold: { base: '#D9AE4C', light: '#FFE6A0', dark: '#7A5A1A', label: 'Gold' },
  platinum: { base: '#9EE3E6', light: '#F0FFFF', dark: '#3C7F86', label: 'Platinum' },
};

/** Panel surface style: panel colour, accent hairline, soft shadow, 10px corners (brief §1). */
export const panelStyle = {
  background: FP.panel,
  boxShadow: `inset 0 0 0 1px ${FP.hair}, 0 18px 40px -24px rgba(0,0,0,0.85)`,
  borderRadius: 10,
} as const;

export const fmtTime = (ms: number | null | undefined): string => {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};

export const fmtInt = (n: number): string => Math.round(n).toLocaleString('en-US');

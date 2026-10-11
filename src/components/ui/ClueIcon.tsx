import { FileQuestion, type LucideIcon, type LucideProps } from 'lucide-react';
import type { ClueKind } from '@/data/types';
import { ICONS } from './iconRegistry';

const toPascal = (s: string): string =>
  s
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());

/**
 * Look up a registered lucide icon by name, accepting PascalCase ("ChefHat"), kebab/snake/lower
 * case ("chef-hat") and an `Icon` suffix ("ChefHatIcon"). Only icons listed in the generated
 * `iconRegistry.ts` are available — run `npm run icons` after adding content.
 */
export function lookupIcon(name: string | undefined | null): LucideIcon | undefined {
  const key = (name ?? '').trim();
  if (!key) return undefined;
  const p = toPascal(key);
  const stripped = p.length > 4 && p.endsWith('Icon') ? p.slice(0, -4) : p;
  return ICONS[key] ?? ICONS[p] ?? ICONS[stripped];
}

/** Resolve a lucide icon by name; falls back to FileQuestion (or the given fallback). */
export function getIcon(name: string | undefined, fallback: LucideIcon = FileQuestion): LucideIcon {
  return lookupIcon(name) ?? fallback;
}

export const KIND_META: Record<ClueKind, { label: string; icon: string; color: string }> = {
  physical: { label: 'Physical', icon: 'Package', color: '#D4A857' },
  document: { label: 'Documents', icon: 'FileText', color: '#F3E9D2' },
  testimony: { label: 'Testimony', icon: 'MessageSquareQuote', color: '#B9A3D6' },
  digital: { label: 'Digital', icon: 'Cpu', color: '#2EC4B6' },
  photo: { label: 'Photographs', icon: 'Camera', color: '#FFB347' },
  forensic: { label: 'Forensic', icon: 'Microscope', color: '#7FD1A8' },
};

export const KIND_ORDER: ClueKind[] = ['physical', 'document', 'forensic', 'testimony', 'digital', 'photo'];

export interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name?: string;
  fallback?: string;
}

/** Renders a lucide icon by name; falls back to FileQuestion. */
export function DynamicIcon({ name, fallback, ...rest }: DynamicIconProps) {
  const Icon = getIcon(name, getIcon(fallback));
  return <Icon {...rest} />;
}

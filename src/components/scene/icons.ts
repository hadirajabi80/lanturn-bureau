import { Sparkles, type LucideIcon } from 'lucide-react';
import { lookupIcon } from '@/components/ui/ClueIcon';

const cache = new Map<string, LucideIcon>();

/**
 * Safely resolve a lucide icon by name ("ChefHat", "chef-hat", "ChefHatIcon") from the generated
 * icon registry (`npm run icons`). Unknown names fall back to Sparkles — never throws, never
 * returns undefined.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon {
  const key = (name ?? '').trim();
  const hit = cache.get(key);
  if (hit) return hit;
  const found = lookupIcon(key) ?? Sparkles;
  cache.set(key, found);
  return found;
}

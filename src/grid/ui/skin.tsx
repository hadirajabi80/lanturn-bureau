import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import { DISTRICTS, getDistrict } from '@/grid/skins/districts';
import type { District, SkinPalette } from '@/grid/skins/types';
import { luminance } from '@/components/avatar/color';
import './fp.css';

/**
 * SkinProvider — the current district's palette as React context + CSS custom properties.
 * Sets `--fp-bg --fp-panel --fp-ink --fp-muted --fp-accent --fp-accent2 --fp-danger --fp-glow`
 * (plus `--fp-sheet --fp-wall`) on a wrapper element with class `fp-root`.
 * Defaults to Ashcombe Manor. Nest providers to re-skin a subtree.
 */

const DEFAULT_DISTRICT = DISTRICTS[0] as District;

export interface SkinValue {
  district: District;
  palette: SkinPalette;
  /** bright daytime district (dark ink on light panels). */
  light: boolean;
}

/** True for light-mood districts (flag, or a bright page background). */
export const isLightDistrict = (d: District): boolean => d.mood === 'light' || (d.mood !== 'night' && luminance(d.palette.bg) > 0.45);

const SkinContext = createContext<SkinValue>({ district: DEFAULT_DISTRICT, palette: DEFAULT_DISTRICT.palette, light: false });

export const useSkin = (): SkinValue => useContext(SkinContext);

/** CSS custom properties for a palette (usable as a `style` object anywhere). */
export function skinVars(p: SkinPalette): CSSProperties {
  return {
    '--fp-bg': p.bg,
    '--fp-panel': p.panel,
    '--fp-ink': p.ink,
    '--fp-muted': p.muted,
    '--fp-accent': p.accent,
    '--fp-accent2': p.accent2,
    '--fp-danger': p.danger,
    '--fp-glow': p.glow,
    '--fp-sheet': p.sheet,
    '--fp-wall': p.wall,
  } as CSSProperties;
}

export interface SkinProviderProps {
  /** District object or id (unknown ids fall back to Ashcombe). */
  district?: District | string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SkinProvider({ district, children, className, style }: SkinProviderProps) {
  const d = typeof district === 'string' ? (getDistrict(district) ?? DEFAULT_DISTRICT) : (district ?? DEFAULT_DISTRICT);
  const value = useMemo(() => ({ district: d, palette: d.palette, light: isLightDistrict(d) }), [d]);
  return (
    <SkinContext.Provider value={value}>
      <div
        className={['fp-root', className].filter(Boolean).join(' ')}
        style={{ ...skinVars(d.palette), ...style }}
        data-district={d.id}
        data-mood={value.light ? 'light' : 'night'}
      >
        {children}
      </div>
    </SkinContext.Provider>
  );
}

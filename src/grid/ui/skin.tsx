import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import { DISTRICTS, getDistrict } from '@/grid/skins/districts';
import type { District, SkinPalette } from '@/grid/skins/types';
import { luminance } from '@/components/avatar/color';
import './fp.css';

/**
 * SkinProvider — the current district as React context + CSS custom properties on a `.fp-root` wrapper.
 * v3 "printed case file" (docs/PRINT-DESIGN.md): the UI chrome uses the same paper-and-ink palette in
 * every district (`--fp-bg --fp-panel --fp-ink --fp-muted --fp-accent --fp-accent2 --fp-hl --fp-blue
 * --fp-green --fp-danger`, legacy `--fp-glow`); the district only adds an identity swatch
 * (`--fp-district --fp-district-bg`) and the board's own colours (`--fp-sheet --fp-wall`).
 * Defaults to Ashcombe Manor. Nest providers to re-skin a subtree.
 */

const DEFAULT_DISTRICT = DISTRICTS[0] as District;

export interface SkinValue {
  district: District;
  /** the district's own palette (board, facade art, identity swatches) */
  palette: SkinPalette;
  /** bright daytime district (Sugar Lane etc.): flavour only, e.g. hearts instead of stars. The UI is always light. */
  light: boolean;
}

/** The printed-case-file UI palette (docs/PRINT-DESIGN.md), the same in every district. */
export const PRINT = {
  paper: '#F1F1EC',
  card: '#FFFFFF',
  ink: '#141414',
  muted: '#5E5E5A',
  rule: '#D9D9D2',
  red: '#D7261E',
  redInk: '#A51A14',
  yellow: '#FFD84D',
  blue: '#2350D8',
  green: '#1E8A4C',
  grey: '#C9C9C3',
} as const;

/** True for light-mood districts (flag, or a bright page background). */
export const isLightDistrict = (d: District): boolean => d.mood === 'light' || (d.mood !== 'night' && luminance(d.palette.bg) > 0.45);

const SkinContext = createContext<SkinValue>({ district: DEFAULT_DISTRICT, palette: DEFAULT_DISTRICT.palette, light: false });

export const useSkin = (): SkinValue => useContext(SkinContext);

/** CSS custom properties for a palette (usable as a `style` object anywhere). */
export function skinVars(p: SkinPalette): CSSProperties {
  // v3: the UI chrome is paper and ink in every district; the district adds an identity swatch
  // (--fp-district, --fp-district-bg) and the board's own colours (--fp-sheet, --fp-wall).
  return {
    '--fp-bg': PRINT.paper,
    '--fp-panel': PRINT.card,
    '--fp-ink': PRINT.ink,
    '--fp-muted': PRINT.muted,
    '--fp-accent': PRINT.red,
    '--fp-accent2': PRINT.redInk,
    '--fp-hi': PRINT.red,
    '--fp-hl': PRINT.yellow,
    '--fp-blue': PRINT.blue,
    '--fp-green': PRINT.green,
    '--fp-danger': PRINT.red,
    '--fp-glow': PRINT.red,
    '--fp-district': p.accent,
    '--fp-district-bg': p.bg,
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
        data-district-mood={value.light ? 'light' : 'night'}
      >
        {children}
      </div>
    </SkinContext.Provider>
  );
}

/**
 * Floorplan Mysteries design system (hub agent). Brief: docs/FLOORPLAN-DESIGN.md §1.
 * Colours come from the district palette via <SkinProvider> → CSS vars --fp-*.
 * Data bridge for hub screens lives in ./bridge (not re-exported here on purpose).
 */
export { SkinProvider, useSkin, skinVars, isLightDistrict, type SkinProviderProps, type SkinValue } from './skin';
export { DeskBackground, type DeskBackgroundProps } from './DeskBackground';
export {
  Panel,
  BrassButton,
  GhostButton,
  Chip,
  Plate,
  MonoStat,
  ProgressFilament,
  StarRow,
  KeyTag,
  type PanelProps,
  type FpButtonProps,
  type ChipProps,
  type PlateProps,
  type MonoStatProps,
  type ProgressFilamentProps,
  type KeyTagProps,
  type KeyTagStatus,
} from './primitives';
export { FacadeArt, FACADE_SIZE, facadeWindowCount, type FacadeArtProps } from './FacadeArt';
export { VariantGlyph, VARIANT_INFO, type VariantGlyphProps } from './VariantGlyph';
export { PageShell, type PageShellProps } from './PageShell';
export { LanternLoader } from './LanternLoader';
export { useFpReduced } from './useFpReduced';
export { parseTierParam, tierLabel } from './tiers';
export { Stamp, type StampProps } from '@/components/fx/Stamp';

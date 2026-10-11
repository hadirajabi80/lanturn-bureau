/**
 * Floorplan Mysteries audio (docs/FLOORPLAN-DESIGN.md §7): procedural district ambience,
 * synthesized desk sfx, haptics. No asset files; everything no-ops outside the browser.
 *
 *   import { ambience, sfx2, useAmbience, haptic } from '@/grid/audio';
 *   useAmbience(district.ambience, settings.ambience);
 *   sfx2.pin(); haptic('pin');
 */
export { ambience, AMBIENCE_FADE, DEFAULT_AMBIENCE_VOLUME } from './ambience';
export type { Ambience } from './ambience';
export { AMBIENCE_IDS, isAmbienceId } from './beds';
export type { AmbienceId } from './beds';
export { sfx2 } from './sfx';
export type { Sfx2 } from './sfx';
export { useAmbience } from './useAmbience';
export { haptic, hapticsSupported, setHapticsEnabled, HAPTICS } from './haptic';
export type { HapticName } from './haptic';

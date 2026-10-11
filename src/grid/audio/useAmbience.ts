import { useEffect } from 'react';
import { ambience } from './ambience';
import type { AmbienceId } from './beds';

let owner = 0;
let seq = 0;

/**
 * Play a district ambience while the calling component is mounted.
 * Navigating between screens that use the same id keeps the bed running (no re-fade);
 * switching ids cross-fades; unmounting the last user fades it out.
 * `enabled=false` (e.g. the player's ambience setting) stops it.
 */
export function useAmbience(id: AmbienceId | string | null | undefined, enabled = true): void {
  useEffect(() => {
    if (!enabled || !id) return undefined;
    const token = ++seq;
    owner = token;
    ambience.play(id);
    return () => {
      // Defer so a screen that mounts in the same commit can claim ownership first.
      setTimeout(() => {
        if (owner === token) ambience.stop();
      }, 60);
    };
  }, [id, enabled]);
}

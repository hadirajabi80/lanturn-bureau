/**
 * `npm run audio:smoke` — imports the audio module in plain node (no window, no AudioContext)
 * and checks every public entry point is a safe no-op.
 */
import assert from 'node:assert/strict';
import { AMBIENCE_IDS, ambience, haptic, hapticsSupported, isAmbienceId, setHapticsEnabled, sfx2, useAmbience } from '../index';
import { DISTRICTS } from '../../skins/districts';

assert.equal(typeof window, 'undefined', 'smoke test must run without window');

// every district's ambience has a bed, and every bed belongs to a district
assert.ok(DISTRICTS.length >= 11, `expected at least 11 districts, got ${DISTRICTS.length}`);
for (const d of DISTRICTS) assert.ok(isAmbienceId(d.ambience), `unknown ambience ${d.ambience} for ${d.id}`);
const used = new Set(DISTRICTS.map((d) => d.ambience));
assert.deepEqual([...AMBIENCE_IDS].sort(), [...used].sort(), 'AMBIENCE_IDS must match the district ambience set');

// ambience API
for (const id of AMBIENCE_IDS) ambience.play(id);
ambience.play('nope');
ambience.play(null);
ambience.setVolume(0.8);
assert.equal(ambience.getVolume(), 0.8);
ambience.setVolume(Number.NaN);
assert.equal(ambience.getVolume(), 0.5);
ambience.setEnabled(false);
assert.equal(ambience.isEnabled(), false);
ambience.setEnabled(true);
ambience.stop();
assert.equal(ambience.current(), null);

// sfx2 API
const names = ['pin', 'cross', 'pencil', 'erase', 'stamp', 'lever', 'spotlight', 'otto', 'burn', 'reveal', 'tick', 'success'] as const;
for (const n of names) {
  assert.equal(typeof sfx2[n], 'function', `sfx2.${n} missing`);
  sfx2[n]();
}
sfx2.setMuted(true);
assert.equal(sfx2.isMuted(), true);
sfx2.pin();
sfx2.setMuted(false);

// haptics
assert.equal(hapticsSupported(), false);
assert.equal(haptic('stamp'), false);
assert.equal(haptic([10, 20, 10]), false);
setHapticsEnabled(false);
assert.equal(haptic(5), false);
setHapticsEnabled(true);

assert.equal(typeof useAmbience, 'function');

console.log(`audio smoke ok — ${DISTRICTS.length} districts, ${AMBIENCE_IDS.length} beds, ${names.length} sfx, haptics no-op without navigator.vibrate`);

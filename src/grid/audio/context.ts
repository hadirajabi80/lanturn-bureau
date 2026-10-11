/**
 * Shared Web Audio plumbing for Floorplan Mysteries (ambience beds + sfx2).
 * Independent of src/engine/audio.ts: own AudioContext, own buses, own mute state.
 *
 * - The context is created lazily and never before a user gesture for ambience (see `whenGestured`).
 * - The context is suspended while the tab is hidden and resumed when it becomes visible again.
 * - Everything is a silent no-op when `window`/`AudioContext` is unavailable (SSR, node, tests).
 */

export interface Audio {
  ctx: AudioContext;
  /** Final output (fixed level, a gentle limiter guards the destination). */
  out: GainNode;
  /** Ambience bus — level controlled by ambience.setVolume / setEnabled. */
  ambBus: GainNode;
  /** Sfx bus — level controlled by sfx2.setMuted. */
  sfxBus: GainNode;
  /** Small persistent room send for sfx (feedback delay, zero per-call setup). */
  sfxRoom: GainNode;
}

let audio: Audio | null = null;
let failed = false;

export const hasWindow = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

function ctor(): typeof AudioContext | undefined {
  if (!hasWindow()) return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

/** True once the page has received any user activation (so an AudioContext may start). */
export function hasGesture(): boolean {
  if (!hasWindow()) return false;
  if (gestured) return true;
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return !!ua?.hasBeenActive;
}

let gestured = false;
let gestureWaiters: (() => void)[] = [];
let gestureInstalled = false;
const GESTURE_EVENTS = ['pointerdown', 'keydown', 'touchend', 'click'] as const;

function onGesture(): void {
  gestured = true;
  GESTURE_EVENTS.forEach((ev) => window.removeEventListener(ev, onGesture, true));
  gestureInstalled = false;
  if (audio && audio.ctx.state === 'suspended' && !document.hidden) void audio.ctx.resume().catch(() => undefined);
  const waiters = gestureWaiters;
  gestureWaiters = [];
  waiters.forEach((fn) => {
    try {
      fn();
    } catch {
      /* decorative */
    }
  });
}

/** Run `fn` now if the page has been activated, else on the next user gesture. */
export function whenGestured(fn: () => void): void {
  if (!hasWindow()) return;
  if (hasGesture()) {
    fn();
    return;
  }
  gestureWaiters.push(fn);
  if (!gestureInstalled) {
    gestureInstalled = true;
    GESTURE_EVENTS.forEach((ev) => window.addEventListener(ev, onGesture, true));
  }
}

/** Drop pending gesture callbacks (e.g. ambience stopped before the first click). */
export function clearGestureWaiters(): void {
  gestureWaiters = [];
}

function installVisibility(ctx: AudioContext): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ctx.state === 'running') void ctx.suspend().catch(() => undefined);
    } else if (ctx.state === 'suspended' && hasGesture()) {
      void ctx.resume().catch(() => undefined);
    }
  });
}

/** Lazily create the shared graph. Returns null when audio is unavailable. */
export function getAudio(): Audio | null {
  if (audio) {
    if (audio.ctx.state === 'suspended' && !document.hidden && hasGesture()) {
      void audio.ctx.resume().catch(() => undefined);
    }
    return audio;
  }
  if (failed) return null;
  const C = ctor();
  if (!C) {
    failed = true;
    return null;
  }
  try {
    const ctx = new C({ latencyHint: 'interactive' });
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    limiter.connect(ctx.destination);
    const out = ctx.createGain();
    out.gain.value = 1;
    out.connect(limiter);
    const ambBus = ctx.createGain();
    ambBus.gain.value = 0;
    ambBus.connect(out);
    const sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.32;
    sfxBus.connect(out);

    // sfx room: input → (dry is NOT passed; callers send to both) → delay loop → sfxBus
    const sfxRoom = ctx.createGain();
    const d1 = ctx.createDelay(1);
    d1.delayTime.value = 0.083;
    const d2 = ctx.createDelay(1);
    d2.delayTime.value = 0.127;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 2400;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    sfxRoom.connect(d1);
    sfxRoom.connect(d2);
    d1.connect(damp);
    d2.connect(damp);
    damp.connect(fb).connect(d1);
    damp.connect(wet).connect(sfxBus);

    audio = { ctx, out, ambBus, sfxBus, sfxRoom };
    installVisibility(ctx);
    if (ctx.state === 'suspended' && hasGesture() && !document.hidden) void ctx.resume().catch(() => undefined);
    return audio;
  } catch {
    failed = true;
    return null;
  }
}

/* ------------------------------------------------------------------ noise buffers */

const noiseCache = new Map<string, AudioBuffer>();

export type NoiseColor = 'white' | 'pink' | 'brown';

/** Looping-safe noise buffer (cross-faded seam). White is 1 s; pink/brown are 4 s. */
export function noiseBuffer(ctx: AudioContext, color: NoiseColor): AudioBuffer {
  const key = `${color}:${ctx.sampleRate}`;
  const hit = noiseCache.get(key);
  if (hit) return hit;
  const secs = color === 'white' ? 1 : 4;
  const len = Math.floor(ctx.sampleRate * secs);
  const fade = 2048;
  const total = len + fade;
  const d = new Float32Array(total);
  if (color === 'white') {
    for (let i = 0; i < total; i++) d[i] = Math.random() * 2 - 1;
  } else if (color === 'pink') {
    // Paul Kellett's economy pink filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < total; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < total; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  // Blend the head with the samples that follow the tail, so sample len-1 → 0 is continuous
  // and `loop = true` has no click.
  for (let i = 0; i < fade; i++) {
    const a = i / fade;
    d[i] = d[i] * a + d[len + i] * (1 - a);
  }
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  buf.getChannelData(0).set(d.subarray(0, len));
  noiseCache.set(key, buf);
  return buf;
}

const impulseCache = new Map<string, AudioBuffer>();

/** Stereo exponential-decay impulse for ConvolverNode reverbs (cached per shape). */
export function impulse(ctx: AudioContext, seconds: number, decay = 3): AudioBuffer {
  const key = `${seconds}:${decay}:${ctx.sampleRate}`;
  const hit = impulseCache.get(key);
  if (hit) return hit;
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  // exponential tail reaching 10^-decay at the end (multiplicative: no pow() per sample)
  const r = Math.pow(10, -decay / len);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let env = 1;
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * env;
      env *= r;
    }
  }
  impulseCache.set(key, buf);
  return buf;
}

export const dbToGain = (db: number): number => Math.pow(10, db / 20);
export const midi = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

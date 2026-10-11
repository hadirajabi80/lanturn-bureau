/**
 * District ambience controller. One bed plays at a time; switching cross-fades over 1.2 s.
 * Never starts before a user gesture; pauses with the tab (context suspended while hidden).
 *
 * Volume: `setVolume(v)` takes a 0..1 slider value mapped with a square law onto the bus gain
 * (0.25·v²): the default 0.5 is −24 dB, 1.0 is −12 dB, 0 is silent.
 */
import { clearGestureWaiters, getAudio, hasGesture, hasWindow, whenGestured } from './context';
import { createBed, isAmbienceId, type AmbienceId, type Bed } from './beds';

export const AMBIENCE_FADE = 1.2;
export const DEFAULT_AMBIENCE_VOLUME = 0.5; // → −24 dB
const LOOKAHEAD = 0.35;
const PUMP_MS = 100;

let desired: AmbienceId | null = null;
let enabled = true;
let volume = DEFAULT_AMBIENCE_VOLUME;
let current: Bed | null = null;
const fading = new Set<Bed>();
let pumpTimer: ReturnType<typeof setInterval> | null = null;
let waitingForGesture = false;

const volToGain = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return 0.25 * c * c;
};

function ensurePump(): void {
  if (pumpTimer !== null) return;
  pumpTimer = setInterval(() => {
    const a = getAudio();
    if (!a) return;
    if (a.ctx.state !== 'running') return;
    const until = a.ctx.currentTime + LOOKAHEAD;
    current?.pump(until);
    fading.forEach((b) => b.pump(until));
  }, PUMP_MS);
}

function stopPumpIfIdle(): void {
  if (!current && fading.size === 0 && pumpTimer !== null) {
    clearInterval(pumpTimer);
    pumpTimer = null;
  }
}

function fadeOut(bed: Bed, ctx: AudioContext): void {
  const t = ctx.currentTime;
  const g = bed.out.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + AMBIENCE_FADE);
  fading.add(bed);
  setTimeout(() => {
    bed.dispose();
    fading.delete(bed);
    stopPumpIfIdle();
  }, AMBIENCE_FADE * 1000 + 150);
}

function fadeIn(bed: Bed, ctx: AudioContext): void {
  const t = ctx.currentTime;
  // equal-power-ish rise
  const n = 32;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) curve[i] = Math.sin(((i / (n - 1)) * Math.PI) / 2);
  bed.out.gain.setValueAtTime(0, t);
  bed.out.gain.setValueCurveAtTime(curve, t + 0.01, AMBIENCE_FADE);
}

function apply(): void {
  if (!hasWindow()) return;
  const want = enabled ? desired : null;
  if ((current?.id ?? null) === want) return;

  if (want && !hasGesture()) {
    if (!waitingForGesture) {
      waitingForGesture = true;
      whenGestured(() => {
        waitingForGesture = false;
        apply();
      });
    }
    return;
  }

  const a = getAudio();
  if (!a) return;
  const { ctx, ambBus } = a;
  ambBus.gain.setTargetAtTime(volToGain(volume), ctx.currentTime, 0.05);

  if (current) {
    fadeOut(current, ctx);
    current = null;
  }
  if (want) {
    try {
      const bed = createBed(ctx, ambBus, want);
      fadeIn(bed, ctx);
      bed.pump(ctx.currentTime + LOOKAHEAD);
      current = bed;
      ensurePump();
    } catch {
      current = null;
    }
  }
  stopPumpIfIdle();
}

export const ambience = {
  /** Start (or cross-fade to) a district bed. Unknown ids / null stop the ambience. */
  play(id: AmbienceId | string | null | undefined): void {
    desired = isAmbienceId(id) ? id : null;
    apply();
  },
  /** Fade out and forget the current bed. */
  stop(): void {
    desired = null;
    waitingForGesture = false;
    clearGestureWaiters();
    apply();
  },
  /** 0..1 slider value; 0.5 (default) = −24 dB. */
  setVolume(v: number): void {
    volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : DEFAULT_AMBIENCE_VOLUME;
    if (!hasWindow()) return;
    const a = current ? getAudio() : null;
    if (a) a.ambBus.gain.setTargetAtTime(volToGain(volume), a.ctx.currentTime, 0.08);
  },
  getVolume(): number {
    return volume;
  },
  /** Global ambience switch (settings toggle). Remembers the requested bed. */
  setEnabled(b: boolean): void {
    enabled = b;
    apply();
  },
  isEnabled(): boolean {
    return enabled;
  },
  /** Id currently audible (null while silent / waiting for a gesture). */
  current(): AmbienceId | null {
    return current?.id ?? null;
  },
};

export type Ambience = typeof ambience;

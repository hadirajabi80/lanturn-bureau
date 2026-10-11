/**
 * Lantern Bureau sound effects — pure Web Audio synthesis, no asset files.
 * A single AudioContext is created lazily on the first sound and resumed on the next user
 * gesture if the browser started it suspended. Every call is a silent no-op in SSR/tests.
 */

type Wave = OscillatorType;

interface Engine {
  ctx: AudioContext;
  master: GainNode;
}

const MASTER_GAIN = 0.25;

let engine: Engine | null = null;
let muted = false;
let noiseBuffer: AudioBuffer | null = null;
let unlockInstalled = false;

function installUnlock(ctx: AudioContext): void {
  if (unlockInstalled) return;
  unlockInstalled = true;
  const events = ['pointerdown', 'keydown', 'touchstart'] as const;
  const unlock = () => {
    void ctx.resume().catch(() => undefined);
    if (ctx.state === 'running') events.forEach((ev) => window.removeEventListener(ev, unlock, true));
  };
  events.forEach((ev) => window.addEventListener(ev, unlock, true));
}

function getEngine(): Engine | null {
  if (typeof window === 'undefined' || muted) return null;
  if (!engine) {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      master.connect(ctx.destination);
      engine = { ctx, master };
      installUnlock(ctx);
    } catch {
      return null;
    }
  }
  if (engine.ctx.state === 'suspended') void engine.ctx.resume().catch(() => undefined);
  return engine;
}

function getNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const len = ctx.sampleRate; // 1 s of white noise, reused for every burst
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/** Percussive envelope: fast attack, exponential decay. */
function envelope(g: GainNode, t: number, peak: number, dur: number, attack = 0.005): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: Wave;
  gain?: number;
  at?: number; // seconds from now
  freqEnd?: number;
  dest?: AudioNode;
}

function tone(e: Engine, { freq, dur, type = 'sine', gain = 0.6, at = 0, freqEnd, dest }: ToneOpts): void {
  const { ctx } = e;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
  envelope(g, t, gain, dur);
  osc.connect(g).connect(dest ?? e.master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

interface NoiseOpts {
  dur: number;
  gain?: number;
  at?: number;
  filter?: BiquadFilterType;
  freq?: number;
  q?: number;
  freqEnd?: number;
  dest?: AudioNode;
}

function noise(e: Engine, { dur, gain = 0.5, at = 0, filter = 'lowpass', freq = 1200, q = 0.8, freqEnd, dest }: NoiseOpts): void {
  const { ctx } = e;
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  envelope(g, t, gain, dur, 0.003);
  src.connect(f).connect(g).connect(dest ?? e.master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

/** Simple feedback-delay "reverb" bus; disconnected after `life` seconds. */
function echoBus(e: Engine, life = 2.5): AudioNode {
  const { ctx, master } = e;
  const input = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.11;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 2600;
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  input.connect(master); // dry
  input.connect(delay);
  delay.connect(damp).connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
  window.setTimeout(() => {
    [input, delay, feedback, damp, wet].forEach((n) => n.disconnect());
  }, life * 1000);
  return input;
}

function play(fn: (e: Engine) => void): void {
  const e = getEngine();
  if (!e) return;
  try {
    fn(e);
  } catch {
    /* audio is decorative — never throw into game code */
  }
}

export const sfx = {
  /** UI tick: short 880 Hz sine, 60 ms. */
  blip(): void {
    play((e) => tone(e, { freq: 880, dur: 0.06, type: 'sine', gain: 0.35 }));
  },
  /** Clue revealed: two-note rising triangle chime. */
  reveal(): void {
    play((e) => {
      tone(e, { freq: 659.25, dur: 0.22, type: 'triangle', gain: 0.5 });
      tone(e, { freq: 987.77, dur: 0.38, type: 'triangle', gain: 0.5, at: 0.11 });
    });
  },
  /** Objection hit: low saw thump plus a 250 ms noise burst. */
  contradiction(): void {
    play((e) => {
      tone(e, { freq: 110, freqEnd: 55, dur: 0.35, type: 'sawtooth', gain: 0.7 });
      tone(e, { freq: 165, freqEnd: 80, dur: 0.25, type: 'square', gain: 0.25 });
      noise(e, { dur: 0.25, gain: 0.6, filter: 'bandpass', freq: 2400, freqEnd: 500, q: 0.7 });
    });
  },
  /** Wrong answer: descending buzzy two-step. */
  wrong(): void {
    play((e) => {
      tone(e, { freq: 220, freqEnd: 180, dur: 0.16, type: 'sawtooth', gain: 0.35 });
      tone(e, { freq: 165, freqEnd: 110, dur: 0.28, type: 'sawtooth', gain: 0.35, at: 0.15 });
    });
  },
  /** Solved: C-major arpeggio through a feedback-delay "room". */
  success(): void {
    play((e) => {
      const bus = echoBus(e);
      [523.25, 659.25, 783.99].forEach((f, i) =>
        tone(e, { freq: f, dur: 0.5, type: 'triangle', gain: 0.45, at: i * 0.1, dest: bus }),
      );
      tone(e, { freq: 1046.5, dur: 0.7, type: 'sine', gain: 0.25, at: 0.3, dest: bus });
    });
  },
  /** Rubber stamp: low-passed noise thud with a short body tone. */
  stamp(): void {
    play((e) => {
      noise(e, { dur: 0.18, gain: 0.9, filter: 'lowpass', freq: 900, freqEnd: 120, q: 1.2 });
      tone(e, { freq: 120, freqEnd: 60, dur: 0.16, type: 'sine', gain: 0.6 });
    });
  },
  /** Accusation drumroll: ~1.2 s of accelerating, swelling snare-ish noise taps, then an accent. */
  drumroll(): void {
    play((e) => {
      let t = 0;
      let gap = 0.09;
      while (t < 1.2) {
        const p = t / 1.2;
        noise(e, { dur: 0.05, gain: 0.15 + 0.35 * p, filter: 'bandpass', freq: 1800 + 600 * p, q: 0.9, at: t });
        t += gap;
        gap = Math.max(0.025, gap * 0.93);
      }
      noise(e, { dur: 0.3, gain: 0.7, filter: 'lowpass', freq: 1400, freqEnd: 200, at: 1.22 });
      tone(e, { freq: 98, freqEnd: 55, dur: 0.3, type: 'sine', gain: 0.6, at: 1.22 });
    });
  },
  /** Mute/unmute all effects (fades the master bus). */
  setMuted(m: boolean): void {
    muted = m;
    if (engine) {
      const { ctx, master } = engine;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(m ? 0 : MASTER_GAIN, ctx.currentTime, 0.02);
    }
  },
  isMuted(): boolean {
    return muted;
  },
};

export type Sfx = typeof sfx;

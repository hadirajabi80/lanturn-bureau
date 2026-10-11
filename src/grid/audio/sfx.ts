/**
 * Floorplan Mysteries desk sounds — all synthesized, a handful of nodes each (<2 ms setup).
 * Silent until the first user gesture, and whenever `sfx2.setMuted(true)`.
 */
import { getAudio, hasGesture, hasWindow, noiseBuffer, type Audio } from './context';
import { fm, noise, pan, rand, tone } from './synth';

const SFX_LEVEL = 0.32;
let muted = false;

function play(fn: (a: Audio, t: number, dry: AudioNode, room: AudioNode) => void): void {
  if (muted || !hasWindow() || !hasGesture()) return;
  const a = getAudio();
  if (!a || a.ctx.state === 'closed') return;
  try {
    fn(a, a.ctx.currentTime + 0.005, a.sfxBus, a.sfxRoom);
  } catch {
    /* audio is decorative — never throw into game code */
  }
}

/** Send a voice to both the dry bus and the room. */
function both(a: Audio, dry: AudioNode, room: AudioNode, wet = 1): AudioNode {
  const g = a.ctx.createGain();
  g.connect(dry);
  if (wet > 0) {
    const w = a.ctx.createGain();
    w.gain.value = wet;
    g.connect(w).connect(room);
    setTimeout(() => w.disconnect(), 4000);
  }
  setTimeout(() => g.disconnect(), 4000);
  return g;
}

export const sfx2 = {
  /** Soft brass tick — a pin pressed into the plan. */
  pin(): void {
    play(({ ctx }, t, dry) => {
      tone(ctx, dry, { t, freq: 2350, dur: 0.09, gain: 0.22 });
      tone(ctx, dry, { t, freq: 2350 * 2.76, dur: 0.05, gain: 0.07 });
      noise(ctx, dry, { t, dur: 0.012, filter: 'highpass', freq: 5000, gain: 0.18 });
      tone(ctx, dry, { t: t + 0.006, freq: 180, freqEnd: 120, dur: 0.05, gain: 0.18 });
    });
  },
  /** Red grease-pencil cross — two waxy strokes. */
  cross(): void {
    play(({ ctx }, t, dry) => {
      for (const [dt, f] of [[0, 1300], [0.12, 1100]] as const) {
        noise(ctx, dry, { t: t + dt, dur: 0.1, filter: 'bandpass', freq: f, freqEnd: f * 1.6, q: 1.4, gain: 0.45, attack: 0.012 });
        noise(ctx, dry, { t: t + dt, dur: 0.09, filter: 'highpass', freq: 3500, gain: 0.06, attack: 0.01 });
      }
    });
  },
  /** Light pencil scratch (notes). */
  pencil(): void {
    play(({ ctx }, t, dry) => {
      noise(ctx, dry, { t, dur: 0.07, filter: 'bandpass', freq: 3400, freqEnd: 4200, q: 1.2, gain: 0.26, attack: 0.008 });
    });
  },
  /** Rubber eraser swipe — there and back. */
  erase(): void {
    play(({ ctx }, t, dry) => {
      noise(ctx, dry, { t, dur: 0.13, filter: 'bandpass', freq: 650, freqEnd: 950, q: 0.9, gain: 0.42, attack: 0.03 });
      noise(ctx, dry, { t: t + 0.12, dur: 0.12, filter: 'bandpass', freq: 900, freqEnd: 600, q: 0.9, gain: 0.34, attack: 0.03 });
    });
  },
  /** Heavy CLOSED stamp. */
  stamp(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.5);
      noise(ctx, d, { t, dur: 0.2, filter: 'lowpass', freq: 1000, freqEnd: 110, q: 1.1, gain: 0.95 });
      tone(ctx, d, { t, freq: 115, freqEnd: 45, dur: 0.22, gain: 0.8 });
      noise(ctx, d, { t, dur: 0.03, filter: 'highpass', freq: 2500, gain: 0.35 });
    });
  },
  /** Brass lever: ratchet clicks, then a clunk. */
  lever(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      let at = t;
      let gap = 0.042;
      for (let i = 0; i < 6; i++) {
        noise(ctx, dry, { t: at, dur: 0.012, filter: 'bandpass', freq: 3100 + i * 120, q: 5, gain: 0.3 });
        tone(ctx, dry, { t: at, freq: 1500, dur: 0.015, gain: 0.04 });
        at += gap;
        gap *= 0.9;
      }
      const d = both(a, dry, room, 0.4);
      noise(ctx, d, { t: at + 0.03, dur: 0.14, filter: 'lowpass', freq: 700, freqEnd: 120, gain: 0.7 });
      tone(ctx, d, { t: at + 0.03, freq: 150, freqEnd: 70, dur: 0.16, gain: 0.5 });
      tone(ctx, d, { t: at + 0.03, freq: 620, dur: 0.25, gain: 0.05 });
    });
  },
  /** Big theatre lamp switched on: heavy switch, mains hum blooming, filament tink. */
  spotlight(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.6);
      noise(ctx, d, { t, dur: 0.05, filter: 'bandpass', freq: 2200, q: 2, gain: 0.5 });
      noise(ctx, d, { t: t + 0.02, dur: 0.12, filter: 'lowpass', freq: 500, freqEnd: 90, gain: 0.7 });
      tone(ctx, d, { t: t + 0.02, freq: 90, freqEnd: 55, dur: 0.18, gain: 0.5 });
      // hum swell
      const hum = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      hum.connect(lp).connect(dry);
      hum.gain.setValueAtTime(0.0001, t + 0.05);
      hum.gain.exponentialRampToValueAtTime(0.08, t + 0.25);
      hum.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      for (const f of [100, 150]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.connect(hum);
        o.start(t + 0.05);
        o.stop(t + 0.95);
        o.onended = () => o.disconnect();
      }
      setTimeout(() => [hum, lp].forEach((n) => n.disconnect()), 1500);
      tone(ctx, d, { t: t + 0.09, freq: 5200, dur: 0.12, gain: 0.04 });
    });
  },
  /** Otto, the tea-drinking assistant: a short porcelain clink. */
  otto(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.35);
      const f0 = rand(2550, 2700);
      for (const [dt, v] of [[0, 1], [0.075, 0.5]] as const) {
        tone(ctx, d, { t: t + dt, freq: f0, dur: 0.28, gain: 0.16 * v });
        tone(ctx, d, { t: t + dt, freq: f0 * 2.32, dur: 0.16, gain: 0.07 * v });
        tone(ctx, d, { t: t + dt, freq: f0 * 4.25, dur: 0.08, gain: 0.04 * v });
        noise(ctx, d, { t: t + dt, dur: 0.008, filter: 'highpass', freq: 6000, gain: 0.12 * v });
      }
    });
  },
  /** Case file burned (wrong submission): whoosh + crackle, ~1.5 s. */
  burn(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.3);
      noise(ctx, d, { t, dur: 0.7, filter: 'bandpass', freq: 300, freqEnd: 2600, q: 0.9, gain: 0.45, attack: 0.25 });
      noise(ctx, d, { t: t + 0.45, dur: 1.05, filter: 'bandpass', freq: 2200, freqEnd: 600, q: 0.7, gain: 0.25, attack: 0.1 });
      noise(ctx, d, { t: t + 0.1, dur: 1.4, filter: 'lowpass', freq: 380, q: 0.5, gain: 0.3, attack: 0.3 });
      // crackle: one noise source, gain spiked at random instants (3 nodes instead of ~70)
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, 'white');
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3200;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0, t);
      const hits = Array.from({ length: 26 }, () => t + 0.15 + Math.random() * 1.3).sort((x, y) => x - y);
      let prev = t;
      for (const at of hits) {
        if (at < prev + 0.012) continue;
        const len = rand(0.003, 0.008);
        cg.gain.setValueAtTime(0, at);
        cg.gain.linearRampToValueAtTime(rand(0.12, 0.4), at + 0.001);
        cg.gain.linearRampToValueAtTime(0, at + len);
        prev = at + len;
      }
      src.connect(hp).connect(cg).connect(pan(ctx, dry, rand(-0.3, 0.3)));
      src.start(t);
      src.stop(t + 1.6);
      src.onended = () => [src, hp, cg].forEach((n) => n.disconnect());
    });
  },
  /** Clue / truth revealed: a bright two-note chime. */
  reveal(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.9);
      fm(ctx, d, { t, freq: 1318.5, dur: 0.6, ratio: 3.5, index: 0.8, indexEnd: 0.05, gain: 0.16 });
      fm(ctx, d, { t: t + 0.12, freq: 1975.5, dur: 0.9, ratio: 3.5, index: 0.8, indexEnd: 0.05, gain: 0.14 });
    });
  },
  /** Blitz final-10-seconds tick. */
  tick(): void {
    play(({ ctx }, t, dry) => {
      tone(ctx, dry, { t, freq: 1550, dur: 0.035, gain: 0.25 });
      noise(ctx, dry, { t, dur: 0.012, filter: 'bandpass', freq: 3800, q: 3, gain: 0.25 });
      tone(ctx, dry, { t, freq: 520, dur: 0.05, type: 'triangle', gain: 0.12 });
    });
  },
  /** Case closed: warm Cmaj9 bloom. */
  success(): void {
    play((a, t, dry, room) => {
      const { ctx } = a;
      const d = both(a, dry, room, 0.8);
      [130.81, 196, 329.63, 493.88, 587.33].forEach((f, i) => {
        const at = t + i * 0.045;
        tone(ctx, d, { t: at, freq: f, dur: 1.9, gain: 0.13, attack: 0.03 });
        tone(ctx, d, { t: at, freq: f, dur: 1.6, type: 'triangle', gain: 0.06, attack: 0.03, detune: 7 });
      });
    });
  },
  /** Mute/unmute every sfx2 voice (fades the bus). Ambience has its own `setEnabled`. */
  setMuted(m: boolean): void {
    muted = m;
    if (!hasWindow()) return;
    const a = hasGesture() ? getAudio() : null;
    if (a) a.sfxBus.gain.setTargetAtTime(m ? 0 : SFX_LEVEL, a.ctx.currentTime, 0.02);
  },
  isMuted(): boolean {
    return muted;
  },
};

export type Sfx2 = typeof sfx2;

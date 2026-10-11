/**
 * Procedural ambience beds — one per district (docs/FLOORPLAN-DESIGN.md §3 "Mood" column).
 * No audio files: each bed is a small graph of looping noise / oscillators plus a lookahead
 * scheduler that drops one-shot events (ticks, gulls, footsteps, bells...) onto the timeline.
 *
 * A bed is driven by `pump(until)`: every scheduler voice is advanced until `until` (context
 * time). The ambience controller calls it ~10×/s with a 0.35 s lookahead; because it is keyed on
 * `ctx.currentTime`, nothing piles up while the context is suspended (hidden tab).
 */
import type { District } from '../skins/types';
import { impulse, midi, noiseBuffer, type NoiseColor } from './context';
import { fm, noise, pan, pick, rand, tone } from './synth';

/** Kept in lock-step with the district data: adding an id there without a recipe here fails typecheck. */
export type AmbienceId = District['ambience'];
export const AMBIENCE_IDS: readonly AmbienceId[] = [
  'clock', 'waves', 'jazz', 'hush', 'rain', 'bells', 'rails', 'wind', 'musicbox', 'harp', 'calliope',
];

export interface Bed {
  id: AmbienceId;
  /** Crossfade gain (0..1) feeding the ambience bus. */
  out: GainNode;
  pump(until: number): void;
  dispose(): void;
}

interface Voice {
  next: number;
  fn: (t: number) => number;
}

/** Builder toolkit handed to each bed recipe. */
export interface Kit {
  ctx: AudioContext;
  /** Bed mix point (pre-crossfade). */
  mix: GainNode;
  /** Keep a persistent source alive for the bed's lifetime (stopped on dispose). */
  keep<T extends AudioScheduledSourceNode>(n: T): T;
  /** Looping noise → optional filter → gain → dest. Returns the gain for automation. */
  bed(color: NoiseColor, gain: number, filter?: { type: BiquadFilterType; freq: number; q?: number }, dest?: AudioNode): { gain: GainNode; filter?: BiquadFilterNode };
  /** Sine/other LFO adding `depth` around a param's current value. */
  lfo(rate: number, depth: number, param: AudioParam, type?: OscillatorType): void;
  /** A gain node routed to `dest` (default mix). */
  bus(gain: number, dest?: AudioNode): GainNode;
  /** Convolution reverb whose output goes to the mix; returns its input. */
  reverb(seconds: number, decay: number, wet: number): AudioNode;
  /** Register a scheduler voice: `fn(t)` schedules an event at context time t and returns seconds to the next. */
  every(firstIn: number, fn: (t: number) => number): void;
}

type Recipe = (k: Kit) => void;

/* ================================================================== recipes */

/** I · Ashcombe Manor — longcase clock tick-tock in a quiet panelled room. */
const clock: Recipe = (k) => {
  const { ctx } = k;
  k.bed('brown', 0.32, { type: 'lowpass', freq: 170 });
  const air = k.bed('pink', 0.03, { type: 'bandpass', freq: 900, q: 0.5 });
  k.lfo(0.07, 0.012, air.gain.gain);
  k.bed('pink', 0.012, { type: 'highpass', freq: 5000 }); // faint candle/fire hiss
  const room = k.reverb(1.1, 4, 0.35);
  const voice = k.bus(1);
  voice.connect(room);
  let tick = true;
  k.every(0.4, (t) => {
    const f = tick ? 1 : 0.8;
    const at = t + rand(-0.004, 0.004);
    noise(ctx, voice, { t: at, dur: 0.022, filter: 'bandpass', freq: 3300 * f, q: 3, gain: 0.32 });
    tone(ctx, voice, { t: at, freq: 1900 * f, dur: 0.045, gain: 0.06 });
    tone(ctx, voice, { t: at, freq: 640 * f, dur: 0.09, type: 'triangle', gain: 0.1 });
    tick = !tick;
    return 1;
  });
};

/** Distant FM "kee-ow" gull calls through a lowpass, sent dry + to `room`. */
function gulls(k: Kit, room: AudioNode, level: number, first: [number, number], gap: [number, number]): void {
  const { ctx } = k;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3600;
  lp.connect(k.mix);
  lp.connect(room);
  const bus = k.bus(level, lp);
  k.every(rand(first[0], first[1]), (t) => {
    const calls = pick([1, 2, 2, 3]);
    const dest = pan(ctx, bus, rand(-0.8, 0.8));
    const base = rand(1150, 1450);
    for (let i = 0; i < calls; i++) {
      const at = t + i * rand(0.42, 0.55);
      fm(ctx, dest, {
        t: at, freq: base, dur: 0.42, ratio: 0.5, index: 1.4, indexEnd: 0.4, gain: 0.07, attack: 0.03,
        path: [[0.09, base * 1.55], [0.4, base * 0.82]],
      });
    }
    return rand(gap[0], gap[1]);
  });
}

/** II · Harrow Point Docks — swells on the pilings and the odd gull. */
const waves: Recipe = (k) => {
  const { ctx } = k;
  k.bed('brown', 0.32, { type: 'lowpass', freq: 380 });
  const sea = k.reverb(2.2, 3, 0.3);
  for (const side of [-0.45, 0.45]) {
    const dest = pan(ctx, k.mix, side);
    const layer = k.bed('pink', 0.0001, { type: 'lowpass', freq: 400, q: 0.4 }, dest);
    const g = layer.gain.gain;
    const f = layer.filter!.frequency;
    k.every(side < 0 ? 0.2 : rand(3, 5), (t) => {
      const period = rand(7, 11.5);
      const rise = rand(2, 3.2);
      const peak = rand(0.42, 0.7);
      g.setValueAtTime(0.03, t);
      g.linearRampToValueAtTime(peak, t + rise);
      g.exponentialRampToValueAtTime(0.03, t + period - 0.05);
      f.setValueAtTime(320, t);
      f.exponentialRampToValueAtTime(rand(1300, 1900), t + rise);
      f.exponentialRampToValueAtTime(380, t + period - 0.05);
      // foam fizz as the wave breaks
      noise(ctx, dest, { t: t + rise * 0.85, dur: rand(1.8, 2.8), filter: 'highpass', freq: 2600, gain: 0.05, attack: 0.25 });
      return period;
    });
  }
  gulls(k, sea, 0.5, [6, 14], [14, 38]);
};

/** III · The Gilded Meridian — late-night trio: walking bass, brushes, Rhodes on ii–V–I. */
const jazz: Recipe = (k) => {
  const { ctx } = k;
  const bpm = 84;
  const beat = 60 / bpm;
  const swing = beat * (2 / 3);
  k.bed('pink', 0.008, { type: 'bandpass', freq: 3000, q: 0.4 }); // room / vinyl air
  const room = k.reverb(1.6, 3.5, 0.28);
  // bass
  const bassBus = k.bus(0.9);
  // rhodes: bus → lowpass → tremolo → mix/room
  const rhodesIn = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  const trem = ctx.createGain();
  trem.gain.value = 0.85;
  k.lfo(4.6, 0.15, trem.gain);
  rhodesIn.connect(lp).connect(trem);
  trem.connect(k.mix);
  trem.connect(room);
  // brushes
  const kitBus = k.bus(0.9);
  kitBus.connect(room);

  const bass = [
    [50, 48, 45, 44], // Dm7  : D C A Ab
    [43, 47, 50, 49], // G7   : G B D Db
    [48, 47, 45, 43], // Cmaj7: C B A G
    [45, 49, 52, 51], // A7   : A C# E Eb
  ];
  const chords = [
    [53, 57, 60, 64], // Dm9
    [53, 57, 59, 64], // G13
    [52, 55, 59, 62], // Cmaj9
    [55, 59, 61, 66], // A13
  ];
  const rhodes = (t: number, notes: number[], vel: number, len: number) => {
    notes.forEach((n, i) => {
      const f = midi(n);
      fm(ctx, rhodesIn, { t: t + i * 0.008, freq: f, dur: len, ratio: 1, index: 1.2, indexEnd: 0.08, gain: 0.05 * vel, attack: 0.006 });
      tone(ctx, rhodesIn, { t: t + i * 0.008, freq: f * 4, dur: 0.25, gain: 0.006 * vel }); // tine
    });
  };
  let step = 0; // beats since start
  k.every(0.3, (t) => {
    const bar = Math.floor(step / 4) % 4;
    const b = step % 4;
    // walking bass
    const f = midi(bass[bar][b]);
    tone(ctx, bassBus, { t, freq: f, dur: beat * 0.95, type: 'triangle', gain: 0.24, attack: 0.012 });
    tone(ctx, bassBus, { t, freq: f, dur: beat * 0.95, type: 'sine', gain: 0.22, attack: 0.012 });
    // brushes: swish on every swung eighth, slap on 2 & 4
    noise(ctx, kitBus, { t, dur: 0.2, filter: 'bandpass', freq: rand(2600, 3800), q: 0.7, gain: 0.018, attack: 0.06 });
    noise(ctx, kitBus, { t: t + swing, dur: 0.14, filter: 'bandpass', freq: rand(2800, 4000), q: 0.7, gain: 0.014, attack: 0.04 });
    if (b === 1 || b === 3) {
      noise(ctx, kitBus, { t, dur: 0.13, filter: 'bandpass', freq: 1900, q: 0.6, gain: 0.07 });
      noise(ctx, kitBus, { t, dur: 0.04, filter: 'highpass', freq: 7000, gain: 0.025 });
    }
    // comping
    if (b === 0) {
      if (Math.random() < 0.6) rhodes(t, chords[bar], 1, beat * 1.6);
      else rhodes(t + swing, chords[bar], 0.9, beat * 1.3);
    } else if (b === 2 && Math.random() < 0.45) {
      rhodes(t + swing, chords[bar], 0.6, beat * 0.9);
    }
    step++;
    return beat;
  });
};

/** IV · Museum of Curiosities — vast hushed gallery, distant footsteps on marble. */
const hush: Recipe = (k) => {
  const { ctx } = k;
  k.bed('brown', 0.36, { type: 'lowpass', freq: 140 });
  const air = k.bed('pink', 0.045, { type: 'bandpass', freq: 460, q: 0.7 });
  k.lfo(0.05, 0.018, air.gain.gain);
  const hum = k.keep(ctx.createOscillator());
  hum.frequency.value = 118;
  const hg = k.bus(0.004);
  hum.connect(hg);
  hum.start();
  const hall = k.reverb(3.4, 2.4, 0.75);
  const steps = ctx.createGain();
  steps.gain.value = 0.9;
  steps.connect(k.mix);
  steps.connect(hall);
  k.every(rand(3, 7), (t) => {
    const n = Math.floor(rand(4, 10));
    const gap = rand(0.52, 0.64);
    const p0 = rand(-0.9, 0.9);
    const p1 = Math.max(-0.9, Math.min(0.9, p0 + rand(-1, 1)));
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const near = 0.35 + 0.65 * Math.sin(Math.PI * u);
      const dest = pan(ctx, steps, p0 + (p1 - p0) * u);
      const at = t + i * gap + rand(-0.02, 0.02);
      noise(ctx, dest, { t: at, dur: 0.03, filter: 'bandpass', freq: 2300, q: 2, gain: 0.28 * near });
      noise(ctx, dest, { t: at + 0.012, dur: 0.09, filter: 'lowpass', freq: 280, freqEnd: 110, q: 0.7, gain: 0.5 * near });
      tone(ctx, dest, { t: at + 0.01, freq: 88, dur: 0.07, gain: 0.12 * near });
    }
    return n * gap + rand(9, 20);
  });
};

/** V · The Neon Quarter — rain on asphalt and awnings, droplets, rare thunder. */
const rain: Recipe = (k) => {
  const { ctx } = k;
  const body = k.bed('pink', 0.42, { type: 'lowpass', freq: 750 });
  const hiss = k.bed('white', 0.05, { type: 'bandpass', freq: 2600, q: 0.6 });
  k.bed('white', 0.014, { type: 'highpass', freq: 6800 });
  k.lfo(0.09, 0.1, body.gain.gain);
  k.lfo(0.13, 0.018, hiss.gain.gain);
  const street = k.reverb(1.8, 3, 0.3);
  const drops = k.bus(0.8);
  drops.connect(street);
  k.every(0.05, (t) => {
    const dest = pan(ctx, drops, rand(-0.9, 0.9));
    if (Math.random() < 0.78) {
      noise(ctx, dest, { t, dur: 0.012, filter: 'highpass', freq: 4200, gain: rand(0.05, 0.14) });
    } else {
      const f = rand(1800, 3800);
      tone(ctx, dest, { t, freq: f, freqEnd: f * 0.6, dur: 0.035, gain: rand(0.015, 0.035) });
    }
    return rand(0.035, 0.22);
  });
  // gutter drip
  k.every(rand(1, 3), (t) => {
    tone(ctx, drops, { t, freq: rand(650, 800), freqEnd: rand(1150, 1400), dur: 0.06, gain: 0.035, glide: 0.04 });
    return rand(1.8, 5.5);
  });
  // thunder
  k.every(rand(20, 40), (t) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 'brown');
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(70, t + 6);
    const g = ctx.createGain();
    const len = rand(5.5, 8);
    const peak = rand(0.5, 0.85);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + rand(0.4, 1.1));
    g.gain.exponentialRampToValueAtTime(peak * 0.45, t + 1.6);
    g.gain.exponentialRampToValueAtTime(peak * 0.7, t + 2.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(lp).connect(g).connect(k.mix);
    g.connect(street);
    src.start(t, rand(0, 3));
    src.stop(t + len + 0.1);
    src.onended = () => [src, lp, g].forEach((n) => n.disconnect());
    for (let i = 0; i < 4; i++) {
      noise(ctx, k.mix, { t: t + rand(0.2, 2), dur: rand(0.3, 0.7), color: 'brown', filter: 'lowpass', freq: 420, gain: rand(0.15, 0.3), attack: 0.05 });
    }
    return rand(55, 120);
  });
};

/** VI · Hollowmere Academy — wind over the quad, a distant chapel bell every ~20 s. */
const bells: Recipe = (k) => {
  const { ctx } = k;
  const gust = k.bed('pink', 0.16, { type: 'bandpass', freq: 520, q: 1.2 });
  k.lfo(0.06, 240, gust.filter!.frequency);
  k.lfo(0.041, 0.07, gust.gain.gain);
  k.bed('brown', 0.24, { type: 'lowpass', freq: 240 });
  const chapel = k.reverb(4.2, 2.2, 0.8);
  const bellIn = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2100;
  bellIn.gain.value = 0.45;
  bellIn.connect(lp);
  lp.connect(k.mix);
  lp.connect(chapel);
  const partials: [number, number, number][] = [
    [0.5, 0.5, 9], [1, 0.42, 6.5], [1.003, 0.12, 6.5], [1.2, 0.28, 4.5], [1.5, 0.18, 3.5],
    [2, 0.3, 3.4], [2.5, 0.11, 2.2], [3, 0.09, 1.8], [4.2, 0.05, 1.2], [5.4, 0.035, 0.9],
  ];
  k.every(rand(4, 9), (t) => {
    const f0 = pick([174.6, 196, 220]);
    const tolls = Math.random() < 0.7 ? 1 : 3;
    for (let n = 0; n < tolls; n++) {
      const at = t + n * 2.6;
      for (const [r, a, d] of partials) tone(ctx, bellIn, { t: at, freq: f0 * 2 * r, dur: d, gain: a * 0.4, attack: 0.003 });
      noise(ctx, bellIn, { t: at, dur: 0.05, filter: 'bandpass', freq: 2200, q: 1.5, gain: 0.08 });
    }
    return rand(17, 23) + (tolls - 1) * 2.6;
  });
};

/** VII · The Midnight Express — rail joints, bogie rumble, a far-off horn. */
const rails: Recipe = (k) => {
  const { ctx } = k;
  const rumble = k.bed('brown', 0.42, { type: 'lowpass', freq: 160 });
  k.lfo(0.27, 0.09, rumble.gain.gain);
  k.bed('pink', 0.028, { type: 'bandpass', freq: 1200, q: 0.4 });
  const sub = k.keep(ctx.createOscillator());
  sub.frequency.value = 42;
  k.lfo(0.31, 2.5, sub.frequency);
  const sg = k.bus(0.05);
  sub.connect(sg);
  sub.start();
  const cab = k.reverb(0.7, 4, 0.2);
  const clacks = k.bus(1);
  clacks.connect(cab);
  const pattern: [number, number][] = [[0, 1], [0.14, 0.8], [0.58, 0.9], [0.72, 0.72]];
  k.every(0.3, (t) => {
    const period = 1.16;
    for (const [dt, a] of pattern) {
      const at = t + dt + rand(-0.006, 0.006);
      noise(ctx, clacks, { t: at, dur: 0.085, filter: 'lowpass', freq: 340, freqEnd: 90, q: 0.8, gain: 0.75 * a });
      noise(ctx, clacks, { t: at, dur: 0.03, filter: 'bandpass', freq: 1700, q: 5, gain: 0.32 * a });
      tone(ctx, clacks, { t: at, freq: 212, freqEnd: 190, dur: 0.06, gain: 0.035 * a });
    }
    return period;
  });
  const night = k.reverb(3, 2.5, 0.7);
  k.every(rand(35, 70), (t) => {
    const hg = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;
    hg.connect(lp);
    lp.connect(night);
    for (const f of [466.2, 554.4]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.012, t + 0.5);
      g.gain.setValueAtTime(0.012, t + 1.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g).connect(hg);
      o.start(t);
      o.stop(t + 2.7);
      o.onended = () => [o, g].forEach((n) => n.disconnect());
    }
    setTimeout(() => [hg, lp].forEach((n) => n.disconnect()), 15000);
    return rand(70, 140);
  });
};

/** VIII · Frostmere Observatory — howling band-passed wind with slow LFOs and gusts. */
const wind: Recipe = (k) => {
  k.bed('brown', 0.28, { type: 'lowpass', freq: 210 });
  const h1 = k.bed('pink', 0.55, { type: 'bandpass', freq: 380, q: 7 });
  const h2 = k.bed('pink', 0.45, { type: 'bandpass', freq: 640, q: 8 });
  k.lfo(0.05, 150, h1.filter!.frequency);
  k.lfo(0.083, 230, h2.filter!.frequency);
  k.lfo(0.031, 0.22, h1.gain.gain);
  k.lfo(0.047, 0.18, h2.gain.gain);
  const gust = k.bed('pink', 0.0001, { type: 'bandpass', freq: 500, q: 4 });
  const gg = gust.gain.gain;
  const gf = gust.filter!.frequency;
  k.every(rand(3, 8), (t) => {
    const len = rand(3, 5.5);
    const peak = rand(0.25, 0.42);
    gg.setValueAtTime(0.0001, t);
    gg.exponentialRampToValueAtTime(peak, t + len * 0.4);
    gg.exponentialRampToValueAtTime(0.0001, t + len);
    gf.setValueAtTime(rand(420, 560), t);
    gf.exponentialRampToValueAtTime(rand(950, 1250), t + len * 0.45);
    gf.exponentialRampToValueAtTime(rand(520, 640), t + len);
    return len + rand(4, 13);
  });
};

/* ------------------------------------------------------------------ bright districts */

/** A note that holds (linear attack, flat sustain, exponential release) — pads and pipes. */
function held(
  ctx: AudioContext,
  dest: AudioNode,
  o: { t: number; freq: number; len: number; gain: number; type?: OscillatorType; attack?: number; release?: number; detune?: number; vibrato?: number },
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.value = o.freq;
  if (o.detune) osc.detune.value = o.detune;
  const a = o.attack ?? 0.03;
  const r = o.release ?? 0.1;
  const end = o.t + Math.max(o.len, a + 0.01);
  g.gain.setValueAtTime(0, o.t);
  g.gain.linearRampToValueAtTime(o.gain, o.t + a);
  g.gain.setValueAtTime(o.gain, end);
  g.gain.exponentialRampToValueAtTime(0.0001, end + r);
  osc.connect(g).connect(dest);
  let vib: OscillatorNode | null = null;
  let vg: GainNode | null = null;
  if (o.vibrato) {
    vib = ctx.createOscillator();
    vib.frequency.value = o.vibrato;
    vg = ctx.createGain();
    vg.gain.value = o.freq * 0.006;
    vib.connect(vg).connect(osc.frequency);
    vib.start(o.t);
    vib.stop(end + r + 0.05);
  }
  osc.start(o.t);
  osc.stop(end + r + 0.05);
  osc.onended = () => [osc, g, vib, vg].forEach((n) => n?.disconnect());
}

/** Comb-tine pluck: bright, fast-fading inharmonic overtones over a ringing fundamental. */
function tine(ctx: AudioContext, dest: AudioNode, t: number, note: number, gain: number): void {
  const f = midi(note);
  tone(ctx, dest, { t, freq: f, dur: 1.6, gain, attack: 0.002 });
  tone(ctx, dest, { t, freq: f * 3.01, dur: 0.35, gain: gain * 0.28, attack: 0.002 });
  tone(ctx, dest, { t, freq: f * 5.43, dur: 0.12, gain: gain * 0.12, attack: 0.001 });
}

/** Little songbird phrase: 3–6 rising FM chirps, or a quick trill. */
function birdsong(ctx: AudioContext, dest: AudioNode, t: number, level: number): void {
  const d = pan(ctx, dest, rand(-0.9, 0.9));
  const base = rand(2800, 3800);
  if (Math.random() < 0.35) {
    for (let i = 0; i < 8; i++) {
      tone(ctx, d, { t: t + i * 0.055, freq: base * (i % 2 ? 1.18 : 1), dur: 0.045, gain: level * 0.8, attack: 0.004 });
    }
    return;
  }
  const n = Math.floor(rand(3, 7));
  let at = t;
  for (let i = 0; i < n; i++) {
    const f = base * rand(0.9, 1.15);
    fm(ctx, d, { t: at, freq: f, dur: rand(0.05, 0.09), ratio: 0.12, index: 0.25, gain: level, attack: 0.004, path: [[0.05, f * rand(1.25, 1.5)]] });
    at += rand(0.09, 0.17);
  }
}

/** IX · Rosewater Patisserie — music box in C major, teacup clinks, birds at the window. */
const musicbox: Recipe = (k) => {
  const { ctx } = k;
  k.bed('pink', 0.05, { type: 'lowpass', freq: 600 }); // warm shop air
  k.bed('brown', 0.12, { type: 'lowpass', freq: 160 });
  const room = k.reverb(1.6, 3, 0.4);
  const box = k.bus(0.9);
  box.connect(room);
  // [note (0 = rest), length in eighths] — 16 bars of 3/4, 6 eighths per bar
  const melody: [number, number][] = [
    [76, 2], [79, 2], [84, 2], [83, 3], [81, 1], [79, 2], [77, 2], [81, 2], [86, 2], [84, 4], [0, 2],
    [76, 2], [74, 1], [76, 1], [79, 2], [81, 2], [79, 2], [76, 2], [74, 2], [77, 2], [71, 2], [72, 6],
    [79, 2], [76, 2], [72, 2], [74, 2], [77, 2], [81, 2], [79, 3], [77, 1], [76, 2], [74, 6],
    [76, 2], [79, 2], [84, 2], [83, 2], [86, 2], [83, 2], [81, 2], [77, 2], [74, 2], [72, 4], [0, 2],
  ];
  const C = [48, 64, 67], G = [43, 62, 65], F = [41, 57, 60], Am = [45, 60, 64], Dm = [38, 57, 62];
  const chords = [C, G, F, C, C, Am, G, C, C, Dm, C, G, C, G, F, C];
  const notesAt = new Map<number, number>();
  let pos = 0;
  for (const [n, len] of melody) {
    if (n) notesAt.set(pos, n);
    pos += len;
  }
  const LOOP = 96;
  const eighth = 60 / 92 / 2;
  let step = 0;
  k.every(0.3, (t) => {
    const i = step % LOOP;
    const bar = Math.floor(i / 6);
    const j = (x: number) => x + rand(-0.006, 0.006); // hand-cranked wobble
    const n = notesAt.get(i);
    if (n) tine(ctx, box, j(t), n, 0.11);
    if (i % 2 === 0) tine(ctx, box, j(t), chords[bar][(i % 6) / 2], i % 6 === 0 ? 0.075 : 0.05);
    step++;
    // the spring slowly winds down over a loop, then a short pause while it is re-wound
    return i === LOOP - 1 ? eighth * 6 : eighth * (1 + 0.04 * (i / LOOP));
  });
  // teacup clinks
  k.every(rand(5, 12), (t) => {
    const f0 = rand(2500, 2800);
    const d = pan(ctx, room, rand(-0.7, 0.7));
    for (const [dt, v] of [[0, 1], [0.08, 0.5]] as const) {
      tone(ctx, d, { t: t + dt, freq: f0, dur: 0.25, gain: 0.035 * v });
      tone(ctx, d, { t: t + dt, freq: f0 * 2.32, dur: 0.14, gain: 0.015 * v });
    }
    return rand(9, 22);
  });
  k.every(rand(3, 8), (t) => {
    birdsong(ctx, k.mix, t, 0.02);
    return rand(6, 15);
  });
};

/** X · Lavender & Lace Boutique — slow harp arpeggios and celesta over a warm pad, wind chimes. */
const harp: Recipe = (k) => {
  const { ctx } = k;
  k.bed('pink', 0.03, { type: 'lowpass', freq: 500 });
  const hall = k.reverb(2.6, 2.6, 0.55);
  const padIn = ctx.createGain();
  const padLp = ctx.createBiquadFilter();
  padLp.type = 'lowpass';
  padLp.frequency.value = 900;
  padIn.connect(padLp);
  padLp.connect(k.mix);
  padLp.connect(hall);
  const strings = k.bus(0.9);
  strings.connect(hall);
  const beat = 60 / 66;
  const chords = [
    { pad: [51, 58, 62, 67], arp: [63, 67, 70, 74, 75, 79] }, // Ebmaj9
    { pad: [48, 55, 63, 70], arp: [60, 63, 67, 70, 74, 75] }, // Cm9
    { pad: [44, 56, 60, 67], arp: [56, 60, 63, 67, 72, 75] }, // Abmaj7
    { pad: [46, 58, 62, 65], arp: [58, 62, 65, 67, 70, 74] }, // Bb6
  ];
  const shape = [0, 1, 2, 3, 4, 5, 4, 2];
  let bar = 0;
  k.every(0.3, (t) => {
    const c = chords[bar % 4];
    const len = beat * 4;
    for (const n of c.pad) {
      for (const det of [-7, 7]) {
        held(ctx, padIn, { t, freq: midi(n), len, gain: 0.03, type: 'triangle', attack: 1.4, release: 1.6, detune: det });
      }
    }
    shape.forEach((ix, s) => {
      const f = midi(c.arp[ix]);
      const at = t + s * (beat / 2) + rand(0, 0.015);
      tone(ctx, strings, { t: at, freq: f, dur: 1.8, gain: 0.07, attack: 0.004 });
      tone(ctx, strings, { t: at, freq: f * 2, dur: 0.5, gain: 0.02, attack: 0.003 });
      tone(ctx, strings, { t: at, freq: f * 3, dur: 0.2, gain: 0.008, attack: 0.002 });
    });
    if (Math.random() < 0.55) {
      // celesta: a couple of high notes from the chord
      const top = c.arp.slice(2).map((n) => n + 12);
      for (const [dt, n] of [[beat, pick(top)], [beat * 2.5, pick(top)]] as const) {
        const f = midi(n);
        tone(ctx, strings, { t: t + dt, freq: f, dur: 1.1, gain: 0.04, attack: 0.002 });
        tone(ctx, strings, { t: t + dt, freq: f * 4, dur: 0.3, gain: 0.008, attack: 0.001 });
      }
    }
    bar++;
    return len;
  });
  // wind chimes (Eb major pentatonic, high)
  const penta = [87, 89, 91, 94, 96, 99, 101];
  k.every(rand(6, 12), (t) => {
    const n = Math.floor(rand(5, 10));
    for (let i = 0; i < n; i++) {
      const f = midi(pick(penta));
      const at = t + rand(0, 2.2);
      const d = pan(ctx, hall, rand(-0.8, 0.8));
      tone(ctx, d, { t: at, freq: f, dur: 2.2, gain: 0.02, attack: 0.002 });
      tone(ctx, d, { t: at, freq: f * 2.76, dur: 0.6, gain: 0.006, attack: 0.001 });
    }
    return rand(12, 26);
  });
};

/** XI · Cotton Candy Pier — a slightly detuned carousel waltz down the boardwalk, crowd, gulls. */
const calliope: Recipe = (k) => {
  const { ctx } = k;
  k.bed('brown', 0.18, { type: 'lowpass', freq: 300 }); // sea under the boards
  // crowd murmur: band-limited noise with wandering vowel-ish formants
  const m1 = k.bed('pink', 0.09, { type: 'bandpass', freq: 520, q: 1.6 });
  const m2 = k.bed('pink', 0.05, { type: 'bandpass', freq: 1250, q: 2.2 });
  k.lfo(0.37, 160, m1.filter!.frequency);
  k.lfo(0.53, 300, m2.filter!.frequency);
  k.lfo(0.11, 0.04, m1.gain.gain);
  k.lfo(0.17, 0.025, m2.gain.gain);
  const air = k.reverb(2, 2.8, 0.45);
  gulls(k, air, 0.35, [8, 16], [16, 40]);
  // the band organ, at a distance: lowpass + reverb
  const organ = ctx.createGain();
  organ.gain.value = 0.8;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2400;
  organ.connect(lp);
  lp.connect(k.mix);
  lp.connect(air);
  const beat = 60 / 150;
  // G major waltz, 16 bars of [beat offset, midi, beats]
  const tune: [number, number, number][][] = [
    [[0, 74, 1], [1, 79, 2]], [[0, 83, 1], [1, 81, 1], [2, 79, 1]], [[0, 78, 2], [2, 81, 1]], [[0, 74, 3]],
    [[0, 76, 1], [1, 81, 2]], [[0, 84, 1], [1, 83, 1], [2, 81, 1]], [[0, 79, 2], [2, 83, 1]], [[0, 74, 3]],
    [[0, 74, 1], [1, 79, 2]], [[0, 83, 1], [1, 86, 1], [2, 83, 1]], [[0, 84, 2], [2, 81, 1]], [[0, 78, 3]],
    [[0, 76, 1], [1, 79, 1], [2, 83, 1]], [[0, 81, 2], [2, 78, 1]], [[0, 81, 1], [1, 79, 1], [2, 78, 1]], [[0, 79, 3]],
  ];
  const G = { b: 43, c: [62, 67, 71] }, D = { b: 38, c: [62, 66, 69] }, Am = { b: 45, c: [60, 64, 69] };
  const Cc = { b: 48, c: [60, 64, 67] }, Em = { b: 40, c: [59, 64, 67] };
  const harmony = [G, G, D, D, Am, Am, G, D, G, G, Cc, D, Em, D, D, G];
  const pipe = (t: number, n: number, beats: number, gain: number) => {
    const f = midi(n);
    const len = beats * beat * 0.88;
    held(ctx, organ, { t, freq: f, len, gain, type: 'triangle', attack: 0.025, release: 0.09, detune: rand(6, 16), vibrato: 5.6 });
    held(ctx, organ, { t, freq: f, len, gain: gain * 0.35, type: 'square', attack: 0.03, release: 0.08, detune: -rand(6, 14) });
  };
  let step = 0;
  k.every(0.3, (t) => {
    const bar = Math.floor(step / 3) % 16;
    const b = step % 3;
    const h = harmony[bar];
    if (b === 0) {
      for (const [off, n, beats] of tune[bar]) pipe(t + off * beat, n, beats, 0.05);
      held(ctx, organ, { t, freq: midi(h.b), len: beat * 0.7, gain: 0.07, type: 'triangle', attack: 0.015, release: 0.08 });
      held(ctx, organ, { t, freq: midi(h.b) * 2, len: beat * 0.6, gain: 0.02, type: 'square', attack: 0.015, release: 0.06, detune: 9 });
    } else {
      for (const n of h.c) {
        held(ctx, organ, { t, freq: midi(n), len: beat * 0.42, gain: 0.014, type: 'square', attack: 0.012, release: 0.06, detune: rand(-12, 12) });
      }
    }
    step++;
    return beat;
  });
};

const RECIPES: Record<AmbienceId, Recipe> = { clock, waves, jazz, hush, rain, bells, rails, wind, musicbox, harp, calliope };

/** Per-bed trim so all eight sit at a similar perceived level (jazz deliberately quieter). */
const TRIM: Record<AmbienceId, number> = {
  clock: 1, waves: 0.9, jazz: 0.7, hush: 1.1, rain: 0.85, bells: 1, rails: 0.85, wind: 1,
  musicbox: 1.1, harp: 0.85, calliope: 0.8,
};

export const isAmbienceId = (id: unknown): id is AmbienceId =>
  typeof id === 'string' && (AMBIENCE_IDS as readonly string[]).includes(id);

/* ================================================================== construction */

export function createBed(ctx: AudioContext, dest: AudioNode, id: AmbienceId): Bed {
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(dest);
  const mix = ctx.createGain();
  mix.gain.value = TRIM[id];
  mix.connect(out);

  const kept: AudioScheduledSourceNode[] = [];
  const nodes: AudioNode[] = [mix, out];
  const voices: Voice[] = [];
  let disposed = false;
  let stagger = 0;
  const later = (fn: () => void) => {
    const delay = 60 + 140 * stagger++;
    const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    setTimeout(() => (ric ? ric(fn, { timeout: 400 }) : fn()), delay);
  };

  const kit: Kit = {
    ctx,
    mix,
    keep(n) {
      kept.push(n);
      nodes.push(n);
      return n;
    },
    bed(color, gain, filter, d) {
      const src = kit.keep(ctx.createBufferSource());
      const buf = noiseBuffer(ctx, color);
      src.buffer = buf;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = gain;
      nodes.push(g);
      let f: BiquadFilterNode | undefined;
      if (filter) {
        f = ctx.createBiquadFilter();
        f.type = filter.type;
        f.frequency.value = filter.freq;
        if (filter.q !== undefined) f.Q.value = filter.q;
        nodes.push(f);
        src.connect(f).connect(g);
      } else {
        src.connect(g);
      }
      g.connect(d ?? mix);
      src.start(ctx.currentTime, Math.random() * buf.duration);
      return { gain: g, filter: f };
    },
    lfo(rate, depth, param, type = 'sine') {
      const o = kit.keep(ctx.createOscillator());
      o.type = type;
      o.frequency.value = rate;
      const g = ctx.createGain();
      g.gain.value = depth;
      nodes.push(g);
      o.connect(g).connect(param);
      o.start(ctx.currentTime + Math.random() * 0.1);
    },
    bus(gain, d) {
      const g = ctx.createGain();
      g.gain.value = gain;
      g.connect(d ?? mix);
      nodes.push(g);
      return g;
    },
    reverb(seconds, decay, wet) {
      const input = ctx.createGain();
      const conv = ctx.createConvolver();
      // Generating the impulse + ConvolverNode FFT setup costs ~5–20 ms of main thread, so it is
      // attached in idle time, staggered per reverb; the 1.2 s fade-in hides the late start.
      later(() => {
        if (!disposed) conv.buffer = impulse(ctx, seconds, decay);
      });
      const w = ctx.createGain();
      w.gain.value = wet;
      input.connect(conv).connect(w).connect(mix);
      nodes.push(input, conv, w);
      return input;
    },
    every(firstIn, fn) {
      voices.push({ next: ctx.currentTime + firstIn, fn });
    },
  };

  RECIPES[id](kit);

  return {
    id,
    out,
    pump(until) {
      if (disposed) return;
      const now = ctx.currentTime;
      for (const v of voices) {
        if (v.next < now - 0.5) v.next = now + 0.02; // timer stalled: skip, don't burst
        let guard = 0;
        while (v.next < until && guard++ < 64) {
          let dt = 1;
          try {
            dt = v.fn(v.next);
          } catch {
            /* decorative */
          }
          v.next += Math.max(0.02, dt);
        }
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const t = ctx.currentTime;
      for (const s of kept) {
        try {
          s.stop(t);
        } catch {
          /* already stopped */
        }
      }
      for (const n of nodes) n.disconnect();
    },
  };
}


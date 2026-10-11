/**
 * One-shot synthesis voices shared by ambience beds and sfx2. Every voice schedules its own
 * nodes at absolute context time `t`, stops itself, and disconnects when it ends.
 */
import { noiseBuffer, type NoiseColor } from './context';

const FLOOR = 0.0001;

function cleanup(src: AudioScheduledSourceNode, ...nodes: AudioNode[]): void {
  src.onended = () => {
    src.disconnect();
    nodes.forEach((n) => n.disconnect());
  };
}

/** Percussive envelope on a gain param: exponential attack to `peak`, exponential decay to silence. */
export function perc(p: AudioParam, t: number, peak: number, attack: number, dur: number): void {
  p.setValueAtTime(FLOOR, t);
  p.exponentialRampToValueAtTime(Math.max(peak, FLOOR * 2), t + Math.max(attack, 0.001));
  p.exponentialRampToValueAtTime(FLOOR, t + Math.max(dur, attack + 0.005));
}

/** Route through a stereo panner when supported, else straight through. */
export function pan(ctx: AudioContext, dest: AudioNode, value: number): AudioNode {
  if (!value || typeof ctx.createStereoPanner !== 'function') return dest;
  const p = ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, value));
  p.connect(dest);
  // panners are tiny; release them a little after the longest voice that may use them
  setTimeout(() => p.disconnect(), 12000);
  return p;
}

export interface ToneOpts {
  t: number;
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  freqEnd?: number;
  /** Seconds for the pitch glide (default: whole duration). */
  glide?: number;
  detune?: number;
}

export function tone(ctx: AudioContext, dest: AudioNode, o: ToneOpts): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, o.t);
  if (o.freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.freqEnd), o.t + (o.glide ?? o.dur));
  if (o.detune) osc.detune.value = o.detune;
  perc(g.gain, o.t, o.gain ?? 0.5, o.attack ?? 0.004, o.dur);
  osc.connect(g).connect(dest);
  osc.start(o.t);
  osc.stop(o.t + o.dur + 0.03);
  cleanup(osc, g);
}

export interface NoiseOpts {
  t: number;
  dur: number;
  color?: NoiseColor;
  gain?: number;
  attack?: number;
  filter?: BiquadFilterType;
  freq?: number;
  q?: number;
  freqEnd?: number;
}

export function noise(ctx: AudioContext, dest: AudioNode, o: NoiseOpts): void {
  const src = ctx.createBufferSource();
  const buf = noiseBuffer(ctx, o.color ?? 'white');
  src.buffer = buf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = o.filter ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq ?? 1500, o.t);
  if (o.freqEnd !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.freqEnd), o.t + o.dur);
  f.Q.value = o.q ?? 0.8;
  const g = ctx.createGain();
  perc(g.gain, o.t, o.gain ?? 0.4, o.attack ?? 0.002, o.dur);
  src.connect(f).connect(g).connect(dest);
  src.start(o.t, Math.random() * (buf.duration - 0.1));
  src.stop(o.t + o.dur + 0.03);
  cleanup(src, f, g);
}

export interface FmOpts {
  t: number;
  freq: number;
  dur: number;
  /** Modulator frequency = freq × ratio (or a fixed `modFreq`). */
  ratio?: number;
  modFreq?: number;
  index: number;
  indexEnd?: number;
  gain?: number;
  attack?: number;
  freqEnd?: number;
  glide?: number;
  /** Optional pitch path: [time offset, freq] points applied with exponential ramps. */
  path?: [number, number][];
}

/** Two-operator FM voice (sine carrier, sine modulator). */
export function fm(ctx: AudioContext, dest: AudioNode, o: FmOpts): void {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const g = ctx.createGain();
  const ratio = o.ratio ?? 1;
  car.frequency.setValueAtTime(o.freq, o.t);
  if (o.modFreq) mod.frequency.setValueAtTime(o.modFreq, o.t);
  else mod.frequency.setValueAtTime(o.freq * ratio, o.t);
  const points = o.path ?? (o.freqEnd !== undefined ? [[o.glide ?? o.dur, o.freqEnd] as [number, number]] : []);
  for (const [dt, f] of points) {
    car.frequency.exponentialRampToValueAtTime(Math.max(1, f), o.t + dt);
    if (!o.modFreq) mod.frequency.exponentialRampToValueAtTime(Math.max(1, f * ratio), o.t + dt);
  }
  const depth = o.freq * o.index;
  modGain.gain.setValueAtTime(depth, o.t);
  modGain.gain.exponentialRampToValueAtTime(Math.max(1, o.freq * (o.indexEnd ?? o.index)), o.t + o.dur);
  perc(g.gain, o.t, o.gain ?? 0.4, o.attack ?? 0.005, o.dur);
  mod.connect(modGain).connect(car.frequency);
  car.connect(g).connect(dest);
  mod.start(o.t);
  car.start(o.t);
  mod.stop(o.t + o.dur + 0.03);
  car.stop(o.t + o.dur + 0.03);
  cleanup(car, g);
  cleanup(mod, modGain);
}

export const rand = (a: number, b: number): number => a + Math.random() * (b - a);
export const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

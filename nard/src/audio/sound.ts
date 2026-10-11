// Synthesized sound effects — no audio files. Wood clicks are shaped noise through resonant filters.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private reverb!: ConvolverNode;
  private reverbSend!: GainNode;
  private noiseBuf!: AudioBuffer;
  volume = 0.8;
  enabled = true;

  private ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);

    // small-room impulse response
    const len = Math.floor(ctx.sampleRate * 1.1);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = ir;
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.22;
    this.reverbSend.connect(this.reverb).connect(this.master);

    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }

  unlock() {
    this.ensure();
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  private out(gain: number, wet = 0.25) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(this.master);
    if (wet > 0) {
      const s = ctx.createGain();
      s.gain.value = wet;
      g.connect(s).connect(this.reverbSend);
    }
    return g;
  }

  /** A short resonant wooden knock. */
  private knock(when: number, freq: number, q: number, gain: number, decay: number, noiseAmt = 1, wet = 0.25) {
    const ctx = this.ctx!;
    const dest = this.out(gain, wet);
    // noise transient
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(noiseAmt, when + 0.0015);
    env.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    src.connect(bp).connect(env).connect(dest);
    src.start(when, Math.random() * 0.5);
    src.stop(when + decay + 0.05);
    // body resonance
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.52, when);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, when + decay);
    const oenv = ctx.createGain();
    oenv.gain.setValueAtTime(0, when);
    oenv.gain.linearRampToValueAtTime(0.35, when + 0.002);
    oenv.gain.exponentialRampToValueAtTime(0.0001, when + decay * 0.7);
    osc.connect(oenv).connect(dest);
    osc.start(when);
    osc.stop(when + decay);
  }

  private at(delay = 0) {
    const ctx = this.ensure();
    return ctx.currentTime + Math.max(0, delay);
  }

  /** Checker placed on the board. */
  checker(delay = 0, strength = 1) {
    if (!this.enabled) return;
    const t = this.at(delay);
    const f = 1900 + Math.random() * 500;
    this.knock(t, f, 7, 0.55 * strength, 0.09);
    this.knock(t + 0.004, f * 1.9, 12, 0.18 * strength, 0.05);
  }

  /** Checker stacked onto another checker — brighter clack. */
  stack(delay = 0) {
    if (!this.enabled) return;
    const t = this.at(delay);
    const f = 2600 + Math.random() * 600;
    this.knock(t, f, 10, 0.5, 0.07);
    this.knock(t + 0.003, f * 1.6, 14, 0.25, 0.045);
  }

  pickup() {
    if (!this.enabled) return;
    const t = this.at();
    this.knock(t, 3200 + Math.random() * 400, 9, 0.16, 0.04, 1, 0.1);
  }

  /** Die hitting wood / felt / other die. */
  dice(delay: number, strength: number) {
    if (!this.enabled) return;
    const t = this.at(delay);
    const f = 2300 + Math.random() * 1600;
    this.knock(t, f, 6 + Math.random() * 6, 0.12 + strength * 0.55, 0.05 + strength * 0.04, 1, 0.18);
    if (strength > 0.4) this.knock(t, 900 + Math.random() * 300, 3, strength * 0.25, 0.08, 0.6, 0.1);
  }

  /** Dice shaken in the hand just before the throw. */
  shake() {
    if (!this.enabled) return;
    for (let i = 0; i < 5; i++) this.dice(i * 0.035 + Math.random() * 0.015, 0.15 + Math.random() * 0.15);
  }

  hit(delay = 0) {
    if (!this.enabled) return;
    const t = this.at(delay);
    this.knock(t, 1500, 5, 0.9, 0.12);
    this.knock(t + 0.005, 3400, 10, 0.4, 0.06);
    // low thump
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = this.out(0.5, 0.35);
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.22);
    const e = ctx.createGain();
    e.gain.setValueAtTime(0.9, t);
    e.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(e).connect(g);
    o.start(t);
    o.stop(t + 0.3);
  }

  bearOff(delay = 0) {
    if (!this.enabled) return;
    const t = this.at(delay);
    const ctx = this.ctx!;
    // soft slide into the tray
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(2400, t + 0.12);
    lp.Q.value = 1.2;
    const e = ctx.createGain();
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(0.18, t + 0.04);
    e.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(lp).connect(e).connect(this.out(1, 0.2));
    src.start(t);
    src.stop(t + 0.2);
    this.knock(t + 0.13, 2100, 8, 0.45, 0.08);
  }

  private tone(t: number, freq: number, dur: number, gain: number, type: OscillatorType = 'triangle') {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.005;
    const e = ctx.createGain();
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(gain, t + 0.01);
    e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const e2 = ctx.createGain();
    e2.gain.value = 0.25;
    const dest = this.out(1, 0.6);
    o.connect(e).connect(dest);
    o2.connect(e2).connect(e);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  /** Santur-like plucks. */
  private pluck(t: number, freq: number, gain = 0.25, dur = 1.3) {
    this.tone(t, freq, dur, gain, 'triangle');
    this.tone(t + 0.001, freq * 1.003, dur * 0.8, gain * 0.5, 'sine');
  }

  /** Short phrase in Dastgah-e Shur flavor (half-flat second). */
  win() {
    if (!this.enabled) return;
    const t = this.at(0.05);
    const D = 293.66;
    const shur = [1, 1.0535, 1.1892, 1.3348, 1.4983, 1.5874, 1.7818, 2];
    const seq = [0, 2, 3, 4, 3, 4, 5, 7];
    seq.forEach((s, i) => this.pluck(t + i * 0.13, D * shur[s], 0.22));
    this.pluck(t + seq.length * 0.13 + 0.05, D * 2, 0.3, 2.2);
    this.pluck(t + seq.length * 0.13 + 0.05, D * 1.4983, 0.2, 2.2);
    this.pluck(t + seq.length * 0.13 + 0.05, D, 0.2, 2.2);
  }

  /** Small two-note chime for turn change / your turn. */
  chime() {
    if (!this.enabled) return;
    const t = this.at();
    this.pluck(t, 587.33, 0.08, 0.7);
    this.pluck(t + 0.09, 880, 0.07, 0.9);
  }

  click() {
    if (!this.enabled) return;
    const t = this.at();
    this.knock(t, 4200, 14, 0.12, 0.03, 1, 0.05);
  }

  error() {
    if (!this.enabled) return;
    const t = this.at();
    this.knock(t, 600, 4, 0.3, 0.09);
    this.knock(t + 0.08, 500, 4, 0.25, 0.09);
  }
}

export const sound = new SoundEngine();

// Web Audio API Procedural Cinematic Sound Engine
// 100% Client-side, zero external MP3/WAV dependencies, instant zero-latency playback.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // 1. Click Impact: Low subtle thud / click
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio playback failsafe
    }
  }

  // 2. Charge-up: Ascending electric hum + high-voltage resonance
  public playCharge() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Low rumble drone
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = "sawtooth";
      oscLow.frequency.setValueAtTime(65, now);
      oscLow.frequency.linearRampToValueAtTime(130, now + 0.45);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(450, now + 0.45);

      gainLow.gain.setValueAtTime(0.01, now);
      gainLow.gain.linearRampToValueAtTime(0.18, now + 0.35);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      oscLow.connect(filter);
      filter.connect(gainLow);
      gainLow.connect(ctx.destination);

      // High electric harmonic sparkle
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      oscHigh.type = "triangle";
      oscHigh.frequency.setValueAtTime(480, now);
      oscHigh.frequency.exponentialRampToValueAtTime(880, now + 0.4);

      gainHigh.gain.setValueAtTime(0.01, now);
      gainHigh.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      oscHigh.connect(gainHigh);
      gainHigh.connect(ctx.destination);

      oscLow.start(now);
      oscLow.stop(now + 0.5);
      oscHigh.start(now);
      oscHigh.stop(now + 0.45);
    } catch {
      // Audio playback failsafe
    }
  }

  // 3. Katana Unsheathe: Crisp metallic friction "chiiing"
  public playKatanaDraw() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Metallic ring (High Q bandpass)
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(3200, now);
      bandpass.Q.setValueAtTime(14, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      // Bell-like metallic resonance harmonic
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = "sine";
      metalOsc.frequency.setValueAtTime(2600, now);
      metalOsc.frequency.exponentialRampToValueAtTime(1900, now + 0.25);

      metalGain.gain.setValueAtTime(0.18, now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);

      noise.start(now);
      metalOsc.start(now);
      metalOsc.stop(now + 0.26);
    } catch {
      // Audio playback failsafe
    }
  }

  // 4. Thunderclap Slash: Aggressive high-velocity whoosh + thunder crack
  public playSlash() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // White noise whip / slash
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(7500, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.22);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Audio playback failsafe
    }
  }

  // 5. Cinematic Impact: Deep sub-bass boom
  public playImpact() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio playback failsafe
    }
  }
}

export const soundEngine = new SoundEngine();

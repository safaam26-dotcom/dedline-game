/**
 * Audio synthesizer for Deadline Run using the Web Audio API.
 * Provides instant sound effects & optional cheerful chiptune BGM without loading external assets.
 * Optimized for mobile devices: automatically cleans up and disconnects finished audio nodes
 * to prevent audio thread buffer spikes and frame drops.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;

  constructor() {
    // Lazy initialization on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private safePlay(osc: OscillatorNode, gain: GainNode, startTime: number, stopTime: number) {
    if (!this.ctx) return;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignored
      }
    };
    osc.start(startTime);
    osc.stop(stopTime);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    this.safePlay(osc, gain, now, now + 0.2);
  }

  public playCollect(bonus: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = bonus ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

      this.safePlay(osc, gain, now + idx * 0.05, now + idx * 0.05 + 0.16);
    });
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.28);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

    this.safePlay(osc, gain, now, now + 0.32);
  }

  public playThrowSkripsi() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

    this.safePlay(osc, gain, now, now + 0.15);
  }

  public playBossHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(160, now + 0.07);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    this.safePlay(osc, gain, now, now + 0.25);
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

      this.safePlay(osc, gain, now + idx * 0.08, now + idx * 0.08 + 0.3);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [392.00, 369.99, 349.23, 311.13, 261.63];

    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.22, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.18 + 0.25);

      this.safePlay(osc, gain, now + idx * 0.18, now + idx * 0.18 + 0.26);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.18 },
      { f: 659.25, d: 0.18 },
      { f: 783.99, d: 0.18 },
      { f: 1046.50, d: 0.35 },
      { f: 880.00, d: 0.18 },
      { f: 1046.50, d: 0.55 },
    ];

    let t = now;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      this.safePlay(osc, gain, t, t + note.d + 0.05);

      t += note.d;
    });
  }

  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initCtx();
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    const notes = [
      261.63, 293.66, 329.63, 392.00,
      329.63, 293.66, 329.63, 392.00,
      440.00, 392.00, 329.63, 293.66,
      261.63, 329.63, 392.00, 523.25,
    ];

    const bass = [
      130.81, 0, 130.81, 0,
      164.81, 0, 164.81, 0,
      174.61, 0, 174.61, 0,
      196.00, 0, 196.00, 0,
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isBgmPlaying) return;

      const now = this.ctx.currentTime;
      const noteIdx = this.bgmStep % notes.length;
      const melodyFreq = notes[noteIdx];
      const bassFreq = bass[noteIdx];

      if (melodyFreq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(melodyFreq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        this.safePlay(osc, gain, now, now + 0.11);
      }

      if (bassFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bassFreq, now);
        bGain.gain.setValueAtTime(0.06, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        this.safePlay(bOsc, bGain, now, now + 0.16);
      }

      this.bgmStep++;
    }, 150);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sounds = new SoundSystem();

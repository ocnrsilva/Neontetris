class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isBgmPlaying = false;
  private bgmInterval: number | null = null;
  private sfxVol = 0.8;
  private bgmVol = 0.4;
  private audioDataArray: Uint8Array | null = null;

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.sfxGain.connect(this.masterGain);
      this.bgmGain.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext initialization failed', e);
    }
  }

  public setVolumes(sfx: number, bgm: number) {
    this.sfxVol = sfx;
    this.bgmVol = bgm;
    if (this.ctx && this.sfxGain && this.bgmGain) {
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(bgm, this.ctx.currentTime);
    }
  }

  public getAudioFrequencyData(): number[] {
    if (!this.analyser || !this.audioDataArray) {
      return new Array(32).fill(0);
    }
    this.analyser.getByteFrequencyData(this.audioDataArray);
    return Array.from(this.audioDataArray);
  }

  public playMove() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.035);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  public playRotate() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.045);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  public playSoftDrop() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.025);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.025);
  }

  public playHardDrop() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;

    // Heavy bass thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.12);

    // Punch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, t);
    clickOsc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.03);
  }

  public playLock() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playHold() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playClear(lines: number, isTSpin: boolean, isB2B: boolean, combo: number) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;

    // Combo pitch multiplier
    const comboSemitones = Math.min(combo * 1.5, 12);
    const comboFactor = Math.pow(2, comboSemitones / 12);

    let baseFreqs: number[] = [];
    if (isTSpin) {
      baseFreqs = [440, 554.37, 659.25, 880]; // A Major synth chord
    } else if (lines === 4) {
      baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C Major Quad Fanfare
    } else if (lines === 3) {
      baseFreqs = [440, 554.37, 659.25];
    } else if (lines === 2) {
      baseFreqs = [392, 493.88];
    } else {
      baseFreqs = [349.23];
    }

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = lines === 4 || isTSpin ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq * comboFactor, t + idx * 0.02);

      const dur = lines === 4 ? 0.35 : 0.18;
      gain.gain.setValueAtTime(0.22 / baseFreqs.length, t + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.02);
      osc.stop(t + dur);
    });
  }

  public playPerfectClear() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.25, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.4);
    });
  }

  public playCountdown(count: number) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const isGo = count === 0;
    osc.type = isGo ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, t);

    gain.gain.setValueAtTime(isGo ? 0.35 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isGo ? 0.4 : 0.12));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isGo ? 0.4 : 0.12));
  }

  public playGameOver() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.6);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playWin() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.sfxVol <= 0) return;
    const t = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880, 1108.73];
    chord.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.05);

      gain.gain.setValueAtTime(0.2, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.8);
    });
  }

  public startBGM() {
    this.init();
    if (this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
    this.isBgmPlaying = true;

    // Cyber Synthwave arpeggiator
    const scale = [65.41, 98.00, 130.81, 164.81, 196.00, 261.63, 329.63]; // C minor / pentatonic synth
    let step = 0;

    const tick = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain || this.bgmVol <= 0) return;
      const t = this.ctx.currentTime;
      const freq = scale[step % scale.length];

      // Bass drone & pulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = step % 4 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const duration = 0.16;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + duration);

      step++;
    };

    this.bgmInterval = window.setInterval(tick, 180);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new SoundEngine();

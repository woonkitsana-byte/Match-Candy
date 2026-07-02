/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for high-fidelity offline SFX and Lo-Fi Ambient BGM
class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmNode: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmInterval: any = null;
  private isMuted = false;

  constructor() {
    // Lazy initialize on first interaction to comply with browser Autoplay Policy
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.bgmGain) {
        this.bgmGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      }
    } else {
      this.init();
      if (this.bgmGain) {
        this.bgmGain.gain.setValueAtTime(0.12, this.ctx?.currentTime || 0);
      }
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  // SFX: "ปิ๊ง!" Success Chime
  public playSuccess() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Core tone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35); // E6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  // SFX: "งึ่บ!" / "อ๊ะ!" Mistake / Fail / Wobble Sound
  public playFail() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // SFX: Tap / Select
  public playTap() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // SFX: Magic reveal (Mystery candy)
  public playReveal() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    gain.connect(this.ctx.destination);

    // Play a fast sparkling arpeggio
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      osc.connect(gain);
      osc.start(now + idx * 0.06);
      osc.stop(now + 0.6);
    });
  }

  // SFX: Fanfare for level completion
  public playVictory() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 587.33, d: 0.15 }, // D5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.3 },  // G5
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.50, d: 0.6 }  // C6
    ];

    let currentOffset = 0;
    notes.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + currentOffset);

      gain.gain.setValueAtTime(0, now + currentOffset);
      gain.gain.linearRampToValueAtTime(0.12, now + currentOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + note.d + 0.05);

      currentOffset += note.d - 0.02;
    });
  }

  // Soft programmatically synthesized Ambient Lo-Fi chord progression
  public startBgm() {
    if (this.isBgmPlaying) return;
    this.init();
    this.isBgmPlaying = true;

    if (!this.ctx) return;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Warm chord progression (Lo-Fi feeling)
    // Cmaj9 (C3, E3, G3, B3, D4)
    // Am9 (A2, C3, E3, G3, B3)
    // Fmaj9 (F2, A3, C4, E4, G4)
    // G13 (G2, B3, F4, A4, E5)
    const chords = [
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [110.00, 130.81, 164.81, 196.00, 246.94], // Am9
      [87.31, 220.00, 261.63, 329.63, 392.00],  // Fmaj9
      [98.00, 246.94, 349.23, 440.00, 659.25]   // G13
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.isBgmPlaying || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx];

      // Spawn soft oscillators for the chord
      const activeOscs: OscillatorNode[] = [];
      chord.forEach((freq, index) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const nodeGain = this.ctx.createGain();

        // Soft sine/triangle blend for low-fi pillow warmness
        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Slightly detune to create lush stereo/chorus feel
        osc.detune.setValueAtTime((index % 2 === 0 ? 5 : -5), now);

        // Slow attack, long release
        nodeGain.gain.setValueAtTime(0, now);
        nodeGain.gain.linearRampToValueAtTime(0.04, now + 1.5); // Warm fade-in
        nodeGain.gain.setValueAtTime(0.04, now + 4.5);
        nodeGain.gain.exponentialRampToValueAtTime(0.001, now + 5.8); // Smooth fade-out

        osc.connect(nodeGain);
        nodeGain.connect(this.bgmGain);
        
        osc.start(now);
        osc.stop(now + 6.0);
        activeOscs.push(osc);
      });

      chordIdx = (chordIdx + 1) % chords.length;
    };

    // Trigger immediately and then loop every 6 seconds
    playChord();
    this.bgmInterval = setInterval(playChord, 6000);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }
}

export const audio = new AudioManager();

import React from 'react';

// Web Audio API based procedural sound synthesizer for OmniPrompt
// Delivers zero-latency, short, warm, and soothing tactile micro-clicks.

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private lastPlayTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('promptit_sound');
      this.enabled = stored !== 'false';
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playClick();
    }
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('promptit_sound', enabled ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('promptit-sound-changed', { detail: enabled }));
    }
  }

  /**
   * Plays a short, soothing, warm acoustic tactile click.
   * Uses dual oscillators with an exponential pitch-glide and gentle low-pass filter
   * to produce a velvety wooden/ceramic micro-tap with zero harshness.
   */
  public playClick(variant: 'soft' | 'pop' | 'tap' = 'tap'): void {
    if (!this.enabled) return;

    // Prevent audio overlap stutter if triggered multiple times in under 25ms
    const now = performance.now();
    if (now - this.lastPlayTime < 25) return;
    this.lastPlayTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1, t);
    masterGain.connect(ctx.destination);

    // Warm Low-pass filter to remove any abrasive high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(1.2, t);
    filter.connect(masterGain);

    if (variant === 'pop') {
      // Soft gentle bubble pop (for toggles, stars, likes)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.035);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(t);
      osc.stop(t + 0.05);
    } else {
      // Default: Ultra-soothing, tactile mechanical/ceramic tap
      // Primary Tone: Velvety Sine sweep (460Hz down to 210Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(460, t);
      osc1.frequency.exponentialRampToValueAtTime(210, t + 0.032);

      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(0.11, t + 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

      osc1.connect(gain1);
      gain1.connect(filter);

      // Body Tone: Sub-acoustic transient (warm resonance)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(240, t);
      osc2.frequency.exponentialRampToValueAtTime(130, t + 0.025);

      gain2.gain.setValueAtTime(0.0001, t);
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

      osc2.connect(gain2);
      gain2.connect(filter);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.04);
      osc2.stop(t + 0.04);
    }
  }
}

export const sound = new SoundManager();

export const playClickSound = (variant?: 'soft' | 'pop' | 'tap') => {
  sound.playClick(variant);
};

/**
 * Initializes global click listener so any button, link styled as button,
 * or interactive control plays the soothing tactile click automatically.
 */
export function initGlobalClickSound(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked element or its closest ancestor is an interactive button/tab/pill
    const interactive = target.closest(
      'button, a.btn, [role="button"], [data-sound], input[type="submit"], input[type="button"]'
    );

    if (interactive) {
      if (interactive.getAttribute('data-no-sound') === 'true') {
        return;
      }
      const soundType = (interactive.getAttribute('data-sound') as 'soft' | 'pop' | 'tap') || 'tap';
      sound.playClick(soundType);
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });

  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
  };
}

export function useSoundState() {
  const [enabled, setEnabledState] = React.useState<boolean>(sound.isEnabled());

  React.useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setEnabledState(customEvent.detail);
    };
    window.addEventListener('promptit-sound-changed', handleSoundChange);
    return () => window.removeEventListener('promptit-sound-changed', handleSoundChange);
  }, []);

  const toggleSound = React.useCallback(() => {
    const next = sound.toggle();
    setEnabledState(next);
  }, []);

  return { isSoundEnabled: enabled, toggleSound, playClick: playClickSound };
}


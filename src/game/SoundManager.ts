class SoundManager {
    private context: AudioContext | null = null;
    private enabled: boolean = true;
    private masterGain: GainNode | null = null;

    constructor() {
        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 0.3; // Default volume
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    toggle(enabled: boolean) {
        this.enabled = enabled;
        if (this.context && this.context.state === 'suspended' && enabled) {
            this.context.resume();
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.enabled || !this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.context.currentTime + startTime);

        gain.gain.setValueAtTime(0.3, this.context.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.context.currentTime + startTime);
        osc.stop(this.context.currentTime + startTime + duration);
    }

    playDrop() {
        this.playTone(300, 'sine', 0.1);
    }

    playMatch(count: number) {
        // Ascending arpeggio based on clear count
        const base = 440;
        for (let i = 0; i < Math.min(count, 5); i++) {
            this.playTone(base * (1 + i * 0.25), 'sine', 0.15, i * 0.05);
        }
        // Success chord at end
        setTimeout(() => {
            this.playTone(880, 'triangle', 0.3);
        }, 100);
    }

    playGameOver() {
        this.playTone(400, 'sawtooth', 0.3);
        this.playTone(300, 'sawtooth', 0.3, 0.2);
        this.playTone(200, 'sawtooth', 0.6, 0.4);
    }

    playClick() {
        this.playTone(800, 'sine', 0.05);
    }
}

export const soundManager = new SoundManager();

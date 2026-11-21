// Tiny synthesized sounds for Harbor Lights (Web Audio, no files).
//
// Every sound is a short oscillator phrase built at play time, so the
// game ships no audio assets and makes no network request. The context
// is created lazily on the first user gesture, as browsers require.

let audioContext = null;

function context() {
  if (!audioContext) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(freq, startAt, length, type, volume) {
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + length + 0.05);
}

export const Sounds = {
  // Unlock the context on a gesture so later sounds are allowed to play.
  unlock() {
    context();
  },
  // A happy two-note chime when a difference is found.
  found() {
    tone(660, 0, 0.12, 'sine', 0.18);
    tone(990, 0.09, 0.22, 'sine', 0.18);
  },
  // A low buzz for a wrong click.
  wrong() {
    tone(160, 0, 0.18, 'square', 0.08);
  },
  // A soft blip when a hint is spent.
  hint() {
    tone(520, 0, 0.1, 'triangle', 0.12);
    tone(780, 0.08, 0.14, 'triangle', 0.12);
  },
  // A rising arpeggio for clearing a level.
  win() {
    [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.22, 'sine', 0.18));
  },
  // A falling phrase when time runs out.
  lose() {
    [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.14, 0.24, 'triangle', 0.14));
  },
  // A short tick when the timer drops under ten seconds.
  tick() {
    tone(880, 0, 0.06, 'sine', 0.08);
  },
};

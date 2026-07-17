let audioContext: AudioContext | null = null;

function context() {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequency: number, start: number, duration: number, volume: number) {
  const audio = context();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playDiscoverySound() {
  const now = context().currentTime;
  tone(784, now, 0.22, 0.028);
  tone(988, now + 0.1, 0.28, 0.022);
}

export function playRoundCompleteSound() {
  const now = context().currentTime;
  tone(523.25, now, 0.34, 0.026);
  tone(659.25, now + 0.14, 0.38, 0.025);
  tone(783.99, now + 0.29, 0.5, 0.026);
}

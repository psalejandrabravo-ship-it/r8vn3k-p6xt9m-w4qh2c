let audio: AudioContext | null = null;

export function blip(enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const Ctx = window.AudioContext;
  if (!Ctx) return;
  audio = audio ?? new Ctx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 494;
  gain.gain.value = 0.025;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  const end = audio.currentTime + 0.12;
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.stop(end);
}

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

export function chime(enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const Ctx = window.AudioContext;
  if (!Ctx) return;
  audio = audio ?? new Ctx();
  [523, 659, 784].forEach((freq, index) => {
    const osc = audio!.createOscillator();
    const gain = audio!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = audio!.currentTime + index * 0.11;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    osc.connect(gain);
    gain.connect(audio!.destination);
    osc.start(start);
    osc.stop(start + 0.34);
  });
}

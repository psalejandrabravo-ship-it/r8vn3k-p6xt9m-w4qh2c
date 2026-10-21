const RATE = 0.92;
const PITCH = 1;

let chosen: SpeechSynthesisVoice | null = null;
let hooked = false;

function rank(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase();
  if (lang.startsWith("es-mx")) return 0;
  if (lang.startsWith("es-419")) return 1;
  if (lang.startsWith("es-us")) return 2;
  if (lang.startsWith("es-ar") || lang.startsWith("es-cl") || lang.startsWith("es-co") || lang.startsWith("es-pe")) return 3;
  if (lang.startsWith("es") && !lang.startsWith("es-es")) return 4;
  if (lang.startsWith("es-es")) return 5;
  return 9;
}

function chooseVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices().filter((voice) => rank(voice) < 9);
  voices.sort((a, b) => rank(a) - rank(b));
  if (voices[0]) chosen = voices[0];
  if (!hooked) {
    hooked = true;
    window.speechSynthesis.addEventListener("voiceschanged", chooseVoice);
  }
}

export function speak(text: string, enabled: boolean) {
  if (!enabled || !text || typeof window === "undefined" || !window.speechSynthesis) return;
  chooseVoice();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = chosen?.lang || "es-MX";
  if (chosen) utterance.voice = chosen;
  utterance.rate = RATE;
  utterance.pitch = PITCH;
  window.speechSynthesis.speak(utterance);
}

export function hush() {
  window.speechSynthesis?.cancel();
}

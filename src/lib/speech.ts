export function speak(text: string, enabled: boolean) {
  if (!enabled || !text || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

export function hush() {
  window.speechSynthesis?.cancel();
}

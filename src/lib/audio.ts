const NOTE_FREQS: Record<string, number> = {
  C4: 262,
  D: 294,
  E: 330,
  F: 349,
  G: 392,
  A: 440,
  B: 494,
};

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    const w = window as AudioWindow;
    const Ctor = window.AudioContext || w.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = audioCtx ?? new Ctor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

export function playBeep(freq: number, dur: number): void {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    /* classroom tablets may block AudioContext until a gesture */
  }
}

export function playNote(noteName: string, dur = 0.3): void {
  playBeep(NOTE_FREQS[noteName] ?? 262, dur);
}

export function speakLetter(noteName: string): void {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const letter = noteName === "C4" ? "C" : noteName;
  const u = new SpeechSynthesisUtterance(letter);
  u.lang = "en-US";
  u.rate = 0.7;
  u.pitch = 1.2;
  u.volume = 0.15;
  speechSynthesis.speak(u);
}

export function speakNumber(n: number): void {
  const texts = ["one", "two", "three", "four", "five"];
  if (n < 1 || n > texts.length) return;
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texts[n - 1]);
  u.lang = "en-US";
  u.rate = 0.8;
  u.pitch = 1.2;
  u.volume = 0.5;
  speechSynthesis.speak(u);
}

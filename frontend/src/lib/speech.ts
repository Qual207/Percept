/**
 * Thin wrapper around the Web Speech API (SpeechRecognition).
 * Works in Chrome / Edge over localhost or HTTPS. Not available in Firefox.
 */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createRecognizer(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.continuous = false;
  return rec;
}

/**
 * Records one utterance and resolves with the final transcript.
 * Rejects on error or if speech recognition is unsupported.
 */
export function recordOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rec = createRecognizer();
    if (!rec) return reject(new Error("speech_unsupported"));

    let resolved = false;

    rec.onresult = (e: any) => {
      const results = e.results;
      if (!results || results.length === 0) return;
      const transcript = String(results[0][0].transcript ?? "").trim();
      resolved = true;
      resolve(transcript);
    };
    rec.onerror = (e: any) => {
      if (resolved) return;
      reject(new Error(e?.error ?? "speech_error"));
    };
    rec.onend = () => {
      if (!resolved) reject(new Error("no_speech"));
    };

    try {
      rec.start();
    } catch (err) {
      reject(err as Error);
    }
  });
}

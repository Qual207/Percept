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
  // We do silence detection ourselves (see recordOnce) so we keep the
  // recognizer alive across natural pauses instead of cutting off early.
  rec.interimResults = true;
  rec.continuous = true;
  return rec;
}

/**
 * Options for {@link recordOnce}.
 *
 * The defaults are tuned for a hackathon demo: enough silence tolerance
 * that a user can pause briefly mid-sentence without the recorder
 * cutting them off, but short enough that finishing feels snappy.
 */
export interface RecordOptions {
  /** Resolve once the user has been silent for this long (ms). */
  silenceMs?: number;
  /** Hard cap on total recording time (ms). */
  maxMs?: number;
  /** Optional listener that fires with the live interim+final transcript. */
  onPartial?: (text: string) => void;
}

/**
 * Records one utterance and resolves with the final transcript.
 *
 * Behavior:
 *   - Recognizer runs in continuous + interim mode so it stays open across
 *     natural pauses instead of stopping at the first silence.
 *   - We track the last time we heard any speech (interim or final). When
 *     `silenceMs` elapses with no new activity, we treat the user as done
 *     and resolve with everything accumulated so far.
 *   - A `maxMs` ceiling guarantees we never hang forever.
 *
 * Rejects with "no_speech" if the user never spoke, or with the underlying
 * SpeechRecognition error code on hard failure.
 */
export function recordOnce(options: RecordOptions = {}): Promise<string> {
  const silenceMs = options.silenceMs ?? 1600;
  const maxMs = options.maxMs ?? 15000;

  return new Promise((resolve, reject) => {
    const rec = createRecognizer();
    if (!rec) return reject(new Error("speech_unsupported"));

    let settled = false;
    let finalTranscript = "";
    let lastInterim = "";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    let maxTimer: ReturnType<typeof setTimeout> | null = null;

    function clearTimers() {
      if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
    }

    function finish() {
      if (settled) return;
      settled = true;
      clearTimers();
      try { rec.stop(); } catch { /* ignore */ }
      const text = (finalTranscript + " " + lastInterim).replace(/\s+/g, " ").trim();
      if (text.length === 0) reject(new Error("no_speech"));
      else resolve(text);
    }

    function bumpSilenceTimer() {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(finish, silenceMs);
    }

    rec.onresult = (e: any) => {
      const results = e.results;
      if (!results || results.length === 0) return;
      // Aggregate everything: append finals, replace running interim.
      let interim = "";
      for (let i = e.resultIndex ?? 0; i < results.length; i++) {
        const r = results[i];
        const piece = String(r[0]?.transcript ?? "");
        if (r.isFinal) finalTranscript += piece + " ";
        else interim += piece;
      }
      lastInterim = interim;
      options.onPartial?.((finalTranscript + " " + interim).replace(/\s+/g, " ").trim());
      bumpSilenceTimer();
    };

    rec.onerror = (e: any) => {
      // "no-speech" from the engine just means a brief silence — we already
      // handle silence ourselves, so we treat that as a soft signal.
      const code = e?.error;
      if (code === "no-speech") return;
      if (settled) return;
      settled = true;
      clearTimers();
      reject(new Error(code ?? "speech_error"));
    };

    rec.onend = () => {
      // The browser may auto-end (e.g. mobile). Treat as a finalization.
      finish();
    };

    try {
      rec.start();
      bumpSilenceTimer();
      maxTimer = setTimeout(finish, maxMs);
    } catch (err) {
      clearTimers();
      reject(err as Error);
    }
  });
}

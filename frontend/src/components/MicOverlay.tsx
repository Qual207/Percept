import { useState } from "react";
import { isSpeechSupported, recordOnce } from "../lib/speech";
import { requestIntent } from "../lib/intentClient";
import { applyPlan, undoLast, reset, appliedBatchCount } from "../lib/engine";
import { showToast } from "./Toaster";
import type { UserProfile } from "../lib/profile";

interface Props {
  profile: UserProfile;
  onOpenDiagnostic: () => void;
}

type Status = "idle" | "listening" | "thinking" | "applied" | "error";

const PROMPT_HINTS = [
  '\u201cToo much going on\u201d',
  '\u201cI can\u2019t focus\u201d',
  '\u201cBigger text\u201d',
  '\u201cEven simpler\u201d',
];

export function MicOverlay({ profile, onOpenDiagnostic }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const supported = isSpeechSupported();

  async function handleRecord() {
    if (status === "listening" || status === "thinking") return;
    setStatus("listening");
    setTranscript("");
    try {
      const text = await recordOnce();
      setTranscript(text);
      setStatus("thinking");
      const plan = await requestIntent(text, profile);
      applyPlan(plan);
      setHasChanges(appliedBatchCount() > 0);
      showToast(plan.reason_short || "Adapting layout", "info");
      setStatus("applied");
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes("not-allowed") || msg.includes("denied")) {
        showToast("Mic permission denied", "warn");
      } else if (msg.includes("speech_unsupported")) {
        showToast("Speech not supported — use the text input below", "warn");
      } else if (msg.includes("no_speech")) {
        showToast("Didn't catch that — try again", "warn");
      } else {
        showToast("Something went wrong", "warn");
      }
      setStatus("error");
    }
  }

  function handleType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const text = String(data.get("transcript") ?? "").trim();
    if (!text) return;
    setTranscript(text);
    setStatus("thinking");
    requestIntent(text, profile)
      .then((plan) => {
        applyPlan(plan);
        setHasChanges(appliedBatchCount() > 0);
        showToast(plan.reason_short || "Adapting layout", "info");
        setStatus("applied");
        form.reset();
      })
      .catch(() => {
        showToast("Something went wrong", "warn");
        setStatus("error");
      });
  }

  function handleUndo() {
    const ok = undoLast();
    setHasChanges(appliedBatchCount() > 0);
    if (ok) showToast("Undone", "info");
  }

  function handleReset() {
    reset();
    setHasChanges(false);
    showToast("Reset to original", "info");
  }

  const ringColor =
    status === "listening"
      ? "ring-rose-400/70 animate-pulse"
      : status === "thinking"
        ? "ring-indigo-400/70 animate-pulse"
        : status === "applied"
          ? "ring-emerald-400/70"
          : status === "error"
            ? "ring-amber-400/70"
            : "ring-slate-300";

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] flex w-[330px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
      data-an-role="mic-overlay"
    >
      {/* Header row: mic + status + preferences button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRecord}
          disabled={!supported || status === "listening" || status === "thinking"}
          className={[
            "flex h-12 w-12 flex-none items-center justify-center rounded-full bg-slate-900 text-white ring-4 transition",
            ringColor,
            !supported || status === "listening" || status === "thinking"
              ? "opacity-80"
              : "hover:scale-105",
          ].join(" ")}
          aria-label="Click to speak"
          title={supported ? "Click and speak" : "Speech not supported — use text input below"}
        >
          <MicIcon />
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900">Adaptive Web</div>
          <div className="truncate text-xs text-slate-500">
            {status === "listening"
              ? "Listening…"
              : status === "thinking"
                ? "Adapting layout…"
                : transcript || "Click mic or type a request"}
          </div>
        </div>

        {/* Preferences / diagnostic button */}
        <button
          type="button"
          onClick={onOpenDiagnostic}
          title={profile.calibrated ? "Edit your reading profile" : "Set up your reading profile"}
          className={[
            "flex h-9 w-9 flex-none items-center justify-center rounded-full border text-base transition",
            profile.calibrated
              ? "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              : "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 animate-pulse",
          ].join(" ")}
          aria-label="Reading profile settings"
        >
          {profile.calibrated ? "⚙" : "✦"}
        </button>
      </div>

      {/* Profile calibration nudge (only shown if not yet calibrated) */}
      {!profile.calibrated && (
        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-left text-xs text-indigo-700 hover:bg-indigo-100 transition"
        >
          <span className="font-semibold">✦ Personalize your experience →</span>
          <span className="block text-indigo-500 mt-0.5">90-second calibration makes every site feel calmer</span>
        </button>
      )}

      {!supported && (
        <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
          Voice unavailable in this browser. Use Chrome or Edge for mic support.
        </p>
      )}

      {/* Text input fallback */}
      <form onSubmit={handleType} className="flex gap-2">
        <input
          name="transcript"
          type="text"
          placeholder="…or type a request"
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Go
        </button>
      </form>

      {/* Undo + Reset */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!hasChanges}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {/* Hint pills */}
      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
        Try: {PROMPT_HINTS.map((p, i) => (
          <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5">{p}</span>
        ))}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

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

interface HistoryEntry {
  text: string;
  reason: string;
  source?: string;
}

const PROMPT_HINTS = [
  "Make the text bigger",
  "Hide the sidebars",
  "Dim everything else",
  "Warm background",
  "Stop the flashing",
  "Flow mode",
];

function flashChangedElements() {
  if (typeof document === "undefined") return;
  const els = document.querySelectorAll<HTMLElement>(
    "[data-an-role]:not(.an-hidden):not(.an-dim)",
  );
  els.forEach((el) => {
    el.classList.remove("an-flash");
    void el.offsetWidth;
    el.classList.add("an-flash");
    setTimeout(() => el.classList.remove("an-flash"), 750);
  });
}

export function MicOverlay({ profile, onOpenDiagnostic }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [liveText, setLiveText] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const supported = isSpeechSupported();

  function afterApply(text: string, plan: { reason_short: string; source?: string }) {
    applyPlan(plan as any);
    setHasChanges(appliedBatchCount() > 0);
    setHistory((prev) =>
      [{ text, reason: plan.reason_short, source: (plan as any).source }, ...prev].slice(0, 8),
    );
    showToast(plan.reason_short || "Adapting layout", "info");
    setStatus("applied");
    flashChangedElements();
  }

  async function handleRecord() {
    if (status === "listening" || status === "thinking") return;
    setStatus("listening");
    setLiveText("");
    try {
      const text = await recordOnce();
      setLiveText(text);
      setStatus("thinking");
      const plan = await requestIntent(text, profile);
      afterApply(text, plan);
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
    setLiveText(text);
    setStatus("thinking");
    requestIntent(text, profile)
      .then((plan) => {
        afterApply(text, plan);
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
    setHistory((prev) => prev.slice(1));
    if (ok) showToast("Undone", "info");
  }

  function handleReset() {
    reset();
    setHasChanges(false);
    setHistory([]);
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

  const statusText =
    status === "listening"
      ? "Listening…"
      : status === "thinking"
        ? "Adapting…"
        : liveText || "Click the mic and tell me how you feel";

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] flex w-[340px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white/97 p-4 shadow-2xl backdrop-blur"
      data-an-role="mic-overlay"
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRecord}
          disabled={!supported || status === "listening" || status === "thinking"}
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white ring-4 transition",
            ringColor,
            !supported || status === "listening" || status === "thinking"
              ? "opacity-80"
              : "hover:scale-105 active:scale-95",
          ].join(" ")}
          aria-label="Click to speak"
          title={supported ? "Click and speak" : "Speech not supported — type below"}
        >
          <MicIcon />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900">Adaptive Web</span>
            {profile.calibrated && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                calibrated
              </span>
            )}
          </div>
          <div className="truncate text-xs text-slate-500">{statusText}</div>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="shrink-0 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Toggle history"
          >
            {showHistory ? "Hide" : `History (${history.length})`}
          </button>
        )}
      </div>

      {!supported && (
        <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
          Voice unavailable in this browser. Use Chrome / Edge for mic support.
        </p>
      )}

      {/* Text input */}
      <form onSubmit={handleType} className="flex gap-2">
        <input
          name="transcript"
          type="text"
          placeholder="…or type a request"
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "thinking"}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
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
          Undo last
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Reset all
        </button>
      </div>

      {/* Diagnostic / calibration link */}
      <button
        type="button"
        onClick={onOpenDiagnostic}
        className="text-left text-[11px] text-slate-400 hover:text-slate-600"
      >
        {profile.calibrated ? "Recalibrate preferences →" : "Calibrate for your needs →"}
      </button>

      {/* Transcript history */}
      {showHistory && history.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            History
          </div>
          {history.map((entry, i) => (
            <div key={i} className="rounded-md bg-slate-50 px-2.5 py-1.5">
              <div className="text-xs font-medium text-slate-700">"{entry.text}"</div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {entry.reason}
                {entry.source === "fallback" && (
                  <span className="ml-1 text-amber-500">(offline)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hint chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-1 text-[11px] text-slate-400">
        Try:{" "}
        {PROMPT_HINTS.map((p, i) => (
          <button
            key={i}
            type="button"
            className="rounded-full bg-slate-100 px-2 py-0.5 hover:bg-slate-200 hover:text-slate-700"
            onClick={() => {
              setLiveText(p);
              setStatus("thinking");
              requestIntent(p, profile)
                .then((plan) => afterApply(p, plan))
                .catch(() => {
                  showToast("Something went wrong", "warn");
                  setStatus("error");
                });
            }}
          >
            {p}
          </button>
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

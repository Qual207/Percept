import { useState, useEffect, useRef } from "react";
import { isSpeechSupported, recordOnce } from "../lib/speech";
import { requestIntent } from "../lib/intentClient";
import { applyPlan, undoLast, reset, subscribe } from "../lib/engine";
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

const THINKING_STEPS = [
  "Sending transcript to OpenAI…",
  "Reading page structure…",
  "Identifying relevant elements…",
  "Building action plan…",
  "Finalizing changes…",
];

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
  const [batchCount, setBatchCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [lastSource, setLastSource] = useState<"llm" | "fallback" | null>(null);
  // Thinking panel state
  const [fullReasoning, setFullReasoning] = useState("");
  const [displayedReasoning, setDisplayedReasoning] = useState("");
  const [thinkingStep, setThinkingStep] = useState(0);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkingStepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supported = isSpeechSupported();

  // Stay in sync with the engine: any apply/undo/reset (from anywhere in the
  // app, including diagnostic-completion in App.tsx) updates batchCount.
  useEffect(() => subscribe(setBatchCount), []);

  // Cycle through thinking step labels while the LLM is working
  useEffect(() => {
    if (status === "thinking") {
      setThinkingStep(0);
      thinkingStepRef.current = setInterval(() => {
        setThinkingStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1));
      }, 900);
    } else {
      if (thinkingStepRef.current) clearInterval(thinkingStepRef.current);
    }
    return () => { if (thinkingStepRef.current) clearInterval(thinkingStepRef.current); };
  }, [status]);

  // Typewriter effect: reveal reasoning text character by character
  useEffect(() => {
    if (!fullReasoning) { setDisplayedReasoning(""); return; }
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDisplayedReasoning("");
    let i = 0;
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayedReasoning(fullReasoning.slice(0, i));
      if (i >= fullReasoning.length) {
        clearInterval(typewriterRef.current!);
        typewriterRef.current = null;
      }
    }, 16);
    return () => { if (typewriterRef.current) clearInterval(typewriterRef.current); };
  }, [fullReasoning]);

  function afterApply(text: string, plan: { reason_short: string; reasoning?: string; source?: string }) {
    applyPlan(plan as any);
    const src = (plan.source === "llm" ? "llm" : "fallback") as "llm" | "fallback";
    setLastSource(src);
    setHistory((prev) =>
      [{ text, reason: plan.reason_short, source: src }, ...prev].slice(0, 8),
    );
    if (plan.reasoning) setFullReasoning(plan.reasoning);
    showToast(plan.reason_short || "Adapting layout", "info");
    setStatus("applied");
    flashChangedElements();
  }

  function startRequest(text: string, formToReset?: HTMLFormElement) {
    setLiveText(text);
    setFullReasoning("");
    setLastSource(null);
    setStatus("thinking");
    requestIntent(text, profile)
      .then((plan) => {
        afterApply(text, plan);
        formToReset?.reset();
      })
      .catch(() => {
        showToast("Something went wrong", "warn");
        setStatus("error");
      });
  }

  async function handleRecord() {
    if (status === "listening" || status === "thinking") return;
    setStatus("listening");
    setLiveText("");
    setFullReasoning("");
    setLastSource(null);
    try {
      const text = await recordOnce({
        // Generous defaults so users can pause mid-thought without being cut off.
        silenceMs: 1600,
        maxMs: 15000,
        onPartial: (partial) => setLiveText(partial),
      });
      startRequest(text);
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
    startRequest(text, form);
  }

  function handleUndo() {
    const ok = undoLast();
    setHistory((prev) => prev.slice(1));
    if (ok) showToast("Undone", "info");
    else showToast("Nothing to undo", "info");
  }

  function handleReset() {
    const had = batchCount > 0;
    reset();
    setHistory([]);
    setFullReasoning("");
    setDisplayedReasoning("");
    setLastSource(null);
    setStatus("idle");
    setLiveText("");
    showToast(had ? "Reset to original" : "Already at original", "info");
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
        ? "Querying OpenAI…"
        : liveText || "Click the mic and tell me how you feel";

  const isFallback = lastSource === "fallback";
  const showThinkingPanel = status === "thinking" || (status === "applied" && (fullReasoning || lastSource));

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] flex w-[340px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl backdrop-blur-[2px]"
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
            <span className="text-sm font-semibold text-slate-900">Percept</span>
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

      {/* ── Agent thinking panel ─────────────────────────────────────── */}
      {showThinkingPanel && (
        <div
          className={[
            "rounded-xl border p-3",
            status === "thinking"
              ? "border-indigo-100 bg-indigo-50/80"
              : isFallback
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-100 bg-emerald-50/60",
          ].join(" ")}
        >
          {/* Panel header */}
          <div className="mb-2 flex items-center gap-2">
            {status === "thinking" ? (
              <>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                  OpenAI agent
                </span>
              </>
            ) : isFallback ? (
              <>
                <span className="text-sm">⚠</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                  LLM Not Found: Fallback
                </span>
              </>
            ) : (
              <>
                <span className="text-sm">✦</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  OpenAI · applied
                </span>
              </>
            )}
          </div>

          {/* While thinking: cycling step labels */}
          {status === "thinking" && (
            <div className="space-y-1">
              {THINKING_STEPS.slice(0, thinkingStep + 1).map((step, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i < thinkingStep ? (
                    <span className="text-[10px] text-indigo-300">✓</span>
                  ) : (
                    <span className="inline-block h-1 w-1 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                  <span
                    className={[
                      "text-xs",
                      i < thinkingStep ? "text-indigo-300 line-through" : "text-indigo-600 font-medium",
                    ].join(" ")}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* After response: typewriter reasoning */}
          {status !== "thinking" && displayedReasoning && (
            <p
              className={[
                "text-xs leading-relaxed",
                isFallback ? "text-amber-800" : "text-emerald-800",
              ].join(" ")}
            >
              {displayedReasoning}
              {displayedReasoning.length < fullReasoning.length && (
                <span
                  className={[
                    "ml-0.5 inline-block h-3 w-0.5 animate-pulse align-middle",
                    isFallback ? "bg-amber-500" : "bg-emerald-500",
                  ].join(" ")}
                />
              )}
            </p>
          )}

          {/* Fallback with no reasoning text */}
          {status !== "thinking" && isFallback && !displayedReasoning && (
            <p className="text-xs text-amber-700">
              OpenAI was unreachable. A keyword-based rule matched your request instead.
            </p>
          )}
        </div>
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

      {/* Undo + Reset — Reset is ALWAYS clickable as a safety net */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={batchCount === 0}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Undo last
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={[
            "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition",
            batchCount > 0
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
          ].join(" ")}
          title={batchCount > 0 ? `Reset ${batchCount} change${batchCount === 1 ? "" : "s"}` : "Already at original"}
        >
          {batchCount > 0 ? `Reset all (${batchCount})` : "Reset all"}
        </button>
      </div>

      {/* Diagnostic / calibration CTA — prominent when uncalibrated */}
      {profile.calibrated ? (
        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="flex items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-left text-xs font-medium text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-sm">✓</span>
            <span>Preferences calibrated</span>
          </span>
          <span className="text-[11px] text-indigo-500">Recalibrate →</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="group relative flex items-center justify-between gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-left text-sm font-semibold text-white shadow-md ring-2 ring-indigo-200 ring-offset-2 transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]"
        >
          {/* Subtle shimmer */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          <span className="flex items-center gap-2">
            <span className="text-base">✦</span>
            <span className="flex flex-col leading-tight">
              <span>Calibrate for your needs</span>
              <span className="text-[10px] font-normal text-indigo-100">30-second visual check-in</span>
            </span>
          </span>
          <span className="text-base">→</span>
          {/* Pulsing dot in corner */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
          </span>
        </button>
      )}

      {/* Transcript history */}
      {showHistory && history.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            History
          </div>
          {history.map((entry, i) => (
            <div key={i} className="rounded-md bg-slate-50 px-2.5 py-1.5">
              <div className="text-xs font-medium text-slate-700">"{entry.text}"</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                <span>{entry.reason}</span>
                {entry.source === "fallback" && (
                  <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-600">
                    fallback
                  </span>
                )}
                {entry.source === "llm" && (
                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-medium text-emerald-600">
                    OpenAI
                  </span>
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
            onClick={() => startRequest(p)}
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

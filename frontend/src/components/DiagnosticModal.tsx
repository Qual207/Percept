import { useState } from "react";
import type { UserProfile } from "../lib/profile";
import { DEFAULT_PROFILE } from "../lib/profile";

interface Props {
  initial: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onDismiss: () => void;
}

type Draft = Omit<UserProfile, "calibrated" | "updatedAt">;

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type StepId =
  | "welcome"
  | "density"
  | "contrast"
  | "textsize"
  | "chunking"
  | "focus"
  | "done";

const STEPS: StepId[] = ["welcome", "density", "contrast", "textsize", "chunking", "focus", "done"];

// ---------------------------------------------------------------------------
// Mini layout preview components (the "game" part of the gamified diagnostic)
// ---------------------------------------------------------------------------

function DenseLayoutPreview() {
  return (
    <div className="pointer-events-none scale-90 rounded border border-slate-200 bg-white p-2 shadow text-[7px] leading-tight font-sans overflow-hidden">
      <div className="mb-1 flex gap-1 bg-rose-500 p-1 text-white items-center">
        <span className="font-bold">STORE</span>
        <span className="ml-1 flex-1 bg-white/20 px-1">Search products...</span>
        <span>🛒3</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        <div className="col-span-1 space-y-0.5">
          <div className="font-bold text-[6px] text-slate-500">FILTER BY</div>
          {["Electronics", "Books", "Fashion", "Home", "Sports", "Beauty", "Toys"].map(c => (
            <div key={c} className="truncate text-blue-600">{c}</div>
          ))}
        </div>
        <div className="col-span-2 space-y-1">
          <div className="grid grid-cols-2 gap-0.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded bg-slate-100 p-0.5">
                <div className="mb-0.5 h-4 w-full bg-slate-300 rounded" />
                <div className="font-bold text-rose-600">${(9.99 * i).toFixed(2)}</div>
                <div className="text-amber-500 text-[5px]">★★★★☆ (2.4k)</div>
                <div className="mt-0.5 rounded bg-amber-400 px-0.5 text-center text-[5px] font-bold">Add to Cart</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1 space-y-0.5">
          <div className="font-bold text-[6px] text-slate-500">ALSO VIEWED</div>
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-0.5 items-center border-b border-slate-100 pb-0.5">
              <div className="h-4 w-4 flex-none rounded bg-slate-200" />
              <div className="text-blue-600 truncate">Product {i}</div>
            </div>
          ))}
          <div className="rounded bg-rose-100 p-0.5 text-center text-rose-700 font-bold text-[5px]">⚡ DEAL ENDS 02:14</div>
          <div className="rounded bg-green-100 p-0.5 text-center text-green-700 text-[5px]">Subscribe & Save</div>
        </div>
      </div>
    </div>
  );
}

function OpenLayoutPreview() {
  return (
    <div className="pointer-events-none scale-90 rounded border border-slate-200 bg-white p-3 shadow text-[8px] leading-relaxed font-sans overflow-hidden">
      <div className="mb-2 text-[10px] font-semibold text-slate-700">Anker USB-C Cable (3-pack)</div>
      <div className="mb-2 h-8 w-full rounded bg-slate-100 flex items-center justify-center text-slate-400">📷 Product image</div>
      <div className="mb-1 text-[11px] font-bold text-slate-900">$9.99</div>
      <div className="mb-2 text-slate-500">Fast charging · Nylon braided · Lifetime warranty</div>
      <div className="mb-2 space-y-0.5 text-slate-700">
        <div>✓ Works with all USB-C devices</div>
        <div>✓ 100W power delivery</div>
        <div>✓ Pack of 3</div>
      </div>
      <div className="rounded bg-amber-400 px-2 py-1 text-center text-[9px] font-bold text-slate-900">Add to Cart</div>
    </div>
  );
}

function HighContrastPreview() {
  return (
    <div className="pointer-events-none scale-90 rounded border-2 border-slate-900 bg-white p-3 shadow font-sans overflow-hidden">
      <div className="mb-1 border-b-2 border-slate-900 pb-1 text-[9px] font-black uppercase tracking-wide text-slate-900">The Weather Today</div>
      <p className="text-[8px] font-semibold leading-snug text-slate-900">
        Heavy rain expected across the northern region throughout the afternoon. Residents advised to avoid low-lying areas near rivers and streams.
      </p>
      <div className="mt-1 flex gap-1">
        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[7px] font-bold text-white">Read more</span>
        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[7px] font-bold text-white">Alert</span>
      </div>
    </div>
  );
}

function SoftContrastPreview() {
  return (
    <div className="pointer-events-none scale-90 rounded border border-slate-200 bg-stone-50 p-3 shadow font-sans overflow-hidden">
      <div className="mb-1 pb-1 text-[9px] font-semibold text-slate-500">The Weather Today</div>
      <p className="text-[8px] leading-relaxed text-slate-600">
        Heavy rain expected across the northern region throughout the afternoon. Residents advised to avoid low-lying areas near rivers and streams.
      </p>
      <div className="mt-1 flex gap-1">
        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[7px] text-slate-600">Read more</span>
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[7px] text-amber-700">Alert</span>
      </div>
    </div>
  );
}

function SmallTextPreview() {
  return (
    <div className="pointer-events-none rounded border border-slate-200 bg-white p-2 shadow font-sans overflow-hidden">
      <p className="text-[8px] leading-snug text-slate-800">
        The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. The five boxing wizards jump quickly.
      </p>
    </div>
  );
}

function LargeTextPreview() {
  return (
    <div className="pointer-events-none rounded border border-slate-200 bg-white p-2 shadow font-sans overflow-hidden">
      <p className="text-[11px] leading-relaxed text-slate-800">
        The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
      </p>
    </div>
  );
}

function ParagraphPreview() {
  return (
    <div className="pointer-events-none rounded border border-slate-200 bg-white p-2 shadow font-sans overflow-hidden">
      <p className="text-[8px] leading-relaxed text-slate-800">
        Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose. This process occurs in the chloroplasts of plant cells and is essential for life on Earth. Without photosynthesis, the oxygen in our atmosphere would be depleted.
      </p>
    </div>
  );
}

function ChunkedPreview() {
  return (
    <div className="pointer-events-none rounded border border-slate-200 bg-white p-2 shadow font-sans space-y-1.5 overflow-hidden">
      {[
        "Photosynthesis uses sunlight, water, and CO₂ to make glucose.",
        "It happens inside chloroplasts in plant cells.",
        "Without it, Earth's oxygen would run out.",
      ].map((s, i) => (
        <div key={i} className="rounded bg-slate-50 px-2 py-1 text-[8px] leading-snug text-slate-800 border-l-2 border-indigo-300">
          {s}
        </div>
      ))}
    </div>
  );
}

function SpotlightPreview() {
  return (
    <div className="pointer-events-none relative rounded border border-slate-200 bg-white overflow-hidden font-sans" style={{ minHeight: 80 }}>
      <div className="absolute inset-0 bg-white/50" />
      <div className="relative grid grid-cols-3 gap-1 p-2 text-[7px]">
        <div className="text-slate-300 space-y-0.5 opacity-30">
          <div className="font-bold text-slate-400">Sidebar</div>
          <div>Category A</div>
          <div>Category B</div>
          <div>Category C</div>
        </div>
        <div className="col-span-1 rounded bg-white shadow-md ring-2 ring-indigo-400 p-1.5 z-10 relative">
          <div className="font-bold text-slate-900 mb-0.5">Main Article</div>
          <p className="text-slate-700 leading-snug">This is the content you care about, fully visible and crisp.</p>
        </div>
        <div className="space-y-0.5 opacity-30">
          <div className="font-bold text-slate-400">Also read</div>
          <div>Story 1</div>
          <div>Story 2</div>
          <div>Story 3</div>
        </div>
      </div>
    </div>
  );
}

function AmbientPreview() {
  return (
    <div className="pointer-events-none rounded border border-slate-200 bg-white overflow-hidden font-sans">
      <div className="grid grid-cols-3 gap-1 p-2 text-[7px]">
        <div className="opacity-50 space-y-0.5">
          <div className="font-bold text-slate-400">Sidebar</div>
          <div className="text-slate-400">Category A</div>
          <div className="text-slate-400">Category B</div>
          <div className="text-slate-400">Category C</div>
        </div>
        <div className="col-span-1 p-1">
          <div className="font-bold text-slate-900 mb-0.5">Main Article</div>
          <p className="text-slate-700 leading-snug">The content you care about, clear and centered.</p>
        </div>
        <div className="opacity-50 space-y-0.5">
          <div className="font-bold text-slate-400">Also read</div>
          <div className="text-slate-400">Story 1</div>
          <div className="text-slate-400">Story 2</div>
          <div className="text-slate-400">Story 3</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DiagnosticModal({ initial, onComplete, onDismiss }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    densityTolerance: initial.densityTolerance,
    textScale: initial.textScale,
    contrastPreference: initial.contrastPreference,
    chunkingPreference: initial.chunkingPreference,
    focusStyle: initial.focusStyle,
  });

  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = step === "done";
  const progress = stepIdx / (STEPS.length - 1);

  function next() {
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function pick<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setTimeout(next, 220); // brief moment so user sees selection before advancing
  }

  function finish() {
    onComplete({
      ...DEFAULT_PROFILE,
      ...draft,
      calibrated: true,
      updatedAt: Date.now(),
    });
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Progress bar */}
        {!isFirst && !isLast && (
          <div className="h-1 w-full bg-slate-100">
            <div
              className="h-1 bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Dismiss button */}
        {!isLast && (
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="p-8">
          {/* ---- WELCOME ---- */}
          {step === "welcome" && (
            <div className="text-center">
              <div className="mb-4 text-5xl">🧠</div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Let's set up your reading profile
              </h2>
              <p className="mx-auto mb-6 max-w-md text-base text-slate-500">
                Five quick visual choices — no forms, no rating scales. Just tell us which
                layout feels easier to read. Takes about 90 seconds.
              </p>
              <p className="mx-auto mb-8 max-w-sm text-sm text-slate-400">
                Your answers build a personal profile that shapes every page you visit. You
                can update it anytime from the overlay.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={next}
                  className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
                >
                  Start calibration
                </button>
                <button
                  onClick={onDismiss}
                  className="rounded-full border border-slate-200 px-6 py-3 text-base text-slate-500 hover:bg-slate-50"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ---- DENSITY ---- */}
          {step === "density" && (
            <ABChoice
              step="1 / 5"
              question="Which of these feels easier to scan?"
              hint="Go with your gut — there's no wrong answer."
              left={{
                label: "This one",
                sublabel: "Dense, compact",
                preview: <DenseLayoutPreview />,
                onPick: () => pick("densityTolerance", "high"),
                active: draft.densityTolerance === "high",
              }}
              right={{
                label: "This one",
                sublabel: "Open, spacious",
                preview: <OpenLayoutPreview />,
                onPick: () => pick("densityTolerance", "low"),
                active: draft.densityTolerance === "low",
              }}
            />
          )}

          {/* ---- CONTRAST ---- */}
          {step === "contrast" && (
            <ABChoice
              step="2 / 5"
              question="Which text is more comfortable to read?"
              hint="Think about reading for 20+ minutes — which would tire you less?"
              left={{
                label: "This one",
                sublabel: "Bold, high contrast",
                preview: <HighContrastPreview />,
                onPick: () => pick("contrastPreference", "high"),
                active: draft.contrastPreference === "high",
              }}
              right={{
                label: "This one",
                sublabel: "Soft, muted tones",
                preview: <SoftContrastPreview />,
                onPick: () => pick("contrastPreference", "soft"),
                active: draft.contrastPreference === "soft",
              }}
            />
          )}

          {/* ---- TEXT SIZE ---- */}
          {step === "textsize" && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">3 / 5</div>
              <h3 className="mb-1 text-xl font-bold text-slate-900">Which text size is most comfortable?</h3>
              <p className="mb-6 text-sm text-slate-400">Pick the one you could read for an hour without straining.</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { label: "Standard", scale: 1.0, preview: <SmallTextPreview /> },
                  { label: "Larger", scale: 1.2, preview: <LargeTextPreview /> },
                  { label: "Largest", scale: 1.4, preview: (
                    <div className="pointer-events-none rounded border border-slate-200 bg-white p-2 shadow font-sans overflow-hidden">
                      <p className="text-[14px] leading-relaxed text-slate-800">The quick brown fox jumps.</p>
                    </div>
                  )},
                ] as const).map(({ label, scale, preview }) => (
                  <button
                    key={label}
                    onClick={() => pick("textScale", scale)}
                    className={[
                      "rounded-2xl border-2 p-3 text-left transition",
                      draft.textScale === scale
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300",
                    ].join(" ")}
                  >
                    {preview}
                    <div className="mt-2 text-center text-sm font-semibold text-slate-700">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- CHUNKING ---- */}
          {step === "chunking" && (
            <ABChoice
              step="4 / 5"
              question="When reading something complex, which feels easier to absorb?"
              hint="Both contain exactly the same information."
              left={{
                label: "This one",
                sublabel: "One idea at a time",
                preview: <ChunkedPreview />,
                onPick: () => pick("chunkingPreference", "one-at-a-time"),
                active: draft.chunkingPreference === "one-at-a-time",
              }}
              right={{
                label: "This one",
                sublabel: "Full paragraph",
                preview: <ParagraphPreview />,
                onPick: () => pick("chunkingPreference", "paragraph"),
                active: draft.chunkingPreference === "paragraph",
              }}
            />
          )}

          {/* ---- FOCUS STYLE ---- */}
          {step === "focus" && (
            <ABChoice
              step="5 / 5"
              question="When you're trying to focus on one thing, which style helps more?"
              hint="Both dim the surrounding content — just in different ways."
              left={{
                label: "This one",
                sublabel: "Hard spotlight",
                preview: <SpotlightPreview />,
                onPick: () => pick("focusStyle", "spotlight"),
                active: draft.focusStyle === "spotlight",
              }}
              right={{
                label: "This one",
                sublabel: "Gentle ambient fade",
                preview: <AmbientPreview />,
                onPick: () => pick("focusStyle", "ambient"),
                active: draft.focusStyle === "ambient",
              }}
            />
          )}

          {/* ---- DONE ---- */}
          {step === "done" && (
            <div className="text-center">
              <div className="mb-4 text-5xl">✅</div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Profile set</h2>
              <p className="mx-auto mb-6 max-w-md text-base text-slate-500">
                Every page you adapt from now on will be shaped by these preferences.
                You can update them anytime from the overlay.
              </p>
              <div className="mx-auto mb-8 max-w-sm rounded-2xl bg-slate-50 p-4 text-left text-sm space-y-1.5">
                <ProfileRow label="Layout density" value={
                  draft.densityTolerance === "low" ? "Prefers open / spacious"
                  : draft.densityTolerance === "high" ? "Handles dense layouts fine"
                  : "Moderate clutter OK"
                } />
                <ProfileRow label="Contrast" value={draft.contrastPreference === "high" ? "Bold, high contrast" : "Soft, muted tones"} />
                <ProfileRow label="Text size" value={
                  draft.textScale >= 1.4 ? "Largest" : draft.textScale >= 1.2 ? "Larger" : "Standard"
                } />
                <ProfileRow label="Reading style" value={draft.chunkingPreference === "one-at-a-time" ? "One idea at a time" : "Full paragraphs"} />
                <ProfileRow label="Focus style" value={draft.focusStyle === "spotlight" ? "Hard spotlight" : "Gentle ambient fade"} />
              </div>
              <button
                onClick={finish}
                className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
              >
                Start using Adaptive Web
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

interface ChoiceOption {
  label: string;
  sublabel: string;
  preview: React.ReactNode;
  onPick: () => void;
  active: boolean;
}

function ABChoice({
  step,
  question,
  hint,
  left,
  right,
}: {
  step: string;
  question: string;
  hint: string;
  left: ChoiceOption;
  right: ChoiceOption;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{step}</div>
      <h3 className="mb-1 text-xl font-bold text-slate-900">{question}</h3>
      <p className="mb-5 text-sm text-slate-400">{hint}</p>
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((opt) => (
          <button
            key={opt.sublabel}
            onClick={opt.onPick}
            className={[
              "group flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition",
              opt.active
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
            ].join(" ")}
          >
            <div className="w-full overflow-hidden rounded-lg">{opt.preview}</div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{opt.label}</div>
              <div className="text-xs text-slate-400">{opt.sublabel}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

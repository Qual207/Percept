import type { Plan } from "../types/intent";

/**
 * Client-side fallback intent parser.
 * Used when the backend is unreachable (network down, offline demo).
 * Mirrors backend/src/lib/fallback.ts — keep in sync.
 */

type State =
  | "overloaded"
  | "distracted"
  | "sensory_overload"
  | "bigger_text"
  | "simpler";

const STATE_KEYWORDS: Record<State, string[]> = {
  overloaded: [
    "too much",
    "overwhelm",
    "overwhelmed",
    "chaos",
    "chaotic",
    "cluttered",
    "busy",
    "noisy",
  ],
  distracted: [
    "can't focus",
    "cannot focus",
    "hard to focus",
    "distracted",
    "lost",
    "cant concentrate",
    "can't concentrate",
  ],
  sensory_overload: [
    "dizzy",
    "bright",
    "too bright",
    "flashing",
    "harsh",
    "headache",
    "nausea",
  ],
  bigger_text: [
    "bigger text",
    "text bigger",
    "larger text",
    "text larger",
    "increase text",
    "increase font",
    "bigger font",
    "font bigger",
    "make it bigger",
    "make bigger",
    "hard to read",
    "cant read",
    "can't read",
  ],
  simpler: ["simpler", "even simpler", "more simple", "calmer", "calm down"],
};

const STATE_PLANS: Record<State, Plan> = {
  overloaded: {
    reason_short: "Detected overload — simplifying layout",
    intensity: 0.7,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.25 },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
      { layer: "typographic", type: "setFontScale", value: 1.15 },
      { layer: "typographic", type: "setMaxWidth", value: 720 },
      { layer: "typographic", type: "setLineHeight", value: 1.6 },
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
    ],
  },
  distracted: {
    reason_short: "Increasing focus — dimming periphery",
    intensity: 0.5,
    actions: [
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='aside-right']", opacity: 0.3 },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.4 },
    ],
  },
  sensory_overload: {
    reason_short: "Reducing visual stimulation",
    intensity: 0.8,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='aside-left']", opacity: 0.2 },
      { layer: "structural", type: "dim", selector: "[data-an-role='aside-right']", opacity: 0.2 },
      { layer: "typographic", type: "setLineHeight", value: 1.7 },
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
    ],
  },
  bigger_text: {
    reason_short: "Increasing text size",
    intensity: 0.4,
    actions: [
      { layer: "typographic", type: "setFontScale", value: 1.35 },
      { layer: "typographic", type: "setLineHeight", value: 1.7 },
    ],
  },
  simpler: {
    reason_short: "Simplifying further",
    intensity: 0.9,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.15 },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
      { layer: "typographic", type: "setFontScale", value: 1.25 },
      { layer: "typographic", type: "setMaxWidth", value: 680 },
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
    ],
  },
};

export function detectStates(transcript: string): State[] {
  const lower = transcript.toLowerCase();
  const matches: State[] = [];
  for (const [state, kws] of Object.entries(STATE_KEYWORDS) as [State, string[]][]) {
    if (kws.some((kw) => lower.includes(kw))) matches.push(state);
  }
  return matches;
}

function mergePlans(plans: Plan[]): Plan {
  const map = new Map<string, Plan["actions"][number]>();
  let intensity = 0;
  const reasons: string[] = [];
  for (const p of plans) {
    intensity = Math.max(intensity, p.intensity);
    reasons.push(p.reason_short);
    for (const a of p.actions) {
      const key = `${a.layer}:${a.type}:${a.selector ?? ""}`;
      map.set(key, a);
    }
  }
  return {
    reason_short: reasons.join(" + "),
    intensity,
    actions: Array.from(map.values()),
  };
}

export function fallbackPlan(transcript: string): Plan {
  const states = detectStates(transcript);
  if (states.length === 0) {
    return {
      reason_short: "Light cleanup",
      intensity: 0.3,
      actions: [
        { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
        { layer: "typographic", type: "setMaxWidth", value: 800 },
        { layer: "typographic", type: "setLineHeight", value: 1.55 },
      ],
    };
  }
  return mergePlans(states.map((s) => STATE_PLANS[s]));
}

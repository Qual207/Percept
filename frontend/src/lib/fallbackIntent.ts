import type { Plan } from "../types/intent";

/**
 * Surgical client-side fallback intent parser.
 * Each state maps ONLY to the actions directly relevant to that request.
 * Mirrors backend/src/lib/fallback.ts — keep in sync.
 */

type State =
  | "bigger_text"
  | "smaller_text"
  | "hide_sidebars"
  | "hide_nav"
  | "hide_promo"
  | "dim_sidebars"
  | "spotlight_main"
  | "single_column"
  | "warm_bg"
  | "dark_bg"
  | "kill_animations"
  | "more_spacing"
  | "dyslexic_font"
  | "clean_font"
  | "flow_mode"
  | "scan_mode"
  | "rest_mode";

const STATE_KEYWORDS: Record<State, string[]> = {
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
    "small text",
    "too small",
    "zoom in",
  ],
  smaller_text: [
    "smaller text",
    "text smaller",
    "reduce font",
    "too big",
    "text too big",
  ],
  hide_sidebars: [
    "hide sidebar",
    "remove sidebar",
    "hide the sidebar",
    "get rid of the sidebar",
    "too much on the sides",
    "overwhelming",
    "overwhelmed",
    "too much going on",
    "too cluttered",
    "too busy",
    "strip everything",
    "strip it down",
    "chaos",
    "chaotic",
    "too much",
  ],
  hide_nav: [
    "hide the nav",
    "hide navigation",
    "remove the nav",
    "hide the menu",
    "remove the menu",
  ],
  hide_promo: [
    "hide the ads",
    "remove ads",
    "hide promotions",
    "hide deals",
    "no ads",
    "get rid of ads",
  ],
  dim_sidebars: [
    "dim the sidebar",
    "fade the sidebar",
    "dim the sides",
    "tone down the sides",
    "less on the sides",
    "can't focus",
    "cannot focus",
    "hard to focus",
    "distracted",
    "losing focus",
    "can't concentrate",
  ],
  spotlight_main: [
    "just show the article",
    "just the article",
    "focus on the main",
    "just the content",
    "spotlight",
    "focus on what i'm reading",
    "dim everything else",
    "everything else is distracting",
  ],
  single_column: [
    "single column",
    "one column",
    "center the content",
    "center it",
    "collapse",
    "just the main column",
  ],
  warm_bg: [
    "warm",
    "cream",
    "warmer",
    "softer colors",
    "easy on my eyes",
    "less white",
    "yellow background",
    "softer background",
    "too bright",
    "too white",
  ],
  dark_bg: [
    "dark mode",
    "dark background",
    "darker",
    "night mode",
    "dim the screen",
    "dim screen",
    "night",
  ],
  kill_animations: [
    "stop the flashing",
    "stop flashing",
    "too much movement",
    "kill animations",
    "stop animations",
    "stop moving",
    "everything is moving",
    "blinking",
    "dizzy",
    "nauseating",
    "hurts my eyes",
  ],
  more_spacing: [
    "more spacing",
    "more space",
    "more line spacing",
    "crowded",
    "too crowded",
    "lines too close",
    "spread out",
    "breathe",
  ],
  dyslexic_font: [
    "dyslexia",
    "dyslexic",
    "dyslexic font",
    "open dyslexic",
    "accessibility font",
    "letters moving",
    "letters jumping",
  ],
  clean_font: [
    "cleaner font",
    "simpler font",
    "plain font",
    "different font",
    "easier font",
  ],
  flow_mode: ["flow mode", "reading mode", "deep read", "study mode", "research mode"],
  scan_mode: ["scan mode", "scanning mode", "skim mode"],
  rest_mode: [
    "rest mode",
    "tired",
    "exhausted",
    "low energy",
    "gentle",
    "relax mode",
    "softer",
  ],
};

const STATE_PLANS: Record<State, Plan> = {
  bigger_text: {
    reason_short: "Text enlarged",
    intensity: 0.5,
    actions: [
      { layer: "typographic", type: "setFontScale", value: 1.6 },
      { layer: "typographic", type: "setLineHeight", value: 1.8 },
    ],
  },
  smaller_text: {
    reason_short: "Text reduced",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setFontScale", value: 0.9 },
    ],
  },
  hide_sidebars: {
    reason_short: "Sidebars removed",
    intensity: 0.7,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
    ],
  },
  hide_nav: {
    reason_short: "Navigation hidden",
    intensity: 0.4,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='nav']" },
    ],
  },
  hide_promo: {
    reason_short: "Ads and promos removed",
    intensity: 0.4,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
    ],
  },
  dim_sidebars: {
    reason_short: "Periphery dimmed",
    intensity: 0.5,
    actions: [
      { layer: "structural", type: "dim", selector: "[data-an-role='aside-left']", opacity: 0.08 },
      { layer: "structural", type: "dim", selector: "[data-an-role='aside-right']", opacity: 0.08 },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.15 },
      { layer: "structural", type: "dim", selector: "[data-an-role='footer']", opacity: 0.08 },
    ],
  },
  spotlight_main: {
    reason_short: "Spotlighting main content",
    intensity: 0.6,
    actions: [
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
    ],
  },
  single_column: {
    reason_short: "Collapsed to single column",
    intensity: 0.5,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
    ],
  },
  warm_bg: {
    reason_short: "Background warmed",
    intensity: 0.3,
    actions: [
      { layer: "attentional", type: "setBackground", color: "warm" },
    ],
  },
  dark_bg: {
    reason_short: "Dark mode enabled",
    intensity: 0.5,
    actions: [
      { layer: "attentional", type: "setBackground", color: "dark" },
    ],
  },
  kill_animations: {
    reason_short: "Animations stopped",
    intensity: 0.6,
    actions: [
      { layer: "structural", type: "killAnimations" },
    ],
  },
  more_spacing: {
    reason_short: "More breathing room added",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setLineHeight", value: 2.0 },
      { layer: "typographic", type: "setLetterSpacing", value: 0.04 },
    ],
  },
  dyslexic_font: {
    reason_short: "Dyslexia-friendly font applied",
    intensity: 0.5,
    actions: [
      { layer: "typographic", type: "setFontFamily", color: "dyslexic" },
      { layer: "typographic", type: "setLetterSpacing", value: 0.05 },
      { layer: "typographic", type: "setLineHeight", value: 1.8 },
    ],
  },
  clean_font: {
    reason_short: "Switched to clean font",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setFontFamily", color: "clean" },
    ],
  },
  flow_mode: {
    reason_short: "Flow mode — deep reading",
    intensity: 0.85,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.1 },
      { layer: "structural", type: "dim", selector: "[data-an-role='footer']", opacity: 0.1 },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
      { layer: "typographic", type: "setFontScale", value: 1.5 },
      { layer: "typographic", type: "setMaxWidth", value: 660 },
      { layer: "typographic", type: "setLineHeight", value: 1.9 },
      { layer: "typographic", type: "setFontFamily", color: "clean" },
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
      { layer: "attentional", type: "setBackground", color: "warm" },
    ],
  },
  scan_mode: {
    reason_short: "Scan mode — quick overview",
    intensity: 0.6,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
      { layer: "typographic", type: "setFontScale", value: 1.2 },
      { layer: "typographic", type: "setLetterSpacing", value: 0.03 },
      { layer: "typographic", type: "setFontFamily", color: "clean" },
    ],
  },
  rest_mode: {
    reason_short: "Rest mode — soft and slow",
    intensity: 0.9,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='footer']" },
      { layer: "structural", type: "dim", selector: "[data-an-role='nav']", opacity: 0.08 },
      { layer: "structural", type: "killAnimations" },
      { layer: "typographic", type: "setFontScale", value: 1.7 },
      { layer: "typographic", type: "setLineHeight", value: 2.0 },
      { layer: "typographic", type: "setLetterSpacing", value: 0.04 },
      { layer: "attentional", type: "setBackground", color: "warm" },
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
      const key = `${a.layer}:${a.type}:${a.selector ?? a.color ?? ""}`;
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
      reason_short: "Didn't catch a specific change — try being explicit",
      intensity: 0,
      actions: [],
    };
  }
  return mergePlans(states.map((s) => STATE_PLANS[s]));
}

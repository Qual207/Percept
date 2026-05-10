import type { Plan } from "../types/intent.js";

/**
 * Surgical keyword-based fallback intent parser.
 *
 * Each state maps ONLY to the actions directly relevant to that request.
 * States compose additively — "overwhelmed and can't read" → overloaded + bigger_text.
 * The fallback never adds unrequested actions.
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
    reasoning: "The user is finding the text too small or hard to read. I'm targeting the global font scale and line height to make all text larger and more legible across the page.",
    intensity: 0.5,
    actions: [
      { layer: "typographic", type: "setFontScale", value: 1.6 },
      { layer: "typographic", type: "setLineHeight", value: 1.8 },
    ],
  },
  smaller_text: {
    reason_short: "Text reduced",
    reasoning: "The user wants text scaled down. I'm reducing the global font scale so more content fits comfortably on screen.",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setFontScale", value: 0.9 },
    ],
  },
  hide_sidebars: {
    reason_short: "Sidebars removed",
    reasoning: "The user is overwhelmed by too many elements competing for attention. I'm removing the left sidebar, right sidebar, and promotional banner — the three biggest sources of visual noise — so only the main content remains.",
    intensity: 0.7,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
    ],
  },
  hide_nav: {
    reason_short: "Navigation hidden",
    reasoning: "The user wants the navigation bar out of the way. I'm hiding the nav region to reduce the top-of-page clutter and give more vertical space to the content.",
    intensity: 0.4,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='nav']" },
    ],
  },
  hide_promo: {
    reason_short: "Ads and promos removed",
    reasoning: "The user is bothered by promotional content. I'm removing the promo banner, which is a high-distraction element designed to pull attention away from the main content.",
    intensity: 0.4,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='promo']" },
    ],
  },
  dim_sidebars: {
    reason_short: "Periphery dimmed — focus on main",
    reasoning: "The user is losing focus due to competing elements around the main content. I'm dimming the sidebars, navigation, and footer so they fade into the background without disappearing entirely.",
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
    reasoning: "The user wants to focus exclusively on the main content area. I'm applying a spotlight effect that brings the main region to full brightness while softly dimming everything else around it.",
    intensity: 0.6,
    actions: [
      { layer: "attentional", type: "spotlight", selector: "[data-an-role='main']" },
    ],
  },
  single_column: {
    reason_short: "Collapsed to single column",
    reasoning: "The user wants a simpler, more linear layout. I'm hiding the sidebars and centering the main content into a single readable column.",
    intensity: 0.5,
    actions: [
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-left']" },
      { layer: "structural", type: "hide", selector: "[data-an-role='aside-right']" },
      { layer: "structural", type: "centerMain", selector: "[data-an-role='main']" },
    ],
  },
  warm_bg: {
    reason_short: "Background warmed",
    reasoning: "The user finds the page too bright or harsh on the eyes. I'm applying a warm cream background to reduce the intensity of the white screen and ease eye strain.",
    intensity: 0.3,
    actions: [
      { layer: "attentional", type: "setBackground", color: "warm" },
    ],
  },
  dark_bg: {
    reason_short: "Dark mode enabled",
    reasoning: "The user wants a darker visual environment. I'm switching the background to dark mode to reduce overall screen brightness and glare.",
    intensity: 0.5,
    actions: [
      { layer: "attentional", type: "setBackground", color: "dark" },
    ],
  },
  kill_animations: {
    reason_short: "Animations stopped",
    reasoning: "The user is experiencing distress from movement on the page — flashing elements, animated banners, or blinking content. I'm stopping all CSS animations and transitions immediately.",
    intensity: 0.6,
    actions: [
      { layer: "structural", type: "killAnimations" },
    ],
  },
  more_spacing: {
    reason_short: "More breathing room added",
    reasoning: "The user finds the content too densely packed. I'm increasing line height and letter spacing globally so text has more room to breathe and is easier to track line by line.",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setLineHeight", value: 2.0 },
      { layer: "typographic", type: "setLetterSpacing", value: 0.04 },
    ],
  },
  dyslexic_font: {
    reason_short: "Dyslexia-friendly font applied",
    reasoning: "The user has indicated difficulty with standard fonts — letters may be moving or hard to distinguish. I'm switching to a dyslexia-friendly typeface with increased letter spacing and line height to improve character differentiation.",
    intensity: 0.5,
    actions: [
      { layer: "typographic", type: "setFontFamily", color: "dyslexic" },
      { layer: "typographic", type: "setLetterSpacing", value: 0.05 },
      { layer: "typographic", type: "setLineHeight", value: 1.8 },
    ],
  },
  clean_font: {
    reason_short: "Switched to clean font",
    reasoning: "The user wants a simpler, less decorative typeface. I'm switching to a clean sans-serif font that reduces visual noise from letter shapes.",
    intensity: 0.3,
    actions: [
      { layer: "typographic", type: "setFontFamily", color: "clean" },
    ],
  },
  // Named modes — full presets only when explicitly requested
  flow_mode: {
    reason_short: "Flow mode — deep reading",
    reasoning: "The user is entering a deep reading or study session. I'm applying the full flow mode preset: hiding all sidebars and promotions, centering the main column at a comfortable width, scaling up the font, and warming the background for sustained focus.",
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
    reasoning: "The user wants to scan the page quickly without deep reading. I'm hiding sidebars, centering the content, and applying a slightly larger font with generous letter spacing to make headlines and key points easy to skim.",
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
    reasoning: "The user is tired or in a low-energy state and needs the page to feel gentle. I'm removing almost all surrounding elements, stopping animations, maximizing font size and spacing, and applying a warm background so the reading experience is as calm as possible.",
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
  const reasonings: string[] = [];
  for (const p of plans) {
    intensity = Math.max(intensity, p.intensity);
    reasons.push(p.reason_short);
    if (p.reasoning) reasonings.push(p.reasoning);
    for (const a of p.actions) {
      const key = `${a.layer}:${a.type}:${a.selector ?? a.color ?? ""}`;
      map.set(key, a);
    }
  }
  return {
    reason_short: reasons.join(" + "),
    reasoning: reasonings.join(" "),
    intensity,
    actions: Array.from(map.values()),
  };
}

export function fallbackPlan(transcript: string): Plan {
  const states = detectStates(transcript);
  if (states.length === 0) {
    return {
      reason_short: "Didn't catch a specific change — try being explicit",
      reasoning: `I heard "${transcript}" but couldn't match it to a known action. Try phrases like "make the text bigger", "hide the sidebars", or "flow mode".`,
      intensity: 0,
      actions: [],
    };
  }
  return mergePlans(states.map((s) => STATE_PLANS[s]));
}

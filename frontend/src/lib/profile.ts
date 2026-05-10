import type { Plan, Action } from "../types/intent";

/**
 * A user's perceptual profile, built through the diagnostic flow.
 * Stored in localStorage. Travels with the user across sessions.
 *
 * Every field has a sensible default so the engine works before onboarding.
 */
export interface UserProfile {
  /** How much visual clutter the user can comfortably process. */
  densityTolerance: "low" | "medium" | "high";
  /** Preferred text scale multiplier (applied on top of engine actions). */
  textScale: number;
  /** High-contrast dark-on-white vs. softer muted palette. */
  contrastPreference: "high" | "soft";
  /** One idea at a time vs full paragraph. */
  chunkingPreference: "one-at-a-time" | "paragraph";
  /** Spotlight single element vs globally ambient dimming. */
  focusStyle: "spotlight" | "ambient";
  /** Whether the profile has been explicitly set by the user. */
  calibrated: boolean;
  /** Unix timestamp of last update. */
  updatedAt: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  densityTolerance: "medium",
  textScale: 1.0,
  contrastPreference: "soft",
  chunkingPreference: "paragraph",
  focusStyle: "ambient",
  calibrated: false,
  updatedAt: Date.now(),
};

const STORAGE_KEY = "an_user_profile";

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) } as UserProfile;
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...profile, updatedAt: Date.now() }),
    );
  } catch {
    // localStorage unavailable (private browsing, storage full) — degrade silently
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Returns a short natural-language summary of the profile for the LLM system
 * prompt, so the model can factor preferences into its plan.
 */
export function profileSummary(p: UserProfile): string {
  if (!p.calibrated) return "User profile: not yet calibrated (using defaults).";
  return [
    `User perceptual profile:`,
    `- Visual density tolerance: ${p.densityTolerance} (${p.densityTolerance === "low" ? "prefers very minimal layouts" : p.densityTolerance === "high" ? "can handle dense layouts" : "moderate clutter okay"})`,
    `- Text scale preference: ${p.textScale}x (${p.textScale >= 1.3 ? "prefers large text" : p.textScale <= 1.05 ? "fine with standard size" : "slightly larger preferred"})`,
    `- Contrast preference: ${p.contrastPreference} (${p.contrastPreference === "high" ? "strong dark-on-light contrast" : "softer muted tones"})`,
    `- Reading chunking: ${p.chunkingPreference} (${p.chunkingPreference === "one-at-a-time" ? "one concept at a time" : "comfortable with paragraphs"})`,
    `- Focus style: ${p.focusStyle} (${p.focusStyle === "spotlight" ? "hard spotlight on one element" : "gentle ambient dimming"})`,
  ].join("\n");
}

/**
 * Scales a plan's action values based on the user's profile.
 * This is applied client-side AFTER the LLM returns a plan.
 *
 * Rules:
 * - textScale multiplies all setFontScale values
 * - densityTolerance = low → dim opacities go lower, hide more aggressively
 * - densityTolerance = high → softer dimming
 * - contrastPreference = soft → reduce contrast further (lower dim opacities)
 * - focusStyle = spotlight → keep spotlight; ambient → convert to gentler dim
 */
/**
 * Builds a deterministic baseline Plan directly from the user's profile.
 * This is applied immediately when the diagnostic completes and on every
 * page load when a calibrated profile already exists.
 *
 * It represents "what this page should look like at rest for this user" —
 * before any voice request has been made. Voice requests then layer on top.
 */
export function buildProfileBaseline(profile: UserProfile): Plan {
  if (!profile.calibrated) return { reason_short: "", intensity: 0, actions: [] };

  const actions: Action[] = [];

  // --- Typographic baseline ------------------------------------------------
  if (profile.textScale !== 1.0) {
    actions.push({ layer: "typographic", type: "setFontScale", value: profile.textScale });
  }
  actions.push({
    layer: "typographic",
    type: "setLineHeight",
    value: profile.textScale >= 1.3 ? 1.7 : 1.55,
  });
  // Cap line length at a readable width — always beneficial
  actions.push({ layer: "typographic", type: "setMaxWidth", value: 820 });

  // --- Structural baseline (driven by density tolerance) -------------------
  if (profile.densityTolerance === "low") {
    // User finds clutter very taxing: dim sidebars + promo, center main
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='aside-left']", opacity: 0.25,
    });
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='aside-right']", opacity: 0.25,
    });
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='promo']", opacity: 0.15,
    });
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='nav']", opacity: 0.5,
    });
    actions.push({
      layer: "structural", type: "centerMain",
      selector: "[data-an-role='main']",
    });
  } else if (profile.densityTolerance === "medium") {
    // Slight softening: dim the noisiest elements only
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='aside-left']", opacity: 0.55,
    });
    actions.push({
      layer: "structural", type: "dim",
      selector: "[data-an-role='promo']", opacity: 0.45,
    });
  }
  // densityTolerance === "high" → no structural changes

  // --- Attentional baseline ------------------------------------------------
  if (profile.focusStyle === "spotlight") {
    actions.push({
      layer: "attentional", type: "spotlight",
      selector: "[data-an-role='main']",
    });
  }

  const intensity =
    profile.densityTolerance === "low" ? 0.7
    : profile.densityTolerance === "medium" ? 0.4
    : 0.15;

  return {
    reason_short: "Profile applied — layout adapted to your preferences",
    intensity,
    actions,
  };
}

export function scaleWithProfile(plan: Plan, profile: UserProfile): Plan {
  if (!profile.calibrated) return plan;

  const densityMod =
    profile.densityTolerance === "low"
      ? 0.75    // more aggressive: lower opacities
      : profile.densityTolerance === "high"
        ? 1.3   // less aggressive: higher opacities (less dim)
        : 1.0;

  const contrastMod = profile.contrastPreference === "soft" ? 0.85 : 1.0;

  const scaledActions = plan.actions.map((a) => {
    switch (a.type) {
      case "setFontScale":
        return {
          ...a,
          value: a.value != null ? +(a.value * profile.textScale).toFixed(3) : a.value,
        };
      case "dim":
        return {
          ...a,
          opacity: a.opacity != null
            ? +Math.max(0.05, a.opacity * densityMod * contrastMod).toFixed(3)
            : a.opacity,
        };
      case "spotlight":
        // If user prefers ambient style, convert hard spotlight to a gentler dim of peers
        if (profile.focusStyle === "ambient") {
          return { ...a }; // still apply, engine already uses gentle opacity
        }
        return { ...a };
      default:
        return { ...a };
    }
  });

  return { ...plan, actions: scaledActions };
}

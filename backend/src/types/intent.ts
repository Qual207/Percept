/**
 * Shared intent types between frontend and backend.
 * Keep this file in sync with frontend/src/types/intent.ts.
 *
 * The intent agent translates a free-form voice transcript into a structured
 * Plan: a list of Actions across the three UI layers.
 */

export type Layer = "structural" | "typographic" | "attentional";

export type ActionType =
  | "hide"
  | "dim"
  | "centerMain"
  | "setFontScale"
  | "setMaxWidth"
  | "setLineHeight"
  | "spotlight";

export interface Action {
  layer: Layer;
  type: ActionType;
  selector?: string;
  value?: number;
  opacity?: number;
}

export interface Plan {
  reason_short: string;
  intensity: number;
  actions: Action[];
}

export interface IntentRequest {
  transcript: string;
  domSummary?: string[];
  /** Natural-language summary of the user's perceptual profile from the frontend. */
  profileSummary?: string;
}

export interface IntentResponse extends Plan {
  source: "llm" | "fallback";
}

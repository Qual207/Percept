/**
 * Shared intent types between frontend and backend.
 * Keep this file in sync with backend/src/types/intent.ts.
 */

export type Layer = "structural" | "typographic" | "attentional";

export type ActionType =
  | "hide"
  | "dim"
  | "centerMain"
  | "setFontScale"
  | "setMaxWidth"
  | "setLineHeight"
  | "setLetterSpacing"
  | "scaleElement"
  | "spotlight"
  | "setBackground"
  | "setFontFamily"
  | "killAnimations";

export interface Action {
  layer: Layer;
  type: ActionType;
  selector?: string;
  value?: number;
  opacity?: number;
  color?: string;
}

export interface Plan {
  reason_short: string;
  /** Step-by-step thinking from the LLM: what it understood, which elements it targeted, why. */
  reasoning?: string;
  intensity: number;
  actions: Action[];
}

export interface PageElement {
  label: string;
  selector: string;
  type: "landmark" | "heading" | "image" | "price" | "button" | "text";
}

export interface IntentResponse extends Plan {
  source: "llm" | "fallback";
}

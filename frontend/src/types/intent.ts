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

export interface IntentResponse extends Plan {
  source: "llm" | "fallback";
}

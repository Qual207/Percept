import type { IntentResponse } from "../types/intent";
import { fallbackPlan } from "./fallbackIntent";

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:3001";

/**
 * Returns the current top-level page landmarks for the LLM's context.
 * The LLM uses this to know which selectors are safe to act on.
 */
function summarizeDom(): string[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>("[data-an-role]"))
    .map((el) => el.getAttribute("data-an-role") ?? "")
    .filter(Boolean);
}

export async function requestIntent(
  transcript: string,
  signal?: AbortSignal,
): Promise<IntentResponse> {
  const domSummary = summarizeDom();

  try {
    const res = await fetch(`${BACKEND_URL}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, domSummary }),
      signal,
    });
    if (!res.ok) throw new Error(`backend_${res.status}`);
    const json = (await res.json()) as IntentResponse;
    return json;
  } catch (err) {
    console.warn("[intent] backend unreachable, using local fallback:", err);
    return { ...fallbackPlan(transcript), source: "fallback" };
  }
}

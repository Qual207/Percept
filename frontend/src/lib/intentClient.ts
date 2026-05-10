import type { IntentResponse } from "../types/intent";
import type { UserProfile } from "./profile";
import { fallbackPlan } from "./fallbackIntent";
import { scaleWithProfile, profileSummary } from "./profile";

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:3001";

// Roles that belong to our own overlay UI, not the host page content
const OVERLAY_ROLES = new Set(["mic-overlay", "toaster"]);

function summarizeDom(): string[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>("[data-an-role]"))
    .map((el) => el.getAttribute("data-an-role") ?? "")
    .filter((r) => r && !OVERLAY_ROLES.has(r));
}

export async function requestIntent(
  transcript: string,
  profile: UserProfile,
  signal?: AbortSignal,
): Promise<IntentResponse> {
  const domSummary = summarizeDom();

  try {
    const res = await fetch(`${BACKEND_URL}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        domSummary,
        profileSummary: profileSummary(profile),
      }),
      signal,
    });
    if (!res.ok) throw new Error(`backend_${res.status}`);
    const json = (await res.json()) as IntentResponse;
    // Scale actions by profile preferences before handing to the engine
    return { ...scaleWithProfile(json, profile), source: json.source };
  } catch (err) {
    console.warn("[intent] backend unreachable, using local fallback:", err);
    const plan = fallbackPlan(transcript);
    return { ...scaleWithProfile(plan, profile), source: "fallback" };
  }
}

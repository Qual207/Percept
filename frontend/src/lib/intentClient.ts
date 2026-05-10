import type { IntentResponse } from "../types/intent";
import type { UserProfile } from "./profile";
import { fallbackPlan } from "./fallbackIntent";
import { crawlPage } from "./domCrawler";
import { scaleWithProfile, profileSummary } from "./profile";

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:3001";

export async function requestIntent(
  transcript: string,
  profile: UserProfile,
  signal?: AbortSignal,
): Promise<IntentResponse> {
  const pageElements = crawlPage();

  try {
    console.log(`[intent] → POST ${BACKEND_URL}/api/intent  (transcript: "${transcript}")`);
    const res = await fetch(`${BACKEND_URL}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        pageElements,
        profileSummary: profileSummary(profile),
      }),
      signal,
    });
    if (!res.ok) throw new Error(`backend_${res.status}`);
    const json = (await res.json()) as IntentResponse;
    console.log(`[intent] ← ${json.source ?? "?"}  reason: "${json.reason_short}"`);
    return { ...scaleWithProfile(json, profile), source: json.source };
  } catch (err) {
    // Log VERY visibly — in dev this is almost always (a) backend down,
    // (b) wrong port, or (c) CORS rejecting the origin.
    console.error(
      "[intent] FAILED to reach backend — falling back to keyword parser.\n" +
      `  URL:    ${BACKEND_URL}/api/intent\n` +
      `  Origin: ${typeof window !== "undefined" ? window.location.origin : "unknown"}\n` +
      `  Error:  ${err instanceof Error ? err.message : String(err)}\n` +
      `  Tip:    Open Network tab — if you see a CORS error, the backend doesn't allow this origin.`,
      err,
    );
    const plan = fallbackPlan(transcript);
    return { ...scaleWithProfile(plan, profile), source: "fallback" };
  }
}

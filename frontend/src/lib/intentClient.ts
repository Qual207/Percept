import type { IntentResponse } from "../types/intent";
import { fallbackPlan } from "./fallbackIntent";
import { crawlPage } from "./domCrawler";

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:3001";

export async function requestIntent(
  transcript: string,
  signal?: AbortSignal,
): Promise<IntentResponse> {
  const pageElements = crawlPage();

  try {
    const res = await fetch(`${BACKEND_URL}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, pageElements }),
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

import type { Request, Response } from "express";
import type { IntentRequest, IntentResponse } from "../types/intent.js";
import { planFromOpenAI } from "../lib/openai.js";
import { fallbackPlan } from "../lib/fallback.js";

export async function intentHandler(req: Request, res: Response) {
  const body = req.body as IntentRequest;
  const transcript = (body?.transcript ?? "").trim();
  const domSummary = body?.domSummary;
  const profileSummary = body?.profileSummary;

  if (!transcript) {
    return res.status(400).json({ error: "transcript is required" });
  }

  console.log(`[intent] transcript: "${transcript}" | profile: ${profileSummary ? "calibrated" : "default"} | landmarks: [${(domSummary ?? []).join(", ")}]`);

  const llm = await planFromOpenAI(transcript, domSummary, profileSummary);
  if (llm) {
    console.log(`[intent] OpenAI → ${llm.actions.length} actions | reason: "${llm.reason_short}"`);
    const out: IntentResponse = { ...llm, source: "llm" };
    return res.json(out);
  }

  console.log("[intent] OpenAI unavailable — using keyword fallback");
  const fb = fallbackPlan(transcript);
  const out: IntentResponse = { ...fb, source: "fallback" };
  return res.json(out);
}

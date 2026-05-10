import type { Request, Response } from "express";
import type { IntentRequest, IntentResponse } from "../types/intent.js";
import { planFromOpenAI } from "../lib/openai.js";
import { fallbackPlan } from "../lib/fallback.js";

export async function intentHandler(req: Request, res: Response) {
  const body = req.body as IntentRequest;
  const transcript = (body?.transcript ?? "").trim();
  const pageElements = body?.pageElements;

  if (!transcript) {
    return res.status(400).json({ error: "transcript is required" });
  }

  const llm = await planFromOpenAI(transcript, pageElements);
  if (llm) {
    const out: IntentResponse = { ...llm, source: "llm" };
    return res.json(out);
  }

  const fb = fallbackPlan(transcript);
  const out: IntentResponse = { ...fb, source: "fallback" };
  return res.json(out);
}

import OpenAI from "openai";
import type { Plan } from "../types/intent.js";

/**
 * Calls OpenAI with strict JSON-schema structured outputs.
 * Returns null if the API key is missing or the call fails — the caller
 * should fall back to the keyword-based parser in that case.
 *
 * Model can be overridden via OPENAI_MODEL env var. Default is gpt-4o-mini
 * which is fast, cheap, and supports response_format json_schema strict.
 */

const SYSTEM_PROMPT = `You are an adaptive UI agent for users with cognitive accessibility needs (ADHD, dyslexia, sensory sensitivity).
A user has spoken a free-form request describing how they feel about the current webpage.
Your job is to translate that request into a list of UI actions across three layers:

1. STRUCTURAL: hide / dim / center elements, reduce visual clutter.
2. TYPOGRAPHIC: scale font, set line height, cap line length.
3. ATTENTIONAL: spotlight the main content, dim the periphery.

Principles:
- Be GRADUAL. Prefer dim over hide. Scale changes by intensity (0..1).
- Be NON-DESTRUCTIVE. Don't remove core functionality.
- Prefer the data-an-role attribute selectors when available:
    [data-an-role='main'], [data-an-role='nav'], [data-an-role='aside-left'],
    [data-an-role='aside-right'], [data-an-role='promo'], [data-an-role='footer'].
- Reason concisely (one short sentence) for the user-facing toast.
- For action fields you don't need, use null (not omitted).

Return only the structured plan via the JSON schema.`;

/**
 * OpenAI strict mode requires every property to appear in `required`,
 * and optional fields are expressed as a union with null. The frontend's
 * action dispatcher already handles null/undefined gracefully.
 */
const PLAN_SCHEMA = {
  name: "ui_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      reason_short: {
        type: "string",
        description: "Short user-facing rationale (max ~60 chars).",
      },
      intensity: {
        type: "number",
        description: "Overall intensity of the adaptation, 0..1.",
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            layer: {
              type: "string",
              enum: ["structural", "typographic", "attentional"],
            },
            type: {
              type: "string",
              enum: [
                "hide",
                "dim",
                "centerMain",
                "setFontScale",
                "setMaxWidth",
                "setLineHeight",
                "spotlight",
              ],
            },
            selector: { type: ["string", "null"] },
            value: { type: ["number", "null"] },
            opacity: { type: ["number", "null"] },
          },
          required: ["layer", "type", "selector", "value", "opacity"],
        },
      },
    },
    required: ["reason_short", "intensity", "actions"],
  },
} as const;

function isKeyMissing(): boolean {
  const k = process.env.OPENAI_API_KEY;
  return !k || k.startsWith("sk-...");
}

export async function planFromOpenAI(
  transcript: string,
  domSummary: string[] | undefined,
): Promise<Plan | null> {
  if (isKeyMissing()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const userMessage = [
    `Transcript: "${transcript}"`,
    domSummary && domSummary.length > 0
      ? `Page landmarks present: ${domSummary.join(", ")}`
      : "Page landmarks: unknown",
  ].join("\n\n");

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_schema", json_schema: PLAN_SCHEMA },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Plan;
    return parsed;
  } catch (err) {
    console.error("[openai] error:", err);
    return null;
  }
}

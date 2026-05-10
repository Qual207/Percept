import OpenAI from "openai";
import type { Plan, PageElement } from "../types/intent.js";

/**
 * Calls OpenAI with strict JSON-schema structured outputs.
 * Returns null if the API key is missing or the call fails — the caller
 * should fall back to the keyword-based parser in that case.
 */

const SYSTEM_PROMPT = `You are a surgical UI accessibility agent. The user speaks or types a specific request about a webpage.

You will receive:
1. The user's transcript
2. A catalog of targetable page elements, each with a human-readable label and a CSS selector

Your job: translate ONLY the user's request into the minimum set of actions needed. Match user intent to the best element from the catalog.

RULE 1 — BE LITERAL. Only change what the user asked for. "Make the price bigger" → only scaleElement on the price. Do NOT also hide sidebars or change backgrounds unless asked.

RULE 2 — USE THE MOST SPECIFIC SELECTOR. Prefer [data-an-id='...'] selectors (specific elements) over [data-an-role='...'] (broad regions) when the user names a specific thing (price, image, title, button).

RULE 3 — ACTIONS ARE ADDITIVE. Prior changes are already applied. Don't re-apply things not mentioned in this request.

AVAILABLE ACTIONS:
Layer "structural":
  - hide          selector required — completely remove element (use for "remove", "hide the X")
  - dim           selector + opacity 0.05–0.25 — fade element out (use for "dim", "tone down")
  - centerMain    selector required — collapse to single reading column
  - killAnimations — stop all movement

Layer "typographic":
  - setFontScale      value: root multiplier (e.g. 1.5) — scales ALL text globally (use for "make everything bigger", "larger text globally")
  - scaleElement      selector + value: multiplier on just that element (e.g. 2.0 = double) — USE THIS when user targets a specific element ("make the price bigger", "enlarge the title")
  - setMaxWidth       value: px reading width cap
  - setLineHeight     value: multiplier 1.6–2.0
  - setLetterSpacing  value: em 0.02–0.08
  - setFontFamily     color: "dyslexic" | "clean" | "default"

Layer "attentional":
  - spotlight     selector required — dim everything else, focus on one element
  - setBackground color: "warm" | "cream" | "dark" | "gray" | "white"

NAMED MODES — apply full preset only when user explicitly says the mode name:
  "flow mode"     → hide [data-an-role='aside-left'] + [data-an-role='aside-right'] + [data-an-role='promo'], dim [data-an-role='nav'] 0.1, centerMain [data-an-role='main'], setFontScale 1.5, setMaxWidth 660, setLineHeight 1.9, setBackground warm, spotlight [data-an-role='main']
  "scan mode"     → hide [data-an-role='aside-left'] + [data-an-role='aside-right'], centerMain [data-an-role='main'], setFontScale 1.2, setLetterSpacing 0.03, setFontFamily clean
  "rest mode"     → hide aside-left + aside-right + promo + footer, dim nav 0.08, setFontScale 1.6, setLineHeight 2.0, setBackground warm, setLetterSpacing 0.04, killAnimations

reason_short: one short sentence (max 60 chars) saying what changed.
reasoning: 2-3 sentences of step-by-step thinking, written as if thinking aloud:
  1. What the user is experiencing or requesting (interpret their words literally and emotionally).
  2. Which specific elements are relevant to their request and why.
  3. What you are changing and how it will help them.
  Be specific about element names. Write in present tense.
  Example: "The user wants the review text to be easier to read. I'm targeting the main content area since the reviews live there. I'll increase the font scale and line height to make the text larger and more scannable."
For unused action fields, use null.

Return only the structured plan.`;

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
      reasoning: {
        type: "string",
        description: "2-3 sentence step-by-step thinking: what the user wants, which elements are targeted, what will change and why.",
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
                "killAnimations",
                "setFontScale",
                "scaleElement",
                "setMaxWidth",
                "setLineHeight",
                "setLetterSpacing",
                "setFontFamily",
                "spotlight",
                "setBackground",
              ],
            },
            selector: { type: ["string", "null"] },
            value: { type: ["number", "null"] },
            opacity: { type: ["number", "null"] },
            color: { type: ["string", "null"] },
          },
          required: ["layer", "type", "selector", "value", "opacity", "color"],
        },
      },
    },
    required: ["reason_short", "reasoning", "intensity", "actions"],
  },
} as const;

function isKeyMissing(): boolean {
  const k = process.env.OPENAI_API_KEY;
  return !k || k.startsWith("sk-...");
}

function formatElementCatalog(elements: PageElement[]): string {
  if (elements.length === 0) return "Page elements: none detected";
  const lines = elements.map(
    (el) => `  - [${el.type}] ${el.label} → ${el.selector}`,
  );
  return `Page elements:\n${lines.join("\n")}`;
}

export async function planFromOpenAI(
  transcript: string,
  pageElements: PageElement[] | undefined,
  profileSummary?: string,
): Promise<Plan | null> {
  if (isKeyMissing()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const parts = [
    `Transcript: "${transcript}"`,
    formatElementCatalog(pageElements ?? []),
  ];
  if (profileSummary) parts.push(`User profile: ${profileSummary}`);
  const userMessage = parts.join("\n\n");

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

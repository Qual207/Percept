import { describe, it, expect } from "vitest";
import { detectStates, fallbackPlan } from "../lib/fallbackIntent";

describe("frontend fallback intent parser", () => {
  it("parses the canonical demo phrase", () => {
    const plan = fallbackPlan("this is too much, I can't focus");
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.reason_short).toBeTruthy();
  });

  it("detects 'bigger_text' on common phrasings", () => {
    expect(detectStates("make it bigger")).toContain("bigger_text");
    expect(detectStates("hard to read")).toContain("bigger_text");
  });

  it("only emits known action types", () => {
    const allowed = new Set([
      "hide", "dim", "centerMain",
      "setFontScale", "setMaxWidth", "setLineHeight",
      "spotlight",
    ]);
    for (const transcript of [
      "I'm overwhelmed",
      "I'm dizzy",
      "I can't focus",
      "make it bigger",
      "even simpler",
      "hello world",
    ]) {
      const plan = fallbackPlan(transcript);
      for (const a of plan.actions) expect(allowed.has(a.type)).toBe(true);
    }
  });
});

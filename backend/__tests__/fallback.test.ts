import { describe, it, expect } from "vitest";
import { detectStates, fallbackPlan } from "../src/lib/fallback.js";

describe("fallback intent parser", () => {
  describe("detectStates", () => {
    it("detects 'overloaded' from common phrases", () => {
      expect(detectStates("there's too much going on")).toContain("overloaded");
      expect(detectStates("I'm overwhelmed")).toContain("overloaded");
      expect(detectStates("this is so chaotic")).toContain("overloaded");
    });

    it("detects 'distracted'", () => {
      expect(detectStates("I can't focus")).toContain("distracted");
    });

    it("detects 'sensory_overload'", () => {
      expect(detectStates("I'm getting dizzy")).toContain("sensory_overload");
      expect(detectStates("the colors are too bright")).toContain("sensory_overload");
    });

    it("detects 'bigger_text'", () => {
      expect(detectStates("make the text bigger")).toContain("bigger_text");
      expect(detectStates("hard to read")).toContain("bigger_text");
    });

    it("returns empty for unrelated input", () => {
      expect(detectStates("what is the weather")).toEqual([]);
    });

    it("can detect multiple states in one transcript", () => {
      const states = detectStates("I'm overwhelmed and the text is hard to read");
      expect(states).toContain("overloaded");
      expect(states).toContain("bigger_text");
    });
  });

  describe("fallbackPlan", () => {
    it("returns a valid plan for the canonical demo phrase", () => {
      const plan = fallbackPlan("this is too much, I can't focus");
      expect(plan.actions.length).toBeGreaterThan(0);
      expect(plan.intensity).toBeGreaterThan(0);
      expect(plan.reason_short).toBeTruthy();
    });

    it("returns a soft default plan for unrecognized input", () => {
      const plan = fallbackPlan("hello world");
      expect(plan.actions.length).toBeGreaterThan(0);
      expect(plan.intensity).toBeLessThanOrEqual(0.5);
    });

    it("merges and deduplicates actions across detected states", () => {
      const plan = fallbackPlan("I'm overwhelmed and dizzy");
      const keys = plan.actions.map((a) => `${a.layer}:${a.type}:${a.selector ?? ""}`);
      const unique = new Set(keys);
      expect(keys.length).toBe(unique.size);
    });

    it("only emits known action types", () => {
      const plan = fallbackPlan("I'm overwhelmed");
      const allowed = new Set([
        "hide",
        "dim",
        "centerMain",
        "setFontScale",
        "setMaxWidth",
        "setLineHeight",
        "spotlight",
      ]);
      for (const a of plan.actions) expect(allowed.has(a.type)).toBe(true);
    });
  });
});

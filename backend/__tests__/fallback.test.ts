import { describe, it, expect } from "vitest";
import { detectStates, fallbackPlan } from "../src/lib/fallback.js";

describe("fallback intent parser", () => {
  describe("detectStates", () => {
    it("detects 'hide_sidebars' for overwhelmed/too-much phrases", () => {
      expect(detectStates("there's too much going on")).toContain("hide_sidebars");
      expect(detectStates("I'm overwhelmed")).toContain("hide_sidebars");
      expect(detectStates("this is so chaotic")).toContain("hide_sidebars");
    });

    it("detects 'dim_sidebars' for focus-loss phrases", () => {
      expect(detectStates("I can't focus")).toContain("dim_sidebars");
      expect(detectStates("I'm distracted")).toContain("dim_sidebars");
    });

    it("detects 'kill_animations' for sensory phrases", () => {
      expect(detectStates("I'm getting dizzy")).toContain("kill_animations");
      expect(detectStates("stop the flashing")).toContain("kill_animations");
    });

    it("detects 'warm_bg' for brightness sensitivity", () => {
      expect(detectStates("the colors are too bright")).toContain("warm_bg");
      expect(detectStates("too white")).toContain("warm_bg");
    });

    it("detects 'bigger_text' on common phrasings", () => {
      expect(detectStates("make it bigger")).toContain("bigger_text");
      expect(detectStates("hard to read")).toContain("bigger_text");
      expect(detectStates("text bigger")).toContain("bigger_text");
    });

    it("detects named modes", () => {
      expect(detectStates("flow mode")).toContain("flow_mode");
      expect(detectStates("scan mode")).toContain("scan_mode");
      expect(detectStates("rest mode")).toContain("rest_mode");
    });

    it("returns empty for unrelated input", () => {
      expect(detectStates("what is the weather")).toEqual([]);
    });

    it("can detect multiple states in one transcript", () => {
      const states = detectStates("I'm overwhelmed and the text is hard to read");
      expect(states).toContain("hide_sidebars");
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

    it("returns a reasoning string for known states", () => {
      const plan = fallbackPlan("I'm overwhelmed");
      expect(plan.reasoning).toBeTruthy();
      expect(typeof plan.reasoning).toBe("string");
    });

    it("returns a reasoning string for zero-match input", () => {
      const plan = fallbackPlan("hello world");
      expect(plan.reasoning).toBeTruthy();
      expect(plan.reason_short).toBeTruthy();
      // Surgical design: zero-match returns 0 actions (no guessing)
      expect(plan.actions.length).toBe(0);
    });

    it("merges and deduplicates actions across detected states", () => {
      const plan = fallbackPlan("I'm overwhelmed and dizzy");
      const keys = plan.actions.map((a) => `${a.layer}:${a.type}:${a.selector ?? a.color ?? ""}`);
      const unique = new Set(keys);
      expect(keys.length).toBe(unique.size);
    });

    it("only emits known action types", () => {
      const allowed = new Set([
        "hide", "dim", "centerMain", "killAnimations",
        "setFontScale", "scaleElement", "setMaxWidth", "setLineHeight",
        "setLetterSpacing", "setFontFamily", "spotlight", "setBackground",
      ]);
      const transcripts = [
        "I'm overwhelmed",
        "I'm dizzy",
        "I can't focus",
        "make it bigger",
        "flow mode",
        "hello world",
      ];
      for (const t of transcripts) {
        const plan = fallbackPlan(t);
        for (const a of plan.actions) expect(allowed.has(a.type)).toBe(true);
      }
    });
  });
});

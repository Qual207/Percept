import { describe, it, expect, beforeEach } from "vitest";
import { applyPlan, undoLast, reset, appliedBatchCount, __resetStateForTests } from "../lib/engine";
import type { Plan } from "../types/intent";

function setupDom() {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  document.body.innerHTML = `
    <header data-an-role="nav" id="nav">NAV</header>
    <aside data-an-role="aside-left" id="left">LEFT</aside>
    <main data-an-role="main" id="main">MAIN</main>
    <aside data-an-role="aside-right" id="right">RIGHT</aside>
  `;
}

describe("engine", () => {
  beforeEach(() => {
    __resetStateForTests();
    setupDom();
  });

  it("applies hide and undoes cleanly", () => {
    const plan: Plan = {
      reason_short: "test",
      intensity: 0.5,
      actions: [{ layer: "structural", type: "hide", selector: "#left" }],
    };
    applyPlan(plan);
    expect(document.getElementById("left")?.classList.contains("an-hidden")).toBe(true);
    undoLast();
    expect(document.getElementById("left")?.classList.contains("an-hidden")).toBe(false);
  });

  it("applies dim with custom opacity and undoes cleanly", () => {
    applyPlan({
      reason_short: "test",
      intensity: 0.5,
      actions: [{ layer: "structural", type: "dim", selector: "#nav", opacity: 0.2 }],
    });
    const el = document.getElementById("nav")!;
    expect(el.classList.contains("an-dim")).toBe(true);
    expect(el.style.getPropertyValue("--an-dim-opacity")).toBe("0.2");
    reset();
    expect(el.classList.contains("an-dim")).toBe(false);
    expect(el.style.getPropertyValue("--an-dim-opacity")).toBe("");
  });

  it("writes typographic CSS variables on root and restores on undo", () => {
    applyPlan({
      reason_short: "test",
      intensity: 0.5,
      actions: [
        { layer: "typographic", type: "setFontScale", value: 1.3 },
        { layer: "typographic", type: "setMaxWidth", value: 720 },
        { layer: "typographic", type: "setLineHeight", value: 1.7 },
      ],
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--an-font-scale")).toBe("1.3");
    expect(root.style.getPropertyValue("--an-max-width")).toBe("720px");
    expect(root.style.getPropertyValue("--an-line-height")).toBe("1.7");
    undoLast();
    expect(root.style.getPropertyValue("--an-font-scale")).toBe("");
    expect(root.style.getPropertyValue("--an-max-width")).toBe("");
    expect(root.style.getPropertyValue("--an-line-height")).toBe("");
  });

  it("spotlight focuses target and dims siblings", () => {
    applyPlan({
      reason_short: "test",
      intensity: 0.5,
      actions: [{ layer: "attentional", type: "spotlight", selector: "#main" }],
    });
    expect(document.getElementById("main")?.classList.contains("an-spotlight")).toBe(true);
    expect(document.getElementById("nav")?.classList.contains("an-dim")).toBe(true);
    expect(document.getElementById("right")?.classList.contains("an-dim")).toBe(true);
  });

  it("reset() unwinds multiple batches in reverse order", () => {
    const planA: Plan = {
      reason_short: "a",
      intensity: 0.5,
      actions: [{ layer: "structural", type: "hide", selector: "#left" }],
    };
    const planB: Plan = {
      reason_short: "b",
      intensity: 0.5,
      actions: [{ layer: "typographic", type: "setFontScale", value: 1.4 }],
    };
    applyPlan(planA);
    applyPlan(planB);
    expect(appliedBatchCount()).toBe(2);
    reset();
    expect(appliedBatchCount()).toBe(0);
    expect(document.getElementById("left")?.classList.contains("an-hidden")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--an-font-scale")).toBe("");
  });

  it("toggles the global an-active class only while batches exist", () => {
    expect(document.documentElement.classList.contains("an-active")).toBe(false);
    applyPlan({
      reason_short: "x",
      intensity: 0.5,
      actions: [{ layer: "typographic", type: "setFontScale", value: 1.2 }],
    });
    expect(document.documentElement.classList.contains("an-active")).toBe(true);
    reset();
    expect(document.documentElement.classList.contains("an-active")).toBe(false);
  });

  it("handles unknown selectors gracefully", () => {
    applyPlan({
      reason_short: "x",
      intensity: 0.5,
      actions: [{ layer: "structural", type: "hide", selector: "#nope" }],
    });
    expect(appliedBatchCount()).toBe(1);
    reset();
    expect(appliedBatchCount()).toBe(0);
  });
});

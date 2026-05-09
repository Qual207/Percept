import type { Action } from "../types/intent";

/**
 * Action catalog. Each function returns an `undo` closure.
 * The engine pushes these onto a stack so Reset = pop-everything.
 *
 * All actions are non-destructive: they snapshot whatever they touch
 * before mutating, and the undo restores the snapshot exactly.
 */

export type Undo = () => void;
const NOOP: Undo = () => {};

function $$(selector: string): HTMLElement[] {
  if (!selector || typeof document === "undefined") return [];
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(selector));
  } catch {
    return [];
  }
}

function snapshotInline(el: HTMLElement, prop: string): () => void {
  const prev = el.style.getPropertyValue(prop);
  const priority = el.style.getPropertyPriority(prop);
  return () => {
    if (prev) el.style.setProperty(prop, prev, priority);
    else el.style.removeProperty(prop);
  };
}

function addClass(el: HTMLElement, cls: string): Undo {
  const had = el.classList.contains(cls);
  if (!had) el.classList.add(cls);
  return () => {
    if (!had) el.classList.remove(cls);
  };
}

// --- Structural --------------------------------------------------------------

function hide(selector: string): Undo {
  const undos = $$(selector).map((el) => addClass(el, "an-hidden"));
  return () => undos.forEach((u) => u());
}

function dim(selector: string, opacity = 0.3): Undo {
  const undos: Undo[] = [];
  for (const el of $$(selector)) {
    const restoreOpacity = snapshotInline(el, "--an-dim-opacity");
    el.style.setProperty("--an-dim-opacity", String(opacity));
    const restoreClass = addClass(el, "an-dim");
    undos.push(() => {
      restoreClass();
      restoreOpacity();
    });
  }
  return () => undos.forEach((u) => u());
}

function centerMain(selector: string): Undo {
  const undos = $$(selector).map((el) => addClass(el, "an-reflow-center"));
  return () => undos.forEach((u) => u());
}

// --- Typographic -------------------------------------------------------------

function setRootVar(name: string, value: string): Undo {
  if (typeof document === "undefined") return NOOP;
  const root = document.documentElement;
  const prev = root.style.getPropertyValue(name);
  root.style.setProperty(name, value);
  return () => {
    if (prev) root.style.setProperty(name, prev);
    else root.style.removeProperty(name);
  };
}

function setFontScale(value: number): Undo {
  return setRootVar("--an-font-scale", String(value));
}

function setMaxWidth(value: number): Undo {
  return setRootVar("--an-max-width", `${value}px`);
}

function setLineHeight(value: number): Undo {
  return setRootVar("--an-line-height", String(value));
}

// --- Attentional -------------------------------------------------------------

function spotlight(selector: string): Undo {
  const targets = $$(selector);
  if (targets.length === 0) return NOOP;

  const target = targets[0];
  const undos: Undo[] = [addClass(target, "an-spotlight")];

  // Dim every other top-level sibling under the same parent.
  const parent = target.parentElement;
  if (parent) {
    for (const sib of Array.from(parent.children)) {
      if (sib !== target && sib instanceof HTMLElement) {
        const restoreOpacity = snapshotInline(sib, "--an-dim-opacity");
        sib.style.setProperty("--an-dim-opacity", "0.35");
        const restoreClass = addClass(sib, "an-dim");
        undos.push(() => {
          restoreClass();
          restoreOpacity();
        });
      }
    }
  }
  return () => undos.forEach((u) => u());
}

// --- Dispatcher --------------------------------------------------------------

export function executeAction(action: Action): Undo {
  switch (action.type) {
    case "hide":
      return action.selector ? hide(action.selector) : NOOP;
    case "dim":
      return action.selector ? dim(action.selector, action.opacity ?? 0.3) : NOOP;
    case "centerMain":
      return action.selector ? centerMain(action.selector) : NOOP;
    case "setFontScale":
      return typeof action.value === "number" ? setFontScale(action.value) : NOOP;
    case "setMaxWidth":
      return typeof action.value === "number" ? setMaxWidth(action.value) : NOOP;
    case "setLineHeight":
      return typeof action.value === "number" ? setLineHeight(action.value) : NOOP;
    case "spotlight":
      return action.selector ? spotlight(action.selector) : NOOP;
    default:
      return NOOP;
  }
}

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

/** Roles that belong to the engine's own UI and must never be mutated. */
const PROTECTED_ROLES = new Set(["mic-overlay", "toaster"]);

function isProtected(el: HTMLElement): boolean {
  const role = el.getAttribute("data-an-role");
  return !!role && PROTECTED_ROLES.has(role);
}

function $$(selector: string): HTMLElement[] {
  if (!selector || typeof document === "undefined") return [];
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !isProtected(el)
    );
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

function dim(selector: string, opacity = 0.1): Undo {
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

function killAnimations(): Undo {
  if (typeof document === "undefined") return NOOP;
  const existing = document.getElementById("an-kill-animations");
  if (existing) return NOOP;
  const style = document.createElement("style");
  style.id = "an-kill-animations";
  // Exempt engine classes so our own transitions still work.
  style.textContent = `
    *:not([data-an-role]):not(.an-dim):not(.an-spotlight):not(.an-reflow-center),
    *:not([data-an-role])::before,
    *:not([data-an-role])::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  `;
  document.head.appendChild(style);
  return () => style.remove();
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

/**
 * Fix: set font-size on <html> so all rem-based Tailwind classes cascade.
 * Also keep --an-font-scale in sync for CSS fallback rules.
 */
function setFontScale(value: number): Undo {
  if (typeof document === "undefined") return NOOP;
  const root = document.documentElement;
  const prevFontSize = root.style.fontSize;
  const prevVar = root.style.getPropertyValue("--an-font-scale");

  root.style.fontSize = `${value * 100}%`;
  root.style.setProperty("--an-font-scale", String(value));

  return () => {
    root.style.fontSize = prevFontSize;
    if (prevVar) root.style.setProperty("--an-font-scale", prevVar);
    else root.style.removeProperty("--an-font-scale");
  };
}

function setMaxWidth(value: number): Undo {
  return setRootVar("--an-max-width", `${value}px`);
}

function setLineHeight(value: number): Undo {
  return setRootVar("--an-line-height", String(value));
}

function setLetterSpacing(value: number): Undo {
  return setRootVar("--an-letter-spacing", `${value}em`);
}

/**
 * Scale just one specific element's font-size without touching the root.
 * value is a multiplier relative to the element's current computed font-size.
 * e.g. value=2 → double the element's current font size.
 */
function scaleElement(selector: string, value: number): Undo {
  if (typeof document === "undefined") return NOOP;
  const undos: Undo[] = [];
  for (const el of $$(selector)) {
    const computed = parseFloat(getComputedStyle(el).fontSize) || 16;
    const prev = el.style.fontSize;
    const prevTransition = el.style.transition;
    el.style.transition = "font-size 400ms cubic-bezier(0.4,0,0.2,1)";
    el.style.fontSize = `${computed * value}px`;
    undos.push(() => {
      el.style.fontSize = prev;
      el.style.transition = prevTransition;
    });
  }
  return () => undos.forEach((u) => u());
}

const FONT_FAMILIES: Record<string, string> = {
  dyslexic: '"Atkinson Hyperlegible", "OpenDyslexic", Arial, sans-serif',
  clean: 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  default: "",
};

function setFontFamily(family: string): Undo {
  if (typeof document === "undefined") return NOOP;
  const resolved = FONT_FAMILIES[family] ?? family;
  const root = document.documentElement;
  const prev = root.style.getPropertyValue("--an-font-family");
  if (resolved) {
    root.style.setProperty("--an-font-family", resolved);
  } else {
    root.style.removeProperty("--an-font-family");
  }
  return () => {
    if (prev) root.style.setProperty("--an-font-family", prev);
    else root.style.removeProperty("--an-font-family");
  };
}

// --- Attentional -------------------------------------------------------------

const BG_COLORS: Record<string, { bg: string; text?: string }> = {
  warm: { bg: "#fdf6e3" },
  cream: { bg: "#fffff0" },
  dark: { bg: "#1a1a2e", text: "#dde1e7" },
  gray: { bg: "#f4f4f4" },
  white: { bg: "#ffffff" },
};

function setBackground(color: string): Undo {
  if (typeof document === "undefined") return NOOP;
  const resolved = BG_COLORS[color] ?? { bg: color };
  const body = document.body;
  const prevBg = body.style.backgroundColor;
  const prevColor = body.style.color;
  const prevTransition = body.style.transition;

  body.style.transition = "background-color 500ms ease, color 500ms ease";
  body.style.backgroundColor = resolved.bg;
  if (resolved.text) body.style.color = resolved.text;

  return () => {
    body.style.backgroundColor = prevBg;
    body.style.color = prevColor;
    body.style.transition = prevTransition;
  };
}

/**
 * Spotlight: give the target element full opacity + subtle ring,
 * dim ALL other data-an-role regions aggressively, then scroll into view.
 */
function spotlight(selector: string): Undo {
  if (typeof document === "undefined") return NOOP;
  const targets = $$(selector);
  if (targets.length === 0) return NOOP;

  const target = targets[0];
  const undos: Undo[] = [addClass(target, "an-spotlight")];

  // Dim every other data-an-role region to near-zero (never touch overlay UI)
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-an-role]"))) {
    if (el === target || target.contains(el) || el.contains(target)) continue;
    if (isProtected(el)) continue;
    const restoreOpacity = snapshotInline(el, "--an-dim-opacity");
    el.style.setProperty("--an-dim-opacity", "0.08");
    const restoreClass = addClass(el, "an-dim");
    undos.push(() => {
      restoreClass();
      restoreOpacity();
    });
  }

  // Scroll into view after a brief delay so CSS transitions look good
  const timer = setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);

  return () => {
    clearTimeout(timer);
    undos.forEach((u) => u());
  };
}

// --- Dispatcher --------------------------------------------------------------

export function executeAction(action: Action): Undo {
  switch (action.type) {
    case "hide":
      return action.selector ? hide(action.selector) : NOOP;
    case "dim":
      return action.selector ? dim(action.selector, action.opacity ?? 0.1) : NOOP;
    case "centerMain":
      return action.selector ? centerMain(action.selector) : NOOP;
    case "killAnimations":
      return killAnimations();
    case "setFontScale":
      return typeof action.value === "number" ? setFontScale(action.value) : NOOP;
    case "setMaxWidth":
      return typeof action.value === "number" ? setMaxWidth(action.value) : NOOP;
    case "setLineHeight":
      return typeof action.value === "number" ? setLineHeight(action.value) : NOOP;
    case "setLetterSpacing":
      return typeof action.value === "number" ? setLetterSpacing(action.value) : NOOP;
    case "scaleElement":
      return action.selector && typeof action.value === "number"
        ? scaleElement(action.selector, action.value)
        : NOOP;
    case "setFontFamily":
      return action.color ? setFontFamily(action.color) : NOOP;
    case "spotlight":
      return action.selector ? spotlight(action.selector) : NOOP;
    case "setBackground":
      return action.color ? setBackground(action.color) : NOOP;
    default:
      return NOOP;
  }
}

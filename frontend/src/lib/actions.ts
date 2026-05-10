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
 * Scale a specific element AND all its text-bearing descendants.
 * Frameworks like Tailwind set absolute font-sizes on children (text-2xl, text-xs),
 * which override a parent's font-size. To make scaleElement actually visible,
 * we walk the subtree and multiply every element's *computed* font-size in place.
 */
function scaleElement(selector: string, value: number): Undo {
  if (typeof document === "undefined") return NOOP;
  const undos: Undo[] = [];
  const targets = $$(selector);
  for (const root of targets) {
    const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
    for (const el of all) {
      if (isProtected(el)) continue;
      const computed = parseFloat(getComputedStyle(el).fontSize) || 16;
      const prev = el.style.fontSize;
      const prevPriority = el.style.getPropertyPriority("font-size");
      const prevTransition = el.style.transition;
      el.style.transition = "font-size 400ms cubic-bezier(0.4,0,0.2,1)";
      el.style.setProperty("font-size", `${computed * value}px`, "important");
      undos.push(() => {
        if (prev) el.style.setProperty("font-size", prev, prevPriority);
        else el.style.removeProperty("font-size");
        el.style.transition = prevTransition;
      });
    }
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
  blue: { bg: "#dbeafe", text: "#1e3a8a" },
  green: { bg: "#dcfce7", text: "#14532d" },
  rose: { bg: "#ffe4e6" },
  amber: { bg: "#fef3c7" },
};

/**
 * Apply the page background to <html>, <body>, AND the top-level chaotic wrapper.
 * Tailwind sets explicit bg classes on the outer div, which cover <body>; we
 * have to override that wrapper too or the change is invisible.
 */
function setBackground(color: string): Undo {
  if (typeof document === "undefined") return NOOP;
  const resolved = BG_COLORS[color] ?? { bg: color };
  const undos: Undo[] = [];

  const targets: HTMLElement[] = [
    document.documentElement,
    document.body,
  ];
  // Top-level chaotic wrapper (first child of #root)
  const wrapper = document.querySelector<HTMLElement>("#root > div");
  if (wrapper) targets.push(wrapper);

  for (const el of targets) {
    const prevBg = el.style.getPropertyValue("background-color");
    const prevBgPriority = el.style.getPropertyPriority("background-color");
    const prevColor = el.style.getPropertyValue("color");
    const prevColorPriority = el.style.getPropertyPriority("color");
    const prevTransition = el.style.transition;

    el.style.transition = "background-color 500ms ease, color 500ms ease";
    el.style.setProperty("background-color", resolved.bg, "important");
    if (resolved.text) el.style.setProperty("color", resolved.text, "important");

    undos.push(() => {
      if (prevBg) el.style.setProperty("background-color", prevBg, prevBgPriority);
      else el.style.removeProperty("background-color");
      if (prevColor) el.style.setProperty("color", prevColor, prevColorPriority);
      else el.style.removeProperty("color");
      el.style.transition = prevTransition;
    });
  }
  return () => undos.forEach((u) => u());
}

/**
 * Recolor a specific element's background, text, or border with !important
 * so it overrides Tailwind utility classes. Color can be any CSS color value
 * ("blue", "#1e40af", "rgb(...)") or one of our palette names.
 */
function recolor(
  selector: string,
  color: string,
  target: "bg" | "text" | "border" = "bg",
): Undo {
  if (typeof document === "undefined") return NOOP;
  const PALETTE: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    teal: "#14b8a6",
    indigo: "#6366f1",
    red: "#ef4444",
    rose: "#f43f5e",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    purple: "#a855f7",
    gray: "#6b7280",
    slate: "#475569",
    white: "#ffffff",
    black: "#0f172a",
  };
  const resolved = PALETTE[color.toLowerCase()] ?? color;
  const propMap = {
    bg: "background-color",
    text: "color",
    border: "border-color",
  } as const;
  const prop = propMap[target];

  const undos: Undo[] = [];
  for (const el of $$(selector)) {
    // Apply to the element AND its descendants for backgrounds/text — Tailwind
    // utility classes on children otherwise override the parent.
    const all = [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))];
    for (const node of all) {
      if (isProtected(node)) continue;
      const prev = node.style.getPropertyValue(prop);
      const prevPriority = node.style.getPropertyPriority(prop);
      const prevTransition = node.style.transition;
      node.style.transition = `${prop} 400ms ease`;
      node.style.setProperty(prop, resolved, "important");
      // For backgrounds, also force backgroundImage off so Tailwind gradients
      // (`bg-gradient-to-r ...`) don't paint over our solid color.
      let restoreBgImage: (() => void) | null = null;
      if (target === "bg") {
        const prevImg = node.style.getPropertyValue("background-image");
        const prevImgPriority = node.style.getPropertyPriority("background-image");
        node.style.setProperty("background-image", "none", "important");
        restoreBgImage = () => {
          if (prevImg) node.style.setProperty("background-image", prevImg, prevImgPriority);
          else node.style.removeProperty("background-image");
        };
      }
      undos.push(() => {
        if (prev) node.style.setProperty(prop, prev, prevPriority);
        else node.style.removeProperty(prop);
        if (restoreBgImage) restoreBgImage();
        node.style.transition = prevTransition;
      });
    }
  }
  return () => undos.forEach((u) => u());
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
    case "recolor":
      return action.selector && action.color
        ? recolor(action.selector, action.color, action.target ?? "bg")
        : NOOP;
    default:
      return NOOP;
  }
}

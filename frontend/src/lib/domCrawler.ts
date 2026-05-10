import type { PageElement } from "../types/intent";

/**
 * Crawls the live DOM and returns a catalog of targetable elements with
 * human-readable labels and stable CSS selectors.
 *
 * Strategy (priority order — degrades gracefully on any page):
 *   1. data-an-id  — developer-tagged specific elements (most stable)
 *   2. data-an-role — broad landmark regions (existing system)
 *   3. Semantic HTML — <nav>, <main>, <aside>, <header>, <footer>
 *   4. Heuristic patterns — price regex, first img in main, h1, CTA buttons
 *
 * For a Chrome extension, this function runs as a content script so the same
 * catalog works on any arbitrary page.
 */

// ---------------------------------------------------------------------------
// Selector generation helpers
// ---------------------------------------------------------------------------

/** Returns the most stable CSS selector for an element. */
function stableSelector(el: HTMLElement): string {
  // 1. data-an-id (our own tag — most stable)
  const anId = el.getAttribute("data-an-id");
  if (anId) return `[data-an-id='${anId}']`;

  // 2. data-an-role
  const anRole = el.getAttribute("data-an-role");
  if (anRole) return `[data-an-role='${anRole}']`;

  // 3. Explicit id attribute
  if (el.id) return `#${CSS.escape(el.id)}`;

  // 4. aria-label
  const label = el.getAttribute("aria-label");
  if (label) return `[aria-label='${label.replace(/'/g, "\\'")}']`;

  // 5. data-testid
  const testId = el.getAttribute("data-testid");
  if (testId) return `[data-testid='${CSS.escape(testId)}']`;

  // 6. Semantic context: tag within a known landmark
  const mainEl = document.querySelector("main, [role='main'], [data-an-role='main']");
  if (mainEl && mainEl.contains(el)) {
    const tag = el.tagName.toLowerCase();
    // First of its type in main
    const siblings = Array.from(mainEl.querySelectorAll(tag));
    const idx = siblings.indexOf(el);
    if (idx === 0) return `[data-an-role='main'] ${tag}:first-of-type`;
    if (idx >= 0) return `[data-an-role='main'] ${tag}:nth-of-type(${idx + 1})`;
  }

  // 7. Tag + first meaningful class
  const cls = Array.from(el.classList).find((c) => c.length > 2 && !c.startsWith("hover:"));
  if (cls) return `${el.tagName.toLowerCase()}.${CSS.escape(cls)}`;

  return el.tagName.toLowerCase();
}

/** Truncate text for labels. */
function excerpt(el: HTMLElement, maxLen = 60): string {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}

// ---------------------------------------------------------------------------
// Extraction passes
// ---------------------------------------------------------------------------

function extractAnIdElements(): PageElement[] {
  const results: PageElement[] = [];
  const TYPE_MAP: Record<string, PageElement["type"]> = {
    "product-image": "image",
    "product-title": "heading",
    "product-price": "price",
    "buy-button": "button",
    "product-description": "text",
    "product-reviews": "text",
    ratings: "text",
  };
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-an-id]"))) {
    const id = el.getAttribute("data-an-id") ?? "";
    const type: PageElement["type"] = TYPE_MAP[id] ?? "text";
    let label = id.replace(/-/g, " ");
    if (type === "price") {
      const priceText = excerpt(el, 20);
      label = `product price${priceText ? `: ${priceText}` : ""}`;
    } else if (type === "heading") {
      label = `product title: ${excerpt(el, 50)}`;
    } else if (type === "image") {
      label = "product image";
    } else if (type === "button") {
      label = `button: ${excerpt(el, 30)}`;
    } else if (id === "ratings") {
      label = `star ratings: ${excerpt(el, 30)}`;
    } else if (id === "product-description") {
      label = "product description";
    } else if (id === "product-reviews") {
      label = "customer reviews";
    }
    results.push({ label, selector: `[data-an-id='${id}']`, type });
  }
  return results;
}

function extractAnRoleRegions(seenSelectors: Set<string>): PageElement[] {
  const results: PageElement[] = [];
  const ROLE_LABELS: Record<string, string> = {
    nav: "navigation bar",
    main: "main content area",
    "aside-left": "left sidebar",
    "aside-right": "right sidebar (recommendations)",
    promo: "promo / deals banner",
    footer: "page footer",
  };
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-an-role]"))) {
    const role = el.getAttribute("data-an-role") ?? "";
    const selector = `[data-an-role='${role}']`;
    if (seenSelectors.has(selector)) continue;
    seenSelectors.add(selector);
    results.push({
      label: ROLE_LABELS[role] ?? role,
      selector,
      type: "landmark",
    });
  }
  return results;
}

function extractSemanticElements(seenSelectors: Set<string>): PageElement[] {
  const results: PageElement[] = [];
  const SEMANTIC: Array<[string, string, PageElement["type"]]> = [
    ["nav", "navigation", "landmark"],
    ["main", "main content", "landmark"],
    ["aside", "sidebar", "landmark"],
    ["header", "page header", "landmark"],
    ["footer", "page footer", "landmark"],
    ["[role='main']", "main content", "landmark"],
    ["[role='navigation']", "navigation", "landmark"],
    ["[role='banner']", "page header", "landmark"],
  ];
  for (const [query, labelBase, type] of SEMANTIC) {
    const el = document.querySelector<HTMLElement>(query);
    if (!el) continue;
    const selector = stableSelector(el);
    if (seenSelectors.has(selector)) continue;
    seenSelectors.add(selector);
    results.push({ label: labelBase, selector, type });
  }
  return results;
}

const PRICE_RE = /\$[\d,]+(\.\d{1,2})?/;

function extractHeuristicElements(seenSelectors: Set<string>): PageElement[] {
  const results: PageElement[] = [];

  // First h1
  const h1 = document.querySelector<HTMLElement>("h1");
  if (h1) {
    const sel = stableSelector(h1);
    if (!seenSelectors.has(sel)) {
      seenSelectors.add(sel);
      results.push({ label: `page title: ${excerpt(h1, 50)}`, selector: sel, type: "heading" });
    }
  }

  // First h2/h3 in main
  const mainEl = document.querySelector<HTMLElement>(
    "main, [role='main'], [data-an-role='main']",
  );
  if (mainEl) {
    for (const sub of Array.from(mainEl.querySelectorAll<HTMLElement>("h2, h3")).slice(0, 3)) {
      const sel = stableSelector(sub);
      if (seenSelectors.has(sel)) continue;
      seenSelectors.add(sel);
      results.push({ label: `heading: ${excerpt(sub, 40)}`, selector: sel, type: "heading" });
    }
  }

  // Price-like element (first element with a $ amount, not already tagged)
  const allEls = Array.from(document.querySelectorAll<HTMLElement>("*"));
  for (const el of allEls) {
    if (el.children.length > 3) continue; // skip containers
    if (el.getAttribute("data-an-id") || el.getAttribute("data-an-role")) continue;
    const text = (el.textContent ?? "").trim();
    if (PRICE_RE.test(text) && text.length < 30) {
      const sel = stableSelector(el);
      if (!seenSelectors.has(sel)) {
        seenSelectors.add(sel);
        results.push({ label: `price: ${text.slice(0, 20)}`, selector: sel, type: "price" });
        break;
      }
    }
  }

  // First img in main content area
  const mainImgContainer = mainEl ?? document.querySelector<HTMLElement>("body");
  if (mainImgContainer) {
    const img = mainImgContainer.querySelector<HTMLElement>("img[src], img[alt]");
    if (img) {
      const alt = img.getAttribute("alt") || "product image";
      const sel = stableSelector(img);
      if (!seenSelectors.has(sel)) {
        seenSelectors.add(sel);
        results.push({ label: `image: ${alt.slice(0, 40)}`, selector: sel, type: "image" });
      }
    }
  }

  // CTA buttons
  const CTA_PATTERNS = /^(buy|add to cart|checkout|get|order|purchase)/i;
  for (const btn of Array.from(document.querySelectorAll<HTMLElement>("button, [role='button']"))) {
    const text = (btn.textContent ?? "").trim();
    if (!CTA_PATTERNS.test(text)) continue;
    const sel = stableSelector(btn);
    if (seenSelectors.has(sel)) continue;
    seenSelectors.add(sel);
    results.push({ label: `button: ${text.slice(0, 30)}`, selector: sel, type: "button" });
    break; // just the primary CTA
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function crawlPage(): PageElement[] {
  if (typeof document === "undefined") return [];

  const seenSelectors = new Set<string>();
  const catalog: PageElement[] = [
    ...extractAnIdElements(),
    ...extractAnRoleRegions(seenSelectors),
    ...extractSemanticElements(seenSelectors),
    ...extractHeuristicElements(seenSelectors),
  ];

  // Mark selectors from data-an-id pass as seen (they used their own set)
  for (const el of catalog) seenSelectors.add(el.selector);

  return catalog;
}

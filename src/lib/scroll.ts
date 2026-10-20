/**
 * Smooth-scrolls to a section by hash (e.g. "#volunteer") and records it in the
 * URL. Scroll offset for the fixed navbar comes from `scroll-margin-top` in index.css.
 * Returns false if the target does not exist.
 */
export function scrollToSection(href: string): boolean {
  const id = href.replace(/^#/, "");
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  return true;
}

/** A plain left-click (not ctrl/cmd/shift-click or a middle click, which should open a new tab). */
export const isPlainClick = (e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

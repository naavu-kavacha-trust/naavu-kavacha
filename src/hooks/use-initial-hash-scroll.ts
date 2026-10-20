import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** How long to keep looking for a hash target that has not rendered yet (lazy page chunks, slow networks). */
const TARGET_WAIT_MS = 4000;

/**
 * Keeps the scroll position and keyboard focus sensible on every page and every route change.
 *
 * - Opening a shared link such as `/about#journey`: the page is rendered by React after the browser has
 *   already tried (and failed) to jump to the fragment, so scroll to it once the element exists. Pages are
 *   loaded on demand, so the element can appear a moment later; we wait for it. Further attempts shortly
 *   after landing cover images, fonts and the lazy-loaded form that shift the layout; they are skipped once
 *   the visitor has scrolled away on their own.
 * - Navigating to another page without a hash: scroll to the top and move focus to `#main-content`
 *   (without a visible jump), so keyboard and screen-reader users start at the new page's content.
 *   Skipped on the very first load, where the browser has already done the right thing.
 * - `#projects/<id>` links are handled by the activity pop-up, so anything with a "/" is left alone.
 */
export function useInitialHashScroll(): void {
  const { pathname, hash } = useLocation();
  const isFirstRun = useRef(true);

  useEffect(() => {
    const firstRun = isFirstRun.current;
    isFirstRun.current = false;

    let id = "";
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    if (id.includes("/")) return;

    if (!id) {
      if (!firstRun) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
      return;
    }

    let cancelled = false;
    let target: HTMLElement | null = null;
    let landedAt: number | null = null;
    let frame = 0;
    const timers: number[] = [];
    const startedAt = performance.now();

    const jump = () => {
      target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: "start" });
      landedAt = window.scrollY;
      return true;
    };

    const settle = () => {
      if (cancelled || landedAt === null || Math.abs(window.scrollY - landedAt) > 8) return;
      jump();
    };

    const scheduleSettling = () => {
      const start = () => {
        for (const delay of [150, 800, 2000]) timers.push(window.setTimeout(settle, delay));
      };
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    };

    const attempt = () => {
      if (cancelled) return;
      if (jump()) {
        scheduleSettling();
        return;
      }
      if (performance.now() - startedAt < TARGET_WAIT_MS) frame = window.requestAnimationFrame(attempt);
    };
    frame = window.requestAnimationFrame(attempt);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);
}

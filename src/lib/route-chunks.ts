import type { ComponentType } from "react";
import { LEGAL_ROUTES, ROUTES } from "@/data/siteConfig";

/**
 * How each non-home page is loaded. The router uses these to load a page when it is first opened, and the
 * prefetcher below calls the same functions earlier (on hover or focus), so the page is usually already in the
 * browser by the time the click happens. The home page ships in the main bundle and needs no loader.
 */
export const pageLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  [ROUTES.about]: () => import("@/pages/AboutPage"),
  [ROUTES.ourWork]: () => import("@/pages/OurWorkPage"),
  [ROUTES.gallery]: () => import("@/pages/GalleryPage"),
  [ROUTES.volunteer]: () => import("@/pages/VolunteerPage"),
  [LEGAL_ROUTES.privacy]: () => import("@/pages/PrivacyPage"),
  [LEGAL_ROUTES.terms]: () => import("@/pages/TermsPage"),
};

type Loader = () => Promise<unknown>;

/** True when the visitor has asked their browser to save data, in which case nothing is fetched ahead of a click. */
const savingData = (): boolean =>
  typeof navigator !== "undefined" && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * Loads a page's code ahead of time, at most once per page. The link's #hash and ?query are ignored; links to
 * the home page, in-page jumps and unknown paths do nothing. A failed load is forgotten so a later hover can retry.
 */
export function createPrefetcher(loaders: Record<string, Loader>) {
  const requested = new Set<string>();
  return {
    prefetch(href: string): void {
      const path = href.split("#")[0].split("?")[0];
      const load = loaders[path];
      if (!load || requested.has(path) || savingData()) return;
      requested.add(path);
      load().catch(() => requested.delete(path));
    },
    reset(): void {
      requested.clear();
    },
  };
}

export const prefetcher = createPrefetcher(pageLoaders);
export const prefetchRoute = (href: string): void => prefetcher.prefetch(href);

/** Spread onto a link: prefetch on mouse hover, keyboard focus and the first touch. */
export const prefetchHandlers = (href: string) => ({
  onMouseEnter: () => prefetchRoute(href),
  onFocus: () => prefetchRoute(href),
  onTouchStart: () => prefetchRoute(href),
});

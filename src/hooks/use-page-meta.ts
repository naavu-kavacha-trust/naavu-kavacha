import { useEffect } from "react";
import { SITE_URL } from "@/data/siteConfig";

interface PageMeta {
  title: string;
  description: string;
}

/**
 * Sets the browser-tab title and the meta description for the page that calls it, and puts the
 * previous values back when the page unmounts (so the next page, or the home default, starts clean).
 */
export function usePageMeta({ title, description }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = meta === null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previousDescription = meta.getAttribute("content");

    document.title = title;
    meta.setAttribute("content", description);

    // The SPA serves one HTML shell for every path. Keep the canonical URL aligned with
    // the current page after routing so each public page can be indexed independently.
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = canonical === null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const previousCanonical = canonical.getAttribute("href");
    canonical.href = `${SITE_URL}${window.location.pathname}`;

    return () => {
      document.title = previousTitle;
      if (created) meta?.remove();
      else if (previousDescription === null) meta?.removeAttribute("content");
      else meta?.setAttribute("content", previousDescription);
      if (createdCanonical) canonical?.remove();
      else if (previousCanonical === null) canonical?.removeAttribute("href");
      else canonical?.setAttribute("href", previousCanonical);
    };
  }, [title, description]);
}

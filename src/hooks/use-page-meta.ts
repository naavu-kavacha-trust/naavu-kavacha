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

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const previousOgTitle = ogTitle?.getAttribute("content");
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const previousOgUrl = ogUrl?.getAttribute("content");

    document.title = title;
    meta.setAttribute("content", description);
    ogTitle?.setAttribute("content", title);

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
    const pageUrl = `${SITE_URL}${window.location.pathname}`;
    canonical.href = pageUrl;
    ogUrl?.setAttribute("content", pageUrl);

    return () => {
      document.title = previousTitle;
      if (created) meta?.remove();
      else if (previousDescription === null) meta?.removeAttribute("content");
      else meta?.setAttribute("content", previousDescription);
      if (ogTitle) {
        if (previousOgTitle === null) ogTitle.removeAttribute("content");
        else if (previousOgTitle !== undefined) ogTitle.setAttribute("content", previousOgTitle);
      }
      if (ogUrl) {
        if (previousOgUrl === null) ogUrl.removeAttribute("content");
        else if (previousOgUrl !== undefined) ogUrl.setAttribute("content", previousOgUrl);
      }
      if (createdCanonical) canonical?.remove();
      else if (previousCanonical === null) canonical?.removeAttribute("href");
      else canonical?.setAttribute("href", previousCanonical);
    };
  }, [title, description]);
}

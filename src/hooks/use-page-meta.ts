import { useEffect } from "react";
import { SITE_URL } from "@/data/siteConfig";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizedPath, unlocalizedPath } from "@/i18n/types";

interface PageMeta {
  title: string;
  description: string;
}

/**
 * Sets the browser-tab title and the meta description for the page that calls it, and puts the
 * previous values back when the page unmounts (so the next page, or the home default, starts clean).
 */
export function usePageMeta({ title, description }: PageMeta): void {
  const { locale, catalog } = useLocale();
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
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const previousOgDescription = ogDescription?.getAttribute("content");
    const ogImageAlt = document.querySelector<HTMLMetaElement>('meta[property="og:image:alt"]');
    const previousOgImageAlt = ogImageAlt?.getAttribute("content");
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const previousOgUrl = ogUrl?.getAttribute("content");

    const localizedTitle = catalog[title] ?? title;
    const localizedDescription = catalog[description] ?? description;
    const localizedImageAlt = ogImageAlt?.content ? catalog[ogImageAlt.content] ?? ogImageAlt.content : undefined;
    const structuredScripts = [...document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')];
    const previousStructuredData = structuredScripts.map((script) => script.textContent ?? "");
    document.title = localizedTitle;
    meta.setAttribute("content", localizedDescription);
    ogTitle?.setAttribute("content", localizedTitle);
    ogDescription?.setAttribute("content", localizedDescription);
    if (localizedImageAlt) ogImageAlt?.setAttribute("content", localizedImageAlt);
    for (const script of structuredScripts) {
      try {
        const structured = JSON.parse(script.textContent ?? "");
        if (structured["@type"] === "NGO") {
          structured.description = localizedDescription;
          script.textContent = JSON.stringify(structured);
        }
      } catch {
        // Leave invalid structured data untouched; the prerender check catches it at build time.
      }
    }

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

    const basePath = unlocalizedPath(window.location.pathname);
    for (const [language, tag] of [["en", "en"], ["kn", "kn"], ["hi", "hi"], ["en", "x-default"]] as const) {
      let link = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${tag}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = tag;
        document.head.appendChild(link);
      }
      link.href = `${SITE_URL}${localizedPath(language, basePath)}`;
    }

    return () => {
      document.title = previousTitle;
      if (created) meta?.remove();
      else if (previousDescription === null) meta?.removeAttribute("content");
      else meta?.setAttribute("content", previousDescription);
      if (ogTitle) {
        if (previousOgTitle === null) ogTitle.removeAttribute("content");
        else if (previousOgTitle !== undefined) ogTitle.setAttribute("content", previousOgTitle);
      }
      if (ogDescription) {
        if (previousOgDescription === null) ogDescription.removeAttribute("content");
        else if (previousOgDescription !== undefined) ogDescription.setAttribute("content", previousOgDescription);
      }
      if (ogImageAlt) {
        if (previousOgImageAlt === null) ogImageAlt.removeAttribute("content");
        else if (previousOgImageAlt !== undefined) ogImageAlt.setAttribute("content", previousOgImageAlt);
      }
      structuredScripts.forEach((script, index) => {
        if (script.isConnected) script.textContent = previousStructuredData[index];
      });
      if (ogUrl) {
        if (previousOgUrl === null) ogUrl.removeAttribute("content");
        else if (previousOgUrl !== undefined) ogUrl.setAttribute("content", previousOgUrl);
      }
      if (createdCanonical) canonical?.remove();
      else if (previousCanonical === null) canonical?.removeAttribute("href");
      else canonical?.setAttribute("href", previousCanonical);
    };
  }, [title, description, locale, catalog]);
}

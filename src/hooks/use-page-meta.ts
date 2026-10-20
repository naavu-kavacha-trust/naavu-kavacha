import { useEffect } from "react";

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

    return () => {
      document.title = previousTitle;
      if (created) meta?.remove();
      else if (previousDescription === null) meta?.removeAttribute("content");
      else meta?.setAttribute("content", previousDescription);
    };
  }, [title, description]);
}

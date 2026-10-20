import { useEffect, useState } from "react";

/**
 * Scroll-spy. Returns the id of the section currently crossing a thin band
 * about a third of the way down the viewport. `ids` must be in page order and
 * should be a stable (module-level) array.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Last visible section in page order wins; keep the previous one if none.
        const current = ids.filter((id) => visible.has(id)).pop();
        if (current) setActive(current);
      },
      { rootMargin: "-35% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

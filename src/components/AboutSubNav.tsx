import { useEffect, useMemo, useRef } from "react";
import { useActiveSection } from "@/hooks/use-active-section";
import { isPlainClick, scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  id: string;
  label: string;
}

/**
 * A row of chips under the navbar that jumps to each part of the About page and shows where you are.
 * Pass only the sections that are actually on the page; with fewer than two there is nothing to jump
 * between, so it renders nothing. On phones the row scrolls sideways inside itself, never the page. The
 * chips share the story section's left edge. Height is fixed at 3.75rem (--subnav-height in index.css
 * uses the same number for scroll offsets).
 */
const AboutSubNav = ({ items }: { items: SubNavItem[] }) => {
  // useActiveSection wants a stable list, so rebuild it only when the set of ids changes.
  const key = items.map((i) => i.id).join("|");
  const ids = useMemo(() => (key ? key.split("|") : []), [key]);
  const active = useActiveSection(ids);

  const listRef = useRef<HTMLUListElement>(null);

  // Keep the current chip visible when the row is scrolled sideways. Moves the row only, never the page.
  useEffect(() => {
    const list = listRef.current;
    const chip = active ? list?.querySelector<HTMLElement>(`[data-chip="${active}"]`) : null;
    if (!list || !chip || typeof list.scrollTo !== "function") return;
    list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[var(--navbar-height,4.5rem)] z-40 border-b border-border bg-background/95 px-6 backdrop-blur-md md:px-12 lg:px-20 xl:px-32"
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-7xl gap-2 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                data-chip={item.id}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  if (!isPlainClick(e)) return;
                  e.preventDefault();
                  scrollToSection(`#${item.id}`);
                }}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary",
                )}
              >
                <span className="localized-chip-label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AboutSubNav;

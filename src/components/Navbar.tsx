import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Instagram, Mail, Menu } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import DeferredContactDialog from "@/components/DeferredContactDialog";
import { INSTAGRAM_URL, NAV_ITEMS, ROUTES, isRouteHref } from "@/data/siteConfig";
import { prefetchHandlers } from "@/lib/route-chunks";
import { isPlainClick, scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/** The full desktop bar needs about 1280px; below that the menu button is shown. */
const DESKTOP_QUERY = "(min-width: 1280px)";

type PendingAction = { type: "go"; href: string } | { type: "contact" } | null;



const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const pending = useRef<PendingAction>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLElement>(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === ROUTES.home;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // Re-read the position after every page change: a new page starts at the top.
  }, [pathname]);

  // Publish the bar's real height as --navbar-height, so anything that must sit under it (the About page's
  // sticky sub-navigation, scroll offsets) follows the actual size instead of a guess.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const publish = (height: number) => {
      if (height > 0) root.style.setProperty("--navbar-height", `${height}px`);
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const borderBox = entry.borderBoxSize?.[0];
        if (borderBox) {
          publish(borderBox.blockSize);
          return;
        }
        const style = window.getComputedStyle(bar);
        const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        publish(entry.contentRect.height + verticalPadding);
      });
      observer.observe(bar);
      return () => observer.disconnect();
    }

    // Older browsers get a deferred measurement so initial rendering does not force synchronous layout.
    let frame = requestAnimationFrame(() => publish(bar.getBoundingClientRect().height));
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => publish(bar.getBoundingClientRect().height));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // A page change always closes the mobile menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Close the mobile menu when the hash changes (back/forward) or the screen
  // grows to the desktop layout.
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);

    const mq = window.matchMedia?.(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => e.matches && close();
    mq?.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
      mq?.removeEventListener?.("change", onChange);
    };
  }, []);

  // See-through over the hero only: on the home page, at the top. Every other page has a solid bar.
  const transparent = isHome && !scrolled;

  const isActive = (href: string) => isRouteHref(href) && href === pathname;

  const linkClass = (active: boolean) =>
    cn(
      "relative rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      transparent
        ? "text-sand/90 hover:text-sand focus-visible:ring-sand"
        : "text-foreground/70 hover:text-primary focus-visible:ring-ring",
      active &&
        (transparent ? "text-sand" : "text-primary") +
          " after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-current",
    );

  /** Pages open through the router; "#contact" jumps to the footer on whichever page we are on. */
  const follow = (href: string) => {
    if (isRouteHref(href)) navigate(href);
    else scrollToSection(href);
  };

  // Mobile menu: remember where to go, close the sheet, then act once it has
  // fully unmounted so body scroll-lock is released before we navigate or scroll.
  const goTo = (href: string) => {
    pending.current = { type: "go", href };
    setMenuOpen(false);
  };
  const openContactFromMenu = () => {
    pending.current = { type: "contact" };
    setMenuOpen(false);
  };
  const handleCloseAutoFocus = (e: Event) => {
    const action = pending.current;
    e.preventDefault();
    if (!action) {
      // Closed with Escape, the close button or a tap outside: the sheet has no built-in trigger,
      // so hand focus back to the menu button ourselves.
      menuButtonRef.current?.focus({ preventScroll: true });
      return;
    }
    pending.current = null;
    if (action.type === "go") follow(action.href);
    else setContactOpen(true);
  };

  return (
    <nav
      ref={barRef}
      aria-label="Main"
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        transparent ? "bg-transparent py-5" : "bg-background/95 py-3 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link
          to={ROUTES.home}
          onClick={(e) => {
            // Already on the home page: a Link to the same place does nothing, so scroll up instead.
            if (isHome && window.location.hash === "" && isPlainClick(e)) {
              e.preventDefault();
              window.scrollTo({ top: 0 });
            }
          }}
          className="-my-1.5 rounded-lg py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <BrandLockup
            nameClassName={transparent ? "text-sand" : "text-primary"}
            legalClassName={transparent ? "text-sand/85" : "text-muted-foreground"}
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 xl:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return isRouteHref(item.href) ? (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
                {...prefetchHandlers(item.href)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (!isPlainClick(e)) return;
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={linkClass(false)}
              >
                {item.label}
              </a>
            );
          })}
          <Link
            to={ROUTES.volunteer}
            aria-current={pathname === ROUTES.volunteer ? "page" : undefined}
            {...prefetchHandlers(ROUTES.volunteer)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[current=page]:ring-2 aria-[current=page]:ring-primary/30 aria-[current=page]:ring-offset-2"
          >
            Volunteer
          </Link>
        </div>

        {/* Mobile / tablet menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden",
            transparent ? "text-sand" : "text-foreground",
          )}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={26} aria-hidden="true" />
        </button>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          id="mobile-menu"
          side="right"
          className="flex w-[85%] max-w-sm flex-col overflow-y-auto bg-background p-0"
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          <div className="border-b border-border px-6 py-5">
            <SheetTitle asChild>
              <div>
                <BrandLockup logoClassName="h-10 w-10" />
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation. Choose a page to open.
            </SheetDescription>
          </div>

          <nav aria-label="Mobile" className="flex-1 px-3 py-4">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      {...(isRouteHref(item.href) ? prefetchHandlers(item.href) : {})}
                      onClick={(e) => {
                        if (!isPlainClick(e)) return;
                        e.preventDefault();
                        goTo(item.href);
                      }}
                      className={cn(
                        "flex min-h-11 items-center rounded-lg px-3 text-base font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted hover:text-primary",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-4 border-t border-border px-6 py-5">
            <a
              href={ROUTES.volunteer}
              aria-current={pathname === ROUTES.volunteer ? "page" : undefined}
              {...prefetchHandlers(ROUTES.volunteer)}
              onClick={(e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                goTo(ROUTES.volunteer);
              }}
              className="flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Volunteer
            </a>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Instagram
              </a>
              <button
                type="button"
                onClick={openContactFromMenu}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Us
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Opened from the mobile menu's Email Us button */}
      <DeferredContactDialog
        subject="General Inquiry"
        open={contactOpen}
        onOpenChange={(open) => {
          setContactOpen(open);
          if (!open) {
            window.setTimeout(() => menuButtonRef.current?.focus({ preventScroll: true }), 300);
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      />
    </nav>
  );
};

export default Navbar;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ROUTES, SECTION_IDS } from "@/data/siteConfig";

/** On pages without a hero, the button appears once the visitor has scrolled this far (px). */
const SCROLL_THRESHOLD = 320;

const OPEN_DIALOG_SELECTOR = '[role="dialog"][data-state="open"]';

/** True while any modal dialog or sheet (activity pop-up, mobile menu, email chooser) is open. */
function useAnyDialogOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setOpen(document.querySelector(OPEN_DIALOG_SELECTOR) !== null);
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => observer.disconnect();
  }, []);

  return open;
}

/**
 * Whether the element with this id is on screen, judged against a viewport shrunk by `rootMargin`
 * (so slivers hidden under the navbar or at the very edge don't count). Unknown until the first observation.
 */
function useSectionInView(id: string, rootMargin = "0px", routeKey = ""): boolean | null {
  const [inView, setInView] = useState<boolean | null>(null);

  useEffect(() => {
    // The button lives in the shared page shell, so look again whenever the page changes.
    setInView(null);
    const el = document.getElementById(id);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Entries are in time order; the last one is the current state.
        const latest = entries[entries.length - 1];
        if (latest) setInView(latest.isIntersecting);
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, rootMargin, routeKey]);

  return inView;
}

/** True once the page has been scrolled past `distance` pixels. */
function useScrolledPast(distance: number): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > distance);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [distance]);

  return past;
}

/**
 * The floating "Become a Volunteer" button is shown once the visitor has scrolled past the intro (the hero
 * on the home page, the first screen elsewhere), and hidden again while the volunteer section is on screen,
 * a dialog/sheet is open, or the visitor is already on the Volunteer page.
 */
export function useFloatingCtaVisible(): boolean {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.home;

  // Ignore the strip under the fixed navbar when judging the hero, and only count the
  // volunteer section as "in view" once it reaches the middle of the screen.
  const heroInView = useSectionInView(SECTION_IDS.home, "-80px 0px 0px 0px", pathname);
  const formInView = useSectionInView(SECTION_IDS.volunteer, "-20% 0px -20% 0px", pathname);
  const bandInView = useSectionInView(SECTION_IDS.volunteerBand, "-20% 0px -20% 0px", pathname);
  const volunteerInView = formInView || bandInView;
  const scrolledPast = useScrolledPast(SCROLL_THRESHOLD);
  const dialogOpen = useAnyDialogOpen();

  if (pathname === ROUTES.volunteer) return false;

  // heroInView === null means we haven't observed yet (or can't): stay hidden.
  const pastIntro = isHome ? heroInView === false : scrolledPast;
  return pastIntro && volunteerInView !== true && !dialogOpen;
}

import { useEffect, useRef, type ReactNode } from "react";
import { m as motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";
import { useInitialHashScroll } from "@/hooks/use-initial-hash-scroll";
import { PAGE_FADE_SECONDS, PAGE_FADE_START_OPACITY } from "@/lib/page-transition";

/**
 * The shell every page shares: skip link, navbar, the page itself in <main>, floating volunteer button and
 * footer. It stays mounted while visitors move between pages, so the navbar never flashes or resets.
 * <main> itself fades in (opacity only, so nothing moves) each time the page changes.
 */
const PageLayout = ({ children }: { children: ReactNode }) => {
  useInitialHashScroll();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  // No fade on the very first load (the browser has just painted the page), nor for reduced motion.
  const isFirstLoad = useRef(true);
  useEffect(() => {
    isFirstLoad.current = false;
  }, []);
  const fade = !reduceMotion && !isFirstLoad.current;

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />
      {/* Keyed by the page's path, so a new page fades in; a #hash change on the same page does not. */}
      <motion.main
        key={pathname}
        id="main-content"
        tabIndex={-1}
        className="outline-none"
        initial={fade ? { opacity: PAGE_FADE_START_OPACITY } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: PAGE_FADE_SECONDS, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      <FloatingCTA />
      <Footer />
    </div>
  );
};

export default PageLayout;

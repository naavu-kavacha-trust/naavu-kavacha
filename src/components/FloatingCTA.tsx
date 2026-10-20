import { Link } from "react-router-dom";
import { AnimatePresence, m as motion, useReducedMotion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { ROUTES } from "@/data/siteConfig";
import { useFloatingCtaVisible } from "@/hooks/use-floating-cta-visibility";

// Link wrapped for framer-motion so the button can fade in and out.
const MotionLink = motion.create(Link);

/**
 * Persistent route to the Volunteer page: a pill at the bottom-right on larger
 * screens, a slim full-width bar (clear of the iPhone home indicator) on phones.
 * Hidden on the Volunteer page itself.
 */
const FloatingCTA = () => {
  const visible = useFloatingCtaVisible();
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? 0 : 24;

  return (
    <AnimatePresence>
      {visible && (
        <MotionLink
          key="floating-cta"
          to={ROUTES.volunteer}
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: offset }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 bg-primary px-6 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] text-sm font-medium text-primary-foreground shadow-[0_-4px_16px_rgba(0,0,0,0.15)] transition-colors hover:bg-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inset-x-auto md:bottom-6 md:right-6 md:rounded-full md:px-6 md:py-3.5 md:shadow-lg"
        >
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Become a Volunteer
        </MotionLink>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;

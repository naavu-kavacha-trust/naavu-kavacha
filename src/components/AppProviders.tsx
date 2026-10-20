import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";
import ActivityDialogProvider from "@/components/ActivityDialogProvider";
import VolunteerPrefillProvider from "@/components/VolunteerPrefillProvider";

// Animation features load after the first paint (see lib/motion-features.ts).
const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Everything that must live above the routes, so the activity pop-up and the volunteer pre-selection work
 * on every page and survive navigation. Must be rendered inside the router (the pop-up navigates).
 */
const AppProviders = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={loadMotionFeatures}>
    <VolunteerPrefillProvider>
      <ActivityDialogProvider>{children}</ActivityDialogProvider>
    </VolunteerPrefillProvider>
  </LazyMotion>
);

export default AppProviders;

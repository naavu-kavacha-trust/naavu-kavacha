import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";
import { domMax } from "framer-motion";
import ActivityDialogProvider from "@/components/ActivityDialogProvider";
import VolunteerPrefillProvider from "@/components/VolunteerPrefillProvider";

/**
 * Everything that must live above the routes, so the activity pop-up and the volunteer pre-selection work
 * on every page and survive navigation. Must be rendered inside the router (the pop-up navigates).
 */
const AppProviders = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domMax}>
    <VolunteerPrefillProvider>
      <ActivityDialogProvider>{children}</ActivityDialogProvider>
    </VolunteerPrefillProvider>
  </LazyMotion>
);

export default AppProviders;

import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";
import { domMax } from "framer-motion";
import ActivityDialogProvider from "@/components/ActivityDialogProvider";
import VolunteerPrefillProvider from "@/components/VolunteerPrefillProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";

/**
 * Everything that must live above the routes, so the activity pop-up and the volunteer pre-selection work
 * on every page and survive navigation. Must be rendered inside the router (the pop-up navigates).
 */
const AppProviders = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domMax}>
    <VolunteerPrefillProvider>
      <LocaleProvider>
        <ActivityDialogProvider>{children}</ActivityDialogProvider>
      </LocaleProvider>
    </VolunteerPrefillProvider>
  </LazyMotion>
);

export default AppProviders;

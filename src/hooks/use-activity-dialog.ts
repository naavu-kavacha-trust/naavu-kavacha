import { createContext, useContext } from "react";

export interface ActivityDialogValue {
  /** Opens the detail modal for an activity. `origin` is where focus returns on close. */
  openActivity: (id: string, origin?: HTMLElement | null) => void;
  /** Starts loading dialog code when a visitor shows intent to open an activity. */
  prefetchActivityDialog: () => void;
}

export const ActivityDialogContext = createContext<ActivityDialogValue>({
  openActivity: () => {},
  prefetchActivityDialog: () => {},
});

/** Lets any section (Projects, and What We Do in Phase 6) open the shared activity modal. */
export function useActivityDialog(): ActivityDialogValue {
  return useContext(ActivityDialogContext);
}

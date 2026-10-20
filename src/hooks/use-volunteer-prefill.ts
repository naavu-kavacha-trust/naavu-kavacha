import { createContext, useContext } from "react";

export interface VolunteerPrefillValue {
  /** Interests to pre-select in the volunteer form. */
  interests: string[];
  /** Replaces the pre-selection (e.g. from an activity modal). */
  prefill: (interests: string[]) => void;
  clear: () => void;
}

/**
 * Outside a provider this is a harmless no-op, so components can be rendered
 * on their own (in tests, say) without crashing.
 */
export const VolunteerPrefillContext = createContext<VolunteerPrefillValue>({
  interests: [],
  prefill: () => {},
  clear: () => {},
});

export function useVolunteerPrefill(): VolunteerPrefillValue {
  return useContext(VolunteerPrefillContext);
}

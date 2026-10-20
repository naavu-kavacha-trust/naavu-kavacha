import { useCallback, useMemo, useState, type ReactNode } from "react";
import { VolunteerPrefillContext } from "@/hooks/use-volunteer-prefill";

/**
 * Remembers which interests the volunteer form should open with.
 * Phase 3 writes to it (activity modal); the form built in Phase 5 reads it.
 */
const VolunteerPrefillProvider = ({ children }: { children: ReactNode }) => {
  const [interests, setInterests] = useState<string[]>([]);
  const prefill = useCallback((next: string[]) => setInterests(next), []);
  const clear = useCallback(() => setInterests([]), []);
  const value = useMemo(() => ({ interests, prefill, clear }), [interests, prefill, clear]);

  return (
    <VolunteerPrefillContext.Provider value={value}>{children}</VolunteerPrefillContext.Provider>
  );
};

export default VolunteerPrefillProvider;

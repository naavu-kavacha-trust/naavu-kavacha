import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getActivity, type Activity } from "@/data/activities";
import { ROUTES, SECTION_IDS } from "@/data/siteConfig";
import { ActivityDialogContext } from "@/hooks/use-activity-dialog";
import { useVolunteerPrefill } from "@/hooks/use-volunteer-prefill";

let dialogPromise: Promise<typeof import("@/components/ActivityDialog")> | undefined;
const loadActivityDialog = () => (dialogPromise ??= import("@/components/ActivityDialog"));
const prefetchActivityDialog = () => {
  void loadActivityDialog().catch(() => {
    dialogPromise = undefined;
  });
};
const ActivityDialog = lazy(loadActivityDialog);

const PROJECTS_HASH = `#${SECTION_IDS.projects}`;
const ACTIVITY_HASH_PREFIX = `${PROJECTS_HASH}/`;

/** `#projects/<id>` -> id, but only for activities that exist. */
function activityIdFromHash(hash: string): string | null {
  if (!hash.startsWith(ACTIVITY_HASH_PREFIX)) return null;
  try {
    const id = decodeURIComponent(hash.slice(ACTIVITY_HASH_PREFIX.length));
    return getActivity(id) ? id : null;
  } catch {
    return null;
  }
}

/**
 * Owns the single activity modal for the whole site, so any page can open it.
 *
 * URL: opening pushes `#projects/<id>`; switching to a related activity replaces
 * it; closing replaces it with `#projects`. Visiting a `#projects/<id>` link (or
 * pressing Back/Forward onto one) opens that activity.
 */
const ActivityDialogProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { prefill } = useVolunteerPrefill();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  /** The element that opened the modal; focus goes back to it on close. */
  const originRef = useRef<HTMLElement | null>(null);
  /** Keeps the content mounted while the closing animation plays. */
  const lastIdRef = useRef<string | null>(null);
  /** Set when "Volunteer for this activity" closes the modal and should open the Volunteer page afterwards. */
  const goToVolunteerRef = useRef(false);

  const activeIdRef = useRef<string | null>(null);

  activeIdRef.current = activeId;
  if (activeId) lastIdRef.current = activeId;

  const openActivity = useCallback((id: string, origin?: HTMLElement | null) => {
    if (!getActivity(id)) return;
    prefetchActivityDialog();
    originRef.current =
      origin ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    window.history.pushState(null, "", `${ACTIVITY_HASH_PREFIX}${encodeURIComponent(id)}`);
    setActiveId(id);
  }, []);

  const selectRelated = useCallback((id: string) => {
    if (!getActivity(id)) return;
    window.history.replaceState(null, "", `${ACTIVITY_HASH_PREFIX}${encodeURIComponent(id)}`);
    setActiveId(id);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) return;
    // After "Volunteer" the site is about to move to the Volunteer page, so don't rewrite the URL.
    if (!goToVolunteerRef.current) {
      // Back to "#projects" on the Our Work page; elsewhere (the home preview) back to the plain page URL.
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", pathname === ROUTES.ourWork ? PROJECTS_HASH : `${pathname}${search}`);
    }
    setActiveId(null);
  }, []);

  const handleVolunteer = useCallback(
    (activity: Activity) => {
      prefill([activity.interestTag]);
      goToVolunteerRef.current = true;
      setActiveId(null);
    },
    [prefill],
  );

  // After the modal has fully closed (scroll lock released): open the Volunteer page, or return focus.
  // The pre-selected interest lives in the app-level prefill provider, so it survives the page change.
  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      event.preventDefault();

      if (goToVolunteerRef.current) {
        goToVolunteerRef.current = false;
        navigate(ROUTES.volunteer);
        return;
      }

      const origin = originRef.current;
      const target =
        origin && origin.isConnected
          ? origin
          : document.querySelector<HTMLElement>(`[data-activity-card="${lastIdRef.current}"]`);
      target?.focus();
      originRef.current = null;
    },
    [navigate],
  );

  // Deep links and the browser's Back/Forward buttons. Also re-checked when the router moves to a new
  // page or hash (for example the old-link redirect from /#projects/<id> to /our-work#projects/<id>).
  useEffect(() => {
    const sync = () => {
      const id = activityIdFromHash(window.location.hash);
      if (id && activeIdRef.current === null) {
        // Arrived via a link or history: put the Projects section behind the modal.
        document.getElementById(SECTION_IDS.projects)?.scrollIntoView({ block: "start" });
      }
      setActiveId(id);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [pathname, hash]);

  const value = useMemo(() => ({ openActivity, prefetchActivityDialog }), [openActivity]);
  const shownId = activeId ?? lastIdRef.current;

  return (
    <ActivityDialogContext.Provider value={value}>
      {children}
      {shownId && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 text-white" role="status">
              <span className="rounded-full bg-white/10 px-5 py-3 text-sm backdrop-blur">Loading activity details…</span>
            </div>
          }
        >
          <ActivityDialog
            activity={getActivity(shownId)}
            open={activeId !== null}
            onOpenChange={handleOpenChange}
            onSelectRelated={selectRelated}
            onVolunteer={handleVolunteer}
            onCloseAutoFocus={handleCloseAutoFocus}
          />
        </Suspense>
      )}
    </ActivityDialogContext.Provider>
  );
};

export default ActivityDialogProvider;

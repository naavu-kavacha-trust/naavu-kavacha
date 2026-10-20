import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/data/siteConfig";
import { resolveLegacyHash } from "@/lib/legacy-redirects";

/**
 * Old links like `https://…/#projects` still work: when the site is first opened on "/" with a hash that
 * used to be a section of the single long page, send the visitor to that content's new page.
 * It runs once per load, and replaces the history entry so the Back button does not bounce.
 */
const LegacyHashRedirect = () => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (pathname !== ROUTES.home) return;
    const destination = resolveLegacyHash(hash);
    if (destination) navigate(destination, { replace: true });
    // Only the location at load time matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default LegacyHashRedirect;

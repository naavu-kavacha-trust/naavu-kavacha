import { LEGACY_HASH_REDIRECTS, ROUTES } from "@/data/siteConfig";

const ACTIVITY_PREFIX = "projects/";

/**
 * Maps an old single-page hash (`#projects`, `#faq`, ...) to its new location, or null when the hash
 * should stay where it is (`#impact`, `#contact`, unknown ids, or an empty hash).
 * Old shared activity links (`#projects/<id>`) go to the Our Work page with the same hash, which
 * opens the same pop-up.
 */
export function resolveLegacyHash(hash: string): string | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  if (id.startsWith(ACTIVITY_PREFIX) && id.length > ACTIVITY_PREFIX.length) {
    return `${ROUTES.ourWork}#${id}`;
  }
  return Object.prototype.hasOwnProperty.call(LEGACY_HASH_REDIRECTS, id)
    ? LEGACY_HASH_REDIRECTS[id]
    : null;
}

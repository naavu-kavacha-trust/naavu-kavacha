# Missing assets

Photos the site still needs. Until they are added, the affected spots use a neutral
leaf placeholder. Never use stock photos; these should be real Naavu Kavacha photographs.

_Last updated: Phase 8 of the multi-page build (final QA). See `CHANGES.md`, section A.4, for the full client checklist._

## Provided (extracted from the specification PDF, Appendix A)

| File | Source |
|---|---|
| `src/assets/activities/seedball-preparation.jpg` | Reference Image 01 |
| `src/assets/gallery/team-tunturu.jpg` | Reference Image 02 |
| `src/assets/activities/cleanup-drive.jpg` | Reference Image 03 |
| `src/assets/activities/awareness-1.jpg` | Client photo (school awareness session), converted from HEIC |
| `src/assets/activities/seed-collection-1.jpg` | Client photo (collected seeds), converted from HEIC |
| `src/assets/activities/growing-ganesha-1.jpg` | Client photo (students with clay Ganesha idols), converted from HEIC |
| `src/assets/activities/bird-feeders-1.jpg` | Client photo (volunteers working with bamboo). Assumed to be the bird-feeder workshop: please confirm |
| `src/assets/logo.png`, `public/favicon.*`, `public/apple-touch-icon.png` | Client logo (round version for the header, menu, footer and browser tab) |

## Still needed

| Where | What | Target path |
|---|---|---|
| Gallery (Phase 8) | 8 event photographs added alongside `team-tunturu.jpg`; 11 more would bring the gallery to about 20. Captions and categories only if supplied: add them to `GALLERY_DETAILS` in `src/data/gallery.ts` (filter chips appear once 2+ categories exist). | `src/assets/gallery/01.jpg` … `08.jpg` |
| Oath for Change slider (Phase 7) | 10 photos supplied and added. Names and captions remain omitted until confirmed; descriptive alt text is in `OATH_DETAILS` in `src/data/oath.ts`. | `src/assets/oath/01.jpg` … `10.jpg` |
| Seedball Dispersal | Photos from the dispersal sites (only the seedball-making photo exists) | `src/assets/activities/seedball-dispersal-1.jpg` … |
| Sapling Plantation | Extra photos (one cover exists) | `src/assets/activities/sapling-plantation-1.jpg` … |
| Community Activities | Photos of the Water Day event and collaborations (see note below) | `src/assets/activities/community-activities-1.jpg` … |
| Clean-Up Drive | Extra photos (two exist) | `src/assets/activities/clean-up-drive-1.jpg` … |

Files named `<activity-id>-<number>.jpg` (also `.png`, `.webp`) in `src/assets/activities/` are picked up
automatically and added to that activity's photo carousel; the first one becomes the card image if the
activity has no cover yet. Activity ids are listed in `src/data/activities.ts`.

## About Us page (Phase 4)

Nothing below is invented; each part simply does not appear until it is supplied.

| What | Where it goes |
|---|---|
| **Story photo** (optional). The page uses the existing "hands holding a seedling" picture until then | Save as `src/assets/about/about-story.jpg` (at most 1600 px wide, no GPS or camera data in the file), then uncomment `storyImage` in `src/data/about.ts` and write alt text describing what is visibly in it |
| **Mission**, in the team's own words (one or two sentences) | `mission` in `src/data/about.ts` |
| **Vision**, in the team's own words | `vision` in `src/data/about.ts` |
| **Values** (optional, three or four at most): a short title and one sentence each | `values` in `src/data/about.ts` |

## Founder and Co-Founder

**Done:** Ajay Gowda H (Founder) and Nidhi B S (Co-Founder) are in `src/data/team.ts`, with the bios exactly as supplied
(only a paragraph break was added). A test fails if anyone edits those words by accident.

**Still needed, for each of them:**

| What | Notes |
|---|---|
| **Portrait photo** | Save as `src/assets/team/ajay-gowda-h.jpg` and `src/assets/team/nidhi-b-s.jpg`. About 1200 x 1500 px (4:5), under about 250 KB, camera and location data removed. Until then the initials **AG** and **NB** are shown |
| **Written consent** to their name and bio being published | From a parent or guardian if they are under 18. Both entries currently say "consent not yet confirmed" in their private `note`. **Confirm this before the site goes live**, then update the note. To hide either person at once, set `consent: false` |
| Optional: a **message in their own words**, a **pull-quote**, **LinkedIn / Instagram** links (https only) | The bios are shown now; if a message is added it is shown instead of the bio |

## Core Team (Phase 6)

The Core Team grid stays hidden until someone is added **with consent**. For each person:

| What | Notes |
|---|---|
| **Name** and **role**, exactly as they want them written | Shown on every card |
| **Photo** | Save as `src/assets/team/<id>.jpg` (about 1200 x 1500 px, 4:5, under about 250 KB, camera and location data removed). Without one, their initials are shown |
| Optional: a **short bio** (third person) and **LinkedIn / Instagram** links | Only when there is a bio or a link does the card open a pop-up. Otherwise it is a plain card |
| **Consent** | A written yes to their name and photo being published; from a parent or guardian if under 18 |

Add them in `src/data/team.ts` with `group: "core"` and `consent: true`, and set `order` to control the sequence.
No phone numbers or email addresses are ever shown; the only way to reach someone is a social link they chose to share.
Founders and co-founders have their own sections, so do not add them here as well.

## Before the site goes live (people and domain)

| What | Why it matters |
|---|---|
| **Written consent from Ajay Gowda H and Nidhi B S** (a parent or guardian, if under 18) | Both are published on `/about` today (`consent: true` in `src/data/team.ts`) using bios supplied by the site owner; the people's own agreement is not recorded. Confirm, then update the `note`. Set `consent: false` to hide either one at once |
| **The live domain** | Set `SITE_URL` in `src/data/siteConfig.ts` (sitemap) and make the `og:image` address in `index.html` absolute |
| Heading wording "Our Founder", "Our Co-Founder", "Core Team" | Placeholders: confirm or change `GROUP_COPY` in `src/data/team.ts` |

## Notes

- Existing images were compressed in Phase 1 (`community`, `sapling`, `cleaning`, `waterman`, `hero-bg`); filenames are unchanged.
- The reference images were extracted from the PDF at their embedded resolution and resized for the web. Replace with originals if you have them.
- **Please check `src/assets/community.jpg`.** It is the cover of "Community Activities" (as on the live
  site) but it shows a clean-up drive, not the Water Day event. Swap it if it is the wrong photo.
- **`src/assets/seedballs.jpg` is no longer used.** It looks like a stylised stock-style image rather than
  a Naavu Kavacha photo, so Seedball Dispersal uses the real seedball photo instead. Delete it if unwanted.
- **What We Do cards.** All seven now show photos. Each activity still has only one photo; a second or third
  (`<id>-2.jpg`, `<id>-3.jpg`) turns its pop-up into a carousel.
- **Photos of children.** The Growing Ganesha, school awareness and newly added gallery photos show schoolchildren's
  faces. Please confirm the school and parents have agreed to the photos being published.
- **Logo.** The supplied logo is a JPEG on a black background, so it is shown as a round badge. If the team has the
  logo as an SVG or a transparent PNG, drop it in as `src/assets/logo.png` for a crisper result at small sizes.
- **Share image (Phase 9).** `public/og-image.jpg` (the picture shown when the link is shared on WhatsApp, Facebook
  or X) is a 1200 x 630 crop of `hero-bg.jpg`. Replace it with a designed share image if the team has one, and make
  the `og:image` URL in `index.html` absolute once the domain is known.


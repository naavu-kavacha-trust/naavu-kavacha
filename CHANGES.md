# Naavu Kavacha site: change report

This file has two parts: **Part A** (newest) is the multi-page restructure, About Us revamp and final QA (Phases 1 to 8).
**Part B** is the earlier nine-phase improvement pass on the original single-page site, kept for reference. Where Part B
says "section", "the page" or `/#…` links, read "the page that section now lives on" (see the table in A.2).

---

# Part A: multi-page site, About Us revamp, final QA

Nothing was redesigned and no facts were invented. Anything unconfirmed is hidden or marked `TODO(client)`.

## A.1 Phase 8 result (final QA, docs and handoff)

_Verified on the production build:_ `npm run lint` 0 errors (the same 7 known react-refresh warnings in shadcn/ui files),
`npm run test` **416 passing** (26 files), `npm run build` succeeds, `npm run test:e2e` **101 passing, 19 skipped** (see below).
No console errors and no sideways scroll on any page at 360, 390, 768, 1024 and 1440 px.

| Check (8.1) | Result |
|---|---|
| Five pages and a bad address at 360 / 390 / 768 / 1024 / 1440 px | No horizontal scroll, exactly one `h1` and one `main` on each |
| Navbar, About sub-navigation, floating button and footer | Never cover each other or a jumped-to heading (tested at all five widths) |
| axe-core, serious and critical issues | **0** on all five pages and the 404 page at phone and desktop widths (30 page-and-width combinations checked) |
| Every internal link and every old `/#hash` redirect | Resolves; each link's target id exists (crawled in the browser tests) |
| Console errors, failed requests to the site | None (a blocked third-party font request on a locked-down network is ignored) |
| Keyboard: skip link, navbar, mobile menu, About sub-navigation, activity pop-up, photo viewer | Reachable, visible focus, Tab stays inside open dialogs, focus returns to the control that opened them |

**What QA found and fixed**

1. **Text contrast below 4.5:1** (axe "serious"). Grey body text on the sand and muted backgrounds was 3.9 to 4.5:1 (it showed in the
   Founder and Co-Founder text and on the 404 page). The one colour token `--muted-foreground` in `src/index.css` is a touch darker
   (`150 10% 40%` to `150 10% 35%`); it is now 4.7:1 or better on every background. The labels in the home Impact band were 70% white
   on green (3.6 to 3.9:1) and are now 90% (`Impact.tsx`).
2. **404 page**: had no `<main>` landmark, wrote an error to the console on every visit, and had a low-contrast line. It is now a
   proper page (`NotFound.tsx`): `<main>`, one `h1`, a "Return to Home" link with a 44 px tap area, its own tab title, no console noise.
3. **Footer "Quick Links" heading** was an `h4` straight after `h2` headings (skipped a level); now `h3` (`Footer.tsx`).
4. **Footer tap targets** shrank to 28 px on tablets (768 and 1024 px). They now stay 44 px until the desktop breakpoint (`xl`, 1280 px).
5. **A flaky browser test** ("sub-nav sticks under the navbar") measured before the deep link had scrolled; it now waits for the scroll.

**Left as is, and why:** (a) axe also lists two "moderate" best-practice notes: the floating "Become a Volunteer" button sits outside any
landmark, and the 404 page has no navbar. Neither affects use. (b) The desktop navbar links are 20 px tall; they show only from 1280 px
up, where a mouse is the norm, and everything below that uses the 44 px menu. (c) Lighthouse performance was not re-measured in this phase.

**Tests added**
- `e2e/smoke.spec.ts` (about 50 new tests): every route loads (status, title, one `h1`, one `main`, no errors); the 404 page; **all twelve
  legacy redirects** and old `#projects/<id>` links; a link crawl of every internal link on every page; Founder and Co-Founder (order,
  chips, headings, opposite sides on desktop); keyboard (skip link, focus visible on the first 12 Tab stops per page, About chips, pop-up
  focus return, dialog focus trap); no-overlap checks at five widths; axe-core on every page at phone and desktop widths.
- `src/test/phase8-qa.test.tsx`: the contrast tokens (computed), the 404 page, the footer heading level, footer tap areas, the Impact labels.
- **Skipped on purpose (19):** 12 axe tests skip until you run `npm install -D axe-core` once (no dependency was added); 7 Core Team
  grid and pop-up tests skip until a core team member exists. Both groups are fully covered by unit tests with fixtures
  (`core-team.test.tsx`, `founder-section.test.tsx`) in the meantime, and the browser tests run unchanged once people are added.
- Existing test changed: the "sticks directly under the navbar" browser test (see 5 above).

## A.2 Where everything went

| Page | URL | Contains |
|---|---|---|
| Home | `/` | Hero, short About teaser, three What We Do cards, Impact, gallery preview (hidden below 3 photos), volunteer band |
| About Us | `/about` | Our Story, Mission & Vision (when supplied), Founder, Co-Founder, Core Team (when added), The Journey So Far, Future Plans |
| Our Work | `/our-work` | What We Do, Projects & Activities |
| Gallery | `/gallery` | Special Moments (Oath for Change), photo gallery |
| Volunteer | `/volunteer` | Volunteer form, WhatsApp channel, FAQ |

Old links (`/#projects`, `/#faq`, `/#journey` and so on) still work: see "Old links keep working" in the README.
Home page height at 390 px is now about 5,990 px; the home bundle is unchanged (139.5 kB gzip) and each other page is its own
chunk (About 7.4 kB, Our Work 2.6 kB, Gallery 4.7 kB, Volunteer 5.6 kB gzip).

## A.3 Phase by phase

- **Phase 1 Routing and shell.** `ROUTES`, `NAV_ITEMS` and `LEGACY_HASH_REDIRECTS` in `siteConfig.ts`; `PageLayout`, `AppProviders`;
  scroll-to-top and focus on page change; route-based `aria-current`; navbar Volunteer button; page titles; `_redirects` and `vercel.json`.
- **Phase 2 Move sections.** `PageHero` and the four new pages.
- **Phase 3 Slim home.** `AboutTeaser`, `WhatWeDoPreview`, `GalleryPreview`, `VolunteerBand`; footer links re-pointed.
- **Phase 4 About revamp.** `about.ts`, `OurStory`, `MissionVision`, `AboutSubNav`; cream/sand rhythm.
- **Phase 5 Founder and Co-Founder.** `team.ts`, `FounderSection` (used twice), `InitialsAvatar`.
- **Phase 6 Core Team.** `CoreTeam` grid with accessible pop-up. Hidden until a consented member is added.
- **Phase 7 Polish.** Page fade, per-page titles and descriptions (`PAGE_META`), sitemap script, code splitting, prefetch on hover.
- **Phase 8 Final QA, docs and handoff.** This section.

## A.4 What is still needed from the client (and what the site shows meanwhile)

| # | Needed | Shown today if missing |
|---|---|---|
| 1 | **Written consent from Ajay Gowda H and Nidhi B S** (or a parent or guardian if either is under 18). Their entries are set to `consent: true` using the bios the site owner supplied in chat, but their own agreement is **not recorded** (see the `note` in `team.ts`). **Please confirm before the site goes live.** To hide either person at once set `consent: false` | Both appear on `/about` with their bios |
| 2 | Portrait photos for both: `src/assets/team/ajay-gowda-h.jpg`, `nidhi-b-s.jpg` (4:5, about 1200 x 1500, under about 250 KB, no EXIF) | Initials avatars **AG** and **NB** |
| 3 | Core team: name, role, photo, optional bio and social link, and consent for each person | The Core Team section and its chip do not appear |
| 4 | Mission, vision and optional values (their own words) | The Mission & Vision block and its chip do not appear |
| 5 | An About story photo (`src/assets/about/about-story.jpg`, then uncomment `storyImage` in `about.ts`) | The existing "hands holding a seedling" picture |
| 6 | Heading wording for the three people sections ("Our Founder", "Our Co-Founder", "Core Team" are placeholders to confirm) | Those headings |
| 7 | **The live domain**: set `SITE_URL` in `siteConfig.ts` (writes `sitemap.xml` and the `Sitemap:` line in `robots.txt`) and make `og:image` in `index.html` absolute | No sitemap; link previews on WhatsApp, Facebook and X may not show the image |
| 8 | Gallery photos (about 20), Oath for Change photos (6 to 10), extra activity photos | Gallery shows one photo plus placeholder tiles; the home gallery strip stays hidden until 3 real photos exist; the Oath slider shows 3 placeholders |
| 9 | Where volunteer registrations go: `VITE_VOLUNTEER_ENDPOINT` (README, "Volunteer form") | The form opens a pre-filled email |
| 10 | Confirmation of the four hidden impact figures (activities, schools, volunteers, community participation) | Hidden |
| 11 | One package manager: run `npm install` or `bun install` once and delete the other lockfiles (the lockfiles were deliberately not touched) | `npm ci` fails until this is done |
| 12 | Photos of schoolchildren (Growing Ganesha, school awareness): confirm school and parents agree to publication | Published as supplied |

## A.5 Files moved, re-pointed or removed (all phases)

- **Moved off the home page** (content unchanged): Special Moments, Projects, Journey, Future Plans, Join Us and the full Gallery now
  live on their own pages; FAQ moved to `/volunteer`.
- **Re-pointed:** `SectionCta`, Hero buttons, `ActivityDialog` ("Volunteer for this activity"), `FloatingCTA`, footer Quick Links,
  `scrollToSection` callers, and old shared activity links (`/#projects/<id>` now open on `/our-work`).
- **Removed or replaced:** the home-page scroll-spy (replaced by route-based highlighting; `useActiveSection` now powers the About
  sub-navigation); the console error in the 404 page. No link or content was deleted without a replacement.
- **Tests rewritten for the multi-page structure:** `page-structure`, `phase2`, navbar and menu tests (single page assumptions) in
  Phases 1 to 3.
- **Not built:** a separate `/faq` page (FAQ stays on `/volunteer`; revisit if its questions are mostly general), per-page share
  images (none were supplied), a Privacy Policy and Terms page (no text supplied).

---

# Part B: the earlier nine-phase pass (single-page site)

An improvement pass over the existing site, delivered in nine phases. Nothing was redesigned; no facts were
invented (anything unconfirmed is left out or marked `TODO(client)` in the code).

_Verified on the production build: `npm run lint` 0 errors (7 known warnings in shadcn/ui files), `npm run test` 117
passing, `npm run build` succeeds, `npm run test:e2e` 5 passing, no console errors, no sideways scroll at
360 / 390 / 768 / 1024 / 1440 px._

## 1. Requirement checklist

| # | Requirement | Status | Evidence / what is left |
|---|---|---|---|
| 1 | Partner Up works | **Done** | Opens a chooser with an email link (subject "Partnership Inquiry"), a Gmail link and a copy button. |
| 2 | Email Us works | **Done** | Same chooser, subject "General Inquiry", from the footer and the mobile menu. |
| 3 | Mobile navigation works | **Done** | Slide-in menu lists all eight items, closes after a tap or Escape, returns focus to the menu button (fixed in Phase 9). Covered by a browser test. |
| 4 | Projects & Activities interactive | **Done** | Filter chips, pop-up per activity, shareable links such as `/#projects/growing-ganesha`, related-activity chips, "Volunteer for this activity". |
| 5 | Volunteer / Join CTA across the site | **Done** | Every section from the hero to the FAQ now ends in, or contains, a link to the volunteer section (Phase 9 added the missing ones to About, Projects, The Journey, Future Plans and FAQ). A test enforces it. Floating "Become a Volunteer" button on phones and desktop. |
| 6 | Outcome / Impact section | **Partial** | Six verified figures shown (9000+ seeds, 3000+ seedballs, 45+ saplings, 10+ bird feeders, 150+ Growing Ganesha, about 773 kg paper). Four figures stay hidden until the client confirms them (see questions). |
| 7 | Activity images | **Done** | All 8 activities now have a photo (the client's four new photos were added after Phase 9). Each has one photo so far; more can be dropped in. |
| 8 | Gallery | **Partial** | Built and working (grid, full-screen viewer, keyboard, swipe, lazy loading). Only 1 photo exists; the rest of the grid is placeholder tiles. |
| 9 | Growing Ganesha (150+) | **Done** | Single source in `src/data/impact.ts`; shown as 150+ everywhere, never 100+. |
| 10 | Oath for Change slider | **Partial** | Built (1 / 2 / 3 slides by screen size, autoplay with pause, swipe, arrows, dots, full-screen viewer). No photos supplied yet, so it shows 3 placeholders. |
| 11 | Improved navigation | **Done** | Eight items, scroll-spy highlight, skip link, one main landmark, deep links that now work on a fresh page load. |
| 12 | Icons replaced with photos where possible | **Done** | All 7 What We Do cards use photos. |
| 13 | Volunteer registration form | **Partial** | Form, validation, spam trap and success/error states done. No destination is configured (`VITE_VOLUNTEER_ENDPOINT` is empty), so submissions open a pre-filled email instead. It has not been tested against a live Google Apps Script. |
| 14 | Clean-Up Drive block under What We Do | **Done** | Photo + text + "See Clean-Up Drives" and "Join the next drive" (pre-selects that interest in the form). |

## 2. Journey check

Scrolled top to bottom as a first-time visitor: Home, Who We Are, What We Do, Impact, Projects & Activities, Special
Moments (Waterman story then Oath for Change), Gallery, The Journey So Far, Future Plans, Volunteer, FAQ, Contact. Each
section has a Join Us style action: Hero "Join Us", About "Join Us", What We Do "Join the next drive", Impact "Join Us",
Projects "Join Us", Oath "Take the oath with us", Gallery "Be in the next photo", Journey / Future / FAQ "Join Us", then the
form itself.

## 3. Quality results (Phase 9)

| Check | Result |
|---|---|
| Responsive (360, 390, 768, 1024, 1440 px) | No horizontal overflow, no overlapping fixed elements, no console errors, every image has alt text |
| Tap targets on phones | 44 px or more (logo and footer links fixed in Phase 9; activity cards are one big button) |
| axe-core accessibility audit | No violations on the page at phone and desktop widths |
| Lighthouse mobile (simulated slow 4G, 4x CPU, run in a sandbox) | Accessibility **100**, Best Practices **96**, SEO **100**, Performance **72 to 80** across runs (started at 54) |
| Real, unthrottled timings (same sandbox) | First and largest contentful paint about 0.7 s, layout shift 0 |

**Performance did not reach the 85 target in the lab.** The remaining cost is the single JavaScript start-up on a
simulated slow phone (React rendering the whole page at once). What was done: fonts no longer block the first paint,
hero entrance is plain CSS, the volunteer form, activity pop-up, photo viewer and animation features load in their own
chunks, two unused libraries (toasts and data-fetching providers) were dropped from start-up, the 735 KB favicon became
25 KB. Best Practices loses its few points to a failed Google Fonts request in the sandbox (blocked network), which
should not happen on a real connection. Please re-run Lighthouse on the deployed site. Getting past 85 reliably most
likely needs pre-rendering the page at build time (see next steps).

## 3b. Added after Phase 9: client photos, logo and legal entity

- **Photos.** The four photos supplied by the client (school awareness session, collected seeds, students with clay
  Ganesha idols, volunteers working with bamboo) were converted from HEIC to web JPEGs (about 125 to 375 KB each),
  rotated correctly and added to Creating Awareness, Seed Collection, Growing Ganesha and Bamboo Bird Feeders. Each has
  hand-written alt text that describes only what is visible. The bamboo photo is assumed to be the bird-feeder workshop;
  please confirm.
- **Logo.** The client logo appears as a round badge in the header, the mobile menu and the footer, and as the browser
  tab icon and phone home-screen icon.
- **Legal entity.** "(Legal Entity: Naavu Kavacha Trust)" sits directly under NAAVU KAVACHA in the header (so it is
  on the homepage) and in the footer. The wording lives in one place, `LEGAL_ENTITY` in `src/data/siteConfig.ts`.
_Files:_ `src/components/BrandLockup.tsx` (new), `Navbar.tsx`, `Footer.tsx`, `src/data/siteConfig.ts`,
`src/data/activities.ts` (alt text for dropped-in photos), `src/assets/logo.png`, `src/assets/activities/*-1.jpg`,
`public/favicon.png`, `public/favicon.ico`, `public/apple-touch-icon.png`, `index.html`,
`src/test/brand-and-photos.test.tsx`.

**Footer redesign.** The footer now follows the layout of the reference the client shared (layout only, our own brand and
colours): logo and name with a short description on the left, a round Instagram icon that opens the Instagram page in a new
tab, a "Quick Links" column on the right, a divider, then the copyright line with "Legal Entity: Naavu Kavacha Trust",
"Email Us" and "Back to top". Privacy Policy and Terms of Service links from the reference were left out because those pages
do not exist (add them when the client supplies the text). `src/components/Footer.tsx`.

## 4. What changed, phase by phase

Phases 1 and 2 were done before this working session; they are summarised here from the code and tests.

**Phase 1: foundations.** Stable section ids and journey order; `src/data/siteConfig.ts` as the single home for the
contact email, links, navigation and section ids; `SmartImage` (lazy loading, reserved space, leaf placeholder when a
photo is missing); large photos compressed; placeholder Gallery anchor.
_Files:_ `src/data/siteConfig.ts`, `src/components/ui/SmartImage.tsx`, `src/pages/Index.tsx`, `src/assets/*`.

**Phase 2: navigation and contact.** Eight-item navigation with scroll-spy; mobile slide-in menu; `ContactDialog`
(email app, Gmail, copy address) behind Partner Up and Email Us; "Join Us" replaces "Connect"; raw `mailto:` links removed.
_Files:_ `src/components/Navbar.tsx`, `ContactDialog.tsx`, `src/lib/contact.ts`, `src/hooks/use-active-section.ts`, `Footer.tsx`, `JoinUs.tsx`.

**Phase 3: Projects & Activities.** Eight activities from one data file, filter chips, card grid, pop-up with photo
carousel, related chips, deep links, focus return, "Volunteer for this activity".
_Files:_ `src/data/activities.ts`, `src/data/interests.ts`, `ActivityCard.tsx`, `ActivityDialog.tsx`, `ActivityDialogProvider.tsx`,
`VolunteerPrefillProvider.tsx`, `Projects.tsx`, `src/hooks/use-activity-dialog.ts`, `use-volunteer-prefill.ts`.

**Phase 4: Impact.** "What We Have Achieved" with animated counters; every number comes from one data file and only
verified figures are shown; About and Journey read the same figures.
_Files:_ `src/data/impact.ts`, `CountUp.tsx`, `Impact.tsx`, `About.tsx`, `Journey.tsx`.

**Phase 5: volunteer form.** Registration form with validation, spam trap, send to an endpoint or fall back to a
pre-filled email (never fakes success), Partner Up, WhatsApp link, floating Become a Volunteer button, README guide for
collecting registrations in a Google Sheet.
_Files:_ `src/lib/volunteer.ts`, `VolunteerForm.tsx`, `JoinUs.tsx`, `FloatingCTA.tsx`, `src/hooks/use-floating-cta-visibility.ts`,
`Footer.tsx`, `.env.example`, `README.md`.

**Phase 6: What We Do.** Seven cards from the activity data (photo or icon), the Clean-Up Drive feature block.
_Files:_ `WhatWeDo.tsx`, `CleanUpDriveFeature.tsx`, `src/data/activities.ts`.

**Phase 7: Special Moments.** Waterman story plus "Oath for Change – A Living Milestone" with the client's text word for
word, photo slider, and the shared full-screen `Lightbox`. New dependency: `embla-carousel-autoplay`.
_Files:_ `SpecialStory.tsx`, `OathSlider.tsx`, `Lightbox.tsx`, `src/data/oath.ts`, `package.json`.

**Phase 8: Gallery.** Grid of 2 / 3 / 4 columns loading from `src/assets/gallery/`, full-screen viewer with counter,
keys, swipe and preloading, optional filter chips, "Be in the next photo".
_Files:_ `Gallery.tsx`, `src/data/gallery.ts`.

**Phase 9: QA and polish.**
- Fixed: opening a shared link such as `/#gallery` or `/#volunteer` on a fresh page load did not scroll (new `src/hooks/use-initial-hash-scroll.ts`).
- Fixed: closing the mobile menu with Escape, the close button or a tap outside left focus on the page body; it now returns to the menu button.
- Added a closing Join Us action to About, Projects, The Journey, Future Plans and FAQ (`src/components/SectionCta.tsx`).
- Accessibility: one `<main>` landmark and a "Skip to main content" link; footer text contrast raised; 44 px tap areas for the logo and footer links. axe-core is clean.
- Performance: fonts moved out of a blocking CSS import; hero entrance in plain CSS; framer-motion features load after first paint (`src/lib/motion-features.ts`, `LazyMotion` in `Index.tsx`); unused providers removed from `App.tsx`; form chunk placeholder sized like the real form to avoid layout jumps; favicon 735 KB to 25 KB.
- Meta: Open Graph image, Twitter card, theme colour (`index.html`, `public/og-image.jpg`).
- Tests: new `src/test/phase9.test.tsx` (landmarks, skip link, deep link scroll, menu focus, `index.html`, Join Us on every section); test setup now renders the page once so lazy parts are ready; Playwright smoke tests in `e2e/smoke.spec.ts` for the mobile menu, the photo viewer, deep links and the activity pop-up.
- Cleanup: removed the unused `NavLink.tsx`; replaced `playwright.config.ts` (it imported a package that is not installed) and removed `playwright-fixture.ts` (same reason); added `npm run test:e2e`; README rewritten with the data map, how to add photos and numbers, and the endpoint guide.
_Files:_ `index.html`, `src/App.tsx`, `src/pages/Index.tsx`, `src/index.css`, `Hero.tsx`, `Navbar.tsx`, `Footer.tsx`, `JoinUs.tsx`,
`About.tsx`, `Projects.tsx`, `Journey.tsx`, `FuturePlans.tsx`, `FAQ.tsx`, `SectionCta.tsx`, `src/hooks/use-initial-hash-scroll.ts`,
`src/lib/motion-features.ts`, `src/test/setup.ts`, `src/test/phase9.test.tsx`, `e2e/smoke.spec.ts`, `playwright.config.ts`,
`package.json`, `README.md`, `MISSING_ASSETS.md`, `public/favicon.png`, `public/og-image.jpg`.

## 5. Missing assets (from `MISSING_ASSETS.md`)

| Where | What is needed |
|---|---|
| Gallery | About 19 more event photos (plus `team-tunturu.jpg`) in `src/assets/gallery/` |
| Oath for Change slider | 6 to 10 photos in `src/assets/oath/`; names or captions only if confirmed |
| Every activity | One photo each so far. Extra photos (`<id>-2.jpg` …) turn the pop-up into a carousel; Community Activities especially needs Water Day photos |
| Logo and share image | The logo as an SVG or transparent PNG (the supplied JPEG has a black background), and an optional designed 1200 x 630 share image |

## 6. Open questions for the client

1. **Contact email.** Is `naavu.kavacha@gmail.com` the official address? (One place to change: `EMAIL` in `src/data/siteConfig.ts`.)
2. **Where should volunteer registrations go?** Set `VITE_VOLUNTEER_ENDPOINT` (the README explains the free Google Sheet route). Until then the form opens a pre-filled email. Please also send one test registration once it is live.
3. **Unverified figures.** Activities conducted, schools reached (an earlier draft said 11), number of volunteers, community participation: confirm each number to show it.
4. **Oath for Change.** Photos, and the names or captions of the personalities, if they want them shown.
5. **Gallery.** About 19 more photos, plus any captions or categories (categories turn on filter chips).
6. **Activities.** Dates and outcomes; permission to publish the photos that show schoolchildren; is the bamboo photo the bird-feeder workshop? Is `community.jpg` (shows a clean-up, not the Water Day event) the right cover for Community Activities? `seedballs.jpg` looks like a stock-style image and is unused; delete it?
7. **Form wording.** The privacy line under the volunteer form is a placeholder (`TODO(client)`); the Bird Feeders activity uses the interest "Community outreach" as a stand-in.
8. **Domain and branding.** The live domain (to make the share-image URL absolute), and the official logo and favicon.
9. **Package manager.** Choose npm or bun; the current lockfiles are out of sync with `package.json`.

## 7. Recommended next steps

1. Run `npm install` (or `bun install`), commit one lockfile, and delete the others. Then `npm run lint && npm run test && npm run build`.
2. Deploy, then re-run Lighthouse on the live URL and test the volunteer form end to end.
3. To pass the 85 performance mark reliably: pre-render the page at build time, self-host the two fonts, and serve photos as WebP with responsive sizes.
4. Add the missing photos and confirmed figures; every one of them is a drop-in change (see README, "Adding content").
5. Run `npm run test:e2e` in CI along with lint, unit tests and build.

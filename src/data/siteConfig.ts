/**
 * Site-wide constants. Components read from here instead of hard-coding
 * contact details, links or navigation.
 */

/** Shown under the brand name in the header and footer. */
export const LEGAL_ENTITY = "[Legal Entity: Naavu Kavacha Trust]";

export const EMAIL = "naavu.kavacha@gmail.com"; // TODO(client): confirm this is the official address

export const INSTAGRAM_URL =
  "https://www.instagram.com/naavu_kavacha?igsh=emQwZDQ5NjRwbGY3";

export const LINKEDIN_URL = "https://www.linkedin.com/company/naavukavacha-trust";

export const WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbCWaid5fM5c0TJFbb1N";

/**
 * Where volunteer registrations are POSTed as JSON (Google Apps Script,
 * Formspree, etc.). Leave empty to use the email fallback. See .env.example.
 */
export const VOLUNTEER_ENDPOINT: string =
  import.meta.env.VITE_VOLUNTEER_ENDPOINT ?? "";

/** Page URLs. Use these instead of string literals so a rename happens in one place. */
export const ROUTES = {
  home: "/",
  about: "/about",
  ourWork: "/our-work",
  gallery: "/gallery",
  volunteer: "/volunteer",
} as const;

/** Legal pages linked from the footer, kept out of the main navigation and five-page sitemap. */
export const LEGAL_ROUTES = {
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Optional trust details shown on the legal pages. Leave unknown fields empty; never guess. */
export const LEGAL_DETAILS = {
  lastUpdated: "20 October 2026",
  registrationNumber: "",
  registeredAddress: "",
  contactPerson: "",
};

export interface NavItem {
  label: string;
  /** A page URL from ROUTES, or an in-page jump such as "#contact" (the footer is on every page). */
  href: string;
}

/** True when the href is a page URL rather than an in-page "#jump". */
export const isRouteHref = (href: string): boolean => href.startsWith("/");

/** Top-level navigation, left to right. The filled "Volunteer" button is added by the navbar itself. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: ROUTES.home },
  { label: "About Us", href: ROUTES.about },
  { label: "Our Work", href: ROUTES.ourWork },
  { label: "Gallery", href: ROUTES.gallery },
  { label: "Contact", href: "#contact" },
];

/** Section ids used for anchors, scroll-spy and CTAs. */
export const SECTION_IDS = {
  home: "home",
  about: "about",
  whatWeDo: "whatwedo",
  impact: "impact",
  projects: "projects",
  specialMoments: "special-moments",
  gallery: "gallery",
  journey: "journey",
  future: "future",
  volunteer: "volunteer",
  faq: "faq",
  contact: "contact",
  // About page.
  story: "story",
  mission: "mission",
  founder: "founder",
  cofounder: "cofounder",
  team: "team",
  // Home-page blocks. Deliberately not the ids of the moved sections (about, whatwedo, gallery, volunteer),
  // so an old `#about` link never points at a teaser.
  aboutTeaser: "about-teaser",
  whatWeDoPreview: "what-we-do-preview",
  galleryPreview: "gallery-preview",
  volunteerBand: "volunteer-band",
} as const;

/** How many What We Do cards the home page previews (the rest are on Our Work). */
export const HOME_WHAT_WE_DO_LIMIT = 3;

/** The home-page photo preview shows at most this many photos... */
export const HOME_GALLERY_LIMIT = 6;
/** ...and is left out entirely below this many, so the home page never shows placeholder tiles. */
export const HOME_GALLERY_MIN = 3;

/**
 * Old single-page links (`/#projects` and so on) live on in Instagram bios, WhatsApp messages and print.
 * Key = the old hash without "#"; value = where it goes now. Applied once, when the site loads on "/".
 * `#projects/<activity-id>` links are handled in `lib/legacy-redirects.ts`.
 * Hashes that are not listed (`home`, `impact`, `contact`) stay on the home page.
 */
export const LEGACY_HASH_REDIRECTS: Readonly<Record<string, string>> = {
  about: ROUTES.about,
  whatwedo: `${ROUTES.ourWork}#whatwedo`,
  projects: `${ROUTES.ourWork}#projects`,
  "special-moments": `${ROUTES.gallery}#special-moments`,
  gallery: `${ROUTES.gallery}#gallery`,
  journey: `${ROUTES.about}#journey`,
  future: `${ROUTES.about}#future`,
  volunteer: ROUTES.volunteer,
  faq: `${ROUTES.volunteer}#faq`,
};

/**
 * Browser-tab title and search description per page. Wording is taken from copy already on the site.
 * Titles stay under about 60 characters and descriptions between 50 and 160, so search results do not cut them off.
 */
export const PAGE_META = {
  // The same words as in index.html (a test keeps the two identical): this is what visitors and search engines
  // see before the site has loaded, and again whenever they come back to the home page.
  home: {
    title: "Naavu Kavacha - One Planet, One Purpose",
    description:
      "Naavu Kavacha Trust is a student-driven environmental initiative in Karnataka focused on seed collection, plantation drives, clean-ups, and community awareness.",
  },
  about: {
    title: "About Us | Naavu Kavacha Trust",
    description:
      "Naavu Kavacha is a group of passionate students striving to make our surroundings a better place to live.",
  },
  ourWork: {
    title: "Our Work | Naavu Kavacha Trust",
    description:
      "Awareness programs, seed collection, plantation drives and community environmental action by Naavu Kavacha, a student-driven environmental initiative.",
  },
  gallery: {
    title: "Gallery | Naavu Kavacha Trust",
    description: "Moments from the field: seeds, saplings, clean-ups and the people behind them.",
  },
  volunteer: {
    title: "Volunteer | Naavu Kavacha Trust",
    description:
      "We invite volunteers, schools, and organizations to collaborate with Naavu Kavacha to protect the environment and build a sustainable future.",
  },
} as const;

/**
 * The banner at the top of each non-home page. Every line is wording that already appears on the site
 * (hero, footer, gallery and volunteer sections), shortened only where a sentence ran on.
 */
export const PAGE_HEROES = {
  about: {
    eyebrow: "Naavu Kavacha",
    title: "About Us",
    description: "Together we can nurture the Earth and protect the future.",
  },
  ourWork: {
    eyebrow: "Student-Driven Environmental Initiative",
    title: "Our Work",
    description: "Awareness programs, seed collection, plantation drives and community environmental action.",
  },
  gallery: {
    eyebrow: "From the Field",
    title: "Gallery",
    description: "Seeds, saplings, clean-ups and the people behind them.",
  },
  volunteer: {
    eyebrow: "Join Us",
    title: "Volunteer",
    description: "Students, teachers, schools and organisations are all welcome.",
  },
} as const;

/**
 * The live address of the site, without a trailing slash. `npm run build` writes `public/sitemap.xml` for the
 * five pages and adds a `Sitemap:` line to `public/robots.txt`.
 */
export const SITE_URL = "https://naavu-kavacha.vercel.app";

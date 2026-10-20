/**
 * Projects & Activities: the single source for the Projects grid, the activity
 * detail modal and (from Phase 6) the What We Do cards.
 *
 * Rules: no invented facts. Everything below comes from content already on the
 * live site (the old Projects, What We Do and Journey sections) or from figures
 * the client supplied. Unknown fields (dates, outcomes) are left undefined so
 * the UI simply does not render them.
 *
 * Adding photos: drop files named `<activity-id>-1.jpg`, `<activity-id>-2.jpg`
 * ... into `src/assets/activities/` and they appear in that activity's modal
 * automatically. The first one also becomes the card image when the activity
 * has no explicit cover.
 */

import seedballPreparationImg from "@/assets/activities/seedball-preparation.jpg";
import cleanupDriveImg from "@/assets/activities/cleanup-drive.jpg";
import cleaningImg from "@/assets/cleaning.jpg";
import saplingImg from "@/assets/sapling.jpg";
import communityImg from "@/assets/community.jpg";
import growingGaneshaGalleryImg from "@/assets/gallery/01.jpg";
import cleanupGalleryImg from "@/assets/gallery/03.jpg";
import awarenessGalleryImg from "@/assets/gallery/04.jpg";
import seedballGalleryImg from "@/assets/gallery/06.jpg";
import { formatStatById } from "@/data/impact";
import type { VolunteerInterest } from "@/data/interests";
import { BookOpen, Bird, Circle, Recycle, Sparkles, Sprout, TreePine, Users, type LucideIcon } from "lucide-react";

export type ActivityCategory =
  | "Seeds"
  | "Plantation"
  | "Clean-Up"
  | "Community"
  | "Growing Ganesha"
  | "Awareness"
  | "Bird Feeders";

export interface ActivityImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  /** One or two lines shown on the card. */
  summary: string;
  /** Empty string means "no photo yet": the UI shows the neutral leaf placeholder. */
  coverImage: string;
  date?: string;
  locations?: string[];
  description: string;
  objective?: string;
  /** Verified outcomes only. */
  outcomes?: string[];
  /** Headline figures, e.g. { label: "Growing Ganesha", value: "150+" }. */
  highlights?: { label: string; value: string }[];
  images: ActivityImage[];
  /** Ids of related activities. */
  related?: string[];
  /** Pre-selects an interest in the volunteer form. */
  interestTag: VolunteerInterest;
  /** Shown instead of a photo on the What We Do card when the activity has no photo yet. */
  icon?: LucideIcon;
  /**
   * Present only for activities that also appear as a card in the What We Do section.
   * `title` and `description` override the activity's own title and summary there when
   * the section has always used different wording (for example "Seedball Preparation").
   */
  whatWeDo?: { order: number; title?: string; description?: string };
}

/** Category order for the filter chips. */
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "Seeds",
  "Plantation",
  "Clean-Up",
  "Community",
  "Growing Ganesha",
  "Awareness",
  "Bird Feeders",
];

// --- Photos dropped into src/assets/activities/<id>-N.<ext> -------------------

const droppedPhotos = import.meta.glob("/src/assets/activities/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/**
 * Hand-written alt text for dropped-in photos, keyed by file name. Describe only what can be seen
 * (no names of people or schools unless the team confirms them). Photos not listed here get a
 * generic "<activity>: Naavu Kavacha photo N".
 */
const PHOTO_ALTS: Record<string, string> = {
  "awareness-1.jpg":
    "A speaker with a microphone addressing schoolchildren lined up in rows in a school playground",
  "seed-collection-1.jpg": "Collected seeds sorted into small bags and boxes and laid out on a dark mat",
  "growing-ganesha-1.jpg": "Four students holding the clay Ganesha idols they made, each on a piece of cardboard",
  "bird-feeders-1.jpg": "Four volunteers sitting on a woven mat, cutting and shaping bamboo pieces by hand",
};

/** URLs (and file names) of `<id>-1`, `<id>-2` ... in numeric order. */
function photosFor(id: string): { url: string; file: string }[] {
  const pattern = new RegExp(`/(${id}-(\\d+)\\.(?:jpe?g|png|webp))$`);
  return Object.entries(droppedPhotos)
    .flatMap(([path, url]) => {
      const match = path.match(pattern);
      return match ? [{ n: Number(match[2]), url, file: match[1] }] : [];
    })
    .sort((a, b) => a.n - b.n)
    .map(({ url, file }) => ({ url, file }));
}

/**
 * Explicit photos first (they carry hand-written alt text), then any dropped-in
 * files, followed by additional photos already used in the public gallery.
 */
function buildImages(
  id: string,
  title: string,
  explicit: ActivityImage[] = [],
  additional: ActivityImage[] = [],
): { images: ActivityImage[]; cover: string } {
  const extra = photosFor(id).map(({ url, file }, i) => ({
    src: url,
    alt: PHOTO_ALTS[file] ?? `${title}: Naavu Kavacha photo ${i + 1}`,
  }));
  const images = [...explicit, ...extra, ...additional];
  return { images, cover: images[0]?.src ?? "" };
}

// --- Schools named in the Journey data, grouped by what happened there ---------

const AWARENESS_SCHOOLS = [
  "Greenwood High School",
  "Prakriti Vidyanikethan Public School",
  "Karnataka Samskriti Vidyapeetha (KSVP)",
  "Zen International School",
  "Audens School",
  "BNM School",
  "SJV School (RR Nagar)",
  "Doddanna Vidya Samsthe",
  "Aksharam",
];

const SEED_COLLECTION_SCHOOLS = [
  "Greenwood High School",
  "Prakriti Vidyanikethan Public School",
  "Karnataka Samskriti Vidyapeetha (KSVP)",
  "BNM School",
  "SJV School (RR Nagar)",
];

// --- Activities ----------------------------------------------------------------

const seedballs = buildImages(
  "seedball-dispersal",
  "Seedball Dispersal",
  [
    {
      src: seedballPreparationImg,
      alt: "Rows of freshly made seedballs drying on plastic sheets",
    },
  ],
  [
    {
      src: seedballGalleryImg,
      alt: "Students and an adult prepare seedballs together indoors",
    },
  ],
);
const saplings = buildImages("sapling-plantation", "Sapling Plantation", [
  {
    src: saplingImg,
    alt: "Volunteers and local children planting a sapling supported by bamboo stakes",
  },
]);
const community = buildImages("community-activities", "Community Activities", [
  {
    src: communityImg,
    alt: "Naavu Kavacha volunteers in high-visibility vests posing near collected waste",
  },
]);
const cleanUp = buildImages(
  "clean-up-drive",
  "Clean-Up Drive",
  [
    {
      src: cleanupDriveImg,
      alt: "Naavu Kavacha volunteers wearing gloves beside green bags of collected waste",
    },
    {
      src: cleaningImg,
      alt: "Volunteers lined up along a street next to bags of collected waste",
    },
  ],
  [
    {
      src: cleanupGalleryImg,
      alt: "Volunteers gather beside bags of collected waste after a community clean-up",
    },
  ],
);
const ganesha = buildImages("growing-ganesha", "Growing Ganesha", [], [
  {
    src: growingGaneshaGalleryImg,
    alt: "Students display the clay Ganesha idols they made",
  },
]);
const seedCollection = buildImages("seed-collection", "Seed Collection");
const birdFeeders = buildImages("bird-feeders", "Bamboo Bird Feeders");
const awareness = buildImages("awareness", "School Awareness Programs", [], [
  {
    src: awarenessGalleryImg,
    alt: "Students gather in rows for an outdoor environmental awareness session",
  },
]);

export const activities: Activity[] = [
  {
    id: "seedball-dispersal",
    title: "Seedball Dispersal",
    category: "Seeds",
    summary:
      "Clay, soil and manure seedballs dispersed at sites across Karnataka.",
    coverImage: seedballs.cover,
    locations: ["Ramanagara", "Hanumagiri", "Agara Lake", "Madeshwara Hills", "Turahalli"],
    description:
      "Seedballs are made from clay, soil and manure to support natural reforestation. Our team prepares them, including sessions with students at Karnataka Samskriti Vidyapeetha (KSVP), and disperses them at the sites listed here.",
    objective: "To support natural reforestation.",
    highlights: [{ label: "Seedballs prepared", value: formatStatById("seedballs-prepared") }],
    images: seedballs.images,
    related: ["seed-collection", "sapling-plantation", "awareness"],
    interestTag: "Seed collection & seedballs",
    icon: Circle,
    whatWeDo: { order: 3, title: "Seedball Preparation", description: "Preparing seedballs using clay, soil, and manure to support natural reforestation." },
  },
  {
    id: "sapling-plantation",
    title: "Sapling Plantation",
    category: "Plantation",
    summary: "Planting and protecting saplings in community areas.",
    coverImage: saplings.cover,
    locations: ["Ramohalli", "Hoskerehalli Lake"],
    description:
      "We plant and protect saplings in community areas. We have also carried out a plantation activity inside a school, at Zen International School.",
    highlights: [{ label: "Saplings planted", value: formatStatById("saplings-planted") }],
    images: saplings.images,
    related: ["seedball-dispersal", "community-activities"],
    interestTag: "Plantation drives",
    icon: TreePine,
    whatWeDo: { order: 4 },
  },
  {
    id: "community-activities",
    title: "Community Activities",
    category: "Community",
    summary: "Environmental events and collaborations with groups across Karnataka.",
    coverImage: community.cover,
    locations: ["Jayanagar"],
    description:
      "Beyond our own drives, we take part in environmental events and work alongside other environmental groups across Karnataka. This includes participation in the Water Day environmental event in Jayanagar.",
    outcomes: [
      "Participation in the Water Day environmental event in Jayanagar",
      "Collaboration with environmental groups across Karnataka",
    ],
    images: community.images,
    related: ["clean-up-drive", "sapling-plantation"],
    interestTag: "Community outreach",
    icon: Users,
  },
  {
    id: "clean-up-drive",
    title: "Clean-Up Drive",
    category: "Clean-Up",
    summary:
      "Volunteers clean public spaces, streets and natural surroundings, collecting and segregating waste.",
    coverImage: cleanUp.cover,
    description:
      "Our volunteers come together to clean public spaces, streets and natural surroundings, collecting and segregating waste to restore the beauty of our neighbourhoods and protect local ecosystems from pollution.",
    objective:
      "To restore neighbourhoods and protect local ecosystems from pollution.",
    images: cleanUp.images,
    related: ["community-activities", "sapling-plantation"],
    interestTag: "Clean-Up drives",
    icon: Recycle,
    whatWeDo: { order: 7 },
  },
  {
    id: "growing-ganesha",
    title: "Growing Ganesha",
    category: "Growing Ganesha",
    summary:
      "Eco-friendly Ganesha idols made with seed-embedded clay that grow into plants after immersion.",
    coverImage: ganesha.cover,
    locations: ["Karnataka Samskriti Vidyapeetha (KSVP)", "Shanthinikethan School"],
    description:
      "Growing Ganesha idols are eco-friendly idols made with seed-embedded clay that grow into plants after immersion. We have held Growing Ganesha events at KSVP and Shanthinikethan School.",
    highlights: [{ label: "Growing Ganesha", value: formatStatById("growing-ganesha") }],
    images: ganesha.images,
    related: ["seedball-dispersal", "awareness"],
    interestTag: "Growing Ganesha",
    icon: Sparkles,
    whatWeDo: { order: 6 },
  },
  {
    id: "seed-collection",
    title: "Seed Collection",
    category: "Seeds",
    summary: "Collecting seeds from students and communities to support biodiversity.",
    coverImage: seedCollection.cover,
    locations: SEED_COLLECTION_SCHOOLS,
    description:
      "We collect seeds from students and communities to support biodiversity. At schools this has included seed collection activities and competitions with prize distribution, and segregation of the collected seeds.",
    objective: "To support biodiversity.",
    highlights: [{ label: "Seeds collected", value: formatStatById("seeds-collected") }],
    images: seedCollection.images,
    related: ["seedball-dispersal", "awareness"],
    interestTag: "Seed collection & seedballs",
    icon: Sprout,
    whatWeDo: { order: 2 },
  },
  {
    id: "bird-feeders",
    title: "Bamboo Bird Feeders",
    category: "Bird Feeders",
    summary: "Handcrafted bamboo feeders installed to support urban bird populations.",
    coverImage: birdFeeders.cover,
    description:
      "Our team handcrafts feeders from bamboo and installs them to support urban bird populations.",
    objective: "To support urban bird populations.",
    highlights: [{ label: "Bamboo bird feeders", value: formatStatById("bird-feeders") }],
    images: birdFeeders.images,
    related: ["sapling-plantation", "community-activities"],
    // TODO(client): the volunteer form has no bird-feeder interest; confirm which one fits.
    interestTag: "Community outreach",
    icon: Bird,
    whatWeDo: { order: 5 },
  },
  {
    id: "awareness",
    title: "School Awareness Programs",
    category: "Awareness",
    summary:
      "Conducting sessions in schools to educate students about environmental protection and sustainable practices.",
    coverImage: awareness.cover,
    locations: AWARENESS_SCHOOLS,
    description:
      "We conduct sessions in schools to educate students about environmental protection and sustainable practices. Many of them are paired with hands-on activities such as seed collection, seedball making and plantation.",
    outcomes: [`Paper collection drive at KSVP: ${formatStatById("paper-collected")} of paper collected`],
    images: awareness.images,
    related: ["seed-collection", "growing-ganesha"],
    interestTag: "School awareness sessions",
    icon: BookOpen,
    whatWeDo: { order: 1, title: "Creating Awareness" },
  },
];

/** The activities shown as What We Do cards, in their display order. */
export function getWhatWeDoActivities(): (Activity & { whatWeDo: NonNullable<Activity["whatWeDo"]> })[] {
  return activities
    .filter((a): a is Activity & { whatWeDo: NonNullable<Activity["whatWeDo"]> } => Boolean(a.whatWeDo))
    .sort((a, b) => a.whatWeDo.order - b.whatWeDo.order);
}

export function getActivity(id: string | null | undefined): Activity | undefined {
  return id ? activities.find((a) => a.id === id) : undefined;
}

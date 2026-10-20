/**
 * The people of Naavu Kavacha: the founder, the co-founder and the core team.
 *
 * Rules (they protect students, some of whom may be minors):
 *  - Everything here must come from the person or the team. Never invent a name, role, quote or bio.
 *  - A person appears on the site only when `consent` is true. Without it they are invisible everywhere.
 *  - Never put a phone number or a personal email address here. Social links are optional.
 *  - A person belongs to exactly one group, so nobody shows up twice.
 *
 * Photos: save the picture as `src/assets/team/<id>.jpg` (about 1200 x 1500, 4:5, under about 250 KB, with
 * all camera and location data removed). It is picked up automatically. With no photo, the person's initials
 * are shown instead. To use a different file name, set `photo` to that file name.
 */

export type TeamGroup = "founder" | "cofounder" | "core";

export interface TeamSocial {
  label: "LinkedIn" | "Instagram";
  /** Must start with https:// (anything else is ignored). */
  url: string;
}

export interface TeamMember {
  /** Short, lowercase, no spaces, for example "firstname-lastname". Also the default photo file name. */
  id: string;
  group: TeamGroup;
  /** Exactly as the person wants it shown. */
  name: string;
  /** Exactly as written by the person or the team (for example "Founder"); the site adds nothing to it. */
  role: string;
  /** A short description, in the third person, as supplied. */
  bio?: string;
  /** The person's own words, one string per paragraph, as supplied. */
  message?: string[];
  /** One pull-quote, only if supplied. */
  quote?: string;
  /** Photo file name inside `src/assets/team/`. Defaults to `<id>.jpg` (or .png, .webp). */
  photo?: string;
  social?: TeamSocial[];
  /** Position within the group, lowest first. */
  order: number;
  /** True only when the person (or a parent or guardian, for a minor) has agreed to their name and photo being published. */
  consent: boolean;
  /** Internal record of where the consent and the text came from. Never shown on the site. */
  note?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "ajay-gowda-h",
    group: "founder",
    name: "Ajay Gowda H",
    role: "Founder",
    photo: "ajay-gowda-h.png",
    bio: "Ajay Gowda H is an environmentalist, student, and founder of Naavu Kavacha. He leads grassroots work across Karnataka, including seed conservation, plantation drives, lake and forest clean-ups, and community awareness initiatives. His work engages young people and communities in protecting nature and building a more sustainable future.",
    order: 1,
    // TODO(client): confirm in writing that Ajay agrees to his name and bio being published (and, if he is under 18,
    // that a parent or guardian does). Set `consent: false` to hide him from the site at once.
    consent: true,
    note: "Bio text supplied by the site owner in the project chat on 18 Oct 2026, and photo supplied on 20 Oct 2026, for the About page. Written consent from Ajay has not been confirmed.",
  },
  {
    id: "nidhi-b-s",
    group: "cofounder",
    name: "Nidhi B S",
    role: "Co-Founder",
    photo: "nidhi-b-s.png",
    bio: "Nidhi B S is a student, environmentalist, and co-founder of Naavu Kavacha. She supports grassroots initiatives across Karnataka through planning, community outreach, environmental awareness, plantation drives, and clean-ups. Her work helps engage communities in conservation and contributes to a greener, more sustainable future.",
    order: 1,
    // TODO(client): confirm in writing that Nidhi agrees to her name and bio being published (and, if she is under 18,
    // that a parent or guardian does). Set `consent: false` to hide her from the site at once.
    consent: true,
    note: "Bio text supplied by the site owner in the project chat on 18 Oct 2026, and photo supplied on 20 Oct 2026, for the About page. Written consent from Nidhi has not been confirmed.",
  },
  {
    id: "shriya-a",
    group: "core",
    name: "Shriya A",
    role: "Core Team",
    photo: "shriya-a.png",
    order: 5,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 after confirming approved Core Team names and photos would be provided for publication.",
  },
  {
    id: "sharadha",
    group: "core",
    name: "Sharadha Nagaraj M",
    role: "Core Team",
    photo: "sharadha.png",
    order: 4,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 for the Core Team section.",
  },
  {
    id: "sriram-h-s",
    group: "core",
    name: "Sriram H S",
    role: "Core Team",
    photo: "sriram-h-s.png",
    order: 6,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 for the Core Team section.",
  },
  {
    id: "poornashree-r",
    group: "core",
    name: "Poornashree R",
    role: "Core Team",
    photo: "poornashree-r.png",
    order: 3,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 for the Core Team section.",
  },
  {
    id: "m-bhushan",
    group: "core",
    name: "M Bhushan",
    role: "Core Team",
    photo: "m-bhushan.png",
    order: 2,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 for the Core Team section.",
  },
  {
    id: "kundan-a-m",
    group: "core",
    name: "Kundan A M",
    role: "Core Team",
    photo: "kundan-a-m.png",
    order: 1,
    consent: true,
    note: "Name and photo supplied by the site owner on 20 Oct 2026 for the Core Team section.",
  },
];

/** The consented people of one group, lowest `order` first. */
export function selectTeam(members: TeamMember[], group: TeamGroup): TeamMember[] {
  return members
    .filter((m) => m.group === group && m.consent === true)
    .sort((a, b) => a.order - b.order);
}

export const getFounders = (): TeamMember[] => selectTeam(teamMembers, "founder");
export const getCoFounders = (): TeamMember[] => selectTeam(teamMembers, "cofounder");
export const getCoreTeam = (): TeamMember[] => selectTeam(teamMembers, "core");

/**
 * Wording for the Founder, Co-Founder and Core Team sections.
 * TODO(client): confirm the headings and the small labels above them.
 */
export const GROUP_COPY = {
  founder: { eyebrow: "Our Team", heading: "Meet Our Founder", headingMany: "Meet Our Founders", chip: "Founder", chipMany: "Founders" },
  cofounder: {
    eyebrow: "Our Team",
    heading: "Meet Our Co-Founder",
    headingMany: "Meet Our Co-Founders",
    chip: "Co-Founder",
    chipMany: "Co-Founders",
  },
  core: { eyebrow: "Meet the Team", heading: "Our Core Team", chip: "Core Team" },
} as const;

const photoFiles = import.meta.glob("/src/assets/team/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** The person's photo, or null when there is none (the initials are shown then). */
export function resolveTeamPhoto(member: TeamMember, files: Record<string, string> = photoFiles): string | null {
  const nameOf = (path: string) => path.split("/").pop() ?? "";
  const key = Object.keys(files).find((path) =>
    member.photo ? nameOf(path) === member.photo : nameOf(path).replace(/\.[^.]+$/, "") === member.id,
  );
  return key ? files[key] : null;
}

/** Social links that are safe to show: https only, so nothing like "javascript:" can ever be rendered. */
export function getSafeSocial(member: TeamMember): TeamSocial[] {
  return (member.social ?? []).filter((s) => {
    try {
      return new URL(s.url).protocol === "https:";
    } catch {
      return false;
    }
  });
}

/**
 * Up to two initials for the no-photo avatar: the first letters of the first two words of the name. (Not the
 * last word: many names end in a single initial, as in "Ajay Gowda H", where "AG" is right and "AH" is not.)
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0];
  const second = words.length > 1 ? Array.from(words[1])[0] : "";
  return `${first}${second}`.toLocaleUpperCase();
}

/** Splits supplied text into paragraphs at blank lines, dropping empty ones. Words are never changed. */
export function paragraphsOf(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

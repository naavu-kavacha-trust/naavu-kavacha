/**
 * Impact figures: the single source for every number shown on the site
 * (Impact section, About, activity pop-ups and the Journey timeline).
 *
 * Only entries with `verified: true` are ever displayed. To show an unverified
 * figure, the team confirms the number, fixes `value` if needed, then flips
 * `verified` to true.
 */

import {
  Bird,
  CalendarCheck,
  HeartHandshake,
  Leaf,
  Newspaper,
  School,
  Sprout,
  Sparkles,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Stat {
  id: string;
  value: number;
  /** e.g. "+" so 150 renders as "150+". */
  suffix?: string;
  /** e.g. "~" for approximate figures. */
  prefix?: string;
  label: string;
  image?: string;
  icon?: LucideIcon;
  verified: boolean;
  /** Set false to keep a verified figure in historical/activity copy without showing it as an Impact card. */
  showInImpact?: boolean;
  /** Internal note, never rendered. */
  note?: string;
}

export const stats: Stat[] = [
  // --- Verified: already on the live site, or supplied by the client ---------
  {
    id: "seeds-collected",
    value: 15000,
    suffix: "+",
    label: "Seeds Collected",
    icon: Sprout,
    verified: true,
  },
  {
    id: "seedballs-prepared",
    value: 5000,
    suffix: "+",
    label: "Seedballs Prepared",
    icon: Leaf,
    verified: true,
  },
  {
    id: "saplings-planted",
    value: 100,
    suffix: "+",
    label: "Saplings Planted",
    icon: TreePine,
    verified: true,
  },
  {
    id: "bird-feeders",
    value: 10,
    suffix: "+",
    label: "Bamboo Bird Feeders",
    icon: Bird,
    verified: true,
  },
  {
    id: "growing-ganesha",
    value: 150,
    suffix: "+",
    label: "Growing Ganesha",
    icon: Sparkles,
    verified: true,
    note: "Was 100+ on the old site; the client confirmed 150+.",
  },
  {
    id: "paper-collected",
    value: 773,
    prefix: "~",
    suffix: " kg",
    label: "Paper Collected",
    icon: Newspaper,
    verified: true,
    showInImpact: false,
    note: "From the Journey data: paper collection drive at KSVP.",
  },
  {
    id: "student-awareness",
    value: 8000,
    suffix: "+",
    label: "Student Awareness",
    icon: School,
    verified: true,
    note: "Updated figure supplied by the site owner on 20 Oct 2026.",
  },

  // --- Not shown until the team confirms them ---------------------------------
  {
    id: "activities-conducted",
    value: 0,
    suffix: "+",
    label: "Activities Conducted",
    icon: CalendarCheck,
    verified: false,
    note: "TODO(client): confirm the number of activities conducted.",
  },
  {
    id: "schools-reached",
    value: 11,
    suffix: "+",
    label: "Schools & Institutions Reached",
    icon: School,
    verified: false,
    note: "TODO(client): the Journey data lists 11 places; confirm this is the right count before showing it.",
  },
  {
    id: "volunteers",
    value: 0,
    suffix: "+",
    label: "Volunteers",
    icon: Users,
    verified: false,
    note: "TODO(client): confirm volunteer participation.",
  },
  {
    id: "community-participation",
    value: 0,
    suffix: "+",
    label: "Community Members Engaged",
    icon: HeartHandshake,
    verified: false,
    note: "TODO(client): confirm community participation.",
  },
];

/** Stats that are safe to show. */
export function getVerifiedStats(): Stat[] {
  return stats.filter((s) => s.verified);
}

/** Verified figures shown as cards in the Impact section. */
export function getImpactStats(): Stat[] {
  return stats.filter((s) => s.verified && s.showInImpact !== false);
}

/** A single stat by id, or undefined. Includes unverified ones: callers must check `verified`. */
export function getStat(id: string): Stat | undefined {
  return stats.find((s) => s.id === id);
}

/** "150+", "~773 kg". */
export function formatStat(stat: Stat, value: number = stat.value): string {
  return `${stat.prefix ?? ""}${Math.round(value)}${stat.suffix ?? ""}`;
}

/**
 * The display text of a verified stat, e.g. formatStatById("paper-collected") -> "~773 kg".
 * Throws for an unknown id so a typo is caught immediately, and for an unverified
 * stat so an unconfirmed number can never reach the page by accident.
 */
export function formatStatById(id: string): string {
  const stat = getStat(id);
  if (!stat) throw new Error(`Unknown stat: ${id}`);
  if (!stat.verified) throw new Error(`Stat "${id}" is not verified yet`);
  return formatStat(stat);
}

/** The two figures shown beside the "Who We Are" text (About page and the home teaser). */
export const HEADLINE_STAT_IDS = ["seeds-collected", "saplings-planted"] as const;

/** Headline figures that are verified; unverified ones are never shown. */
export function getHeadlineStats(): Stat[] {
  return HEADLINE_STAT_IDS.map((id) => getStat(id)).filter((s): s is Stat => Boolean(s?.verified));
}

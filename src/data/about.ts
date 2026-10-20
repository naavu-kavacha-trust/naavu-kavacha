/**
 * Words and optional story photo for the About Us page.
 *
 * Only things the team has actually supplied belong here. Anything left empty simply does not appear on the
 * page (and its link drops out of the page's sub-navigation), so nothing is ever invented.
 */

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutContent {
  /** The story, one string per paragraph. */
  story: string[];
  /**
   * An optional photo for the Our Story section: the file name inside `src/assets/about/` (jpg, jpeg, png or webp)
   * and its alt text. When missing, the Naavu Kavacha logo is used.
   */
  storyImage?: { file: string; alt: string };
  mission?: string;
  vision?: string;
  values?: AboutValue[];
}

export const aboutContent: AboutContent = {
  // The existing "Who We Are" paragraph, split into two readable paragraphs. The wording is unchanged.
  story: [
    "Naavu Kavacha is a group of passionate students striving to make our surroundings a better place to live.",
    "Our initiative focuses on nurturing the environment and inspiring communities to protect nature through education, tree planting, and sustainable practices.",
  ],

  // TODO(client): add the story photo as src/assets/about/about-story.jpg, then uncomment and describe what is
  // visibly in it, in plain words (do not name people unless they are happy to be named):
  // storyImage: { file: "about-story.jpg", alt: "..." },

  // TODO(client): the team's mission, in their own words (one or two sentences).
  mission: undefined,

  // TODO(client): the team's vision, in their own words (one or two sentences).
  vision: undefined,

  // TODO(client): optional values, for example { title: "...", text: "..." }, three or four at most.
  values: [],
};

const clean = (text: string | undefined): string => text?.trim() ?? "";

/** Story paragraphs with empty ones dropped. */
export const getStory = (content: AboutContent = aboutContent): string[] =>
  content.story.map(clean).filter(Boolean);

/** The home page teaser shows the first this-many story paragraphs. */
export const TEASER_PARAGRAPHS = 2;
export const getStoryTeaser = (content: AboutContent = aboutContent): string =>
  getStory(content).slice(0, TEASER_PARAGRAPHS).join(" ");

export const getMission = (content: AboutContent = aboutContent): string => clean(content.mission);
export const getVision = (content: AboutContent = aboutContent): string => clean(content.vision);

/** Values that have both a title and some text. */
export const getValues = (content: AboutContent = aboutContent): AboutValue[] =>
  (content.values ?? [])
    .map((v) => ({ title: clean(v.title), text: clean(v.text) }))
    .filter((v) => v.title && v.text);

/** Whether the Mission & Vision section has anything to show. */
export const hasMissionSection = (content: AboutContent = aboutContent): boolean =>
  Boolean(getMission(content) || getVision(content) || getValues(content).length);

/** "Mission & Vision", or "Our Values" when only values were supplied. */
export const missionSectionTitle = (content: AboutContent = aboutContent): string =>
  getMission(content) || getVision(content) ? "Mission & Vision" : "Our Values";

const storyFiles = import.meta.glob("/src/assets/about/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** The supplied story photo, or null when none was supplied (or its file is not in `src/assets/about/`). */
export function resolveStoryImage(
  content: AboutContent = aboutContent,
  files: Record<string, string> = storyFiles,
): { src: string; alt: string } | null {
  const wanted = content.storyImage;
  if (!wanted?.file) return null;
  const key = Object.keys(files).find((path) => path.split("/").pop() === wanted.file);
  return key ? { src: files[key], alt: wanted.alt } : null;
}

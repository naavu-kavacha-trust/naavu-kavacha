/**
 * "Oath for Change – A Living Milestone": copy and photographs.
 *
 * Photos: drop files into `src/assets/oath/` (01.jpg, 02.jpg ...). They are picked up
 * automatically, in filename order. Captions or names are shown ONLY when the client
 * supplies them in `OATH_DETAILS` below; never invent the name of a personality.
 */

export interface OathImage {
  src: string;
  alt: string;
  caption?: string;
}

export const oathCopy = {
  eyebrow: "Special Moments",
  heading: "Oath for Change – A Living Milestone",
  // Verbatim from the client brief.
  paragraphs: [
    '"Oath for Change – A Living Milestone" became even more meaningful as respected personalities and public figures added their signatures to the movement, turning every autograph into a symbol of responsibility and hope.',
    "From inspiring conversations to shared commitments for society and the environment, each celebrity signature strengthened the vision that change begins with an oath — and lives on through action.",
  ],
  cta: "Take the oath with us",
} as const;

/**
 * Optional, client-supplied details keyed by file name (for example "03.jpg").
 * TODO(client): add the name of each personality and a caption only once the team confirms them.
 */
export const OATH_DETAILS: Record<string, { alt?: string; caption?: string }> = {
  "01.jpg": { alt: "A bald man wearing glasses signs the Oath for Change in a notebook." },
  "02.jpg": { alt: "A man in a white shirt signs the Oath for Change while seated on a yellow sofa." },
  "03.jpg": { alt: "A man in a yellow checked shirt signing the Oath for Change." },
  "04.jpg": { alt: "A woman in a pale green sari signing the Oath for Change." },
  "05.jpg": { alt: "A man in a white shirt and glasses at the Oath for Change signing event." },
  "06.jpg": { alt: "A man in a light checked shirt signing the Oath for Change." },
  "07.jpg": { alt: "A young man in a maroon shirt signing the Oath for Change." },
  "08.jpg": { alt: "A woman in a patterned sari signing the Oath for Change." },
  "09.jpg": { alt: "A woman in a green sweater signing the Oath for Change." },
  "10.jpg": { alt: "A man in a gray sweater signing the Oath for Change." },
};

const files = import.meta.glob("/src/assets/oath/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Builds the image list from a path -> url map, sorted by file name ("2.jpg" before "10.jpg"). */
export function buildOathImages(
  modules: Record<string, string>,
  details: Record<string, { alt?: string; caption?: string }> = OATH_DETAILS,
): OathImage[] {
  return Object.entries(modules)
    .map(([path, src]) => ({ name: path.split("/").pop() ?? path, src }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map(({ name, src }, i) => ({
      src,
      alt: details[name]?.alt ?? `A guest signing the Oath for Change (photo ${i + 1})`,
      ...(details[name]?.caption ? { caption: details[name].caption } : {}),
    }));
}

export const oathImages: OathImage[] = buildOathImages(files);

/**
 * Gallery photographs.
 *
 * Add a photo by dropping the file into `src/assets/gallery/`; it is picked up
 * automatically and shown in file-name order ("2.jpg" before "10.jpg"),
 * with the Tunturu team photo featured first.
 * To control the order, name files 01.jpg, 02.jpg ...
 *
 * Specific alt text, captions and categories are shown ONLY when supplied in
 * `GALLERY_DETAILS` below. Never invent who is in a photo, where it was taken or when.
 * Filter chips appear only once at least two different categories are supplied.
 */

export interface GalleryImage {
  src: string;
  /** Small responsive copies for gallery tiles; `src` remains the full-size viewer image. */
  thumbnailSrc?: string;
  thumbnailSrcSet?: string;
  alt: string;
  caption?: string;
  category?: string;
}

export interface GalleryDetail {
  alt?: string;
  caption?: string;
  category?: string;
}

export const DEFAULT_GALLERY_ALT = "Naavu Kavacha volunteers at a community event";

/**
 * Optional, client-supplied details keyed by file name (for example "07.jpg").
 * TODO(client): add a caption and a category (for example "Seedballs", "Clean-ups")
 * for each photo once the team confirms them.
 */
export const GALLERY_DETAILS: Record<string, GalleryDetail> = {
  "01.jpg": { alt: "Children and adults pose together at an environmental event booth." },
  "02.jpg": { alt: "A small group poses outdoors beside an environmental display board." },
  "03.jpg": { alt: "Volunteers pose with filled waste bags after a community clean-up." },
  "04.jpg": { alt: "Students gather outdoors for an environmental awareness session." },
  "05.jpg": { alt: "A volunteer presents an environmental display to students outdoors." },
  "06.jpg": { alt: "Students and an adult prepare seedballs together indoors." },
  "07.jpg": { alt: "A group poses outdoors beside a bus and an emergency vehicle." },
  "08.jpg": { alt: "Volunteers in safety vests at a roadside clean-up beside a large waste pile." },
  "09.jpg": { alt: "A woman and a man hold a young sapling on a street at night." },
  "10.jpg": { alt: "Adults and children gather outdoors among trees and school buildings." },
  "11.jpg": { alt: "An adult speaks with children seated in a crowded hall." },
  "team-tunturu.jpg": {
    alt: "Five Naavu Kavacha team members standing on the steps of the Tunturu Mahiti Kendra building",
  },
};

const files = import.meta.glob("/src/assets/gallery/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const thumbnails = import.meta.glob("/src/assets/optimized/gallery/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function thumbnailsFor(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  const small = thumbnails[`/src/assets/optimized/gallery/${base}-384.webp`];
  const large = thumbnails[`/src/assets/optimized/gallery/${base}-768.webp`];
  return {
    ...(small ? { thumbnailSrc: small } : {}),
    ...(small && large ? { thumbnailSrcSet: `${small} 384w, ${large} 768w` } : {}),
  };
}

/** Builds the image list with the Tunturu team photo first, then by file name. */
export function buildGalleryImages(
  modules: Record<string, string>,
  details: Record<string, GalleryDetail> = GALLERY_DETAILS,
): GalleryImage[] {
  return Object.entries(modules)
    .map(([path, src]) => ({ name: path.split("/").pop() ?? path, src }))
    .sort((a, b) => {
      if (a.name === b.name) return 0;
      if (a.name === "team-tunturu.jpg") return -1;
      if (b.name === "team-tunturu.jpg") return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    })
    .map(({ name, src }) => ({
      src,
      ...thumbnailsFor(name),
      alt: details[name]?.alt ?? DEFAULT_GALLERY_ALT,
      ...(details[name]?.caption ? { caption: details[name].caption } : {}),
      ...(details[name]?.category ? { category: details[name].category } : {}),
    }));
}

export const galleryImages: GalleryImage[] = buildGalleryImages(files);

/** Distinct categories in first-seen order. */
export function galleryCategories(images: GalleryImage[]): string[] {
  return [...new Set(images.flatMap((i) => (i.category ? [i.category] : [])))];
}

import { Link } from "react-router-dom";
import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { galleryImages, type GalleryImage } from "@/data/gallery";
import { HOME_GALLERY_LIMIT, HOME_GALLERY_MIN, ROUTES, SECTION_IDS } from "@/data/siteConfig";

/**
 * A small photo strip on the home page; every photo and the button open the Gallery page.
 * Shows real photos only: with fewer than HOME_GALLERY_MIN it renders nothing at all (no placeholder tiles).
 */
const GalleryPreview = ({ images = galleryImages }: { images?: GalleryImage[] }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (images.length < HOME_GALLERY_MIN) return null;
  const shown = images.slice(0, HOME_GALLERY_LIMIT);

  return (
    <section id={SECTION_IDS.galleryPreview} className="section-padding bg-background">
      <div ref={ref} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Our Gallery</p>
            <h2 className="section-title">Moments from the Field</h2>
          </div>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {shown.map((image) => (
              <li key={image.src}>
                <Link
                  to={ROUTES.gallery}
                  aria-label={`See this photo in the gallery: ${image.caption ?? image.alt}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:rounded-2xl"
                >
                  <SmartImage
                    src={image.src}
                    alt=""
                    wrapperClassName="h-full"
                    className="transition-transform duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-105 motion-reduce:[@media(hover:hover)]:group-hover:scale-100"
                    draggable={false}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 text-center">
            <Link
              to={ROUTES.gallery}
              className="inline-flex min-h-12 items-center rounded-full border border-primary px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View the full gallery
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryPreview;

import { m as motion, useInView } from "framer-motion";
import { Leaf } from "lucide-react";
import { Suspense, lazy, useMemo, useRef, useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { galleryCategories, galleryImages, type GalleryImage } from "@/data/gallery";
import { SECTION_IDS } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

// The viewer is only needed once a photo is tapped; it loads in its own chunk after first paint.
const Lightbox = lazy(() => import("@/components/Lightbox"));

/** Until enough photos are added (see MISSING_ASSETS.md) the grid is padded with leaf tiles. */
const MIN_TILES = 8;
const INITIAL_VISIBLE = 12;
const LOAD_MORE_COUNT = 12;
const ALL = "All";

/**
 * Photo gallery: 2 columns on phones, 3 on tablets, 4 on desktop, every tile a fixed
 * aspect ratio so nothing shifts while images load. Tapping a photo opens the shared Lightbox.
 */
const Gallery = ({ images = galleryImages }: { images?: GalleryImage[] }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState<string>(ALL);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [viewer, setViewer] = useState<{ index: number; origin: HTMLElement | null } | null>(null);

  const categories = useMemo(() => galleryCategories(images), [images]);
  // Filter chips only make sense once the client has supplied at least two categories.
  const showFilters = categories.length > 1;
  const filteredImages = useMemo(
    () => (filter === ALL ? images : images.filter((i) => i.category === filter)),
    [images, filter],
  );
  const displayedImages = filteredImages.slice(0, visibleCount);
  const placeholders = Math.max(0, MIN_TILES - filteredImages.length);
  const hasMore = displayedImages.length < filteredImages.length;

  return (
    <section id={SECTION_IDS.gallery} className="section-padding bg-background">
      <div ref={ref} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Our Gallery</p>
            <h2 className="section-title">Moments from the Field</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Seeds, saplings, clean-ups and the people behind them. Tap any photo to view it full screen.
            </p>
          </div>

          {showFilters && (
            <div
              role="group"
              aria-label="Filter photos by category"
              className="mb-8 flex flex-wrap justify-center gap-2"
            >
              {[ALL, ...categories].map((c) => {
                const active = c === filter;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setFilter(c);
                      setVisibleCount(INITIAL_VISIBLE);
                    }}
                    className={cn(
                      "min-h-11 rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/60",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {displayedImages.map((image, i) => (
              <li key={image.src}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`Open photo ${i + 1} of ${filteredImages.length}: ${image.caption ?? image.alt}`}
                  onClick={(e) => setViewer({ index: i, origin: e.currentTarget })}
                  className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:rounded-2xl"
                >
                  <SmartImage
                    src={image.src}
                    alt=""
                    wrapperClassName="h-full"
                    className="transition-transform duration-500 motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-105 motion-reduce:[@media(hover:hover)]:group-hover:scale-100"
                    draggable={false}
                  />
                </button>
              </li>
            ))}
            {Array.from({ length: placeholders }, (_, i) => (
              <li key={`placeholder-${i}`} aria-hidden="true">
                <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-secondary/50 text-primary/40 md:rounded-2xl">
                  <Leaf className="h-8 w-8" strokeWidth={1.5} />
                </div>
              </li>
            ))}
          </ul>

          {filteredImages.length > INITIAL_VISIBLE && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                Showing {displayedImages.length} of {filteredImages.length} photos
              </p>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(count + LOAD_MORE_COUNT, filteredImages.length))}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Load more photos
                </button>
              )}
            </div>
          )}

        </motion.div>
      </div>

      <Suspense fallback={null}>
        <Lightbox
          images={filteredImages}
          index={viewer?.index ?? null}
          onIndexChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
          onClose={() => setViewer(null)}
          returnFocusTo={viewer?.origin}
        />
      </Suspense>
    </section>
  );
};

export default Gallery;

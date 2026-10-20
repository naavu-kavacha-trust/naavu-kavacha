import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useReducedMotion } from "framer-motion";
import { Leaf } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import SmartImage from "@/components/ui/SmartImage";
import type { OathImage } from "@/data/oath";
import { cn } from "@/lib/utils";

// The viewer is only needed once a photo is tapped; it loads in its own chunk after first paint.
const Lightbox = lazy(() => import("@/components/Lightbox"));

const AUTOPLAY_DELAY_MS = 3500;
/** Shown instead of photos until the first ones are added (see MISSING_ASSETS.md). */
const PLACEHOLDER_COUNT = 3;

const slideClass = "basis-full pl-4 sm:basis-1/2 lg:basis-1/3";

/**
 * Swipeable photo slider: one photo (with a peek of the next) on phones, two on
 * tablets, three on desktop. Slow autoplay that pauses on hover, focus and touch,
 * never runs with reduced motion. Tapping a photo
 * opens it in the shared Lightbox.
 */
const OathSlider = ({ images }: { images: OathImage[] }) => {
  const reduceMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [snapCount, setSnapCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [viewer, setViewer] = useState<{ index: number; origin: HTMLElement | null } | null>(null);

  const hasPhotos = images.length > 0;
  const autoplayOn = hasPhotos && !reduceMotion && viewer === null;

  // No plugin at all when autoplay should be off, so nothing can restart it behind our back.
  const plugins = useMemo(
    () =>
      autoplayOn
        ? [
            Autoplay({
              delay: AUTOPLAY_DELAY_MS,
              stopOnInteraction: false, // pause on touch/focus/hover, resume afterwards
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
            }),
          ]
        : [],
    [autoplayOn],
  );

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setSnapCount(api.scrollSnapList().length);
      setSelected(api.selectedScrollSnap());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div>
      <Carousel
        setApi={setApi}
        plugins={plugins}
        opts={{ loop: true, align: "start" }}
        aria-label="Oath for Change photos"
        className="px-0"
      >
        <CarouselContent>
          {hasPhotos
            ? images.map((image, i) => (
                <CarouselItem
                  key={image.src}
                  className={slideClass}
                  aria-label={`Photo ${i + 1} of ${images.length}`}
                >
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(e) => setViewer({ index: i, origin: e.currentTarget })}
                    className="group relative mx-auto block aspect-[4/5] w-[85%] cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-secondary/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-full"
                  >
                    <SmartImage
                      src={image.src}
                      alt={image.alt}
                      wrapperClassName="h-full"
                      className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      draggable={false}
                    />
                    {image.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-sm text-white">
                        {image.caption}
                      </span>
                    )}
                  </button>
                </CarouselItem>
              ))
            : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <CarouselItem key={i} className={slideClass}>
                  <div
                    aria-hidden="true"
                    className="mx-auto flex aspect-[4/5] w-[85%] items-center justify-center rounded-2xl border border-border bg-secondary/50 text-primary/40 sm:w-full"
                  >
                    <Leaf className="h-10 w-10" strokeWidth={1.5} />
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>

        {hasPhotos && (
          <>
            <CarouselPrevious
              aria-label="Previous photo"
              className="left-3 h-11 w-11 border-0 bg-background/90 shadow-md hover:bg-background max-md:hidden"
            />
            <CarouselNext
              aria-label="Next photo"
              className="right-3 h-11 w-11 border-0 bg-background/90 shadow-md hover:bg-background max-md:hidden"
            />
          </>
        )}
      </Carousel>

      {hasPhotos && (
        <div className="mt-6 flex items-center justify-center">
          {snapCount > 1 && (
            <div role="group" aria-label="Choose photo" className="flex items-center">
              {Array.from({ length: snapCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === selected}
                  onClick={() => api?.scrollTo(i)}
                  className="flex h-11 w-6 items-center justify-center focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "h-2.5 rounded-full bg-primary transition-all motion-reduce:transition-none",
                      i === selected ? "w-6" : "w-2.5 opacity-30",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Suspense fallback={null}>
        <Lightbox
          images={images}
          index={viewer?.index ?? null}
          onIndexChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
          onClose={() => setViewer(null)}
          returnFocusTo={viewer?.origin}
        />
      </Suspense>
    </div>
  );
};

export default OathSlider;

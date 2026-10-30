import { useCallback, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, CalendarDays, Leaf, MapPin, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import SmartImage from "@/components/ui/SmartImage";
import { getActivity, type Activity } from "@/data/activities";
import { cn } from "@/lib/utils";

interface ActivityDialogProps {
  activity: Activity | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRelated: (id: string) => void;
  onVolunteer: (activity: Activity) => void;
  onCloseAutoFocus: (event: Event) => void;
}

/** Photo carousel (swipe, arrows, dots). Remounted per activity so it always starts at photo 1. */
const PhotoCarousel = ({ activity }: { activity: Activity }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const photos = activity.images;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // No photo yet: a calm neutral band instead of a broken or stock image.
  if (photos.length === 0) {
    return (
      <div
        aria-hidden="true"
        className="flex h-40 items-center justify-center bg-secondary/60 text-primary/50 sm:h-48"
      >
        <Leaf className="h-10 w-10" strokeWidth={1.5} />
      </div>
    );
  }

  const many = photos.length > 1;

  return (
    <Carousel
      opts={{ loop: many, watchDrag: many }}
      setApi={setApi}
      aria-label={`${activity.title} photos`}
      className="bg-secondary/50"
    >
      <CarouselContent className="ml-0">
        {photos.map((photo, i) => (
          <CarouselItem
            key={photo.src}
            className="pl-0"
            aria-label={`Photo ${i + 1} of ${photos.length}`}
          >
            <figure className="m-0">
              <div className="relative h-64 w-full overflow-hidden sm:h-80">
                {/* Soft blurred copy fills the sides of portrait photos. */}
                <img
                  src={photo.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl"
                />
                <SmartImage
                  src={photo.src}
                  alt={photo.alt}
                  priority={i === 0}
                  wrapperClassName="relative"
                  className="object-contain"
                />
              </div>
              {photo.caption && (
                <figcaption className="px-5 py-2 text-center text-sm text-foreground/85">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>

      {many && (
        <>
          <CarouselPrevious
            aria-label="Previous photo"
            className="left-3 top-1/2 h-11 w-11 -translate-y-1/2 border-0 bg-background/90 shadow-md hover:bg-background"
          />
          <CarouselNext
            aria-label="Next photo"
            className="right-3 top-1/2 h-11 w-11 -translate-y-1/2 border-0 bg-background/90 shadow-md hover:bg-background"
          />
          <div
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full bg-background/90 px-2 py-0.5 shadow-md"
            role="group"
            aria-label="Choose photo"
          >
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => api?.scrollTo(i)}
                className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "h-2 rounded-full bg-primary transition-all motion-reduce:transition-none",
                    i === index ? "w-5" : "w-2 opacity-35",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
};

const SectionLabel = ({ children }: { children: string }) => (
  <h3 className="activity-dialog-section-label mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-primary">{children}</h3>
);

/**
 * Activity detail: a centred dialog on larger screens and a full-height bottom
 * sheet on phones. Only fields that have data are rendered.
 */
const ActivityDialog = ({
  activity,
  open,
  onOpenChange,
  onSelectRelated,
  onVolunteer,
  onCloseAutoFocus,
}: ActivityDialogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastId = useRef<string | undefined>(undefined);

  // When a related chip swaps the content, return to the top and announce the new title.
  useEffect(() => {
    if (!activity) return;
    if (lastId.current && lastId.current !== activity.id) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      titleRef.current?.focus();
    }
    lastId.current = activity.id;
  }, [activity]);

  useEffect(() => {
    if (!open) lastId.current = undefined;
  }, [open]);

  const related = (activity?.related ?? [])
    .map((id) => getActivity(id))
    .filter((a): a is Activity => Boolean(a));

  const setTitleRef = useCallback((node: HTMLHeadingElement | null) => {
    titleRef.current = node;
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl outline-none",
            // Phones: full-height bottom sheet.
            "inset-x-0 bottom-0 h-[92dvh] rounded-t-3xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            // Tablet and up: centred dialog.
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[88vh] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
            "sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95",
            "duration-300 motion-reduce:animate-none",
          )}
        >
          {activity && (
            <>
              <DialogPrimitive.Close
                aria-label="Close"
                className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Close>

              <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
                <PhotoCarousel key={activity.id} activity={activity} />

                <div className="activity-dialog-copy space-y-6 px-5 py-6 text-left sm:px-8">
                  <header>
                    <span className="activity-dialog-category inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      <span className="activity-dialog-category-label">{activity.category}</span>
                    </span>
                    <DialogTitle
                      ref={setTitleRef}
                      tabIndex={-1}
                      className="activity-dialog-title mt-3 font-display text-2xl font-bold leading-tight outline-none sm:text-3xl"
                    >
                      {activity.title}
                    </DialogTitle>
                    <DialogDescription className="activity-dialog-summary mt-2 text-base leading-relaxed text-foreground/90">
                      {activity.summary}
                    </DialogDescription>

                    {(activity.date || (activity.locations && activity.locations.length > 0)) && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {activity.date && (
                          <li className="activity-dialog-meta inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm text-foreground">
                            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            {activity.date}
                          </li>
                        )}
                        {activity.locations?.map((loc) => (
                          <li
                            key={loc}
                            className="activity-dialog-meta inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm text-foreground"
                          >
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                            <span className="activity-dialog-location-label leading-none">{loc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </header>

                  {activity.highlights && activity.highlights.length > 0 && (
                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {activity.highlights.map((h) => (
                        <div key={h.label} className="rounded-xl bg-primary px-4 py-3 text-primary-foreground">
                          <dd className="font-display text-2xl font-bold">{h.value}</dd>
                      <dt className="activity-dialog-small-label text-sm text-primary-foreground/90">{h.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}

                  <section>
                    <SectionLabel>About this activity</SectionLabel>
                    <p className="text-base leading-relaxed text-foreground/90">{activity.description}</p>
                  </section>

                  {activity.objective && (
                    <section>
                      <SectionLabel>Purpose</SectionLabel>
                      <p className="text-base leading-relaxed text-foreground/90">{activity.objective}</p>
                    </section>
                  )}

                  {activity.outcomes && activity.outcomes.length > 0 && (
                    <section>
                      <SectionLabel>Outcomes</SectionLabel>
                      <ul className="space-y-1.5">
                        {activity.outcomes.map((o) => (
                          <li key={o} className="flex gap-2 text-base leading-relaxed text-foreground/90">
                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {related.length > 0 && (
                    <section>
                      <SectionLabel>Related activities</SectionLabel>
                      <ul className="flex flex-wrap gap-2">
                        {related.map((r) => (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => onSelectRelated(r.id)}
                              className="min-h-11 rounded-full border border-border bg-card px-4 text-base font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <span className="activity-dialog-related-label">{r.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>

              <div className="border-t border-border bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                <button
                  type="button"
                  onClick={() => onVolunteer(activity)}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
                >
                  <span className="inline-flex items-center gap-1.5">
                    Volunteer for this activity
                    <ArrowRight className="relative -top-[3px] h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  </span>
                </button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
};

export default ActivityDialog;

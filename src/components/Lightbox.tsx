import { useCallback, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, m as motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  /** Index of the photo being shown, or null when the viewer is closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Where focus goes on close. Falls back to whatever had focus when it opened. */
  returnFocusTo?: HTMLElement | null;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;

const controlClass =
  "flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * Full-screen photo viewer shared by the Oath for Change slider and the Gallery.
 * Previous/next buttons, arrow keys and swipe; Escape or a tap on the dark area
 * closes it. Focus is trapped while open and returned afterwards, and the page
 * behind cannot scroll.
 */
const Lightbox = ({ images, index, onIndexChange, onClose, returnFocusTo }: LightboxProps) => {
  const reduceMotion = useReducedMotion();
  const open = index !== null && images.length > 0;
  const count = images.length;

  const openerRef = useRef<HTMLElement | null>(null);
  const lastIndexRef = useRef(0);
  const directionRef = useRef(1);
  const draggingRef = useRef(false);

  if (index !== null) lastIndexRef.current = Math.min(index, Math.max(count - 1, 0));
  const current = images[lastIndexRef.current];

  const go = useCallback(
    (delta: number) => {
      if (count < 2 || index === null) return;
      directionRef.current = delta;
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  // Warm the browser cache for the photos on either side.
  useEffect(() => {
    if (index === null || count < 2) return;
    for (const delta of [-1, 1]) {
      const img = new Image();
      img.src = images[(index + delta + count) % count].src;
    }
  }, [index, count, images]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (draggingRef.current = false), 60);
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  };

  const slide = reduceMotion ? 0 : 56;
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? slide : -slide, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -slide : slide, opacity: 0 }),
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/95 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          onOpenAutoFocus={() => {
            if (document.activeElement instanceof HTMLElement) openerRef.current = document.activeElement;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            const target = returnFocusTo?.isConnected ? returnFocusTo : openerRef.current;
            target?.focus();
            openerRef.current = null;
          }}
          className="fixed inset-0 z-[60] flex flex-col text-white outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Photo viewer</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {count > 1
              ? "Use the left and right arrow keys, the buttons or swipe to move between photos. Press Escape to close."
              : "Press Escape to close."}
          </DialogPrimitive.Description>

          {/* Top bar: counter and close */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <p
              aria-hidden="true"
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium tabular-nums backdrop-blur"
            >
              {lastIndexRef.current + 1} / {count}
            </p>
            <DialogPrimitive.Close
              aria-label="Close photo viewer"
              className={cn(controlClass, "pointer-events-auto")}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            Photo {lastIndexRef.current + 1} of {count}
          </p>

          {/* Photo stage: a tap on the dark area closes the viewer */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pb-24 pt-20 md:px-24 md:pb-24"
            onClick={(e) => {
              if (draggingRef.current) return;
              if ((e.target as HTMLElement).closest("img, button")) return;
              onClose();
            }}
          >
            {current && (
              <AnimatePresence initial={false} custom={directionRef.current} mode="popLayout">
                <motion.div
                  key={lastIndexRef.current}
                  custom={directionRef.current}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragStart={() => (draggingRef.current = true)}
                  onDragEnd={onDragEnd}
                  className="flex h-full w-full items-center justify-center"
                >
                  <SmartImage
                    src={current.src}
                    alt={current.alt}
                    priority
                    wrapperClassName="flex h-full w-full items-center justify-center bg-transparent"
                    className="h-auto max-h-full w-auto max-w-full select-none object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Caption */}
          {current?.caption && (
            <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-sm text-white/90 md:px-28 md:pb-6">
              {current.caption}
            </p>
          )}

          {/* Prev / next: bottom corners on phones (thumb reach), vertically centred on larger screens */}
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => go(-1)}
                className={cn(
                  controlClass,
                  "absolute left-4 z-10 bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-auto md:top-1/2 md:-translate-y-1/2",
                )}
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => go(1)}
                className={cn(
                  controlClass,
                  "absolute right-4 z-10 bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-auto md:top-1/2 md:-translate-y-1/2",
                )}
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Lightbox;

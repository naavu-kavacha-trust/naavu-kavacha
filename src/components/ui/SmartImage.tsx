import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const observedImages = new Map<Element, () => void>();
let nearViewportObserver: IntersectionObserver | null = null;

function observeNearViewport(element: Element, onVisible: () => void): (() => void) | null {
  if (typeof IntersectionObserver === "undefined") return null;

  nearViewportObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const load = observedImages.get(entry.target);
        if (!load) continue;
        observedImages.delete(entry.target);
        nearViewportObserver?.unobserve(entry.target);
        load();
      }
      if (observedImages.size === 0) {
        nearViewportObserver?.disconnect();
        nearViewportObserver = null;
      }
    },
    { rootMargin: "300px 0px" },
  );
  observedImages.set(element, onVisible);
  nearViewportObserver.observe(element);

  return () => {
    observedImages.delete(element);
    nearViewportObserver?.unobserve(element);
    if (observedImages.size === 0) {
      nearViewportObserver?.disconnect();
      nearViewportObserver = null;
    }
  };
}

interface SmartImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "loading"> {
  src: string;
  /** Required: describe the photo, or pass "" only for purely decorative images. */
  alt: string;
  /** Above-the-fold images: loads eagerly instead of lazily. */
  priority?: boolean;
  /** Near-the-top images: load eagerly without asking the browser to prioritize them. */
  eager?: boolean;
  /** Intrinsic dimensions. Pass both so the browser reserves space (no layout shift). */
  width?: number;
  height?: number;
  /** Classes for the outer wrapper (size, rounding, margins). */
  wrapperClassName?: string;
}

/**
 * Image with lazy loading, async decoding, a soft skeleton while loading,
 * and a neutral leaf placeholder if the file fails to load.
 */
const SmartImage = ({
  src,
  alt,
  priority = false,
  eager = false,
  srcSet,
  width,
  height,
  className,
  wrapperClassName,
  onLoad,
  onError,
  ...rest
}: SmartImageProps) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [requestedSrc, setRequestedSrc] = useState<string | null>(() => (priority || eager ? src : null));
  const [nativeLazyFallback, setNativeLazyFallback] = useState(false);
  const shouldLoad = Boolean(src) && (priority || eager || requestedSrc === src || nativeLazyFallback);

  // Reset the visual state when a carousel or lightbox reuses this image for another photo.
  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  // Start the request shortly before the image enters view. The native lazy-loading
  // attribute remains the fallback on browsers without IntersectionObserver.
  useEffect(() => {
    if (!src) return;
    if (priority || eager) {
      setRequestedSrc(src);
      return;
    }

    const wrapper = wrapperRef.current;
    if (typeof IntersectionObserver === "undefined") {
      setNativeLazyFallback(true);
      return;
    }
    if (!wrapper) {
      return;
    }

    const stopObserving = observeNearViewport(wrapper, () => setRequestedSrc(src));
    if (!stopObserving) {
      setNativeLazyFallback(true);
      return;
    }
    return stopObserving;
  }, [src, priority, eager]);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (shouldLoad && img?.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, [src, shouldLoad]);

  const aspectRatio = width && height ? `${width} / ${height}` : undefined;

  if (status === "error") {
    return (
      <div
        role="img"
        aria-label={alt || "Image unavailable"}
        style={{ aspectRatio }}
        className={cn(
          "relative flex h-full w-full min-h-[8rem] items-center justify-center bg-secondary/60 text-primary/60",
          wrapperClassName,
        )}
      >
        <Leaf className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}>
      {status === "loading" && (
        <div
          aria-hidden="true"
          style={{ aspectRatio }}
          className="absolute inset-0 animate-pulse bg-secondary/60 motion-reduce:animate-none"
        />
      )}
      <img
        ref={imgRef}
        src={shouldLoad ? src : undefined}
        srcSet={shouldLoad ? srcSet : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={nativeLazyFallback && !priority && !eager ? "lazy" : shouldLoad ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
        onLoad={(e) => {
          setStatus("loaded");
          onLoad?.(e);
        }}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
};

export default SmartImage;

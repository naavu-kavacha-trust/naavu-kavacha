import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "loading"> {
  src: string;
  /** Required: describe the photo, or pass "" only for purely decorative images. */
  alt: string;
  /** Above-the-fold images: loads eagerly instead of lazily. */
  priority?: boolean;
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

  // Reset when the source changes (e.g. carousels or lightboxes reusing the component).
  // An empty src means "no photo yet" and shows the placeholder straight away.
  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, [src]);

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
    <div className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}>
      {status === "loading" && (
        <div
          aria-hidden="true"
          style={{ aspectRatio }}
          className="absolute inset-0 animate-pulse bg-secondary/60 motion-reduce:animate-none"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
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

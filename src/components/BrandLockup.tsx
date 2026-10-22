import { LEGAL_ENTITY } from "@/data/siteConfig";
import logo96 from "@/assets/optimized/logo-96.webp";
import logo192 from "@/assets/optimized/logo-192.webp";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  /** Colour of the name, e.g. "text-sand" over the hero or "text-primary" on a light bar. */
  nameClassName?: string;
  /** Colour of the legal-entity line. */
  legalClassName?: string;
  logoClassName?: string;
  /** Set false where the legal entity is shown elsewhere (the footer shows it in its bottom row). */
  showLegal?: boolean;
  className?: string;
}

/** Round logo mark, the name and, underneath it, the legal entity. Used in the header, menu and footer. */
const BrandLockup = ({
  nameClassName = "text-primary",
  legalClassName = "text-muted-foreground",
  logoClassName = "h-11 w-11",
  showLegal = true,
  className,
}: BrandLockupProps) => (
  <span className={cn("flex items-center gap-2.5 sm:gap-3", className)}>
    <img
      src={logo192}
      srcSet={`${logo96} 96w, ${logo192} 192w`}
      sizes="56px"
      alt=""
      width={96}
      height={96}
      className={cn("shrink-0 rounded-full", logoClassName)}
    />
    <span className="flex min-w-0 flex-col leading-tight">
      <span className={cn("font-display text-xl font-bold tracking-wide transition-colors sm:text-2xl", nameClassName)}>
        NAAVU KAVACHA
      </span>
      {showLegal && (
        <span className={cn("text-[11px] font-medium leading-snug transition-colors", legalClassName)}>{LEGAL_ENTITY}</span>
      )}
    </span>
  </span>
);

export default BrandLockup;

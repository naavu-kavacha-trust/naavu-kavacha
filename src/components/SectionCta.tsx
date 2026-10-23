import { Link } from "react-router-dom";
import { ROUTES } from "@/data/siteConfig";

interface SectionCtaProps {
  /** One short line that leads into the button. */
  message: string;
  label?: string;
  className?: string;
}

/** Closing "Join Us" action at the end of a section on a light background. */
const SectionCta = ({ message, label = "Join Us", className = "mt-14" }: SectionCtaProps) => (
  <div className={`${className} text-center`}>
    <p className="mb-5 text-muted-foreground">{message}</p>
    <Link
      to={ROUTES.volunteer}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 py-3.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {label}
    </Link>
  </div>
);

export default SectionCta;

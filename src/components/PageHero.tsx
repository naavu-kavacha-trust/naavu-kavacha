import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/data/siteConfig";

interface PageHeroProps {
  /** Small label above the title. */
  eyebrow: string;
  /** The page's one and only h1; also the last step of the breadcrumb. */
  title: string;
  /** One supporting line under the title. */
  description: string;
  /** Light treatment for pages whose content already has a strong colour block. */
  tone?: "dark" | "light";
}

/**
 * Banner at the top of every page except Home. A plain dark band (no photo, so it adds no download and cannot
 * shift the layout), tall enough to clear the fixed navbar. It owns the page's only <h1>.
 * Text colours were checked on `bark`: sand 7.5:1, cream 9.5:1, cream at 85% 7.4:1.
 */
const PageHero = ({ eyebrow, title, description, tone = "dark" }: PageHeroProps) => {
  const light = tone === "light";

  return (
  <header className={`relative flex min-h-[32vh] items-end overflow-hidden px-6 pb-10 pt-28 md:min-h-[38vh] md:px-12 md:pb-14 md:pt-36 lg:min-h-[42vh] lg:px-20 xl:px-32 ${light ? "bg-background" : "bg-bark"}`}>
    <div aria-hidden="true" className={`absolute -right-16 -top-20 h-64 w-64 rounded-full ${light ? "bg-primary/5" : "bg-primary/25"}`} />
    <div aria-hidden="true" className={`absolute -bottom-24 left-1/3 h-56 w-56 rounded-full ${light ? "bg-leaf/5" : "bg-leaf/10"}`} />

    <div className="hero-rise relative mx-auto w-full max-w-7xl">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className={`flex flex-wrap items-center gap-1 text-sm ${light ? "text-muted-foreground" : "text-sand"}`}>
          <li>
            <Link
              to={ROUTES.home}
              className={`inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${light ? "hover:text-primary focus-visible:ring-primary focus-visible:ring-offset-background" : "hover:text-cream focus-visible:ring-sand focus-visible:ring-offset-bark"}`}
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li aria-current="page" className={`font-medium ${light ? "text-foreground" : "text-cream"}`}>
            {title}
          </li>
        </ol>
      </nav>

      <p className={`mb-3 text-sm font-medium uppercase tracking-[0.2em] ${light ? "text-primary" : "text-sand"}`}>{eyebrow}</p>
      <h1 className={`font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl ${light ? "text-foreground" : "text-cream"}`}>{title}</h1>
      <p className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${light ? "text-muted-foreground" : "text-cream/85"}`}>{description}</p>
    </div>
  </header>
  );
};

export default PageHero;

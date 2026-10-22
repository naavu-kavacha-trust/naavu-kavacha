import { Link } from "react-router-dom";
import { ROUTES } from "@/data/siteConfig";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <picture className="absolute inset-0 block">
        <source
          type="image/webp"
          srcSet="/images/hero-bg-768.webp 768w, /images/hero-bg-1440.webp 1440w"
          sizes="100vw"
        />
        <img
          src="/images/hero-bg-1440.webp"
          alt=""
          aria-hidden="true"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-bark/60" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p
          className="hero-rise text-sand text-sm md:text-base font-body tracking-[0.3em] uppercase mb-6"
        >
          Student-Driven Environmental Initiative
        </p>

        <h1
          style={{ animationDelay: "0.15s" }}
          className="hero-rise text-4xl md:text-6xl lg:text-7xl font-display font-bold text-sand leading-tight mb-6"
        >
          Protecting Nature,
          <br />
          <span className="italic">One Seed at a Time</span>
        </h1>

        <p
          style={{ animationDelay: "0.3s" }}
          className="hero-rise text-sand/80 text-base md:text-lg font-body leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Naavu Kavacha Trust is a student-driven environmental initiative working across Karnataka
          through awareness programs, seed collection, plantation drives, and community action.
        </p>

        <div
          style={{ animationDelay: "0.45s" }}
          className="hero-rise flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to={ROUTES.volunteer}
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium hover:bg-forest-light transition-colors text-sm"
          >
            Become a Volunteer
          </Link>
          <Link
            to={ROUTES.ourWork}
            className="border border-sand/40 text-sand px-8 py-3.5 rounded-full font-medium hover:bg-sand/10 transition-colors text-sm"
          >
            Explore Our Work
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

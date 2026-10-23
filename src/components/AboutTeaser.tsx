import { Link } from "react-router-dom";
import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import logo400 from "@/assets/optimized/logo-about-400.webp";
import logo800 from "@/assets/optimized/logo-about-800.webp";
import SmartImage from "@/components/ui/SmartImage";
import { getStory } from "@/data/about";
import { formatStat, getHeadlineStats } from "@/data/impact";
import { ROUTES, SECTION_IDS } from "@/data/siteConfig";

// The same two verified figures as the About page. Unverified stats are never shown.
const stats = getHeadlineStats();
const story = getStory();

/**
 * Home-page introduction: the start of the About page's story (from `data/about.ts`), the organization logo and headline
 * figures, and a way on to the full About page. The wording is the About page's own (nothing new is claimed).
 */
const AboutTeaser = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id={SECTION_IDS.aboutTeaser} className="section-padding overflow-x-clip bg-background">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">About Us</p>
          <h2 className="section-title mb-6">Who We Are</h2>
          <div className="max-w-prose space-y-5 text-lg leading-relaxed text-muted-foreground">
            {story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.id}>
                <p className="font-display text-3xl font-bold text-primary">{formatStat(stat)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <Link
            to={ROUTES.about}
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Our story &amp; team
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-2xl bg-black shadow-xl">
            <SmartImage
              src={logo400}
              srcSet={`${logo400} 400w, ${logo800} 800w`}
              sizes="(max-width: 767px) 90vw, 400px"
              alt="Naavu Kavacha logo"
              width={500}
              height={499}
              eager={inView}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 -z-10 h-24 w-24 rounded-full bg-primary/10" />
          <div className="absolute -right-4 -top-4 -z-10 h-16 w-16 rounded-full bg-leaf/10" />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutTeaser;

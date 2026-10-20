import { useRef } from "react";
import { m as motion, useInView, useReducedMotion } from "framer-motion";
import logo from "@/assets/logo.png";
import SmartImage from "@/components/ui/SmartImage";
import { aboutContent, getStory, resolveStoryImage, type AboutContent } from "@/data/about";
import { formatStat, getHeadlineStats } from "@/data/impact";
import { SECTION_IDS } from "@/data/siteConfig";

// The two headline figures. Unverified stats are never shown.
const stats = getHeadlineStats();

const FALLBACK_IMAGE = { src: logo, alt: "Naavu Kavacha logo" };

/** "Our Story": the story paragraphs, brand image, and two verified figures. Story text comes from `data/about.ts`. */
const OurStory = ({ content = aboutContent }: { content?: AboutContent }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const story = getStory(content);
  const image = resolveStoryImage(content) ?? FALLBACK_IMAGE;

  if (story.length === 0) return null;

  const slide = (x: number) => (reduceMotion ? false : { opacity: 0, x });

  return (
    <section id={SECTION_IDS.story} className="section-padding overflow-x-clip bg-background">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
        <motion.div initial={slide(-40)} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Who We Are</p>
          <h2 className="section-title mb-8">Our Story</h2>
          <div className="max-w-prose space-y-5 text-lg leading-relaxed text-muted-foreground">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {stats.length > 0 && (
            <div className="mt-10 flex gap-10">
              {stats.map((stat) => (
                <div key={stat.id}>
                  <p className="font-display text-3xl font-bold text-primary">{formatStat(stat)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={slide(40)}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-2xl bg-black shadow-xl">
            <SmartImage
              src={image.src}
              alt={image.alt}
              width={500}
              height={499}
              wrapperClassName="h-full w-full"
              className="object-contain"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 -z-10 h-24 w-24 rounded-full bg-primary/10" />
          <div className="absolute -right-4 -top-4 -z-10 h-16 w-16 rounded-full bg-leaf/10" />
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;

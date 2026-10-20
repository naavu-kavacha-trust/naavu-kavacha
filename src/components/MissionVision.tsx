import { useRef } from "react";
import { m as motion, useInView, useReducedMotion } from "framer-motion";
import {
  aboutContent,
  getMission,
  getValues,
  getVision,
  hasMissionSection,
  missionSectionTitle,
  type AboutContent,
} from "@/data/about";
import { SECTION_IDS } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

const card = "rounded-2xl border border-border bg-card p-8 shadow-sm";

/**
 * Mission, vision and values, only the parts the team has supplied. With nothing supplied the whole section
 * (heading included) is left out, and so is its link in the page's sub-navigation.
 */
const MissionVision = ({ content = aboutContent }: { content?: AboutContent }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();

  if (!hasMissionSection(content)) return null;

  const mission = getMission(content);
  const vision = getVision(content);
  const values = getValues(content);
  const rise = reduceMotion ? false : { opacity: 0, y: 30 };

  return (
    <section id={SECTION_IDS.mission} className="section-padding bg-sand/40">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">What Guides Us</p>
          <h2 className="section-title">{missionSectionTitle(content)}</h2>
        </div>

        {(mission || vision) && (
          <div className={cn("mx-auto grid gap-6", mission && vision ? "md:grid-cols-2" : "max-w-3xl")}>
            {mission && (
              <motion.article
                initial={rise}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className={card}
              >
                <h3 className="mb-3 font-display text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{mission}</p>
              </motion.article>
            )}
            {vision && (
              <motion.article
                initial={rise}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={card}
              >
                <h3 className="mb-3 font-display text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{vision}</p>
              </motion.article>
            )}
          </div>
        )}

        {values.length > 0 && (
          <div className={cn((mission || vision) && "mt-12")}>
            {(mission || vision) && (
              <h3 className="mb-6 text-center font-display text-2xl font-bold text-foreground">Our Values</h3>
            )}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <li key={value.title} className={cn(card, "p-6")}>
                  <h4 className="mb-2 font-display text-lg font-bold text-foreground">{value.title}</h4>
                  <p className="text-muted-foreground">{value.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default MissionVision;

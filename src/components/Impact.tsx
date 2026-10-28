import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Leaf } from "lucide-react";
import CountUp from "@/components/CountUp";
import { getImpactStats } from "@/data/impact";
import { SECTION_IDS } from "@/data/siteConfig";

// Only verified figures are ever rendered (see src/data/impact.ts).
const verifiedStats = getImpactStats();

const Impact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id={SECTION_IDS.impact} className="impact-section section-padding bg-primary">
      <div ref={ref} className="mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="mb-3 text-sm uppercase tracking-[0.2em] text-primary-foreground/90"
        >
          Numbers That Matter
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl"
        >
          What We Have Achieved
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="impact-intro-copy mx-auto mb-14 max-w-xl text-primary-foreground/80"
        >
          Every figure below was earned by student volunteers, one seed, one sapling and one
          school at a time.
        </motion.p>

        <ul className="impact-stat-grid grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {verifiedStats.map((stat, i) => {
            const Icon = stat.icon ?? Leaf;
            return (
              <motion.li
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 px-3 py-7 sm:px-6 sm:py-9"
              >
                <Icon className="mb-4 h-8 w-8 text-leaf" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                  <CountUp stat={stat} />
                </p>
                <p className="impact-stat-label mt-2 text-sm text-primary-foreground/90">{stat.label}</p>
              </motion.li>
            );
          })}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="impact-cta mt-14"
        >
          <p className="mx-auto max-w-xl text-lg text-primary-foreground">
            Real results come from many hands. Add yours to the next number.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact;

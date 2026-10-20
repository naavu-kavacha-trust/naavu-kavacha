import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import CleanUpDriveFeature from "@/components/CleanUpDriveFeature";
import WhatWeDoCard from "@/components/WhatWeDoCard";
import { getWhatWeDoActivities } from "@/data/activities";
import { SECTION_IDS } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

// Cards come from the same data as Projects & Activities and open the same pop-up.
const items = getWhatWeDoActivities();

const WhatWeDo = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  // With three columns and one card left over, centre it instead of leaving it hanging on the left.
  const centreLast = items.length % 3 === 1;

  return (
    <section id={SECTION_IDS.whatWeDo} className="section-padding bg-background">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Our Work</p>
          <h2 className="section-title">What We Do</h2>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((activity, i) => (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.1 }}
              className={cn(
                "list-none",
                centreLast && i === items.length - 1 && "lg:col-start-2",
              )}
            >
              <WhatWeDoCard activity={activity} />
            </motion.li>
          ))}
        </ul>

        <CleanUpDriveFeature />
      </div>
    </section>
  );
};

export default WhatWeDo;

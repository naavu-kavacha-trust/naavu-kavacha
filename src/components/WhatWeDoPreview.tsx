import { Link } from "react-router-dom";
import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import WhatWeDoCard from "@/components/WhatWeDoCard";
import { getWhatWeDoActivities } from "@/data/activities";
import { HOME_WHAT_WE_DO_LIMIT, ROUTES, SECTION_IDS } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

// The first few What We Do cards, in their usual order. The full set lives on the Our Work page.
const items = getWhatWeDoActivities().slice(0, HOME_WHAT_WE_DO_LIMIT);

/** Home-page preview of What We Do. The cards open the same activity pop-up as on the Our Work page. */
const WhatWeDoPreview = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id={SECTION_IDS.whatWeDoPreview} className="section-padding bg-card">
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
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "list-none",
                // With two columns and an odd card out, centre it at card width instead of stretching it.
                items.length % 2 === 1 &&
                  i === items.length - 1 &&
                  "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)] lg:col-span-1 lg:mx-0 lg:w-auto",
              )}
            >
              <WhatWeDoCard activity={activity} />
            </motion.li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link
            to={ROUTES.ourWork}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span className="localized-action-label inline-flex items-baseline gap-1.5">
              See all projects &amp; activities
              <ArrowRight className="relative top-[2px] h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoPreview;

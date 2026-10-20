import { AnimatePresence, m as motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import { ACTIVITY_CATEGORIES, activities, type ActivityCategory } from "@/data/activities";
import { cn } from "@/lib/utils";
import SectionCta from "@/components/SectionCta";

type Filter = "All" | ActivityCategory;

const Projects = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");

  // Only offer categories that have at least one activity.
  const filters: Filter[] = useMemo(
    () => ["All", ...ACTIVITY_CATEGORIES.filter((c) => activities.some((a) => a.category === c))],
    [],
  );
  const visible = useMemo(
    () => (filter === "All" ? activities : activities.filter((a) => a.category === filter)),
    [filter],
  );

  return (
    <section id="projects" className="section-padding bg-background">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Our Reach</p>
          <h2 className="section-title">Projects &amp; Activities</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Tap any activity to see where we have worked, what we do and how you can help.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter activities by category"
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "min-h-11 rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/60",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "activity" : "activities"}
          {filter === "All" ? "" : ` in ${filter}`}
        </p>

        <motion.ul
          layout={!reduceMotion}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((activity, i) => (
              <motion.li
                key={activity.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: inView ? Math.min(i, 4) * 0.06 : 0 }}
                className="list-none"
              >
                <ActivityCard activity={activity} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <SectionCta message="Found an activity you would like to help with? Tell us and we will get in touch." />
      </div>
    </section>
  );
};

export default Projects;

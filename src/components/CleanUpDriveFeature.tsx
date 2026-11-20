import { Link } from "react-router-dom";
import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { getActivity } from "@/data/activities";
import { ROUTES } from "@/data/siteConfig";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { useVolunteerPrefill } from "@/hooks/use-volunteer-prefill";

const activity = getActivity("clean-up-drive");

/** Full-width feature under the What We Do cards: photo on one side, text and two actions on the other. */
const CleanUpDriveFeature = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { openActivity } = useActivityDialog();
  const { prefill } = useVolunteerPrefill();

  if (!activity) return null;
  const photo = activity.images[0];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      aria-labelledby="cleanup-feature-title"
      role="group"
      className="mt-16 grid items-center gap-8 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2 lg:gap-0"
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[28rem]">
        <SmartImage
          src={activity.coverImage}
          srcSet={activity.coverImageSrcSet}
          sizes="(max-width: 1023px) 100vw, (min-width: 1280px) 640px, 50vw"
          alt={photo?.alt ?? activity.title}
          wrapperClassName="absolute inset-0"
          className="object-[center_60%]"
        />
      </div>

      <div className="px-6 pb-10 sm:px-10 lg:px-14 lg:py-14">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Clean-Up Drive</p>
        <h3 id="cleanup-feature-title" className="mb-5 font-display text-3xl font-bold text-foreground md:text-4xl">
          Cleaner streets, healthier neighbourhoods
        </h3>
        <p className="cleanup-feature-description mb-8 leading-relaxed text-muted-foreground">{activity.description}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={(e) => openActivity(activity.id, e.currentTarget)}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="cleanup-feature-action-label">See Clean-Up Drives</span>
          </button>
          <Link
            to={ROUTES.volunteer}
            onClick={() => prefill([activity.interestTag])}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="cleanup-feature-action-label">Join the next drive</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CleanUpDriveFeature;

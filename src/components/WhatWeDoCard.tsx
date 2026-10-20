import { ArrowRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { type getWhatWeDoActivities } from "@/data/activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { cn } from "@/lib/utils";

type WhatWeDoActivity = ReturnType<typeof getWhatWeDoActivities>[number];

/** One What We Do card. Opens the shared activity pop-up. Used on the Our Work page and the home preview. */
const WhatWeDoCard = ({
  activity,
  className,
}: {
  activity: WhatWeDoActivity;
  className?: string;
}) => {
  const { openActivity } = useActivityDialog();
  const title = activity.whatWeDo.title ?? activity.title;
  const description = activity.whatWeDo.description ?? activity.summary;
  const hasPhoto = Boolean(activity.coverImage);
  const Icon = activity.icon;

  return (
    <article
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        className,
      )}
    >
      {hasPhoto ? (
        <div className="h-48 w-full overflow-hidden bg-secondary/40">
          <SmartImage
            src={activity.coverImage}
            alt={activity.images[0]?.alt ?? title}
            wrapperClassName="h-full"
            className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      ) : (
        // No photo yet (see MISSING_ASSETS.md): keep the original icon treatment for this card only.
        <div className="px-8 pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
            {Icon && <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />}
          </div>
        </div>
      )}

      <div className={cn("flex flex-1 flex-col px-8 pb-8", hasPhoto ? "pt-6" : "pt-5")}>
        <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
          <button
            type="button"
            aria-haspopup="dialog"
            data-whatwedo-card={activity.id}
            onClick={(e) => openActivity(activity.id, e.currentTarget)}
            className="text-left outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </button>
        </h3>
        <p className="text-base leading-relaxed text-foreground">{description}</p>
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1 pt-5 text-base font-medium text-primary"
        >
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
};

export default WhatWeDoCard;

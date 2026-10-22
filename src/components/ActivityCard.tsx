import { ArrowRight, MapPin } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import type { Activity } from "@/data/activities";

const MAX_CHIPS = 3;

/**
 * One activity in the Projects grid. The whole card is clickable: the title is a
 * real <button> whose ::after stretches over the card, so keyboard and screen
 * reader users get a short accessible name ("Seedball Dispersal") and a proper
 * heading, while mouse and touch users can tap anywhere.
 */
const ActivityCard = ({ activity }: { activity: Activity }) => {
  const { openActivity, prefetchActivityDialog } = useActivityDialog();
  const locations = activity.locations ?? [];
  const shown = locations.slice(0, MAX_CHIPS);
  const hidden = locations.length - shown.length;

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background">
      <div className="relative h-48 w-full overflow-hidden bg-secondary/40">
        <SmartImage
          src={activity.coverImage}
          srcSet={activity.coverImageSrcSet}
          sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 3rem), 33vw"
          alt={activity.coverImage ? (activity.images[0]?.alt ?? activity.title) : activity.title}
          wrapperClassName="h-full"
          className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-sm font-medium text-primary shadow-sm">
          {activity.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-foreground">
          <button
            type="button"
            aria-haspopup="dialog"
            data-activity-card={activity.id}
            onMouseEnter={prefetchActivityDialog}
            onFocus={prefetchActivityDialog}
            onTouchStart={prefetchActivityDialog}
            onClick={(e) => openActivity(activity.id, e.currentTarget)}
            className="text-left outline-none after:absolute after:inset-0 after:content-['']"
          >
            {activity.title}
          </button>
        </h3>

        <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-foreground/80">
          {activity.summary}
        </p>

        {shown.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Locations">
            {shown.map((loc) => (
              <li
                key={loc}
                className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[0.8125rem] text-foreground/80"
              >
                <MapPin className="h-3 w-3 flex-shrink-0 text-primary" aria-hidden="true" />
                {loc}
              </li>
            ))}
            {hidden > 0 && (
              <li className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-[0.8125rem] text-foreground/80">
                +{hidden} more
              </li>
            )}
          </ul>
        )}

        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1 pt-5 text-base font-medium text-primary"
        >
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
};

export default ActivityCard;

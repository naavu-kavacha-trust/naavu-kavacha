import { initialsOf } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * A tasteful stand-in for a missing photo: the person's initials on the brand green, in the same 4:5 shape as a
 * portrait so nothing shifts when a photo is added. Decorative, because the name is always written next to it.
 */
const InitialsAvatar = ({ name, textClassName }: { name: string; textClassName?: string }) => (
  <div
    aria-hidden="true"
    data-testid="initials-avatar"
    className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-primary"
  >
    <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-forest-light/30" />
    <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-leaf/15" />
    <span
      className={cn(
        "relative font-display font-bold tracking-wide text-primary-foreground",
        textClassName ?? "text-7xl md:text-8xl",
      )}
    >
      {initialsOf(name)}
    </span>
  </div>
);

export default InitialsAvatar;

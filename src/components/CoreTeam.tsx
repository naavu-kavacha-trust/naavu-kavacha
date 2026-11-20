import { useRef, useState, type MouseEvent } from "react";
import { m as motion, useInView, useReducedMotion } from "framer-motion";
import { Instagram, Linkedin } from "lucide-react";
import InitialsAvatar from "@/components/InitialsAvatar";
import SmartImage from "@/components/ui/SmartImage";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SECTION_IDS } from "@/data/siteConfig";
import { GROUP_COPY, getCoreTeam, getSafeSocial, paragraphsOf, resolveTeamPhoto, resolveTeamPhotoSources, selectTeam, type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/FounderSection";

const socialIcon = { LinkedIn: Linkedin, Instagram } as const;

/** A card opens the dialog only when there is something more to show: a bio or a social link. */
const hasMore = (m: TeamMember) => Boolean(m.bio?.trim()) || getSafeSocial(m).length > 0;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Photo (or initials) in a fixed 4:5 frame, so every card in a row lines up whatever the picture's shape. */
const Portrait = ({ member, src, alt, textClassName }: { member: TeamMember; src: string | null; alt: string; textClassName?: string }) => (
  <div className="overflow-hidden rounded-xl bg-secondary/40 shadow-md">
    {src ? (
      <SmartImage src={src} alt={alt} width={1200} height={1500} wrapperClassName="aspect-[4/5]" />
    ) : (
      <InitialsAvatar name={member.name} textClassName={textClassName} />
    )}
  </div>
);

interface CoreTeamProps {
  /** Background, chosen by the About page so the long page keeps alternating. */
  tone?: SectionTone;
  /** Mainly for tests: a list to draw from instead of the site's data. Consent and group are still enforced. */
  members?: TeamMember[];
}

/**
 * "Core Team": a grid of the people who agreed to be shown. Each card shows photo (or initials), name and role.
 * A card is a button, opening a dialog with the larger photo, bio and links, only when there is more to show;
 * otherwise it is plain and not clickable. No contact details are ever shown: a person is reachable only through
 * a social link they chose to share. Renders nothing when nobody is to be shown.
 */
const CoreTeam = ({ members, tone }: CoreTeamProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  // Which card opened the dialog, so focus can go back to it (some browsers do not focus a clicked button).
  const origin = useRef<HTMLElement | null>(null);

  const people = members ? selectTeam(members, "core") : getCoreTeam();
  if (people.length === 0) return null;

  const copy = GROUP_COPY.core;
  const resolvedTone: SectionTone = tone ?? "cream";
  const selected = people.find((p) => p.id === openId) ?? null;
  const selectedPhoto = selected ? resolveTeamPhoto(selected) : null;
  const selectedBody = paragraphsOf(selected?.bio);
  const selectedSocial = selected ? getSafeSocial(selected) : [];
  const rise = reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 };

  const open = (id: string) => (e: MouseEvent<HTMLButtonElement>) => {
    origin.current = e.currentTarget;
    setOpenId(id);
  };

  return (
    <section
      id={SECTION_IDS.team}
      className={cn("section-padding overflow-x-clip", resolvedTone === "cream" ? "bg-background" : "bg-sand/40")}
    >
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.heading}</h2>
        </div>

        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {people.map((person, i) => {
            const photo = resolveTeamPhoto(person);
            const displayPhoto = resolveTeamPhotoSources(person);
            const card = (
              <div className="flex min-h-[132px] items-center gap-4 overflow-hidden rounded-xl border border-primary-foreground/25 bg-team-card pr-5 shadow-sm transition-colors group-hover:border-primary-foreground/45">
                <div className="flex h-32 w-[136px] shrink-0 items-end justify-center overflow-hidden bg-team-card">
                  {photo ? (
                    <SmartImage
                      src={displayPhoto?.src ?? photo}
                      srcSet={displayPhoto?.srcSet}
                      sizes="136px"
                      alt=""
                      width={400}
                      height={650}
                      wrapperClassName="h-full w-full"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-team-card font-display text-2xl font-semibold text-primary-foreground">
                      {person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="min-w-0 py-3 text-left">
                  <span className="block break-words font-sans text-lg font-semibold leading-snug text-primary-foreground sm:text-xl">
                    {person.name}
                  </span>
                  <span className="mt-1 block break-words text-base text-primary-foreground sm:text-lg">{person.role}</span>
                </span>
              </div>
            );

            return (
              <motion.li
                key={person.id}
                initial={rise}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: Math.min(i, 8) * 0.08, ease: "easeOut" }}
                className="min-w-0"
              >
                {hasMore(person) ? (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={open(person.id)}
                    className={cn(
                      "group block w-full rounded-xl text-left transition-transform motion-reduce:transition-none [@media(hover:hover)]:hover:-translate-y-1 motion-reduce:[@media(hover:hover)]:hover:translate-y-0",
                      focusRing,
                    )}
                  >
                    {card}
                  </button>
                ) : (
                  <div>{card}</div>
                )}
              </motion.li>
            );
          })}
        </ul>

      </div>

      <Dialog open={selected !== null} onOpenChange={(next) => !next && setOpenId(null)}>
        <DialogContent
          className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            origin.current?.focus();
            origin.current = null;
          }}
        >
          {selected && (
            <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
              <div className="mx-auto w-full max-w-[13rem]">
                <Portrait member={selected} src={selectedPhoto} alt={`Photo of ${selected.name}`} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-display text-2xl font-bold md:text-3xl">{selected.name}</DialogTitle>
                <DialogDescription className="mt-1 text-base font-medium text-primary">{selected.role}</DialogDescription>

                {selectedBody.length > 0 && (
                  <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
                    {selectedBody.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {selectedSocial.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-3">
                    {selectedSocial.map((link) => {
                      const Icon = socialIcon[link.label];
                      return (
                        <li key={link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/10",
                              focusRing,
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {link.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* The dialog's built-in close icon is small; this one is a full-size target for phones. */}
                <DialogClose asChild>
                  <button
                    type="button"
                    className={cn(
                      "mt-8 inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/10",
                      focusRing,
                    )}
                  >
                    Back to the team
                  </button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CoreTeam;

import { useRef } from "react";
import { m as motion, useInView, useReducedMotion } from "framer-motion";
import { Instagram, Linkedin } from "lucide-react";
import InitialsAvatar from "@/components/InitialsAvatar";
import SmartImage from "@/components/ui/SmartImage";
import {
  GROUP_COPY,
  getCoFounders,
  getFounders,
  getSafeSocial,
  paragraphsOf,
  resolveTeamPhoto,
  resolveTeamPhotoSources,
  selectTeam,
  type TeamMember,
} from "@/data/team";
import { SECTION_IDS } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

export type SectionTone = "cream" | "sand";

interface FounderSectionProps {
  /** Which people this section shows. Founder and Co-Founder use the same layout and rules. */
  group: "founder" | "cofounder";
  /** Background tone selected by the About page. */
  tone?: SectionTone;
  /** Mainly for tests: a list to draw from instead of the site's data. Consent and group are still enforced. */
  members?: TeamMember[];
}

const socialIcon = { LinkedIn: Linkedin, Instagram } as const;

/**
 * "Our Founder" / "Our Co-Founder". Shows each consented person of the group with a 4:5 portrait (or their
 * initials), name, role exactly as supplied, their own message, an optional quote and optional social links.
 * With nobody to show it renders nothing at all, so the section and its sub-navigation chip simply do not exist.
 */
const FounderSection = ({ group, members, tone }: FounderSectionProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();

  const people = members ? selectTeam(members, group) : group === "founder" ? getFounders() : getCoFounders();
  if (people.length === 0) return null;

  const copy = GROUP_COPY[group];
  const resolvedTone: SectionTone = tone ?? (group === "founder" ? "cream" : "sand");
  const rise = reduceMotion ? false : { opacity: 0, y: 36, scale: 0.98 };

  return (
    <section
      id={group === "founder" ? SECTION_IDS.founder : SECTION_IDS.cofounder}
      className={cn("section-padding overflow-x-clip", resolvedTone === "cream" ? "bg-background" : "bg-muted")}
    >
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mx-auto mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Our Team
          </p>
          <h2 className="section-title">{people.length > 1 ? copy.headingMany : copy.heading}</h2>
        </div>

        <div className="mx-auto max-w-6xl space-y-8">
          {people.map((person, i) => {
            // The Founder's portrait starts on the left and the Co-Founder's on the right, so the two sections
            // mirror each other; several people within a group alternate. Phones always show the portrait first.
            const portraitRight = (group === "cofounder") !== (i % 2 === 1);
            const photo = resolveTeamPhoto(person);
            const displayPhoto = resolveTeamPhotoSources(person);
            const message = person.message?.map((p) => p.trim()).filter(Boolean) ?? [];
            const body = message.length > 0 ? message : paragraphsOf(person.bio);
            const social = getSafeSocial(person);

            return (
              <motion.article
                key={person.id}
                initial={rise}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: Math.min(i, 6) * 0.12, ease: "easeOut" }}
                className="grid overflow-hidden rounded-2xl border border-primary/20 border-t-4 border-t-primary/70 bg-background shadow-xl md:min-h-[480px] md:grid-cols-2"
              >
                <div className={cn("flex h-[360px] items-end justify-center bg-gradient-to-br from-primary/10 via-secondary/30 to-sand/70 px-3 pt-4 md:h-[480px] md:px-3 md:pt-6", portraitRight && "md:order-2")}>
                  <div className="h-full w-full max-w-[460px] overflow-hidden">
                    {photo ? (
                      <SmartImage
                        src={displayPhoto?.src ?? photo}
                        srcSet={displayPhoto?.srcSet}
                        sizes="(max-width: 767px) 90vw, (min-width: 1280px) 460px, 45vw"
                        alt={`${person.name}, ${person.role}`}
                        width={1200}
                        height={1500}
                        wrapperClassName="h-full w-full"
                        className="object-contain object-bottom"
                      />
                    ) : (
                      <InitialsAvatar name={person.name} />
                    )}
                  </div>
                </div>

                <div className={cn("flex flex-col justify-center px-7 pt-8 pb-8 md:px-10 md:py-10 lg:px-14", portraitRight && "md:order-1")}>
                  <h3 className="font-sans text-3xl font-bold leading-tight text-foreground md:text-4xl">{person.name}</h3>
                  <p className="mt-3 inline-flex w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary md:text-base">{person.role}</p>

                  {body.length > 0 && (
                    <div className="mt-6 max-w-prose space-y-4 text-sm leading-relaxed text-foreground/80 md:text-base">
                      {body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {person.quote?.trim() && (
                    <blockquote className="mt-8 max-w-prose border-l-4 border-primary/40 pl-5 font-display text-xl italic leading-snug text-foreground">
                      {person.quote.trim()}
                    </blockquote>
                  )}

                  {social.length > 0 && (
                    <ul className="mt-8 flex gap-3">
                      {social.map((link) => {
                        const Icon = socialIcon[link.label];
                        return (
                          <li key={link.url}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${person.name} on ${link.label} (opens in a new tab)`}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FounderSection;

import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { INSTAGRAM_URL, ROUTES, SECTION_IDS, WHATSAPP_CHANNEL_URL } from "@/data/siteConfig";

const outlineLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary";

/** Closing band on the home page: one heading, one line, one filled button, and the two social channels. */
const VolunteerBand = () => (
  <section id={SECTION_IDS.volunteerBand} className="section-padding relative overflow-hidden bg-primary">
    <div aria-hidden="true" className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-forest-light/20" />
    <div aria-hidden="true" className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-leaf/10" />

    <div className="relative z-10 mx-auto max-w-2xl text-center">
      <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
        Be Part of the Change
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
        Students, teachers, schools and organisations are all welcome.
      </p>

      <Link
        to={ROUTES.volunteer}
        className="inline-flex min-h-12 items-center rounded-full bg-primary-foreground px-8 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        Become a Volunteer
      </Link>

      <ul className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <li>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={outlineLink}>
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Follow us on Instagram
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={outlineLink}>
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            Join our WhatsApp channel
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
);

export default VolunteerBand;

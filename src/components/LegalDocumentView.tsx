import { Fragment, type ReactNode } from "react";
import PageHero from "@/components/PageHero";
import { EMAIL, LEGAL_DETAILS } from "@/data/siteConfig";
import type { LegalDocument } from "@/data/legal";
import { useLocale } from "@/i18n/LocaleProvider";

interface LegalDocumentViewProps {
  hero: { eyebrow: string; title: string; description: string };
  content: LegalDocument;
}

const emailLinkClass =
  "font-medium text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm";

/** Replaces each `{email}` in a piece of text with the contact address as a link (the address stays visible so it can be copied). */
const withEmail = (text: string): ReactNode => {
  const parts = text.split("{email}");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <a href={`mailto:${EMAIL}`} className={emailLinkClass}>
          {EMAIL}
        </a>
      )}
    </Fragment>
  ));
};

/**
 * Shared layout of the Privacy Policy and Terms of Service: the page banner, the date, a short contents list, then
 * the numbered sections. Words come from `src/data/legal.ts`; the Trust's registration details (optional) from
 * `LEGAL_DETAILS`. One `h1` (in the banner), `h2` per section, long lines kept to a comfortable length.
 */
const LegalDocumentView = ({ hero, content }: LegalDocumentViewProps) => {
  const { catalog } = useLocale();
  const localize = (text: string) => catalog[text] ?? text;
  const { registrationNumber, registeredAddress, contactPerson } = LEGAL_DETAILS;
  const details = [
    registrationNumber && ["Registration number", registrationNumber],
    registeredAddress && ["Registered address", registeredAddress],
    contactPerson && ["Contact person", contactPerson],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      <PageHero {...hero} />

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-sm text-muted-foreground">
            Last updated: <time>{LEGAL_DETAILS.lastUpdated}</time>
          </p>

          <div className="space-y-4 text-base leading-relaxed text-foreground/90">
            {content.intro.map((paragraph) => (
              <p key={paragraph}>{withEmail(localize(paragraph))}</p>
            ))}
          </div>

          {details.length > 0 && (
            <dl className="mt-8 grid gap-x-6 gap-y-3 rounded-2xl border border-border bg-card p-6 text-sm sm:grid-cols-[auto,1fr]">
              {details.map(([label, value]) => (
                <Fragment key={label}>
                  <dt className="font-semibold text-foreground">{label}</dt>
                  <dd className="text-foreground/90">{value}</dd>
                </Fragment>
              ))}
            </dl>
          )}

          <nav aria-label="Contents" className="mt-10 rounded-2xl bg-sand/50 p-6">
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">Contents</h2>
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {content.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-foreground/90 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="w-6 text-muted-foreground" aria-hidden="true">
                      {index + 1}.
                    </span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12">
            {content.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28">
                <h2 id={`${section.id}-heading`} className="mb-4 font-display text-2xl font-semibold text-foreground md:text-3xl">
                  <span className="mr-2 text-primary" aria-hidden="true">
                    {index + 1}.
                  </span>
                  {section.heading}
                </h2>
                <div className="space-y-4 text-base leading-relaxed text-foreground/90">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{withEmail(localize(paragraph))}</p>)}
                  {section.items && (
                    <ul className="list-disc space-y-2 pl-6 marker:text-primary">
                      {section.items.map((item) => (
                        <li key={item}>{withEmail(localize(item))}</li>
                      ))}
                    </ul>
                  )}
                  {section.after?.map((paragraph) => <p key={paragraph}>{withEmail(localize(paragraph))}</p>)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LegalDocumentView;

import { Link } from "react-router-dom";
import { ArrowUp, Instagram } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import DeferredContactDialog from "@/components/DeferredContactDialog";
import { INSTAGRAM_URL, LEGAL_ENTITY, LEGAL_ROUTES, LINKEDIN_URL, ROUTES } from "@/data/siteConfig";
import { prefetchHandlers } from "@/lib/route-chunks";

// Impact, Journey, Future Plans and the FAQ are not in the top navigation, so they live here.
// Each link opens the page (or the section of a page) where that content now lives.
const quickLinks = [
  { label: "About Us", href: ROUTES.about },
  { label: "Our Work", href: ROUTES.ourWork },
  { label: "Our Impact", href: `${ROUTES.home}#impact` },
  { label: "Gallery", href: ROUTES.gallery },
  { label: "The Journey So Far", href: `${ROUTES.about}#journey` },
  { label: "Future Plans", href: `${ROUTES.about}#future` },
  { label: "Volunteer", href: ROUTES.volunteer },
  { label: "FAQ", href: `${ROUTES.volunteer}#faq` },
];

// 44px tall tap area on phones and tablets (touch); compact again from the desktop breakpoint (xl) up.
const linkClass =
  "inline-flex min-h-11 items-center text-sm text-sand/80 transition-colors hover:text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2 focus-visible:ring-offset-bark rounded-sm xl:min-h-0 xl:py-1";

const Footer = () => {
  return (
    <footer id="contact" className="site-footer bg-bark px-6 pt-16 pb-28 md:px-12 md:pb-24 md:pt-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:gap-16 lg:gap-28">
          {/* Brand, short description and social links */}
          <div>
            <BrandLockup
              className="mb-5"
              nameClassName="text-sand"
              logoClassName="h-14 w-14"
              showLegal={false}
            />
            <div className="max-w-xl space-y-3 text-sm leading-relaxed text-sand/80">
              <p>Together we can nurture the Earth and protect the future.</p>
              <p>
                A student-driven environmental initiative creating a greener Earth through awareness,
                seed collection, plantation drives and community action.
              </p>
            </div>

            <ul className="-ml-2 mt-6 flex items-center gap-2" aria-label="Social media">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naavu Kavacha on Instagram (opens in a new tab)"
                  className="flex h-11 w-11 items-center justify-center text-sand/80 transition-colors hover:text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2 focus-visible:ring-offset-bark"
                >
                  <Instagram className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naavu Kavacha on LinkedIn (opens in a new tab)"
                  className="flex h-11 w-11 items-center justify-center text-sand/80 transition-colors hover:text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2 focus-visible:ring-offset-bark"
                >
                  <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1-.004-4.124 2.062 2.062 0 0 1 .004 4.124zM6.92 20.452H3.753V9H6.92v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </a>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1">
              <DeferredContactDialog subject="General Inquiry">
                <button type="button" className={linkClass}>
                  Email Us
                </button>
              </DeferredContactDialog>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0 })}
                className={`${linkClass} footer-back-to-top relative -top-[3px] rounded-xl border border-sand/25 bg-sand/5 px-4 hover:border-leaf/60 hover:bg-sand/10`}
              >
                <span className="inline-flex items-baseline gap-1.5">
                  Back to top
                  <ArrowUp className="relative top-[3px] h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.15em] text-sand">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-x-8 md:grid-cols-1 md:gap-x-0 md:gap-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className={linkClass} {...prefetchHandlers(link.href)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-sand/15 pt-8 md:flex-row md:items-start md:justify-between">
          <div className="footer-legal-copy space-y-1 text-xs text-sand/70">
            <p>&copy; {new Date().getFullYear()} NAAVU KAVACHA. All rights reserved.</p>
            <p>{LEGAL_ENTITY}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <Link to={LEGAL_ROUTES.privacy} className={linkClass} {...prefetchHandlers(LEGAL_ROUTES.privacy)}>
                Privacy Policy
              </Link>
              <Link to={LEGAL_ROUTES.terms} className={linkClass} {...prefetchHandlers(LEGAL_ROUTES.terms)}>
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

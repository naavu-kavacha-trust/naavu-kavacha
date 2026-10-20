import { m as motion, useInView } from "framer-motion";
import { Suspense, lazy, useRef } from "react";
import { Leaf } from "lucide-react";
import ContactDialog from "@/components/ContactDialog";
import SmartImage from "@/components/ui/SmartImage";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import teamImg from "@/assets/gallery/team-tunturu.jpg";
import { SECTION_IDS, WHATSAPP_CHANNEL_URL } from "@/data/siteConfig";

// Form libraries (react-hook-form, zod) load in their own chunk after the first paint.
const VolunteerForm = lazy(() => import("@/components/VolunteerForm"));

const JoinUs = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id={SECTION_IDS.volunteer} className="section-padding relative overflow-hidden bg-muted">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-leaf/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div ref={ref} className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="mb-6 font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Be Part of the Change
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            We invite volunteers, schools, and organizations to collaborate with Naavu Kavacha
            to protect the environment and build a sustainable future.
          </p>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-[4/3] w-full">
                <SmartImage
                  src={teamImg}
                  alt="Five Naavu Kavacha team members standing on the steps of the Tunturu Mahiti Kendra building"
                  width={1600}
                  height={1200}
                />
              </div>
            </div>

              <p className="mt-6 text-lg leading-relaxed text-foreground/85">
              Students, teachers, schools and organisations are all welcome. Fill in the form and
              we'll get in touch.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ContactDialog
                subject="Partnership Inquiry"
                title="Partner with Naavu Kavacha"
                intro="Schools, colleges and organisations: tell us how you'd like to work together."
                body={"Hello Naavu Kavacha team,\n\nWe'd like to explore partnering with you.\n\nOrganisation:\nContact person:\nPhone:\n\n"}
              >
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/35 bg-primary/5 px-7 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Partner Up
                </button>
              </ContactDialog>
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                Join our WhatsApp channel
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-3xl border border-primary/15 border-t-4 border-t-primary/70 bg-card p-6 text-foreground shadow-xl shadow-foreground/5 sm:p-8 lg:col-span-3"
          >
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Leaf className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">Volunteer with us</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required.</p>
              </div>
            </div>
            <Suspense
              fallback={<div role="status" aria-busy="true" aria-label="Loading the form" className="min-h-[88rem] sm:min-h-[54rem] lg:min-h-[57rem]" />}
            >
              <VolunteerForm />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;

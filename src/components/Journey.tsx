import { m as motion } from "framer-motion";
import { formatStatById } from "@/data/impact";

const milestones = [
  {
    place: "Greenwood High School",
    activities: [
      "Environmental protection awareness program",
      "Seed ball collection competition",
      "Seed collection activity",
      "Prize distribution for the competition",
    ],
  },
  {
    place: "Prakriti Vidyanikethan Public School",
    activities: [
      "Environmental awareness program",
      "Seed collection competition",
      "Seed collection activity",
      "Prize distribution",
    ],
  },
  {
    place: "Karnataka Samskriti Vidyapeetha (KSVP)",
    activities: [
      "Environmental awareness program",
      "Seed collection competition",
      "Seed collection activity",
      "Prize distribution",
      "Seed ball preparation with students",
      `Paper collection drive (${formatStatById("paper-collected")} collected)`,
      "2nd standard awareness program and feedback session",
      "Prize distribution for paper collection drive",
      "“Growing Ganesha” event",
    ],
  },
  {
    place: "Zen International School",
    activities: [
      "Environmental awareness program",
      "Plantation activity inside the school",
    ],
  },
  {
    place: "Audens School",
    activities: ["Environmental awareness program"],
  },
  {
    place: "IKV School",
    activities: ["Seed ball activity"],
  },
  {
    place: "BNM School",
    activities: [
      "Awareness program",
      "Seed collection activity",
      "Seed segregation of collected seeds",
    ],
  },
  {
    place: "SJV School (RR Nagar)",
    activities: [
      "Awareness program",
      "Announcement of seed collection drive",
      "Seed collection activity",
    ],
  },
  {
    place: "Doddanna Vidya Samsthe",
    activities: ["Awareness program"],
  },
  {
    place: "Shanthinikethan School",
    activities: ["“Growing Ganesha” event"],
  },
  {
    place: "Aksharam",
    activities: ["Awareness program"],
  },
];

const Journey = () => {
  return (
    <section id="journey" className="section-padding bg-sand">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">Our Story</p>
          <h2 className="section-title">The Journey So Far</h2>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground">Growing change, one school and one small action at a time.</p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-0 left-[13px] top-0 w-0.5 bg-primary/35 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
          {milestones.map((m, i) => {
            const cardPlacement = i % 2 === 0
              ? "col-start-2 md:col-start-3"
              : "col-start-2 md:col-start-1";

            return (
              <motion.div
                key={m.place}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="mb-6 last:mb-0 grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] md:gap-x-6"
              >
                <span className="z-10 col-start-1 row-start-1 mt-2 h-5 w-5 justify-self-center rounded-full border-4 border-background bg-primary md:col-start-2" aria-hidden="true" />
                <article className={`${cardPlacement} row-start-1 rounded-xl border border-border bg-background p-6 shadow-sm`}>
                  <h3 className="mb-3 font-display text-xl font-semibold leading-snug text-foreground">{m.place}</h3>
                  <ul className="space-y-2">
                    {m.activities.map((a) => (
                      <li key={a} className="flex gap-3 border-b border-border/60 pb-2 text-base md:text-lg font-medium leading-7 text-muted-foreground last:border-0 last:pb-0">
                        <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
                        <span className="journey-activity-copy min-w-0">{a}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-lg md:text-xl text-muted-foreground">The journey is still going. Walk the next stretch with us.</p>
      </div>
    </section>
  );
};

export default Journey;

import { m as motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionCta from "@/components/SectionCta";

const faqs = [
  {
    q: "Why should I volunteer with Naavu Kavacha?",
    a: "Volunteering with Naavu Kavacha gives you an opportunity to create real environmental impact while working alongside passionate students and changemakers. Every activity is designed to contribute directly to sustainability and community welfare.",
  },
  {
    q: "What kind of volunteer roles are available?",
    a: "Volunteers can contribute in different ways including event coordination, tree plantation drives, cleanup campaigns, school awareness sessions, social media and content creation, photography and documentation, community outreach, and logistics and on-ground support. The roles are flexible based on your interests and skills.",
  },
  {
    q: "Can students join as volunteers?",
    a: "Yes. Naavu Kavacha actively encourages student participation. School students, college students, and young individuals interested in social and environmental work are welcome to join.",
  },
  {
    q: "Do volunteers need to attend every event?",
    a: "No. Volunteers can participate based on their availability. You may join specific events, campaigns, or long-term initiatives depending on your schedule.",
  },
  {
    q: "What will I gain from volunteering?",
    a: "Apart from contributing to society, volunteers gain leadership experience, teamwork and communication skills, event management exposure, community engagement experience, networking opportunities, and real-world social impact experience.",
  },
  {
    q: "Is volunteering only about plantation drives?",
    a: "No. While environmental activities are a major focus, Naavu Kavacha also works on awareness campaigns, cleanliness drives, water body rejuvenation, sustainability education, and community initiatives.",
  },
  {
    q: "How are volunteers informed about upcoming activities?",
    a: "Updates regarding events, volunteer opportunities, meeting points, and activity schedules are shared through Instagram, WhatsApp groups, and official communication channels.",
  },
  {
    q: "What makes Naavu Kavacha different from other volunteer communities?",
    a: "Naavu Kavacha focuses strongly on practical fieldwork and community-driven impact. The goal is not only awareness but also direct action that creates measurable environmental and social change.",
  },
];

/** `showCta` is turned off on the Volunteer page, where the closing "Join Us" button would link to itself. */
const FAQ = ({ showCta = true }: { showCta?: boolean }) => {
  return (
    <section id="faq" className="section-padding bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
            FAQ
          </p>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle mx-auto mt-4">
            Got questions? We've answered the ones we hear the most.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-xl bg-card px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="faq-question font-display font-semibold text-left text-foreground hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="faq-answer border-t border-border/80 pt-4 pb-6 text-base leading-7 text-foreground/85">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {showCta && <SectionCta message="Ready to get involved?" />}
      </div>
    </section>
  );
};

export default FAQ;

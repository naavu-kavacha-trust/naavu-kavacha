import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flower2, Recycle, Megaphone, TreePine, Cpu } from "lucide-react";
import SectionCta from "@/components/SectionCta";

const plans = [
  { icon: Flower2, title: "Seed Paper Ganesha Initiative" },
  { icon: Recycle, title: "Paper Recycling Programs" },
  { icon: Megaphone, title: "Environmental Awareness Campaigns" },
  { icon: TreePine, title: "Large Plantation Drives" },
  { icon: Cpu, title: "E-waste Awareness Models" },
];

const FuturePlans = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="future" className="section-padding bg-card">
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">Looking Ahead</p>
          <h2 className="section-title">Future Plans</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-4 bg-background rounded-xl p-5 border border-border hover:border-primary/30 transition-colors"
            >
              <plan.icon className="w-6 h-6 text-primary flex-shrink-0" strokeWidth={1.5} />
              <p className="future-plan-label font-medium text-foreground text-sm">{plan.title}</p>
            </motion.div>
          ))}
        </div>

        <SectionCta message="Help us turn these plans into the next chapter." />
      </div>
    </section>
  );
};

export default FuturePlans;

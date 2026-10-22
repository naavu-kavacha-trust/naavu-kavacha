import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import waterman384 from "@/assets/optimized/waterman-384.webp";
import waterman768 from "@/assets/optimized/waterman-768.webp";
import OathSlider from "@/components/OathSlider";
import SmartImage from "@/components/ui/SmartImage";
import { oathCopy, oathImages } from "@/data/oath";
import { SECTION_IDS } from "@/data/siteConfig";

/** Special Moments: the Waterman of India story, then the Oath for Change milestone. */
const SpecialStory = () => {
  const storyRef = useRef(null);
  const oathRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
  const oathInView = useInView(oathRef, { once: true, margin: "-100px" });

  return (
    <section id={SECTION_IDS.specialMoments} className="section-padding bg-primary/5">
      <div ref={storyRef} className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={storyInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">A Special Moment</p>
          <h2 className="section-title mb-8">Meeting the Waterman of India</h2>
          <div className="max-w-md mx-auto mb-8 rounded-2xl overflow-hidden border border-border shadow-sm">
            <SmartImage
              src={waterman384}
              srcSet={`${waterman384} 384w, ${waterman768} 768w`}
              sizes="(max-width: 511px) calc(100vw - 3rem), 448px"
              alt="Naavu Kavacha team with Dr. Rajendra Singh, the Waterman of India"
              width={853}
              height={916}
              className="h-auto"
              wrapperClassName="h-auto"
            />
          </div>
          <p className="section-subtitle mx-auto text-center">
            Meeting Dr. Rajendra Singh, known as the Waterman of India, inspired the Naavu Kavacha
            team and strengthened their commitment toward environmental conservation and
            community action.
          </p>
        </motion.div>
      </div>

      <hr className="mx-auto my-12 w-24 border-0 border-t-2 border-primary/20 md:my-16" aria-hidden="true" />

      <div ref={oathRef} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={oathInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
              {oathCopy.eyebrow}
            </p>
            <h3 className="section-title mb-6">{oathCopy.heading}</h3>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              {oathCopy.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          <OathSlider images={oathImages} />
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialStory;

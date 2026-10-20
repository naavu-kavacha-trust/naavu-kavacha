import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatStat, type Stat } from "@/data/impact";

interface CountUpProps {
  stat: Stat;
  className?: string;
}

/**
 * Shows a stat's number, counting up from 0 the first time it scrolls into view.
 * Screen readers and reduced-motion users get the final number straight away, and
 * so does anyone whose browser cannot observe scrolling.
 */
const CountUp = ({ stat, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();
  const canObserve = typeof IntersectionObserver !== "undefined";
  const animates = canObserve && !reduceMotion;

  const [current, setCurrent] = useState(animates ? 0 : stat.value);

  useEffect(() => {
    if (!animates) {
      setCurrent(stat.value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setCurrent(v),
      onComplete: () => setCurrent(stat.value),
    });
    return () => controls.stop();
  }, [animates, inView, stat.value]);

  return (
    <span className={className}>
      {/* The real value for assistive tech, so it never hears the counting. */}
      <span className="sr-only">{formatStat(stat)}</span>
      <span ref={ref} aria-hidden="true">
        {formatStat(stat, current)}
      </span>
    </span>
  );
};

export default CountUp;

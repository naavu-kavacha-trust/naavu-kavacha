import { domMax } from "framer-motion";

/**
 * The animation features the page uses (animate, exit, layout, drag, in-view).
 * Loaded on demand by <LazyMotion> in pages/Index.tsx so the animation engine
 * stays out of the first bundle. Components import `m as motion` from framer-motion.
 */
export default domMax;

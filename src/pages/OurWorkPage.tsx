import PageHero from "@/components/PageHero";
import Projects from "@/components/Projects";
import WhatWeDo from "@/components/WhatWeDo";
import { PAGE_HEROES, PAGE_META } from "@/data/siteConfig";
import { usePageMeta } from "@/hooks/use-page-meta";

// Projects & Activities already ends with its own "Join Us" button, so no second one is added here.
const OurWorkPage = () => {
  usePageMeta(PAGE_META.ourWork);

  return (
    <>
      <PageHero {...PAGE_HEROES.ourWork} />
      <WhatWeDo />
      <Projects />
    </>
  );
};

export default OurWorkPage;

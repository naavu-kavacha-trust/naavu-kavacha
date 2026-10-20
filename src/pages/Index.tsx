import Hero from "@/components/Hero";
import AboutTeaser from "@/components/AboutTeaser";
import WhatWeDoPreview from "@/components/WhatWeDoPreview";
import Impact from "@/components/Impact";
import GalleryPreview from "@/components/GalleryPreview";
import VolunteerBand from "@/components/VolunteerBand";
import { PAGE_META } from "@/data/siteConfig";
import { usePageMeta } from "@/hooks/use-page-meta";

// The home page answers: who are they, what do they do, does it matter, how do I help. Everything else
// lives on its own page: About (story, journey, future), Our Work (projects), Gallery, Volunteer (form, FAQ).
// The shared shell (navbar, footer, providers) lives in PageLayout and AppProviders.
const Index = () => {
  usePageMeta(PAGE_META.home);

  return (
    <>
      <Hero />
      <AboutTeaser />
      <WhatWeDoPreview />
      <Impact />
      <GalleryPreview />
      <VolunteerBand />
    </>
  );
};

export default Index;

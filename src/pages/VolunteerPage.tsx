import FAQ from "@/components/FAQ";
import JoinUs from "@/components/JoinUs";
import PageHero from "@/components/PageHero";
import { PAGE_HEROES, PAGE_META } from "@/data/siteConfig";
import { usePageMeta } from "@/hooks/use-page-meta";

// Every FAQ question is about volunteering, so the FAQ lives here. No closing "Join Us" button: this is the page it points to.
const VolunteerPage = () => {
  usePageMeta(PAGE_META.volunteer);

  return (
    <>
      <PageHero {...PAGE_HEROES.volunteer} />
      <JoinUs />
      <FAQ showCta={false} />
    </>
  );
};

export default VolunteerPage;

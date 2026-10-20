import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import SpecialStory from "@/components/SpecialStory";
import { PAGE_HEROES, PAGE_META } from "@/data/siteConfig";
import { usePageMeta } from "@/hooks/use-page-meta";

// The Gallery section contains the photos only; no extra call to action is added here.
const GalleryPage = () => {
  usePageMeta(PAGE_META.gallery);

  return (
    <>
      <PageHero {...PAGE_HEROES.gallery} />
      <SpecialStory />
      <Gallery />
    </>
  );
};

export default GalleryPage;

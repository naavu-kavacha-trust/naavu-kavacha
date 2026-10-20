import LegalDocumentView from "@/components/LegalDocumentView";
import { LEGAL_PAGE_HEROES, LEGAL_PAGE_META, privacyPolicy } from "@/data/legal";
import { usePageMeta } from "@/hooks/use-page-meta";

const PrivacyPage = () => {
  usePageMeta(LEGAL_PAGE_META.privacy);
  return <LegalDocumentView hero={LEGAL_PAGE_HEROES.privacy} content={privacyPolicy} />;
};

export default PrivacyPage;

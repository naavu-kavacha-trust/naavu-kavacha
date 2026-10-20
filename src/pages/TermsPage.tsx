import LegalDocumentView from "@/components/LegalDocumentView";
import { LEGAL_PAGE_HEROES, LEGAL_PAGE_META, termsOfService } from "@/data/legal";
import { usePageMeta } from "@/hooks/use-page-meta";

const TermsPage = () => {
  usePageMeta(LEGAL_PAGE_META.terms);
  return <LegalDocumentView hero={LEGAL_PAGE_HEROES.terms} content={termsOfService} />;
};

export default TermsPage;

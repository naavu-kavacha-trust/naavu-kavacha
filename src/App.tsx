import { Suspense, lazy } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppProviders from "@/components/AppProviders";
import LegacyHashRedirect from "@/components/LegacyHashRedirect";
import PageLayout from "@/components/PageLayout";
import { LEGAL_ROUTES, ROUTES } from "@/data/siteConfig";
import { pageLoaders } from "@/lib/route-chunks";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { localizedPath, type Locale } from "@/i18n/types";

// Secondary pages load on demand; their loaders live in lib/route-chunks.ts so links can prefetch them.
const AboutPage = lazy(pageLoaders[ROUTES.about]);
const OurWorkPage = lazy(pageLoaders[ROUTES.ourWork]);
const GalleryPage = lazy(pageLoaders[ROUTES.gallery]);
const VolunteerPage = lazy(pageLoaders[ROUTES.volunteer]);
const PrivacyPage = lazy(pageLoaders[LEGAL_ROUTES.privacy]);
const TermsPage = lazy(pageLoaders[LEGAL_ROUTES.terms]);

/** Shown inside the page shell while a page's code loads, so the navbar and footer never disappear. */
const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none" />
    <span className="sr-only">Loading page</span>
  </div>
);

const RootLayout = () => (
  <PageLayout>
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  </PageLayout>
);

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <AppProviders>
        <LegacyHashRedirect />
        <Routes>
          <Route element={<RootLayout />}>
            {(["en", "kn", "hi"] as Locale[]).flatMap((locale) => {
              const localized = locale !== "en";
              const path = (route: string) => localized ? localizedPath(locale, route) : route;
              return [
                <Route key={`${locale}-home`} path={path(ROUTES.home)} element={<Index />} />,
                <Route key={`${locale}-about`} path={path(ROUTES.about)} element={<AboutPage />} />,
                <Route key={`${locale}-work`} path={path(ROUTES.ourWork)} element={<OurWorkPage />} />,
                <Route key={`${locale}-gallery`} path={path(ROUTES.gallery)} element={<GalleryPage />} />,
                <Route key={`${locale}-volunteer`} path={path(ROUTES.volunteer)} element={<VolunteerPage />} />,
                <Route key={`${locale}-privacy`} path={path(LEGAL_ROUTES.privacy)} element={<PrivacyPage />} />,
                <Route key={`${locale}-terms`} path={path(LEGAL_ROUTES.terms)} element={<TermsPage />} />,
              ];
            })}
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  </>
);

export default App;

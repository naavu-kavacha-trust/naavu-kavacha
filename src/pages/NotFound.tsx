import { Link } from "react-router-dom";
import { ROUTES } from "@/data/siteConfig";
import { usePageMeta } from "@/hooks/use-page-meta";

/**
 * Shown for any address the site does not have. It is a full page of its own (no navbar), so it carries its
 * own `<main>` landmark and the page's single `h1`.
 */
const NotFound = () => {
  usePageMeta({ title: "Page not found | NAAVU KAVACHA", description: "This page does not exist. Return to the Naavu Kavacha home page." });

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="text-center">
        <h1 className="mb-4 font-display text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to={ROUTES.home} className="inline-flex min-h-11 items-center text-primary underline hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          Return to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;

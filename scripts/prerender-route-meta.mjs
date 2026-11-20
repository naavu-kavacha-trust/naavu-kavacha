import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = readFileSync(resolve(root, "src/data/siteConfig.ts"), "utf8");
const legal = readFileSync(resolve(root, "src/data/legal.ts"), "utf8");
const template = readFileSync(resolve(root, "dist/index.html"), "utf8");
const metadata = JSON.parse(readFileSync(resolve(root, "scripts/localized-meta.json"), "utf8"));

function requireMatch(pattern, description, source = config) {
  const match = pattern.exec(source);
  if (!match) throw new Error(`Could not read ${description}`);
  return match[1];
}

function replaceOnce(source, pattern, replacement, description) {
  const matches = source.match(pattern);
  if (!matches || matches.length !== 1) throw new Error(`Expected exactly one ${description} in dist/index.html`);
  return source.replace(pattern, replacement);
}

function routeMetaPage(route, pageKey, locale) {
  const localeMeta = metadata[locale][pageKey];
  const baseRoute = route.replace(/^\/(?:kn|hi)(?=\/|$)/, "") || "/";
  const canonical = `${siteUrl}${route}`;
  let html = template;
  html = html.replace('<html lang="en">', `<html lang="${locale}">`);
  html = replaceOnce(html, /<title>[^<]*<\/title>/g, `<title>${localeMeta.title}</title>`, "title");
  html = replaceOnce(html, /<meta name="description" content="[^"]*"\s*\/>/g, `<meta name="description" content="${localeMeta.description}" />`, "description");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*"\s*\/>/g, `<link rel="canonical" href="${canonical}" />`, "canonical");
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*"\s*\/>/g, `<meta property="og:title" content="${localeMeta.title}" />`, "Open Graph title");
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*"\s*\/>/g, `<meta property="og:description" content="${localeMeta.description}" />`, "Open Graph description");
  if (localeMeta.imageAlt) html = replaceOnce(html, /<meta property="og:image:alt" content="[^"]*"\s*\/>/g, `<meta property="og:image:alt" content="${localeMeta.imageAlt}" />`, "Open Graph image description");
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*"\s*\/>/g, `<meta property="og:url" content="${canonical}" />`, "Open Graph URL");
  html = html.replace(/(<script type="application\/ld\+json">\s*)([\s\S]*?)(\s*<\/script>)/g, (whole, before, body, after) => {
    const structured = JSON.parse(body);
    if (structured["@type"] === "NGO") structured.description = localeMeta.description;
    return `${before}${JSON.stringify(structured, null, 2)}${after}`;
  });
  const alternateRoutes = ["en", "kn", "hi"].map((language) => {
    const alternatePath = language === "en" ? baseRoute : `/${language}${baseRoute === "/" ? "" : baseRoute}`;
    const tag = language === "kn" ? "kn" : language === "hi" ? "hi" : "en";
    return `<link rel="alternate" hreflang="${tag}" href="${siteUrl}${alternatePath}" />`;
  });
  alternateRoutes.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl}${baseRoute}" />`);
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]*"\s*\/>/g, "");
  html = html.replace(`    <link rel="canonical" href="${canonical}" />`, `    <link rel="canonical" href="${canonical}" />\n    ${alternateRoutes.join("\n    ")}`);
  return html;
}

const siteUrl = requireMatch(/export const SITE_URL = "([^"]+)";/, "SITE_URL");
const routeBlock = requireMatch(/export const ROUTES = \{([\s\S]*?)\} as const/, "ROUTES");
const legalBlock = requireMatch(/export const LEGAL_ROUTES = \{([\s\S]*?)\} as const/, "LEGAL_ROUTES");
const routes = Object.fromEntries([...routeBlock.matchAll(/(home|about|ourWork|gallery|volunteer):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
const legalRoutes = Object.fromEntries([...legalBlock.matchAll(/(privacy|terms):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
if (!routes.home || !routes.about || !legalRoutes.privacy) throw new Error("Could not read configured page routes");
// Verify the legal entries still exist; legal pages get direct-load localized HTML but remain out of the sitemap.
if (!/export const LEGAL_PAGE_META/.test(legal)) throw new Error("Could not verify legal page metadata");
const pages = { ...routes, ...legalRoutes };
for (const locale of ["en", "kn", "hi"]) {
  for (const [pageKey, baseRoute] of Object.entries(pages)) {
    const route = locale === "en" ? baseRoute : `/${locale}${baseRoute === "/" ? "" : baseRoute}`;
    const outputPath = resolve(root, "dist", route === "/" ? "index.html" : `${route.slice(1)}/index.html`);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, routeMetaPage(route, pageKey, locale));
    console.log(`prerender: wrote ${locale} metadata for ${route}`);
  }
}

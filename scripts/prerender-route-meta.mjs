import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = readFileSync(resolve(root, "src/data/siteConfig.ts"), "utf8");
const htmlPath = resolve(root, "dist/index.html");
const html = readFileSync(htmlPath, "utf8");

function requireMatch(pattern, description) {
  const match = pattern.exec(config);
  if (!match) throw new Error(`Could not read ${description} from src/data/siteConfig.ts`);
  return match[1];
}

function replaceOnce(source, pattern, replacement, description) {
  const matches = source.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`Expected exactly one ${description} in dist/index.html`);
  }
  return source.replace(pattern, replacement);
}

function renderRoutePage(route, metadata, siteUrl) {
  const canonical = `${siteUrl}${route}`;
  let page = html;
  page = replaceOnce(page, /<title>[^<]*<\/title>/g, `<title>${metadata.title}</title>`, "page title");
  page = replaceOnce(
    page,
    /<meta name="description" content="[^"]*"\s*\/>/g,
    `<meta name="description" content="${metadata.description}" />`,
    "description",
  );
  page = replaceOnce(
    page,
    /<link rel="canonical" href="[^"]*"\s*\/>/g,
    `<link rel="canonical" href="${canonical}" />`,
    "canonical URL",
  );
  page = replaceOnce(
    page,
    /<meta property="og:title" content="[^"]*"\s*\/>/g,
    `<meta property="og:title" content="${metadata.title}" />`,
    "Open Graph title",
  );
  page = replaceOnce(
    page,
    /<meta property="og:description" content="[^"]*"\s*\/>/g,
    `<meta property="og:description" content="${metadata.description}" />`,
    "Open Graph description",
  );
  page = replaceOnce(
    page,
    /<meta property="og:url" content="[^"]*"\s*\/>/g,
    `<meta property="og:url" content="${canonical}" />`,
    "Open Graph URL",
  );
  return page;
}

const siteUrl = requireMatch(/export const SITE_URL = "([^"]+)";/, "SITE_URL");
const routeConfig = /export const ROUTES = \{([\s\S]*?)\} as const/.exec(config)?.[1];
if (!routeConfig) throw new Error("Could not read routes from src/data/siteConfig.ts");

const staticRouteKeys = ["about", "ourWork", "gallery", "volunteer"];
for (const key of staticRouteKeys) {
  const route = new RegExp(`\\b${key}:\\s*"([^"]+)"`).exec(routeConfig)?.[1];
  const meta = new RegExp(`${key}:\\s*\\{\\s*title:\\s*"([^"]+)"\\s*,\\s*description:\\s*"([^"]+)"`, "s").exec(config);
  if (!route) throw new Error(`Could not read route "${key}" from src/data/siteConfig.ts`);
  if (!meta) throw new Error(`Could not read metadata for "${key}" from src/data/siteConfig.ts`);

  const outputPath = resolve(root, "dist", route.slice(1), "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, renderRoutePage(route, { title: meta[1], description: meta[2] }, siteUrl));
  console.log(`prerender: wrote route metadata for ${route}`);
}

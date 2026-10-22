# Naavu Kavacha

Website for Naavu Kavacha, a student-led environmental initiative. The main pages are Home, About Us, Our Work, Gallery, and Volunteer; Privacy Policy and Terms of Service are linked from the footer.

## Copyright and license

The original code, site text, photographs, logo, and branding in this repository are owned by **Naavu Kavacha Trust** and are all rights reserved, subject to the limited permissions stated in the Terms of Service. Other reuse requires prior written permission. Third-party dependencies retain their own licenses. See [LICENSE](LICENSE).

## Built with

- React 18, TypeScript, and Vite
- Tailwind CSS and shadcn/ui components
- React Router for page navigation

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
npm ci
npm run dev
```

Vite prints the local development URL in the terminal. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Generate the production site in `dist/`; also updates the sitemap when `SITE_URL` is configured. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run unit and component tests. |
| `npm run test:e2e` | Run Playwright browser tests (install a browser first with `npx playwright install chromium`). |
| `npm run sitemap` | Generate the sitemap when `SITE_URL` is set. |

## Configuration

Copy `.env.example` to `.env` for local configuration. The only client environment variable currently used is:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_VOLUNTEER_ENDPOINT` | No | URL that accepts volunteer form submissions as JSON. If it is empty, the form offers an email fallback. |

Vite embeds `VITE_` variables in the browser bundle. Do not put passwords, private API keys, or other secrets in them. If you use a Google Apps Script web app or another form endpoint, configure the URL in Vercel under **Project Settings → Environment Variables**, then redeploy.

After choosing the production domain, set `SITE_URL` in `src/data/siteConfig.ts` to the full site URL without a trailing slash. This enables sitemap generation and is also used when preparing the site's absolute social preview image URL in `index.html`. This value is source configuration, not a Vercel environment variable.

## Project structure

| Location | Contents |
| --- | --- |
| `src/pages/` | The five pages and the not-found page. |
| `src/components/` | Shared page sections, navigation, dialogs, forms, and gallery UI. |
| `src/data/` | Site settings, activities, team members, impact figures, gallery details, and form interests. |
| `src/data/legal.ts` | Privacy Policy and Terms of Service wording. |
| `src/assets/gallery/` | Gallery photos. New photos are discovered automatically and sorted by filename. |
| `src/assets/activities/` | Activity photos, named with the activity ID and a number (for example, `growing-ganesha-1.jpg`). |
| `src/assets/oath/` | Oath for Change photos. |
| `public/` | Static files served from the site root, including icons and crawler instructions. |
| `e2e/` and `src/test/` | Browser tests and unit/component tests. |

To update page text or team details, edit the matching file in `src/data/`. For gallery photos, add image files to `src/assets/gallery/`; add captions, alt text, or categories in `src/data/gallery.ts` when needed.


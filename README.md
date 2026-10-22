<p align="center">
  <img src="src/assets/logo.png" alt="Naavu Kavacha logo" width="144" />
</p>

<h1 align="center">Naavu Kavacha</h1>

<p align="center">
  A student-driven environmental initiative working toward a greener future through awareness and community action.
</p>

<p align="center">
  <a href="https://naavu-kavacha.vercel.app"><strong>Visit the website</strong></a>
  &nbsp;·&nbsp;
  <a href="https://www.instagram.com/naavu_kavacha">Instagram</a>
  &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/company/naavukavacha-trust">LinkedIn</a>
</p>

## About

Naavu Kavacha brings students and communities together to care for the environment. The website shares the initiative’s work, stories, and ways to get involved.

Its activities include environmental awareness, seed collection, plantation drives, clean-ups, and community action.

## Website

Explore the initiative through these pages:

- **Home** — introduction, impact, featured work, and a photo preview.
- **About Us** — the organization’s story, mission, team, and journey.
- **Our Work** — activities and environmental programs.
- **Gallery** — photos and moments from the field.
- **Volunteer** — ways to participate and collaborate.

The site is built with React, TypeScript, Vite, Tailwind CSS, and React Router. It includes responsive layouts, optimized images, and page metadata for search and social sharing.

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/naavu-kavacha-trust/naavu-kavacha.git
cd naavu-kavacha
npm ci
npm run dev
```

To build and preview the production site:

```bash
npm run build
npm run preview
```

## Configuration

Copy `.env.example` to `.env` to configure local settings. `VITE_VOLUNTEER_ENDPOINT` is optional; it accepts volunteer form submissions as JSON. If unset, the form provides an email fallback.

Set the production site URL in `src/data/siteConfig.ts`. The build uses it to generate the sitemap and update crawler instructions. For deployments, configure `VITE_VOLUNTEER_ENDPOINT` in the hosting provider’s environment settings when using a form endpoint. Vite exposes `VITE_` variables in the browser bundle, so do not store secrets in them.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the site and generate sitemap metadata. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run unit and component tests. |
| `npm run test:e2e` | Run Playwright browser tests. Install Chromium first with `npx playwright install chromium`. |
| `npm run sitemap` | Generate the sitemap using the configured site URL. |

## Project structure

| Location | Contents |
| --- | --- |
| `src/pages/` | Route pages. |
| `src/components/` | Shared sections, navigation, dialogs, forms, and gallery UI. |
| `src/data/` | Site configuration, activities, team, impact, and gallery content. |
| `src/assets/` | Source photos, logo, and optimized image variants. |
| `public/` | Static files served from the site root, including icons, sitemap, and crawler instructions. |
| `src/test/` and `e2e/` | Unit/component tests and browser tests. |

## Copyright and license

Copyright © 2026 Naavu Kavacha Trust. All rights reserved.

The original source code, text, photographs, logo, and other materials in this repository are owned by Naavu Kavacha Trust. Except for the limited permissions expressly stated in the site's Terms of Service, no permission is granted to copy, modify, distribute, publish, or create derivative works from these materials without prior written permission. Third-party software and materials remain subject to their own licenses and terms. See [LICENSE](LICENSE).

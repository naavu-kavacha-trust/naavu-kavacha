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

To update page text or team details, edit the matching file in `src/data/`. For gallery photos, add image files to `src/assets/gallery/`; add captions, alt text, or categories in `src/data/gallery.ts` when needed. See [MISSING_ASSETS.md](MISSING_ASSETS.md) for outstanding asset needs and [CHANGES.md](CHANGES.md) for the project history.

## Publish this project to GitHub

Create a **new empty repository** on GitHub. Do not initialize it with a README, license, or `.gitignore`, because those files already exist in this project, including this repository's All Rights Reserved notice. In a terminal, from the project root, run:

```bash
git init -b main
git add .
git status
git commit -m "Prepare Naavu Kavacha website"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with the one shown by GitHub. Review `git status` before committing and make sure no `.env` files or other private credentials are staged. `.env.example` is safe to commit; local `.env` files are ignored.

## Deploy to Vercel

1. Push the project to GitHub using the steps above.
2. Sign in to [Vercel](https://vercel.com/), choose **Add New → Project**, and import the GitHub repository. Authorize Vercel to access it if prompted.
3. Set the project root to the repository root. Vercel should detect Vite; confirm these settings if they are not filled automatically:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: leave Vercel's detected npm command in place.
4. If the volunteer form should post to an endpoint, add `VITE_VOLUNTEER_ENDPOINT` in the project's environment settings. Choose the environments where it should apply, then redeploy. Leave it unset to use the email fallback.
5. Select **Deploy**. After deployment, open the site and check `/`, `/about`, `/our-work`, `/gallery`, and `/volunteer`, including direct refreshes on those routes. The included `vercel.json` rewrite sends app routes to `index.html`.
6. Once you know the production URL, update `SITE_URL` in `src/data/siteConfig.ts` (and the absolute social preview URL in `index.html` if needed), commit, and push. Vercel will build and deploy the new commit automatically.

After connecting the repository, pushes and pull requests can trigger Vercel deployments. The production branch is typically `main`; preview deployments let you review changes before merging.

## Deployment references

- [Vercel: Deploying Git repositories](https://vercel.com/docs/git)
- [Vercel: Vite](https://vercel.com/docs/frameworks/frontend/vite)
- [GitHub Docs: Add locally hosted code to GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

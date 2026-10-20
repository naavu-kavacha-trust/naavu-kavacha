import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests (npm run test:e2e). They run against the production build:
 * the config builds the site and serves it with `vite preview` on port 4173.
 *
 * First time on a new machine: npx playwright install chromium
 * If a Chromium is already installed elsewhere, point PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH at it.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

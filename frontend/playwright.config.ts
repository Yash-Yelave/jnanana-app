import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the dev server if one is already up, otherwise starts one.
 *
 * The suite is deliberately small: it covers the things that repeatedly broke
 * without anyone noticing — horizontal overflow at narrow widths, and the mobile
 * nav drawer, which looked fine in the markup while being unusable in a browser.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

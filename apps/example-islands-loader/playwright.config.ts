import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the islands loader E2E suite.
 *
 * Requires three dev servers to be running:
 * - Island 1 on 5201 (serves source + built UMD from dist/)
 * - Island 2 on 5202 (serves source + built UMD from dist/)
 * - Loader HTML on 5200
 *
 * The loader fetches the island bundles at runtime, so all three must be up
 * before the test page loads. Turbo builds the islands first (dev depends on
 * build), then the dev servers start and serve the UMD bundles via middleware.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      // Dev server that serves both source files and built UMD from dist/
      // Turbo ensures build runs first (dev depends on ^build)
      command: "pnpm --filter example-islands-react1 dev",
      url: "http://localhost:5201",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter example-islands-react2 dev",
      url: "http://localhost:5202",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter example-islands-loader dev",
      url: "http://localhost:5200",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});

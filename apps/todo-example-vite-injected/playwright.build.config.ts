import { defineConfig } from "@playwright/test";
import defaultConfig from "./playwright.config";

/**
 * Configuration for testing the production build
 */
export default defineConfig({
  ...defaultConfig,
  /* Run the preview server (serving dist) instead of dev server */
  webServer: {
    command: "pnpm preview",
    url: "http://localhost:5182", // Vite preview default port
    reuseExistingServer: false,
  },
  use: {
    ...defaultConfig.use,
    baseURL: "http://localhost:5182",
  },
});

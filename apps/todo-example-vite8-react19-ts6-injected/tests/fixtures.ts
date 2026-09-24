import { test as base } from "@playwright/test";

/** Playwright fixtures for collecting browser console output. */
export const test = base.extend<{ pageLogs: string[] }>({
  pageLogs: async ({ context }, provide): Promise<void> => {
    void context;
    const logs: string[] = [];
    await provide(logs);
  },
  page: async ({ page, pageLogs }, provide): Promise<void> => {
    page.on("console", (message) => {
      pageLogs.push(message.text());
    });
    page.on("pageerror", (error) => {
      pageLogs.push(`PAGE ERROR: ${error.message}`);
    });
    await provide(page);
  },
});

export { expect } from "@playwright/test";

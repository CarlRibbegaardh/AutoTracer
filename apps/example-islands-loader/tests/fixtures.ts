import { test as base } from "@playwright/test";

/**
 * Extended test fixture that captures browser console messages during the test.
 *
 * `consoleLogs` is populated as messages arrive — access it after the action
 * that triggers output.
 */
export const test = base.extend<{ consoleLogs: string[] }>({
  consoleLogs: async ({ page }, use) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });
    await use(logs);
  },
});

export { expect } from "@playwright/test";

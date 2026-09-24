import { test, expect } from "./fixtures";

/**
 * Islands multi-instance ReactTracer E2E tests.
 *
 * Test 1 (boot) — confirms that both islands mount and render content.
 * This is the baseline: if it fails, the loading infrastructure is broken.
 *
 * Tests 2–3 (start/stop) — confirm that the dashboard controls affect ALL
 * islands, not just the last one that called reactTracer().
 * These are expected to FAIL until the shared hook coordinator (Option C)
 * is implemented.
 */

test.describe("islands boot", () => {
  test("both island UMD bundles load with HTTP 200", async ({ page }) => {
    // Intercept the two UMD requests and record their status codes.
    // A 404 here means the islands were not built (run pnpm build:islands)
    // or the preview server is not serving dist/ (use pnpm preview:islands,
    // not pnpm dev:islands — the dev server does not expose dist/).
    const umdStatuses: Record<string, number> = {};
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("island.umd.js")) {
        umdStatuses[url] = response.status();
      }
    });

    await page.addInitScript(() => {
      localStorage.removeItem("autotracer-react-enabled-on-load");
    });
    await page.goto("/");

    // Give the scripts time to be fetched
    await page.waitForLoadState("networkidle");

    expect(
      umdStatuses["http://localhost:5201/island.umd.js"],
      "Island 1 UMD returned non-200 — did you build the islands first?",
    ).toBe(200);
    expect(
      umdStatuses["http://localhost:5202/island.umd.js"],
      "Island 2 UMD returned non-200 — did you build the islands first?",
    ).toBe(200);
  });

  test("both islands mount and render their content", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("autotracer-react-enabled-on-load");
    });
    await page.goto("/");

    // Island 1 must replace the loading placeholder with actual Counter content
    await expect(page.locator("#island-1")).not.toContainText(
      "Loading island 1...",
      { timeout: 10_000 },
    );
    await expect(page.locator("#island-1")).toContainText("Counter");

    // Island 2 must replace the loading placeholder with actual Timer content
    await expect(page.locator("#island-2")).not.toContainText(
      "Loading island 2...",
      { timeout: 10_000 },
    );
    await expect(page.locator("#island-2")).toContainText("Timer");
  });

  test("shared dashboard uses version-neutral ReactTracer labels", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("autotracer-react-enabled-on-load");
    });
    await page.goto("/");
    await expect(page.locator("#island-1")).toContainText("Counter", {
      timeout: 10_000,
    });

    await page.keyboard.press("Alt+Shift+D");
    await page.locator(".dashboard-collapsed").click();

    await expect(page.locator(".dashboard-tab.active")).toHaveText("React");
    await expect(page.locator(".dashboard-tracer-name")).toHaveText(
      "ReactTracer",
    );
  });
});

test.describe("islands multi-instance tracing", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("autotracer-react-enabled-on-load");
    });
    await page.goto("/");
    await expect(page.locator("#island-1")).toContainText("Counter", {
      timeout: 10_000,
    });
    await expect(page.locator("#island-2")).toContainText("Timer", {
      timeout: 10_000,
    });
  });

  test("start produces trace output from both islands", async ({
    page,
    consoleLogs,
  }) => {
    await page.evaluate(() => {
      globalThis.autoTracer.reactTracer.start();
    });

    await page.locator("#island-1 button", { hasText: "+" }).click();

    await page
      .locator("#island-2 button", { hasText: "Start" })
      .first()
      .click();
    await page.waitForTimeout(1100);

    const island1Output = consoleLogs.some((line) => line.includes("Island1"));
    const island2Output = consoleLogs.some((line) => line.includes("Island2"));

    expect(island1Output, "Island 1 produced no trace output after Start").toBe(
      true,
    );
    expect(island2Output, "Island 2 produced no trace output after Start").toBe(
      true,
    );
  });

  test("stop halts trace output from both islands", async ({
    page,
    consoleLogs,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("autotracer-react-enabled-on-load", "true");
    });
    await page.reload();
    await expect(page.locator("#island-1")).toContainText("Counter", {
      timeout: 10_000,
    });
    await expect(page.locator("#island-2")).toContainText("Timer", {
      timeout: 10_000,
    });

    await page.evaluate(() => {
      globalThis.autoTracer.reactTracer.stop();
    });

    // Reset captured logs — only check output produced AFTER stop
    consoleLogs.length = 0;

    await page.locator("#island-1 button", { hasText: "+" }).click();
    await page
      .locator("#island-2 button", { hasText: "Start" })
      .first()
      .click();
    await page.waitForTimeout(1100);

    const anyOutputAfterStop = consoleLogs.some(
      (line) => line.includes("Island1") || line.includes("Island2"),
    );

    expect(
      anyOutputAfterStop,
      "Trace output continued after Stop was called",
    ).toBe(false);
  });
});

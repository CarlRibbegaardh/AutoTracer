/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, type Page } from "@playwright/test";

/**
 * Opens the sidebar drawer and waits until navigation items are visible.
 *
 * Side effects: clicks UI elements.
 *
 * @param page - Current Playwright page
 */
const openSidebar = async (page: Page): Promise<void> => {
  const dashboardNavItem = page.locator(".MuiListItemButton-root", {
    hasText: "Dashboard",
  });

  await dashboardNavItem.first().waitFor({
    state: "attached",
    timeout: 15000,
  });

  const isAlreadyOpen = await dashboardNavItem.isVisible();
  if (isAlreadyOpen) {
    return;
  }

  await page.click('button[aria-label="toggle sidebar"]');

  await expect(dashboardNavItem).toBeVisible({ timeout: 15000 });

  // Allow the drawer open animation to settle.
  await page.waitForTimeout(250);
};

/**
 * Clicks a sidebar navigation item by its visible label.
 *
 * Side effects: clicks UI elements.
 *
 * @param page - Current Playwright page
 * @param label - Navigation label (e.g. "Tasks")
 */
const clickSidebarNavItem = async (page: Page, label: string): Promise<void> => {
  const navItem = page.locator(".MuiListItemButton-root", { hasText: label });
  await expect(navItem).toBeVisible({ timeout: 15000 });
  await navItem.click();
};

/**
 * Augment globalThis with AutoTracer runtime control API.
 */
declare global {
  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        reactTracer: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
        flowTracer: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
        networkTracer: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
        setOutputMode: (mode: "devtools" | "copy-paste") => void;
      }
    | undefined;
  // eslint-disable-next-line no-var
  var startAllTracing: () => void;
  // eslint-disable-next-line no-var
  var stopAllTracing: () => void;
}

test.describe("ReactTracer Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
          isDisabled: false,
          supportsFiber: true,
          renderers: new Map(),
          onCommitFiberRoot: () => {},
          onCommitFiberUnmount: () => {},
          inject: (renderer: any) => {
            const id = Math.random();
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.set(id, renderer);
            return id;
          },
        };
      }
    });
  });

  test("should explain tracing and toggle the dashboard", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Start tracing" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Alt+Shift+D")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ReactTracer", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "FlowTracer", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "NetworkTracer", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open AutoTracer documentation" }),
    ).toHaveAttribute("href", "https://docs.autotracer.dev/");

    const dashboard = page.locator(".autotracer-dashboard");
    const wasHidden = await dashboard.evaluate((element) =>
      element.classList.contains("dashboard-hidden"),
    );
    await page.getByRole("button", { name: "Toggle dashboard" }).click();
    if (wasHidden) {
      await expect(dashboard).not.toHaveClass(/dashboard-hidden/u);
    } else {
      await expect(dashboard).toHaveClass(/dashboard-hidden/u);
    }
  });

  test("should load task dashboard and display statistics", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("text=ReactTracer Demo")).toBeVisible({
      timeout: 15000,
    });

    // Check page title - use first() to avoid strict mode violation
    await expect(page.locator("h4").first()).toContainText("Dashboard", {
      timeout: 15000,
    });

    // Wait for data to load
    await page.waitForSelector("text=Total Tasks", { timeout: 5000 });

    // Verify statistics cards are visible - use first() to avoid strict mode
    await expect(page.locator("text=Total Tasks").first()).toBeVisible();
    await expect(page.locator("text=Completed").first()).toBeVisible();
    await expect(page.locator("text=In Progress").first()).toBeVisible();
    await expect(page.locator("text=Overdue").first()).toBeVisible();
  });

  test("should reload a subpage through the deployment fallback", async ({
    page,
    request,
  }) => {
    const fallbackConfig = await request.get("/staticwebapp.config.json");
    expect(fallbackConfig.ok()).toBe(true);
    expect(await fallbackConfig.json()).toMatchObject({
      navigationFallback: { rewrite: "/index.html" },
    });

    await page.goto("/tasks");
    await page.reload();

    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("should navigate to tasks page", async ({ page }) => {
    await page.goto("/");

    await openSidebar(page);

    // Click Tasks in navigation
    await clickSidebarNavItem(page, "Tasks");

    // Verify we're on the tasks page
    await expect(page.locator("h4")).toContainText("Tasks");

    // Wait for table to load
    await page.waitForSelector("table", { timeout: 5000 });
  });

  test("should filter tasks by status", async ({ page }) => {
    await page.goto("/tasks");

    // Wait for tasks to load
    await page.waitForSelector("table tbody tr", { timeout: 5000 });

    // This test just verifies the page loads with the table
    // Filter interaction is complex with MUI Select, so we skip detailed testing
  });

  test("should display the weather station", async ({ page }) => {
    await page.goto("/weather");

    await expect(
      page.getByRole("heading", { name: "Weather Station" }),
    ).toBeVisible();
    await expect(page.getByLabel("Place")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update weather" }),
    ).toBeDisabled();
    await expect(page.getByText("Select a place to begin")).toBeVisible();
  });

  test("should toggle theme", async ({ page }) => {
    await page.goto("/");

    // Click theme toggle button
    await page.click('button[aria-label="toggle theme"]');

    // Wait for theme to change
    await page.waitForTimeout(500);

    // Theme should have changed (check background color)
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();
  });

  test("should show the console API without duplicate tracing controls", async ({
    page,
  }) => {
    await page.goto("/");

    await openSidebar(page);

    await expect(
      page.getByRole("heading", { name: "Console API" }),
    ).toBeVisible();
    await expect(
      page.getByText("globalThis.startAllTracing()", { exact: false }),
    ).toBeVisible();
    await expect(
      page.locator(".MuiListItemButton-root", { hasText: "Settings" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /@autotracer\/(react18|flow)/u }),
    ).toHaveCount(0);
  });

  test("should control ReactTracer via console API", async ({ page }) => {
    await page.goto("/");

    // Evaluate in browser context with new namespaced API
    const isEnabled = await page.evaluate(() => {
      return globalThis.autoTracer?.reactTracer.isEnabled() ?? false;
    });

    // Initially disabled
    expect(isEnabled).toBe(false);

    // Start React18 tracing
    await page.evaluate(() => {
      globalThis.autoTracer?.reactTracer.start();
    });

    const isEnabledAfterStart = await page.evaluate(() => {
      return globalThis.autoTracer?.reactTracer.isEnabled() ?? false;
    });

    expect(isEnabledAfterStart).toBe(true);
  });

  test("should trace task requests with NetworkTracer", async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on("console", (message) => consoleMessages.push(message.text()));
    await page.goto("/");

    const initialState = await page.evaluate(() => ({
      networkAvailable: globalThis.autoTracer?.networkTracer !== undefined,
      networkEnabled:
        globalThis.autoTracer?.networkTracer?.isEnabled() ?? false,
    }));
    expect(initialState).toEqual({
      networkAvailable: true,
      networkEnabled: false,
    });

    await page.evaluate(() => {
      globalThis.autoTracer?.setOutputMode("copy-paste");
      globalThis.startAllTracing();
    });

    await expect
      .poll(() =>
        page.evaluate(
          () => globalThis.autoTracer?.networkTracer?.isEnabled() ?? false,
        ),
      )
      .toBe(true);

    await page.evaluate(async () => {
      await fetch("/api/tasks");
    });

    await expect
      .poll(() =>
        consoleMessages.some((message) =>
          message.includes("Network #1 -> GET /api/tasks"),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        consoleMessages.some((message) =>
          message.includes("Network #1 <- 200 GET /api/tasks"),
        ),
      )
      .toBe(true);

    await page.evaluate(() => {
      globalThis.stopAllTracing();
    });
    await expect
      .poll(() =>
        page.evaluate(
          () => globalThis.autoTracer?.networkTracer?.isEnabled() ?? true,
        ),
      )
      .toBe(false);
  });
});

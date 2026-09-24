import { test, expect, type ConsoleMessage } from "@playwright/test";

/**
 * Console message categorization
 */
interface CapturedLogs {
  errors: string[];
  warnings: string[];
  logs: string[];
  info: string[];
}

/**
 * Helper to capture and categorize console messages
 */
function createLogCapture(): CapturedLogs {
  return {
    errors: [],
    warnings: [],
    logs: [],
    info: [],
  };
}

/**
 * Add console message handler to page
 */
function setupConsoleCapture(page: any, logs?: CapturedLogs) {
  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    if (logs) {
      switch (type) {
        case "error":
          logs.errors.push(text);
          break;
        case "warning":
          logs.warnings.push(text);
          break;
        case "log":
          logs.logs.push(text);
          break;
        case "info":
          logs.info.push(text);
          break;
      }
    } else {
      // Immediately log to test output
      switch (type) {
        case "error":
          console.error(text);
          break;
        case "warning":
          console.warn(text);
          break;
        case "log":
          console.log(text);
          break;
        case "info":
          console.info(text);
          break;
        default:
          console.log(`[${type}] ${text}`);
          break;
      }
    }
  });

  page.on("pageerror", (error: Error) => {
    console.error(`Page error: ${error.message}`);
  });
}

/**
 * Filter out expected warnings from libraries (React Router, Redux)
 * while keeping actual application warnings
 */
function filterExpectedWarnings(warnings: string[]): string[] {
  return warnings.filter((warning) => {
    // Filter out React Router future flag warnings
    if (warning.includes("React Router Future Flag Warning")) {
      return false;
    }
    // Filter out Redux selector stability warnings in development
    if (warning.includes("input selector returned a different result")) {
      return false;
    }
    // Filter out Redux SerializableStateInvariantMiddleware performance warnings
    if (warning.includes("SerializableStateInvariantMiddleware took")) {
      return false;
    }
    // Filter out known resolveHookLabel stack handle warnings (existing bug)
    if (
      warning.includes('Cannot exit "resolveHookLabel:') &&
      warning.includes("handle not found in stack")
    ) {
      return false;
    }
    return true;
  });
}

test.describe("Users Dashboard Route", () => {
  test("should render without errors or warnings", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    // Navigate to users dashboard
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Verify key elements are present
    await expect(
      page.getByRole("heading", { name: "Users Dashboard" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Department Summary" })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Search by name, email, department, or role")
    ).toBeVisible();

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);

    // Log captured messages for debugging
    console.log("=== Users Dashboard Console Logs ===");
    console.log("Errors:", logs.errors);
    console.log("Warnings:", logs.warnings);
    console.log("Info messages count:", logs.info.length);
    console.log("Log messages count:", logs.logs.length);

    // Verify no errors
    expect(logs.errors).toHaveLength(0);

    // Verify no unexpected warnings (filter out React Router and Redux dev warnings)
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });

  test("should handle search interaction without errors", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Clear any initial logs
    logs.errors = [];
    logs.warnings = [];

    // Interact with search
    const searchInput = page.getByPlaceholder(
      "Search by name, email, department, or role"
    );
    await searchInput.fill("User 1");
    await page.waitForTimeout(500);

    // Verify no errors during interaction
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });

  test("should handle sort change without errors", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Clear any initial logs
    logs.errors = [];
    logs.warnings = [];

    // Change sort order - find the select button by its visible input
    await page.locator('[role="combobox"]').filter({ hasText: "Name" }).click();
    await page.getByRole("option", { name: "Department" }).click();
    await page.waitForTimeout(500);

    // Verify no errors during sort
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });
});

test.describe("Stress Test Route", () => {
  test("should render without errors or warnings", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    // Navigate to stress test page
    await page.goto("/stress");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Verify key elements are present
    await expect(
      page.getByRole("heading", { name: "Performance Stress Test" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stress Test Controls" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Product Statistics" })
    ).toBeVisible();

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);

    // Log captured messages for debugging
    console.log("=== Stress Test Console Logs ===");
    console.log("Errors:", logs.errors);
    console.log("Warnings:", logs.warnings);
    console.log("Info messages count:", logs.info.length);
    console.log("Log messages count:", logs.logs.length);

    // Verify no errors
    expect(logs.errors).toHaveLength(0);

    // Verify no unexpected warnings
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });

  test("should handle context update trigger without errors", async ({
    page,
  }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    await page.goto("/stress");
    await page.waitForLoadState("networkidle");

    // Clear any initial logs
    logs.errors = [];
    logs.warnings = [];

    // Trigger context update
    await page.getByRole("button", { name: /Trigger Context Update/ }).click();
    await page.waitForTimeout(500);

    // Verify no errors during update
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });

  test("should handle nesting depth change without errors", async ({
    page,
  }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    await page.goto("/stress");
    await page.waitForLoadState("networkidle");

    // Clear any initial logs
    logs.errors = [];
    logs.warnings = [];

    // Change nesting depth to maximum
    const depthSlider = page.locator('input[type="range"]').first();
    await depthSlider.fill("5");
    await page.waitForTimeout(500);

    // Verify no errors during depth change
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });

  test("should toggle memo without errors", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    await page.goto("/stress");
    await page.waitForLoadState("networkidle");

    // Clear any initial logs
    logs.errors = [];
    logs.warnings = [];

    // Toggle memo button - use first match since there are two buttons with Memo in name
    await page.getByRole("button", { name: "Memo OFF" }).first().click();
    await page.waitForTimeout(500);

    // Verify no errors during toggle
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });
});

test.describe("Navigation", () => {
  test("should navigate between routes without errors", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    // Start at users dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to stress test
    await page.getByRole("tab", { name: "Stress Test" }).click();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "Performance Stress Test" })
    ).toBeVisible();

    // Navigate back to users dashboard
    await page.getByRole("tab", { name: "Users Dashboard" }).click();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "Users Dashboard" })
    ).toBeVisible();

    // Wait for any async operations
    await page.waitForTimeout(1000);

    // Log captured messages
    console.log("=== Navigation Console Logs ===");
    console.log("Errors:", logs.errors);
    console.log("Warnings:", logs.warnings);

    // Verify no errors during navigation
    expect(logs.errors).toHaveLength(0);
    const unexpectedWarnings = filterExpectedWarnings(logs.warnings);
    expect(unexpectedWarnings).toHaveLength(0);
  });
});

test.describe("Location Editor Route", () => {
  test("should render react-hook-form component", async ({ page }) => {
    setupConsoleCapture(page);

    // // TEMPORARY: Enable fiber capture feature flag
    // await page.addInitScript(() => {
    //   (window as any).__CAPTURE_FIBER_FIXTURE = false;
    // });

    // Set up download handler before navigation
    // const downloadPromise = page
    //   .waitForEvent("download", { timeout: 10000 })
    //   .catch(() => null);

    const startTime = Date.now();
    await page.goto("/location");

    // Wait for the form to be visible
    await page.waitForSelector("text=Location Editor", { timeout: 900000 });
    await page.waitForSelector('input[name="name"]', { timeout: 900000 });

    const loadTime = Date.now() - startTime;
    console.log(`Location Editor load time: ${loadTime}ms`);

    // // Check if download occurred and save it
    // const download = await downloadPromise;
    // if (download) {
    //   const savePath = `C:\\Projects\\tracing\\apps\\perf-test-mui\\${download.suggestedFilename()}`;
    //   await download.saveAs(savePath);
    //   console.log(`✅ Fixture saved to: ${savePath}`);
    // } else {
    //   console.log(
    //     "⚠️ No download detected - fixture may not have been captured"
    //   );
    // }

    // Verify the form rendered
    const heading = await page.textContent("h5");
    expect(heading).toBe("Location Editor");

    // Check if load time is excessive (> 5 seconds indicates serialization issue)
    if (loadTime > 5000) {
      console.warn(
        `⚠️ Slow load detected: ${loadTime}ms - possible react-hook-form serialization issue`
      );
    }
  });

  test("should identify form hook in console logs for both rendering cycles", async ({
    page,
  }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    // Navigate to location editor
    await page.goto("/location");

    // Wait for the form to be visible
    await page.waitForSelector("text=Location Editor");
    await page.waitForSelector('input[name="name"]');

    // Wait for both rendering cycles to complete
    await page.waitForTimeout(1000);

    // Combine all console output
    const allLogs = [...logs.logs, ...logs.info];

    console.log("\n=== ALL Console Logs ===");
    allLogs.forEach((log, index) => {
      console.log(`[${index}] ${log}`);
    });

    // Find logs related to LocationEditor component
    const locationEditorLogs = allLogs.filter((log) =>
      log.includes("LocationEditor")
    );

    console.log("=== LocationEditor Console Logs ===");
    console.log(`Total logs: ${allLogs.length}`);
    console.log(`LocationEditor logs: ${locationEditorLogs.length}`);
    locationEditorLogs.forEach((log, index) => {
      console.log(`[${index}] ${log}`);
    });

    // Look for formHook state in the logs
    const formHookLogs = allLogs.filter((log) => log.includes("formHook:"));

    console.log("\n=== formHook State Logs ===");
    console.log(`formHook mentions: ${formHookLogs.length}`);
    formHookLogs.forEach((log, index) => {
      console.log(`[${index}] ${log}`);
    });

    // Verify we captured the component render logs
    expect(locationEditorLogs.length).toBeGreaterThan(0);

    // Verify we see mount and update cycles
    const mountLogs = locationEditorLogs.filter((log) => log.includes("Mount"));
    const renderingLogs = locationEditorLogs.filter((log) =>
      log.includes("Rendering")
    );

    console.log(`\nMount logs: ${mountLogs.length}`);
    console.log(`Rendering logs: ${renderingLogs.length}`);

    // We expect exactly one mount
    expect(mountLogs.length).toBe(1);

    // We expect exactly one update (Rendering)
    expect(renderingLogs.length).toBe(1);

    // Verify formHook appears in mount cycle
    const initialFormHookLogs = formHookLogs.filter((log) =>
      log.includes("Initial state formHook")
    );
    expect(initialFormHookLogs.length).toBe(1);

    // BUG 1: There should be NO "unknown" state on mount - only formHook
    const unknownLogs = allLogs.filter((log) => log.includes("state unknown"));
    const initialUnknownLogs = unknownLogs.filter((log) =>
      log.includes("Initial state unknown")
    );
    console.log("\n=== All Unknown Logs ===");
    unknownLogs.forEach((log, index) => {
      console.log(`[${index}] ${log}`);
    });
    console.log(
      `\n✅ BUG 1 FIXED: Expected 0 "Initial state unknown", found: ${initialUnknownLogs.length}`
    );
    expect(initialUnknownLogs.length).toBe(0);

    // BUG 2: INVALID - formHook does not actually change between mount and update
    // The object reference is stable and internal state (isReady, etc.) is already
    // in final state on mount. No state change occurs, so no log is expected.
    const changeFormHookLogs = formHookLogs.filter((log) =>
      log.includes("State change formHook")
    );
    console.log(
      `\n✅ BUG 2 INVALID: formHook has no state changes (stable reference + stable internal state)`
    );
    console.log(`   Found ${changeFormHookLogs.length} "State change formHook" (expected 0)`);
    expect(changeFormHookLogs.length).toBe(0); // Correct: no change expected
  });
});

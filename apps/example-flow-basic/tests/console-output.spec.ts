import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Console message categorization
 */
interface CapturedLogs {
  errors: string[];
  warnings: string[];
  logs: string[];
  info: string[];
  debug: string[];
  groups: string[]; // startGroup/startGroupCollapsed for flow tracing
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
    debug: [],
    groups: [],
  };
}

/**
 * Setup console capture that mirrors browser console to test runner console
 */
function setupConsoleCapture(page: Page, logs?: CapturedLogs) {
  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    // Mirror to test runner console with prefix
    const prefix = `[Browser ${type.toUpperCase()}]`;
    switch (type) {
      case "error":
        console.error(prefix, text);
        break;
      case "warning":
        console.warn(prefix, text);
        break;
      case "log":
        console.log(prefix, text);
        break;
      case "info":
        console.info(prefix, text);
        break;
      case "debug":
        console.debug(prefix, text);
        break;
      case "startGroup":
      case "startGroupCollapsed":
        console.log(`[Browser ${type}]`, text);
        break;
      default:
        console.log(`[Browser ${type}]`, text);
        break;
    }

    // Also capture to logs object if provided
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
        case "debug":
          logs.debug.push(text);
          break;
        case "startGroup":
        case "startGroupCollapsed":
          logs.groups.push(text);
          break;
      }
    }
  });

  page.on("pageerror", (error: Error) => {
    const message = `Page error: ${error.message}\n${error.stack || ""}`;
    console.error("[Browser ERROR]", message);
    if (logs) {
      logs.errors.push(message);
    }
  });
}

test.describe("Flow Tracing Console Output", () => {
  test("should capture and mirror initial render console output", async ({
    page,
  }) => {
    const logs = createLogCapture();

    // Setup console mirroring before navigating
    setupConsoleCapture(page, logs);

    console.log("\n=== Starting example-flow-basic test ===\n");

    // Navigate to the app
    await page.goto("/");

    // Wait for app to be ready
    await page.waitForSelector("h1");

    // Give time for any async initialization
    await page.waitForTimeout(1000);

    console.log("\n=== Initial Render Complete ===\n");

    // Verify the page loaded
    const heading = await page.textContent("h1");
    expect(heading).toContain("Flow Tracing");

    // Log summary
    console.log("\n=== Console Output Summary ===");
    console.log(`Errors: ${logs.errors.length}`);
    console.log(`Warnings: ${logs.warnings.length}`);
    console.log(`Logs: ${logs.logs.length}`);
    console.log(`Info: ${logs.info.length}`);
    console.log(`Debug: ${logs.debug.length}`);

    // Check for errors
    if (logs.errors.length > 0) {
      console.log("\n=== ERRORS FOUND ===");
      logs.errors.forEach((error, i) => {
        console.error(`Error ${i + 1}:`, error);
      });
    }

    // Fail test if there are errors
    expect(
      logs.errors,
      `Found ${logs.errors.length} console errors`,
    ).toHaveLength(0);
  });

  test("should trace function calls when buttons are clicked", async ({
    page,
  }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    console.log("\n=== Testing Function Tracing ===\n");

    await page.goto("/");
    await page.waitForSelector("h1");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear any initial logs
    logs.logs = [];
    logs.info = [];

    // Click add button
    console.log("\n--- Clicking Add button ---");
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(200);

    // Click subtract button
    console.log("\n--- Clicking Subtract button ---");
    await page.click('button:has-text("Subtract")');
    await page.waitForTimeout(200);

    // Click multiply button
    console.log("\n--- Clicking Multiply button ---");
    await page.click('button:has-text("Multiply")');
    await page.waitForTimeout(200);

    // Click divide button
    console.log("\n--- Clicking Divide button ---");
    await page.click('button:has-text("Divide")');
    await page.waitForTimeout(200);

    console.log("\n=== Function Tracing Summary ===");
    console.log(`Total log messages: ${logs.logs.length}`);
    console.log(`Total group messages: ${logs.groups.length}`);

    const candidateTraceLines = [...logs.groups, ...logs.logs];

    // Check for flow tracing output (devtools: groups, copy-paste: logs)
    const flowLogs = candidateTraceLines.filter(
      (line) =>
        line.includes("→") &&
        (line.includes("App:") ||
          line.includes("add") ||
          line.includes("multiply") ||
          line.includes("divide") ||
          line.includes("subtract")),
    );
    console.log(`Flow tracing messages: ${flowLogs.length}`);

    // Should have some tracing output
    expect(flowLogs.length).toBeGreaterThan(0);

    // Check for errors during interaction
    expect(
      logs.errors,
      `Found ${logs.errors.length} console errors during interaction`,
    ).toHaveLength(0);
  });

  test("should handle nested calls correctly", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    console.log("\n=== Testing Nested Function Calls ===\n");

    await page.goto("/");
    await page.waitForSelector("h1");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear initial logs
    logs.logs = [];

    // Click "Calculate Average" which should trigger nested calls
    console.log("\n--- Clicking Calculate Average (nested calls) ---");
    await page.click('button:has-text("Calculate Average")');
    await page.waitForTimeout(200);

    console.log("\n=== Nested Call Summary ===");
    console.log(`Total group messages: ${logs.groups.length}`);

    // Should have tracing for nested calls
    const candidateTraceLines = [...logs.groups, ...logs.logs];
    const flowLogs = candidateTraceLines.filter(
      (line) =>
        line.includes("→") &&
        (line.includes("calculateAverage") ||
          line.includes("calculateTotal") ||
          line.includes("add")),
    );
    console.log(`Flow tracing messages: ${flowLogs.length}`);

    // Verify no errors
    expect(logs.errors).toHaveLength(0);

    // Should have nested call traces
    expect(flowLogs.length).toBeGreaterThan(0);
  });

  test("should trace error handling", async ({ page }) => {
    const logs = createLogCapture();
    setupConsoleCapture(page, logs);

    console.log("\n=== Testing Error Handling ===\n");

    await page.goto("/");
    await page.waitForSelector("h1");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear initial logs
    logs.logs = [];
    logs.errors = [];

    // Click "Divide by Zero" which should trigger error handling
    console.log("\n--- Clicking Divide by Zero (error case) ---");
    await page.click('button:has-text("Divide by Zero")');
    await page.waitForTimeout(200);

    console.log("\n=== Error Handling Summary ===");
    console.log(`Total group messages: ${logs.groups.length}`);

    // Check if error was logged (expected behavior)
    const errorLogs = logs.logs.filter(
      (log) =>
        log.toLowerCase().includes("error") || log.includes("division by zero"),
    );
    console.log(`Error-related messages: ${errorLogs.length}`);

    // Flow tracer should still trace the function even with error
    const candidateTraceLines = [...logs.groups, ...logs.logs];
    const flowLogs = candidateTraceLines.filter(
      (line) =>
        line.includes("→") &&
        (line.includes("safeDivide") || line.includes("divide")),
    );
    console.log(`Flow tracing messages: ${flowLogs.length}`);

    // The app should handle the error gracefully (no uncaught errors)
    // Note: We expect the error to be caught and logged, not thrown
    expect(logs.errors.length).toBeLessThanOrEqual(1); // Allow for controlled error logging

    // Should have function traces even with error
    expect(flowLogs.length).toBeGreaterThan(0);
  });

  test("should format console messages with proper CSS arguments (no %c without style)", async ({
    page,
  }) => {
    // This test reproduces the bug: console shows "%c→ add (elapsed: 0.5ms)" with no CSS style argument
    const consoleCalls: Array<{ type: string; args: string[] }> = [];

    // Capture console calls with their arguments
    page.on("console", async (msg: ConsoleMessage) => {
      const type = msg.type();
      const args = await Promise.all(
        msg.args().map(async (arg) => {
          try {
            return await arg.jsonValue();
          } catch {
            return String(arg);
          }
        }),
      );

      consoleCalls.push({
        type,
        args: args.map((a) => String(a)),
      });
    });

    console.log("\n=== Testing Console Format Bug ===\n");

    await page.goto("/");
    await page.waitForSelector("h1");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear captured calls
    consoleCalls.length = 0;

    // Click add button to trigger function tracing
    console.log("\n--- Clicking Add button ---");
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(200);

    console.log("\n=== Analyzing Console Calls ===");
    console.log(`Total console calls: ${consoleCalls.length}`);

    // Find calls that have %c in the message
    const formattedCalls = consoleCalls.filter((call) => {
      return call.args.some((arg) => String(arg).includes("%c"));
    });

    console.log(`Calls with %c formatting: ${formattedCalls.length}`);

    // Check each formatted call
    const malformedCalls: Array<{ args: string[]; issue: string }> = [];

    formattedCalls.forEach((call, index) => {
      const firstArg = call.args[0] || "";
      console.log(`\n--- Formatted Call ${index + 1} ---`);
      console.log(`Type: ${call.type}`);
      console.log(`Args (${call.args.length}):`, JSON.stringify(call.args));

      // Count %c markers in the first argument
      const markerCount = (firstArg.match(/%c/g) || []).length;
      const totalArgCount = call.args.length - 1; // Subtract the message itself

      console.log(`%c markers: ${markerCount}`);
      console.log(`Total arguments after message: ${totalArgCount}`);

      // Check if there's a mismatch
      if (markerCount > 0) {
        // When %c is used, we expect at least markerCount CSS arguments
        // Additional arguments after CSS strings are allowed (e.g., parameter values)
        // Format: "%cMessage" with one CSS arg, OR
        //         "%cMessage" with one CSS arg + additional data args
        const minRequiredArgs = markerCount > 1 ? markerCount - 1 : 1;

        if (totalArgCount < minRequiredArgs) {
          const issue = `Expected at least ${minRequiredArgs} argument(s) for ${markerCount} %c marker(s), but got ${totalArgCount}`;
          console.error(`❌ MALFORMED: ${issue}`);
          malformedCalls.push({ args: call.args, issue });
        } else {
          console.log(
            `✅ Properly formatted (${markerCount} %c markers, ${totalArgCount} args)`,
          );
        }
      }
    });

    // Report malformed calls
    if (malformedCalls.length > 0) {
      console.log("\n=== MALFORMED CALLS DETECTED ===");
      malformedCalls.forEach((call, i) => {
        console.error(`\nMalformed Call ${i + 1}:`);
        console.error(`Issue: ${call.issue}`);
        console.error(`Args:`, JSON.stringify(call.args));
      });
    }

    // FAIL if any %c markers are not properly paired with CSS arguments
    expect(
      malformedCalls,
      `Found ${malformedCalls.length} console calls with %c but missing CSS arguments. This indicates the theme is not being applied correctly.`,
    ).toHaveLength(0);
  });
});

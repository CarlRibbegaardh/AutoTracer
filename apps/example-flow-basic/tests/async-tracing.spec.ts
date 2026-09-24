import { test, expect } from "@playwright/test";
import type { ConsoleMessage } from "@playwright/test";

/**
 * Tests for async function tracing.
 * Validates that async functions are properly traced with enterAsync/exitAsync.
 */

test.describe("Async Function Tracing", () => {
  test("should trace async function execution without crashing", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    // Capture all console messages (mirror browser console to test console)
    page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();

      // Mirror to test runner console
      console.log(`[Browser ${type.toUpperCase()}]`, text);

      // Store all messages
      consoleMessages.push(text);
    });

    // Capture any errors
    page.on("pageerror", (error) => {
      console.error("[Browser ERROR]", error.message);
      errors.push(error.message);
    });

    // Navigate to the app
    await page.goto("http://localhost:5180");

    // Wait for initial render
    await page.waitForTimeout(500);

    console.log("\n=== Testing Async Function Tracing ===\n");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear captured messages
    consoleMessages.length = 0;
    errors.length = 0;

    console.log("--- Clicking Fetch Data button ---\n");

    // Click the "Fetch Data" button
    await page.click('button:has-text("Fetch Data")');

    // Wait for async operation to complete
    await page.waitForTimeout(1000);

    // Verify no errors occurred
    console.log("\n=== Error Summary ===");
    console.log(`Total errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }

    expect(errors).toHaveLength(0);

    // Analyze console messages for async tracing
    console.log("\n=== Console Message Summary ===");
    console.log(`Total console messages: ${consoleMessages.length}`);

    // Look for async function traces
    const asyncTraces = consoleMessages.filter((msg) => {
      return (
        msg.includes("handleAsync") ||
        msg.includes("fetchData") ||
        (msg.includes("→") && msg.includes("async started")) ||
        (msg.includes("←") && msg.includes("async completed"))
      );
    });

    console.log("Async-related messages:", asyncTraces.length);
    if (asyncTraces.length > 0) {
      console.log("Sample async messages:");
      asyncTraces.slice(0, 5).forEach(msg => console.log("  -", msg));
    }

    // Verify we captured async function tracing
    expect(asyncTraces.length).toBeGreaterThan(0);

    // Check for enter/exit pattern
    const enterMessages = asyncTraces.filter((msg) =>
      msg.includes("→") && msg.includes("async started")
    );
    console.log("Enter messages (→):", enterMessages.length);

    const exitMessages = asyncTraces.filter((msg) =>
      msg.includes("←") && msg.includes("async completed")
    );
    console.log("Exit messages (←):", exitMessages.length);

    // We should have at least enter for handleAsync and fetchData
    expect(enterMessages.length).toBeGreaterThanOrEqual(2);

    // We should have corresponding exits
    expect(exitMessages.length).toBeGreaterThanOrEqual(2);

    // Verify the result is displayed (async operation completed successfully)
    const resultDiv = page.locator(".result");
    await expect(resultDiv).toBeVisible();
    const resultText = await resultDiv.textContent();
    expect(resultText).toContain("Fetched after 500ms: 6");

    console.log("\n=== Async Tracing Verification Complete ===\n");
  });
});

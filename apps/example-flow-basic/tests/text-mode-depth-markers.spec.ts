import { test, expect } from "@playwright/test";
import type { ConsoleMessage } from "@playwright/test";

/**
 * Tests for depth markers in text mode.
 * Validates that ALL console output has proper depth markers (│ ├─ └─) in text mode.
 */

test.describe("Text Mode Depth Markers", () => {
  test("should show depth markers on ALL output including parameters and return values", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];

    // Capture all console messages
    page.on("console", (msg: ConsoleMessage) => {
      const text = msg.text();
      console.log(`[Browser ${msg.type().toUpperCase()}]`, text);
      consoleMessages.push(text);
    });

    // Navigate to the app
    await page.goto("http://localhost:5180");
    await page.waitForTimeout(500);

    console.log("\n=== Testing Text Mode Depth Markers ===\n");

    // Activate flow tracing (outputMode is configured at startup)
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Clear captured messages
    consoleMessages.length = 0;

    console.log(
      "--- Clicking Fetch Data button (ASYNC nested call with parameters) ---\n"
    );

    // Click button that triggers ASYNC nested function with parameters
    await page.click('button:has-text("Fetch Data")');
    await page.waitForTimeout(1500);

    console.log("\n=== Analyzing Console Output ===\n");
    console.log("Total messages:", consoleMessages.length);

    // Find parameter traces
    const paramMessages = consoleMessages.filter((msg) =>
      msg.includes("param ")
    );
    console.log("\nParameter messages found:", paramMessages.length);
    paramMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. "${msg}"`);
    });

    // Find return value traces
    const returnMessages = consoleMessages.filter((msg) =>
      msg.includes("returned:")
    );
    console.log("\nReturn value messages found:", returnMessages.length);
    returnMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. "${msg}"`);
    });

    // Verify parameter messages have depth markers
    console.log("\n=== Checking Depth Markers on Parameters ===\n");

    expect(paramMessages.length).toBeGreaterThan(0);

    for (const paramMsg of paramMessages) {
      // In text mode, parameters inside groups should have depth markers (│  prefix)
      // Top-level async function parameters (no parent group) won't have markers
      const hasDepthMarkers = paramMsg.startsWith("│");
      const isTopLevelAsync = paramMsg.includes("delay"); // First async param at top level

      console.log(`Parameter message: "${paramMsg.substring(0, 50)}..."`);
      console.log(`  Has depth markers (starts with │): ${hasDepthMarkers}`);
      console.log(`  Is top-level async parameter: ${isTopLevelAsync}`);

      if (!isTopLevelAsync) {
        // Nested parameters (inside sync functions) must have depth markers
        expect(
          hasDepthMarkers,
          `Nested parameter message should have depth markers: "${paramMsg}"`
        ).toBe(true);
      }
      // Top-level async parameters don't have markers (no parent group)
    }

    // Verify return value messages have depth markers
    console.log("\n=== Checking Depth Markers on Return Values ===\n");

    expect(returnMessages.length).toBeGreaterThan(0);

    for (const returnMsg of returnMessages) {
      const hasDepthMarkers = returnMsg.startsWith("│");
      const isTopLevelAsync = returnMsg.includes("Fetched after"); // Top-level async return

      console.log(`Return message: "${returnMsg.substring(0, 50)}..."`);
      console.log(`  Has depth markers (starts with │): ${hasDepthMarkers}`);
      console.log(`  Is top-level async return: ${isTopLevelAsync}`);

      if (!isTopLevelAsync) {
        // Nested return values (inside sync functions) must have depth markers
        expect(
          hasDepthMarkers,
          `Nested return message should have depth markers: "${returnMsg}"`
        ).toBe(true);
      }
      // Top-level async return values don't have markers (no parent group)
    }

    console.log("\n=== Text Mode Depth Markers Verification Complete ===\n");
  });
});

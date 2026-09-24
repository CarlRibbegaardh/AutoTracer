import { test, expect } from "@playwright/test";

/**
 * Augment Window interface with AutoTracer runtime control API.
 */
declare global {
  interface Window {
    autoTracer?: {
      getOutputMode: () => "devtools" | "copy-paste";
      setOutputMode: (mode: "devtools" | "copy-paste") => void;
      flowTracer: {
        start: () => void;
        stop: () => void;
        isEnabled: () => boolean;
      };
    };
  }
}

/**
 * Tests for runtime control API (runtimeControlled: true mode).
 * Verifies that flow tracing starts dormant and can be activated via console API.
 */

test.describe("Runtime Control API", () => {
  function isFlowFunctionEntryMessage(type: string, text: string): boolean {
    const isDevtoolsGroupStart =
      (type === "startGroup" || type === "startGroupCollapsed") &&
      !text.includes("Component render cycle") &&
      !text.includes("└");

    if (isDevtoolsGroupStart) {
      return true;
    }

    const isCopyPasteLog =
      type === "log" &&
      text.includes("→") &&
      (text.includes("App:") ||
        text.includes("add") ||
        text.includes("subtract") ||
        text.includes("multiply") ||
        text.includes("divide"));

    return isCopyPasteLog;
  }

  test("should inject global window.autoTracer.flowTracer runtime controls", async ({
    page,
  }) => {
    await page.goto("http://localhost:5180");

    const hasAutoTracer = await page.evaluate(
      () => typeof window.autoTracer === "object" && window.autoTracer !== null
    );
    const hasGetOutputMode = await page.evaluate(
      () => typeof window.autoTracer?.getOutputMode === "function"
    );
    const hasSetOutputMode = await page.evaluate(
      () => typeof window.autoTracer?.setOutputMode === "function"
    );
    const hasFlowTracer = await page.evaluate(
      () => typeof window.autoTracer?.flowTracer === "object"
    );
    const hasStart = await page.evaluate(
      () => typeof window.autoTracer?.flowTracer.start === "function"
    );
    const hasStop = await page.evaluate(
      () => typeof window.autoTracer?.flowTracer.stop === "function"
    );
    const hasIsEnabled = await page.evaluate(
      () => typeof window.autoTracer?.flowTracer.isEnabled === "function"
    );

    expect(hasAutoTracer).toBe(true);
    expect(hasGetOutputMode).toBe(true);
    expect(hasSetOutputMode).toBe(true);
    expect(hasFlowTracer).toBe(true);
    expect(hasStart).toBe(true);
    expect(hasStop).toBe(true);
    expect(hasIsEnabled).toBe(true);
  });

  test("should start tracing dormant (no output initially)", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (isFlowFunctionEntryMessage(type, text)) {
        consoleMessages.push(text);
      }
    });

    await page.goto("http://localhost:5180");

    // Wait for runtime initialization to complete
    await page.waitForTimeout(1000);

    // Click Add button to trigger instrumented functions
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(500);

    // Should have NO flow trace messages (dormant)
    expect(consoleMessages.length).toBe(0);
  });

  test("should activate tracing when flowTracer.start() is called", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (isFlowFunctionEntryMessage(type, text)) {
        consoleMessages.push(text);
      }
    });

    await page.goto("http://localhost:5180");

    // Activate flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Click Add button to trigger instrumented functions
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(500);

    // Should now have flow trace messages (activated)
    expect(consoleMessages.length).toBeGreaterThan(0);

    // Verify we see function entry groups
    const hasFunctionEntry = consoleMessages.some((msg) => msg.includes("handle") || msg.includes("add"));
    expect(hasFunctionEntry).toBe(true);
  });

  test("should stop tracing when flowTracer.stop() is called", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (isFlowFunctionEntryMessage(type, text)) {
        consoleMessages.push(text);
      }
    });

    await page.goto("http://localhost:5180");

    // Activate, then stop
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    await page.click('button:has-text("Add")');
    await page.waitForTimeout(200);

    const messagesAfterStart = consoleMessages.length;
    expect(messagesAfterStart).toBeGreaterThan(0);

    // Stop tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.stop();
    });

    consoleMessages.length = 0; // Clear

    // Click again - should have no new messages
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(200);

    expect(consoleMessages.length).toBe(0);
  });

  test("should expose isEnabled() method", async ({ page }) => {
    await page.goto("http://localhost:5180");

    const isEnabledBeforeStart = await page.evaluate(
      () => window.autoTracer?.flowTracer.isEnabled() ?? false
    );
    expect(isEnabledBeforeStart).toBe(false);

    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    const isEnabledAfterStart = await page.evaluate(
      () => window.autoTracer?.flowTracer.isEnabled() ?? false
    );
    expect(isEnabledAfterStart).toBe(true);

    await page.evaluate(() => {
      window.autoTracer?.flowTracer.stop();
    });

    const isEnabledAfterStop = await page.evaluate(
      () => window.autoTracer?.flowTracer.isEnabled() ?? false
    );
    expect(isEnabledAfterStop).toBe(false);
  });

  test("should allow switching outputMode via window.autoTracer", async ({
    page,
  }) => {
    await page.goto("http://localhost:5180");

    const modeBefore = await page.evaluate(
      () => window.autoTracer?.getOutputMode() ?? "devtools"
    );

    await page.evaluate(() => {
      window.autoTracer?.setOutputMode("devtools");
    });

    const modeAfter = await page.evaluate(
      () => window.autoTracer?.getOutputMode() ?? "devtools"
    );

    expect(modeBefore).toBe("copy-paste");
    expect(modeAfter).toBe("devtools");
  });
});

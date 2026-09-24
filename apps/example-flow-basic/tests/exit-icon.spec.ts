import { expect, test } from "@playwright/test";

test.describe("Flow Exit Icon", () => {
  test("should use left arrow (←) for function exit messages", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "log" || msg.type() === "startGroup") {
        const text = msg.text();
        consoleLogs.push(text);
      }
    });

    await page.goto("http://localhost:5180");
    await page.waitForLoadState("networkidle");

    // Start flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Click Add button to trigger function calls
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(100);

    // Find enter and exit messages for the add function
    const enterMessage = consoleLogs.find((log) => log.includes("→ add"));
    const exitMessage = consoleLogs.find((log) =>
      log.includes("add (elapsed:")
    );

    // Verify enter message uses →
    expect(enterMessage).toBeTruthy();
    expect(enterMessage).toContain("→ add");

    // Verify exit message uses ← (not →)
    expect(exitMessage).toBeTruthy();
    expect(exitMessage).toContain("← add (elapsed:");
    expect(exitMessage).not.toContain("→ add (elapsed:");

    console.log("\n=== Exit Icon Verification ===");
    console.log("Enter message:", enterMessage);
    console.log("Exit message:", exitMessage);
    console.log("✅ Exit uses ← icon:", exitMessage?.includes("← add"));
    console.log("❌ Exit uses → icon:", exitMessage?.includes("→ add"));
  });

  test("should use left arrow (←) for async function exit", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "log" || msg.type() === "startGroup") {
        const text = msg.text();
        consoleLogs.push(text);
      }
    });

    await page.goto("http://localhost:5180");
    await page.waitForLoadState("networkidle");

    // Start flow tracing
    await page.evaluate(() => {
      window.autoTracer?.flowTracer.start();
    });

    // Click Fetch Data button to trigger async function
    await page.click('button:has-text("Fetch Data")');
    await page.waitForTimeout(600); // Wait for async to complete

    // Debug: print all console logs
    console.log("\n=== All Console Logs ===");
    consoleLogs.forEach((log, i) => console.log(`[${i}]`, log));

    // Find async enter and exit messages
    const asyncEnterMessage = consoleLogs.find((log) =>
      log.includes("→") && log.includes("fetchData") && log.includes("async started")
    );
    const asyncExitMessage = consoleLogs.find((log) =>
      log.includes("fetchData (async completed")
    );

    // Verify async enter uses →
    expect(asyncEnterMessage).toBeTruthy();
    expect(asyncEnterMessage).toContain("→");
    expect(asyncEnterMessage).toContain("fetchData");

    // Verify async exit uses ← (not →)
    expect(asyncExitMessage).toBeTruthy();
    expect(asyncExitMessage).toContain("←");
    expect(asyncExitMessage).toContain("fetchData (async completed");
    expect(asyncExitMessage).not.toContain("→ fetchData (async completed");

    console.log("\n=== Async Exit Icon Verification ===");
    console.log("Async enter message:", asyncEnterMessage);
    console.log("Async exit message:", asyncExitMessage);
    console.log("✅ Async enter uses →:", asyncEnterMessage?.includes("→"));
    console.log("✅ Async exit uses ←:", asyncExitMessage?.includes("←"));
  });
});

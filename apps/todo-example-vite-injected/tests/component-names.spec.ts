import { test, expect } from "./fixtures";

test.describe("Component Name Logging", () => {
  test("should log correct component names in render logs", async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      // Filter for render logs which typically start with tree structure or component name
      if (text.includes("Rendering") || text.includes("Mount")) {
        consoleLogs.push(text);
      }
    });

    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1000); // Allow initial renders to complete

    const logOutput = consoleLogs.join("\n");

    // Check for specific component names that should be preserved
    // These names would be minified (e.g. "t", "e") if the fix wasn't working
    expect(logOutput).toContain("[TodoApp]");
    expect(logOutput).toContain("[TodoList]");
    expect(logOutput).toContain("[AddTodoForm]");

    // Verify we don't see common minified names in the bracketed position
    // This is a heuristic, but helpful
    expect(logOutput).not.toMatch(/\[[a-z]\] Rendering/);
  });
});

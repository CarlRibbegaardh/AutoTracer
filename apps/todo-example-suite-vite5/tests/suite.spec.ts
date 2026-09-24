import { test, expect } from "./fixtures";

test.describe("Vite Suite Tests", () => {
  test("should load app in dev mode and add a todo", async ({ page }) => {
    await page.goto("/");

    // Verify app loaded
    await expect(page.locator("text=Todo App")).toBeVisible();

    // Add a todo (one interaction)
    await page.locator('[data-testid="todo-title-input"] input').fill("Test Todo");
    await page.locator('[data-testid="add-todo-button"]').click();

    // Verify todo was added
    await expect(page.locator('[data-testid^="todo-item-"]')).toHaveCount(1);
  });
});

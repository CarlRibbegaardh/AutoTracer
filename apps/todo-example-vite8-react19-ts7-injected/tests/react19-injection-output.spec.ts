import { expect, test } from "./fixtures.js";

test("proves AutoTracer transforms the control component", async ({ page }) => {
  await page.goto("/");

  const transformedModuleResponse = await page.request.get("/src/App.tsx");
  expect(transformedModuleResponse.ok()).toBe(true);
  expect(await transformedModuleResponse.text()).toContain("labelState");
});

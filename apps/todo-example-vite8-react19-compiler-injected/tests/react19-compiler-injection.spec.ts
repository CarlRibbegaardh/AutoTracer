import { expect, test } from "./fixtures.js";

test("proves React Compiler and AutoTracer transform the same component", async ({
  page,
}) => {
  await page.goto("/");

  const transformedModuleResponse = await page.request.get("/src/App.tsx");
  expect(transformedModuleResponse.ok()).toBe(true);

  const transformedModule = await transformedModuleResponse.text();
  expect(transformedModule).toContain("react_compiler-runtime.js");

  const appStart = transformedModule.indexOf("export function App()");
  const appEnd = transformedModule.indexOf("_s(App,", appStart);
  expect(appStart).toBeGreaterThanOrEqual(0);
  expect(appEnd).toBeGreaterThan(appStart);

  const transformedApp = transformedModule.slice(appStart, appEnd);
  expect(transformedApp).toContain("react.memo_cache_sentinel");
  expect(transformedApp).toContain("labelState");
});

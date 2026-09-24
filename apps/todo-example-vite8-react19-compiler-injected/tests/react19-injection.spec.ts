import { expect, test } from "./fixtures.js";

test("proves React 19 injection and Dashboard control", async ({
  page,
  pageLogs,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "React 19 tracer proof" }),
  ).toBeVisible();
  await expect(page.getByTestId("count")).toHaveText("0");

  const initialControls = await page.evaluate(function readInitialControls() {
    const autoTracer = Reflect.get(globalThis, "autoTracer");
    if (typeof autoTracer !== "object" || autoTracer === null) return null;
    const reactTracer = Reflect.get(autoTracer, "reactTracer");
    const widget = Reflect.get(autoTracer, "widget");
    if (typeof reactTracer !== "object" || reactTracer === null) return null;
    if (typeof widget !== "object" || widget === null) return null;
    const isEnabled = Reflect.get(reactTracer, "isEnabled");
    const isVisible = Reflect.get(widget, "isVisible");
    if (typeof isEnabled !== "function" || typeof isVisible !== "function")
      return null;
    return {
      tracing: Reflect.apply(isEnabled, reactTracer, []),
      widgetVisible: Reflect.apply(isVisible, widget, []),
    };
  });

  expect(initialControls).toEqual({ tracing: false, widgetVisible: true });

  await page.keyboard.press("Alt+Shift+T");
  await expect
    .poll(async () =>
      page.evaluate(function isTracingEnabled() {
        const autoTracer = Reflect.get(globalThis, "autoTracer");
        if (typeof autoTracer !== "object" || autoTracer === null) return false;
        const reactTracer = Reflect.get(autoTracer, "reactTracer");
        if (typeof reactTracer !== "object" || reactTracer === null)
          return false;
        const isEnabled = Reflect.get(reactTracer, "isEnabled");
        return (
          typeof isEnabled === "function" &&
          Reflect.apply(isEnabled, reactTracer, []) === true
        );
      }),
    )
    .toBe(true);

  await page.getByRole("button", { name: "Increment", exact: true }).click();
  await expect(page.getByTestId("count")).toHaveText("1");
  await expect.poll(() => pageLogs.join("\n")).toContain("State change count:");
  expect(pageLogs.join("\n")).not.toContain("State change unknown:");

  const renderCount = await page.evaluate(function readRenderCount() {
    const autoTracer = Reflect.get(globalThis, "autoTracer");
    if (typeof autoTracer !== "object" || autoTracer === null) return 0;
    const reactTracer = Reflect.get(autoTracer, "reactTracer");
    if (typeof reactTracer !== "object" || reactTracer === null) return 0;
    const getRenderCount = Reflect.get(reactTracer, "getRenderCount");
    if (typeof getRenderCount !== "function") return 0;
    const value = Reflect.apply(getRenderCount, reactTracer, []);
    return typeof value === "number" ? value : 0;
  });
  expect(renderCount).toBeGreaterThan(0);

  await page.keyboard.press("Alt+Shift+D");
  await expect
    .poll(async () =>
      page.evaluate(function isWidgetVisible() {
        const autoTracer = Reflect.get(globalThis, "autoTracer");
        if (typeof autoTracer !== "object" || autoTracer === null) return true;
        const widget = Reflect.get(autoTracer, "widget");
        if (typeof widget !== "object" || widget === null) return true;
        const isVisible = Reflect.get(widget, "isVisible");
        return (
          typeof isVisible !== "function" ||
          Reflect.apply(isVisible, widget, []) === true
        );
      }),
    )
    .toBe(false);

  await page.keyboard.press("Alt+Shift+T");
  await expect
    .poll(async () =>
      page.evaluate(function isTracingStopped() {
        const autoTracer = Reflect.get(globalThis, "autoTracer");
        if (typeof autoTracer !== "object" || autoTracer === null) return false;
        const reactTracer = Reflect.get(autoTracer, "reactTracer");
        if (typeof reactTracer !== "object" || reactTracer === null)
          return false;
        const isEnabled = Reflect.get(reactTracer, "isEnabled");
        return (
          typeof isEnabled === "function" &&
          Reflect.apply(isEnabled, reactTracer, []) === false
        );
      }),
    )
    .toBe(true);

  expect(pageLogs.join("\n")).not.toContain("PAGE ERROR:");
});

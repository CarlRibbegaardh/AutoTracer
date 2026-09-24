import { readFile, writeFile } from "node:fs/promises";

import { expect, test } from "./fixtures.js";

const probePath = new URL("../src/HmrProbe.tsx", import.meta.url);
const baselineMarker = "HMR baseline";
const updatedMarker = "HMR updated";

test("preserves traced state across a hot update", async ({
  page,
  pageLogs,
}) => {
  await page.goto("/");

  const probeMarker = page.getByTestId("hmr-marker");
  await expect(probeMarker).toHaveText(baselineMarker);

  const pageIdentity = await page.evaluate(function markPageInstance() {
    const identity = crypto.randomUUID();
    Reflect.set(globalThis, "__autoTracerHmrPageIdentity", identity);
    return identity;
  });

  await page.keyboard.press("Alt+Shift+T");
  await page.getByRole("button", { name: "Increment HMR probe" }).click();
  await expect(page.getByTestId("hmr-count")).toHaveText("1");

  const baselineSource = await readFile(probePath, "utf8");
  const updatedSource = baselineSource.replace(baselineMarker, updatedMarker);
  expect(updatedSource).not.toBe(baselineSource);

  try {
    await writeFile(probePath, updatedSource, "utf8");
    await expect(probeMarker).toHaveText(updatedMarker);

    await expect(page.getByTestId("hmr-count")).toHaveText("1");
    expect(
      await page.evaluate(function readPageInstance() {
        return Reflect.get(globalThis, "__autoTracerHmrPageIdentity");
      }),
    ).toBe(pageIdentity);

    expect(
      await page.evaluate(function isTracingEnabled() {
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
    ).toBe(true);

    pageLogs.length = 0;
    await page.getByRole("button", { name: "Increment HMR probe" }).click();
    await expect(page.getByTestId("hmr-count")).toHaveText("2");
    await expect
      .poll(() => pageLogs.join("\n"))
      .toContain("State change probeCount:");
    expect(pageLogs.join("\n")).not.toContain("State change unknown:");
    expect(pageLogs.join("\n")).not.toContain("PAGE ERROR:");
  } finally {
    await writeFile(probePath, baselineSource, "utf8");
  }
});

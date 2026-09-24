# Capture recipes

Use the existing app and test runner. Adapt source paths and selectors to the requested action. These recipes assume a known target already produces output; use integration repair first otherwise.

## Browser automation

Normally run the browser test against the local application. It must include AutoTracer instrumentation for the code you want to trace, and its tracer runtime must be initialized. The test starts tracing, reproduces the issue, stops tracing, and saves the console output. It cannot add instrumentation to an application that was built without it.

For a QA-only issue, the developer usually captures the output in their browser. Use that trace for analysis; use the recipes below when a local capture is needed.

Collect browser console events before the action, wait for the runtime, set text output, start tracing, perform the action, wait for its application result, and stop in cleanup. This Playwright example captures React output and preserves it even when the action or cleanup fails:

```ts
import { expect, test } from "@playwright/test";

test("capture increment", async ({ page }, testInfo) => {
  const lines: string[] = [];
  page.on("console", message => lines.push(message.text()));
  await page.goto("/"); // Open the application being investigated.
  await expect(page.getByTestId("count")).toHaveText("0");
  await page.waitForFunction(() =>
    Boolean(Reflect.get(globalThis, "autoTracer")?.reactTracer)
  );
  lines.length = 0;
  try {
    await page.evaluate(() => {
      const tracer = Reflect.get(globalThis, "autoTracer");
      tracer.setOutputMode("copy-paste");
      tracer.reactTracer.start();
    });
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("count")).toHaveText("1");
  } finally {
    try {
      await page.evaluate(() => {
        Reflect.get(globalThis, "autoTracer").reactTracer.stop();
      });
    } finally {
      const trace = lines.join("\n");
      console.log(trace);
      await testInfo.attach("autotracer", {
        body: trace, contentType: "text/plain",
      });
    }
  }
});
```

Run the single capture test with the project's Playwright command, for example `pnpm exec playwright test tests/autotracer.spec.ts`. Inspect the collected output for the selected component; a passing UI assertion alone is insufficient. Capture a second update if the first only establishes the component's state baseline.

For Flow, use `flowTracer` in the readiness check and start/stop commands. For both signals, wait for both controls, start both before the action, and stop both afterward. Keep the console subscription active for the whole capture. Check persisted AutoTracer filters and triggers if expected output is missing. Keep the account, data, and steps needed to reproduce the issue.

If using a connected browser tool instead of Playwright, use its supported console collection and page-evaluation capabilities to perform the same sequence. If console collection or execution is unavailable, report that limitation; do not invent a trace.

## Flow in Vitest

Vite HTML injection does not run in Node-based Vitest. Add the Flow transform and explicit runtime setup only for a capture mode, preserving existing plugins and setup files:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => ({
  plugins: mode === "autotracer" ? [
    flowTracer({ include: { paths: ["**/src/domain/**"] } }),
  ] : [],
  test: {
    setupFiles: mode === "autotracer" ? ["./test/autotracer.setup.ts"] : [],
  },
}));
```

```ts
// test/autotracer.setup.ts
import "@autotracer/flow/runtime";
Reflect.get(globalThis, "autoTracer").setOutputMode("copy-paste");
```

In the existing test, get the optional runtime from the global instead of importing the setup file unconditionally:

```ts
const flow = Reflect.get(globalThis, "autoTracer")?.flowTracer;
flow?.start();
try {
  // Keep the real operation and assertion here; await asynchronous results.
} finally {
  flow?.stop();
}
```

Run one test with `pnpm exec vitest run --mode autotracer test/calculateTotal.test.ts`. Preserve its process output and verify the selected function appears. Ordinary runs do not load the setup file. Keep the capture open until the awaited result; an `async completed` marker may precede settlement of a returned promise.

## Explain the captured evidence

Report the action/input, run command, selected source, trace excerpt or artifact, and observed execution sequence. Explain which parameters and return values crossed boundaries and which React state/props changed. Connect them through source locations; adjacency alone is not causality. For a bug, identify the first observed divergence. Name gaps such as uninstrumented source, detached async work, or another runtime rather than treating missing lines as proof.

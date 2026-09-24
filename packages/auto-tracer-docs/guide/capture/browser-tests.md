# Create A Trace From A Browser Test

A browser test can reproduce an action and turn the browser console from that exact run into input for analysis. Use it to explain working code or investigate a problem. The test does not need to assert against AutoTracer output.

This workflow is especially useful when the problem requires a particular sequence of interactions or is difficult to reproduce manually. It is also the documented automated path for ReactTracer, which observes React renders through the React DevTools hook installed before React evaluates.

The example below uses Playwright and the counter from [Your First Trace](/guide/first-trace). Adapt the interaction and result check to reproduce your issue.

Run the test against the application where the issue occurs, including QA when it only occurs there. That application must have been built with AutoTracer instrumentation for the code you want to trace, and its tracer runtime must be initialized. The test starts tracing, reproduces the issue, stops tracing, and saves the console output. It cannot add instrumentation to an application that was built without it. See [QA Deployment](/best-practices/production) for including AutoTracer in a QA build.

## Create The Capture

```typescript
import { expect, test } from "@playwright/test";

test("captures the counter update for analysis", async ({ page }, testInfo) => {
  const consoleLines: string[] = [];

  page.on("console", (message) => {
    consoleLines.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByTestId("count")).toHaveText("0");
  await page.waitForFunction(() =>
    Boolean(Reflect.get(globalThis, "autoTracer")?.reactTracer)
  );
  consoleLines.length = 0;

  try {
    await page.evaluate(() => {
      const autoTracer = Reflect.get(globalThis, "autoTracer");
      autoTracer.setOutputMode("copy-paste");
      autoTracer.reactTracer.start();
    });
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("count")).toHaveText("1");
  } finally {
    try {
      await page.evaluate(() => {
        Reflect.get(globalThis, "autoTracer").reactTracer.stop();
      });
    } finally {
      const trace = consoleLines.join("\n");
      console.log(trace);
      await testInfo.attach("autotracer", {
        body: trace,
        contentType: "text/plain",
      });
    }
  }
});
```

The application assertion waits for the relevant work to finish and confirms that the scenario was reproduced. It does not test the contents of the trace.

The `finally` blocks attempt to stop tracing and preserve the console output even if the interaction, assertion, or stop command fails. The trace is printed and attached to the Playwright result. Remove or redact sensitive values before sharing it.

Save this as `tests/autotracer.spec.ts` and run `pnpm exec playwright test tests/autotracer.spec.ts`. Check that the requested component actually appears in the output before analyzing it. A passing application assertion alone does not prove tracing worked. If you need before/after state values and the first capture only establishes a baseline, capture a second increment and wait for `2`.

Use a fresh browser context for a baseline capture; persisted filters and triggers can change what is visible. Keep existing project configuration and adapt this example to its runner rather than replacing the test setup.

## Select The Signal

The example above uses ReactTracer. Use FlowTracer when function calls, arguments, returns, exceptions, or timing are the relevant signal:

```typescript
autoTracer.flowTracer.start();
autoTracer.flowTracer.stop();
```

The called application source must be selected by the Flow build transform.

Start both tracers when the function flow and resulting React render are both relevant:

```typescript
autoTracer.flowTracer.start();
autoTracer.reactTracer.start();

// Reproduce the behavior and wait for its result.

autoTracer.reactTracer.stop();
autoTracer.flowTracer.stop();
```

Both tracers write into the collected browser console. Treat their output as two views of the same capture window; adjacent lines do not by themselves prove causality.

## ReactTracer Requirements

- Initialize ReactTracer before the first application render.
- With Vite, place the AutoTracer React plugin before the React plugin.
- Run the test against browser HTML processed by the configured build plugin, so the hook shim is installed before React loads.
- A Node or jsdom test that merely imports the React runtime is not equivalent to this browser setup.

See [React 18 Installation](/guide/installation-react-vite), [React 19 Installation](/guide/installation-react19-vite), or [Analyze A Trace](/guide/capture/analyze).

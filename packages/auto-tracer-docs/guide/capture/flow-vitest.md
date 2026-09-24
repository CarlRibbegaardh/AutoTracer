# FlowTracer In Vitest

A FlowTracer unit-test capture has two independent parts:

1. The Vite plugin transforms the application source under test.
2. A Vitest setup file loads the Flow runtime before the transformed module executes.

The browser runtime injection performed through Vite HTML is not part of a Node-based Vitest run. Load `@autotracer/flow/runtime` explicitly for this workflow.

## Add A Capture Mode

Configure a dedicated mode so ordinary test runs remain uninstrumented. Merge with existing plugins and setup files:

```typescript
// vitest.config.ts
import { flowTracer } from "@autotracer/plugin-vite-flow";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const captureWithAutoTracer = mode === "autotracer";

  return {
    plugins: captureWithAutoTracer ? [
      flowTracer({
        include: {
          paths: ["**/src/domain/**"],
        },
      }),
    ] : [],
    test: {
      setupFiles: captureWithAutoTracer
        ? ["./test/autotracer.setup.ts"]
        : [],
    },
  };
});
```

Use a glob such as `**/src/domain/**` that matches the source under test. FlowTracer normalizes transformed file paths to forward slashes before matching.

## Load The Runtime

```typescript
// test/autotracer.setup.ts
import "@autotracer/flow/runtime";

const autoTracer = Reflect.get(globalThis, "autoTracer");

autoTracer.setOutputMode("copy-paste");
```

The runtime starts dormant. The setup file runs before test modules in capture mode. Do not import it from the test body: doing so would also load the runtime in ordinary test runs.

## Bracket One Operation

```typescript
import { describe, expect, it } from "vitest";
import { calculateTotal } from "../src/domain/calculateTotal";

describe("calculateTotal", () => {
  it("applies the discount", () => {
    const flow = Reflect.get(globalThis, "autoTracer")?.flowTracer;
    flow?.start();

    try {
      const total = calculateTotal([20, 30], 0.1);
      expect(total).toBe(45);
    } finally {
      flow?.stop();
    }
  });
});
```

Run only the relevant test in the capture mode:

```bash
pnpm exec vitest run --mode autotracer test/calculateTotal.test.ts
```

The trace is written to the Vitest process output. In `copy-paste` mode it is text-shaped and can be copied directly.

Verify that `calculateTotal` appears in the output; the application assertion can pass even if instrumentation is missing. Preserve that output and explain its inputs and returns. Await asynchronous operations inside the `try` block before stopping.

## Scope Of The Capture

- Only source selected by the Flow build transform can emit trace output.
- Test files and test directories are excluded by the plugin defaults. The usual target is application or library source invoked by the test, not the test body itself.
- Keep the `include.paths` list narrow and run a single test while investigating.
- Call `stop()` in cleanup so a failed assertion does not leave tracing enabled for a later test.

For transform settings, see the [Flow Vite Plugin API](/api/plugin-vite-flow). For runtime controls, see the [Flow Runtime API](/api/flow). To interpret the output, see [Analyze A Trace](/guide/capture/analyze).

# `theme`

**Package:** `@autotracer/flow` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `FlowThemeConfig` &nbsp;·&nbsp; **Default:** `DEFAULT_FLOW_THEME`

---

`theme` is a runtime configuration option on `FlowTracerConfig` for `createFlowTracer(logger, config?)` — the manual tracer factory in `@autotracer/flow`. Use it when you are creating a manual tracer instance. Normal app integrations use the runtime loaded into the app plus theme files instead.

The `logger` argument on `createFlowTracer(logger, config?)` comes from [@autotracer/logger](/api/logger), usually via `getLogger(name)`.

Missing top-level categories fall back to `DEFAULT_FLOW_THEME` when the tracer instance is created. If you replace one category manually, provide the fields you want for that category; the manual `theme` path does not deep-merge nested `lightMode`, `darkMode`, or `icon` values inside an individual category.

For the global tracer loaded into the app by `@autotracer/flow`, Vite theme files are a separate path owned by [FlowTracer Theme API](/themes/flow/api).

## When To Set It

- Set it when you create a manual tracer and need custom colors or icons.
- Use the Vite theme-file path when you want to theme the global tracer installed by build tooling.

## Usage

```ts
import { createFlowTracer } from "@autotracer/flow";
import { getLogger } from "@autotracer/logger";

const tracer = createFlowTracer(getLogger("App"), {
  theme: {
    functionEnter: {
      lightMode: { text: "#0055cc", bold: true },
      darkMode: { text: "#7dd3fc", bold: true },
      icon: "→",
    },
  },
});
```

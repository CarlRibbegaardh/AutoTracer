# `startTriggerFunctionName`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `string | null` &nbsp;·&nbsp; **Default:** `null`

---

`startTriggerFunctionName` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It automatically starts tracing when a component display name matches the configured pattern.

String patterns are matched against component display names and support exact strings and glob-style patterns.

The default is `null`, so ReactTracer does not wait for any automatic start trigger unless you configure one.

After initialization, use `globalThis.autoTracer.reactTracer.setStartTrigger(...)`. See [Runtime Control](/api/react18#runtime-control-global-api).

## When To Set It

- Leave the default when you start tracing manually.
- Set a trigger when you want tracing to stay dormant until a specific component or component family appears.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({
  enabled: false,
  startTriggerFunctionName: "Checkout*",
});
```

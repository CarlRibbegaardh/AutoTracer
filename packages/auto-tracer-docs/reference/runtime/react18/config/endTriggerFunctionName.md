# `endTriggerFunctionName`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `string | null` &nbsp;·&nbsp; **Default:** `null`

---

`endTriggerFunctionName` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It automatically stops tracing when a component display name matches the configured pattern.

String patterns are matched against component display names and support exact strings and glob-style patterns. [`endTriggerMode`](./endTriggerMode) controls whether tracing stops before or after the trigger cycle is rendered.

The default is `null`, so trigger-driven sessions do not stop automatically unless you configure an end trigger.

After initialization, use `globalThis.autoTracer.reactTracer.setEndTrigger(...)`. See [Runtime Control](/api/react18#runtime-control-global-api).

## When To Set It

- Leave the default when you want tracing to keep running until you stop it manually.
- Set an end trigger when you want a capture window to stop automatically at a specific component or component family.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ endTriggerFunctionName: "Dialog*" });
```

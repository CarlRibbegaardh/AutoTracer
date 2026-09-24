# `endTriggerMode`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"on-entry" | "on-exit"` &nbsp;·&nbsp; **Default:** `"on-exit"`

---

`endTriggerMode` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls when an [`endTriggerFunctionName`](./endTriggerFunctionName) match stops tracing.

The default is `"on-exit"`, so the end-trigger render cycle is still captured before tracing stops.

After initialization, use `globalThis.autoTracer.reactTracer.setEndTriggerMode(...)`. See [Runtime Control](/api/react19#runtime-control-global-api).

## Values

- `"on-entry"`: Stop before rendering. The trigger cycle is suppressed.
- `"on-exit"`: Stop after rendering completes. The trigger cycle is still rendered.

## When To Set It

- Leave the default when you want the end-trigger cycle included in the capture.
- Switch to `"on-entry"` when the trigger component only marks where capture should stop and you do not want that cycle recorded.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({
  endTriggerFunctionName: "Dialog*",
  endTriggerMode: "on-entry",
});
```

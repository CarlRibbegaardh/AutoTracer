# `triggerRearmMode`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"always" | "once"` &nbsp;·&nbsp; **Default:** `"once"`

---

`triggerRearmMode` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls whether a start trigger can arm tracing again after an end trigger stops it.

The default is `"once"`, so one automatic start/end sequence runs once and then stays stopped until you re-arm tracing manually.

After initialization, use `globalThis.autoTracer.reactTracer.setTriggerRearmMode(...)`. See [Runtime Control](/api/react19#runtime-control-global-api).

## Values

- `"always"`: After an end trigger stops tracing, a later start trigger can start it again.
- `"once"`: After an end trigger stops tracing, tracing stays stopped until you start it manually.

## When To Set It

- Leave the default when you want one automatic capture window per manual arm.
- Switch to `"always"` when the same start/end trigger pair should open repeated capture windows during the session.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({
  enabled: false,
  startTriggerFunctionName: "Checkout*",
  endTriggerFunctionName: "Confirmation",
  triggerRearmMode: "always",
});
```

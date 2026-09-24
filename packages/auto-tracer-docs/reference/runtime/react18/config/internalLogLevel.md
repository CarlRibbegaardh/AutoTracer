# `internalLogLevel`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"fatal" | "error" | "warn" | "log" | "info" | "debug" | "verbose" | "trace"` &nbsp;·&nbsp; **Default:** `"error"`

---

`internalLogLevel` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls ReactTracer's own diagnostic logging.

This setting affects internal lifecycle, filtering, and timing logs from ReactTracer itself. It does not change which components are traced. The default `"error"` shows failures only. `"trace"` is the most verbose setting and includes timing for internal operations.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ internalLogLevel: "debug" });
```

# `outputMode`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** preserves any pre-seeded output mode; otherwise `"devtools"`

---

`outputMode` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It selects the high-level console output preset that controls both tree layout and value rendering.

When omitted, ReactTracer keeps any pre-seeded output mode. If no output mode was seeded earlier, it starts in `"devtools"`.

After initialization, you can also change the canonical output mode with `globalThis.autoTracer.setOutputMode(...)`. See [Global Output Mode Control](/api/react18#global-output-mode-control).

Read together with [`enabled`](./enabled) and [`colors`](./colors) when you are tuning startup behavior and output appearance.

## Values

- `"devtools"`: Uses grouped console output and interactive values.
- `"copy-paste"`: Uses line-art tree output and serialized values.

## When To Set It

- Leave `"devtools"` when you are inspecting traces live in browser DevTools.
- Switch to `"copy-paste"` when you need stable text output that is easier to paste into chat, issues, or notes.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ outputMode: "copy-paste" });
```

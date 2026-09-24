# `trackedStateResolution`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"hybrid" | "labels-only"` &nbsp;·&nbsp; **Default:** `"hybrid"`

---

`trackedStateResolution` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls how state changes are resolved for tracked components.

This setting applies only to tracked components. Untracked components always use fiber-based state resolution.

## Values

- `"hybrid"`: Matches labeled state against fiber hooks and may infer nested hook labels.
- `"labels-only"`: Reports only explicitly labeled state.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ trackedStateResolution: "labels-only" });
```

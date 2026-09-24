# `includeSkipped`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"never" | "forProps" | "forState" | "forPropsOrState" | "always"` &nbsp;·&nbsp; **Default:** `"never"`

---

`includeSkipped` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls whether non-tracked components that React processed internally without executing the component function are shown in the tree.

Tracked components always appear regardless of this setting. This setting also affects what [`filterEmptyNodes`](./filterEmptyNodes) treats as empty for skipped nodes.

The default is `"never"`, so skipped non-tracked nodes stay hidden unless you widen visibility.

## Values

- `"never"`: Hide all non-tracked skipped components.
- `"forProps"`: Show only skipped components with prop changes.
- `"forState"`: Show only skipped components with state changes.
- `"forPropsOrState"`: Show skipped components with props or state.
- `"always"`: Show all non-tracked skipped components.

## When To Set It

- Leave the default when skipped nodes would mostly add noise.
- Raise this when you need to see which non-tracked components React considered but did not execute.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ includeSkipped: "forPropsOrState" });
```

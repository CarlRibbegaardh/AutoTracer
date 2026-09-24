# `includeReconciled`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"never" | "forProps" | "forState" | "forPropsOrState" | "always"` &nbsp;·&nbsp; **Default:** `"never"`

---

`includeReconciled` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls whether non-tracked components that React reconciled without re-rendering are shown in the tree.

Tracked components always appear regardless of this setting. This setting also affects what [`filterEmptyNodes`](./filterEmptyNodes) treats as empty for reconciled nodes.

The default is `"never"`, so reconciled non-tracked nodes stay hidden unless you explicitly ask for them.

## Values

- `"never"`: Hide all non-tracked reconciled components.
- `"forProps"`: Show only reconciled components with prop changes.
- `"forState"`: Show only reconciled components with state changes.
- `"forPropsOrState"`: Show reconciled components with props or state.
- `"always"`: Show all non-tracked reconciled components.

## When To Set It

- Leave the default when reconciled nodes would only add noise to the tree.
- Raise this when you need to understand which non-tracked components React reconsidered even though they did not re-render.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ includeReconciled: "always" });
```

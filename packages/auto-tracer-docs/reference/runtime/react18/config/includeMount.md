# `includeMount`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"never" | "forProps" | "forState" | "forPropsOrState" | "always"` &nbsp;·&nbsp; **Default:** `"never"`

---

`includeMount` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls whether non-tracked components rendering for the first time are shown in the tree.

Tracked components always appear regardless of this setting. This setting also affects what [`filterEmptyNodes`](./filterEmptyNodes) treats as empty for mount nodes.

The default is `"never"`, so non-tracked mount nodes stay hidden unless you explicitly widen visibility.

## Values

- `"never"`: Hide all non-tracked mount components.
- `"forProps"`: Show only mount components with initial props.
- `"forState"`: Show only mount components with initial state.
- `"forPropsOrState"`: Show mount components with props or state.
- `"always"`: Show all non-tracked mount components.

## When To Set It

- Leave the default when you want mount output to stay focused on tracked components.
- Raise this when you need more first-render context from nearby non-tracked components around the part of the tree you are investigating.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ includeMount: "forPropsOrState" });
```

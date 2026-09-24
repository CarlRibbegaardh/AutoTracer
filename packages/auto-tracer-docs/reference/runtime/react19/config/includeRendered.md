# `includeRendered`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"never" | "forProps" | "forState" | "forPropsOrState" | "always"` &nbsp;·&nbsp; **Default:** `"never"`

---

`includeRendered` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls whether non-tracked components that re-render because of props or state changes are shown in the tree.

Tracked components always appear regardless of this setting. This setting also affects what [`filterEmptyNodes`](./filterEmptyNodes) treats as empty for rendered nodes.

The default is `"never"`, so re-render output stays centered on tracked components unless you widen visibility.

## Values

- `"never"`: Hide all non-tracked rendered components.
- `"forProps"`: Show only rendered components with prop changes.
- `"forState"`: Show only rendered components with state changes.
- `"forPropsOrState"`: Show rendered components with props or state.
- `"always"`: Show all non-tracked rendered components.

## When To Set It

- Leave the default when you want update output to stay focused on tracked components.
- Raise this when you need to see more non-tracked re-render context around the components you instrumented.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({ includeRendered: "forPropsOrState" });
```

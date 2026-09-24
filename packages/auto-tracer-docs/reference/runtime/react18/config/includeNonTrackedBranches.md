# `includeNonTrackedBranches`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`includeNonTrackedBranches` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls whether the output includes only tracked components (components with `useReactTracer()`) and their ancestor chain, or all component branches.

Set this to `true` when you want to include non-tracked components in the tree. If you are not injecting `useReactTracer()` with one of the plugins, this must be `true` to see any output.

After branches are included, [`filterEmptyNodes`](./filterEmptyNodes) still decides whether empty sequences in that included tree stay visible or collapse into markers.

The default is `false`, so ReactTracer shows tracked components and their ancestor chain only.

## When To Set It

- Leave the default when you only need the tracked path through the tree.
- Set `true` when you need broader tree context from non-tracked components, or when you are not using build-time injection and still want output.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({
  includeNonTrackedBranches: true,
});
```

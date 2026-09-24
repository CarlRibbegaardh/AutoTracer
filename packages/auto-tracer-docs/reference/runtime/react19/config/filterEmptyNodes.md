# `filterEmptyNodes`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"none" | "first" | "all"` &nbsp;·&nbsp; **Default:** `"all"`

---

`filterEmptyNodes` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls how sequences of consecutive empty nodes are collapsed in the component tree output. Collapsed sequences are replaced by a single marker: `... (N empty levels)`, preserving the depth of the first collapsed node and the count.

Instrumented components are never considered empty - they always appear in the output regardless of this setting. Components are normally instrumented by `@autotracer/plugin-vite-react19`, which injects `useReactTracer` automatically.

[`includeNonTrackedBranches`](./includeNonTrackedBranches) affects what this setting can filter. When `includeNonTrackedBranches` is `false`, branches without tracked components are excluded before empty-node filtering runs.

## What Counts As Empty

An empty node is a non-tracked, non-marker node with no component logs that the current visibility settings treat as hidden.

For `Mount`, `Rendering`, `Reconciled`, and `Skipped` nodes, that decision is based on the matching visibility setting ([`includeMount`](./includeMount), [`includeRendered`](./includeRendered), [`includeReconciled`](./includeReconciled), or [`includeSkipped`](./includeSkipped)) and on whether the node has prop changes, state changes, or both.

Tracked components are never empty. Marker nodes are never empty. Identical-value warnings do not make a node non-empty by themselves.

## Values

### `"all"` (default)

Collapses all sequences of consecutive empty nodes throughout the entire tree. Provides the most compact view by removing all noise.

All your instrumented components are visible.

```typescript
reactTracer({ filterEmptyNodes: "all" });
```

### `"first"`

Collapses only the initial sequence of empty nodes at the start of the tree. Preserves all empty nodes that appear after the first non-empty node. Useful for cleaning up top-level wrapper components while maintaining full visibility deeper in the tree.

Some uninstrumented components and HTML nodes will appear. This can be too noisy for many real sites and apps.

```typescript
reactTracer({ filterEmptyNodes: "first" });
```

### `"none"`

No filtering - every node is shown regardless of content. This is usually not usable.

It is mainly meant for when you have no instrumentation at all but still want to see what renders and why.

```typescript
reactTracer({ filterEmptyNodes: "none" });
```

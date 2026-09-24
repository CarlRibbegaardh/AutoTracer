# @autotracer/filter-utils

**Shared filter utilities for AutoTracer build-time and runtime filtering.**

This package provides small, framework-agnostic helpers for matching names with glob-style patterns and for persisting runtime filters in `localStorage`.

## Why Use It

- A tiny, dependency-free runtime filter store you can mount onto any tracer.
- A shared glob matcher aligned with the build plugins’ filtering semantics.

## Installation/Setup

```bash
pnpm add @autotracer/filter-utils
```

## Configuration

### Runtime filter store

- `storageKey` (required): `string`
- `storage` (optional): Storage-like adapter (`getItem/setItem/removeItem`)
  - Default behavior: pass `undefined` when `localStorage` is unavailable.

## Usage

### Persisted runtime filtering (name-only)

```ts
import { createRuntimeNameFilterStore } from "@autotracer/filter-utils";

const store = createRuntimeNameFilterStore({
  storage: globalThis.localStorage,
  storageKey: "__autotracer.myTracer.runtimeFilters.v1",
});

store.addFilter("MyComponent");
store.addFilter("noise*");

store.matchesName("noiseHandler"); // true
store.getFilters(); // ["MyComponent", "noise*"]
```

### filterMode copy/paste snippet (recommended)

Browser DevTools consoles are not a true DOM surface, so “clickable controls inside console rows” are not reliable.

Recommended `filterMode` UX is to append a copy/paste command snippet per row:

```ts
const snippet = `autoTracer.reactTracer.addFilter(${JSON.stringify(name)})`;
console.log("Row label", snippet);
```

To render it slightly smaller and non-bold in DevTools, log it using `%c` styling:

```ts
const snippet = `autoTracer.reactTracer.addFilter(${JSON.stringify(name)})`;
console.log(
  "Row label",
  `%c${snippet}`,
  "font-size: 0.85em; font-weight: 400;",
);
```

### Action element helper (not recommended)

This package still exposes `createRuntimeFilterActionElement`, but it depends on DevTools behavior and may render as non-interactive HTML text.

## Pragma Utilities

This package also exports build-time helpers used by the AutoTracer Babel and Vite plugins to read `@trace` / `@trace-disable` pragma comments from AST nodes.

### `PragmaCommentHost`

Describes the minimal interface any AST node must satisfy to supply its leading comments:

```ts
import { type PragmaCommentHost } from "@autotracer/filter-utils";

// Any object with an optional `leadingComments` array works
const host: PragmaCommentHost = {
  leadingComments: [{ type: "CommentLine", value: " @trace" }],
};
```

### `PragmaResult`

The result of a pragma inspection. Both fields are always present:

```ts
import { type PragmaResult } from "@autotracer/filter-utils";
// { hasTrace: boolean; hasDisable: boolean }
```

### `getFunctionPragmas`

Extracts `@trace` and `@trace-disable` pragmas from any `PragmaCommentHost`:

```ts
import { getFunctionPragmas } from "@autotracer/filter-utils";

const result = getFunctionPragmas(astNode);
// result.hasTrace   → true if a leading `// @trace` comment is present
// result.hasDisable  → true if a leading `// @trace-disable` comment is present
```

Both fields are `false` when the node has no relevant leading comments. The function is pure and never throws.

### `isValidPragmaToken`

Checks whether a raw comment value is a recognised pragma token (`@trace` or `@trace-disable`):

```ts
import { isValidPragmaToken } from "@autotracer/filter-utils";

isValidPragmaToken(" @trace"); // true
isValidPragmaToken(" @trace-disable"); // true
isValidPragmaToken(" @trace-ignore"); // false
```

## License

MIT © Carl Ribbegårdh

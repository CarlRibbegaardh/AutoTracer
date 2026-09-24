# `functionCache`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`functionCache` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It enables ReactTracer's per-render function cache.

Cached results are keyed by function reference and argument combinations. The cache is cleared after each render cycle.

This is a specialized performance setting for ReactTracer's internal hot-path helpers, not a setting most users need to tune first.

If you want cache statistics while evaluating this behavior, see [`functionCacheLogging`](./functionCacheLogging).

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ functionCache: true });
```

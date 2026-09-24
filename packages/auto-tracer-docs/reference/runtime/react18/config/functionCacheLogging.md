# `functionCacheLogging`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`functionCacheLogging` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It logs cache statistics after each render cycle.

This setting only has an effect when [`functionCache`](./functionCache) is enabled.

This is a specialized diagnostic setting for inspecting ReactTracer's internal cache behavior.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({
  functionCache: true,
  functionCacheLogging: true,
});
```

# `showLevelDetails`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`showLevelDetails` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls whether connector and marker lines include numeric level details.

When enabled, collapsed markers show `Level` and `Filtered nodes` counts. This is most useful together with [`filterEmptyNodes`](./filterEmptyNodes).

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({
  filterEmptyNodes: "all",
  showLevelDetails: true,
});
```

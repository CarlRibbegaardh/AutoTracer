# `showFlags`

**Package:** `@autotracer/react18` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`showFlags` is a runtime configuration option for `reactTracer()` — the initializer of the `@autotracer/react18` React component render tracing library. It controls whether React fiber flag names are appended to component lines in the output.

Use this when you want to see internal React flag names such as `Placement` and `Update` alongside the rendered component tree.

## Usage

```typescript
import { reactTracer } from "@autotracer/react18";

reactTracer({ showFlags: true });
```

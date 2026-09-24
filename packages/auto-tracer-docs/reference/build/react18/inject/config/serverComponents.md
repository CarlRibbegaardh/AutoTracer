# `serverComponents`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`serverComponents` is a shared transform configuration option used by `transform()` to protect React Server Components builds. When it is enabled, the transform only injects tracing into modules that contain the `"use client"` directive.

When this setting is `true` and the parsed module is not a client component module, `transform()` returns the original code unchanged. When it is `false`, the transform relies on the normal `mode`, `include`, `exclude`, and pragma checks without the extra client-module gate.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  serverComponents: true,
});
```

Read together with [`mode`](./mode) and [`include`](./include) when you are building a custom integration for an App Router or another RSC-aware toolchain.

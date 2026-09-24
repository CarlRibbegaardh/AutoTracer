# `serverComponents`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`serverComponents` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It turns on React Server Components safety checks.

When `true`, the transform only injects tracing into modules that contain a top-level `"use client"` directive. Files without that directive are left unchanged so client-only hooks are not injected into server code.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  serverComponents: true,
});
```

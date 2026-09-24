# `serverComponents`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`serverComponents` is a build configuration option for `reactTracer.vite()`. It turns on React Server Components safety checks in the shared React 19 injector.

When `true`, the transform only injects tracing into modules that contain a top-level `"use client"` directive. Files without that directive are left unchanged so client-only hooks are not injected into server code.

This option governs build-time eligibility only. The plugin instruments client components. It does not trace React Server Component execution.

## Usage

```ts
reactTracer.vite({
  serverComponents: true,
  include: {
    paths: ["app/**/*.tsx"],
  },
});
```

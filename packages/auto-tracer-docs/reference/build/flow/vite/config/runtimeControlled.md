# `runtimeControlled`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`runtimeControlled` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It chooses whether tracing starts dormant or active.

When `runtimeControlled` is `true`, tracing starts dormant and stays off until you enable it later. When `runtimeControlled` is `false`, tracing starts active immediately.

If [`inject`](./inject) is `false`, the plugin does nothing and `runtimeControlled` has no effect. Read together with [`inject`](./inject), [`dashboardConfig`](./dashboardConfig), and [@autotracer/flow](/api/flow).

## Default

If you omit `runtimeControlled`, tracing starts dormant.

## Usage

```typescript
flowTracer({
  runtimeControlled: true,
});
```

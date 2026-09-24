# `inject`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`inject` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It controls whether the plugin performs any of its source transforms or HTML startup injection.

When `inject` is `false`, the plugin becomes a full no-op. It does not transform source files, inject startup scripts into HTML, load Vite root theme files, seed startup `outputMode`, inject the Flow runtime import, or mount the dashboard.

Use this option to keep tracing out of publicly accessible builds. If you add tracing imports outside the plugin, gate those imports with the same build condition. Read together with [`runtimeControlled`](./runtimeControlled), [`dashboardConfig`](./dashboardConfig), and [`outputMode`](./outputMode) when you are deciding whether the plugin should do anything at all in a given build.

## Default

If you omit `inject`, the plugin runs.

## Usage

```typescript
flowTracer({
  inject: mode === "development" || isInternalQa,
});
```

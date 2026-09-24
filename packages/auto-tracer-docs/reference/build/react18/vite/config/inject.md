# `inject`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`inject` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It controls whether the plugin performs any of its side effects.

When `inject` is `false`, the plugin becomes a full no-op. It does not transform source files, inject startup scripts into HTML, mount the dashboard, rewrite Vite build configuration, or emit the UMD asset used by [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs).

The `TRACE_INJECT=0` environment variable disables the plugin completely even when `inject` is `true`.

Read together with [`dashboardConfig`](./dashboardConfig), [`outputMode`](./outputMode), and [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs) when you are deciding whether the plugin should do anything at all in a given build.

## Usage

```typescript
reactTracer.vite({
  inject: mode === "development",
});
```

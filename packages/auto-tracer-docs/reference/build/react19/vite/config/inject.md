# `inject`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`inject` is a build configuration option for `reactTracer.vite()`. It decides whether the React 19 Vite plugin performs any of its work.

When `inject` is `false`, the plugin becomes a full no-op. It does not transform source files, inject startup scripts into HTML, mount the Dashboard, load theme files, rewrite Vite build configuration, or emit the UMD asset used by [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs).

`TRACE_INJECT=0` disables the plugin completely even when `inject` is `true`.

If you want the Dashboard to control tracing without starting an active trace immediately, keep `inject` enabled for that build and initialize `@autotracer/react19` separately with `reactTracer({ enabled: false })` before React renders.

## Usage

```ts
reactTracer.vite({
  inject: mode === "development",
});
```

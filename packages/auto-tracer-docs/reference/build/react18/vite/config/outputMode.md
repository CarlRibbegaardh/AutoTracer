# `outputMode`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It injects a startup script that sets the canonical AutoTracer output mode before your app runs.

When present and [`inject`](./inject) is enabled, the plugin seeds `globalThis.__autoTracerInternal.outputMode` and, when the runtime surface already exists, calls `globalThis.autoTracer.setOutputMode(...)` so the chosen format is active from the first trace.

Use [ReactTracer Runtime `outputMode`](/reference/runtime/react18/config/outputMode) for the exact runtime meaning of `"devtools"` and `"copy-paste"`.

Read together with [`inject`](./inject), [`dashboardConfig`](./dashboardConfig), and [ReactTracer Runtime `outputMode`](/reference/runtime/react18/config/outputMode).

## Usage

```typescript
reactTracer.vite({
  outputMode: "devtools",
});
```
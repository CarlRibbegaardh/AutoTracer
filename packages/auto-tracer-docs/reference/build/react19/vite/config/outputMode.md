# `outputMode`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option for `reactTracer.vite()`. It seeds the preferred AutoTracer output mode before the runtime initializes.

When this option is set, the plugin injects an HTML startup script that writes `globalThis.__autoTracerInternal.outputMode` and updates `globalThis.autoTracer?.setOutputMode(...)` if the lower-level control surface already exists.

This option does not start tracing. It only seeds the display mode that the runtime will use when tracing starts.

## Usage

```ts
reactTracer.vite({
  outputMode: "copy-paste",
});
```

# `outputMode`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It injects a seed-only startup block into processed modules so the canonical AutoTracer output mode can be established before the first trace runs.

When set, the Babel plugin inserts statements after any directive prologue in transformed modules. If `globalThis.__autoTracerInternal` is still undefined, the injected code seeds its `outputMode` field and, when the runtime surface already exists, calls `globalThis.autoTracer.setOutputMode(...)`. If the internal state already exists, the injected bootstrap does nothing.

This setting does not replace runtime initialization with `reactTracer()`. Use [ReactTracer Runtime `outputMode`](/reference/runtime/react18/config/outputMode) for the exact runtime meaning of `"devtools"` and `"copy-paste"`.

Read together with [ReactTracer Runtime `outputMode`](/reference/runtime/react18/config/outputMode).

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-react18", { "outputMode": "devtools" }]
  ]
}
```

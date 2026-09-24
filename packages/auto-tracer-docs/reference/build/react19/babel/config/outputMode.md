# `outputMode`

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option passed to `@autotracer/plugin-babel-react19`. It seeds the preferred AutoTracer output mode inside instrumented React 19 modules.

When this option is set, the plugin inserts startup statements after the directive prologue so the chosen mode is available before tracing begins.

This option does not start tracing. It only seeds the output format.

If `TRACE_INJECT=0` disables the plugin, no output-mode bootstrap is inserted.

## Usage

```js
{
  "plugins": [
    ["@autotracer/plugin-babel-react19", { "outputMode": "copy-paste" }]
  ]
}
```

# `outputMode`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It injects startup statements into processed modules that import `@autotracer/flow` or `@autotracer/flow/runtime` so the desired AutoTracer output mode can be established before traces run.

When set, the injected startup block seeds `globalThis.__autoTracerInternal.outputMode` if the shared internal state does not exist yet, and calls `globalThis.autoTracer.setOutputMode(...)` when the public runtime API is already installed.

Use [@autotracer/flow](/api/flow) when you need to change output mode later at runtime.

## Default

If you omit `outputMode`, the Babel plugin does not inject startup output-mode statements.

## Values

- `"devtools"`: interactive console grouping through the browser's native grouping behavior.
- `"copy-paste"`: text output shaped for copying into bug reports, chat, or documents.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-flow", { "outputMode": "copy-paste" }]
  ]
}
```

# `tracerName`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"__flowTracer"`

---

`tracerName` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It changes the local identifier name used by generated tracing calls.

At the start of each instrumented function, the Babel plugin binds that identifier to the canonical global tracer at `globalThis.__flowTracer`. Changing `tracerName` does not rename the runtime surface itself.

Most app integrations should keep the default. Read together with [`logExceptions`](./logExceptions) and [`exceptionLogLevel`](./exceptionLogLevel).

## Default

If you omit `tracerName`, generated tracing calls use `"__flowTracer"`.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-flow", { "tracerName": "myFlowTracer" }]
  ]
}
```

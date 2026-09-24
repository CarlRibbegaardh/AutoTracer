# `logExceptions`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`logExceptions` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It controls whether instrumented functions log thrown errors through `traceException(...)` before rethrowing them.

When `logExceptions` is `true`, the plugin injects a `catch` block that calls `traceException(...)` and then rethrows the original error. When `logExceptions` is `false`, exception logging is skipped, but exit logging still happens through the generated `finally` block.

This setting does not remove user-written catch blocks inside the function body. Read together with [`exceptionLogLevel`](./exceptionLogLevel) and [`tracerName`](./tracerName).

## Default

If you omit `logExceptions`, thrown errors are logged and then rethrown.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-flow", { "logExceptions": false }]
  ]
}
```

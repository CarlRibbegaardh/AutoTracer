# `logExceptions`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`logExceptions` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It controls whether instrumented functions log thrown errors.

When `logExceptions` is `true`, thrown errors are logged through `traceException(...)` and then rethrown. When `logExceptions` is `false`, exception logging is skipped, but exit logging still happens.

This setting does not remove user-written catch blocks inside the function body. Read together with [`exceptionLogLevel`](./exceptionLogLevel) and [`tracerName`](./tracerName).

## Default

If you omit `logExceptions`, thrown errors are logged and then rethrown.

## Usage

```typescript
flowTracer({
  logExceptions: false,
});
```

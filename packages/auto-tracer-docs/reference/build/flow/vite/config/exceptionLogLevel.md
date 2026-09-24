# `exceptionLogLevel`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"debug" | "warn" | "error"` &nbsp;·&nbsp; **Default:** `"debug"`

---

`exceptionLogLevel` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It controls which log level FlowTracer uses for exception logs.

This setting matters only when [`logExceptions`](./logExceptions) is enabled. When `logExceptions` is `false`, `exceptionLogLevel` has no effect.

Read together with [`logExceptions`](./logExceptions) and [`tracerName`](./tracerName).

## Default

If you omit `exceptionLogLevel`, exception logs use `"debug"`.

## Values

- `"debug"`: lowest-severity exception logging. This is the default.
- `"warn"`: warning-level exception logging.
- `"error"`: error-level exception logging.

## Usage

```typescript
flowTracer({
  exceptionLogLevel: "warn",
});
```

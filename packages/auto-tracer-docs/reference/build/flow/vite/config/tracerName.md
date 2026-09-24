# `tracerName`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"__flowTracer"`

---

`tracerName` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It changes the local identifier name used by generated tracing calls.

Changing `tracerName` does not rename the runtime surface itself. It only changes the local identifier that generated `enter`, `exit`, and `traceException` calls go through.

Most app integrations should keep the default. Read together with [`logExceptions`](./logExceptions) and [`exceptionLogLevel`](./exceptionLogLevel).

## Default

If you omit `tracerName`, generated tracing calls use `"__flowTracer"`.

## Usage

```typescript
flowTracer({
  tracerName: "myFlowTracer",
});
```

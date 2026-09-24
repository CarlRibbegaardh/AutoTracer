# `prefix`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `undefined`

---

`prefix` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It prepends a fixed segment to every instrumented function name using `:` as the separator.

If you set `prefix: "Storefront"`, a function that would normally log as `processOrder` logs as `Storefront:processOrder`. Nested function names keep the prefix as the first segment.

Filtering still uses the original unprefixed function name, because `include` and `exclude` are applied before the transform builds the final emitted name. Runtime start and stop behavior is also unchanged.

Use this when multiple independent bundles share one browser console and you need their traces to stay visually distinct. Read together with [`include`](./include) and [`exclude`](./exclude).

## Default

If you omit `prefix`, function names are logged without an extra prefix.

## Usage

```typescript
flowTracer({
  prefix: "Storefront",
});
```

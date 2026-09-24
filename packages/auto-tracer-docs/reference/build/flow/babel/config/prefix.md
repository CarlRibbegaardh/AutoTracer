# `prefix`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `undefined`

---

`prefix` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It prepends a fixed segment to every instrumented function name using `:` as the separator.

If you set `prefix: "Storefront"`, a function that would normally log as `processOrder` logs as `Storefront:processOrder`. Nested function names keep the prefix as the first segment.

Filtering still uses the original unprefixed function name, because `include`, `exclude`, and pragma selection are applied before the transform builds the final emitted name. Runtime start and stop behavior is also unchanged.

Use this when multiple independent entry points share one browser console and you need their traces to stay visually distinct. Read together with [`include`](./include) and [`exclude`](./exclude).

## Default

If you omit `prefix`, function names are logged without an extra prefix.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-flow", { "prefix": "Storefront" }]
  ]
}
```

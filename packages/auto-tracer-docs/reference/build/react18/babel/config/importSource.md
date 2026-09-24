# `importSource`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"@autotracer/react18"`

---

`importSource` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It changes the module specifier used for the injected `useReactTracer` import.

Most projects should not set this. Leave the default `"@autotracer/react18"` when the injected code should call the normal ReactTracer runtime directly.

Use `importSource` only when your build must inject `useReactTracer` from a different package name, usually because you maintain a local wrapper package that re-exports `useReactTracer` from `@autotracer/react18`.

That wrapper must still provide a `useReactTracer()` export compatible with the normal runtime hook, because the injected code calls `useReactTracer()` and then uses the returned logger's `labelState(...)` method for automatic hook labeling.

`importSource` does not change how you initialize the runtime with `reactTracer()` in your app bootstrap. It only changes the import path baked into transformed component files.

Read together with [`labelHooks`](./labelHooks) and [`labelHooksPattern`](./labelHooksPattern) when you are changing where the injected tracing helper comes from and which hooks receive automatic labels.

## When To Use It

- Leave the default when your app imports ReactTracer from `@autotracer/react18` directly.
- Set it when a wrapper package must own the injected import path.

## Wrapper Example

```typescript
// packages/internal-tracer/src/index.ts
export { useReactTracer } from "@autotracer/react18";
```

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      { "importSource": "@company/internal-tracer" }
    ]
  ]
}
```

With that configuration, transformed components import `useReactTracer` from `@company/internal-tracer` instead of `@autotracer/react18`.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-react18", { "importSource": "@autotracer/react18" }]
  ]
}
```

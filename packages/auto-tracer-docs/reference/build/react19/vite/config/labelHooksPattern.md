# `labelHooksPattern`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"^use[A-Z].*"`

---

`labelHooksPattern` is a build configuration option for `reactTracer.vite()`. It supplies a regular-expression source string that matches additional hook names to label during React 19 injection.

Provide the pattern itself, not a JavaScript regex literal. The shared injector strips accidental leading and trailing `/` delimiters for convenience.

Use an empty string when you want pattern matching disabled and only the explicit names from [`labelHooks`](./labelHooks) to be labeled.

## Usage

```ts
reactTracer.vite({
  labelHooksPattern: "^use[A-Z].*",
});
```

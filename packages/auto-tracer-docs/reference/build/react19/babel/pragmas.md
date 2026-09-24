# Pragma Comments

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Reference

---

Pragma comments are build-time line comments that `@autotracer/plugin-babel-react19` reads while transforming eligible React components through Babel.

They are not a React feature and they are not JavaScript directives. In AutoTracer, they are per-component override comments used during build-time injection.

Use them immediately above an eligible top-level component declaration. The shared React 19 transformer reads function-level leading comments for top-level component declarations and component variable declarations.

Read together with [`mode`](./config/mode), [`include`](./config/include), and [`exclude`](./config/exclude).

## Supported Comments

### `@trace`

Use `// @trace` to enable instrumentation for one eligible component.

```ts
// @trace
export function CheckoutPanel() {
  return <section />;
}
```

### `@trace-disable`

Use `// @trace-disable` to disable instrumentation for one eligible component.

```ts
// @trace-disable
export function AnimatedSpinner() {
  return <div />;
}
```

## Precedence

1. A file and component must pass [`include`](./config/include) and [`exclude`](./config/exclude) first.
2. Inside that eligible set, `@trace-disable` wins over `@trace`.
3. [`mode`](./config/mode) decides the fallback only when no pragma settled the result.

`@trace` never rescues a component that misses `include` or matches `exclude`.

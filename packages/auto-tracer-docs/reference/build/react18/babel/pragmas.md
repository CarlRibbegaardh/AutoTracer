# Pragma Comments

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Reference

---

Pragma comments are build-time line comments that `@autotracer/plugin-babel-react18` reads while transforming eligible React components through Babel.

They are not a React feature and they are not JavaScript directives. In AutoTracer, they are per-component override comments used during build-time injection.

Use them immediately above an eligible top-level component declaration. The React transformer reads function-level leading comments for top-level component declarations and component variable declarations.

Read together with [`mode`](./config/mode), [`include`](./config/include), and [`exclude`](./config/exclude).

## Supported Comments

### `@trace`

Use `// @trace` to enable instrumentation for one eligible component.

This is most useful in [`mode`](./config/mode) `"opt-in"`, where eligible components stay off by default unless you mark them.

```typescript
// @trace
export function CheckoutPanel() {
  return <section />;
}
```

### `@trace-disable`

Use `// @trace-disable` to disable instrumentation for one eligible component.

This is most useful in [`mode`](./config/mode) `"opt-out"`, where eligible components are instrumented by default unless you suppress them.

```typescript
// @trace-disable
export function AnimatedSpinner() {
  return <div />;
}
```

## Precedence

AutoTracer evaluates React build pragmas inside an eligibility-first model:

1. A file and component must pass [`include`](./config/include) and [`exclude`](./config/exclude) first.
2. Inside that eligible set, `@trace-disable` wins over `@trace`.
3. [`mode`](./config/mode) decides the fallback only when no pragma settled the result.

`@trace` never rescues a component that misses `include` or matches `exclude`.

## When To Use Them

- Use `@trace` when you want a narrow opt-in capture without changing broader file or component filters.
- Use `@trace-disable` when one otherwise eligible component is too noisy or should stay out of tracing.

## Usage Pattern

In `"opt-in"`, only eligible components with `// @trace` are instrumented.

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-react18", { "mode": "opt-in" }]
  ]
}
```

```typescript
// Dashboard.tsx
// @trace
export function Dashboard() {
  return <main />;
}
```

In `"opt-out"`, eligible components are instrumented unless `// @trace-disable` is present.

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-react18", { "mode": "opt-out" }]
  ]
}
```

```typescript
// AnimationSurface.tsx
// @trace-disable
export function AnimationSurface() {
  return <canvas />;
}
```

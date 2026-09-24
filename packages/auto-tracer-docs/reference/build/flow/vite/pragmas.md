# Pragma Comments

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Reference

---

Pragma comments are build-time line comments that the Flow transform reads while instrumenting eligible functions.

They are not JavaScript directives. In AutoTracer Flow builds, they are per-function override comments used during build-time instrumentation.

Use them immediately above an eligible function-like declaration. Flow reads line-comment pragmas from the effective function comment host, and eligible enclosing functions can pass their pragma state down to eligible nested functions.

Read together with [`mode`](./config/mode), [`include`](./config/include), and [`exclude`](./config/exclude).

## Supported Comments

### `@trace`

Use `// @trace` to instrument one eligible function.

This is most useful in `mode: "opt-in"`, where eligible functions stay off by default unless a local or eligible enclosing function supplies `@trace`.

```typescript
// @trace
export function checkoutHandler(cart: Cart) {
  return submitOrder(cart);
}
```

### `@trace-disable`

Use `// @trace-disable` to skip one eligible function.

This takes precedence over `@trace` and also cascades through eligible nested functions.

```typescript
// @trace-disable
export function verboseHelper(data: Payload) {
  return normalize(data);
}
```

## Precedence

AutoTracer evaluates Flow build pragmas inside an eligibility-first model:

1. A function must pass the file and function filters from [`include`](./config/include) and `exclude` first.
2. AutoTracer combines pragma state from the local function and any eligible enclosing functions.
3. Inside that eligible set, `@trace-disable` wins over `@trace`.
4. In `mode: "opt-in"`, `@trace` enables instrumentation when no effective `@trace-disable` is present.
5. If no pragma settled the result, `mode` decides the fallback: instrument in `"opt-out"`, skip in `"opt-in"`.

`@trace` never rescues a function that misses `include` or matches `exclude`.

## Comment Format

- Use line comments: `// @trace` or `// @trace-disable`.
- Block comments such as `/** @trace */` are ignored.
- A line pragma placed after a TSDoc block still works.

## Nested Functions

Flow pragmas can affect eligible nested functions.

- An eligible outer function with `// @trace` enables eligible descendants in `"opt-in"` unless an effective `@trace-disable` blocks them.
- An eligible outer function with `// @trace-disable` keeps eligible descendants out, even if an inner function adds `// @trace`.
- Pragmas on excluded enclosing functions are ignored and do not leak through `include` or `exclude` boundaries.

## Usage Pattern

In `"opt-in"`, one `// @trace` on an eligible enclosing function can enable an eligible nested helper too.

```typescript
// @trace
export function processOrder(order: Order) {
  function buildSummary() {
    return order.lines.length;
  }

  return buildSummary();
}
```

In `"opt-out"`, `// @trace-disable` can suppress one eligible function or an eligible nested subtree.

```typescript
// @trace-disable
export function handleHotPath(input: Input) {
  function measure() {
    return input.items.length;
  }

  return measure();
}
```

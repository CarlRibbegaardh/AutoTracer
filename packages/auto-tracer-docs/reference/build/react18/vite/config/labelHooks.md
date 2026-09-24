# `labelHooks`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It lists hook names that should always receive automatic labels.

These hook names are labeled even if they do not match [`labelHooksPattern`](./labelHooksPattern). Use this when you want to guarantee labels for a known set of hooks.

Read together with [`labelHooksPattern`](./labelHooksPattern) when you are tuning automatic hook labeling.

## Usage

```typescript
reactTracer.vite({
  labelHooks: ["useState", "useReducer", "useSelector"],
});
```

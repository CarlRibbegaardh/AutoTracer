# `labelHooks`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a build configuration option for `reactTracer.vite()`. It lists hook names whose returned values should always receive AutoTracer labels in injected React 19 components.

Use this when you want explicit hook coverage without relying only on [`labelHooksPattern`](./labelHooksPattern).

## Usage

```ts
reactTracer.vite({
  labelHooks: ["useState", "useReducer", "useSelector"],
});
```

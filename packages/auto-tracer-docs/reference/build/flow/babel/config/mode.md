# `mode`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"opt-in" | "opt-out"` &nbsp;·&nbsp; **Default:** `"opt-out"`

---

`mode` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It controls whether eligible functions are instrumented by default.

In `"opt-out"` mode, eligible functions are instrumented unless `@trace-disable` removes them. In `"opt-in"` mode, eligible functions stay uninstrumented unless `@trace` enables them.

`mode` operates only within the eligible set that remains after [`include`](./include) and [`exclude`](./exclude). Read together with [pragma comments](../pragmas), [`include`](./include), and [`exclude`](./exclude).

## Default

If you omit `mode`, FlowTracer uses `"opt-out"`.

## Values

- `"opt-out"`: instrument eligible functions unless `@trace-disable` is present.
- `"opt-in"`: instrument eligible functions only when `@trace` is present.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-flow", { "mode": "opt-in" }]
  ]
}
```

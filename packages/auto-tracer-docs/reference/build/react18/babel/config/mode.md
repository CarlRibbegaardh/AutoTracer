# `mode`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"opt-in" | "opt-out"` &nbsp;·&nbsp; **Default:** `"opt-out"`

---

`mode` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It controls the default component-selection policy after file and component eligibility have already been narrowed by [`include`](./include), [`exclude`](./exclude), and [`serverComponents`](./serverComponents).

In `"opt-out"`, eligible components are instrumented unless `@trace-disable` is present. In `"opt-in"`, eligible components are skipped unless `@trace` is present.

Eligibility is still determined before pragmas. `@trace` cannot override an include miss or an explicit exclude match.

The default is `"opt-out"`, so eligible components are instrumented unless you explicitly disable them.

Here, a pragma means a build-time line comment placed immediately above a component declaration. AutoTracer supports `// @trace` and `// @trace-disable` for per-component overrides.

Read together with [`include`](./include), [`exclude`](./exclude), and [Pragma Comments](../pragmas) when you are mixing mode defaults with per-component overrides.

## When To Set It

- Leave the default when you want broad instrumentation across the eligible set.
- Switch to `"opt-in"` when you want instrumentation to stay off by default and turn on only where `@trace` is present.

## Usage

```javascript
{
  "plugins": [
    ["@autotracer/plugin-babel-react18", { "mode": "opt-in" }]
  ]
}
```

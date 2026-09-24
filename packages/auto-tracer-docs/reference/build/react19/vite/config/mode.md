# `mode`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"opt-in" | "opt-out"` &nbsp;·&nbsp; **Default:** `"opt-out"`

---

`mode` is a build configuration option for `reactTracer.vite()`. It decides the fallback instrumentation policy after file eligibility, component eligibility, and pragma checks have already been applied.

In `"opt-out"`, eligible components are instrumented by default. In `"opt-in"`, eligible components are skipped unless they have a `// @trace` pragma. `// @trace-disable` still wins over `// @trace`, and `// @trace` cannot bypass an include miss or explicit exclude match.

## Usage

```ts
reactTracer.vite({
  mode: "opt-in",
});
```

Read together with [`include`](./include), [`exclude`](./exclude), and [pragma comments](../pragmas).

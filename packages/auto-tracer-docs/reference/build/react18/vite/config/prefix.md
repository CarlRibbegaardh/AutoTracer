# `prefix`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `undefined`

---

`prefix` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It prepends a stable label to every injected component name in the trace output.

The plugin formats prefixed names as `prefix:ComponentName`. Use this when multiple React entry points share one browser tab and you need the trace output to show which island, microfrontend, or app shell produced a render.

This is a build-time label only. Component eligibility is still calculated from the original unprefixed component name before the prefix is applied.

Read together with [`include`](./include) and [`exclude`](./exclude) when you are narrowing the eligible set in multi-entry builds.

## Usage

```typescript
reactTracer.vite({
  prefix: "Checkout",
});
```
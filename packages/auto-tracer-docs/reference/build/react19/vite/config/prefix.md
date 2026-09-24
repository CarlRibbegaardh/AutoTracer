# `prefix`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** none

---

`prefix` is a build configuration option for `reactTracer.vite()`. It prepends a stable string to each injected component name so multiple React 19 entry points can stay distinguishable in one browser tab.

Use this for islands, micro-frontends, or other independent React roots that share one tracing surface.

## Usage

```ts
reactTracer.vite({
  prefix: "AccountShell",
});
```

The resulting component names look like `AccountShell:ProfilePanel`.

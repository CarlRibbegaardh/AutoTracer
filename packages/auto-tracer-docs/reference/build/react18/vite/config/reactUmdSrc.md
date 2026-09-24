# `reactUmdSrc`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"https://unpkg.com/react@18.3.1/umd/react.production.min.js"`

---

`reactUmdSrc` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It overrides the `<script>` source used to load the React UMD bundle when [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs) is enabled.

Use this when you need to self-host the React UMD file instead of loading it from the default unpkg URL, for example to avoid external CDN requests or to satisfy a stricter Content Security Policy.

This option matters only when [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs) is `true`.

Read together with [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs) and [`reactDomUmdSrc`](./reactDomUmdSrc).

## Usage

```typescript
reactTracer.vite({
  buildWithWorkspaceLibs: true,
  reactUmdSrc: "/vendor/react.production.min.js",
});
```
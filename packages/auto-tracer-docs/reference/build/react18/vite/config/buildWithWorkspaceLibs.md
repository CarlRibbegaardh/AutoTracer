# `buildWithWorkspaceLibs`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`buildWithWorkspaceLibs` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It enables the plugin's special UMD/global loading path for production builds.

When this option is `true` and [`inject`](./inject) is enabled, the plugin:

- externalizes `@autotracer/react18`, `react`, and `react-dom` from the whole build
- injects `<script>` tags that load React, ReactDOM, and the emitted ReactTracer UMD bundle before the app bundle
- emits `auto-tracer-react18.umd.js` as a build asset

This option affects `vite build` only. Dev mode is unchanged.

Because it removes React from the app bundle and relies on injected UMD globals, most projects should leave this off. Use it only when you intentionally want that tradeoff. If you are deciding between this option and other workspace wiring strategies, read the [Monorepo Guide](/guide/monorepo) first.

Read together with [`reactUmdSrc`](./reactUmdSrc), [`reactDomUmdSrc`](./reactDomUmdSrc), and [`inject`](./inject).

## Usage

```typescript
reactTracer.vite({
  inject: isInternalBuild,
  buildWithWorkspaceLibs: isInternalBuild,
});
```

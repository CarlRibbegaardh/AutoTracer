# `buildWithWorkspaceLibs`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`buildWithWorkspaceLibs` is a build configuration option for `reactTracer.vite()`. It enables the React 19 plugin's restricted internal global-script path for `vite build`.

When this option is `true` and [`inject`](./inject) is enabled, the plugin:

- externalizes `@autotracer/react19`, `react`, and `react-dom` from the application build
- injects `<script>` tags for React, ReactDOM, and the emitted AutoTracer UMD bundle before the app bundle
- emits `auto-tracer-react19.umd.js` as a build asset

React 19 does not publish official React or ReactDOM UMD files, so this mode requires [`reactUmdSrc`](./reactUmdSrc) and [`reactDomUmdSrc`](./reactDomUmdSrc).

Use this only for local or internal QA workflows.

## Usage

```ts
reactTracer.vite({
  inject: isInternalBuild,
  buildWithWorkspaceLibs: isInternalBuild,
  reactUmdSrc: "/vendor/react-19.global.js",
  reactDomUmdSrc: "/vendor/react-dom-19.global.js",
});
```

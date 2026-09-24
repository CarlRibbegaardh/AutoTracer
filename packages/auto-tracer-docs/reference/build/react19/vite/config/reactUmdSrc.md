# `reactUmdSrc`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `undefined`

---

`reactUmdSrc` is a build configuration option for `reactTracer.vite()`. It supplies the URL or path for the React 19 global script used by [`buildWithWorkspaceLibs`](./buildWithWorkspaceLibs).

This setting is required when `buildWithWorkspaceLibs` is `true`. The referenced script must expose `window.React`.

## Usage

```ts
reactTracer.vite({
  buildWithWorkspaceLibs: true,
  reactUmdSrc: "/vendor/react-19.global.js",
});
```
